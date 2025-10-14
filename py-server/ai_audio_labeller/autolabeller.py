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
import traceback
import time

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

CONSTRUCTS_5 = ["task_allocation", "handover", "sharing_information", "escalation", "questioning", "responding", "acknowledging"]

CONSTRUCTS_7 = ["allocation_others","allocation_self", "sharing_information", "escalation", "questioning", "acknowledging", "consumer_care"]

DEFINITIONS_5 = {
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

SAMPLE_TEXTS_TA = [
    "You do the medical observation, and I will do the discharge for the bed three patient",
    "Emma, we'll do vital signs",
    "just need to arrange this chart document",
    "Are you happy to get the dressings and stuff?",
    "And then I will absolutely look at her pain meds for you.",
    "I'm going to do her oxygen",
    "Do you want me to get the ECG ready if she's got chest pain ?",
    "We will do that. we'll have a look .",
    "So do you guys maybe want to do the meds and then I'll keep going on my assessment ?",
    "I'm going to check with Gene, you can check with mine as well because she needs, whatever ."
]

SAMPLE_TEXTS_TA_SELF = [
    "Emma, we'll do vital signs",
    "just need to arrange this chart document",
    "And then I will absolutely look at her pain meds for you.",
    "I'm going to do her oxygen",
    "Do you want me to get the ECG ready if she's got chest pain ?",
    "We will do that. we'll have a look .",
    "I'm going to check with Gene, you can check with mine as well because she needs, whatever ."
]

SAMPLE_TEXTS_TA_OTHERS = [
    "You do the medical observation",
    "Are you happy to get the dressings and stuff?",
    "So do you guys maybe want to do the meds ?",
    "Isabel are you okay connecting the defib or have you done so?",
    "Do you mind doing the oxygen?"
]

SAMPLE_TEXTS_HO = [
    "We just check on her obs and oxygen is dropping and her family is a bit worried, stressing",
    "She is day-one post total hysterectomy. She has got a history of heart disease...",
    "We have Ruth here. She's just been complaining of six out of ten chest pain.",
    "So, second, bed number two is Bailey French. So she just came in from ED for appendicitis and her obs are okay, it's just she's febrile, 37.7 .",
    "So, I'll just give you a quick handover. So this is Imani, she's day one post vaginal hysterectomy. So I just did her obs right now, she's due for antibiotics so if one of you could just come and check with me and then we can administer that .",
    "So we just have Ruth Jenkins here, she's complaining of some chest pain, and she says that she can't breathe. So we're just going to do an ECG, we've done her obs and she's in pain. This is her daughter Karen .",
    "So we just need to do the pre-op checklist because I got a call from the theatre nurse that they'll be coming in five minutes to get her .",
    "This is Ruth, she's an elderly lady, she had got a bit of chest pain at the moment, it's central, it's not radiating anywhere .",
    "We're about to do an ECG. She's also complaining of shortness of breath. We just put her on ten litres of O two, and her sats are okay at the moment, but they've just come up a little bit .",
    "We've got patient three there. He's due for a script for analgesia, and he's due for discharge, so if you could just manage that for me ."
]

SAMPLE_TEXTS_SI = [
    "We tried to ask her, but she left sort of before we could get an answer from her .",
    "So we'll see.there's nothing on the back .",
    "it's PCA .",
    "She is due for antibiotics and pain meds, and we also need to call her family.",
    "We're about to do an ECG. She's also complaining of shortness of breath. We just put her on ten litres of O two, and her sats are okay at the moment, but they've just come up a little bit .",
    "Her wound is dry and intact. There is no concern now.",
    "Just the analgesics and stuff , okay .",
    "That's active PRN, but then it says continuous, but she's got nothing running .",
    "It's on 14, cool .",
    "Because, look, I'm a bit confused .",
    "I just called the met call was going to be an hour away ."
]

SAMPLE_TEXTS_EC = [
    "Kiera, I'm also going to call help in .",
    "Do you want to call in some help ?",
    "I think we need to call the emergency team for help.",
    "Kiera, I'm going to get the other nurses , okay ?",
    "Beautiful I'm calling a met call because we're worried about her , could I have a hand hooking up the ECG ? I'm going to get a full set of obs, okay ",
    "I can call for help first, I can call for help first",
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
    "Complete though",
    "I reckon yes ",
    "Okay And um",
    "It's all on there. Yes, okay .",
    "Sure ",
    "Yes ",
    "Oh no, alright",
    "I agree",
    "Fine",
    "Yes, good idea, yes great ."
]

SAMPLE_TEXTS_CC = [
    "Jack, so it looks like you're stable. You're in the hospital now, we'll take care of you, okay? And we need to suture your wound in your leg. "
    "I might just quickly check your blood pressure, okay? All right.",
    "Hi Jack, I'm Neera, I'm one of the emergency residents. How are you feeling?"
    "Alright. How are you feeling Jack?"
]



# SAMPLE_TEXTS_OVERALL = [
#     "So we'll see. Yeah , there's nothing on the back : This utterance only exemplifies sharing_information  from \"there's nothing on the back\" phrase and acknowledging from \"Yeah\") phrase. Thus, the response should be 0,1,0,0,1",
#     "Okay , call a Metcall. This utterance only exemplifies escalation from \"call a Metcall\" phrase and acknowledging from \"Yes\" phrase. Thus, the response should be 0,0,1,0,1",
#     "Injection right ? Yeah . This utterance only exemplifies questioning from \"Injection right ?\" phrase and acknowledging from \"Yeah\" phrase. Thus, the response should be 0,0,0,1,1",
#     "Alright , do you want to call a med, and I'll pop this oxygen on . This utterance only exemplifies task_allocation from \"I'll pop this oxygen on\" phrase, escalation from \"call a med\" phrase and acknowledging from \"Alright\" phrase. Thus, the response should be 1,0,1,0,1",
#     "If we could finish the assessment here for vital signs and then , yeah . This utterance only exemplifies task_allocation from \"If we could finish the assessment here for vital signs\" phrase and acknowledging from \"yeah\" phrase. Thus, the response should be 1,0,0,0,1",
#     "Yeah , I was just going to do ... Oh hi guys! This utterance only exemplifies sharing_information from \"I was just going to do ...\" phrase and acknowledging from \"Yeah\" phrase. Thus, the response should be 0,1,0,0,1",
#     "We've done the check . No, wait, we haven't done it . What do you guys need? Morphine ?.  This utterance does not contain task_allocation or escalation or acknowledging, but contains sharing_information  from \"We've done the check . No, wait, we haven't done it .\" phrase, questioning from \"what do you guys need? Morphine ?\" phrase. Thus, the response should be 0,1,0,1,0",
#     "Yes , maybe we'll give the doctor a call for her . I'm just going to Marni, get her IV. This utterance does not contain questioning, sharing_information, but contains task_allocation in phrase \"I'm just going to Marni, get her IV\"), escalation in \"maybe we'll give the doctor a call for her\" phrase, acknowledging from \"Yes\" phrase. Thus, the response should be 1,0,1,0,1",
#     "Why what do you mean? So they're not going to talk to you, so if you just ask, yes you can just talk loudly so that they answer for you. This utterance does not contain task_allocation or escalation, but contains sharing_information  in \"So they're not going to talk to you\"  and \"you can just talk loudly so that they answer for you\" phrases, questioning  in \"Why what do you mean? So they're not going to talk to you\" phrase, acknowledging (\"yes\"). Thus, the response should be 0,1,0,1,1"
# ]


SAMPLE_TEXTS_OVERALL = [
    "So we'll see. Yeah , there's nothing on the back : This utterance only exemplifies sharing_information  from \"there's nothing on the back\" phrase and acknowledging from \"Yeah\") phrase.",
    "Okay , call a Metcall. This utterance only exemplifies escalation from \"call a Metcall\" phrase and acknowledging from \"Yes\" phrase.",
    "Injection right ? Yeah . This utterance only exemplifies questioning from \"Injection right ?\" phrase and acknowledging from \"Yeah\" phrase.",
    "Alright , do you want to call a med, and I'll pop this oxygen on . This utterance only exemplifies task_allocation from \"I'll pop this oxygen on\" phrase, escalation from \"call a med\" phrase and acknowledging from \"Alright\" phrase.",
    "If we could finish the assessment here for vital signs and then , yeah . This utterance only exemplifies task_allocation from \"If we could finish the assessment here for vital signs\" phrase and acknowledging from \"yeah\" phrase.",
    "Yeah , I was just going to do ... Oh hi guys! This utterance only exemplifies sharing_information from \"I was just going to do ...\" phrase and acknowledging from \"Yeah\" phrase.",
    "We've done the check . No, wait, we haven't done it . What do you guys need? Morphine ?.  This utterance does not contain task_allocation or escalation or acknowledging, but contains sharing_information  from \"We've done the check . No, wait, we haven't done it .\" phrase, questioning from \"what do you guys need? Morphine ?\" phrase.",
    "Yes , maybe we'll give the doctor a call for her . I'm just going to Marni, get her IV. This utterance does not contain questioning, sharing_information, but contains task_allocation in phrase \"I'm just going to Marni, get her IV\"), escalation in \"maybe we'll give the doctor a call for her\" phrase, acknowledging from \"Yes\" phrase.",
    "Why what do you mean? So they're not going to talk to you, so if you just ask, yes you can just talk loudly so that they answer for you. This utterance does not contain task_allocation or escalation, but contains sharing_information  in \"So they're not going to talk to you\"  and \"you can just talk loudly so that they answer for you\" phrases, questioning  in \"Why what do you mean? So they're not going to talk to you\" phrase, acknowledging (\"yes\")."
]

# DEFINITIONS_WITH_EXAMPLES = {
#    "task_allocation": ("A nursing student explicitly assigns a task to another nursing student OR proactively self-allocates a task, where the task is not directed to patient." 
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_TA)}\n"), 

