"""
This file contains the scripts for doing classification in a pipeline style
"""

import datetime
import json
import os.path
import re

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, cohen_kappa_score, f1_score, \
    recall_score, precision_score
from torch.utils.data import Dataset
# import tensorflow as tf
from transformers import AutoTokenizer, TrainingArguments, Trainer, AutoModelForSequenceClassification

from ai_audio.auto_coding.json_data_processing import excel_data_for_adding_context_without_labels

STUDENT_COLORS = ["blue", "green", "red", "yellow"]
CODE_LIST = ["task allo and plann", "escalation", "info sharing and situ assess",
             "provision of handover information",
             "information requesting", "responding to request", "agreement"]

MERGED_CODE_LIST = ["task allocation", "escalation", "information sharing",
                    "provision of handover information",
                    "information requesting", "responding to request", "acknowledgement"]

CODE_NAME_MAPPER = {"task allo and plann": "task allocation", "escalation": "escalation",
                    "info sharing and situ assess": "call-out",
                    "provision of handover information": "handover",
                    "information requesting": "questioning", "responding to request": "responding",
                    "agreement": "acknowledging"}

THIS_FILE_PATH = os.path.dirname(__file__)

def filtering_conv_text(text: str):
    """
    This function is shared by this processing script and the main logic
    @return:
    """
    return bool(re.search("\w", str(text)))


def split_sentence_by_symbol(sentence: str):
    """
    split a given sentence by symbols, keep the symbols, keep the sequence of words unchanged.
    :param sentence:
    :return:
    """
    splitted_queue = [str(sentence)]
    symbols = [".", ",", "?"]

    for a_symbol in symbols:
        # skip the sentence that does not have this type of symbol
        exist = False
        for a_sentence in splitted_queue:
            if str(a_symbol) in a_sentence:
                exist = True

        if exist:
            new_queue = []
            while len(splitted_queue) != 0:
                to_split = splitted_queue.pop(0)
                splitted = to_split.split(a_symbol)
                for i in range(len(splitted) - 1):
                    splitted[i] = splitted[i].strip() + a_symbol
                new_queue += splitted

            # remove all the element that does not contain english word
            refined_queue = []
            for a_sentence in new_queue:
                if filtering_conv_text(a_sentence):
                    refined_queue.append(a_sentence)
            splitted_queue = refined_queue
    return splitted_queue


def get_index_of_student_ini(data_df: pd.DataFrame):
    return (data_df["initiator"] == "blue") | \
           (data_df["initiator"] == "red") | \
           (data_df["initiator"] == "green") | \
           (data_df["initiator"] == "yellow")


def get_index_of_student_rec(data_df: pd.DataFrame):
    return (data_df["receiver"].str.contains("blue")) | \
           (data_df["receiver"].str.contains("red")) | \
           (data_df["receiver"].str.contains("green")) | \
           (data_df["receiver"].str.contains("yellow"))


def get_conv_df(data_df: pd.DataFrame, mode: str = "all"):
    """
    This function is to filter the data. For example, extract only the in-team communication of students, or all
    communication data of any participants.

    Change the default value of mode to switch mode. The method used in BJET paper is student

    !!!! This function is used by both classification algorithm (this file) and the main processing logic (main.py), so changes can be
    consistently done on both sides.

    @param data_df:
    @param mode:
    @return:
    """
    if mode == "student":
        id_of_student_ini = get_index_of_student_ini(data_df)
        id_of_student_rec = get_index_of_student_rec(data_df)
        student_conv_df = pd.DataFrame(data_df[id_of_student_rec & id_of_student_ini])
        return student_conv_df
    elif mode == "all":
        return data_df
    else:
        raise ValueError("mode cannot be {}, please select one in: student | all".format(mode))


