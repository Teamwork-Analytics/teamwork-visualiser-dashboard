import csv
import argparse
import ollama
import re
import os
import pandas as pd
from contextlib import redirect_stdout
from datetime import datetime
from functools import partial
from contextlib import redirect_stdout

# Each element in the VECTOR_DB will be a tuple (chunk, embedding)
# The embedding is a list of floats, for example: [0.1, 0.04, -0.34, 0.21, ...]
VECTOR_DB = []

FILE_TIMESTAMP = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')

CSV_DEFINITIONS= 'codebook.csv'
CSV_FILE_INPUT = 'original-filtered.csv'
EMBEDDING_MODEL = 'nomic-embed-text'
# CLASSIFICATION_MODEL  = 'deepseek-r1:14b'
CLASSIFICATION_MODEL = 'gemma3:27b'

COLOUR_MAP = {
    "red": 'student',
    "blue": 'student',
    "green": 'student',
    "yellow": 'student',
}

# PROMPTS 
PROMPT_ROLE = "You are an expert specializing in analyzing communication constructs in healthcare simulations involving nursing students. Your task objective is to classify communication constructs ONLY when the interaction is DIRECTLY between nurses/students."
PROMPT_CONSTRAINT = "Utterances directed to the patient 'Ruth' or relative, including questions asked to Ruth or relative, must result in ALL communication constructs being classified as '0'." 


# Usage inside a nested module:
def load_definitions():
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Build the path to your CSV file (adjust as needed)
    csv_path = os.path.join(script_dir, '..', 'ai_audio_labeller', 'codebook.csv')
    csv_path = os.path.normpath(csv_path)  # Clean up the path
    return read_definitions_csv(csv_path)

def read_definitions_csv(csv_path):
    df = pd.read_csv(csv_path, encoding='utf-8')
    # Strip whitespace from columns if needed
    df['construct'] = df['construct'].str.strip()
    df['definition'] = df['definition'].str.strip()
    constructs = df['construct'].tolist()
    definitions = dict(zip(df['construct'], df['definition']))
    return constructs, definitions

CONSTRUCTS, DEFINITIONS = load_definitions() 


def data_converter():
    import pandas as pd
    # Read the ground-truth.csv file
    df = pd.read_csv('ground-truth.csv')
    # Create a new dataframe with the desired columns
    new_df = pd.DataFrame()
    new_df['utterance_id']= df['utterance_id']
    new_df['conversation_id']= df['conversation_id']
    new_df['communication_type']=df['communication_type']
    new_df['text'] = df['text']
    new_df['initiator']= df['initiator']
    new_df['receiver']= df['receiver']
    new_df['task_allocation'] = df['task allocation']
    new_df['handover'] = df['handover']
    new_df['sharing_information'] = df['call-out']
    new_df['escalation'] = df['escalation']
    new_df['questioning']= df['questioning']
    new_df['responding'] = df['responding']
    new_df['acknowledging'] = df['acknowledging']
    new_df['session_id']=df['session_id']
    # Write the new dataframe to a CSV file
    new_df.to_csv(CSV_FILE_INPUT, index=False)
    print("Cleaned data has been saved to 'original.csv'")

def _get_previous_texts(current_index, df):
    """
    Retrieve the last three previous texts as context.
    Reset the context if the conversation_id changes.
    """
    # Get the current conversation ID
    current_conversation_id = df.loc[current_index, 'conversation_id']
    
    # Initialize a list to store previous texts
    previous_utterances = []
    
    # Iterate over the last three indices (if they exist)
    for i in range(1, 4):  # Check up to 3 previous rows
        previous_index = current_index - i
        if previous_index < 0:  # Stop if we go out of bounds
            break
        
        # Get the conversation ID of the previous row
        previous_conversation_id = df.loc[previous_index, 'conversation_id']
        
        # Check if the conversation ID matches; if not, stop collecting texts
        if current_conversation_id == previous_conversation_id:
            initiator = df.loc[previous_index, 'initiator']
            receiver = df.loc[previous_index, 'receiver']
            text = df.loc[previous_index, 'text']
            # Format: [Initiator -> Receiver]: text
            utterance = f"[{_label_colour(initiator)} talks to {_label_colour(receiver)}]: {text}"
            previous_utterances.append(utterance)
        else:
            break
    
    # Combine texts in reverse order (from oldest to newest)
    return "\n".join(reversed(previous_utterances))