#    "handover": ("A nursing student is performing a handover when they verbally update other nursing student/s about the current state or recent care of a patient to ensure shared understanding and continuity of care. "
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_HO)}\n"), 

#    "sharing_information": ("A nursing student proactively shares brief information with other nursing student/s that has not been requested, excluding information provided to patient. "
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_SI)}\n"),

#    "escalation": ("A nursing student informs other nursing student/s that the situation exceeds their capabilities and requires extra assistance or call for help." 
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_EC)}\n"),

#    "questioning": ("A nursing student asks another nursing student a question to obtain information. Questions asked to patient should always result in '0' for all constructs. "
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_QS)}\n"), 

#    "responding": ("A nursing student responds to the question asked in the conversation by another nursing student, this response can be more active and often substantive reaction or reply. The response should contribute meaningful information, confirm intent with elaboration, or involve a decision or explanation. "     
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_RP)}\n"),

#    "acknowledging": ("A nursing student acknowledges receipt of information or instructions from other nursing student, which is a passive action, without necessarily agreeing or disagreeing. "     
#    f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_AK)}\n"), 
# }

#    The communication construct "task_allocation" refers to ....
#    Utterrance examples of this communication construct include:

DEFINITIONS_WITH_EXAMPLES = {
   "task_allocation": ("A nurse explicitly assigns a task to another nurse OR self-allocates a task."  
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_TA)}\n"),

   "sharing_information": ("A nurse shares information with other nurse(s)"
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_SI)}\n"),

   "escalation": ("When a nurse communicates that the situation exceeds their capacity and requests or suggests additional assistance, including asking whether help or a formal call should be made."
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_EC)}\n"),

   "questioning": ("A nurse asks another nurse a question to obtain information "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_QS)}\n"),

   "acknowledging": ("A nurse signals receipt or recognition of another nurse’s statement, request, or presence, which is a passive action, without necessarily agreeing or disagreeing. This shows understanding, agreement, or awareness "    
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_AK)}\n"),
}

