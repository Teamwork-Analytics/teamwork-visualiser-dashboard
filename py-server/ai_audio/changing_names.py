import re

import pandas
import pandas as pd


def sub_black_white_outsider(line):
    new_line = re.sub("black", "relative", line)
    new_line = re.sub("white", "doctor", new_line)
    new_line = re.sub("outsider", "patient", new_line)
    return new_line


def change_name_of_black_and_white(conv_df):
    conv_df["initiator"] = conv_df["initiator"].apply(sub_black_white_outsider)
    conv_df["receiver"] = conv_df["receiver"].apply(sub_black_white_outsider)
    return conv_df


if __name__ == '__main__':
    conversation_df = pd.read_csv("../285_network_data.csv")
    name_changed_df = change_name_of_black_and_white(conversation_df)
    name_changed_df.to_csv("../285_network_data_changed.csv")
