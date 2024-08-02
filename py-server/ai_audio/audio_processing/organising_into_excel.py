import json
import os.path

import pandas

from ai_audio.my_util.algorithms import filter_unused_clips

columns = ["utterance_id", "conversation_id", "text", "start_time", "end_time", "duration", "initiator",
           "receiver", "location", "communication_type", "stage_based_on_num_of_student"]
CLOUD_ROOT_PATH = "G:/我的云端硬盘/2022 audio data"


# ROOT_PATH = "F:/2022 audio data"
# Changes made in 2023/3/27, to process the 2021 audio data
# ROOT_PATH = "F:/2021 audio data"

# print(os.path.exists(ROOT_PATH))


def decompose_segments(path: str, color: str, result: list = None):
    if result is None:
        result = []

    with open(path) as fp:
        transcription_json = json.load(fp)
    for a_segment in transcription_json["segments"]:
        if a_segment['text'] != ".":
            a_dict = {key: "" for key in columns}

            a_dict["start_time"] = a_segment['start']
            a_dict["end_time"] = a_segment['end']
            a_dict["duration"] = a_segment['end'] - a_segment['start']
            a_dict["text"] = a_segment['text']
            a_dict["initiator"] = color

            result.append(a_dict)
    return result


def main():
    session_id = 225
    path = os.path.join(ROOT_PATH, str(session_id))
    res_list = []
    for a_file in os.listdir(path):
        if "sim" in a_file and ".json" in a_file:
            decompose_segments(os.path.join(path, a_file), a_file.split("_")[1].split(".")[0].lower(), res_list)
    res_pd = pandas.DataFrame(res_list)
    res_pd.sort_values(by=["start_time"], inplace=True)
    res_pd.reset_index(drop=True, inplace=True)
    res_pd.to_excel(os.path.join(path, str(session_id) + ".xlsx"))


def clip_transcription_to_excel(transcription_folder: str, output_folder: str, handover_ends: int, met_entered: int,
                                secondary_entered: int):
    # session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id))
    # clip_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id), "audio_clips")
    result_list = []

    print("===== organising transcription into excel started =============")

    # critical_timestamp_df = pandas.read_excel(critical_timestamp_path)
    # handover_ends = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0]["handover_ends"]
    # met_entered = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0]["met_entered"]
    # secondary_entered = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0][
    #     "secondary_entered"]

    for a_color in os.listdir(transcription_folder):
        if "." in a_color:
            continue
        print("--------- {} started -------------".format(a_color))
        color_folder = os.path.join(transcription_folder, a_color)
        for a_clip in os.listdir(color_folder):
            if ".json" in a_clip:
                with open(os.path.join(color_folder, a_clip)) as fp:
                    transcription_json = json.load(fp)
                filename = ".".join(a_clip.split(".")[:-1])
                start_time = filename.split("_")[0]

                if filter_unused_clips(a_color, start_time, handover_ends, secondary_entered, met_entered):
                    continue
                # if a_color.lower() == "blue" or a_color.lower() == "red" or a_color.lower() == "black":
                #     if handover_ends > float(start_time):
                #         continue
                # if a_color.lower() == "green" or a_color.lower() == "yellow":
                #     if secondary_entered > float(start_time):
                #         continue
                # if a_color.lower() == "white":
                #     if met_entered > float(start_time):
                #         continue

                end_time = filename.split("_")[1]
                a_dict = {key: "" for key in columns}
                a_dict["start_time"] = float(start_time)
                a_dict["end_time"] = float(end_time)
                a_dict["duration"] = float(end_time) - float(start_time)
                a_dict["text"] = transcription_json["text"].strip()
                a_dict["initiator"] = a_color.lower()
                result_list.append(a_dict)

    intervals_df = pandas.DataFrame(result_list)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    intervals_df.reset_index(drop=True, inplace=True)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    print(type(intervals_df["start_time"].iloc[0]))
    # intervals_df.to_excel(os.path.join(session_folder, str(the_session_id) + "_transcription.xlsx"))
    intervals_df.to_excel(output_folder)
    print("===== organising transcription into excel ended =============")
    return intervals_df