DEFINITIONS_ONLY = {
   "task_allocation": ("A nurse explicitly assigns a task to another nurse OR self-allocates a task."),

   "sharing_information": ("A nurse shares information with other nurse(s)"),

   "escalation": ("When a nurse communicates that the situation exceeds their capacity and requests or suggests additional assistance, including asking whether help or a formal call should be made."),

   "questioning": ("A nurse asks another nurse a question to obtain information "),

   "acknowledging": ("A nurse signals receipt or recognition of another nurse’s statement, request, or presence, which is a passive action, without necessarily agreeing or disagreeing. This shows understanding, agreement, or awareness " ),
}

NEW_DEFINITIONS_WITH_EXAMPLES_7 = {
   "allocation_others": ("A health care professional assigns task/s to one or more other health care professionals. "  
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_TA_OTHERS)}\n"),

   "allocation_self": ("A health care professional self-allocates a task. "  
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_TA_SELF)}\n"),

   "sharing_information": ("A health care professional shares information with other health care professional(s) "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_SI)}\n"),

   "escalation": ("When a health care professional communicates that the situation exceeds their capacity and requests or suggests additional assistance, including asking whether help or a formal call should be made. "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_EC)}\n"),

   "questioning": ("A health care professional asks another health care professional a question to obtain information "
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_QS)}\n"),

   "acknowledging": ("A health care professional signals receipt or recognition of another health care professional’s statement, request, or presence, which is a passive action, without necessarily agreeing or disagreeing. This shows understanding, agreement, or awareness. "    
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_AK)}\n"),

    "consumer_care": ("Health Care Professional explain actions and reassure patient named 'Jack'.  "    
   f"Example utterances of this specific communication construct include: {format_random_examples(SAMPLE_TEXTS_CC)}\n"),
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