def _parse_response_deepseek_multilabel(content):
    
    # Remove content between <think> and </think> tags
    content_without_think = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

    match = re.search(r'([\d,]+)', content_without_think)
    # match_digit_only = re.findall(r'\b[01](?:,[01]){5}\b', match)  # Looks for 6 digits
    if match:
        classification_line = match.group(1).strip()
        print(f"Extracted classification line: {classification_line}")
        
        # Parse the classification
        labels = [int(x) for x in classification_line.split(',') if x.strip() in ['0', '1']]
        print(f"Parsed labels: {labels}")
        
        if len(labels) != len(CONSTRUCTS):
            print(f"Warning: Incorrect number of labels. Expected {len(CONSTRUCTS)}, got {len(labels)}")
            raise ValueError("Incorrect number of labels")
        
        print(f"Final classification: {dict(zip(CONSTRUCTS, labels))}")
        return labels
    else:
        print("No classification found after </think> tag")
        raise ValueError("No classification found")
    

def _parse_response_deepseek(content):
    """
    Parse the response from the DeepSeek model for single-label classification.
    """
    # Remove content between <think> and </think> tags
    content_without_think = re.sub(r"<think>.*?</think>", "", content, flags=re.DOTALL).strip()

    # Extract the single binary digit (1 or 0) from the response
    match = re.search(r'\b[01]\b', content_without_think)
    if match:
        label = int(match.group(0))
        print(f"Extracted label: {label}")
        return label
    else:
        print("No valid classification found after </think> tag")
        raise ValueError("No valid classification found")


def _parse_response(content):
    labels = [int(x.strip()) for x in content.split(',')]
    print(f"Parsed labels: {labels}")
    
    if len(labels) != len(CONSTRUCTS):
        print(f"Warning: Incorrect number of labels. Expected {len(CONSTRUCTS)}, got {len(labels)}")
        raise ValueError("Incorrect number of labels")
    
    print(f"Final classification: {dict(zip(CONSTRUCTS, labels))}")
    return labels

def _label_colour(colour_tag):
    return f'{colour_tag} {COLOUR_MAP[colour_tag]}' if colour_tag in COLOUR_MAP else 'patient/relative' 

def _classify_text_multilabel(text, index, df):
    
    # previous_texts = _get_previous_texts(index, df)
    initiator = df.loc[index]['initiator']
    receiver = df.loc[index]['receiver']

    labelled_initiator = _label_colour(initiator) 
    labelled_receiver = _label_colour(receiver)
    # Here are few sentences to give you a context on the conversation: {previous_texts if previous_texts else "Ignore this, no previous conversation."}

    prompt = f"""
    ROLE:
    {PROMPT_ROLE}
    
    CONTEXT:
    These nursing students were assigned a color label, either red, blue, green, or yellow. 
    Communication constructs and their definitions are as follows:
    {chr(10).join([f"- {k}: {v}" for k,v in DEFINITIONS.items()])}

    INSTRUCTION:
    Analyze if this text/utterance from {labelled_initiator} when talking to {labelled_receiver}: "{text}" exemplifies communication constructs outlined above.
    If text represents an exchange between nurses/students, output '1' if the construct is present and '0' if absent. 

    When analysing an utterance, please follow these rules:
    1. Your response must be EXACTLY {len(CONSTRUCTS)} digits of 0 or 1, separated by commas.
    2. The order of the digits must match the order of constructs listed above.
    3. No explanations, reasoning, or additional text
    4. Use exactly this format: 1,0,1,0,1,0,0
    5. Your entire response should be only these {len(CONSTRUCTS)} digits and commas. 
    
    For example, a valid and complete response would look exactly like this: 1,0,1,0,1,0,0
    
    CONSTRAINT:
    {PROMPT_CONSTRAINT}
    """

     # Parse the response
    try:
        print(f"Prompt sent to model:\n{prompt}\n")
        response = ollama.chat(
            model=CLASSIFICATION_MODEL,
            messages=[{'role': 'user', 'content': prompt}],
            options={'temperature': 0 }
        )
        
        content = response['message']['content'].strip()
        print(f"Raw model output: {content}")

        if CLASSIFICATION_MODEL == "deepseek-r1:14b":
            return _parse_response_deepseek_multilabel(content)
        else:
            return _parse_response(content)
            
    except Exception as e:
        print(f"Error parsing model output: {str(e)}")
        print(f"Returning default classification (all zeros)")
        return [0] * len(CONSTRUCTS)


def _add_chunk_to_database(text, index, df, type="multilabel"):
    """Process and store text with embeddings + autolabels"""
    # Generate embedding
    embedding = ollama.embeddings(model=EMBEDDING_MODEL, prompt=text)['embedding']
    
    # Generate autolabels
    labels = _classify_text_single_label(text=text,
        index=index,
        df=df) if type == "binary" else _classify_text_multilabel(text, index, df) 
    
    result = {
        'text': text,
        'embedding': embedding,
        'labels': labels
    }

    VECTOR_DB.append(result)
    return result


