import os
import pandas as pd

from data_cleaner.IPA import main_IPA
from data_cleaner.generate_sna import generate_sna_csv, change_name_of_black_and_white
from data_cleaner.pozyx_extraction import get_timestamp
from helper.helper import initialising_folders
# from config.config import Constant
from data_cleaner.pozyx_json_to_csv_2022 import pozyx_json_to_csv
from vad.pozyx_extraction import main, get_timestamp_from_sync, generate_single_file
from vad.hive_automation import hive_main
from pymongo import MongoClient
import matplotlib.pyplot as plt

import shutil
from data_cleaner.social_network_generation import audio_visual

from flask import Flask
import ffmpeg

import subprocess

# audio_pos_visualization_path = "C:\\develop\\saved_data\\audio_pos_visualization_data\\"
# hive_out = "C:\\develop\\saved_data\\"

TEST_MODE_LINX = False

IP_ADDRESS = "0.0.0.0"

# todo: if you want to test locally, change this path to your local test_data_folder
if TEST_MODE_LINX:
    BASE_PATH = "/Users/riordanalfredo/Desktop/research-softeng/teamwork-visualiser-dashboard/server/saved_data"
    # BASE_PATH = r"F:\code folder\data_cleaner\data"
else:
    BASE_PATH = "C:\\develop\\saved_data\\"

    app = Flask(__name__)


# folder_path, simulationid, handover_finish_time, secondary_nurses_enter_time, doctor_enter_time