"""
MULTILABEL classification prompt
"""
def _classify_text_multilabel(texts, indices, df):
    """
    Classify a batch of utterances.
    
    Args:
        texts: List of text utterances
        indices: List of corresponding DataFrame indices
        df: Full DataFrame for context
    
    Returns:
        List of classification results (binary lists)
    """
    
    start_time = time.time()
    print(f"Starting classification of {len(texts)} texts...", flush=True)
    # Build batch prompt
    definitions_str = "\n".join([f"- {k}: {v}" for k, v in NEW_DEFINITIONS_WITH_EXAMPLES_7.items()])
    
    # Format multiple utterances
    utterances_str = ""
    for idx, text in enumerate(texts, 1): 
        utterances_str += f"{idx}. \"{text}\"\n"
    
    prompt = f"""You are an expert specializing in analyzing communication constructs in healthcare simulations involving nurses.

    Communication constructs and their definitions are as follows:
    {definitions_str}

    Analyze these utterances to determine the expressed communication constructs as fast as possible:

    {utterances_str}
    For each utterance, provide {len(CONSTRUCTS_7)} binary digits (0 or 1) separated by commas, matching the order of constructs above.
    Output format: one line per utterance, numbered.
    Example:
    1. 0,0,0,1,0,1,1
    2. 1,0,1,0,1,0,0

    Provide ONLY the numbered binary codes with NO additional text or explanation."""

    try:
        print(f"Sending batch of {len(texts)} utterances to model...")
        api_start = time.time()

        response = ollama.chat(
            model=CLASSIFICATION_MODEL,
            messages=[
            {
                'role': 'system', 
                'content': 'You are a fast classifier. Output ONLY the requested format with NO thinking process.'
            },
            {
                'role': 'user', 
                'content': prompt
            }
            ],
            options={'temperature': 0}
        )
        
        api_time = time.time() - api_start
        print(f"API call took {api_time:.2f} seconds", flush=True)
        
        content = response['message']['content'].strip()
        print(f"Response length: {len(content)} characters", flush=True)
        # print(f"Raw batch output:\n{content}\n", flush=True)
        
        # Parse batch response
        if CLASSIFICATION_MODEL == "deepseek-r1:14b":
            return _parse_batch_response_deepseek(content, len(texts))
        else:
            return _parse_batch_response(content, len(texts))
            
    except Exception as e:
        print(f"Error in batch processing: {str(e)}")
        print("Traceback:\n", traceback.format_exc())
        print(f"Returning default classifications for batch")
        return [[0] * len(CONSTRUCTS_7) for _ in texts]


def process_csv_batch(csv_file, type="multilabel"):
    """Process CSV with batch classification"""
    
    # Load the entire dataset
    df = pd.read_csv(csv_file)
    
    # Filter valid rows
    valid_mask = pd.notnull(df['communication_type']) & pd.notnull(df['text'])
    valid_df = df[valid_mask].copy()
    
    print(f"Processing {len(valid_df)} valid utterances in batches of {BATCH_SIZE}...", flush=True)
    
    # Create output file immediately and write header
    output_filename = f"labeled_dataset-{type}-{FILE_TIMESTAMP}-{CLASSIFICATION_MODEL.replace(':','_')}.csv"
    with open(output_filename, 'w', newline='') as f_out:
        writer = csv.writer(f_out)
        
        # Write header immediately
        writer.writerow(['text', 'utterance_id'] + list(NEW_DEFINITIONS_WITH_EXAMPLES_7.keys()))
        f_out.flush()  # Force write to disk
        
        print(f"Created output file: {output_filename}", flush=True)
        
        # Process and write batches one at a time
        total_rows = len(valid_df)
        
        for i in range(0, total_rows, BATCH_SIZE):
            batch_df = valid_df.iloc[i:i + BATCH_SIZE]
            batch_texts = batch_df['text'].tolist()
            batch_indices = batch_df.index.tolist()
            
            print(f"Processing batch {i//BATCH_SIZE + 1}/{(total_rows + BATCH_SIZE - 1)//BATCH_SIZE}...", flush=True)
            
            # Classify this batch
            batch_results = _classify_text_multilabel(batch_texts, batch_indices, df)
            
            # Write results immediately after each batch completes
            for (idx, row), labels in zip(batch_df.iterrows(), batch_results):
                writer.writerow([
                    row['text'],
                    row['utterance_id']
                ] + labels)
            
            f_out.flush()  # Force write to disk after each batch
            
            timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
            print(f'Completed batch {i//BATCH_SIZE + 1} at {timestamp}', flush=True)
        
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        print(f'Completed processing all utterances at {timestamp}', flush=True)
    
    print(f"Results saved to: {output_filename}", flush=True)


