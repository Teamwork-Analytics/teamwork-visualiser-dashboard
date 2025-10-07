import csv
import argparse
import ollama
import re
import pandas as pd
import random
import multiprocessing
from contextlib import redirect_stdout
from datetime import datetime
from functools import partial

# Each element in the VECTOR_DB will be a tuple (chunk, embedding)
# The embedding is a list of floats, for example: [0.1, 0.04, -0.34, 0.21, ...]
VECTOR_DB = []
FILE_TIMESTAMP = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')

CSV_FILE_INPUT = 'original-filtered.csv'
# EMBEDDING_MODEL = 'hf.co/CompendiumLabs/bge-base-en-v1.5-gguf'
EMBEDDING_MODEL = 'nomic-embed-text'
CLASSIFICATION_MODEL  = 'deepseek-r1:14b'
# CLASSIFICATION_MODEL = 'hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF'
# CLASSIFICATION_MODEL = 'gemma3'
# CLASSIFICATION_MODEL = 'mistral:7b-instruct-v0.3-q5_K_S'
# CLASSIFICATION_MODEL = 'gemma3:27b'

COLOUR_MAP = {
    "red": 'student',
    "blue": 'student',
    "green": 'student',
    "yellow": 'student',
}

CONSTRUCTS = ["task_allocation", "handover", "sharing_information", "escalation", "questioning", "responding", "acknowledging"]
DEFINITIONS = {
   "task_allocation": "A nurse/student explicitly assigns a task to another nurse/student OR proactively self-allocates a task, where the task is not directed to patient.", 
   "handover": "A nurse/student updates to others regarding the health state of a patient structurally following some handover protoquick handover protocol.", 
   "sharing_information": "A nurse/student proactively shares information with other nurses/students that has not been requested, excluding information provided to patient.",
   "escalation": "A nurse/student informs other nurses/students that the situation exceeds their capabilities and requires extra assistance.",
   "questioning": "A nurse/student asks another nurse/student a question to obtain information. Questions asked to patient should always result in '0' for all constructs.", 
   "responding": "A nurse/student responds to the question asked in the conversation, this response can be more active and often substantive reaction or reply.",
   "acknowledging": "A nurse/student acknowledges receipt of information or instructions from other nurses/students, which is a passive action, without necessarily agreeing or disagreeing.", 
}

def format_random_examples(example_list, n=3):
    selected = random.sample(example_list, min(n, len(example_list)))
    numerals = ['(i)', '(ii)', '(iii)', '(iv)']
    formatted = [f'{numerals[i]} "{ex}"' for i, ex in enumerate(selected)]
    
    # Join all but the last with semicolons, then add "and" before the final one
    if len(formatted) > 1:
        return "; ".join(formatted[:-1]) + f"; and {formatted[-1]}"
    else:
        return formatted[0]

#    The communication construct "task_allocation" refers to ....
#    Utterrance examples of this communication construct include: 

SAMPLE_TEXTS_TA = [
    "You do the medical observation, and I will do the discharge for the bed three patient",
    "Emma, how about we do vital signs ?",
    "just need to arrange this chart document . And also, the wife is there as well .",
    "Are you happy to get the dressings and stuff? Alright , beautiful.",
    "And then I will absolutely look at her pain meds for you .",
    "I'm going to do her oxygen, yes .",
    "Do you want me to get the ECG ready if she's got chest pain ?",
    "We will do that. Yes, we'll have a look .",
    "So do you guys maybe want to do the meds and then I'll keep going on my assessment ?",
    "I'm going to check with Gene, you can check with mine as well because she needs, whatever ."
]

SAMPLE_TEXTS_HO = [
    "We just check on her obs and oxygen is dropping and her family is a bit worried, stressing",
    "She is day-one post total hysterectomy. She has got a history of heart disease...",
    "We have Ruth here. She's just been complaining of six out of ten chest pain.",
    "So, second, bed number two is Bailey French. So she just came in from ED for appendicitis and her obs are okay, it's just she's febrile, 37.7 .",
    "So, I'll just give you a quick handover. So this is Imani, she's day one post vaginal hysterectomy. So I just did her obs right now, she's due for antibiotics so if one of you could just come and check with me and then we can administer that .",
    "Okay , so we just have Ruth Jenkins here, she's complaining of some chest pain, and she says that she can't breathe. So we're just going to do an ECG, we've done her obs and she's in pain. This is her daughter Karen .",
    "So we just need to do the pre-op checklist because I got a call from the theatre nurse that they'll be coming in five minutes to get her .",
    "Hi guys, very good thank you. This is Ruth, she's an elderly lady, she had got a bit of chest pain at the moment, it's central, it's not radiating anywhere .",
    "We're about to do an ECG. She's also complaining of shortness of breath. We just put her on ten litres of O two, and her sats are okay at the moment, but they've just come up a little bit .",
    "Yes . We've got patient three there. He's due for a script for analgesia, and he's due for discharge, so if you could just manage that for me ."
]

