import pandas as pd


def process_csv(df: pd.DataFrame, start_time: float, end_time: float, doc_enter_time: float) -> pd.DataFrame:
    def filter_doctor_in_receiver(row):
        if "doctor" in row["receiver"] and row["start_time"] < doc_enter_time:
            splited = row["receiver"].split(",")
            return ",".join([name for name in splited if name != "doctor"])
        return row["receiver"]

    # select based on start and end
    time_selected = pd.DataFrame(df[(df["start_time"] > start_time) & (df["end_time"] < end_time)])
    # filter doctor initiator
    time_selected = time_selected.drop(time_selected[(time_selected["start_time"] < doc_enter_time) & (time_selected["initiator"] == "doctor")].index)
    # filter doctor receiver
    if time_selected.shape[0] != 0:
        time_selected["receiver"] = time_selected.apply(filter_doctor_in_receiver, axis=1)
    else:
        time_selected = pd.DataFrame(df.iloc[0:1])
        time_selected.at[0, "start_time"] = 0
        time_selected.at[0, "end_time"] = 0
        time_selected.at[0, "duration"] = 0
        time_selected.at[0, "initiator"] = "blue"
        time_selected.at[0, "text"] = "place holder dummy data"    
    
    return time_selected