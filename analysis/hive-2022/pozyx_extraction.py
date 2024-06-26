"""
Extracting pozyx data
"""

import datetime
import getopt
import locale
import math
import os
import sys

import numpy as np
import pandas
import simplejson as json
from scipy import interpolate

# to make sure the timestamp conversion is correct
# !important! the timestamp conversion is influenced by the location setting of your OS
# double-check the setting if there is trouble of timestamp conversion
locale.setlocale(locale.LC_TIME, "en_US")

RED_ID = 27226
BLUE_ID = 27209
GREEN_ID = 27176    # before 318 green id is 27160
YELLOW_ID = 27263


# This function is about getting the
def get_hms_time_list(timestamp_array):
    new_time_list = []
    for a_time in timestamp_array:
        new_time_list.append(str(datetime.timedelta(seconds=int(a_time))))
    return new_time_list

def get_interpolated_data(data_frame, audio_start_timestamp: float):
    """
    using scipy to generate a interpolation model for the data points
    :param data_frame: data frame for a student
    :return: an scipy interpolation model
    """

    original_timestamp = np.array(data_frame["timestamp"])
    timestamp = original_timestamp - audio_start_timestamp
    pozyx_x = np.array(data_frame["x"])
    pozyx_y = np.array(data_frame["y"])

    interpolate_x = interpolate.interp1d(timestamp, pozyx_x, kind="linear")
    interpolate_y = interpolate.interp1d(timestamp, pozyx_y, kind="linear")

    timestamp_ints = np.array(range(math.ceil(min(timestamp)), int(max(timestamp)) + 1))
    audio_start_timestamp_list = [audio_start_timestamp for _ in range(len(timestamp_ints))]

    hms_timestamp = get_hms_time_list(timestamp_ints)

    ## plotting code for testing
    # start = 0
    # end = 10
    # testing_frame = timestamp_ints[start: end]
    # pl.plot(testing_frame, interpolate_x(testing_frame), ".")
    # pl.plot(timestamp[start: end], pozyx_x[start: end], label="x")
    # pl.legend(loc='lower right')
    # pl.show()
    #
    # pl.plot(testing_frame, interpolate_y(testing_frame), ".")
    # pl.plot(timestamp[start: end], pozyx_y[start: end], label="y")
    # pl.legend(loc='lower right')
    # pl.show()

    # pl.plot(timestamp_ints, interpolate_x(timestamp_ints), "--", label="inter")
    # pl.plot(timestamp, pozyx_x, label="x")
    # pl.legend(loc='lower right')
    # pl.show()
    #
    # pl.plot(timestamp_ints, interpolate_y(timestamp_ints), "--", label="inter")
    # pl.plot(timestamp, pozyx_y, label="y")
    # pl.legend(loc='lower right')
    # pl.show()

    # start = 0
    # end = 10
    # testing_frame = timestamp_ints[start: end]
    # pl.plot(testing_frame, interpolate_x(testing_frame), "-", color="red", label="inter")
    # pl.plot(timestamp[start: end], pozyx_x[start: end], label="x")
    # pl.legend(loc='lower right')
    # pl.show()
    #
    # pl.plot(testing_frame, interpolate_y(testing_frame), "-", color="red", label="inter")
    # pl.plot(timestamp[start: end], pozyx_y[start: end], label="y")
    # pl.legend(loc='lower right')
    # pl.show()



    interpolated_dataframe = pandas.DataFrame({
        "audio_start_timestamp": audio_start_timestamp_list,
        "audio time": hms_timestamp,
        "x": interpolate_x(timestamp_ints),
        "y": interpolate_y(timestamp_ints)
    })
    return interpolated_dataframe