def call_visualization(simulationid):
    """------------ extracting timestamps ------------------------"""
    # ================= commented out for testing ======================================
    # connect to the mongoDB. In 2022, we saved the three critical timestamps of phases in database.
    db_password = "5ZVy3RS0FIMcmTxn"  # REAL DB
    # db_password = "y2PbzzxLWFhdVzlD"  # TESTING DB
    # This section is to extract timestamps from database.
    client = MongoClient("mongodb+srv://admin:" + db_password +
                         "@cluster0.ravibmh.mongodb.net/app?retryWrites=true&w=majority")  # REAL
    #
    # client = MongoClient("mongodb+srv://devTeam:" + db_password +
    #                      "@cluster0.463hufx.mongodb.net/app?retryWrites=true&w=majority")  # TESTING

    db = client["app"]
    # db = client["test"]
    #
    simulation_obj = db.get_collection(
        "simulations").find_one({"simulationId": simulationid})
    #
    observation_obj = db.get_collection("observations").find_one(
        {"_id": simulation_obj["observation"]})

    # phase_dict = {"handover": , "bed_4":, "ward_nurse":, "met_doctor":}
    # dict.fromkeys(observation_obj["phases"], )
    # item["timestamp"]
    print("extracting timestamps for phases finished")

    # # handover_finish_time, secondary_nurses_enter_time, doctor_enter_time = 0, 0, 0
    for item in observation_obj["phases"]:
        if item["phaseKey"] == "handover_ends":
            # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            handover_finish_time = item["timestamp"].timestamp()
        elif item["phaseKey"] == "secondary_nurse_enters":
            # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            secondary_nurses_enter_time = item["timestamp"].timestamp()
        elif item["phaseKey"] == "doctor_enters":
            # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            doctor_enter_time = item["timestamp"].timestamp()
        elif item["phaseKey"] == "bed_4":
            pass

    # configuring the path of input and output
    session = simulationid
    data_dir = os.path.join(BASE_PATH, str(session))
    audio_folder = os.path.join(data_dir, "audio")
    positioning_data_folder = os.path.join(data_dir, "positioning_data")

    audio_start_timestamp = get_timestamp(os.path.join(data_dir, "sync.txt"))

    print(observation_obj)
    print(observation_obj["phases"])

    handover_finish_time -= audio_start_timestamp
    secondary_nurses_enter_time -= audio_start_timestamp
    doctor_enter_time -= audio_start_timestamp

    print(handover_finish_time, secondary_nurses_enter_time, doctor_enter_time)
    # all folder path will use call the initialising_folders to create the folder
    processed_pozyx_folder = initialising_folders(
        os.path.join(positioning_data_folder, "pozyx_json_csv"))
    raw_pozyx_data_folder = initialising_folders(
        os.path.join(positioning_data_folder, "raw_positioning"))
    raw_audio_folder = os.path.join(data_dir)
    processed_audio_folder = initialising_folders(
        os.path.join(audio_folder, "processed_audio"))

    hive_data_folder = initialising_folders(
        os.path.join(data_dir, "hive_data_folder"))
    # todo: audio files may be shared be between the social network or the hive
    hive_audio_data_folder = initialising_folders(
        os.path.join(hive_data_folder, "audio-sim"))
    hive_positioning_data_folder = initialising_folders(
        os.path.join(hive_data_folder, "pos"))
    hive_csv_output_folder = initialising_folders(
        os.path.join(hive_data_folder, "result"))
    # hive_all_output_folder = initialising_folders(
    #     os.path.join(data_dir, "result_to_copy"))

    result_dir = initialising_folders(os.path.join(data_dir, "result"))
    #
    json_csv_output_path = os.path.join(
        result_dir, "{}.csv".format(session))
    # raw_pozyx_data_path = os.path.join(raw_pozyx_data_folder, "{}.json".format(session))
    raw_pozyx_data_path = os.path.join(data_dir, "{}.json".format(session))
    sync_txt_path = os.path.join(data_dir, "sync.txt")

    # configuring the output path of images
    # visualisation_output_folder = initialising_folders(
    #     os.path.join(data_dir, "visualisation_output_path"))

    """------- copy sync.txt to result"""
    copy_file(sync_txt_path, result_dir)

    print("All data processing complete!")

    print("===== pozyx_json_to_csv started ========")
    pozyx_json_to_csv(session, raw_pozyx_data_path, json_csv_output_path)
    print("===== pozyx_json_to_csv finish =======")
    # plt.show()
    # plt.clf()

    # update in 2023. This is a new function to extract the starting time of Pozyx recording.
    positioning_start_timestamp = get_timestamp_from_sync(
        sync_txt_path, "positioning")
    audio_start_timestamp = get_timestamp_from_sync(sync_txt_path, "audio")
    #
    # if not os.path.exists(raw_audio_folder + "out"):
    #     os.mkdir(raw_audio_folder + "out")
    # if not os.path.exists(raw_audio_folder + "out\\audio-sim"):
    #     os.mkdir(raw_audio_folder + "out\\audio-sim")
    # if not os.path.exists(raw_audio_folder + "out\\pos"):
    #     os.mkdir(raw_audio_folder + "out\\pos")
    # if not os.path.exists(raw_audio_folder + "out\\result"):
    #     os.mkdir(raw_audio_folder + "out\\result")

    # print("-p " + positioning_data + " -o " + hive_out + " -s " + sync_txt_path)

    # this function is to generate a csv file folding all participants' positioning data in a session
    generate_single_file(raw_pozyx_path=raw_pozyx_data_path, output_folder_path=hive_positioning_data_folder,
                         audio_start_timestamp=audio_start_timestamp)
    # main(raw_pozyx_data_path, BASE_PATH + session + "\\out\\pos", sync_txt_path)

    print("generating positioning csv finish")
    print("""---------- generate csv files needed by hive ---------""")

    hive_data("RED", session, raw_audio_folder, processed_audio_folder, hive_positioning_data_folder,
              hive_csv_output_folder)
    hive_data("YELLOW", session, raw_audio_folder, processed_audio_folder, hive_positioning_data_folder,
              hive_csv_output_folder)
    hive_data("BLUE", session, raw_audio_folder, processed_audio_folder, hive_positioning_data_folder,
              hive_csv_output_folder)
    hive_data("GREEN", session, raw_audio_folder, processed_audio_folder, hive_positioning_data_folder,
              hive_csv_output_folder)
    hive_data("BLACK", session, raw_audio_folder, processed_audio_folder, hive_positioning_data_folder,
              hive_csv_output_folder)
    hive_data("WHITE", session, raw_audio_folder, processed_audio_folder, hive_positioning_data_folder,
              hive_csv_output_folder)

    # hive_csv_output_folder = data_dir + "out\\result"
    df = pd.concat(map(pd.read_csv, [
        '{}/{}_RED.csv'.format(hive_csv_output_folder, session),
        '{}/{}_YELLOW.csv'.format(hive_csv_output_folder, session),
        '{}/{}_BLUE.csv'.format(hive_csv_output_folder, session),
        '{}/{}_GREEN.csv'.format(hive_csv_output_folder, session)]), ignore_index=True)

    df = df.sort_values(by='audio time')

    # client_dir = "../client/src/projects/hive/data"
    df.to_csv("{}/{}_all.csv".format(result_dir, session),
              sep=',', encoding='utf-8', index=False)
    # plt.show()
    # plt.clf()
    print("""--------------generate sna csv---------------"""
          """----------------------------------------------------------""")

    sna_df, formation_dict = generate_sna_csv(BASE_PATH, session, processed_audio_folder, raw_pozyx_data_path,
                                              sync_txt_path, handover_finish_time, secondary_nurses_enter_time,
                                              doctor_enter_time)
    # remember to add a rename
    sna_df = change_name_of_black_and_white(sna_df)
    sna_df.to_csv(os.path.join(result_dir, "{}_sna.csv".format(session)))

    print("finish creating hive file.")

    """------- section to generate visualisation"""
    # This line calls the visualisation of the
    # main_IPA(json_csv_output_path, int(session), positioning_start_timestamp, 0, 4000,
    #          os.path.join(visualisation_output_folder, "teamwork.png"))
    # print("IPA finish")
    #
    # plt.show()
    # plt.clf()
    # moved to the new tool.
    # audio_visual(data_dir, simulationid, handover_finish_time, secondary_nurses_enter_time, doctor_enter_time,
    #              sync_txt_path)
    # print("audio_visual finish")
    #
    # plt.show()
    # plt.clf()

    """-------- section to transcode video"""
    # ffmpeg -i input.mp4 -c:v libx264 -c:a aac -strict experimental transcoded_output.mp4
    input_file = "{}/{}.mp4".format(data_dir, simulationid)
    output_file = "{}/transcoded_output.mp4".format(result_dir)

    ffmpeg_command = [
        "ffmpeg",
        "-i", input_file,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-strict", "experimental",
        output_file
    ]

    # Execute the FFmpeg command using subprocess
    try:
        subprocess.run(ffmpeg_command, check=True)
        print("Transcoding completed successfully.")
    except subprocess.CalledProcessError:
        print("Transcoding failed.")

    return "success"


