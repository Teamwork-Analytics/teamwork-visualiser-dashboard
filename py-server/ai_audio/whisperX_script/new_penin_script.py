import os
import time

import pandas as pd

# TODO check this .main. Wrong way!
from .main import whisperx_transcribe

audio_folder = "audio/nursing"
res_folder = "result/res_nursing"

def create_transcription_files(whisper_model, audio_folder_path, res_folder_path):
    start = time.time()
    for a_audio in os.listdir(audio_folder_path):
        if "simulation_" in a_audio and ".wav" in a_audio:
            whisperx_transcribe(whisper_model,os.path.join(audio_folder_path, a_audio), res_folder_path+"/" + a_audio + ".xlsx")
        else:
            print("{} is not a simulation audio in wav format, skip".format(a_audio))
        # to_doc("result/"+a_audio, "doc/" + a_audio.split(".")[0] + ".docx")
    print(time.time() - start)

# for a_res in os.listdir(res_folder_path):
#     # transcribe(os.path.join(folder_path, a_audio), "result/" + a_audio + ".xlsx")
#     to_doc(res_folder_path + "/"+a_res, "doc/" + a_res.split(".")[0] + ".docx")

def organsing_transcription_df(res_folder_path, transcription_excel_output_path):
    transcription_list = []
    for a_transcription in os.listdir(res_folder_path):
        if "simulation_" in a_transcription and ".xlsx" in a_transcription:
            transcription_list.append(pd.read_excel(os.path.join(res_folder_path, a_transcription)))
    transcription_df = pd.concat(transcription_list)
    transcription_df["duration"] = transcription_df["end"] - transcription_df["start"]

    transcription_df = pd.DataFrame(transcription_df.sort_values(by=["start"]))
    transcription_df.to_excel(transcription_excel_output_path)
    return transcription_df



if __name__ == '__main__':
    create_transcription_files(audio_folder, res_folder)
    organsing_transcription_df(res_folder,"")