SAMPLE_TEXTS_SI = [
    "We tried to ask her, but she left sort of before we could get an answer from her .",
    "So we'll see. Yeah , there's nothing on the back .",
    "Yeah, it's PCA .",
    "She is due for antibiotics and pain meds, and we also need to call her family.",
    "Her wound is dry and intact. There is no concern now.",
    "Just the analgesics and stuff , okay .",
    "Yes, that's active PRN, but then it says continuous, but she's got nothing running .",
    "It's on 14, cool .",
    "Because, yes, look, I'm a bit confused .",
    "Okay, I just called the met call was going to be an hour away ."
]

SAMPLE_TEXTS_EC = [
    "Kiera, I'm also going to call help in .",
    "All right, let's just. Do you want to call in some help ?",
    "I think we need to call the emergency team for help.",
    "Kiera, I'm going to get the other nurses , okay ?",
    "Beautiful I'm calling a met call because we're worried about her , could I have a hand hooking up the ECG ? I'm going to get a full set of obs, okay ",
    "No , I can call for help first, I can call for help first , yes.",
    "We might get a doctor to review .",
    "They're currently on their ward review , do you want me to call a MET call ? Do you think it's really serious ?",
    "Do you mind doing the oxygen and I'll just call for some help ?",
    "I'll just press the emergency button . Oh, we just need a hand from other nurses ."
]

SAMPLE_TEXTS_QS = [
    "Do you have a phone number for me to ring?",
    "Do you know what the fluid was there?",
    "Okay And um, what type of dressing was it like was it gauze and tag them or",
    "Why is this not on ?",
    "Are you okay ?",
    "Is the IV necessary for this patient?",
    "Do we want to get this on ?",
    "Which ones the oxygen ?",
    "We're doing our very best, okay?",
    "Sorry. Where's the ?"
]

SAMPLE_TEXTS_RP = [
    "I don't know, it's off",
    "Dropping . Do some oxygen ? Yes.",
    "Okay. So this one. Oh, the oxygen. Yes .",
    "Continuous, but there's nothing there .",
    "Her wound is dry and intact. There is no concern now.",
    "We're just doing oxygen sats now .",
    "Hip replacement .",
    "Yes, we might call a MET call . And we'll get an ECG going .",
    "I can't really hear it much , can you double check ?",
    "Does she have any head protectors or something ? No, she doesn't really have any ."
]

SAMPLE_TEXTS_AK = [
    "Complete though. Maybe do we ask the doctor ?",
    "I reckon yes , I think we're going to call the doctor just to see if we .",
    "Okay And um, what type of dressing was it like was it gauze and tag them or",
    "We're able to get just a temperature of Ruth ",
    "It's all on there. Yes, okay .",
    "Sure ",
    "Yes , we'll cover you up a little bit .",
    "Oh no, alright",
    "I agree",
    "Yes, good idea, yes great ."
]