# def test_formation_detection(simulationid):
#     """------------ extracting timestamps ------------------------"""
#     # ================= commented out for testing ======================================
#     # # connect to the mongoDB. In 2022, we saved the three critical timestamps of phases in database.
#     # # This section is to extract timestamps from database.
#     #
#     client = MongoClient("mongodb+srv://admin:" + Constant.MONGO_DB_PASSWD + "@cluster0.ravibmh.mongodb.net/app?retryWrites=true&w=majority")
#     #
#     db = client["app"]
#     #
#     simulation_obj = db.get_collection("simulations").find_one({"simulationId": simulationid})
#     #
#     observation_obj = db.get_collection("observations").find_one({"_id":simulation_obj["observation"]})
#     #
#     # phase_dict = {"handover": , "bed_4":, "ward_nurse":, "met_doctor":}
#     # # dict.fromkeys(observation_obj["phases"], )
#     # item["timestamp"]
#     print("extracting timestamps for phases finished")
#     #
#     # handover_finish_time, secondary_nurses_enter_time, doctor_enter_time = 0, 0, 0
#     for item in observation_obj["phases"]:
#         if item["phaseKey"] == "handover":
#             handover_finish_time = item["timestamp"].timestamp() #datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
#         elif item["phaseKey"] == "ward_nurse":
#             secondary_nurses_enter_time = item["timestamp"].timestamp()# datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
#         elif item["phaseKey"] == "met_doctor":
#             doctor_enter_time = item["timestamp"].timestamp() # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
#         elif item["phaseKey"] == "bed_4":
#             pass
#
#     """--------------generate task priority images---------------"""
#     """----------------------------------------------------------"""
#
#     # configuring the path of input and output
#     session = simulationid
#     data_dir = os.path.join(BASE_PATH, str(session))
#     audio_folder = os.path.join(data_dir, "audio")
#     positioning_data_folder = os.path.join(data_dir, "positioning_data")
#
#     # all folder path will use call the initialising_folders to create the folder
#     processed_pozyx_folder = initialising_folders(os.path.join(positioning_data_folder, "pozyx_json_csv"))
#     raw_pozyx_data_folder = initialising_folders(os.path.join(positioning_data_folder, "raw_positioning"))
#     raw_audio_folder = initialising_folders(os.path.join(audio_folder, "raw_audio"))
#     processed_audio_folder = initialising_folders(os.path.join(audio_folder, "processed_audio"))
#
#     hive_data_folder = initialising_folders(os.path.join(data_dir, "hive_data_folder"))
#     # todo: audio files may be shared be between the social network or the hive
#     hive_audio_data_folder = initialising_folders(os.path.join(hive_data_folder, "audio-sim"))
#     hive_positioning_data_folder = initialising_folders(os.path.join(hive_data_folder, "pos"))
#     hive_csv_output_folder = initialising_folders(os.path.join(hive_data_folder, "result"))
#
#     # todo: this one is using the processed pozyx data saved in the folder outside the data folder for each session
#     #   be sure to make the processed csv inside the each session data folder like. Just like the structure
#     #   in the test_data_folder
#     json_csv_output_path = os.path.join(processed_pozyx_folder, "{}.csv".format(session))
#     raw_pozyx_data_path = os.path.join(raw_pozyx_data_folder, "{}.json".format(session))
#     sync_txt_path = os.path.join(data_dir, "sync.txt")
#
#     # configuring the output path of images
#     visualisation_output_folder = initialising_folders(os.path.join(data_dir, "visualisation_output_path"))
#
#     print("===== pozyx_json_to_csv started ========")
#     pozyx_json_to_csv(session, raw_pozyx_data_path, json_csv_output_path)
#     print("===== pozyx_json_to_csv finish =======")
#     plt.show()
#     plt.clf()
#
#     # update in 2023. This is a new function to extract the starting time of Pozyx recording.
#     positioning_start_timestamp = get_timestamp_from_sync(sync_txt_path, "positioning")
#     audio_start_timestamp = get_timestamp_from_sync(sync_txt_path, "audio")
#     #
#     # if not os.path.exists(raw_audio_folder + "out"):
#     #     os.mkdir(raw_audio_folder + "out")
#     # if not os.path.exists(raw_audio_folder + "out\\audio-sim"):
#     #     os.mkdir(raw_audio_folder + "out\\audio-sim")
#     # if not os.path.exists(raw_audio_folder + "out\\pos"):
#     #     os.mkdir(raw_audio_folder + "out\\pos")
#     # if not os.path.exists(raw_audio_folder + "out\\result"):
#     #     os.mkdir(raw_audio_folder + "out\\result")
#
#     # print("-p " + positioning_data + " -o " + hive_out + " -s " + sync_txt_path)
#
#     # this function is to generate a csv file folding all participants' positioning data in a session
#     generate_single_file(raw_pozyx_path=raw_pozyx_data_path, output_folder_path=hive_positioning_data_folder,
#                          audio_start_timestamp=audio_start_timestamp)
#     # main(raw_pozyx_data_path, BASE_PATH + session + "\\out\\pos", sync_txt_path)
#
#     print("generating positioning csv finish")
#     """---------- generate csv files needed by hive ---------"""
#     handover_finish_time = 306.74
#     secondary_nurses_enter_time = 643.19
#     doctor_enter_time = 1177.84
#     # todo: ends here. Further code is not tested because the old social network will be updated.
#     audio_visual(data_dir, simulationid, handover_finish_time, secondary_nurses_enter_time, doctor_enter_time,
#                  sync_txt_path)
#     print("audio_visual finish")
#
#     return "success"


