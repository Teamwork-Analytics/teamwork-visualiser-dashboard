import os
import re
import shutil

import pandas as pd
import pydub

from data_cleaner.formation_detection.formation_differentiation import get_formation_dict, detecting_receiver
from data_cleaner.audio_processing.processing_audios import vad_on_unlabelled_data


def audio_processing(folder_path: str, session_id: int, create_archive: bool = False):
    """
    Doing vad using the processed audio files, following naming format of sim_{color}.wav

    @param create_archive:
    @param session_id:
    @param folder_path: The path to the folder containing all the audio files
    @return: none
    """

    # todo: may need further processing on extracting the the_session_id
    processing_audio_to_clips(folder_path, session_id)
    if create_archive:
        shutil.make_archive(os.path.join(folder_path, str(session_id), "clips_and_intervals"), "zip",
                            os.path.join(folder_path, str(session_id), "audio_clip_folder"))


def clip_audio(audio_path, interval_path, output_folder_path):
    audio_file = pydub.AudioSegment.from_file(audio_path, "wav")
    interval_df = pd.read_excel(interval_path)
    empty = pydub.AudioSegment.empty()
    for i, row in interval_df.iterrows():
        start = int(row["start"] * 1000)
        end = int(row["end"] * 1000)
        clip = audio_file[start: end]
        clip = empty + clip
        clip.export(os.path.join(output_folder_path, "{}_{}.wav".format(row['start'], row['end'])), "wav")


def processing_audio_to_clips(data_folder_path, session_id):
    audio_folder = os.path.join(data_folder_path, str(session_id))
    audio_clips_higher_folder = os.path.join(audio_folder, "audio_clip_folder")
    audio_clips_session_folder = os.path.join(audio_folder, "audio_clip_folder", "utterance_timing_folder")
    audio_clips_folder = os.path.join(audio_folder, "audio_clip_folder", "audio_clips")
    if not os.path.exists(audio_clips_higher_folder):
        os.mkdir(audio_clips_higher_folder)
    if not os.path.exists(audio_clips_session_folder):
        os.mkdir(audio_clips_session_folder)
    if not os.path.exists(audio_clips_folder):
        os.mkdir(audio_clips_folder)
    # ================ generating VAD results, export to an excel ==================
    for a_file in os.listdir(audio_folder):
        if "sim_" in a_file and ".wav" in a_file:
            filename = a_file.split("_")[1].split(".")[0]
            output = os.path.join(audio_clips_session_folder, filename + "_intervals.xlsx")
            vad_on_unlabelled_data(os.path.join(audio_folder, a_file), output)

    # testing_string = "0.2,3|5.4,6|11,44|45,55|111,1515"
    # print(__merging_intervals(testing_string, 3))

    # ==============  exporting audio clips =====================
    #
    for a_file in os.listdir(audio_clips_session_folder):
        if "_intervals.xlsx" in a_file:
            color = a_file.split(".")[0].split("_")[0]
            audio_clip_output_path = os.path.join(audio_clips_folder, color)
            audio_file_name = "sim_" + color + ".wav"
            if not os.path.exists(audio_clip_output_path):
                os.makedirs(audio_clip_output_path)
            audio_path = os.path.join(audio_folder, audio_file_name)
            interval_path = os.path.join(audio_clips_session_folder, a_file.split('.')[0] + ".xlsx")
            clip_audio(audio_path, interval_path, audio_clip_output_path)

    # ============== merging all interval excel into one to make transcription easier ===============
    # merged_interval_excel_output_path = "all_intervals.xlsx"
    # merging_into_one(interval_output_folder, merged_interval_excel_output_path)


