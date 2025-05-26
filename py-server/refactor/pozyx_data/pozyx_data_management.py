import datetime
import json
import os
import numpy as np
import pandas
from scipy import interpolate
import math

from refactor.helper.sync_file_processor import get_timestamp_from_sync
from util.logging_util import logger

RED_ID = 27226
BLUE_ID = 27209
# before 318 green id is 27160
GREEN_ID = 27176
YELLOW_ID = 27263


def _get_hms_time_list(timestamp_array):
    """
        Converts an array of timestamps (in seconds) into a list of human-readable time strings in HH:MM:SS format.

        Args:
            timestamp_array (list[int | float]): An array of timestamps in seconds.

        Returns:
            list[str]: A list of formatted time strings (HH:MM:SS).
        """
    new_time_list = []
    for a_time in timestamp_array:
        new_time_list.append(str(datetime.timedelta(seconds=int(a_time))))
    return new_time_list


def generate_positioning_csv_files(hive_positioning_data_folder, raw_pozyx_data_path, sync_txt_path):
    """
        Generates CSV files containing positioning data based on raw Pozyx data and synchronization information.

        This function:
        - Extracts positioning and audio start timestamps from a synchronization file.
        - Processes raw Pozyx data and generates interpolated CSV files for positioning data.
        - Logs key timestamps and the status of file generation.

        Args:
            hive_positioning_data_folder (str): Path to the folder where the generated positioning CSV files will be saved.
            raw_pozyx_data_path (str): Path to the raw Pozyx data file.
            sync_txt_path (str): Path to the synchronization file.

        Returns:
            tuple[float, float]:
                - `positioning_start_timestamp`: The extracted start timestamp for positioning data.
                - `audio_start_timestamp`: The extracted start timestamp for audio data.

        Logs:
            - Key timestamps for positioning and audio.
            - Successful generation of CSV files.
        """
    positioning_start_timestamp = get_timestamp_from_sync(
        sync_txt_path, "positioning")
    audio_start_timestamp = get_timestamp_from_sync(sync_txt_path, "audio")
    _generate_pozyx_csv_files(raw_pozyx_path=raw_pozyx_data_path, output_folder_path=hive_positioning_data_folder,
                              audio_start_timestamp=audio_start_timestamp)
    logger().info(f"positioning_start_timestamp:{positioning_start_timestamp}")
    logger().info(f"audio_start_timestamp:{audio_start_timestamp}")
    logger().info("generating positioning csv finished")
    logger().info(f"csv files successfully created under {hive_positioning_data_folder}")
    return positioning_start_timestamp, audio_start_timestamp


def _generate_pozyx_csv_files(raw_pozyx_path: str, output_folder_path: str, audio_start_timestamp: float):
    """
        Generates CSV files from Pozyx raw data for all tracked entities.

        Args:
            raw_pozyx_path (str): Path to the raw Pozyx data file.
            output_folder_path (str): Path to save the generated CSV files.
            audio_start_timestamp (float): Audio start timestamp for data alignment.
        """

    # extract timestamp when the audio start to record

    # extract pozyx data
    a_dict = _generate_poxyz_data_R(raw_pozyx_path)

    print(audio_start_timestamp)
    print(a_dict[BLUE_ID])
    blue = _get_interpolated_data(a_dict[BLUE_ID], audio_start_timestamp)
    green = _get_interpolated_data(a_dict[GREEN_ID], audio_start_timestamp)
    red = _get_interpolated_data(a_dict[RED_ID], audio_start_timestamp)
    yellow = _get_interpolated_data(a_dict[YELLOW_ID], audio_start_timestamp)
    color = ("blue", "green", "red", "yellow")

    print("Finish interpolating data")
    file_name = os.path.basename(raw_pozyx_path).split(".")[0]
    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)
    for i, a_dict in enumerate([blue, green, red, yellow]):
        a_dict.to_csv(os.path.join(output_folder_path, "{}_{}.csv".format(file_name, color[i])))


def _get_interpolated_data(data_frame, audio_start_timestamp: float):
    """
    Generates interpolated data for each second using timestamps and coordinates.

    Args:
        data_frame (DataFrame): Raw data for a tracked entity.
        audio_start_timestamp (float): Audio start timestamp for data alignment.

    Returns:
        DataFrame: Interpolated data for every second.
    """

    original_timestamp = np.array(data_frame["timestamp"])
    timestamp = original_timestamp - audio_start_timestamp
    pozyx_x = np.array(data_frame["x"])
    pozyx_y = np.array(data_frame["y"])

    if len(pozyx_x) == 0 or len(pozyx_y) == 0:
        pozyx_x = np.array([-10000, -10000])
        pozyx_y = np.array([-10000, -10000])
        timestamp = np.array([0, 1])

    interpolate_x = interpolate.interp1d(timestamp, pozyx_x, kind="linear")
    interpolate_y = interpolate.interp1d(timestamp, pozyx_y, kind="linear")

    timestamp_ints = np.array(range(math.ceil(min(timestamp)), int(max(timestamp)) + 1))
    audio_start_timestamp_list = [audio_start_timestamp for _ in range(len(timestamp_ints))]

    hms_timestamp = _get_hms_time_list(timestamp_ints)

    interpolated_dataframe = pandas.DataFrame({
        "audio_start_timestamp": audio_start_timestamp_list,
        "audio time": hms_timestamp,
        "x": interpolate_x(timestamp_ints),
        "y": interpolate_y(timestamp_ints)
    })
    return interpolated_dataframe


