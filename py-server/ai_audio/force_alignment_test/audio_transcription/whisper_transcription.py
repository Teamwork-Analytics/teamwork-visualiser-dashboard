import json
import os
import time

import whisper
from ai_audio.my_util.Timer import Timers
from ai_audio.my_util.algorithms import filter_unused_clips
from ai_audio.my_util.deprecate import deprecated


# audio_clip_folder_path = "drive/MyDrive/2023_data_processing" #@param {type:"string"}
# the_session_id = 225 #@param{type: "integer"}
# the_session_id = str(the_session_id)

@Timers.calculate_time_effciecny
def initialise_whisper_model(model_name: str):
    start_time_initialisation = time.time()
    # model_name = "medium.en"
    model = whisper.load_model(model_name)
    return model


@deprecated
def transcribing_audio_clips(model, session_id, audio_clip_folder_path):
    """
    Use the function below, that one directly used the critical timestamp to filter the unwanted audio to
    reduce the processing time.
    @param model:
    @param session_id:
    @param audio_clip_folder_path:
    @return:
    """
    # updated 2023/3/27 to process 2021 dataset
    start_time = time.time()

    # for a_session in os.listdir(audio_clip_folder_path):

    print("========{} started=============".format(session_id))
    a_session_path = os.path.join(audio_clip_folder_path, session_id, "audio_clip_folder", "audio_clips")
    a_transcription_output_folder_path = os.path.join(audio_clip_folder_path, session_id, "transcriptions")

    if not os.path.exists(a_transcription_output_folder_path):
        os.makedirs(a_transcription_output_folder_path)
    # transcribe the audio clips
    for a_color in os.listdir(a_session_path):
        a_color_folder = os.path.join(a_session_path, a_color)
        print("-----color: {} started-------".format(a_color))
        a_transcription_color_folder_path = os.path.join(a_transcription_output_folder_path, a_color)

        if not os.path.exists(a_transcription_color_folder_path):
            os.makedirs(a_transcription_color_folder_path)

        for a_clip in os.listdir(a_color_folder):
            a_clip: str
            clip_name = ".".join(a_clip.split(".")[:-1])
            clip_path = os.path.join(a_color_folder, a_clip)
            # print(os.path.join(a_color_folder, clip_name + ".json"))
            if not os.path.exists(os.path.join(a_transcription_color_folder_path, clip_name + ".json")):
                print(a_clip)
                # transcribe the model
                result = model.transcribe(clip_path)
                # save the transcriptions into json files
                with open(os.path.join(a_transcription_color_folder_path, clip_name + ".json"), "w") as fp:
                    json.dump(result, fp)

    print("transcription finished {}".format(time.time() - start_time))
    # print(result)


def transcribing_audio_clips_with_timestamp(model, session_id, audio_clip_folder_path,
                                            handover_ends, secondary_entered, met_entered):
    """
    This one use the timestamp to filter the clips that would not be used.
    @param model:
    @param session_id:
    @param audio_clip_folder_path:
    @return:
    """
    # updated 2023/3/27 to process 2021 dataset
    start_time = time.time()

    # for a_session in os.listdir(audio_clip_folder_path):

    print("========{} started=============".format(session_id))
    a_session_path = os.path.join(audio_clip_folder_path, session_id, "audio_clip_folder", "audio_clips")
    a_transcription_output_folder_path = os.path.join(audio_clip_folder_path, session_id, "transcriptions")

    if not os.path.exists(a_transcription_output_folder_path):
        os.makedirs(a_transcription_output_folder_path)

    for a_color in os.listdir(a_session_path):
        a_color_folder = os.path.join(a_session_path, a_color)
        print("-----color: {} started-------".format(a_color))
        a_transcription_color_folder_path = os.path.join(a_transcription_output_folder_path, a_color)

        if not os.path.exists(a_transcription_color_folder_path):
            os.makedirs(a_transcription_color_folder_path)

        for a_clip in os.listdir(a_color_folder):
            a_clip: str
            clip_name = ".".join(a_clip.split(".")[:-1])

            if filter_unused_clips(a_color, start_time, handover_ends, secondary_entered, met_entered):
                continue

            clip_path = os.path.join(a_color_folder, a_clip)
            # print(os.path.join(a_color_folder, clip_name + ".json"))
            if not os.path.exists(os.path.join(a_transcription_color_folder_path, clip_name + ".json")):
                print(a_clip)

                result = model.transcribe(clip_path)
                with open(os.path.join(a_transcription_color_folder_path, clip_name + ".json"), "w") as fp:
                    json.dump(result, fp)

    print("transcription finished {}".format(time.time() - start_time))
    # print(result)


def calculate_duration_of_clips(audio_clip_folder_path, session_id):
    a_session_path = os.path.join(audio_clip_folder_path, session_id, "audio_clip_folder", "audio_clips")
    duration = 0
    for a_color in os.listdir(a_session_path):
        a_color_folder = os.path.join(a_session_path, a_color)

        for a_clip in os.listdir(a_color_folder):
            clip_name = ".".join(a_clip.split(".")[:-1]).split("_")
            duration += (float(clip_name[1]) - float(clip_name[0]))
    print("audio duration of session {} is {} seconds".format(session_id, duration))
    return duration
