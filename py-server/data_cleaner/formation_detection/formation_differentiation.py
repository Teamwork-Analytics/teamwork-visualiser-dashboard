import os

import pandas as pd
import portion

from data_cleaner.formation_detection.audio_spatial_processing import extract_information_with_yaw
# from network_igraph import generating_social_network
# from preprocessing_audio_files import preprocessing_audio_files


def get_receiver(target_list: list):
    max_value = max(target_list, key=target_list.count)
    return max_value


def detecting_receiver(conversation_df: pd.DataFrame, formation_dict: dict):
    interval_dict = {}
    for a_color in formation_dict:
        a_color_df: pd.DataFrame = formation_dict[a_color]
        interval_dict[a_color] = []
        for i, row in a_color_df.iterrows():
            interval_dict[a_color].append((portion.closed(row["start"], row["end"]), row["target"]))

    for i, row in conversation_df.iterrows():
        start_time = row["start_time"]
        end_time = row["end_time"]
        color = row["initiator"]

        student_interval = portion.closed(start_time, end_time)

        target_list = []
        for a_tuple in interval_dict[color]:
            if (student_interval & a_tuple[0]) == portion.empty():
                continue
            target_list.append(a_tuple[1])

        if len(target_list) == 0:
            print("in {}, the detection of communication target did not find any potential target, used the latest receiver of"
                  "communication for it, utterance id is {}".format(__file__, row["utterance_id"]))

            find_closest_df = pd.DataFrame(formation_dict[color])
            # find the closest interval before current interval
            find_closest_df["start_distance"] = abs(formation_dict[color]["start"] - end_time)
            closest_start_row = find_closest_df[find_closest_df.start_distance == find_closest_df.start_distance.min()]

            # find the closest interval after current interval
            find_closest_df["end_distance"] = abs(formation_dict[color]["end"] - start_time)
            closest_end_row = find_closest_df[find_closest_df.end_distance == find_closest_df.end_distance.min()]

            # add the closest to the target list
            if closest_end_row.iloc[0]["end_distance"] < closest_start_row.iloc[0]["start_distance"]:
                target_list.append(closest_end_row.iloc[0]["target"])
            else:
                target_list.append(closest_start_row.iloc[0]["target"])

            # if the closest is still too far away than, show a warning
            if closest_start_row.iloc[0]["start_distance"] > 5 and closest_start_row.iloc[0]["end_distance"] > 5:
                print("    The closest receiver is found after/before {} seconds of this communication".format(closest_end_row.py["start_time"]))

        conversation_df.loc[i, "receiver"] = get_receiver(target_list)


def export_formation_dict(formation_dict: dict, export_folder: str):
    if not os.path.exists(export_folder):
        os.makedirs(export_folder)

    for a_color in formation_dict:
        formation_dict[a_color].to_csv(os.path.join(export_folder, "formation_detection_{}.csv".format(a_color)))


def import_formation_dict(export_folder: str):
    export_dict = {}
    for a_file in os.listdir(export_folder):
        color = a_file.split(".")[0].split("_")[2]
        export_dict[color] = pd.read_csv(os.path.join(export_folder, a_file))
    return export_dict