def processing_ena_data_to_clause_dataset(data_path: str, name_of_labels: list, text_column_name: str) -> (
        pd.DataFrame, pd.DataFrame):
    data_df = pd.read_excel(data_path)

    # this one is for the clause_level_dataset currently used 2023 2 20
    if "the_session_id" not in data_df:
        data_df[["the_session_id", "conversation_id"]] = data_df["conversation_id"].str.split("_", expand=True)
        data_df["the_session_id"] = pd.to_numeric(data_df["the_session_id"])
        data_df["conversation_id"] = pd.to_numeric(data_df["conversation_id"])

    student_conv_df = get_conv_df(data_df)

    if "the_session_id" in student_conv_df:
        student_conv_df["odd_even"] = student_conv_df["the_session_id"] % 2
        student_conv_df = student_conv_df[student_conv_df["odd_even"] == 1]
    print()
    clause_x = {"the_session_id": [], "utterance_id": [], "conversation_id": [], "initiator": [], "receiver": [],
                "text": [], }
    clause_y = {"the_session_id": [], "utterance_id": [], "conversation_id": []}
    clause_x_y = {"the_session_id": [], "utterance_id": [], "conversation_id": [], "initiator": [], "receiver": [],
                  "text": []}
    for a_code in name_of_labels:
        clause_y[a_code] = []
        clause_x_y[a_code] = []

    for _, row in student_conv_df.iterrows():
        splitted = split_sentence_by_symbol(row[text_column_name])

        clause_y["the_session_id"].append(row["the_session_id"])
        clause_y["utterance_id"].append(row["utterance_id"])
        clause_y["conversation_id"].append(row["conversation_id"])

        for a_code in name_of_labels:
            clause_y[a_code].append(row[a_code])

        for a_sentence in splitted:
            clause_x["the_session_id"].append(row["the_session_id"])
            clause_x["utterance_id"].append(row["utterance_id"])
            clause_x["conversation_id"].append(row["conversation_id"])
            clause_x["initiator"].append(row["initiator"])
            clause_x["receiver"].append(row["receiver"])
            clause_x["text"].append(a_sentence)

            clause_x_y["the_session_id"].append(row["the_session_id"])
            clause_x_y["utterance_id"].append(row["utterance_id"])
            clause_x_y["conversation_id"].append(row["conversation_id"])
            clause_x_y["initiator"].append(row["initiator"])
            clause_x_y["receiver"].append(row["receiver"])
            clause_x_y["text"].append(a_sentence)
            for a_code in name_of_labels:
                clause_x_y[a_code].append(row[a_code])

    x_df = pd.DataFrame(clause_x)
    y_df = pd.DataFrame(clause_y)
    x_y_df = pd.DataFrame(clause_x_y)
    return x_df, y_df, x_y_df


def processing_ena_data_to_sent_dataset(data_path: str, name_of_labels: list, text_column_name: str) -> (
        pd.DataFrame, pd.DataFrame):
    data_df = pd.read_excel(data_path)

    # this one is for the clause_level_dataset currently used 2023 2 20
    if "the_session_id" not in data_df:
        data_df[["the_session_id", "conversation_id"]] = data_df["conversation_id"].str.split("_", expand=True)
        data_df["the_session_id"] = pd.to_numeric(data_df["the_session_id"])
        data_df["conversation_id"] = pd.to_numeric(data_df["conversation_id"])
    student_conv_df = get_conv_df(data_df)

    if "the_session_id" in student_conv_df:
        student_conv_df["odd_even"] = student_conv_df["the_session_id"] % 2
        student_conv_df = student_conv_df[student_conv_df["odd_even"] == 1]
    print()
    clause_x = {"the_session_id": [], "utterance_id": [], "conversation_id": [], "initiator": [], "receiver": [],
                "text": [], }
    clause_y = {"the_session_id": [], "utterance_id": [], "conversation_id": []}
    clause_x_y = {"the_session_id": [], "utterance_id": [], "conversation_id": [], "initiator": [], "receiver": [],
                  "text": []}
    for a_code in name_of_labels:
        clause_y[a_code] = []
        clause_x_y[a_code] = []

    for _, row in student_conv_df.iterrows():
        clause_y["the_session_id"].append(row["the_session_id"])
        clause_y["utterance_id"].append(row["utterance_id"])
        clause_y["conversation_id"].append(row["conversation_id"])
        clause_x["the_session_id"].append(row["the_session_id"])
        clause_x["utterance_id"].append(row["utterance_id"])
        clause_x["conversation_id"].append(row["conversation_id"])
        clause_x["initiator"].append(row["initiator"])
        clause_x["receiver"].append(row["receiver"])
        clause_x["text"].append(row[text_column_name])

        clause_x_y["the_session_id"].append(row["the_session_id"])
        clause_x_y["utterance_id"].append(row["utterance_id"])
        clause_x_y["conversation_id"].append(row["conversation_id"])
        clause_x_y["initiator"].append(row["initiator"])
        clause_x_y["receiver"].append(row["receiver"])
        clause_x_y["text"].append(row[text_column_name])
        for a_code in name_of_labels:
            clause_y[a_code].append(row[a_code])
            clause_x_y[a_code].append(row[a_code])

    x_df = pd.DataFrame(clause_x)
    y_df = pd.DataFrame(clause_y)
    x_y_df = pd.DataFrame(clause_x_y)
    return x_df, y_df, x_y_df


