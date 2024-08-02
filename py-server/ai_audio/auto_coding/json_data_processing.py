"""
this script is to process the conversation data saved in json files into a dataset
"""
import copy
import json
import os
import re

import pandas as pd
from nltk.tokenize import sent_tokenize


def merging_all_data(json_by_codes_folder_path: str):
    merged_data = {}
    for a_file in os.listdir(json_by_codes_folder_path):
        session_id = a_file.split(".")[0]
        with open(os.path.join(json_by_codes_folder_path, a_file)) as fp:
            readed_data = json.load(fp)
        for a_code in readed_data:
            a_json_key = session_id + "_" + str(a_code)
            if a_json_key not in merged_data:
                merged_data[a_json_key] = []
            merged_data[a_json_key] += readed_data[a_code]

    # clean the empty conversations
    cleaned_dict = {}
    for a_key in merged_data:
        if len(merged_data[a_key]) > 0:
            cleaned_dict[a_key] = merged_data[a_key]

    return cleaned_dict


def split_content_into_multiple_elements(a_json_content: dict) -> list:
    """
    example: {
            "text": "Maybe we can run a set of vitals for Ruth here.",
            "style": "task allocation",
            "row": 6,
            "initiator": "red",
            "receiver": "blue"
        }
    :param a_json_content:
    :return: a list of json content to be added to result list
    """
    result_list = []
    for a_sentence in sent_tokenize(a_json_content["text"].strip()):
        for a_phrase in a_sentence.split(","):
            if bool(re.search(r"^[\såäöÅÄÖ&()+%/*$€é,?!.'\"-]*$", a_phrase)):
                # empty string, just ignore it
                continue

            result_list.append({"text": a_phrase.strip(),
                                "style": a_json_content["style"],
                                "row": a_json_content["row"],
                                "initiator": a_json_content["initiator"],
                                "receiver": a_json_content["receiver"]})

    return result_list


def merging_all_data_and_break_into_phrases(json_by_codes_folder_path: str):
    merged_data = {}
    for a_file in os.listdir(json_by_codes_folder_path):
        session_id = a_file.split(".")[0]
        with open(os.path.join(json_by_codes_folder_path, a_file)) as fp:
            readed_data = json.load(fp)
        for a_conversation_id in readed_data:
            a_json_key = session_id + "_" + str(a_conversation_id)
            if a_json_key not in merged_data:
                merged_data[a_json_key] = []

            for content in readed_data[a_conversation_id]:
                merged_data[a_json_key] += split_content_into_multiple_elements(content)


    # clean the empty conversations
    cleaned_dict = {}
    for a_key in merged_data:
        if len(merged_data[a_key]) > 0:
            cleaned_dict[a_key] = merged_data[a_key]

    return cleaned_dict


def adding_context_to_merged(merged_data: dict, context_window: int = 2):
    color_to_name_dict = {"blue": "student A: ",
                          "red": "student B: ",
                          "green": "student C: ",
                          "yellow": "student D: ",
                          "white": "doctor: ",
                          "black": "patient relative: "}
    merged_data_copy = copy.deepcopy(merged_data)

    for a_conversat in merged_data:
        for index, an_utterance in enumerate(merged_data[a_conversat]):
            # adding previous lines when trying to classification
            text_result = []
            iteration_range = range(max(index - context_window, 0), index + 1)
            for _ in range(context_window - len(iteration_range) + 1):
                text_result.append("N/A")
            for i in iteration_range:
                text_result.append(
                    color_to_name_dict[merged_data[a_conversat][i]["initiator"]] + merged_data[a_conversat][i]["text"])
            merged_data_copy[a_conversat][index]["text"] = " \n\n ".join(text_result)
    return merged_data_copy


dataset = {"conversation_id": [], "utterance_id": [], "text": [], "initiator": [], "receiver": []}
codes = ["task allocation", "provision of handover information", "situation assessment", "escalation",
         "information sharing", "planning", "information requesting", "responding to request", "agreement",
         "disagreement", "checking-back"]


def export_merged_to_excel(merged, export_path: str):
    for an_code in codes:
        dataset[an_code] = []

    for an_conversation in merged:
        for an_utterance in merged[an_conversation]:
            dataset["text"].append(an_utterance["text"])
            dataset["conversation_id"].append(an_conversation)
            dataset["utterance_id"].append(an_utterance["row"])
            dataset["initiator"].append(an_utterance["initiator"])
            dataset["receiver"].append(an_utterance["receiver"])

            for an_code in codes:
                if an_code == an_utterance["style"]:
                    dataset[an_code].append(1)
                else:
                    dataset[an_code].append(0)
    return pd.DataFrame(dataset).to_excel(export_path)


