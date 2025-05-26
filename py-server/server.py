import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from ai_audio.audio_processing.cloud_transcription import output_path
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
from util.data_save_location_handler import *
from util.error_handling_util import build_http_error_response

app = Flask(__name__)
data_folder = config_data_save_location()
logger().info(f"data_saving_location: {data_folder}")
CORS(app)


@app.route("/generate_viz", methods=['GET'])
def call_viz():
    args = request.args
    try:
        simulationId = args["sessionId"]
        # call_visualization(simulationId)
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


@app.route("/get_teamwork_prio_data", methods=['GET'])
def give_prioritisation_test_data():
    """
    This function is to return the testing data for task prioritisation graph.
    The format of returned json is {"task allocation": {"task allocation": int, ...}, ...: {}, }
    :return:
    """
    args = request.args
    try:
        start_time = float(args["start"])
        end_time = float(args["end"])
        session_id = args["sessionId"]

        # todo: this path should be changed once used in actual scenario
        # file = "%s.csv" % session_id
        # dir_path = os.path.join(data_folder, session_id, "result")
        #
        # file_path = os.path.join(dir_path, file)
        # # test_data_path = "test_data/{}.csv".format(session_id)
        # # sync_data_path = dir_path / "sync.txt"
        # sync_data_path = os.path.join(dir_path, "sync.txt")
        #
        # positioning_start_timestamp = get_timestamp_from_sync(
        #     sync_data_path, "positioning")
        # processed_pozyx_data = pd.read_csv(file_path)
        #
        # # output_data = IPA_for_front_end(processed_pozyx_data, session_id, positioning_start_timestamp,
        # #                               start_time, end_time)
        #

        # get data -start and end time from rio
        output_data = get_task_prioritisation_graph_data(data_folder, session_id, start_time, end_time)
        return jsonify(output_data)
    except Exception:
        error_message = "Error happened when extracting GET params: maybe not all arguments are provided."
        logger().exception(error_message)
        return build_http_error_response(error_message, 500)


@app.route("/get_data", methods=['GET'])
def give_sna_test_data():
    """
    This function is to return the testing data for the sna graph
    The returned json is created by pandas, using "records" format.
    :return:
    """
    try:

        id = request.args['sessionId']
        start_time = float(request.args["start"])
        end_time = float(request.args["end"])
        doc_enter_time = float(request.args["doc_enter"])
        secondary_enter_time = float(request.args["secondary"])

        # file_new = "%s_sna.csv" % id
        # file_old = "%s_network_data.csv" % id
        # # file_path = DIRECTORY / id / "result" / file
        # file_path_old = os.path.join(data_folder, id, "result", file_old)
        # file_path_new = os.path.join(data_folder, id, "result", file_new)
        # # this is for backward compatibility. Previously we used _network_data, now we change the file name to _sna
        # if (os.path.exists(file_path_new)):
        #     file_path = file_path_new
        # else:
        #     file_path = file_path_old
        # df = pd.read_csv(file_path)
        # df = process_csv(df, start_time, end_time, doc_enter_time, secondary_enter_time,
        #                  do_filter=True)  # update with 2024 data
        # df.fillna("", inplace=True)
        # output_data = df.to_dict(orient="records")

        output_data = get_sna_graph_data(id, data_folder, start_time, end_time, doc_enter_time, secondary_enter_time)
        return jsonify(output_data)
    except Exception as e:
        error_message = "Network data is missing."
        logger().exception(error_message)
        return build_http_error_response(error_message, 500)


@app.route("/get_ena_data", methods=['GET'])
def give_ena_test_data():
    """
    This function is to return the testing data for mimic ena.
    The format of returned json is {"task allocation": {"task allocation": int, ...}, ...: {}, }
    :return:
    """
    try:
        id = request.args['sessionId']
        start_time = request.args["start"]
        end_time = request.args["end"]

        # file = "%s_network_data.csv" % id
        # # file_path = DIRECTORY / id / "result" / file
        # file_path = os.path.join(data_folder, id, "result", file)
        #
        # os.path.join(data_folder, os.sep, )
        # session_df = pd.read_csv(file_path)
        # # updated on 17/7/2023, merged the acknowledging and responding
        # __merging_codes(session_df, ["acknowledging",
        #                              "responding"], "acknowledging")
        #
        # session_view = session_df[
        #     (session_df["start_time"] >= float(start_time)) & (session_df["start_time"] <= float(end_time))]
        # window_size = 3
        # column_names = ["task allocation", "handover", "call-out", "escalation", "questioning", "acknowledging"]
        # output_data = calculate_ena_metric(session_view, window_size, column_names)

        output_data = get_ena_test_data(id, data_folder, start_time, end_time)
        return jsonify(output_data)
    except Exception as e:
        error_message = "ENA file not available"
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