def processing_ena_data_to_clause_dataset_without_labels(x_df: pd.DataFrame,
                                                         text_column_name: str) -> (
        pd.DataFrame, pd.DataFrame):
    """
    added data 2022/2/28
    This function is updated from the processing_ena_data_to_clause_dataset()
    This function is used for processing data without labels.
    :param x_df: The necessary columns are: "the_session_id", "conversation_id", "utterance_id", "text"
    :param text_column_name:
    :return:
    """

    # this one is for the clause_level_dataset currently used 2023 2 20
    if "the_session_id" not in x_df:
        x_df[["the_session_id", "conversation_id"]] = x_df["conversation_id"].str.split("_", expand=True)
        x_df["the_session_id"] = pd.to_numeric(x_df["the_session_id"])
        x_df["conversation_id"] = pd.to_numeric(x_df["conversation_id"])
    student_conv_df = get_conv_df(x_df)

    # This is the code for determining the session type, just remove it.
    # if "the_session_id" in student_conv_df:
    #     student_conv_df["odd_even"] = pd.to_numeric(student_conv_df["the_session_id"]) % 2
        # student_conv_df = student_conv_df[student_conv_df["odd_even"] == 1]

    clause_x = {"the_session_id": [], "utterance_id": [], "conversation_id": [], "initiator": [], "receiver": [],
                "text": [], }

    for _, row in student_conv_df.iterrows():
        splitted = split_sentence_by_symbol(row[text_column_name])

        for a_sentence in splitted:
            clause_x["the_session_id"].append(row["the_session_id"])
            clause_x["utterance_id"].append(row["utterance_id"])
            clause_x["conversation_id"].append(row["conversation_id"])
            clause_x["initiator"].append(row["initiator"])
            clause_x["receiver"].append(row["receiver"])
            clause_x["text"].append(a_sentence)

    res_df = pd.DataFrame(clause_x)
    return res_df


def binarilise(x: int):
    if x > 0:
        return 1
    else:
        return 0


def do_evaluation(classified_x: pd.DataFrame, y_truth: pd.DataFrame, names_of_labels: list) -> dict:
    # the classified x should have additional columns of the classified labels

    # merge the splitted row
    merged_y_df = y_truth.copy(deep=True)
    res_series = classified_x.groupby(["the_session_id", "utterance_id", "conversation_id"])

    for a_code in names_of_labels:
        if len(res_series) != merged_y_df.shape[0]:
            raise ValueError("the length of merged rows of x and ground truth y is different")
        merged_y_df[a_code] = res_series[a_code].sum().reset_index(drop=True)
        merged_y_df[a_code] = merged_y_df[a_code].apply(binarilise)

    # do the evaluation
    evaluation_results = {}
    for a_code in names_of_labels:
        classified = merged_y_df[a_code]
        truth = y_truth[a_code]
        a_evaluation_result = {"accuracy": accuracy_score(truth, classified),
                               "kappa": cohen_kappa_score(truth, classified),
                               "recall": recall_score(truth, classified),
                               "precision": precision_score(truth, classified),
                               "f1": f1_score(truth, classified)}
        evaluation_results[a_code] = a_evaluation_result
    return evaluation_results


class EncodeDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item['labels'] = torch.tensor(self.labels[idx])
        return item

    def __len__(self):
        return len(self.labels)


def do_classification(model_path: str, tokenizer_name: str, x_df: pd.DataFrame):
    """
    This function loads the trained model and evaluate the perforamcne based on the given x,y data saved in dataframe
    This function aims to evaluate the performance of selected model on the given dataset.
    This dataset can be the true clause level dataset, or anything else
    This version of classification will also do the
    :param model_path:
    :param tokenizer_name:
    :param code_name:
    :param x_df:
    :param y_df:
    :return:
    """
    torch.cuda.empty_cache()
    raw_input = x_df["text"].tolist()

    model = AutoModelForSequenceClassification.from_pretrained(os.path.join(THIS_FILE_PATH, model_path))

    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
    inputs_tokens = tokenizer(raw_input, padding="longest", truncation=False)

    training_args = TrainingArguments(output_dir="model_temp_out", per_device_eval_batch_size=256)

    # this step only creates fake dataset, y is just zero vector with the same length as the x
    test_dataset = EncodeDataset(inputs_tokens, np.zeros(len(inputs_tokens.encodings)).astype(int).tolist())
    trainer = Trainer(model=model, args=training_args)
    result = trainer.predict(test_dataset)
    # this can be important
    torch.cuda.empty_cache()
    return result
    # https://discuss.huggingface.co/t/i-have-trained-my-classifier-now-how-do-i-do-predictions/3625/2


def testing_the_classification_evaluation():
    # exporting the dataset for doing prediction

    x_data_path = "dataset/2021_dataset_for_classification/x_data.xlsx"
    y_data_path = "dataset/2021_dataset_for_classification/y_data.xlsx"
    dataset_x_df, dataset_y_df, dataset_x_y_df = processing_ena_data_to_clause_dataset(
        "dataset/coded_data_2021A+B.xlsx", CODE_LIST, "content")
    dataset_x_df.to_excel("dataset/2021_dataset_for_classification/x_data.xlsx")
    dataset_y_df.to_excel("dataset/2021_dataset_for_classification/y_data.xlsx")
    test_y_df = pd.read_excel(y_data_path)
    test_x_df = pd.read_excel(y_data_path)
    evaluation_res = do_evaluation(test_x_df, test_y_df, CODE_LIST)
    print()


# def generating_real_clause_level_based_on_current_one():
#     """
#     Because current version of clause level data is not really clause level. This one break the current one into real
#     clause level.
#     !!! This one should only be used for training classifier if current classifiers don't work#!!!
#     """
#     x_df, y_df, x_y_df = processing_ena_data_to_clause_dataset("dataset/clause_level_dataset.xlsx", CODE_LIST, "text")
#
#     x_y_df.to_excel("dataset/true_clause_level/clause_level_dataset.xlsx")
#     concat_x_y(x_df, y_df)


def append_perf_dict(a_performance_dict: dict, data_dict: dict, version: str):
    """

    :param a_performance_dict:
    :param data_dict: the sentence level data, following the similar format of data used for doing ENA
    :param version:
    :return:
    """
    a_performance_dict["version"].append(version)
    a_performance_dict["recall"].append(data_dict["recall"])
    a_performance_dict["precision"].append(data_dict["precision"])
    a_performance_dict["kappa"].append(data_dict["kappa"])
    a_performance_dict["accuracy"].append(data_dict["accuracy"])


