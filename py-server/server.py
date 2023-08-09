import json
from flask_cors import CORS
from flask import Flask, jsonify, request
import pandas as pd
from ena_replacement_algo import calculate_ena_metric, __merging_codes
from position.IPA import get_timestamp_from_sync
from position.IPA_wrapper import IPA_for_front_end
from data_cleaner.main import call_visualization
import os

from pathlib import Path

IP_ADDRESS = "0.0.0.0"  # this/local server
PORT = "5003"

app = Flask(__name__)
TEST_MODE_LINX = False
if TEST_MODE_LINX:
    DIRECTORY = "/Users/riordanalfredo/Desktop/research-softeng/teamwork-visualiser-dashboard/server/saved_data"
else:
    DIRECTORY = "C:\\develop\\saved_data\\"


CORS(app)


@ app.route("/generate_viz", methods=['GET'])
def call_viz():
    """
    This function is to run a script to clean data and generates visualisation
    """
    args = request.args
    try:
        simulationId = args["sessionId"]
        call_visualization(simulationId)
    except Exception as err:
        print(err)
        error_message = "Unable to generate visualisation. Check terminal."
        print(error_message)
        return error_message, 500

    return "Visualisations have been generated.", 200


@ app.route("/get_teamwork_prio_data", methods=['GET'])
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
    except Exception:
        error_message = "Error happened when extracting GET params: maybe not all arguments are provided."
        print(error_message)
        return error_message, 500

    # todo: this path should be changed once used in actual scenario
    file = "%s.csv" % session_id
    # dir_path = DIRECTORY / session_id / "result"
    dir_path = os.path.join(DIRECTORY, session_id, "result")

    # file_path = dir_path / file
    file_path = os.path.join(dir_path, file)
    # test_data_path = "test_data/{}.csv".format(session_id)
    # sync_data_path = dir_path / "sync.txt"
    sync_data_path = os.path.join(dir_path, "sync.txt")

    positioning_start_timestamp = get_timestamp_from_sync(
        sync_data_path, "positioning")
    processed_pozyx_data = pd.read_csv(file_path)
    # session_id_int = int(session_id)  # TODO: please change me!

    output_data = IPA_for_front_end(processed_pozyx_data, session_id, positioning_start_timestamp,
                                    start_time, end_time)
    return jsonify(output_data)


@ app.route("/get_data", methods=['GET'])
def give_sna_test_data():
    """
    This function is to return the testing data for the sna graph
    The returned json is created by pandas, using "records" format.
    :return:
    """
    try:
        id = request.args['sessionId']
        file = "%s_network_data.csv" % id
        # file_path = DIRECTORY / id / "result" / file
        file_path = os.path.join(DIRECTORY, id, "result", file)
        df = pd.read_csv(file_path)
        df.fillna("", inplace=True)
        output_data = df.to_dict(orient="records")
        return jsonify(output_data)
    except Exception:
        message = "Network data is missing."
        print(message)
        return message, 500


@ app.route("/get_ena_data", methods=['GET'])
def give_ena_test_data():
    """
    This function is to return the testing data for mimic ena.
    The format of returned json is {"task allocation": {"task allocation": int, ...}, ...: {}, }
    :return:
    """

    id = request.args['sessionId']
    start_time = request.args["start"]
    end_time = request.args["end"]

    file = "%s_network_data.csv" % id
    # file_path = DIRECTORY / id / "result" / file
    file_path = os.path.join(DIRECTORY, id, "result", file)

    os.path.join(DIRECTORY, os.sep, )
    session_df = pd.read_csv(file_path)
    # updated on 17/7/2023, merged the acknowledging and responding
    __merging_codes(session_df, ["acknowledging",
                    "responding"], "acknowledging")

    session_view = session_df[
        (session_df["start_time"] >= float(start_time)) & (session_df["start_time"] <= float(end_time))]
    window_size = 3
    output_data = calculate_ena_metric(session_view, window_size)

    # session_view = pd.DataFrame(all_df[all_df["session_id"] == id])
    # output_data = calculate_ena_metric(all_df, window_size)

    return jsonify(output_data)


if __name__ == '__main__':
    # with open("output.json", "w") as fp:
    #     json.dump(give_test_data(), fp)
    # json_data = give_test_data()
    # print(give_test_data())
    # print()
    app.run(host=IP_ADDRESS, port=PORT)
