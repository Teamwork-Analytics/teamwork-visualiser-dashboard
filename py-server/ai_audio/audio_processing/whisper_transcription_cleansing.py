import os.path

import pandas as pd
from nltk import sent_tokenize
# from deepmultilingualpunctuation import PunctuationModel
from ai_audio.my_util.Timer import Timers

# https://huggingface.co/oliverguhr/fullstop-punctuation-multilang-large
# todo: 1. using the force alignment to make the transcription finer grained
#   2. apply a punctuation model to add punctuation
#   3. add "," before "and"
#   4. correct the issue identified from the last paper.
#       i. language
#       ii. background voice (you. bye. ... to empty)

# puctuation_model = PunctuationModel()


@Timers.calculate_time_effciecny
def __add_punctuation(sentence: str):
    """
    use the library to add punctuation
    @return:
    """
    # text = "My name is Clara and I live in Berkeley California Ist das eine Frage Frau Müller"
    result = puctuation_model.restore_punctuation(sentence)
    return result


def __contains_punc(sentence: str):
    PUNCTUATIONS = ".,!?"
    for a_char in sentence:
        if a_char in PUNCTUATIONS:
            return True
    return False


def export_utterance_to_txt(df: pd.DataFrame, audio_clip_path: str):
    """
    This function is to export all transcription of each utterance into the audio clips folder, to conduct
    the force alignment
    @param df:
    @param audio_clip_path:
    @return:
    """
    for i, row in df.iterrows():
        start_time = row["start_time"]
        end_time = row["end_time"]
        initiator = row["initiator"]
        transcription = row["text"]

        # # detect whether the sentence contain a punctuation, if not, use the automated punctuation to process it.
        # if not __contains_punc(transcription):
        #     transcription = __add_punctuation(transcription)
        # # detect if the sentence is a false positive, using the identical false sentence list.
        if not transcription.isascii():
            print("transcription is not english: {}.".format(transcription))
            continue

        txt_content = "\n".join(sent_tokenize(transcription))

        with open(os.path.join(audio_clip_path, initiator.upper(), "{}_{}.txt".format(start_time, end_time)), "w") as fp:
            fp.write(txt_content)

        # print()


if __name__ == '__main__':
    pass