def classifiy_eval_data_with_pretrained_model(configuration_json_path: str, data_set_path: str):
    with open(configuration_json_path, "r", encoding="utf-8") as fp:
        configuration_dict = json.load(fp)

    performance_res = {}

    for _, a_code in enumerate(configuration_dict):
        print("==================== started {} ===================".format(a_code))
        performance_res[a_code] = []

        a_performance_dict = {"model_path": [], "version": [], "recall": [], "precision": [], "kappa": [],
                              "accuracy": []}
        for a_model in configuration_dict[a_code]:
            a_performance_dict["model_path"].append(a_model["path"])
            append_perf_dict(a_performance_dict, data_dict=a_model, version="in record")

            if "granularity" not in a_model:
                granularity = "clause"
            else:
                granularity = a_model["granularity"]

            # todo: this part of data loading needs to be changed once we started to use it to process raw data
            #   the design here is to load the original data (sentence level data),
            #   then use the processing_ena_data_to_clause_dataset() to process it into clause level data set.
            if granularity == "clause":
                x_df = pd.read_excel(os.path.join(data_set_path, "x_data.xlsx"))
                y_df = pd.read_excel(os.path.join(data_set_path, "y_data.xlsx"))
            elif granularity == "sentence":
                x_df = pd.read_excel(os.path.join(data_set_path, "x_data_sent.xlsx"))
                y_df = pd.read_excel(os.path.join(data_set_path, "y_data_sent.xlsx"))
            else:
                raise ValueError("{} is not supported".format(granularity))
            # if granularity == "clause":
            #     x_df, y_df, _ = processing_ena_data_to_clause_dataset("dataset/clause_level_dataset.xlsx", CODE_LIST,
            #                                                           "text")
            #     # todo add clause level data processing here
            #     pass
            data_in_use = x_df.copy(deep=True)

            # determine to use which data processing method based on the granularity setting
            # because this setting was introduced after the first round of testing the performance,
            # some configuration may

            if a_model["context_size"] != 0:
                data_in_use = excel_data_for_adding_context_without_labels(data_in_use, a_model["context_size"])

            print("context_size: ", a_model["context_size"])
            print(data_in_use["text"].iloc[0])

            predicted = do_classification(model_path=a_model["path"],
                                          tokenizer_name=a_model["tokenizer"],
                                          x_df=data_in_use)
            labels = np.argmax(predicted.predictions, axis=-1)
            data_in_use[a_code] = labels

            perf_res_dict = do_evaluation(classified_x=data_in_use, y_truth=y_df, names_of_labels=[a_code])
            a_performance_dict["model_path"].append(a_model["path"])
            append_perf_dict(a_performance_dict, data_dict=perf_res_dict[a_code], version="on clause")

        performance_res[a_code].append(pd.DataFrame(a_performance_dict))

    return performance_res


def merge_classified_y(classified_data: pd.DataFrame, merge_to_df: pd.DataFrame, merge_code):
    res_series = classified_data.groupby(["the_session_id", "utterance_id", "conversation_id"])
    test = res_series[merge_code].sum()
    # todo: 这里的bug可能是因为在prediction的时候把跟外部说话的行给去掉了 （确认了，就是这个事）
    #   明天找一下auto_coding project里面的filter的algo，在这里面再用一次

    if len(res_series) != merge_to_df.shape[0]:
        raise ValueError("the length of merged rows of x and ground truth y is different")
    merge_to_df[merge_code] = res_series[merge_code].sum().reset_index(drop=True)
    merge_to_df[merge_code] = merge_to_df[merge_code].apply(binarilise)
    merge_to_df


def classification_pipeline(configuration_json_path: str, x_df: pd.DataFrame):
    """
    mostly the same with the above one, but only conduct classification, no y data is needed.
    ADDITIONALLY, configuration should also indicate which data processing method (clause or sentence) was used
    :param configuration_json_path:
    :type x_df: sentence level data, no specific requirement, only need to have the_session_id, conversation_id,
        utterance_id, text. This means this input can be simply the data used for ENA
    :return:
    """
    with open(os.path.join(THIS_FILE_PATH, configuration_json_path), "r", encoding="utf-8") as fp:
        configuration_dict = json.load(fp)

    processed_data_dict = {}
    output_df = x_df.copy(deep=True)
    for a_code in configuration_dict:
        processed_data_dict[a_code] = []
        for a_model in configuration_dict[a_code]:

            if "granularity" not in a_model:
                granularity = "clause"
            else:
                granularity = a_model["granularity"]

            # todo: this part of data loading needs to be changed once we started to use it to process raw data
            #   the design here is to load the original data (sentence level data),
            #   then use the processing_ena_data_to_clause_dataset() to process it into clause level data set.
            if granularity == "clause":
                # this one do not need to make a deep copy because this function already created a new df
                data_in_use = processing_ena_data_to_clause_dataset_without_labels(x_df, "text")
            elif granularity == "sentence":
                # just copy, because the input x-df is already sentence_level
                data_in_use = x_df.copy(deep=True)
                pass
            else:
                raise ValueError("{} is not supported".format(granularity))

            if a_model["context_size"] != 0:
                data_in_use = excel_data_for_adding_context_without_labels(data_in_use, a_model["context_size"])

            predicted = do_classification(model_path=a_model["path"],
                                          tokenizer_name=a_model["tokenizer"],
                                          x_df=data_in_use)
            labels = np.argmax(predicted.predictions, axis=-1)
            data_in_use[a_code] = labels
            merge_classified_y(data_in_use, output_df, a_code)
            # processed_data_dict[a_code].append(data_in_use)
    return output_df