def clip_to_excel_with_filtering(clips_folder, handover_ends: float,
                                 met_entered: float, secondary_entered: float):
    # session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id))
    # clip_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id), "audio_clips")
    result_list = []
    columns = ["utterance_id", "conversation_id", "text", "start_time", "end_time", "duration", "initiator",
               "receiver", "location", "communication_type", "stage_based_on_num_of_student"]
    print("===== organising clips into excel started =============")

    # critical_timestamp_df = pandas.read_excel(critical_timestamp_path)
    # handover_ends = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0]["handover_ends"]
    # met_entered = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0]["met_entered"]
    # secondary_entered = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0][
    #     "secondary_entered"]

    for a_color in os.listdir(clips_folder):
        if "." in a_color:
            continue
        print("--------- {} started -------------".format(a_color))
        color_folder = os.path.join(clips_folder, a_color)
        for a_clip in os.listdir(color_folder):
            if ".wav" in a_clip:
                filename = ".".join(a_clip.split(".")[:-1])
                start_time = filename.split("_")[0]
                if a_color.lower() == "blue" or a_color.lower() == "red" or a_color.lower() == "black":
                    if handover_ends > float(start_time):
                        continue
                if a_color.lower() == "green" or a_color.lower() == "yellow":
                    if secondary_entered > float(start_time):
                        continue
                if a_color.lower() == "white":
                    if met_entered > float(start_time):
                        continue

                end_time = filename.split("_")[1]
                a_dict = {key: "" for key in columns}
                a_dict["start_time"] = float(start_time)
                a_dict["end_time"] = float(end_time)
                a_dict["duration"] = float(end_time) - float(start_time)
                a_dict["text"] = ""
                a_dict["initiator"] = a_color.lower()
                result_list.append(a_dict)

    intervals_df = pd.DataFrame(result_list)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    intervals_df.reset_index(drop=True, inplace=True)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    print(type(intervals_df["start_time"].iloc[0]))
    # intervals_df.to_excel(os.path.join(session_folder, str(the_session_id) + "_transcription.xlsx"))
    print("===== organising clips into excel ended =============")
    return intervals_df


def initialise_folder(path: str):
    if not os.path.exists(path):
        os.mkdir(path)
    return path



def sub_black_white_outsider(line):
    new_line = re.sub("black", "relative", line)
    new_line = re.sub("white", "doctor", new_line)
    new_line = re.sub("outsider", "patient", new_line)
    return new_line


def change_name_of_black_and_white(conv_df):
    conv_df["initiator"] = conv_df["initiator"].apply(sub_black_white_outsider)
    conv_df["receiver"] = conv_df["receiver"].apply(sub_black_white_outsider)
    return conv_df


if __name__ == '__main__':
    conversation_df = pd.read_csv("../285_network_data.csv")
    name_changed_df = change_name_of_black_and_white(conversation_df)
    name_changed_df.to_csv("../285_network_data_changed.csv")


def generate_sna_csv(the_data_folder: str,
                     the_session_id: int,
                     raw_audio_folder: str,
                     raw_pozyx_file_path: str,
                     sync_data_path: str,
                     handover_ends: float,
                     secondary_entered: float,
                     doctor_entered: float):
    # raw_audio_folder = os.path.join(the_data_folder, str(the_session_id))
    audio_folder = initialise_folder(os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder"))
    audio_clip_folder = initialise_folder(os.path.join(audio_folder, "audio_clips"))
    # raw_pozyx_file_path = os.path.join(the_data_folder, str(the_session_id), "{}.json".format(the_session_id))
    # sync_data_path = os.path.join(the_data_folder, str(the_session_id), "sync.txt")

    audio_processing(the_data_folder, the_session_id)  # took less than 5 seconds
    intervals_df: pd.DataFrame = clip_to_excel_with_filtering(
        clips_folder=audio_clip_folder,
        handover_ends=handover_ends,
        secondary_entered=secondary_entered,
        met_entered=doctor_entered)

    formation_dict = get_formation_dict(raw_audio_folder, the_session_id, raw_pozyx_file_path, sync_data_path)
    detecting_receiver(intervals_df, formation_dict)
    return intervals_df, formation_dict