DEFINITIONS_WITH_EXAMPLES = {
   "task_allocation": ("A nursing student explicitly assigns a task to another nursing student OR proactively self-allocates a task, where the task is not directed to patient." 
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_TA)}\n"), 

   "handover": ("A nursing student is performing a handover when they verbally update other nursing student/s about the current state or recent care of a patient to ensure shared understanding and continuity of care. "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_HO)}\n"), 

   "sharing_information": ("A nursing student proactively shares brief information with other nursing student/s that has not been requested, excluding information provided to patient. "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_SI)}\n"),

   "escalation": ("A nursing student informs other nursing student/s that the situation exceeds their capabilities and requires extra assistance or call for help." 
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_EC)}\n"),

   "questioning": ("A nursing student asks another nursing student a question to obtain information. Questions asked to patient should always result in '0' for all constructs. "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_QS)}\n"), 

   "responding": ("A nursing student responds to the question asked in the conversation by another nursing student, this response can be more active and often substantive reaction or reply. The response should contribute meaningful information, confirm intent with elaboration, or involve a decision or explanation. "     
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_RP)}\n"),

   "acknowledging": ("A nursing student acknowledges receipt of information or instructions from other nursing student, which is a passive action, without necessarily agreeing or disagreeing. "     
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_AK)}\n"), 
}
SAMPLE_TEXTS = [
    "You do the medical observation, and I will do the discharge for the bed three patient",
    "She is day-one post total hysterectomy. She has got a history of heart disease...",
    "I think we need to call the emergency team for help.",
    "She is due for antibiotics and pain meds, and we also need to call her family.",
    "Her wound is dry and intact. There is no concern now.",
    "Is the IV necessary for this patient?",
    "She does not need it.",
    "Yes",
    "I agree",
    "Okay",
    "Can you give her 1ml IV fluid?",
    "Here, 1ml IV fluid."
] 


def _get_utterance_snippet(current_index, df):
    """
    Retrieve the texts with same conversation ID for context.
    Reset the context if the conversation_id changes.
    """
    # Get the current conversation ID
    current_conversation_id = df.loc[current_index, 'conversation_id']
    
    # Initialize a list to store sinippet
    utterance_snippet = []
        
    # Look backward - get up to 2 previous utterances
    prev_indices = []
    i = current_index - 1
    while i >= 0 and df.loc[i, 'conversation_id'] == current_conversation_id and len(prev_indices) < 2:
        prev_indices.insert(0, i)
        i -= 1

    # Look forward - get up to 2 following utterances
    next_indices = []
    i = current_index + 1
    while i < len(df) and df.loc[i, 'conversation_id'] == current_conversation_id and len(next_indices) < 2:
        next_indices.append(i)
        i += 1

    # Build the snippet list
    for idx in prev_indices:
        initiator = df.loc[idx, 'initiator']
        receiver = df.loc[idx, 'receiver']
        text = df.loc[idx, 'text']
        # Format: [Initiator -> Receiver]: text
        utterance = f"[{_label_colour(initiator)} talks to {_label_colour(receiver)}]:  \"{text}\" ; "
        utterance_snippet.append(utterance)

    initiator = df.loc[current_index, 'initiator']
    receiver = df.loc[current_index, 'receiver']
    text = df.loc[current_index, 'text']
    # Format: [Initiator -> Receiver]: text
    utterance = f"[{_label_colour(initiator)} talks to {_label_colour(receiver)}]:  \"{text}\" ; "
    utterance_snippet.append(utterance)

    for idx in next_indices:
        initiator = df.loc[idx, 'initiator']
        receiver = df.loc[idx, 'receiver']
        text = df.loc[idx, 'text']
        # Format: [Initiator -> Receiver]: text
        utterance = f"[{_label_colour(initiator)} talks to {_label_colour(receiver)}]: \"{text}\" ; "
        utterance_snippet.append(utterance)

    return "\n".join(utterance_snippet)

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
    utterance_snippet = _get_utterance_snippet(index,df)

    if utterance_snippet:
        context_msg = f"There can be multiple nursing students in a healthcare simulation session. These nursing students were assigned a color label, either Red, Blue, Green, or Yellow. Here is a dialogue snippet in a healthcare simulation session: {utterance_snippet}"
    else:
        context_msg = ""

    prompt = f"""
    You are an expert specializing in analyzing communication constructs in healthcare simulations involving nursing students.

    Communication constructs and their definitions are as follows:
    {chr(10).join([f"- {k}: {v}" for k,v in DEFINITIONS_WITH_EXAMPLES.items()])}

    Your task is to analyze the utterance contained in the dialogue snippet "{text}" and determine whether the utterance exemplifies any of the communication constructs detailed above.

    Your response should only consist of 7 digits separated by commas and the order of the digits should match the order of communication constructs detailed above. 
    Each digit can be either '1' or '0', with '1' indicating the presence of a specific communication construct and '0' indicating the absence of the communication construct. 
    There is no need to provide explanations, reasoning, or additional text.
    """
    

    # Parse the response
    try:
        # print(f"Prompt sent to model:\n{prompt}\n")
        response = ollama.chat(
            model=CLASSIFICATION_MODEL,
            messages=[{'role': 'user', 'content': prompt}],
            options={'temperature': 0 }
        )
        
        content = response['message']['content'].strip()
        # print(f"Raw model output: {content}")

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
        
    utterance_snippet = _get_utterance_snippet(index,df)

    if utterance_snippet:
        context_msg = f"There can be multiple nursing students in a healthcare simulation session. These nursing students were assigned a color label, either Red, Blue, Green, or Yellow. Here is a dialogue snippet in a healthcare simulation session:{utterance_snippet}"
    else:
        context_msg = ""
        
    # Loop through each construct individually
    for construct, definition in DEFINITIONS_WITH_EXAMPLES.items():
        prompt = f"""
        You are an expert specializing in analyzing communication constructs in healthcare simulations involving nursing students.

        The communication construct is "{construct}" with the definition: {definition}

        {context_msg}
        
        Your task is to analyze the utterance contained in the dialogue snippet "{text}" and determine whether the utterance exemplifies the communication construct outlined above.

        Your response should be a single digit that can be either '1' or '0', with '1' indicating the presence of the specific communication construct and '0' indicating the absence of the communication construct. There is no need to provide explanations, reasoning, or additional text.
  
        """
        
        try:
            # print(prompt)
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
    import os
    from datetime import datetime
    import csv
    processed_rows = []
    # Prepare output directory and file
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(script_dir, "gen-ai-classification-results")
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    output_file = os.path.join(output_dir, f"{timestamp}.csv")

    # Write header
    header = ['text', 'conversation_id', 'utterance_id', 'initiator', 'receiver'] + list(DEFINITIONS.keys())
    # Write header first if file does not exist
    if not os.path.exists(output_file):
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()

    for index, row in df.iterrows():
        if pd.notnull(row['communication_type']) and pd.notnull(row['text']):
            processed_entry = _add_chunk_to_database(
                text=row['text'],
                index=index,
                df=df,
                type=type  # Make sure 'type' is defined or passed as an argument
            )
            result_row = {
                'text': processed_entry['text'],
                'conversation_id': row['conversation_id'],
                'utterance_id': row['utterance_id'],
                'initiator': row['initiator'],
                'receiver': row['receiver'],
            }
            result_row.update(dict(zip(DEFINITIONS.keys(), processed_entry['labels'])))
            with open(output_file, 'a', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=header)
                writer.writerow(result_row)
            processed_rows.append(result_row)

    processed_df = pd.DataFrame(processed_rows)
    return processed_df