def add_comparison_column(comparison_dict: dict, data_df: pd.DataFrame):
    data_df["comparison"] = -1
    for a_score in comparison_dict:
        for a_session in comparison_dict[a_score]:
            data_df.loc[data_df["the_session_id"] == a_session, "comparison"] = a_score

    return data_df


def add_classification_res_to_ena_data(ena_data_df: pd.DataFrame, classification_df: pd.DataFrame):
    for a_code in CODE_LIST:
        ena_data_df[a_code] = 0

        for _, row in classification_df.iterrows():
            to_select = (ena_data_df["the_session_id"] == row["the_session_id"]) & \
                        (ena_data_df["conversation_id"] == row["conversation_id"]) & \
                        (ena_data_df["utterance_id"] == row["utterance_id"])
            ena_data_df.loc[to_select, a_code] = row[a_code]
    return ena_data_df


def generate_dataset_x_y_from_enadata(ena_data_path, data_output_path):
    dataset_x_df, dataset_y_df, dataset_x_y_df = processing_ena_data_to_clause_dataset(
        ena_data_path, CODE_LIST, "content")

    dataset_x_df_sent, dataset_y_df_sent, dataset_x_y_df_sent = processing_ena_data_to_clause_dataset(
        ena_data_path, CODE_LIST, "content")
    dataset_x_df.to_excel(os.path.join(data_output_path, "x_data.xlsx"))
    dataset_y_df.to_excel(os.path.join(data_output_path, "y_data.xlsx"))
    dataset_x_y_df.to_excel(os.path.join(data_output_path, "x_y_data.xlsx"))
    dataset_x_df_sent.to_excel(os.path.join(data_output_path, "x_data_sent.xlsx"))
    dataset_y_df_sent.to_excel(os.path.join(data_output_path, "y_data_sent.xlsx"))
    dataset_x_y_df_sent.to_excel(os.path.join(data_output_path, "x_y_data_sent.xlsx"))


def evaluation_procedure(configuration_json_path: str, ena_dataset_folder_path: str):
    """
    This method takes all the required data for evaluation, and then conduct evaluation
    :return:
    """
    # todo: refactor all the code to conduct a evaluation here

    # todo:
    #  2023/2/22
    #  1. create a function that load the configuration json to load the model,
    #  setting up the amount of context information
    #  2. create a
    #  2023/2/27
    #  在读取json的时候加一个读取granularity,根据这个变量调用相应的data processing method
    #
    # todo: 2022/3/16
    #   回头看一下model内的kappa （optional） 考虑一下，很多的model其实已经没了，看一下选出来的model的inter model kappa

    """This part of code is to do evaluation, just use the test run and see the output in evaluation_res
        The input data should be sentence level data. For those need clause level, it can be broke inside the function.
    """
    """ When doing evaluation, just 
    """

    # !!!! step 1, create the dataset from ena data for models

    # evaluation_res = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_json_path,
    #                                                            x_df=x_data, y_df=y_data)

    # This line of code run the models in configuration
    evaluation_res_2021 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_json_path,
                                                                    data_set_path="dataset/2021_dataset_for_classification/")
    # !!!! step 2, doing evaluation using 2022 data

    evaluation_res_2022 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_json_path,
                                                                    data_set_path="dataset/2022_testing_data")


