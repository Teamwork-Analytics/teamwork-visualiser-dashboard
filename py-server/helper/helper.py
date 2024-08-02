import nltk
import os
import shutil
import ffmpeg
import whisper
from ai_audio.audio_transcription.pozyx_extraction import get_timestamp
from ai_audio.changing_names import change_name_of_black_and_white
from ai_audio.main import auto_transcription_and_coding, generate_sna_csv, \
    auto_transcription_and_coding_without_force_alignment

from pymongo import MongoClient

nltk.download('punkt')
whisper_model_name = "large"  # @param ["medium.en", "small.en", "base.en", "large"]
use_force_alignment = False  # @param {type:"boolean"}
DATABASE_CONFIGURATION = "2023"


def initialising_folders(path):
    """
    This function receive the path, detect whether the path exists, if not create it.
    And return the path itself to save as a variable
    """

    if not os.path.exists(path):
        os.makedirs(path)
    return path


def get_critical_timestamps(the_session_id, destiniation_folder_workspace_path):
    db_password = "5ZVy3RS0FIMcmTxn"
    # This section is to extract timestamps from database.
    client = MongoClient(
        "mongodb+srv://admin:" + db_password + "@cluster0.ravibmh.mongodb.net/app?retryWrites=true&w=majority")
    #
    db = client["app"]
    #
    simulation_obj = db.get_collection("simulations").find_one({"simulationId": the_session_id})
    #
    observation_obj = db.get_collection("observations").find_one({"_id": simulation_obj["observation"]})

    # phase_dict = {"handover": , "bed_4":, "ward_nurse":, "met_doctor":}
    # dict.fromkeys(observation_obj["phases"], )
    # item["timestamp"]
    print("extracting timestamps for phases finished")

    if DATABASE_CONFIGURATION == "2022":
        # # handover_finish_time, secondary_nurses_enter_time, doctor_enter_time = 0, 0, 0
        for item in observation_obj["phases"]:
            if item["phaseKey"] == "handover":
                handover = item[
                    "timestamp"].timestamp()  # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            elif item["phaseKey"] == "ward_nurse":
                secondary = item[
                    "timestamp"].timestamp()  # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            elif item["phaseKey"] == "met_doctor":
                doctor = item[
                    "timestamp"].timestamp()  # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            elif item["phaseKey"] == "bed_4":
                pass
    elif DATABASE_CONFIGURATION == "2023":
        for item in observation_obj["phases"]:
            if item["phaseKey"] == "handover_ends":
                handover = item[
                    "timestamp"].timestamp()  # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            elif item["phaseKey"] == "secondary_nurse_enters":
                secondary = item[
                    "timestamp"].timestamp()  # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            elif item["phaseKey"] == "doctor_enters":
                doctor = item[
                    "timestamp"].timestamp()  # datetime.strptime(item["timestamp"], 'yyyy-MM-dd HH:mm:ss.SSS000').timestamp()
            elif item["phaseKey"] == "bed_4":
                pass
    else:
        raise ValueError(
            "Please enter a valid DATABASE_CONFIGURATION value. Current value: {}. Use the value provided in the list".format(
                DATABASE_CONFIGURATION))
    audio_start_timestamp = get_timestamp(os.path.join(destiniation_folder_workspace_path, the_session_id, "sync.txt"))

    print(observation_obj)
    print(observation_obj["phases"])

    handover -= audio_start_timestamp
    secondary -= audio_start_timestamp
    doctor -= audio_start_timestamp
    return handover, secondary, doctor


def run_auto_transcription_coding(data_folder, the_session_id, handover, secondary, doctor):
    # the_session_id = "416"  # @param {type:"string"}
    if use_force_alignment:
        coded_df = auto_transcription_and_coding(data_folder, the_session_id, handover, secondary, doctor,
                                                 whisper_model_name)
    else:
        sna_df, formation_dict = generate_sna_csv(data_folder, the_session_id, handover, secondary, doctor)

        sna_df = change_name_of_black_and_white(sna_df)
        # sna_df.to_csv("{}_sna.csv".format(the_session_id))
        sna_df.to_csv(os.path.join(data_folder, the_session_id, "result", "{}_sna.csv".format(the_session_id)))

        coded_df = auto_transcription_and_coding_without_force_alignment(data_folder, the_session_id, handover,secondary, doctor,whisper_model_name,formation_dict)

    coded_df = change_name_of_black_and_white(coded_df)
    # coded_df.to_csv("{}_network_data.csv".format(the_session_id))
    coded_df.to_csv(os.path.join(data_folder, the_session_id, "result",
                                 "{}_network_data.csv".format(the_session_id)))
