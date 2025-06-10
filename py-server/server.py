import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# from ai_audio.audio_processing.cloud_transcription import output_path
from ena_replacement_algo import calculate_ena_metric, __merging_codes
from helper.helper import get_critical_timestamps, run_auto_transcription_coding
from helper.sna_algo import process_csv
from position.IPA import get_timestamp_from_sync
from position.IPA_wrapper import IPA_for_front_end
from refactor.ena_test_data.ena_test_data_management import get_ena_test_data
from refactor.prioritisation_test_data.prioritisation_test_data_management import get_task_prioritisation_graph_data
from refactor.sna_test_data.sna_test_data_management import get_sna_graph_data
from refactor.video_transcode.video_transcode_management import *
from refactor.visualisation.visualisation_audio_data.visualisation_management import *
from refactor.visualisation.visualisation_general.visualisation_management import generate_visualization
from util.data_saving_location_helper import set_data_save_location
from util.error_handling_util import build_http_error_response

app = Flask(__name__)
data_folder = set_data_save_location()
logger().info(f"data_saving_location: {data_folder}")
CORS(app)


@app.route("/generate_viz", methods=['GET'])
def call_viz():
    args = request.args
    try:
        simulationId = args["sessionId"]
        generate_visualization(simulationId)
        return "Visualisations have been generated.", 200
    except Exception as err:
        error_message = "Unable to generate visualisation. Check terminal"
        logger().exception(error_message)
        return build_http_error_response(error_message, 500)


@app.route("/generate_ena_viz", methods=['GET'])
def generate_viz_with_audio_data():
    args = request.args
    try:
        session_id = args["sessionId"]
        # handover, secondary, doctor = get_critical_timestamps(session_id, data_folder)
        # run_auto_transcription_coding(data_folder, session_id, handover, secondary, doctor)

        generate_visualization_with_audio_data(session_id, data_folder)
        return "Visualisations with audio data have been generated (SNA and ENA).", 200
    except Exception as err:
        error_message = "Unable to generate visualisation. Check terminal"
        logger().exception(error_message)
        return build_http_error_response(error_message, 500)


@app.route("/transcode_video", methods=['GET'])
def transcode_video_move_to_result():
    args = request.args
    try:
        session_id = args["sessionId"]
        current_data_folder = os.path.join(data_folder, str(session_id))
        result_dir = os.path.join(current_data_folder, "result")
        transcode_video(session_id, current_data_folder, result_dir)
        return "Video has been transcoded and available in {}.".format(result_dir), 200
    except Exception as err:
        error_message = "Unable to transcode video. Check terminal."
        logger().exception(error_message)
        return build_http_error_response(error_message, 500)



if __name__ == '__main__':
    # with open("output.json", "w") as fp:
    #     json.dump(give_test_data(), fp)
    # json_data = give_test_data()
    # print(give_test_data())
    # print()

    IP_ADDRESS = os.getenv('IP')  # this/local server
    print(IP_ADDRESS)
    PORT = "5003"
    app.run(host=IP_ADDRESS, port=PORT)