def export_evaluation_results(evaluation_res, configuration_name: str, dataset_name: str):
    for a_code in evaluation_res:
        if not os.path.exists("documents/model_evaluation_results_v3/{}".format(a_code)):
            os.makedirs("documents/model_evaluation_results_v3/{}".format(a_code))

        evaluation_res[a_code][0].to_excel(
            "documents/model_evaluation_results_v3/{}/{}".format(a_code,
                                                                 "eval_res_{}_{}.xlsx".format(configuration_name,
                                                                                              dataset_name)))


#######################################################################################################################
# methods below here is used for each individual evaluation using different data and different configuration files
#######################################################################################################################
def testing_pipeline_v3_using_whole_2022_data():
    ena_data_path = "dataset/2022_whole_dataset/2022_sentence_level_data.xlsx"
    dataset_folder_path = "dataset/{}/".format("2022_whole_dataset")
    configuration_path = r"models_to_be_used/2022_models/2022 models in pipeline_v3.json"
    generate_dataset_x_y_from_enadata(ena_data_path, dataset_folder_path)

    evaluation_res_2022 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_path,
                                                                    data_set_path="dataset/2022_testing_data")
    output_res = []
    # evaluation_res_2021 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_path,
    #                                                                 data_set_path="dataset/2021_dataset_for_classification")
    export_evaluation_results(evaluation_res_2022, configuration_path.split("/")[-1].split(".")[0],
                              "2022_whole_testing_data")


def testing_pipeline_v2_using_2021and2022():
    ena_data_path = "dataset/2022_testing_data/2022_no_empty_lines.xlsx"
    dataset_folder_path = "dataset/{}/".format("2022_testing_data")
    configuration_path = r"G:/我的云端硬盘/data_folder/models_to_be_used/models in pipeline_v2.json"
    generate_dataset_x_y_from_enadata(ena_data_path, dataset_folder_path)
    # configuration_path = r"G:/我的云端硬盘/data_folder/models_to_be_used/models info - agreement clause.json"

    evaluation_res_2022 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_path,
                                                                    data_set_path="dataset/2022_testing_data")

    export_evaluation_results(evaluation_res_2022, configuration_path.split("/")[-1].split(".")[0], "2022_testing_data")


def testing_all_provision_of_handover_using_2021and2022():
    ena_data_path = "dataset/2022_testing_data/2022_no_empty_lines.xlsx"
    dataset_folder_path = "dataset/{}/".format("2022_testing_data")
    configuration_path = r"G:/我的云端硬盘/data_folder/models_to_be_used/models in pipeline_v2.json"
    # generate_dataset_x_y_from_enadata(ena_data_path, dataset_)
    # configuration_path = r"G:/我的云端硬盘/data_folder/models_to_be_used/models info - agreement clause.json"

    evaluation_res_2022 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_path,
                                                                    data_set_path="dataset/2022_testing_data")
    output_res = []
    evaluation_res_2021 = classifiy_eval_data_with_pretrained_model(configuration_json_path=configuration_path,
                                                                    data_set_path="dataset/2021_dataset_for_classification")
    export_evaluation_results(evaluation_res_2021, configuration_path.split("/")[-1].split(".")[0], "2021_testing_data")
    export_evaluation_results(evaluation_res_2022, configuration_path.split("/")[-1].split(".")[0], "2022_testing_data")


#######################################################################################################################
# main functions
#######################################################################################################################

def perform_classification(conversation_df):
    # x_data_sent = "dataset/2022_whole_dataset/2022_sentence_level_data.xlsx"
    # pipeline_configuration_path = r"models_to_be_used/json_configuration_for_paper.json"
    # x_data_sent = pd.read_excel(x_data_sent)
    model_configuration_file = "configuration_file/json_configuration_for_paper.json"

    autocoded_df = classification_pipeline(model_configuration_file, conversation_df)

    # autocoded_df = add_comparison_column(performance, autocoded_df)
    # res_df = add_classification_res_to_ena_data(ena_df, autocoded_df)
    # autocoded_df.to_excel("dataset/autocoded_data_results/2022_auto_coded_data_{}.xlsx".format(
    #     str(datetime.datetime.today().strftime("%Y-%m-%d-%H_%M_%S"))))
    # res_df.to_excel("dataset/autocoded_data_results/2022_ena_data_{}.xlsx".format(
    #     str(datetime.datetime.today().strftime("%Y-%m-%d-%H_%M_%S"))))
    # print()
    return autocoded_df


