import os

from flask import request
from pymongo import MongoClient

from auto_coding_transcription_runner import run_auto_transcription_coding
from ai_audio.audio_transcription.pozyx_extraction import get_timestamp

DATABASE_CONFIGURATION = "2023"
data_folder = ""

def get_critical_timestampe(the_session_id, destiniation_folder_workspace_path):
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
    audio_start_timestamp = get_timestamp(os.path.join(destiniation_folder_workspace_path, "sync.txt"))

    print(observation_obj)
    print(observation_obj["phases"])

    handover -= audio_start_timestamp
    secondary -= audio_start_timestamp
    doctor -= audio_start_timestamp
    return handover, secondary, doctor


def mock_flask_method():
    args = request.args
    try:
        start_time = float(args["start"])
        end_time = float(args["end"])
        session_id = args["session"]
    except Exception:
        print("Error happened when extracting GET params: maybe not all arguments are provided.")
        return "Error happened when extracting GET params: maybe not all arguments are provided."

    # todo: this path should be changed once used in actual scenario
    handover, secondary, doctor = get_critical_timestampe()
    run_auto_transcription_coding(data_folder, session_id, handover, secondary, doctor)
    return jsonify(output_data)