def ena_data_for_adding_context(data_path: str, context_window: int, output_path):
    a_df = pd.read_excel(data_path)
    color_to_name_dict = {"blue": "student A: ",
                          "red": "student B: ",
                          "green": "student C: ",
                          "yellow": "student D: ",
                          "white": "doctor: ",
                          "black": "patient relative: "}

    merged_data = {}
    for _, row in a_df.iterrows():

        conversation = str(row['the_session_id']) + "_" + str(row['conversation_id'])

        if conversation not in merged_data:
            merged_data[conversation] = []
        merged_data[conversation].append([row["content"], row[13:24].tolist(), row["initiator"], row["receiver"]])

    res_dict = copy.deepcopy(merged_data)
    for a_conversat in merged_data:
        for index, an_utterance in enumerate(merged_data[a_conversat]):
            # adding previous lines when trying to classification
            text_result = []
            iteration_range = range(max(index - context_window, 0), index + 1)
            for _ in range(context_window - len(iteration_range) + 1):
                text_result.append("N/A")
            for i in iteration_range:
                text_result.append(
                    color_to_name_dict[merged_data[a_conversat][i][2]] + merged_data[a_conversat][i][0])
            res_dict[a_conversat][index][0] = " \n\n ".join(text_result)

    output_dict = {"conversation": [], "text": [], "task allocation": [], "provision of handover information": [],
                   "situation assessment": [], "escalation": [], "information sharing": [], "planning": [],
                   "information requesting": [], "responsing to request": [], "agreement": [], "disagreement": [],
                   "checking-back": []}
    for a_conversat in res_dict:
        for index, an_utterance in enumerate(res_dict[a_conversat]):
            output_dict["conversation"].append(a_conversat)
            output_dict["text"].append(an_utterance[0])
            output_dict["task allocation"].append(an_utterance[1][0])
            output_dict["provision of handover information"].append(an_utterance[1][1])
            output_dict["situation assessment"].append(an_utterance[1][2])
            output_dict["escalation"].append(an_utterance[1][3])
            output_dict["information sharing"].append(an_utterance[1][4])
            output_dict["planning"].append(an_utterance[1][5])
            output_dict["information requesting"].append(an_utterance[1][6])
            output_dict["responsing to request"].append(an_utterance[1][7])
            output_dict["agreement"].append(an_utterance[1][8])
            output_dict["disagreement"].append(an_utterance[1][9])
            output_dict["checking-back"].append(an_utterance[1][10])
    res_df = pd.DataFrame(output_dict)
    res_df.to_excel(output_path)
    res_df.to_excel(output_path)


def excel_data_for_adding_context(a_df: pd.DataFrame, context_window: int, with_label: bool = True):
    """
    changed code for processing the 6 code version of data
    :param data_path:
    :param context_window:
    :param output_path:
    :return:
    """
    color_to_name_dict = {"blue": "student A: ",
                          "red": "student B: ",
                          "green": "student C: ",
                          "yellow": "student D: ",
                          "white": "doctor: ",
                          "black": "patient relative: "}

    code_list = ["task allo and plann", "escalation", "info sharing and situ assess",
                 "provision of handover information",
                 "information requesting", "responding to request", "agreement"]

    merged_data = {}
    for _, row in a_df.iterrows():
        # this conversation id is already processed as the_session_id + conversation_id
        conversation = str(row['conversation_id'])
        if conversation not in merged_data:
            merged_data[conversation] = []

        a_utterance_list = [row["text"], row["initiator"], row["receiver"], row["the_session_id"], row["conversation_id"],
                            row["utterance_id"]]
        code_dict = {}
        for a_code in code_list:
            code_dict[a_code] = row[a_code]
        a_utterance_list.append(code_dict)
        merged_data[conversation].append(a_utterance_list)

    res_dict = copy.deepcopy(merged_data)
    for a_conversat in merged_data:
        for index, an_utterance in enumerate(res_dict[a_conversat]):
            # adding previous lines when trying to classification
            text_result = []
            iteration_range = range(max(index - context_window, 0), index + 1)
            this_student = merged_data[a_conversat][index][1]

            for _ in range(context_window - len(iteration_range) + 1):
                text_result.append("N/A")
            for i in iteration_range:
                # 2023 2 20 use this student / other student to represent the student instead of color.
                if this_student == merged_data[a_conversat][i][1]:
                    text_result.append("This student: " + merged_data[a_conversat][i][0])
                else:
                    text_result.append("Other student: " + merged_data[a_conversat][i][0])
            res_dict[a_conversat][index][0] = " \n\n ".join(text_result)

    output_dict = {"the_session_id": [], "conversation_id": [], "utterance_id": [], "initiator": [], "receiver": [],
                   "text": []}

    for a_code in code_list:
        output_dict[a_code] = []

    for a_conversat in res_dict:
        for index, an_utterance in enumerate(res_dict[a_conversat]):
            output_dict["initiator"].append(an_utterance[1])
            output_dict["receiver"].append(an_utterance[2])
            output_dict["the_session_id"].append(an_utterance[3])
            output_dict["conversation_id"].append(an_utterance[4])
            output_dict["utterance_id"].append(an_utterance[5])
            output_dict["text"].append(an_utterance[0])

            for a_code in code_list:
                output_dict[a_code].append(an_utterance[6][a_code])

    return pd.DataFrame(output_dict)
    # res_df.to_excel(output_path)


