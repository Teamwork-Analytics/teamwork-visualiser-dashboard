import pandas as pd
import numpy as np


# updated on 7/17/2023, because the responding and acknowledging os merged as one single acknowledging
# CODE_TO_ID_MAPPER = {"task allocation": 0, "escalation": 1, "questioning": 2,
#                      "acknowledging": 3}
# ID_TO_CODE_MAPPER = ["task allocation", "escalation", "questioning",
#                      "acknowledging"]
# CODE_TO_ID_MAPPER = {"task allocation": 0, "handover": 1, "call-out": 2, "escalation": 3, "questioning": 4,
#                        "acknowledging": 5}
# ID_TO_CODE_MAPPER = ["task allocation", "handover", "call-out", "escalation", "questioning",
#                      "acknowledging"]

# CODE_TO_ID_MAPPER = {"task allocation": 0, "handover": 1, "call-out": 2, "escalation": 3, "questioning": 4,
#                      "responding": 5, "acknowledging": 6}
# ID_TO_CODE_MAPPER = ["task allocation", "handover", "call-out", "escalation", "questioning", "responding",
#                      "acknowledging"]


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
    CODE_TO_ID_MAPPER = {"task allocation": 0, "escalation": 1, "questioning": 2,
                         "acknowledging": 3}
    ID_TO_CODE_MAPPER = ["task allocation", "escalation", "questioning",
                         "acknowledging"]

    result_json = {}
    d2_list = adjacent_matrix.tolist()
    print(d2_list)
    for i in range(len(d2_list)):
        result_json[ID_TO_CODE_MAPPER[i]] = {}

        for j in range(len(d2_list[i])):
            result_json[ID_TO_CODE_MAPPER[i]][ID_TO_CODE_MAPPER[j]] = d2_list[i][j]
    return result_json


def adjacent_matrix_to_json_6codes(adjacent_matrix: np.ndarray):
    CODE_TO_ID_MAPPER = {"task allocation": 0, "handover": 1, "call-out": 2, "escalation": 3, "questioning": 4,
                         "acknowledging": 5}
    ID_TO_CODE_MAPPER = ["task allocation", "handover", "call-out", "escalation", "questioning",
                         "acknowledging"]

    result_json = {}
    d2_list = adjacent_matrix.tolist()
    for i in range(len(d2_list)):
        result_json[ID_TO_CODE_MAPPER[i]] = {}

        for j in range(len(d2_list[i])):
            result_json[ID_TO_CODE_MAPPER[i]][ID_TO_CODE_MAPPER[j]] = d2_list[i][j]
    return result_json


def __merging_codes(data_df: pd.DataFrame, codes_to_merge: list, merge_to_column: str):
    merged_series = pd.Series(data_df[codes_to_merge[0]])
    for i in range(1, len(codes_to_merge)):
        merged_series = merged_series | data_df[codes_to_merge[i]]
    data_df[merge_to_column] = merged_series
    for a_code in codes_to_merge:
        if a_code == merge_to_column:
            continue
        data_df.drop([a_code], axis=1, inplace=True)


def removing_code(data_df: pd.DataFrame, codes_to_remove: list):
    data_df.drop(codes_to_remove, axis=1, inplace=True)


def _calculate_matrix(data_df: pd.DataFrame, stanza_window_size: int, column_names: list, initiator_utter_ids=None):
    if initiator_utter_ids is None:
        initiator_utter_ids = data_df.index.tolist()
    conversation_list = list(data_df["conversation_id"].unique())
    matrix_size = len(column_names)

    summed_matrix = np.zeros((matrix_size, matrix_size))

    for a_conversation in conversation_list:
        a_conv_df = data_df[data_df["conversation_id"] == a_conversation]
        stanza_size_in_use = stanza_window_size
        row_num = a_conv_df.shape[0]
        break_after_run = False
        for i, row in a_conv_df.iterrows():
            # changes according to the individual level graph,
            # only the rows contained in the initiator_utter_ids will be used in the summed list
            use_for_ena = False

            iloc = a_conv_df.index.get_loc(i)
            break_after_run = False
            if iloc + stanza_window_size > row_num:
                if iloc == 0:
                    break_after_run = True
                    stanza_size_in_use = row_num
                else:
                    break
            rows_loc = []
            for j in range(stanza_size_in_use):
                df_id = a_conv_df.index[iloc + j]
                rows_loc.append(df_id)
                if df_id in initiator_utter_ids:
                    use_for_ena = True
            # if all rows were not in the initiator_utter_ids, ignore these rows, continue
            if not use_for_ena:
                continue

            stanzas = a_conv_df.loc[rows_loc, column_names]

            stanzas_sum = np.array(stanzas.sum().apply(to_binary).to_list())
            summed_matrix += array_to_adjacent_matrix(stanzas_sum)
            # breakpoint()
            if break_after_run:
                break

    if summed_matrix.shape[0] == 4:
        return adjacent_matrix_to_json(summed_matrix)
    elif summed_matrix.shape[0] == 6:
        return adjacent_matrix_to_json_6codes(summed_matrix)
    else:
        raise ValueError(
            "The shape of the weight adjacent matrix is not 4 or 6, it is {}".format(summed_matrix.shape[0]))


def calculate_ena_metric_individual_contribution(data_df: pd.DataFrame, stanza_window_size: int, column_names: list,
                                                 initiator: str):
    data_df.sort_values(by=["conversation_id", "start_time"], inplace=True)
    df_loc_id_set = set()
    for a_conversation_id in data_df["conversation_id"].unique():
        contribution_set = set()
        a_conversation_df = data_df[data_df["conversation_id"] == a_conversation_id]
        selected_df = a_conversation_df[a_conversation_df["initiator"] == initiator]
        # get loc
        selected_indices = selected_df.index
        # translate loc to iloc, because loc may not continuous in selected df.
        for a_df_id in selected_indices:
            contribution_set.add(a_conversation_df.index.get_loc(a_df_id))
        # select the rows that close to these selected rows
        student_rows_list = list(contribution_set)
        for idx in student_rows_list:
            contribution_set.update(range(max(0, idx - (stanza_window_size - 1)),
                                          min(a_conversation_df.shape[0], idx + stanza_window_size)))
        # translate back to loc id, to select the rows using the original df loc id
        for a_iloc in contribution_set:
            df_loc_id_set.add(a_conversation_df.index[a_iloc])
    individual_contribution_df = pd.DataFrame(data_df.loc[list(df_loc_id_set)])
    individual_contribution_df.sort_values(by=["conversation_id", "start_time"], inplace=True)

    return _calculate_matrix(data_df, stanza_window_size, column_names, initiator_utter_ids=list(df_loc_id_set))


def calculate_ena_metric(data_df: pd.DataFrame, stanza_window_size: int, column_names: list):
    data_df.sort_values(by=["conversation_id", "start_time"], inplace=True)
    return _calculate_matrix(data_df, stanza_window_size, column_names)


if __name__ == '__main__':
    all_df = pd.read_excel("../test_data/149_ena_testing.xlsx")
    window_size = 3
    __merging_codes(all_df, ["acknowledging", "responding"], "acknowledging")
    all_df.drop(["call-out", "handover"], axis=1, inplace=True)
    session_view = pd.DataFrame(all_df[all_df["session_id"] == 149])
    calculate_ena_metric(session_view, window_size)