def get_formation_dict(data_folder_path, simulationid, path_pozyx_json,
                       sync_path):  # data_folder_path = "C:\\develop\\saved_data\\181"
    # parameters

    # start_timestamp = get_timestamp(sync_path)
    # todo: what is this?
    # timeoffset = 10 * 60 * 60
    # handover_finish_time = initial_handover_finish_time - start_timestamp + timeoffset
    # secondary_nurses_enter_time = initial_secondary_nurses_enter_time - start_timestamp + timeoffset
    # doctor_enter_time = initial_doctor_enter_time - start_timestamp + timeoffset

    # path_processed_audio_output_folder = os.path.join(data_folder_path, "audio", "processed_audio_for_formation")
    # path_pozyx_json = os.path.join(data_folder_path, "positioning_data", "raw_positioning", "{}.json".format(simulationid))  # pozyx data path
    # sync_path = os.path.join(data_folder_path, "sync.txt")  # the file holding the synchronization information
    path_coordinates = "Coordinates.csv"  # a configuration file, not necessary in current code,
    # just hold it not to have unexpected error
    session_id = simulationid

    # The following two parameters are used for processing the audio data
    # for blue and red, the
    # handover_finish_time = 0  # in format of seconds after the recording started, when handover finished
    # secondary_nurses_enter_time = 0  # seconds after the recording started, when nurses waiting outside coming in
    # doctor_enter_time = 0  # seconds after the recording started, when MET doctor entered the room
    ################
    # constant values
    session_type = "A" if int(session_id) % 2 == 1 else "B"
    # doctor_enter_time = 0
    adjacent_temp_path = "vis_temp.xlsx"
    norm_method = "prop"
    size_method = "radius"
    raw_data_output_folder_path = ""
    output_dict = {}
    if raw_data_output_folder_path != "":
        output_dict["the_session_id"].append(session_id)
    # extract_information(data_folder_path, path_pozyx_json, path_coordinates, sync_path, doctor_enter_time=doctor_enter_time,
    #                     testing=True,
    #                     ground_truth_path=path_ground_truth)

    # This may not needed because we are using the excel file.
    # preprocessing_audio_files(audio_files_folder=audio_data_folder,
    #                           processed_output_folder=path_processed_audio_output_folder,
    #                           handover_finished_time=handover_finish_time,
    #                           secondary_enter_time=secondary_nurses_enter_time,
    #                           doctor_enter_time=doctor_enter_time)
    audio_dict = extract_information_with_yaw(data_folder_path, path_pozyx_json, sync_path, testing=False,
                                              fov_thres=200, dist_thres=2000, absolute_thres=600)
    return audio_dict
    # generating_social_network(audio_dict, adjacent_temp_path, session_type, save_path=fig_save_path,
    #                           size_method=size_method, norm_method=norm_method, output_dict=output_dict,
    #                           raw_data_output_folder_path=raw_data_output_folder_path)


if __name__ == '__main__':
    print(get_receiver([1, 2, 3, 4, 4, 4, 4, 4, 3, 3, 3]))

# if __name__ == '__main__':
################
# parameters
# path_audio_folder = "207/audio-WHITE BLACK added"    # path of the folder holding audio data
# path_processed_audio_output_folder = "207/audio_processed"
# path_pozyx_json = "207/207.json"    # pozyx data path
# sync_path = "207/sync.txt"    # the file holding the synchronization information
# path_coordinates = "Coordinates.csv"    # a configuration file, not necessary in current code,
#                                         # just hold it not to have unexpected error
# the_session_id = 207
#
# # The following two parameters are used for processing the audio data
# # for blue and red, the
# handover_finish_time = 0    # in format of seconds after the recording started, when handover finished
# secondary_nurses_enter_time = 0    # seconds after the recording started, when nurses waiting outside coming in
# doctor_enter_time = 0   # seconds after the recording started, when MET doctor entered the room
#
# fig_save_path = "output_fig.png"    # output file path
# ################
# # constant values
# session_type = "A" if int(the_session_id) % 2 == 1 else "B"
# doctor_enter_time = 0
# adjacent_temp_path = "vis_temp.xlsx"
# norm_method = "prop"
# size_method = "radius"
# raw_data_output_folder_path = ""
# output_dict = {}
# if raw_data_output_folder_path != "":
#     output_dict["the_session_id"].append(the_session_id)
# # extract_information(path_audio_folder, path_pozyx_json, path_coordinates, sync_path, doctor_enter_time=doctor_enter_time,
# #                     testing=True,
# #                     ground_truth_path=path_ground_truth)
#
# # todo: add a preprocessing script here
# preprocessing_audio_files(audio_files_folder=path_audio_folder, processed_output_folder=path_processed_audio_output_folder,
#                           handover_finished_time=handover_finish_time,
#                           secondary_enter_time=secondary_nurses_enter_time,
#                           doctor_enter_time=doctor_enter_time)
# audio_dict = extract_information_with_yaw(path_processed_audio_output_folder, path_pozyx_json, path_coordinates, sync_path,
#                                           doctor_enter_time=doctor_enter_time, testing=True,
#                                           fov_thres=200, dist_thres=2000, absolute_thres=600)
# generating_social_network(audio_dict, adjacent_temp_path, session_type, save_path=fig_save_path,
#                           size_method=size_method, norm_method=norm_method, output_dict=output_dict,
#                           raw_data_output_folder_path=raw_data_output_folder_path)