def hive_data(colour, session, raw_audio_folder, hive_audio_folder, hive_positioning_folder, hive_csv_output_folder):
    # colour = "YELLOW"
    # file_date = "18-Aug-2021_15-33-14-715"

    # ------- This section of code is to check whether the processed audio data is provided -------
    audio_in = None
    audio_out = None
    filename_list = os.listdir(raw_audio_folder)
    for filename in filename_list:
        if filename.startswith("simulation_" + colour):
            audio_in = os.path.join(raw_audio_folder, filename)
            audio_out = os.path.join(
                hive_audio_folder, "sim_" + colour + ".wav")
            break

    """Because we only saved the processed audio data, the audio_out is manually """
    if audio_out is None:
        audio_out = os.path.join(hive_audio_folder, "sim_" + colour + ".wav")
    # ------------------------------------------------------------------------------------
    # audio_in = "{}/simulation_{}_{}_audio.wav".format(raw_audio_folder, colour, file_date)
    # audio_out = "{}/sim_{}.wav".format(raw_audio_folder, colour)

    # print(audio_in)
    # print(audio_out)

    if not audio_in or not audio_out:
        print("please copy the audio files")
    # !ffmpeg - i {audio_in} - ar 48000 {audio_out}

    if os.path.exists(audio_out):
        os.remove(audio_out)
    # # --------------------------------------------------------------------------------------------------------
    #
    stream = ffmpeg.input(audio_in)
    audio = stream.audio
    # , 'acodec': 'flac'})
    stream = ffmpeg.output(audio, audio_out, **{'ar': '32000'})
    ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)

    # hive_audio_folder = raw_audio_folder + 'out\\audio-sim'
    # hive_positioning_folder = raw_audio_folder + 'out\\pos'
    audio_csv_out = "{}/{}_{}.csv".format(hive_audio_folder, session, colour)

    # % run hive_automation.py - a {audio_out} - o {audio_csv_out} - s "145" - w "1" - t "3"
    # todo: the code above here is for preprocessing the audio data, commented for testing.
    if colour in ("BLACK", "WHITE"):
        return
    """comment here to remove multithreding audio processing"""
    hive_main(audio_out, audio_csv_out, session, 1, 3)

    dfp = pd.read_csv(
        '{}/{}_{}.csv'.format(hive_positioning_folder, session, colour))
    dfa = pd.read_csv(
        '{}/{}_{}.csv'.format(hive_audio_folder, session, colour))

    dfp.head()

    res = pd.merge(dfp, dfa, on="audio time")
    final = res.drop(
        labels=["Unnamed: 0_x", "Unnamed: 0_y", "session"], axis=1)
    final['tagId'] = colour
    final.head()

    # hive_csv_output_folder = raw_audio_folder + "out\\result"
    result_csv = "{}/{}_{}.csv".format(hive_csv_output_folder, session, colour)
    final.to_csv(result_csv, sep=',', encoding='utf-8', index=False)


def copy_file(source_path, destination_path):
    try:
        # Perform the file copy operation
        shutil.copy(source_path, destination_path)
        print("File copied successfully.")
    except FileNotFoundError:
        print("Source file not found.")
    except PermissionError:
        print("Permission error. Check if you have the necessary permissions.")
    except Exception as e:
        print(f"An error occurred: {e}")


"""
send get request to localhost:5000/audio-pos
"""
if __name__ == '__main__':
    # app.run(host="0.0.0.0", port=5050, debug=False)

    call_visualization("296")
    # test_formation_detection("225")
    # os.system("ffmpeg -i {audio_in} - ar 48000 {audio_out}")

    # stream = ffmpeg.input("test.wav")
    # audio = stream.audio
    # stream = ffmpeg.output(audio, "result.wav", **{'ar': '48000'})#, 'acodec': 'flac'})
    # ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
