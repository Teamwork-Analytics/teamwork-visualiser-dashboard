import math
import os.path

import pandas as pd

import plotly.express as px

from ai_audio.audio_transcription.pozyx_extraction import extract_interpolate_single_session, ID_TO_COLOR
from sklearn.metrics import precision_score
from sklearn.metrics import recall_score
from sklearn.metrics import accuracy_score
from sklearn.metrics import cohen_kappa_score


RECT_BOUNDARY = {
        "bed1": [0, 0, 3521, 5151],  # it is a rectangle space, format is (x0, y0, x1, y1)
        "bed2": [0, 4772, 3521, 8772],
        "bed3": [3521, 4091, 7000, 8772],
        "bed4": [3521, 0, 7000, 4091],
        # "IV left": [0, 8172, 3521, 10000],
        # "IV right": [3521, 8172, 7000, 10000],
        "IV": [0, 8772, 7000, 10000],
    }
CIRCLE_BOUNDARY = {
        "phone": [2986, 181, 700],  # format is (x, y, radius)
}
DATA_PATH_MAPPER = {"blue": "blue_per second.csv", "red": "red_per second.csv", "green": "green_per second.csv",
                    "yellow": "yellow_per second.csv"}


def generating_testing_data(density: int):
    """
    This function generate a 2d array contains the scatter points for testing
    @return:
    """
    ROOM_X_MAX = 7000
    ROOM_Y_MAX = 10000

    testing_data = {"x": [], "y": []}
    if ROOM_X_MAX % density != 0 or ROOM_Y_MAX % density != 0:
        raise ValueError("7000 and 9000 has remainder")
    for x in range(int(ROOM_X_MAX / density)):
        for y in range(int(ROOM_Y_MAX / density)):
            testing_data["x"].append(x * density)
            testing_data["y"].append(y * density)
            # testing_data["location"].append("")
    return pd.DataFrame(testing_data)


def generating_scatter_plot(df: pd.DataFrame, color_column: (list, None) = None):
    # fig = px.scatter_matrix(df,
    #     dimensions=["x", "y"],
    #     # color="species"
    # )
    if color_column is None:
        fig = px.scatter(df,
                         x='x',
                         y="y",
                         # dimensions=["x", "y"],
                         # color="species",
                         width=1300,
                         height=2000,
                         )
    else:
        fig = px.scatter(df,
                         x='x',
                         y="y",
                         # dimensions=["x", "y"],
                         color=color_column,
                         width=1300,
                         height=2000,
                         )
    # fig.update()
    fig.show()


def checking_foundation_locations(boundaries: dict, coordinate_df: pd.DataFrame):
    """
    These locations are the locations for beds, If students are not in any special locations, such as phone or IV place,
    they will be assigned at the bed locations
    @return:
    """
    for a_rect_space_name in boundaries:
        if len(boundaries[a_rect_space_name]) == 0:
            continue

        x0, y0, x1, y1 = boundaries[a_rect_space_name]

        selected = coordinate_df.loc[((coordinate_df["x"] >= x0) & (coordinate_df["x"] <= x1) &
                                      (coordinate_df["y"] >= y0) & (
                                              coordinate_df["y"] <= y1)), "location"] = a_rect_space_name
    return


# @Timers.calculate_time_effciecny
def checking_special_locations(boundaries: dict, coordinate_df: pd.DataFrame):
    """
    checking for the special locations, such as phone or IV place.
    @return:
    """
    for a_rect_space_name in boundaries:
        if len(boundaries[a_rect_space_name]) == 0:
            continue
        x, y, r = boundaries[a_rect_space_name]

        for i, row in coordinate_df.iterrows():
            x0 = row["x"]
            y0 = row["y"]
            if (x0 - x) ** 2 + (y0 - y) ** 2 <= r ** 2:
                coordinate_df.loc[i, "location"] = a_rect_space_name

    return