if __name__ == '__main__':
    # --------------------------------------
    # testing_the_classification_evaluation()
    # generating_real_clause_level_based_on_current_one()
    # -------------------
    # configuration_path = r"G:/我的云端硬盘/data_folder/models_to_be_used/models info - agreement clause.json"
    # configuration_path = r"G:/我的云端硬盘/data_folder/models_to_be_used/model_info - responding.json"

    # classifiy_data_with_pretrained_model(configuration_path, da)

    # procedure to do classification and do evaluation based on pretrained model
    # x_path = "dataset/2021_dataset_for_classification/x_data.xlsx"
    # y_path = "dataset/2021_dataset_for_classification/y_data.xlsx"
    # x_data = pd.read_excel(x_path)
    # y_data = pd.read_excel(y_path)
    #
    # x_path_sent = "dataset/2021_dataset_for_classification/x_data_sent.xlsx"
    # y_path_sent = "dataset/2021_dataset_for_classification/y_data_sent.xlsx"
    # x_data_sent = pd.read_excel(x_path_sent)
    # y_data_sent = pd.read_excel(y_path_sent)

    # processing_ena_data_to_clause_dataset_without_labels(x_data_sent, "text")

    # ==============  logic for doing evaluation =============================
    # output_df = excel_data_for_adding_context_without_labels(x_data, 2)
    #
    # code_name = "escalation"
    # predictions = do_classification(r"F:\code folder\autocoding_teamwork\models_to_be_used\escalation\74747_114514",
    #                                 r"emilyalsentzer/Bio_ClinicalBERT", code_name, x_data, y_data)
    # predicted_labels = np.argmax(predictions.predictions, axis=-1)
    # x_data[code_name] = predicted_labels
    #
    # evaluation_res_df = pd.DataFrame(
    #     do_evaluation(classified_x=x_data, y_truth=y_data, names_of_labels=[code_name])).transpose()
    # ==========================================================================
    # testing_pipeline_v3_using_whole_2022_data()
    print()

    print()
    """ evaluation codes end"""
    """ the following codes are just doing classification """
    # =======================================================================
    # ========= calling the classification pipeline ===========
    # [229, 271, 257, 233, 245, 239, 275, 255, 247, 237]
    # [283, 263, 279, 259, 251, 249, 225, 277, 253, 281]

    performance = dict(high=[283, 263, 279, 259, 251, 249, 225, 277, 253, 281],
                       low=[229, 271, 257, 233, 245, 239, 275, 255, 247, 237])
    # pipeline_configuration_path = r"models_to_be_used/2022_models/2022 models in pipeline_v3.json"
    #

    x_data_sent = "dataset/2022_whole_dataset/2022_sentence_level_data.xlsx"
    pipeline_configuration_path = r"models_to_be_used/json_configuration_for_paper.json"
    x_data_sent = pd.read_excel(x_data_sent)

    ena_df = pd.read_excel("dataset/2022_whole_dataset/x_data_for_ena.xlsx")
    autocoded_df = classification_pipeline(pipeline_configuration_path, x_data_sent)
    autocoded_df = add_comparison_column(performance, autocoded_df)
    res_df = add_classification_res_to_ena_data(ena_df, autocoded_df)
    autocoded_df.to_excel("dataset/autocoded_data_results/2022_auto_coded_data_{}.xlsx".format(
        str(datetime.datetime.today().strftime("%Y-%m-%d-%H_%M_%S"))))
    res_df.to_excel("dataset/autocoded_data_results/2022_ena_data_{}.xlsx".format(
        str(datetime.datetime.today().strftime("%Y-%m-%d-%H_%M_%S"))))
    print()