def _classify_text_single_label(text, index, df):
    previous_texts = _get_previous_texts(index, df)
    classifications = []

    initiator = df.loc[index]['initiator']
    receiver = df.loc[index]['receiver']
    labelled_initiator = _label_colour(initiator) 
    labelled_receiver = _label_colour(receiver)
        
    # Loop through each construct individually
    for construct, definition in DEFINITIONS.items():
        prompt = f"""
        ROLE: 
        {PROMPT_ROLE}

        CONTEXT:
        These nursing students were assigned a color label, either red, blue, green, or yellow. 
        The communication construct is "{construct}" with the definition: {definition} 
        Here are few sentences to give you a context on the conversation: {previous_texts if previous_texts else "Ignore this, no previous conversation."}

        INSTRUCTION:
        Analyze if this text/utterance from {labelled_initiator} when talking to {labelled_receiver}: "{text}" exemplifies communication construct outlined above.
        If the text represents an exchange between nurses/students, output '1' if the construct is present and '0' if absent. 
        Your response must be EXACTLY either 0 or 1.
        
        CONSTRAINT:
        {PROMPT_CONSTRAINT}
        """
        
        try:
            print(prompt)
            response = ollama.chat(
                model=CLASSIFICATION_MODEL,
                messages=[{'role': 'user', 'content': prompt}],
                options={'temperature': 0}
            )
        
            content = response['message']['content'].strip()
            # print(f"Raw output for '{construct}': {content}")

            # Parse the response for this construct
            label = _parse_response_deepseek(content)
            classifications.append(label)
        except ValueError as e:
            print(f"Error parsing response for construct '{construct}': {e}")
            classifications.append(0)  # Default to 0 if parsing fails
    
    return classifications


def process_classification_with_genai(df: pd.DataFrame):
    processed_rows = []
    for index, row in df.iterrows():
        if pd.notnull(row['communication_type']) and pd.notnull(row['text']):
            processed_entry = _add_chunk_to_database(
                text=row['text'],
                index=index,
                df=df,
                type=type  # Make sure 'type' is defined or passed as an argument
            )
            processed_rows.append({
                'text': processed_entry['text'],
                'conversation_id': row['conversation_id'],
                'utterance_id': row['utterance_id'],
                'initiator': row['initiator'],
                'receiver': row['receiver'],
                **dict(zip(DEFINITIONS.keys(), processed_entry['labels']))
            })
    processed_df = pd.DataFrame(processed_rows)
    return processed_df


def write_df_to_csv(df, classification_type):
    filename = f"labeled_dataset-{classification_type}-{FILE_TIMESTAMP}-{CLASSIFICATION_MODEL.replace(':','_')}.csv"
    df.to_csv(filename)


def process_csv(csv_file, classification_type="multilabel"):

    # Load the entire dataset first for conversation context
    df = pd.read_csv(csv_file)
    processed_df = process_classification_with_genai(df)
    write_df_to_csv(processed_df, classification_type)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process CSV dataset with various modes.")
    parser.add_argument('--csv', type=str, default=CSV_FILE_INPUT, help='Path to the CSV input file')
    parser.add_argument(
        '-m',
        "--model",
        type=str,
        default="gemma3:27b",
        help="Name of the classification model to use."
    )
 
    group = parser.add_mutually_exclusive_group()
    group.add_argument('-c', '--convert', action='store_true', help='Run converter')
    group.add_argument('-p', '--multiprocessing', type=int, metavar='N', help='Run multiprocessing with N processes')
    group.add_argument('-b', '--binary', action='store_true', help='Run binary processing')

    args = parser.parse_args()
    CLASSIFICATION_MODEL = args.model # MUTATION!! to lazy to change XD

    # Load the dataset
    dataset = []
    with open(args.csv, 'r', newline='', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            if row['text']:  # Check if the 'text' field is not empty
                dataset.append(row['text'])

    print(f'Loaded {len(dataset)} entries')

    # Create a timestamped filename
    log_filename = f'logs/output_{FILE_TIMESTAMP}.log'

    print("All output is saved in a timestamped log file.")
    print("Filename:", log_filename)

    with open(log_filename, 'w') as f:
        with redirect_stdout(f):
            if args.convert:
                data_converter()
            elif args.binary:
                process_csv(args.csv, classification_type="binary")
            else:
                process_csv(args.csv, classification_type="multilabel")
