import os

import pandas as pd

from refactor.ena_test_data.ena_replacement_algo import __merging_codes, removing_code, calculate_ena_metric

def get_ena_test_data(id: str, data_folder, start_time, end_time):
    file = "%s_network_data.csv" % id
    file_path = os.path.join(data_folder, id, "result", file)
    os.path.join(data_folder, os.sep, )
    session_df = pd.read_csv(file_path)
    # updated on 17/7/2023, merged the acknowledging and responding
    __merging_codes(session_df, ["acknowledging",
                                 "responding"], "acknowledging")
    removing_code(session_df, ["handover"])
    session_view = session_df[
        (session_df["start_time"] >= float(start_time)) & (session_df["start_time"] <= float(end_time))]
    window_size = 3
    column_names = ["task allocation",  "call-out", "escalation", "questioning", "acknowledging"]
    output_data = calculate_ena_metric(session_view, window_size, column_names)
    return output_data

def get_ena_barchart_data(id: str, data_folder, start_time, end_time):
    file = "%s_network_data.csv" % id
    file_path = os.path.join(data_folder, id, "result", file)
    os.path.join(data_folder, os.sep, )
    session_df = pd.read_csv(file_path)
    # updated on 17/7/2023, merged the acknowledging and responding
    ## !!!!!! update here to change the response code.
    COLUMNS_TO_SUM = [
        "task allocation", "sharing information", "escalation", "questioning", "handover",
        "acknowledgment", "responding"
    ]

    # This one returns the code response of each student
    # return jsonify(session_df.groupby('initiator')[COLUMNS_TO_SUM].sum().to_dict('index'))
    # This one return a sum of responses per student
    return session_df[COLUMNS_TO_SUM].sum().to_dict()
