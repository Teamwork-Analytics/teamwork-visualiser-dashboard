import os

from data_cleaner.audio_spatail_processing import extract_information_with_yaw
from data_cleaner.network_igraph import generating_social_network
from data_cleaner.preprocessing_audio_files import preprocessing_audio_files

from data_cleaner.pozyx_extraction import get_timestamp


def detecting_receiver(conversation_excel, formation_dict):

    pass


def audio_visual(folder_path, simulationid, initial_handover_finish_time, initial_secondary_nurses_enter_time,
                 initial_doctor_enter_time, sync_path):  # folder_path = "C:\\develop\\saved_data\\181"
    # parameters

    start_timestamp = get_timestamp(sync_path)
    # todo: what is this?
    timeoffset = 10 * 60 * 60
    handover_finish_time = initial_handover_finish_time - start_timestamp + timeoffset
    secondary_nurses_enter_time = initial_secondary_nurses_enter_time - start_timestamp + timeoffset
    doctor_enter_time = initial_doctor_enter_time - start_timestamp + timeoffset

    path_processed_audio_output_folder = os.path.join(folder_path, "audio", "processed_audio_for_formation")
    audio_data_folder = os.path.join(folder_path, "audio", "processed_audio")
    path_pozyx_json = os.path.join(folder_path, "positioning_data", "raw_positioning",  "{}.json".format(simulationid))  # pozyx data path
    sync_path = os.path.join(folder_path, "sync.txt")  # the file holding the synchronization information
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
        output_dict["session_id"].append(session_id)
    # extract_information(folder_path, path_pozyx_json, path_coordinates, sync_path, doctor_enter_time=doctor_enter_time,
    #                     testing=True,
    #                     ground_truth_path=path_ground_truth)


    # This may not needed because we are using the excel file.
    # preprocessing_audio_files(audio_files_folder=audio_data_folder,
    #                           processed_output_folder=path_processed_audio_output_folder,
    #                           handover_finished_time=handover_finish_time,
    #                           secondary_enter_time=secondary_nurses_enter_time,
    #                           doctor_enter_time=doctor_enter_time)
    audio_dict = extract_information_with_yaw(path_processed_audio_output_folder, path_pozyx_json, path_coordinates,
                                              sync_path,
                                              doctor_enter_time=doctor_enter_time, testing=True,
                                              fov_thres=200, dist_thres=2000, absolute_thres=600)
    return audio_dict
    # generating_social_network(audio_dict, adjacent_temp_path, session_type, save_path=fig_save_path,
    #                           size_method=size_method, norm_method=norm_method, output_dict=output_dict,
    #                           raw_data_output_folder_path=raw_data_output_folder_path)

# if __name__ == '__main__':
################
# parameters
# path_audio_folder = "207/audio-WHITE BLACK added"    # path of the folder holding audio data
# path_processed_audio_output_folder = "207/audio_processed"
# path_pozyx_json = "207/207.json"    # pozyx data path
# sync_path = "207/sync.txt"    # the file holding the synchronization information
# path_coordinates = "Coordinates.csv"    # a configuration file, not necessary in current code,
#                                         # just hold it not to have unexpected error
# session_id = 207
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
# session_type = "A" if int(session_id) % 2 == 1 else "B"
# doctor_enter_time = 0
# adjacent_temp_path = "vis_temp.xlsx"
# norm_method = "prop"
# size_method = "radius"
# raw_data_output_folder_path = ""
# output_dict = {}
# if raw_data_output_folder_path != "":
#     output_dict["session_id"].append(session_id)
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
