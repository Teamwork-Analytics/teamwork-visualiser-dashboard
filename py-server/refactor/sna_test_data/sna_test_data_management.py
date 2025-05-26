import os

import pandas as pd


def get_sna_graph_data(id: str, data_folder, start_time, end_time, doc_enter_time, secondary_enter_time):
    file_new = "%s_sna.csv" % id
    file_old = "%s_network_data.csv" % id
    # file_path = DIRECTORY / id / "result" / file
    file_path_old = os.path.join(data_folder, id, "result", file_old)
    file_path_new = os.path.join(data_folder, id, "result", file_new)
    # this is for backward compatibility. Previously we used _network_data, now we change the file name to _sna
    if (os.path.exists(file_path_new)):
        file_path = file_path_new
    else:
        file_path = file_path_old
    df = pd.read_csv(file_path)
    df = _process_csv(df, start_time, end_time, doc_enter_time, secondary_enter_time,
                     do_filter=True)  # update with 2024 data
    df.fillna("", inplace=True)
    output_data = df.to_dict(orient="records")
    return output_data


def _process_csv(df: pd.DataFrame, start_time: float, end_time: float, doc_enter_time: float,
                secondary_enter_time: float, do_filter: bool) -> pd.DataFrame:
    def filter_doctor_in_receiver(row):
        if "doctor" in row["receiver"] and row["start_time"] < doc_enter_time:
            splited = row["receiver"].split(",")
            return ",".join([name for name in splited if name != "doctor"])
        return row["receiver"]

    def filter_secondary_in_receiver(row: pd.Series):
        if ("green" in row["receiver"] or "yellow" in row["receiver"]) and row["start_time"] < secondary_enter_time:
            splited: list = row["receiver"].split(",")
            if "yellow" in splited:
                splited.remove("yellow")
            if "green" in splited:
                splited.remove("green")
            return ",".join(splited)
        return row["receiver"]

    # select based on start and end
    time_selected = pd.DataFrame(df[(df["start_time"] > start_time) & (df["end_time"] < end_time)])
    # filter doctor initiator
    if do_filter:
        time_selected = pd.DataFrame(time_selected.drop(time_selected[(time_selected["start_time"] < doc_enter_time) &
                                                                      (time_selected["initiator"] == "doctor")].index))
        time_selected = pd.DataFrame(
            time_selected.drop(time_selected[(time_selected["start_time"] < secondary_enter_time) &
                                             ((time_selected["initiator"] == "yellow") | (
                                                         time_selected["initiator"] == "green"))].index))
    # filter doctor receiver
    if time_selected.shape[0] != 0:
        if do_filter:
            time_selected["receiver"] = time_selected.apply(filter_doctor_in_receiver, axis=1)
            time_selected["receiver"] = time_selected.apply(filter_secondary_in_receiver, axis=1)
    else:
        time_selected = pd.DataFrame(df.iloc[0:1])
        time_selected.at[0, "start_time"] = 0
        time_selected.at[0, "end_time"] = 0
        time_selected.at[0, "duration"] = 0
        time_selected.at[0, "initiator"] = "blue"
        time_selected.at[0, "text"] = "place holder dummy data"
    return time_selected