def load_coordinates(coordinate_path: str):
    coordinate_df = pd.read_csv(coordinate_path)


def __record_multiple_location_situation(record_dict, start_time, end_time, initiator, location, detected_locations):
    record_dict["start_time"].append(start_time)
    record_dict["end_time"].append(end_time)
    record_dict["initiator"].append(initiator)
    record_dict["location"].append(location)
    record_dict["detected_locations"].append(detected_locations)


def __record_location_for_accuracy_dict(record_dict, session_id, utterance_id, start_time, end_time, initiator,
                                        location, detected_locations):
    record_dict["the_session_id"].append(session_id)
    record_dict["utterance_id"].append(utterance_id)
    record_dict["start_time"].append(start_time)
    record_dict["end_time"].append(end_time)
    record_dict["initiator"].append(initiator)
    record_dict["location"].append(location)
    record_dict["detected_locations"].append(detected_locations)


def __test_with_ena_data():
    """
    This is the procedure of detecting the location of students
    @return:
    """
    ena_df = pd.read_excel("../../testing_data/ena_excel/A 15.xlsx")
    session_list = list(ena_df["the_session_id"].unique())


    # DATA_PATH_MAPPER = {"blue": "blue_per second.csv", "red": "red_per second.csv", "green": "green_per second.csv",
    #                     "yellow": "yellow_per second.csv", "white": "white_per second.csv",
    #                     "black": "black_per second.csv", }

    # remember location is manually labelled location, detected_locations is a string, in the format of:
    # {location}: {frequency}, ...
    multiple_location_appeared_in_one_utterance = {"start_time": [], "end_time": [], "initiator": [], "location": [],
                                                   "detected_locations": []}
    accuracy_testing_dict = {"the_session_id": [], "utterance_id": [], "start_time": [], "end_time": [],
                             "initiator": [], "location": [], "detected_locations": [], }
    positioning_data_folder_path = "../../testing_data/2021_2022_positioning_data"

    for a_session_id in session_list:
        a_session_view = ena_df[ena_df["the_session_id"] == a_session_id]
        data_df_dict = {}

        for a_student in DATA_PATH_MAPPER:
            loaded_df = pd.read_csv(
                os.path.join(positioning_data_folder_path, str(a_session_id), DATA_PATH_MAPPER[a_student]))
            loaded_df["location"] = "not determined"
            data_df_dict[a_student] = loaded_df

        for _, row in a_session_view.iterrows():
            start_time = row["start_time"]
            end_time = row["end_time"]
            initiator = row["initiator"]
            labelled_location = row["location"]
            utterance_id = row["utterance_id"]
            location = row["location"]

            if start_time == 614.3422:
                print()

            students_df = data_df_dict[initiator]
            time_frame: pd.DataFrame = pd.DataFrame(
                students_df[(students_df["audio_timestamp"] >= math.floor(start_time)) & (
                        students_df["audio_timestamp"] <= math.ceil(end_time))])
            checking_location(time_frame)

            multi_frequency_dict = time_frame["location"].value_counts().to_dict()

            if len(list(time_frame['location'].unique())) == 1:
                __record_location_for_accuracy_dict(accuracy_testing_dict, a_session_id, utterance_id, start_time,
                                                    end_time, initiator, location,
                                                    max(multi_frequency_dict, key=multi_frequency_dict.get))
            elif len(list(time_frame['location'].unique())) > 1:
                __record_multiple_location_situation(multiple_location_appeared_in_one_utterance, start_time, end_time,
                                                     initiator, labelled_location,
                                                     str(multi_frequency_dict))
                __record_location_for_accuracy_dict(accuracy_testing_dict, a_session_id, utterance_id, start_time,
                                                    end_time, initiator, location,
                                                    max(multi_frequency_dict, key=multi_frequency_dict.get))
            else:
                __record_multiple_location_situation(multiple_location_appeared_in_one_utterance, start_time, end_time,
                                                     initiator, labelled_location,
                                                     "empty time frame")
                # raise ValueError("No location determied, it can be outlier on the pozyx detection")

        # print()
    pd.DataFrame(multiple_location_appeared_in_one_utterance).to_excel(
        "../testing_data/testing_output/location_detection_multiple_location_record.xlsx")
    pd.DataFrame(accuracy_testing_dict).to_excel("../testing_data/testing_output/accuracy_test.xlsx")