def _generate_poxyz_data_R(path: str):
    """
        Processes Pozyx JSON data and extracts timestamp, success status, and coordinates (x, y)
        for specific tag IDs (Blue, Red, Green, Yellow).

        Args:
            path (str): Path to the Pozyx raw JSON file.

        Returns:
            dict: A dictionary where keys are tag IDs (e.g., Blue, Red, Green, Yellow)
                  and values are dictionaries containing extracted data.
                  Example:
                  {
                      BLUE_ID: {
                          "timestamp": [...],
                          "success": [...],
                          "x": [...],
                          "y": [...]
                      },
                      ...
                  }
        """

    def gen_sub_dict():
        another_dict = {}
        another_dict["timestamp"] = []
        another_dict["success"] = []
        another_dict["x"] = []
        another_dict["y"] = []
        return another_dict

    a_dict = {}
    a_dict[BLUE_ID] = gen_sub_dict()
    a_dict[RED_ID] = gen_sub_dict()
    a_dict[GREEN_ID] = gen_sub_dict()
    a_dict[YELLOW_ID] = gen_sub_dict()

    jsons = _loading_json(path)
    for line in jsons:
        tag_id = int(line["tagId"])
        if tag_id in (BLUE_ID, GREEN_ID, YELLOW_ID, RED_ID):
            if bool(line["success"]):
                a_dict[tag_id]["timestamp"].append(line["timestamp"])
                a_dict[tag_id]["success"].append(line["success"])
                a_dict[tag_id]["x"].append(line["data"]["coordinates"]["x"])
                a_dict[tag_id]["y"].append(line["data"]["coordinates"]["y"])

    return a_dict


def pozyx_json_to_csv(session_id, pozyx_json_path, output_path):
    """
        Converts Pozyx JSON data into a CSV file for visualization.

        Args:
            session_id (str): Session identifier for the current processing run.
            pozyx_json_path (str): Path to the Pozyx raw JSON file.
            output_path (str): Path where the resulting CSV file will be saved.

        Returns:
            None
        """
    a_dict = _generate_poxyz_data_J_visualization(pozyx_json_path, session_id)
    blue = pandas.DataFrame(a_dict)
    blue.to_csv(output_path)


def _generate_poxyz_data_J_visualization(path: str, session_id):
    """
        Extracts detailed Pozyx JSON data for visualization, including timestamp, coordinates (x, y, z),
        orientation (yaw, roll, pitch), latency, and success status.

        Args:
            path (str): Path to the Pozyx raw JSON file.
            session_id (str): Unique identifier for the current session.

        Returns:
            dict: A dictionary containing detailed extracted data for visualization. Example structure:
                  {
                      "timestamp": [...],
                      "x": [...],
                      "y": [...],
                      "z": [...],
                      "yaw": [...],
                      "roll": [...],
                      "pitch": [...],
                      "latency": [...],
                      "student": [...],
                      "session": [...],
                      "success": [...]
                  }
        """

    def gen_sub_dict():

        another_dict = {}
        another_dict["timestamp"] = []
        another_dict["x"] = []
        another_dict["y"] = []
        another_dict["z"] = []
        another_dict["yaw"] = []
        another_dict["roll"] = []
        another_dict["pitch"] = []
        another_dict["latency"] = []
        another_dict["student"] = []
        another_dict["session"] = []
        another_dict["success"] = []
        return another_dict

    a_dict = gen_sub_dict()
    jsons = _loading_json(path)

    for line in jsons:
        tag_id = int(line["tagId"])
        if tag_id in (BLUE_ID, GREEN_ID, YELLOW_ID, RED_ID):
            if bool(line["success"]):
                a_dict["timestamp"].append(line["timestamp"])
                a_dict["x"].append(line["data"]["coordinates"]["x"])
                a_dict["y"].append(line["data"]["coordinates"]["y"])
                a_dict["z"].append(line["data"]["coordinates"]["z"])
                a_dict["yaw"].append(line["data"]["orientation"]["yaw"])
                a_dict["roll"].append(line["data"]["orientation"]["roll"])
                a_dict["pitch"].append(line["data"]["orientation"]["pitch"])
                a_dict["latency"].append(line["data"]["metrics"]["latency"])
                a_dict["session"].append(session_id)
                a_dict["success"].append("TRUE")
                if tag_id == BLUE_ID:
                    a_dict["student"].append("blue")
                elif tag_id == GREEN_ID:
                    a_dict["student"].append("green")
                elif tag_id == RED_ID:
                    a_dict["student"].append("red")
                elif tag_id == YELLOW_ID:
                    a_dict["student"].append("yellow")
                else:
                    raise ValueError("tag id error")
    return a_dict


def _loading_json(path: str):
    """
        Loads and parses a Pozyx JSON file, extracting individual JSON objects.

        Args:
            path (str): Path to the Pozyx JSON file.

        Returns:
            list[dict]: A list of parsed JSON objects.
    """
    json_list = []

    with open(path, "r", encoding="utf8") as f:
        lines = f.readlines()
        for line in lines:
            if len(line) > 3:
                string = line.strip()
                json_list.append(json.loads(string[1:-1]))
    return json_list
