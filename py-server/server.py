import json
from flask_cors import CORS
from flask import Flask, jsonify, request
import pandas as pd
from ena_replacement_algo import calculate_ena_metric, __merging_codes
from position.IPA import get_timestamp_from_sync
from position.IPA_wrapper import IPA_for_front_end
from data_cleaner.main import call_visualization
import boto3
from io import StringIO

IP_ADDRESS = "0.0.0.0"  # this/local server
PORT = "5003"
AWS_ACCESS_KEY_ID = 'AKIAZUNIQFBIBE4PH6H2'
AWS_SECRET_ACCESS_KEY = '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'
BUCKET_NAME = 'teamwork-dashboard-visualisation'

app = Flask(__name__)
CORS(app)
s3 = boto3.client('s3', region_name='ap-southeast-4', aws_access_key_id=AWS_ACCESS_KEY_ID, aws_secret_access_key=AWS_SECRET_ACCESS_KEY)


def read_from_s3(bucket, file_name):
    """Fetches a file from S3 and returns a Pandas DataFrame"""
    csv_obj = s3.get_object(Bucket=bucket, Key=file_name)
    csv_string = csv_obj['Body'].read().decode('utf-8')
    df = pd.read_csv(StringIO(csv_string))
    return df

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

    # Get the sync data from S3
    sync_data_file = f"{session_id}/result/sync.txt"
    sync_data_content = read_from_s3(BUCKET_NAME, sync_data_file)
    
    if isinstance(sync_data_content, pd.DataFrame):
        csv_str = sync_data_content.to_csv(index=False)  # Convert DataFrame to CSV string
        sync_data_io = StringIO(csv_str)
    else:
        # Convert sync data string to StringIO (assuming it's a string)
        sync_data_io = StringIO(sync_data_content)

    # Get the timestamp
    positioning_start_timestamp = get_timestamp_from_sync(sync_data_io.getvalue(), "positioning")

    file = f"{session_id}.csv"
    processed_pozyx_content = read_from_s3(BUCKET_NAME, f"{session_id}/result/{file}")

    # Check the type of processed_pozyx_content
    if isinstance(processed_pozyx_content, pd.DataFrame):
        processed_pozyx_df = processed_pozyx_content
    else:  # Assuming it's a string, convert it to a DataFrame
        processed_pozyx_df = pd.read_csv(StringIO(processed_pozyx_content))

    output_data = IPA_for_front_end(processed_pozyx_df, session_id, positioning_start_timestamp, start_time, end_time)
    
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
        file_new = f"{id}_sna.csv"
        file_old = f"{id}_network_data.csv"
        
        # Checking if the new file exists
        try:
            df = read_from_s3(BUCKET_NAME, f"{id}/result/{file_new}")
        except:
            df = read_from_s3(BUCKET_NAME, f"{id}/result/{file_old}")
        
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

    file = f"{id}_network_data.csv"
    session_df = read_from_s3(BUCKET_NAME, f"{id}/result/{file}")

    __merging_codes(session_df, ["acknowledging", "responding"], "acknowledging")
    session_df.drop(["call-out", "handover"], axis=1, inplace=True)

    session_view = session_df[
        (session_df["start_time"] >= float(start_time)) & (session_df["start_time"] <= float(end_time))]
    window_size = 3
    output_data = calculate_ena_metric(session_view, window_size)

    return jsonify(output_data)


if __name__ == '__main__':
    app.run(host=IP_ADDRESS, port=PORT)