def checking_location(data_row: pd.DataFrame):
    checking_foundation_locations(RECT_BOUNDARY, data_row)
    checking_special_locations(CIRCLE_BOUNDARY, data_row)


def assigning_conversation(data_df: pd.DataFrame, secondary_enter_timestamp: float, doctor_enter_timestamp: float):
    """
    This function should be used after the two detection function. This function will use their results to assign
    conversation id for classification of codes.
    @param data_df:
    @param secondary_enter_timestamp:
    @param doctor_enter_timestamp:
    @param output_path:
    @return:
    """
    location_conv_mapper = {
        "bed1": 10,  # it is a rectangle space, format is (x0, y0, x1, y1)
        "bed2": 20,
        "bed3": 30,
        "bed4": 40,
        "phone": 50,  # format is (x, y, radius)
        "IV": 60,
    }

    for a_name in location_conv_mapper:
        name_df = data_df[data_df["location"] == a_name]
        phase2_df = name_df[name_df["start_time"] < secondary_enter_timestamp]
        phase3_df = name_df[(name_df["start_time"] >= secondary_enter_timestamp) & (name_df["start_time"] < doctor_enter_timestamp)]
        phase4_df = name_df[name_df["start_time"] >= doctor_enter_timestamp]

        data_df.loc[phase2_df.index, "conversation_id"] = location_conv_mapper[a_name] + 1
        data_df.loc[phase3_df.index, "conversation_id"] = location_conv_mapper[a_name] + 2
        data_df.loc[phase4_df.index, "conversation_id"] = location_conv_mapper[a_name] + 3
    # data_df.to_excel("output_path.xlsx")


def __checking_accuracy_of_location_detection(file_path: str):
    accuracy_df = pd.read_excel("../../testing_data/testing_output/accuracy_test.xlsx")
    labelled = accuracy_df["location"]
    pred = accuracy_df["detected_locations"]
    result = {"accuracy": accuracy_score(labelled, pred),
              "precision": precision_score(labelled, pred, average="macro"),
              "recall": recall_score(labelled, pred, average="macro"),
              "kappa": cohen_kappa_score(labelled, pred)}
    pd.Series(result).to_excel("../testing_data/testing_output/location_detection_metrics.xlsx")


def __assign_a_location_for_empty_timeframe(a_session_df: pd.DataFrame, student_color: str, loc_id: int):
    """
    look backward
    @param a_session_df:
    @param loc_id:
    @return:
    """

    offset = 1
    found = True
    a_session_view = a_session_df[a_session_df["initiator"] == student_color]
    iloc_index = a_session_view.index.get_loc(loc_id)

    while found :
        if iloc_index - offset < 0:
            break
        if a_session_df.loc[a_session_view.index[iloc_index - offset], "location"] != "not determined":
            a_session_df.loc[loc_id, "location"] = a_session_df.loc[a_session_view.index[iloc_index - offset], "location"]
            return

        offset = offset + 1
    # raise ValueError("cannot find a proper location for this row: {}".format(loc_id))
    print("cannot find a proper location for this row: {}".format(loc_id))
    a_session_df.loc[loc_id, "location"] = "not in the room"
    return


