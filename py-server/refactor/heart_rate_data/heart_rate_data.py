import numpy as np
import pandas as pd
import os
import time

from refactor.helper.sync_file_processor import get_timestamp_from_sync

# TODO is there a config file with all constants?
HEART_RATE_PREFIX = "heart rate"
HEART_RATE_PREFIX_SEP = HEART_RATE_PREFIX + "-"
HEART_RATE_PROCESSING_MSG = "Processing heart rate for: %s"
SERVER_TIME_COLUMN = "Server Time"
HEART_RATE_VALUE_COLUMN = "Value"
HEART_RATE_BASELINE_KEY = "Baseline"
HEART_RATES_KEY = "Values"
SERVER_TIMESTAMP = "server_timestamp"
SERVER_TIMESTAMP_RELATIVE = "server_timestamp_relative"
FILE_SUFFIX = ".csv"
TAG_ID = "tagId"
HEART_RATE_DATA_RESULT_PATH = f"%s_heart_rate_data{FILE_SUFFIX}"


def process_heart_rate_data(session_id: int, data_dir: str, sort_by_timestamp: bool = True, session_start_timestamp: float = None):

    data_dir_with_session = os.path.join(data_dir, str(session_id))

    heart_rate_data = pd.DataFrame()
    for f_heart_rate_file in os.listdir(data_dir_with_session):
        if HEART_RATE_PREFIX in f_heart_rate_file:
            f_heart_rate_filename = os.path.basename(f_heart_rate_file)
            colour = f_heart_rate_filename.removeprefix(HEART_RATE_PREFIX_SEP).removesuffix(FILE_SUFFIX)

            print(HEART_RATE_PROCESSING_MSG % colour)

            heart_rate_data_colour = pd.read_csv(os.path.join(data_dir_with_session, f_heart_rate_filename))
            heart_rate_data_colour[SERVER_TIMESTAMP] = pd.to_datetime(heart_rate_data_colour[SERVER_TIME_COLUMN]).apply(lambda x: x.timestamp())
            heart_rate_data_colour[TAG_ID] = colour
            heart_rate_data = pd.concat([heart_rate_data, heart_rate_data_colour])

    if (SERVER_TIME_COLUMN in heart_rate_data.columns) and sort_by_timestamp:
        heart_rate_data = heart_rate_data.sort_values(by=[SERVER_TIME_COLUMN])

    if session_start_timestamp is None:
        session_start_timestamp = heart_rate_data[SERVER_TIMESTAMP].min()  # If none get the first available timestamp

    # TODO: try to find why we need to add this one hour
    heart_rate_data[SERVER_TIMESTAMP_RELATIVE] = heart_rate_data[SERVER_TIMESTAMP] - session_start_timestamp + 3600

    return heart_rate_data


def retrieve_heart_rate_data(session_id: int, data_dir: str, start_time: float, end_time: float):
    # TODO should it be filtered by session start, by colors? This can be done in the UI/Client
    data_dir_with_session = os.path.join(data_dir, str(session_id))

    heart_rate_data_filename = HEART_RATE_DATA_RESULT_PATH % session_id
    heart_rate_data_path = os.path.join(data_dir_with_session, "result", heart_rate_data_filename)

    heart_rate_data_df = pd.read_csv(heart_rate_data_path)
    # If relative data is above 0, it's because the value is larger than session start timestamp.
    heart_rate_data_df_filter = heart_rate_data_df[heart_rate_data_df[SERVER_TIMESTAMP_RELATIVE] >= 0]
    heart_rate_data_df_filter = heart_rate_data_df_filter[(heart_rate_data_df_filter[SERVER_TIMESTAMP_RELATIVE] >= start_time) & (heart_rate_data_df_filter[SERVER_TIMESTAMP_RELATIVE] <= end_time)]

    heart_rate_data_df_filter = heart_rate_data_df_filter.groupby(TAG_ID)
    heart_rate_data_df = heart_rate_data_df.groupby(TAG_ID)

    dict_to_return = {}

    for group_key, group_df in heart_rate_data_df_filter:
        group_df_dict = group_df[[SERVER_TIMESTAMP, SERVER_TIMESTAMP_RELATIVE, HEART_RATE_VALUE_COLUMN]].T.to_dict()
        dict_to_return[group_key] = {HEART_RATES_KEY: [v for k,v in group_df_dict.items()]}

        baseline_heart_rate = heart_rate_data_df.get_group(group_key)[HEART_RATE_VALUE_COLUMN].head(1)
        if baseline_heart_rate.empty:
            baseline_heart_rate = 0
        else:
            baseline_heart_rate = baseline_heart_rate.item()

        dict_to_return[group_key][HEART_RATE_BASELINE_KEY] =  baseline_heart_rate # the first value will be the baseline


    return dict_to_return