def generate_poxyz_data_R(path: str):
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

    jsons = loading_json(path)
    for line in jsons:
        tag_id = int(line["tagId"])
        if tag_id in (BLUE_ID, GREEN_ID, YELLOW_ID, RED_ID):
            if bool(line["success"]):
                a_dict[tag_id]["timestamp"].append(line["timestamp"])
                a_dict[tag_id]["success"].append(line["success"])
                a_dict[tag_id]["x"].append(line["data"]["coordinates"]["x"])
                a_dict[tag_id]["y"].append(line["data"]["coordinates"]["y"])

    return a_dict


# "data/218/218.json"
def loading_json(path: str):
    json_list = []
    with open(path, "r") as f:
        lines = f.readlines()
        for line in lines:

            # this len > 3 is to prevent the lines only contain a \n or something else
            if len(line) > 3:
                string = line.strip()
                json_list.append(json.loads(string[1:-1]))
    return json_list


######################
#
# functions below are the ones you can directly use
###################
def generate_single_file(raw_pozyx_path: str, output_folder_path: str, sync_txt_path: str):
    """
    the function that would be call.
    It uses raw pozyx file to generate the positioning data for all the four students.
    The output files only contain the positioning data for every second.
    """

    # extract timestamp when the audio start to record
    audio_start_timestamp = get_timestamp(sync_txt_path)

    # extract pozyx data
    a_dict = generate_poxyz_data_R(raw_pozyx_path)
    blue = get_interpolated_data(a_dict[BLUE_ID], audio_start_timestamp)
    green = get_interpolated_data(a_dict[GREEN_ID], audio_start_timestamp)
    red = get_interpolated_data(a_dict[RED_ID], audio_start_timestamp)
    yellow = get_interpolated_data(a_dict[YELLOW_ID], audio_start_timestamp)
    color = ("blue", "green", "red", "yellow")

    print()
    file_name = os.path.basename(raw_pozyx_path).split(".")[0]
    if not os.path.exists(output_folder_path):
        os.makedirs(output_folder_path)
    for i, a_dict in enumerate([blue, green, red, yellow]):
        a_dict.to_csv(os.path.join(output_folder_path, "{}_{}.csv".format(file_name, color[i])))




def get_timestamp(sync_path: str):
    """
    for a specific sync file, read its start time data.
    :param sync_path: the path of sync.txt
    :return: the timestamp of when pozyx started
    """
    with open(sync_path) as f:
        sync_content = f.readlines()

    positioning_start_line = ""
    for line in sync_content:
        # find the line containing what we want
        if "audio start" in line:
            positioning_start_line = line

    time_string = positioning_start_line.split("_____")[1]
    # 01-Sep-2021_13-19-37-929 %d-%b-%Y-%H-%M-%S-%f
    date = datetime.datetime.strptime(time_string.strip(), "%Y-%m-%d_%H-%M-%S-%f")
    timestamp = datetime.datetime.timestamp(date)
    return timestamp


def main(argv):
    raw_pozyx_path = ""
    output_folder_path = ""
    sync_txt_path = ""
    opts, args = getopt.getopt(argv, "p:o:s:", ["pozyx_path=", "output_path=","sync_path"])
    for opt, arg in opts:
        if opt in ("-p", "--pozyx_path"):
            raw_pozyx_path = str(arg)
        if opt in ("-o", "--output_path"):
            output_folder_path = str(arg)
        if opt in ("-s", "--sync_path"):
            sync_txt_path = str(arg)
    if raw_pozyx_path == "" or output_folder_path == "" or sync_txt_path == "":
        print("error: audio_path and output_path and sync_txt path must have input value")
        return
    generate_single_file(raw_pozyx_path=raw_pozyx_path, output_folder_path=output_folder_path, sync_txt_path=sync_txt_path)


if __name__ == '__main__':
    ### example ###
    # generate_single_file("Rio/pozyx/182.json", "Rio/pozyx/")
    #
    # # code for extracting pozyx start timestamp
    # print(get_timestamp("pozyx test/sync.txt"))

    main(sys.argv[1:])
    # print(get_timestamp("Rio/pozyx/sync.txt"))
    print("all done!")
