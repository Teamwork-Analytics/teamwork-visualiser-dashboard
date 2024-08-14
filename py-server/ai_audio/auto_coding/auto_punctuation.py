import time

import pandas as pd
from deepmultilingualpunctuation import PunctuationModel


def contains_punctuation(a_str: str):
    punctuation = ".,?!"
    return any(p in str(a_str) for p in punctuation)


def add_punctuation(data_df: pd.DataFrame):
    model = PunctuationModel(model="oliverguhr/fullstop-punctuation-multilingual-sonar-base")

    for i, row in data_df.iterrows():
        if contains_punctuation(row["text"]):
            continue
        data_df.loc[i, "text"] = model.restore_punctuation(row["text"])


if __name__ == '__main__':
    print(contains_punctuation("awdawdawd"))
    print(contains_punctuation("awdawdawd."))