def clip_transcription_to_excel_with_filtering(transcription_folder: str, output_folder: str, handover_ends: float,
                                met_entered: float, secondary_entered: float):
    # session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id))
    # clip_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id), "audio_clips")
    result_list = []

    print("===== organising transcription into excel started =============")

    # critical_timestamp_df = pandas.read_excel(critical_timestamp_path)
    # handover_ends = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0]["handover_ends"]
    # met_entered = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0]["met_entered"]
    # secondary_entered = critical_timestamp_df[critical_timestamp_df["the_session_id"] == the_session_id].iloc[0][
    #     "secondary_entered"]

    for a_color in os.listdir(transcription_folder):
        if "." in a_color:
            continue
        print("--------- {} started -------------".format(a_color))
        color_folder = os.path.join(transcription_folder, a_color)
        for a_clip in os.listdir(color_folder):
            if ".json" in a_clip:
                with open(os.path.join(color_folder, a_clip)) as fp:
                    transcription_json = json.load(fp)
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
                a_dict["text"] = transcription_json["text"].strip()
                a_dict["initiator"] = a_color.lower()
                result_list.append(a_dict)

    intervals_df = pandas.DataFrame(result_list)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    intervals_df.reset_index(drop=True, inplace=True)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    print(type(intervals_df["start_time"].iloc[0]))
    # intervals_df.to_excel(os.path.join(session_folder, str(the_session_id) + "_transcription.xlsx"))
    intervals_df.to_excel(output_folder)
    print("===== organising transcription into excel ended =============")
    return intervals_df



def clip_to_excel_with_filtering(clips_folder, handover_ends: float,
                                met_entered: float, secondary_entered: float):
    # session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id))
    # clip_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(the_session_id), "audio_clips")
    result_list = []

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

    intervals_df = pandas.DataFrame(result_list)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    intervals_df.reset_index(drop=True, inplace=True)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    print(type(intervals_df["start_time"].iloc[0]))
    # intervals_df.to_excel(os.path.join(session_folder, str(the_session_id) + "_transcription.xlsx"))
    print("===== organising clips into excel ended =============")
    return intervals_df



def clip_transcription_to_excel_2021(session_id: int):
    """
    This function does not take into account the timestamp file
    :param session_id:
    :return:
    """
    session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(session_id))
    clip_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(session_id), "audio_clips")
    result_list = []

    print("===== session {} started =============".format(session_id))

    for a_color in os.listdir(clip_folder):
        print("--------- {} started -------------".format(a_color))
        color_folder = os.path.join(clip_folder, a_color)
        for a_clip in os.listdir(color_folder):
            if ".json" in a_clip:
                with open(os.path.join(color_folder, a_clip)) as fp:
                    transcription_json = json.load(fp)
                filename = ".".join(a_clip.split(".")[:-1])
                start_time = filename.split("_")[0]

                end_time = filename.split("_")[1]
                a_dict = {key: "" for key in columns}
                a_dict["start_time"] = float(start_time)
                a_dict["end_time"] = float(end_time)
                a_dict["duration"] = float(end_time) - float(start_time)
                a_dict["text"] = transcription_json["text"].strip()
                a_dict["initiator"] = a_color.lower()
                result_list.append(a_dict)

    intervals_df = pandas.DataFrame(result_list)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    intervals_df.reset_index(drop=True, inplace=True)
    intervals_df.sort_values(by=["start_time"], inplace=True)
    print(type(intervals_df["start_time"].iloc[0]))
    intervals_df.to_excel(os.path.join(session_folder, str(session_id) + "_transcription.xlsx"))
    print("===== session {} finished =============".format(session_id))


if __name__ == '__main__':
    # ============ section for 2021 whisper transcription data =============================
    # for a_session in os.listdir(os.path.join(ROOT_PATH, "audio_clip_folder")):
    #     clip_transcription_to_excel_2021(int(a_session))

    # ============ section for 2022 whisper transcription data ================================
    timestamp_excel_path = "G:/我的云端硬盘/2022 audio data/critical timestamps.xlsx"
    # main()
    for a_session in os.listdir(os.path.join(ROOT_PATH, "audio_clip_folder")):
        clip_transcription_to_excel(int(a_session), timestamp_excel_path)

    # copy local file to cloud to process those excel on another PC
    # for a_session in os.listdir(os.path.join(ROOT_PATH, "audio_clip_folder")):
    #     session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(a_session))
    #     cloud_session_folder = os.path.join(CLOUD_ROOT_PATH, "audio_clip_folder", str(a_session))
    #     shutil.copyfile(os.path.join(session_folder, str(a_session) + "_transcription.xlsx"),
    #                     os.path.join(cloud_session_folder, str(a_session) + "_transcription.xlsx"))
    # clip_transcription_to_excel(225, timestamp_excel_path)
