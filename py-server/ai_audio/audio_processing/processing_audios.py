import os
import re

import pandas
import pandas as pd
import pydub


from ai_audio.audio_processing.webRTC import do_vad
# from audio_processing.organising_into_excel import ROOT_PATH


def get_interval_list(interval_str):
    """interval string to list [(start, end),(),(),...]"""
    interval_list = []
    raw_list = interval_str.split("|")
    for str_coord in raw_list:
        splited = str_coord.split(",")
        interval_list.append((float(splited[0]), float(splited[1])))

    return interval_list


def __merging_intervals(interval_str: str, merging_threshold: int = 3):
    """merging the voice activity interval when they are too close to each other"""
    interval_list = get_interval_list(interval_str)
    res_list = []
    merging_buffer_pos = []
    for i in range(len(interval_list)):
        if len(merging_buffer_pos) == 0:
            merging_buffer_pos.append(interval_list[i][0])
            merging_buffer_pos.append(interval_list[i][1])
        else:
            if interval_list[i][0] - merging_buffer_pos[1] < merging_threshold:
                merging_buffer_pos[1] = interval_list[i][1]
            else:
                res_list.append(merging_buffer_pos)
                merging_buffer_pos = []
                merging_buffer_pos.append(interval_list[i][0])
                merging_buffer_pos.append(interval_list[i][1])

    if len(merging_buffer_pos) != 0:
        res_list.append(merging_buffer_pos)
    print("Number of utterances: {}".format(len(res_list)))
    return res_list


def vad_on_unlabelled_data(audio_path: str, output_path, strictness_level: int = 3):
    # the result dataframe contains three columns called
    # "session", "audio time", "audio", containing the session name,
    # timestamp in the audio(in %H:%M:%S format),
    # and the if the teacher spoke something(1 for teacher spoke something, 0 for not)
    column_name = ["start", "end", "manual transcription", "auto transcription"]
    res_dict = {"start": [], "end": [], "manual transcription": [], "auto transcription": []}
    result_string = do_vad(audio_path, strictness_level=strictness_level)

    if result_string == '':
        print("{} is empty".format(audio_path))
        return

    print("doing vad for: {}".format(audio_path))
    interval_list = __merging_intervals(result_string, 3)

    for interval in interval_list:
        # interval = a_time_interval_str.split(",")
        res_dict["start"].append(float(interval[0]))
        res_dict["end"].append(float(interval[1]))
        res_dict["manual transcription"].append("")
        res_dict["auto transcription"].append("")
    pd.DataFrame(res_dict).to_excel(output_path)
    return


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


def clip_audio_using_ena_data(audio_path, interval_path, output_folder_path):
    audio_file = pydub.AudioSegment.from_file(audio_path, "wav")
    interval_df = pd.read_excel(interval_path)
    empty = pydub.AudioSegment.empty()
    for i, row in interval_df.iterrows():
        start = int(row["start_time"] * 1000)
        end = int(row["end_time"] * 1000)
        clip = audio_file[start: end]
        clip = empty + clip
        clip.export(os.path.join(output_folder_path, "{}_{}.wav".format(row['start_time'], row['end_time'])), "wav")


def merging_into_one(interval_folder_path, output_path):
    column_name = ["color", "start", "end", "manual transcription", "auto transcription"]
    res_df = pd.DataFrame(columns=column_name)

    for a_interval_file in os.listdir(interval_folder_path):
        color = a_interval_file.split(".")[0]
        a_df = pd.read_excel(os.path.join(interval_folder_path, a_interval_file))
        for i, row in a_df.iterrows():
            new_series = {"color": color, "start": row["start"], "end": row["end"], "manual transcription": "",
                          "auto transcription": ""}

            res_df = res_df.append(pd.Series(new_series), ignore_index=True)
    res_df.sort_values(["start"], inplace=True)
    res_df.to_excel(output_path)


def processing_audio_to_clips(data_folder_path, session_id):
    audio_folder = os.path.join(data_folder_path, str(session_id))
    processed_audio_folder = os.path.join(data_folder_path, str(session_id), "audio", "processed_audio")
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
    for a_file in os.listdir(processed_audio_folder):
        if "sim_" in a_file and ".wav" in a_file:
            filename = a_file.split("_")[1].split(".")[0]
            output = os.path.join(audio_clips_session_folder, filename + "_intervals.xlsx")
            vad_on_unlabelled_data(os.path.join(processed_audio_folder, a_file), output)

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
            audio_path = os.path.join(processed_audio_folder, audio_file_name)
            interval_path = os.path.join(audio_clips_session_folder, a_file.split('.')[0] + ".xlsx")
            clip_audio(audio_path, interval_path, audio_clip_output_path)

    # ============== merging all interval excel into one to make transcription easier ===============
    # merged_interval_excel_output_path = "all_intervals.xlsx"
    # merging_into_one(interval_output_folder, merged_interval_excel_output_path)


