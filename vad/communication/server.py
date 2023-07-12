import json
from flask_cors import CORS
from flask import Flask, jsonify, request
import pandas as pd
from ena_replacement_algo import calculate_ena_metric
from pathlib import Path


app = Flask(__name__)
DIRECTORY = Path("../../server/saved_data/")

CORS(app)


@app.route("/get_data", methods=['GET'])
def give_sna_test_data():
    """
    This function is to return the testing data for the sna graph
    The returned json is created by pandas, using "records" format.
    :return:
    """
    try:
        id = request.args['sessionId']
        file = "%s_network_data.csv" % id
        file_path = DIRECTORY / id / file
        df = pd.read_csv(file_path)
        df.fillna("", inplace=True)
        output_data = df.to_dict(orient="records")
        return jsonify(output_data)
    except Exception:
        print("Error happened when extracting GET params: maybe not all arguments are provided.")
        return "error"


@app.route("/get_ena_data", methods=['GET'])
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
    file_path = DIRECTORY / id / file
    session_df = pd.read_csv(file_path)
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
    app.run(host="49.127.16.8")