def _parse_batch_response_deepseek(content, expected_count):
    """Parse deepseek batch response (handle thinking tags if present)"""
    # Remove thinking tags if present
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
    return _parse_batch_response(content, expected_count)


def _parse_batch_response(content, expected_count):
    """Parse multi-line batch response"""
    # Handle unicode safely for logging
    try:
        safe_content = content.encode('utf-8', errors='replace').decode('utf-8')
        print(f"Raw batch output:\n{safe_content}\n", flush=True)
    except Exception as e:
        print(f"Could not display output due to encoding: {str(e)}", flush=True)
    
    # Remove problematic unicode for parsing
    try:
        content = content.encode('ascii', 'ignore').decode('ascii')
    except Exception:
        pass  # Continue with original content if encoding fails

    results = []
    lines = content.strip().split('\n')
    
    for line in lines:
        # Remove numbering (e.g., "1. " or "1) ")
        line = line.strip()
        if not line:
            continue
            
        # Remove leading numbers and separators
        cleaned = re.sub(r'^\d+[\.\)]\s*', '', line)
        
        # Extract binary digits
        parts = [p.strip() for p in cleaned.split(',')]
        if len(parts) == len(CONSTRUCTS_7):
            try:
                binary = [int(p) for p in parts]
                results.append(binary)
            except ValueError:
                print(f"Warning: Could not parse line as binary: {line}")
                results.append([0] * len(CONSTRUCTS_7))
    
    # Pad with zeros if we got fewer results than expected
    while len(results) < expected_count:
        print(f"Warning: Missing results, padding with zeros. Got {len(results)}, expected {expected_count}")
        results.append([0] * len(CONSTRUCTS_7))
    
    return results[:expected_count]

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
        context_msg = f"There can be multiple nursing students in a healthcare simulation session. These nursing students were assigned a color label, either Red, Blue, Green, or Yellow. Here is a dialogue snippet in a healthcare simulation session:\n{utterance_snippet}"
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
    """
    Old version - process each row individually and write to timestamped CSV
    1. Create output directory if it doesn't exist
    2. Create timestamped output file
    3. Write header if file is new
    4. Process each row and append results to CSV
    5. Return DataFrame of processed rows
    """

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


def process_classification_with_genai_batch(df: pd.DataFrame, batch_size=70):
    """
    New version - process rows in batches and write to timestamped CSV
    1. Create output directory if it doesn't exist
    2. Create timestamped output file
    3. Write header if file is new
    4. Process rows in batches and append results to CSV
    5. Return DataFrame of processed rows
    """
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

    # Filter valid rows
    valid_mask = pd.notnull(df['text'])
    valid_df = df[valid_mask].copy()

    header = ['start_time', 'end_time', 'text', 'conversation_id', 'utterance_id', 'initiator', 'receiver'] + list(NEW_DEFINITIONS_WITH_EXAMPLES_7.keys())
    # Write header first if file does not exist
    if not os.path.exists(output_file):
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=header)
            writer.writeheader()

    # Process and write batches one at a time
    total_rows = len(valid_df)
    
    for i in range(0, total_rows, batch_size):
        batch_df = valid_df.iloc[i:i + batch_size]
        batch_texts = batch_df['text'].tolist()
        batch_indices = batch_df.index.tolist()

        print(f"Processing batch {i//batch_size + 1}/{(total_rows + batch_size - 1)//batch_size}...", flush=True)

        # Classify this batch
        batch_results = _classify_text_multilabel(batch_texts, batch_indices, df)
        
        with open(output_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=header)
            # Write results immediately after each batch completes
            for (idx, result_row), labels in zip(batch_df.iterrows(), batch_results):
                processed_row = {
                    'start_time': result_row['start_time'],
                    'end_time': result_row['end_time'],
                    'text': result_row['text'],
                    'conversation_id': result_row['conversation_id'],
                    'utterance_id': result_row['utterance_id'],
                    'initiator': result_row['initiator'],
                    'receiver': result_row['receiver'],
                }
                processed_row.update(dict(zip(NEW_DEFINITIONS_WITH_EXAMPLES_7.keys(), labels)))
                writer.writerow(processed_row)
                processed_rows.append(processed_row)
            f.flush()  # Force write to disk after each batch
        
        timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        print(f'Completed batch {i//batch_size + 1} at {timestamp}', flush=True)

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