def __get_2021_audio_file_name(audio_folder_path: str, target_color: str):
    for a_file in os.listdir(audio_folder_path):
        if "simulation" in a_file and ".wav" in a_file and target_color.upper() in a_file:
            return a_file


def processing_audio_to_clips_by_ena_data(session_id, ena_df: pandas.DataFrame):
    audio_folder = os.path.join(ROOT_PATH, str(session_id))
    audio_clips_higher_folder = os.path.join(ROOT_PATH, "audio_clip_folder")
    audio_clips_session_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(session_id))
    audio_clips_folder = os.path.join(ROOT_PATH, "audio_clip_folder", str(session_id), "audio_clips")
    if not os.path.exists(audio_clips_higher_folder):
        os.mkdir(audio_clips_higher_folder)
    if not os.path.exists(audio_clips_session_folder):
        os.mkdir(audio_clips_session_folder)
    if not os.path.exists(audio_clips_folder):
        os.mkdir(audio_clips_folder)
    # ================ splitting the time slot of each students to individual files ==================
    student_color = ("blue", "green", "red", "yellow")
    session_pd = ena_df[ena_df["the_session_id"] == int(session_id)]
    for a_color in student_color:
        output_path = os.path.join(audio_clips_session_folder, a_color.upper() + "_intervals.xlsx")
        color_pd = session_pd[session_pd["initiator"] == a_color]
        color_pd["end_time"] = color_pd["end_time"] + 0.15
        color_pd.to_excel(output_path)

    # for a_file in os.listdir(audio_folder):
    #     if "simulation" in a_file and ".wav" in a_file:
    #         # filename = a_file.split("_")[1].split(".")[0]
    #         color = a_file.split("_")[1]
    #         output_path = os.path.join(audio_clips_session_folder, color + "_intervals.xlsx")
    #         ena_pd[ena_pd["the_session_id"] == the_session_id]

    # testing_string = "0.2,3|5.4,6|11,44|45,55|111,1515"
    # print(__merging_intervals(testing_string, 3))

    # ==============  exporting audio clips =====================
    #
    for a_file in os.listdir(audio_clips_session_folder):
        if "_intervals.xlsx" in a_file:
            color = a_file.split(".")[0].split("_")[0]
            audio_clip_output_path = os.path.join(audio_clips_folder, color)
            audio_file_name = __get_2021_audio_file_name(audio_folder, color)
            if not os.path.exists(audio_clip_output_path):
                os.makedirs(audio_clip_output_path)
            audio_path = os.path.join(audio_folder, audio_file_name)
            interval_path = os.path.join(audio_clips_session_folder, a_file.split('.')[0] + ".xlsx")
            clip_audio_using_ena_data(audio_path, interval_path, audio_clip_output_path)


if __name__ == '__main__':
    # ======= codes for processing 2021 data ===========
    ena_data_2021_path = "A 15 phase two and three.xlsx"
    ena_data = pd.read_excel(ena_data_2021_path)
    for session in os.listdir(ROOT_PATH):
        if not session.isnumeric():
            continue
        print("processing {}".format(session))
        print(bool(re.search(r"\d+", session)))
        if bool(re.search(r"\d+", session)) and (int(session) % 2 == 1):
            processing_audio_to_clips_by_ena_data(session_id=session, ena_df=ena_data)

# # ======= codes for processing 2022 data ===========
# for session in os.listdir(ROOT_PATH):
#     print("processing {}".format(session))
#     print(bool(re.search(r"\d+", session)))
#     if bool(re.search(r"\d+", session)) and (int(session) % 2 == 1):
#         processing_audio_to_clips(the_session_id=session)
# # audio_dub = pydub.AudioSegment.from_wav("empty.wav")
# audio_dub2 = pydub.AudioSegment.from_wav("empty.wav")
# audio = audio_dub + audio_dub2 + audio_dub + audio_dub
# audio.export("exp.wav", "wav")
