import json
import os

import pandas as pd
from google.cloud import speech_v1 as speech
from google.oauth2 import service_account

credential_path = "audio-transcription-2022-90c7e498be83.json"
azure_credential = "bb386f8a521843a4a4937cb89372d22f"
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credential_path
os.environ["COGNITIVE_SERVICE_KEY"] = azure_credential


def speech_to_text(config, audio):
    client = speech.SpeechClient()
    response = client.recognize(config=config, audio=audio)
    print_sentences(response)


def print_sentences(response):
    for result in response.results:
        best_alternative = result.alternatives[0]
        transcript = best_alternative.transcript
        confidence = best_alternative.confidence
        print("-" * 80)
        print(f"Transcript: {transcript}")
        print(f"Confidence: {confidence:.0%}")


def __testing():
    # recognition config class: https://cloud.google.com/python/docs/reference/speech/latest/google.cloud.speech_v1p1beta1.types.RecognitionConfig
    # recognition config json: https://cloud.google.com/speech-to-text/docs/samples/speech-transcribe-async
    config = dict(language_code="en-US")
    audio = dict(uri="gs://cloud-samples-data/speech/brooklyn_bridge.flac")
    speech_to_text(config, audio)


def transcribe_file(speech_file, output_path):
    """Transcribe the given audio file asynchronously."""
    from google.cloud import speech

    client = speech.SpeechClient()

    with open(speech_file, "rb") as audio_file:
        content = audio_file.read()

    """
     Note that transcription is limited to a 60 seconds audio file.
     Use a GCS file for audio longer than 1 minute.
    """
    audio = speech.RecognitionAudio(content=content)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=44100,
        language_code="en-US",
        model="medical_conversation"
    )

    operation = client.long_running_recognize(config=config, audio=audio)

    print("Waiting for operation to complete...")
    response = operation.result(timeout=90)
    print(response)
    output_json_list = []

    # Each result is for a consecutive portion of the audio. Iterate through
    # them to get the transcripts for the entire audio file.
    for result in response.results:
        alternatives = []
        for an_alterntive in result.alternatives:
            alterntive_dict = {"transcript": an_alterntive.transcript, "confidence": an_alterntive.confidence}
            alternatives.append(alterntive_dict)
        output_json_list.append(alternatives)

        # The first alternative is the most likely one for this portion.
        print(u"Transcript: {}".format(result.alternatives[0].transcript))
        print("Confidence: {}".format(result.alternatives[0].confidence))
    with open(output_path, "w") as fp:
        json.dump(output_json_list, fp)


def azure_transcription(audio_path, output_folder):
    pass


def bulk_transcription(input_folder, output_folder):
    """把所有的小的audio clip文件送进google cloud，进行transcription"""
    # load transcribed file names
    transcribed_list = []
    for a_folder in os.listdir(output_folder):
        inner_folder = os.path.join(output_folder, a_folder)
        for a_file in os.listdir(inner_folder):
            transcribed_list.append(".".join(a_file.split(".")[:-1]))

    for a_color in ("blue", "green", "red", "yellow"):
        a_color_path = os.path.join(input_folder, a_color)
        output_color_folder_path = os.path.join(output_folder, a_color)
        if not os.path.exists(output_color_folder_path):
            os.makedirs(os.path.join(output_folder, a_color))

        for a_audio in os.listdir(a_color_path):
            filename = ".".join(a_audio.split(".")[:-1])
            if filename in transcribed_list:
                print("scaped: " + a_audio)
                continue
            audio_path = os.path.join(a_color_path, a_audio)
            time_interval_str = ".".join(a_audio.split(".")[:-1])
            start = float(time_interval_str.split("_")[0])
            end = float(time_interval_str.split("_")[1])
            transcribe_file(audio_path, os.path.join(output_color_folder_path, "{}_{}.json".format(start, end)))


def transcription_to_excel(original_excel_path: str, transcription_folder: str, output_path: str):
    original_df = pd.read_excel(original_excel_path)
    original_df["confidence"] = 0.0
    original_df["auto transcription"] = ""
    missed_transcriptions = 0
    for i, row in original_df.iterrows():
        color = row["color"]
        start = float(row["start"])
        end = float(row["end"])

        transcription_path = os.path.join(transcription_folder, color, "{}_{}.json".format(start, end))
        if os.path.exists(transcription_path):
            with open(transcription_path) as fp:
                transcription_json = json.load(fp)
        else:
            missed_transcriptions += 1
            continue
        text = ""
        j = 0
        total_confidence = 0

        for line in transcription_json:
            if len(line) != 1:
                raise ValueError("transcription length not 1")
            text += line[0]["transcript"]
            total_confidence += line[0]["confidence"]
            j += 1

        original_df.at[i, "auto transcription"] = text
        original_df.at[i, "confidence"] = total_confidence / j

    original_df.to_excel(output_path)
    print(missed_transcriptions)


# def test_how_many_alternatives(transcription_folder):
#     for folder in os.listdir(transcription_folder):
#         for transcript in os.listdir(os.path.join(transcription_folder, folder)):
#             with open(os.path.join(transcription_folder, folder, transcript)) as fp:
#                 transcript_json = json.load(fp)
#             for a_transcript in transcript_json:
#                 if len(a_transcript) != 1:
#                     print(len(a_transcript))
#                     raise ValueError

def get_total_duration(input):
    df = pd.read_excel(input)
    df['duration'] = df["start"] - df["end"]
    print(df['duration'].sum())


original_path = "all_intervals_merged_small.xlsx"
transcription_folder = "transcribes_medical"
# bulk_transcription("audio_clips_output", "transcribes_medical")
output_path = "completed_intervals_v3.xlsx"
transcription_to_excel(original_path, transcription_folder, output_path)
get_total_duration("completed_with_WER_v5.xlsx")