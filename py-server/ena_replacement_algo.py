import pandas as pd
import numpy as np


CODE_TO_ID_MAPPER = {"task allocation": 0, "handover": 1, "call-out": 2,
                     "escalation": 3, "questioning": 4, "responding": 5, "acknowledging": 6}
ID_TO_CODE_MAPPER = ["task allocation", "handover", "call-out",
                     "escalation", "questioning", "responding", "acknowledging"]


def to_binary(x):
    if x > 0:
        return 1
    else:
        return 0


def array_to_adjacent_matrix(array: np.array):
    """
    create the adjacent matrix from the stanza row
    :param array:
    :return:
    """
    adjacent_matrix = np.zeros((len(array), len(array)))
    for i in range(len(array)):

        current = array[i]
        if current == 0:
            continue

        for j in range(len(array)):
            if i == j:
                continue

            other = array[j]
            if other == 1:
                adjacent_matrix[i, j] = 1

    return adjacent_matrix


def scaling_adjacent_matrix(matrix: np.ndarray):
    pass


def adjacent_matrix_to_json(adjacent_matrix: np.ndarray):
    result_json = {}
    d2_list = adjacent_matrix.tolist()
    for i in range(len(d2_list)):
        result_json[ID_TO_CODE_MAPPER[i]] = {}

        for j in range(len(d2_list[i])):
            result_json[ID_TO_CODE_MAPPER[i]
                        ][ID_TO_CODE_MAPPER[j]] = d2_list[i][j]
    return result_json


def calculate_ena_metric(data_df: pd.DataFrame, stanza_window_size: int):
    # data_df.sort_values(by=["conversation_id", "start_time"], inplace=True)

    conversation_list = list(data_df["conversation_id"].unique())
    matrix_size = data_df.columns.get_loc(
        "acknowledging") - data_df.columns.get_loc("task allocation") + 1
    summed_matrix = np.zeros((matrix_size, matrix_size))

    for a_conversation in conversation_list:
        a_conv_df = data_df[data_df["conversation_id"] == a_conversation]

        row_num = a_conv_df.shape[0]
        for i, row in a_conv_df.iterrows():
            iloc = a_conv_df.index.get_loc(i)

            if iloc + stanza_window_size >= row_num:
                break
            rows_loc = []
            for j in range(stanza_window_size):
                rows_loc.append(a_conv_df.index[iloc + j])
            stanzas = a_conv_df.loc[rows_loc,
                                    "task allocation": "acknowledging"]

            stanzas_sum = np.array(stanzas.sum().apply(to_binary).to_list())
            summed_matrix += array_to_adjacent_matrix(stanzas_sum)
            # breakpoint()

    return adjacent_matrix_to_json(summed_matrix)