def excel_data_for_adding_context_without_labels(x_df: pd.DataFrame, context_window: int):
    """
    changed code for processing the 6 code version of data,
    This one can be used by both
    :param x_df:
    :param context_window:
    :return:
    """

    merged_data = {}
    for _, row in x_df.iterrows():
        # this conversation id is already processed as the_session_id + conversation_id
        conversation = str(row['conversation_id'])
        if conversation not in merged_data:
            merged_data[conversation] = []

        a_utterance_list = [row["text"], row["initiator"], row["receiver"], row["the_session_id"], row["conversation_id"],
                            row["utterance_id"]]
        merged_data[conversation].append(a_utterance_list)

    res_dict = copy.deepcopy(merged_data)
    for a_conversat in merged_data:
        for index, _ in enumerate(res_dict[a_conversat]):
            # adding previous lines when trying to classification
            text_result = []
            iteration_range = range(max(index - context_window, 0), index + 1)
            this_student = merged_data[a_conversat][index][1]

            for _ in range(context_window - len(iteration_range) + 1):
                text_result.append("N/A")
            for i in iteration_range:
                # 2023 2 20 use this student / other student to represent the student instead of color.
                if this_student == merged_data[a_conversat][i][1]:
                    text_result.append("This student: " + merged_data[a_conversat][i][0])
                else:
                    text_result.append("Other student: " + merged_data[a_conversat][i][0])
            res_dict[a_conversat][index][0] = " \n\n ".join(text_result)

    output_dict = {"the_session_id": [], "conversation_id": [], "utterance_id": [],
                   "initiator": [], "receiver": [], "text": []}

    for a_conversat in res_dict:
        for index, an_utterance in enumerate(res_dict[a_conversat]):
            output_dict["initiator"].append(an_utterance[1])
            output_dict["receiver"].append(an_utterance[2])
            output_dict["the_session_id"].append(an_utterance[3])
            output_dict["conversation_id"].append(an_utterance[4])
            output_dict["utterance_id"].append(an_utterance[5])
            output_dict["text"].append(an_utterance[0])

    return pd.DataFrame(output_dict)
    # res_df.to_excel(output_path)


def merged_excel_to_phrase_dataset(merged_json_excel_path: str, output_path: str):
    merged_df = pd.read_excel(merged_json_excel_path)
    merged_df["task allo and plann"] = merged_df["task allocation"] | merged_df["planning"]
    merged_df["info sharing and situ assess"] = merged_df["information sharing"] | merged_df["situation assessment"]
    merged_df.drop(["disagreement", "checking-back", "task allocation", "planning", "information sharing", "situation assessment"], axis=1, inplace=True)
    merged_df[['the_session_id', 'conversation_id']] = merged_df.conversation_id.str.split("_", expand=True)
    merged_df.rename(columns={"Unnamed: 0": "line_id"}, inplace=True)
    merged_df.sort_values(by=["the_session_id", "conversation_id"], inplace=True)
    merged_df.to_excel(output_path)
    print()

if __name__ == '__main__':
    # for context_window_setting in range(1):
    #     # merged = merging_all_data("2022_result_json")
    #     merged = merging_all_data_and_break_into_phrases("2022_result_json")
    #     # contexted_merged = adding_context_to_merged(merged, context_window=context_window_setting)
    #     export_merged_to_excel(merged, "dataset/2022_dataset/2022_phrase_level_dataset_with_context_size_{}.xlsx".format(
    #         context_window_setting))
    #     print()

    # # change format of the excel merged from json, to the phrase level dataset, similar to data in true_clause_level
    # merged_excel_to_phrase_dataset("dataset/2022_dataset/2022_phrase_level_dataset_with_context_size_0_11codes.xlsx",
    #                                "dataset/2022_dataset/2022_phrase_level_dataset_with_context_size_0_7_codes.xlsx",)

    # context_size = 5
    # data_path = "dataset/clause_level_dataset.xlsx"
    # data_df = pd.read_excel(data_path)
    # excel_data_for_adding_context(data_df,
    #                               context_size,
    #                               )
    # data_df.to_excel("dataset/clause_level_dataset_with_context_size_{}.xlsx".format(context_size))

    ## creating dataset with using whole sentence to add context
    # context_size = 8
    # # data_path = "dataset/A_15_sentence_level_data.xlsx"
    # data_path = "dataset/2022_sentence_level_data.xlsx"
    # data_df = pd.read_excel(data_path)
    # res_df = excel_data_for_adding_context(data_df,
    #                                        context_size)
    # res_df.to_excel("dataset/2022_sentence_level_dataset_with_context_size_{}.xlsx".format(context_size))

    # creating truly broken clause level dataset with using whole sentence to add context
    context_size = 17
    for size in range(1, context_size + 1):
        data_path = "dataset/2022_dataset/2022_phrase_level_dataset_with_context_size_0_7_codes.xlsx"
        data_df = pd.read_excel(data_path)
        res_df = excel_data_for_adding_context(data_df,
                                               size)
        res_df.to_excel("dataset/2022_dataset/2022_clause_level_dataset_with_context_size_{}.xlsx".format(size))