def assigning_location_in_ena_data(a_session_df: pd.DataFrame, session_id: int, processed_location_dict: dict):
    data_df_dict = {}

    for a_student_id in ID_TO_COLOR:
        loaded_df = processed_location_dict[int(a_student_id)]
        loaded_df["location"] = "not determined"
        data_df_dict[ID_TO_COLOR[a_student_id]] = loaded_df

    for i, row in a_session_df.iterrows():
        start_time = row["start_time"]
        end_time = row["end_time"]
        initiator = row["initiator"]
        labelled_location = row["location"]
        utterance_id = row["utterance_id"]
        location = row["location"]

        students_df = data_df_dict[initiator]
        time_frame: pd.DataFrame = pd.DataFrame(
            students_df[(students_df["audio_timestamp"] >= math.floor(start_time)) & (
                    students_df["audio_timestamp"] <= math.ceil(end_time))])
        checking_location(time_frame)

        multi_frequency_dict = time_frame["location"].value_counts().to_dict()

        # if start_time == 365.97:
        #     breakpoint()

        # when only one location available, if it is not "not determined", then assign the value
        # if not, use the closest location as detected location and assign to it
        if len(list(time_frame['location'].unique())) == 1:
            detected_location = max(multi_frequency_dict, key=multi_frequency_dict.get)
            if detected_location != "not determined":
                a_session_df.loc[i, "location"] = detected_location
            else:
                print("applied the closest to row: {}, of session: {}".format(i, session_id))
                __assign_a_location_for_empty_timeframe(a_session_df, initiator, i)

        # when more than one location available, if the most frequent one is "not determined",
        # use the second largest as detected location and assign to it
        elif len(list(time_frame['location'].unique())) > 1:
            detected_location = max(multi_frequency_dict, key=multi_frequency_dict.get)
            if detected_location != "not determined":
                a_session_df.loc[i, "location"] = detected_location
            else:
                del multi_frequency_dict[detected_location]
                a_session_df.loc[i, "location"] = max(multi_frequency_dict, key=multi_frequency_dict.get)

        else:
            print("applied the closest to row: {}, of session: {}".format(i, session_id))
            __assign_a_location_for_empty_timeframe(a_session_df, initiator, i)
            # raise ValueError("No location determied, it can be outlier on the pozyx detection")


def __testing_with_245():
    data_df = pd.read_excel("../../testing_data/245/transcriptions/transcriptions.xlsx")
    timestamp_df = pd.read_excel("../../testing_data/2021_2022_timestamps.xlsx")
    session_id = 245

    # todo: this part of timestamp should be changed once integrate to the main function
    secondary = timestamp_df.loc[timestamp_df["the_session_id"] == 245, "2. four students"].iloc[0]
    doctor = timestamp_df.loc[timestamp_df["the_session_id"] == 245, "3. four students plus a doctor"].iloc[0]

    location_dict = extract_interpolate_single_session("../../testing_data/245/245.json", sync_txt_path="../testing_data/245/sync.txt")

    assigning_location_in_ena_data(data_df, session_id, location_dict)
    assigning_conversation(data_df, secondary_enter_timestamp=secondary, doctor_enter_timestamp=doctor)
    data_df.to_excel("conved_245.xlsx")
    # breakpoint()

if __name__ == '__main__':
    # testing the rectangle method
    iris = px.data.iris()
    testing_data = generating_testing_data(50)
    testing_data["location"] = "not determined"

    timestamp_df = pd.read_excel("../../testing_data/2021_2022_timestamps.xlsx")
    # generating_scatter_plot(testing_data, color_column=None)

    # checking_location(testing_data)
    # generating_scatter_plot(testing_data, color_column="location")
    # assigning_conversation(testing_data)

    # testing with 245 data, it is also used for coding the session
    # todo: do the same thing to all the data used for training the model.
    __testing_with_245()

    # generate the accuracy_testing.xlsx, this file will be used for calculating the accuracy of location detection.
    # testing with data
    __test_with_ena_data()

    # calculate the accuracy
    __checking_accuracy_of_location_detection("../../testing_data/testing_output/accuracy_test.xlsx")

    print()