def write_df_to_csv(df, classification_type):
    filename = f"labeled_dataset-{classification_type}-{FILE_TIMESTAMP}-{CLASSIFICATION_MODEL.replace(':','_')}.csv"
    df.to_csv(filename)


def process_csv(csv_file, classification_type="multilabel"):

    # Load the entire dataset first for conversation context
    df = pd.read_csv(csv_file)
    
    # Open output file
    with open(f"labeled_dataset-{type}-{FILE_TIMESTAMP}-{CLASSIFICATION_MODEL.replace(':','_')}.csv", 'a', newline='') as f_out:
        writer = csv.writer(f_out) 
         
        # Write header if empty
        if f_out.tell() == 0:
            writer.writerow(['text', 'conversation_id', 'utterance_id', 'initiator', 'receiver' ] + list(DEFINITIONS.keys()))
        
        # Process each row with conversation context
        for index, row in df.iterrows():
            if pd.notnull(row['communication_type']) & pd.notnull(row['text']):
                processed_entry = _add_chunk_to_database(
                    text=row['text'],
                    index=index,
                    df=df,
                    type=classification_type
                )
                writer.writerow([processed_entry['text'], row['conversation_id'], row['utterance_id'], row['initiator'], row['receiver']] + processed_entry['labels'])                
                f_out.flush()
                timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
                print(f'Processed {row["utterance_id"]} in conversation {row["conversation_id"]} at {timestamp}')


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Process CSV dataset with various modes.")
    parser.add_argument('--csv', type=str, default=CSV_FILE_INPUT, help='Path to the CSV input file')
    parser.add_argument(
        '-m',
        "--model",
        type=str,
        default=CLASSIFICATION_MODEL,
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
