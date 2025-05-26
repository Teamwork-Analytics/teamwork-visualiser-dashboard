import os

import pandas as pd

from refactor.ena_test_data.ena_replacement_algo import __merging_codes, calculate_ena_metric


def get_ena_test_data(id: str, data_folder, start_time, end_time):
    file = "%s_network_data.csv" % id
    file_path = os.path.join(data_folder, id, "result", file)
    os.path.join(data_folder, os.sep, )
    session_df = pd.read_csv(file_path)
    # updated on 17/7/2023, merged the acknowledging and responding
    __merging_codes(session_df, ["acknowledging",
                                 "responding"], "acknowledging")
    session_view = session_df[
        (session_df["start_time"] >= float(start_time)) & (session_df["start_time"] <= float(end_time))]
    window_size = 3
    column_names = ["task allocation", "handover", "call-out", "escalation", "questioning", "acknowledging"]
    output_data = calculate_ena_metric(session_view, window_size, column_names)
    return output_data
