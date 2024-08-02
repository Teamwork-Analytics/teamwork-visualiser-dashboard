import json
import re
import shutil

import pandas
import pandas as pd
import os
import pydub
import nltk
import textgrid


def __get_auido_file_path(color: str, session_id: int):
    audio_folder = "data/"

    for a_file in os.listdir(os.path.join(audio_folder, str(session_id))):
        if color.upper() in a_file:
            return os.path.join(audio_folder, str(session_id), a_file)


def __get_auido_harddrive_file_path(color: str, session_id: int):
    audio_folder = 'J:\\pennin\\full data'
    sub_folder = "audio"
    for a_folder in os.listdir(audio_folder):
        if str(session_id) in a_folder:
            audio_path = os.path.join(audio_folder, a_folder, sub_folder)
            audio_path = os.path.join(audio_path, os.listdir(audio_path)[0])
            for a_file in os.listdir(audio_path):
                if color.upper() in a_file and "simulation" in a_file:
                    return os.path.join(audio_path, a_file)


def __extract_excels(path: str):
    colors = ["blue", "green", "red", "yellow"]
    res_list = []

    for an_excel in os.listdir(path):
        a_df = pd.read_excel(os.path.join(path, an_excel))
        for a_color in colors:
            a_color_df = a_df[a_df["initiator"] == a_color]
            # start and end time
            res_dict = {"color": [], "session": [], "start_time": [],
                        "end_time": [], "duration": [], "content": []}
            for i, row in a_color_df.iterrows():

                # get all utterance that longer than 2 second
                if float(row["end_time"]) - float(row["start_time"]) > 2.5:
                    content = row["content"]
                    sentences = nltk.sent_tokenize(str(content))
                    reformed_sent_list = []
                    for a_sent in sentences:
                        assert type(a_sent) == str
                        if len(a_sent) > 3:
                            reformed_sent_list.append(a_sent)
                    if len(reformed_sent_list) > 1:
                        reformed_sent = " ".join(reformed_sent_list)
                        res_dict["color"].append(a_color)
                        res_dict["session"].append(an_excel.split(".")[0])
                        res_dict["start_time"].append(row["start_time"])
                        res_dict["end_time"].append(row["end_time"])
                        res_dict["duration"].append(row["duration"])
                        res_dict["content"].append(reformed_sent)
            res_list.append(res_dict)

    # res_df = pd.DataFrame(res_dict).to_excel("applying_text_analysis/temp.xlsx")
    # res_df = pd.DataFrame(res_dict)
    return res_list


def __extract_excels_for_texting(path: str):
    colors = ["blue", "green", "red", "yellow"]
    res_dict = {"color": [], "session": [], "start_time": [],
                "end_time": [], "duration": []}
    for an_excel in os.listdir(path):
        a_df = pd.read_excel(os.path.join(path, an_excel))
        for a_color in colors:
            a_color_df = a_df[a_df["initiator"] == a_color]
            # get the maximum duration that less 10 to test the synchronization of actual audio data and recorded
            # start and end time
            rows_dur_less_10 = a_color_df.loc[a_color_df["duration"] < 10]
            max_row = a_color_df.loc[rows_dur_less_10[["duration"]].idxmax()[0]]
            # records the results
            res_dict["color"].append(a_color)
            res_dict["session"].append(an_excel.split(".")[0])
            res_dict["start_time"].append(max_row["start_time"])
            res_dict["end_time"].append(max_row["end_time"])
            res_dict["duration"].append(max_row["duration"])

    # res_df = pd.DataFrame(res_dict).to_excel("applying_text_analysis/temp.xlsx")
    res_df = pd.DataFrame(res_dict)
    return res_df


def __testing_audio_cutting_length_accuracy():
    data_xlsx_path = "data.xlsx"
    conversation_xlsx_path = "applying_text_analysis/coding/templated/excel_for_detializing_3_29_2022"
    # excel_folder = ""
    # test = __get_auido_harddrive_file_path("green", 149)
    # pydub.AudioSegment(test, "wav")
    # pydub.AudioSegment.from_wav(test, "wav")
    session_df = __extract_excels(conversation_xlsx_path)
    # __extract_audio_clips(session_df, data_xlsx_path)
    # __cmd_test()
    pass


def __extract_audio_clips_and_texts(session_df: pd.DataFrame, data_xlsx_path: str, output_folder_path: str):
    """this function is to generate audio clips for force alignment"""
    audio_temp_folder = output_folder_path

    data_df = pd.read_excel(data_xlsx_path)

    for i, row in session_df.iterrows():
        audio_path = __get_auido_file_path(row["color"], row["session"])
        audio_dub = pydub.AudioSegment.from_wav(audio_path, "wav")
        cut_length = data_df.loc[data_df["id"] == int(row["session"])]["cut_length"]
        content_list = nltk.sent_tokenize(str(row["content"]))

        clip = audio_dub[int((float(row["start_time"]) - float(cut_length)) * 1000): int(
            (float(row["end_time"]) - float(cut_length)) * 1000)]
        clip.export(os.path.join(audio_temp_folder, "{}_{}_{}_{}.wav".format(row["session"],
                                                                             row["color"],
                                                                             row["start_time"],
                                                                             row["end_time"])), "wav")
        with open(os.path.join(audio_temp_folder, "{}_{}_{}_{}.txt".format(row["session"],
                                                                           row["color"],
                                                                           row["start_time"],
                                                                           row["end_time"])), "w") as writer:
            writer.writelines("\n".join(content_list))


def __remove_mid_brackets(a_session_df: pd.DataFrame) -> pd.DataFrame:
    for i, row in a_session_df.iterrows():
        # if "[" in row["content"]:
        #     print()
        a_sentence = re.sub(r"\[[^]]*\]", '', row["content"])
        a_session_df.loc[i, "content"] = a_sentence
    return a_session_df


def __extract_files_for_mfa(conversation_xlsx_path, output_folder_path: str):
    """generate audio files and transcriptions for mfa force-alignment"""
    data_xlsx_path = "data.xlsx"

    session_dict_list = __extract_excels(conversation_xlsx_path)
    for a_session_dict in session_dict_list:
        a_session_df = pd.DataFrame(a_session_dict)
        a_session_df = __remove_mid_brackets(a_session_df)
        __extract_audio_clips_and_texts(a_session_df, data_xlsx_path, output_folder_path)


def __filter_files_for_mfa_2022_using_original_excel(conversation_xlsx_path, clips_path, output_folder_path: str):
    """generate audio files and transcriptions for mfa force-alignment"""
    for a_excel in os.listdir(conversation_xlsx_path):
        session_id = a_excel.split("_")[0]
        a_session_df = pandas.read_excel(os.path.join(conversation_xlsx_path, a_excel))
        for i, row in a_session_df.iterrows():
            filename = "{}_{}_{}_{}".format(session_id, row["initiator"], row["start_time"], row["end_time"])
            txt_path = os.path.join(clips_path, filename + ".txt")
            wav_path = os.path.join(clips_path, filename + ".wav")
            copy_to_txt_path = os.path.join(output_folder_path, filename + ".txt")
            copy_to_wav_path = os.path.join(output_folder_path, filename + ".wav")
            # copy the wav
            shutil.copyfile(txt_path, copy_to_txt_path)
            shutil.copyfile(wav_path, copy_to_wav_path)


def __extract_files_for_mfa_2022_to_local(audio_folder, copy_to_folder_ROOT):
    """generate audio files and transcriptions for mfa force-alignment"""
    for a_session in os.listdir(audio_folder):
        session_folder = os.path.join(audio_folder, str(a_session))

        for a_color in os.listdir(os.path.join(session_folder, "audio_clips")):
            color_folder = os.path.join(session_folder, "audio_clips", a_color)

            for a_clip in os.listdir(color_folder):
                file_path = os.path.join(color_folder, a_clip)
                dst_path = os.path.join(copy_to_folder_ROOT, str(a_session) + "_" + a_color.lower() + "_" + a_clip)
                dst_txt_path = os.path.join(copy_to_folder_ROOT,
                                            str(a_session) + "_" + a_color.lower() + "_" + re.sub(".json", "",
                                                                                                  a_clip) + ".txt")
                if ".wav" in a_clip:
                    shutil.copyfile(file_path, dst_path)
                if ".json" in a_clip:
                    with open(file_path) as fp:
                        transcription = json.load(fp)
                    sentence_list = nltk.sent_tokenize(transcription["text"])
                    striped_list = []
                    for a_sentence in sentence_list:
                        text = a_sentence.encode("utf-8", 'ignore').decode('utf-8')
                        striped_list.append(text.strip())
                    sentence_list = striped_list
                    with open(dst_txt_path, "w", encoding="utf-8") as writer:
                        writer.writelines("\n".join(sentence_list))


def __extract_audio_clips_2022_using_excels(audio_folder: str, excel_folder: str, output_folder: str):
    """generate audio files and transcriptions for mfa force-alignment"""
    for excel_name in os.listdir(excel_folder):
        a_session = excel_name.split(".")[0]
        print("========== {} started ================".format(a_session))
        session_folder = os.path.join(audio_folder, str(a_session))
        excel_path = os.path.join(excel_folder, str(a_session) + ".xlsx")
        session_excel_df: pandas.DataFrame = pandas.read_excel(excel_path)
        session_excel_df.fillna("", inplace=True)
        audio_session_folder = os.path.join(audio_folder, str(a_session))

        audio_dict = {}
        for an_audio in os.listdir(audio_session_folder):
            if ".wav" in an_audio:
                color = an_audio.split(".")[0].split("_")[1].lower()
                audio_dict[color] = pydub.AudioSegment.from_wav(os.path.join(audio_session_folder, an_audio), "wav")

        for _, row in session_excel_df.iterrows():
            print(row["start_time"])
            if str(row["content"]) == "" or "[" in str(row["content"]) or "]" in str(row["content"]):
                print("{} skipped".format(row["start_time"]))
                continue
            start_time = row["start_time"]
            end_time = row["end_time"]
            color = row["initiator"]
            output_name = "{}_{}_{}_{}".format(a_session, color, start_time, end_time)

            # clip out the audio clips for mfa
            clip = audio_dict[color][int(float(start_time) * 1000): int(float(end_time) * 1000)]
            clip.export(os.path.join(output_folder, output_name + ".wav"), "wav")

            # create the transcription
            sentence_list = nltk.sent_tokenize(row["content"])

            with open(os.path.join(output_folder, output_name + ".txt"), "w", encoding="utf-8") as writer:
                writer.writelines("\n".join(sentence_list))


def __cleanse_a_word(a_word: str) -> str:
    """to remove all the symbols in a sentence"""
    new_word = re.sub(r'-', ' ', a_word)
    new_word = re.sub(r'', ' ', new_word)  # This one is to resolve decimal number problem. Replace 9.30 to 9 30
    new_word = re.sub(r"'s", ' s', new_word)  # This one is to resolve decimal number problem. Replace sat's to sat s
    new_word = re.sub(r"\*\*", ' ', new_word)  # This one is to resolve decimal number problem. Replace f**k to f k
    new_word = re.sub(r'[^\w\s]', '', new_word)
    new_word = new_word.lower().strip()
    new_word = re.sub(r"\s+", " ", new_word)
    return new_word


def __multi_word_to_first_word():
    pass


def _matching_sentence_with_textgrid(sentence, segments, a_filename: str, dup_removed_segments_list: list,
                                     debug_output_folder: str):
    """match the transcription with the words in textgrid file
       the dup_removed_segments_list
    """
    start_time = -1
    end_time = -1
    a_sentence = __cleanse_a_word(sentence)
    sentence_word_list = a_sentence.split(" ")
    finished = False  # this one for debug, a setence must match one of word sequences in textgrid
    single_word_record_list = {"the_session_id": [], "sentence": [], "color": [],
                               "old_start_time": [],
                               "old_end_time": []}  # this one for debugging the situation when only one word in a sentence

    # this line is specifially used for handling the situation where there is only one word in a sentence_word_list
    # determine whether to use the list by its length
    if len(dup_removed_segments_list) != 0:
        # double check the segment list only contains one appearance of single word sentence
        num_of_appearance = 0
        for a_segment in dup_removed_segments_list:
            if a_segment[0] == a_sentence:
                num_of_appearance += 1
        assert num_of_appearance == 1

        # here use the dup_removed_segments_list instead of the normal segments
        for a_segment in dup_removed_segments_list:
            if a_segment[0] == a_sentence:
                start_time = a_segment[1]
                end_time = a_segment[2]
                finished = True
                record_sentence = []
                for a_word in segments:
                    record_sentence.append(a_word.mark)
                single_word_record_list["sentence"].append(" ".join(record_sentence))
                single_word_record_list["the_session_id"].append(a_filename.split("_")[0])
                single_word_record_list["color"].append(a_filename.split("_")[1])
                single_word_record_list["old_start_time"].append(a_filename.split("_")[2])
                single_word_record_list["old_end_time"].append(a_filename.split("_")[3])

    # handling the single word situation
    if len(a_sentence.split(" ")) == 1:

        for i, a_segment in enumerate(segments):
            if finished:
                break

            a_segment_word = a_segment.mark
            # None should actually be ""
            if a_segment_word == "None":
                a_segment_word = ""
            a_segment_word = __cleanse_a_word(a_segment_word)
            if a_segment_word == a_sentence:
                start_time = a_segment.minTime
                end_time = a_segment.maxTime
                finished = True
    # first iteration layer, to locate the first word in a sentence
    for i, a_segment in enumerate(segments):
        if finished:
            break

        a_segment_word = a_segment.mark
        # None should actually be ""
        if a_segment_word == "None":
            a_segment_word = ""
        a_segment_word = __cleanse_a_word(a_segment_word)

        # this statement to detect if the word is a start wor
        if a_segment_word == sentence_word_list[0]:
            start_time = a_segment.minTime
            started = True
            text_list = [a_segment_word]

            for j in range(i + 1, len(segments)):
                another_segment_word = segments[j].mark
                if another_segment_word == "None":
                    another_segment_word = ""
                another_segment_word = __cleanse_a_word(another_segment_word)

                text_list.append(another_segment_word)
                merged_word = " ".join(text_list)
                merged_word = __cleanse_a_word(merged_word)

                if merged_word == a_sentence:
                    # once find a fully matched situation, stop the iteration, record end time.
                    end_time = segments[j].maxTime
                    finished = True
                    break

    assert finished
    assert start_time < end_time and start_time != -1 and end_time != -1
    single_word_df = pd.DataFrame(single_word_record_list)
    if len(single_word_df) > 0:
        single_word_df.to_excel(
            os.path.join(debug_output_folder, "{}_{}_{}_{}.xlsx".format(
                a_filename.split("_")[0],
                a_filename.split("_")[1],
                a_filename.split("_")[2],
                a_filename.split("_")[3], )))
    return start_time, end_time


def __aligning_whole_transcription_with_textgrid(result_dict: dict, transcription_list: list, segments, a_filename: str,
                                                 debug_output_folder: str):
    # because the segments of textgrid is linear, so we record which character we stopped for last sentence and start
    # from this index at the next iteration.
    start_point_of_segments = 0
    splitted_filename = a_filename.split("_")
    session_id = splitted_filename[0]
    color = splitted_filename[1].lower()
    old_start_time = splitted_filename[2]
    old_end_time = splitted_filename[3]

    for a_transcription in transcription_list:
        start_time = -1
        end_time = -1
        a_sentence = a_transcription
        cleansed_sentence = __cleanse_a_word(a_sentence)
        sentence_word_list = a_sentence.split(" ")
        pre_cleased_sentence_word_list = __cleanse_a_word(a_sentence).split(" ")
        finished = False  # a setence must match one of word sequences in textgrid

        single_word_record_list = {"the_session_id": [], "sentence": [], "color": [],
                                   "old_start_time": [],
                                   "old_end_time": []}  # this one for debugging the situation when only one word in a sentence
        # handling the single word situation
        # if len(pre_cleased_sentence_word_list) == 1:
        #     for i in range(start_point_of_segments, len(segments)):
        #         if finished:
        #             break
        #         a_segment = segments[i]
        #         a_segment_word = a_segment.mark
        #         # None should actually be ""
        #         if a_segment_word == "None":
        #             a_segment_word = ""
        #         a_segment_word = __cleanse_a_word(a_segment_word)
        #         if a_segment_word == cleansed_sentence:
        #             start_time = a_segment.minTime
        #             end_time = a_segment.maxTime
        #             finished = True
        #             start_point_of_segments = i + 1
        #             break
        # # if a sentence contains multiple words, go here.
        # else:
        # first iteration layer, to locate the first word in a sentence
        for i in range(start_point_of_segments, len(segments)):
            if finished:
                break

            a_segment = segments[i]
            a_segment_word = a_segment.mark
            # None should actually be ""
            if a_segment_word == "None":
                a_segment_word = ""

            a_segment_word = __cleanse_a_word(a_segment_word)
            text_list = [a_segment_word]
            start_time = a_segment.minTime

            merged_word = " ".join(text_list)
            merged_word = __cleanse_a_word(merged_word)

            # single word in a sentence
            if merged_word == cleansed_sentence:
                # once find a fully matched situation, stop the iteration, record end time.
                end_time = a_segment.maxTime
                finished = True
                start_point_of_segments = i + 1
                break
            # multiple words in a sentence
            for j in range(i + 1, len(segments)):
                another_segment_word = segments[j].mark
                if another_segment_word == "None":
                    another_segment_word = ""
                another_segment_word = __cleanse_a_word(another_segment_word)

                text_list.append(another_segment_word)
                merged_word = " ".join(text_list)
                merged_word = __cleanse_a_word(merged_word)
                # this statement to detect if the word is a start wor
                # if merged_word != __cleanse_a_word(sentence_word_list[0]):
                #     start_time = a_segment.minTime
                #     started = True
                #
                if merged_word == cleansed_sentence:
                    # once find a fully matched situation, stop the iteration, record end time.
                    end_time = segments[j].maxTime
                    finished = True
                    start_point_of_segments = j + 1

                    break

        assert finished
        assert start_time < end_time and start_time != -1 and end_time != -1
        single_word_df = pd.DataFrame(single_word_record_list)
        if len(single_word_df) > 0:
            single_word_df.to_excel(
                os.path.join(debug_output_folder, "{}_{}_{}_{}.xlsx".format(
                    a_filename.split("_")[0],
                    a_filename.split("_")[1],
                    a_filename.split("_")[2],
                    a_filename.split("_")[3], )))

        result_dict["start_time"].append(start_time)
        result_dict["end_time"].append(end_time)
        result_dict["sentence"].append(a_sentence)
        result_dict["the_session_id"].append(session_id)
        result_dict["color"].append(color)
        result_dict["old_start_time"].append(old_start_time)
        result_dict["old_end_time"].append(old_end_time)
    return


def extract_from_textgrid(textgrid_folder_path: str, output_folder: str, debug_output_folder):
    """The file in the textgrid folder should contain:
        1.textgrid 2.transcription .txt 3. audio .wav
    """
    global dup_removed_segments_list
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # scan the names of files
    filename_set = set()
    result_dict = {"the_session_id": [], "color": [], "sentence": [], "start_time": [], "end_time": [],
                   "old_start_time": [],
                   "old_end_time": []}
    single_word_and_multiple_appearance_list = []

    for a_file in os.listdir(textgrid_folder_path):
        if "." in a_file:
            filename_set.add(".".join(a_file.split(".")[:-1]))

    for a_filename in filename_set:
        textgrid_path = os.path.join(textgrid_folder_path, str(a_filename) + ".TextGrid")
        txt_path = os.path.join(textgrid_folder_path, str(a_filename) + ".txt")
        splitted_filename = a_filename.split("_")
        # the_session_id = splitted_filename[0]
        # color = splitted_filename[1]
        # old_start_time = splitted_filename[2]
        # old_end_time = splitted_filename[3]
        # load textgrid if textgrid exists
        if not os.path.exists(textgrid_path):
            continue
        a_tg = textgrid.TextGrid.fromFile(textgrid_path)
        segments = a_tg.tiers[0]

        # load transcription in txt
        with open(txt_path, "r", encoding="utf-8") as fp:
            transcription = fp.readlines()

        __aligning_whole_transcription_with_textgrid(result_dict, transcription, segments, a_filename,
                                                     debug_output_folder)
        # !!!!!!!!!!! this loop is no longer used
        # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
        # for trans_index, a_sentence in enumerate(transcription):
        #     # : 这一段大改，不再用单个词检测，而是对整个transcription进行检测，检测是否有overlap
        #     #   1. 对transcription进行for，把每个transcription line 去掉标点，变小写（cleanse）
        #     #   2. segments cleanse掉
        #     #   3. 弄一个函数，检测句子是否相同（这个其实有了，在子函数_matching_sentence_with_textgrid里，找matched的句子的），
        #     dup_removed_segments_list = __detect_duplicatation_in_segments(a_sentence, trans_index, transcription,
        #                                                                    segments)
        #     # if len(cleansed_sentence.split(" ")) == 1:
        #     #     # this variable records the number of the word appearance before the actual single word sentence
        #
        #     # do the job, get the start time and end time of a shorter sentence
        #     # todo: this should be done in a line by line manner,
        #     #  the algorithm needs to know which sentence has been finished
        #     #   Change it
        #     start_time, end_time = _matching_sentence_with_textgrid(a_sentence, segments, a_filename,
        #                                                             dup_removed_segments_list,
        #                                                             debug_output_folder)
        #
        #     result_dict["start_time"].append(start_time)
        #     result_dict["end_time"].append(end_time)
        #     result_dict["sentence"].append(a_sentence)
        #     result_dict["the_session_id"].append(the_session_id)
        #     result_dict["color"].append(color)
        #     result_dict["old_start_time"].append(old_start_time)
        #     result_dict["old_end_time"].append(old_end_time)
        # for a_segment in segments:
        #     if last_word_in_sent == a_segment.mark:
        #         matched ==
        #     pass
        # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    # got a dataframe containing
    result_df = pd.DataFrame(result_dict)
    # now split out the data for each session
    unique_sessions = result_df["the_session_id"].unique()
    for a_session_id in unique_sessions:
        session_df = result_df[result_df["the_session_id"] == a_session_id]
        session_df.to_excel(
            output_folder + "/{}.xlsx".format(a_session_id))


def __detect_duplicatation_in_segments(a_line_in_transcription: str, trans_index: int, transcription: list, segments):
    """
    input a line of transcription to test and the segments, if the sentence in the line appears multiple times in segments, then
    return a duplicate removed list, else return an empty list to indicate there is no duplication
    :param a_line_in_transcription:
    :param segments:
    :return:
    """
    # to overcome the situation when single word in a sentence
    # find out when there is only one word in a sentence
    # remove all the word appearance in the segment word list
    # so prevent the situation when the same word appear in previous lines, lead to incorrectness
    cleansed_sentence = __cleanse_a_word(a_line_in_transcription)
    # this one to record which line appears
    appearance_info_list = []
    dup_removed_segments_list = []

    num_before_single_word = 0
    # merge the sentences before the actual sentence, because word in segments do not contain
    # the sentence level information, so here we need to merge them
    # the reason not to use segments directly is because we don't know where is the appearance that the sentence appear.
    lines_before_appearance = []
    for i in range(trans_index):
        for a_word in __cleanse_a_word(transcription[i]).split(" "):
            lines_before_appearance.append(a_word)
    lines_after_appearance = []
    for i in range(trans_index + 1, len(transcription)):
        for a_word in __cleanse_a_word(transcription[i]).split(" "):
            lines_after_appearance.append(a_word)

    # transform the bag-of-words into ...
    n = len(cleansed_sentence.split(" "))
    n_gram_before = bow_to_ngram(lines_before_appearance, n)
    # : 如何解segments里包含的""? 通过不断的在segments里的word进行 + 运算，直到词数跟input的a_line_in_transcription相同，记录
    #   开始和结束的time信息即可

    num_before_single_word = 0
    for a_gram in n_gram_before:
        if __cleanse_a_word(a_gram) == cleansed_sentence:
            num_before_single_word += 1
        # appearance_info_list.append((index, a_cleansed_line.count(cleansed_sentence)))

    # extract the ngram for
    if num_before_single_word == 0:
        return []
    segments_bow = []
    for a_segment in segments:
        if a_segment.mark == "None":
            a_word = ""
        else:
            a_word = __cleanse_a_word(a_segment.mark)
        segments_bow.append((a_word, a_segment.minTime, a_segment.maxTime))
    segments_ngram = bow_to_ngram_for_segments(segments_bow, n)

    have_cleaned = 0
    single_word_sent_passed = False
    for a_segment_ngram in segments_ngram:
        if a_segment_ngram[0] == cleansed_sentence:
            if have_cleaned < num_before_single_word:
                have_cleaned += 1
                pass
            else:
                if not single_word_sent_passed:
                    dup_removed_segments_list.append((a_segment_ngram[0], a_segment_ngram[1], a_segment_ngram[2]))
                    single_word_sent_passed = True
        else:
            dup_removed_segments_list.append((a_segment_ngram[0], a_segment_ngram[1], a_segment_ngram[2]))
    # if num_before_single_word > 0:
    #     single_word_and_multiple_appearance_list.append(
    #         "{}_{}_{}".format(the_session_id, color, old_start_time))
    return dup_removed_segments_list


def bow_to_ngram(bow_list: list, n: int) -> list:
    """this function should tolerant the influence of '', """
    ngram_list = []
    a_gram = []
    for a_word in bow_list:
        if a_word != "":
            a_gram.append(a_word)
            if len(__cleanse_a_word(" ".join(a_gram)).split(" ")) == n:
                ngram_list.append(" ".join(a_gram))
                a_gram.pop(0)
    return ngram_list


def bow_to_ngram_for_segments(bow_list: list, n: int) -> list:
    """this function should tolerant the influence of '', """
    ngram_list = []
    a_word_list = []
    a_gram = []
    for a_word_tuple in bow_list:
        if a_word_tuple[0] != "":
            a_gram.append(a_word_tuple)
            a_word_list.append(a_word_tuple[0])

            if len(" ".join(a_word_list).split(" ")) == n:
                ngram_list.append((" ".join(a_word_list), a_gram[0][1], a_gram[-1][2]))
                a_gram.pop(0)
                a_word_list.pop(0)

    return ngram_list


def __generate_detailized_sessions():
    detailed_folder_path = ""


def __cmd_test():
    cmd_text = "dir"

    res = os.popen(cmd_text, "r", 1)
    res_list = res.readlines()
    for line in res_list:
        print(line)


def __handling_mfa_error():
    mfa_num = 3
    path = "applying_text_analysis/audio_clips/for_mfa{}".format(mfa_num)
    another_path = "applying_text_analysis/audio_clips/for_mfa{}/res".format(mfa_num)
    a_list = []
    a_set = set()
    another_set = set()
    for a_file in os.listdir(path):
        a_set.add(".".join(a_file.split(".")[:-1]))
    for a_file in os.listdir(another_path):
        another_set.add(".".join(a_file.split(".")[:-1]))
    res = a_set - another_set

    pass


def get_overlap(interval_a, interval_b):
    return max(0, min(interval_a[1], interval_b[1]) - max(interval_a[0], interval_b[0]))


def __detecting_errors_in_detailized_xlsx(output_xlsx_folder, output_path):
    """This function is to detect the potential errors in the output xlsx
       Those output should not have any overlap within a same students' utterance
    """
    colors = ["blue", "green", "red", "yellow"]
    # output_xlsx_folder = "applying_text_analysis/coding/templated/detailized_sessions/test_error_detection"
    filename_list = []

    # generate a dict to save the information for further process

    res_dict = {"the_session_id": [], "color": [],
                "start_time_1": [], "end_time_1": [],
                "start_time_2": [], "end_time_2": [],
                "old_start_time_1": [], "old_start_time_2": []}
    for a_file in os.listdir(output_xlsx_folder):
        a_df = pd.read_excel(os.path.join(output_xlsx_folder, a_file))
        session_id = a_file.split(".")[0]

        medium_info_dict = {}
        for a_color in colors:
            # actual time to generate intervals to detect overlap, old start time to infer the line that has overlap
            medium_info_dict[a_color] = {"actual_start_time": [], "start_time": [], "end_time": [],
                                         "actual_end_time": [], "old_start_time": []}

        # load data for one session
        for i, row in a_df.iterrows():
            medium_info_dict[row["color"]]["actual_start_time"].append(
                float(row["start_time"]) + float(row["old_start_time"]))
            medium_info_dict[row["color"]]["actual_end_time"].append(
                float(row["end_time"]) + float(row["old_start_time"]))
            medium_info_dict[row["color"]]["old_start_time"].append(
                float(row["old_start_time"]))
            medium_info_dict[row["color"]]["start_time"].append(float(row["start_time"]))
            medium_info_dict[row["color"]]["end_time"].append(float(row["end_time"]))

        for a_color in medium_info_dict:
            color_df = pd.DataFrame(medium_info_dict[a_color])

            # this multi-loop would lead to one error be recorded twice
            for i, color_row in color_df.iterrows():
                num_of_equal = 0
                for j, target_row in color_df.iterrows():
                    if color_row["actual_start_time"] == target_row["actual_start_time"] and color_row[
                        "actual_end_time"] == target_row["actual_end_time"]:
                        num_of_equal += 1
                        assert num_of_equal <= 1
                    else:
                        # overlap is not 0, then it has overlap, so record it
                        overlapped_time = get_overlap((color_row["actual_start_time"], color_row["actual_end_time"]),
                                                      (target_row["actual_start_time"], target_row["actual_end_time"]))
                        if overlapped_time > 0:
                            res_dict["the_session_id"].append(session_id)
                            res_dict["color"].append(a_color)
                            res_dict["start_time_1"].append(color_row["start_time"])
                            res_dict["end_time_1"].append(color_row["end_time"])
                            res_dict["start_time_2"].append(target_row["start_time"])
                            res_dict["end_time_2"].append(target_row["end_time"])
                            res_dict["old_start_time_1"].append(color_row["old_start_time"])
                            res_dict["old_start_time_2"].append(target_row["old_start_time"])
        # detect overlaps
    res_df = pd.DataFrame(res_dict)
    res_df.to_excel(output_path)

    pass


def detecting_errors_in_detailized_xlsx_2022(output_xlsx_folder, output_path):
    """This function is to detect the potential errors in the output xlsx
       Those output should not have any overlap within a same students' utterance

       comparing to older version, this one added white and black color
    """
    colors = ["blue", "green", "red", "yellow", "black", "white"]  # changed here
    # output_xlsx_folder = "applying_text_analysis/coding/templated/detailized_sessions/test_error_detection"
    filename_list = []

    # generate a dict to save the information for further process

    res_dict = {"the_session_id": [], "color": [],
                "start_time_1": [], "end_time_1": [],
                "start_time_2": [], "end_time_2": [],
                "old_start_time_1": [], "old_start_time_2": []}
    for a_file in os.listdir(output_xlsx_folder):
        a_df = pd.read_excel(os.path.join(output_xlsx_folder, a_file))
        session_id = a_file.split(".")[0]

        medium_info_dict = {}
        for a_color in colors:
            # actual time to generate intervals to detect overlap, old start time to infer the line that has overlap
            medium_info_dict[a_color] = {"actual_start_time": [], "start_time": [], "end_time": [],
                                         "actual_end_time": [], "old_start_time": []}

        # load data for one session
        for i, row in a_df.iterrows():
            medium_info_dict[row["color"]]["actual_start_time"].append(
                float(row["start_time"]) + float(row["old_start_time"]))
            medium_info_dict[row["color"]]["actual_end_time"].append(
                float(row["end_time"]) + float(row["old_start_time"]))
            medium_info_dict[row["color"]]["old_start_time"].append(
                float(row["old_start_time"]))
            medium_info_dict[row["color"]]["start_time"].append(float(row["start_time"]))
            medium_info_dict[row["color"]]["end_time"].append(float(row["end_time"]))

        for a_color in medium_info_dict:
            color_df = pd.DataFrame(medium_info_dict[a_color])

            # this multi-loop would lead to one error be recorded twice
            for i, color_row in color_df.iterrows():
                num_of_equal = 0
                for j, target_row in color_df.iterrows():
                    if color_row["actual_start_time"] == target_row["actual_start_time"] and color_row[
                        "actual_end_time"] == target_row["actual_end_time"]:
                        num_of_equal += 1
                        assert num_of_equal <= 1
                    else:
                        # overlap is not 0, then it has overlap, so record it
                        overlapped_time = get_overlap((color_row["actual_start_time"], color_row["actual_end_time"]),
                                                      (target_row["actual_start_time"], target_row["actual_end_time"]))
                        if overlapped_time > 0:
                            res_dict["the_session_id"].append(session_id)
                            res_dict["color"].append(a_color)
                            res_dict["start_time_1"].append(color_row["start_time"])
                            res_dict["end_time_1"].append(color_row["end_time"])
                            res_dict["start_time_2"].append(target_row["start_time"])
                            res_dict["end_time_2"].append(target_row["end_time"])
                            res_dict["old_start_time_1"].append(color_row["old_start_time"])
                            res_dict["old_start_time_2"].append(target_row["old_start_time"])
        # detect overlaps
    res_df = pd.DataFrame(res_dict)
    res_df.to_excel(output_path)

    pass


def __scan_the_transcription_with_manually_changed_info(conversation_folder):
    duplicated_res_list = {"the_session_id": [], "start_time": [], "end_time": []}

    for a_file in os.listdir(conversation_folder):
        session_id = a_file.split(".")[0]
        a_df = pd.read_excel(os.path.join(conversation_folder, a_file))
        duplicated_df_start_time = a_df[a_df["start_time"].duplicated()]
        duplicated_df_end_time = a_df[a_df["end_time"].duplicated()]
        if len(duplicated_df_start_time) > 0:
            for i, row in duplicated_df_start_time.iterrows():
                duplicated_res_list["the_session_id"].append(session_id)
                duplicated_res_list["start_time"].append(row["start_time"])
                duplicated_res_list["end_time"].append(row["end_time"])
        if len(duplicated_df_end_time) > 0:
            for i, row in duplicated_df_end_time.iterrows():
                duplicated_res_list["the_session_id"].append(session_id)
                duplicated_res_list["start_time"].append(row["start_time"])
                duplicated_res_list["end_time"].append(row["end_time"])
    duplicated_res_df = pd.DataFrame(duplicated_res_list)
    duplicated_res_df.to_excel(
        "applying_text_analysis/coding/templated/detailized_sessions/duplicated cell records.xlsx")


def __scan_the_transcription_with_manually_changed_info_not_completed_info(conversation_folder, output_file_path):
    res_list = {"the_session_id": [], "start_time": [], "end_time": []}

    for a_file in os.listdir(conversation_folder):
        session_id = a_file.split(".")[0]
        a_df = pd.read_excel(os.path.join(conversation_folder, a_file))
        a_df.fillna("", inplace=True)
        for i, row in a_df.iterrows():
            if "#" not in str(row["content"]) and str(row["content"] != ""):
                if (row["start_time"] == "" and row["end_time"] != "") or (
                        row["start_time"] != "" and row["end_time"] == ""):
                    res_list["the_session_id"].append(session_id)
                    res_list["start_time"].append(row["start_time"])
                    res_list["end_time"].append(row["end_time"])

    duplicated_res_df = pd.DataFrame(res_list)
    duplicated_res_df.to_excel(
        output_file_path)


def __scan_conversation_for_completeness(folder: str, output_path: str):
    res_dict = {"the_session_id": [], "missed_items": [], "start_time": [], "end_time": [], }
    list = os.listdir(folder)
    for a_file in os.listdir(folder):
        session_id = a_file.split(".")[0]
        a_df = pd.read_excel(os.path.join(folder, a_file))
        a_df.fillna("", inplace=True)
        for i, row in a_df.iterrows():
            if "#" not in str(row["content"]) and str(row["content"]) != "":
                missed = ""
                if row["conversation_id"] == "":
                    missed += "conversation_id"
                if row["start_time"] == "":
                    missed += "start_time"
                if row["end_time"] == "":
                    missed += "end_time"
                if row["duration"] == "":
                    missed += "duration"
                if row["initiator"] == "":
                    missed += "initiator"
                if row["receiver"] == "":
                    missed += "receiver"
                if row["location"] == "":
                    missed += "location"
                if missed != "":
                    res_dict["the_session_id"].append(session_id)
                    res_dict["missed_items"].append(missed)
                    res_dict["start_time"].append(row["start_time"])
                    res_dict["end_time"].append(row["end_time"])
    res_df = pd.DataFrame(res_dict)
    # res_df.to_excel("applying_text_analysis/coding/templated/detailized_sessions/item_missed_sessions.xlsx")
    res_df.to_excel(output_path)


def __scan_conversation_for_mid_brackets(folder: str):
    res_dict = {"the_session_id": [], "type": [], "content": [], "start_time": [], "end_time": [], }
    for a_file in os.listdir(folder):
        session_id = a_file.split(".")[0]
        a_df = pd.read_excel(os.path.join(folder, a_file))
        a_df.fillna("", inplace=True)
        for i, row in a_df.iterrows():
            if "#" not in str(row["content"]) and str(row["content"]) != "":
                if "[" in row["content"] and "]" in row["content"]:
                    res_dict["the_session_id"].append(session_id)
                    res_dict["type"].append("[]")
                    res_dict["content"].append(row["content"])
                    res_dict["start_time"].append(row["start_time"])
                    res_dict["end_time"].append(row["end_time"])
                if "[" in row["content"] and "]" not in row["content"]:
                    res_dict["the_session_id"].append(session_id)
                    res_dict["type"].append("[")
                    res_dict["content"].append(row["content"])
                    res_dict["start_time"].append(row["start_time"])
                    res_dict["end_time"].append(row["end_time"])
                if "[" not in row["content"] and "]" in row["content"]:
                    res_dict["the_session_id"].append(session_id)
                    res_dict["type"].append("]")
                    res_dict["content"].append(row["content"])
                    res_dict["start_time"].append(row["start_time"])
                    res_dict["end_time"].append(row["end_time"])
    res_df = pd.DataFrame(res_dict)
    res_df.to_excel("applying_text_analysis/coding/templated/detailized_sessions/has_mid_brackets.xlsx")


def __find_which_file_is_more(folder1, folder2):
    set1 = set()
    set2 = set()
    for a_file in os.listdir(folder1):
        a_filename = ".".join(a_file.split(".")[:-1])
        set1.add(a_filename)
    for a_file in os.listdir(folder2):
        a_filename = ".".join(a_file.split(".")[:-1])
        set2.add(a_filename)
    if len(set1) > len(set2):
        print(set1 - set2)
    else:
        print(set2 - set1)


def __find_which_file_is_not_mapped(folder1, copy_to_folder):
    set1 = set()
    for a_file in os.listdir(folder1):
        a_filename = ".".join(a_file.split(".")[:-1])
        set1.add(a_filename)
    all_complete = []
    not_complete = []
    for a_filename in set1:
        if os.path.exists(os.path.join(folder1, a_filename + ".TextGrid")):
            all_complete.append(a_filename)
        else:
            not_complete.append(a_filename)
    print(len(not_complete))
    print(not_complete)
    for a_filename in not_complete:
        shutil.copy(os.path.join(folder1, a_filename + ".txt"), os.path.join(copy_to_folder, a_filename + ".txt"))
        shutil.copy(os.path.join(folder1, a_filename + ".wav"), os.path.join(copy_to_folder, a_filename + ".wav"))


def __find_troublesome_lines(conversation_folder: str, output_file_path):
    res_list = {"the_session_id": [], "content": [], "start_time": [], "end_time": []}

    for a_file in os.listdir(conversation_folder):
        session_id = a_file.split(".")[0]
        a_df = pd.read_excel(os.path.join(conversation_folder, a_file))
        a_df.fillna("", inplace=True)
        for i, row in a_df.iterrows():
            if "-" in str(row["content"]):
                res_list["the_session_id"].append(session_id)
                res_list["start_time"].append(row["start_time"])
                res_list["end_time"].append(row["end_time"])
                res_list["content"].append(row["content"])

    duplicated_res_df = pd.DataFrame(res_list)
    duplicated_res_df.to_excel(
        output_file_path)


def __testing_interval_algo():
    a_interval = (10, 15)
    coming_interval = [(9, 11), (12, 13), (14, 16), (8, 17), (0, 2), (16, 17)]
    for a_coming_interval in coming_interval:
        print(a_coming_interval, "\t", detect_overlap_in_conversation(a_interval, a_coming_interval))


def detect_overlap_in_conversation(timeframe: tuple, target_timeframe: tuple):
    if not ((target_timeframe[1] < timeframe[0]) or (target_timeframe[0] > timeframe[1])):
        return True
    else:
        return False
    # if (timeframe[0] < target_timeframe[0] < timeframe[1]) or (
    #         timeframe[0] < target_timeframe[1] < timeframe[1]):
    #     return True
    # else:
    #     return False


def __generate_to_be_added_df(to_be_removed_row: pd.Series, detailized_df: pd.DataFrame):
    to_add_df = {"utterance_id": [],
                 "conversation_id": [],
                 "text": [],
                 "start_time": [],
                 "end_time": [],
                 "duration": [],
                 "initiator": [],
                 "receiver": [],
                 "location": [],
                 "communication_type": [],
                 "stage_based_on_num_of_student": []}
    for i, row in detailized_df.iterrows():
        to_add_df["utterance_id"].append("")
        to_add_df["conversation_id"].append(to_be_removed_row["conversation_id"])
        to_add_df["text"].append(row["sentence"])
        to_add_df["start_time"].append(float(row["old_start_time"]) + float(row["start_time"]))
        to_add_df["end_time"].append(float(row["old_start_time"]) + float(row["end_time"]))
        to_add_df["duration"].append(float(row["end_time"]) - float(row["start_time"]))
        to_add_df["initiator"].append(to_be_removed_row["initiator"])
        to_add_df["receiver"].append(to_be_removed_row["receiver"])
        to_add_df["location"].append(to_be_removed_row["location"])
        to_add_df["communication_type"].append(to_be_removed_row["communication_type"])
        to_add_df["stage_based_on_num_of_student"].append(to_be_removed_row["stage_based_on_num_of_student"])
    return pd.DataFrame(to_add_df)


def feed_detailized_info_to_conversation(original_xlsx_path: str, detailized_xlsx_path: str,
                                         merged_xlsx_output_path: str):
    # portion library address: https://github.com/AlexandreDecan/portion
    colors = ["blue", "green", "red", "yellow", "black", "white"]
    a_supp_df = pd.read_excel(detailized_xlsx_path)
    a_original_df = pd.read_excel(original_xlsx_path)
    a_template_df = pd.DataFrame().reindex_like(a_original_df)
    # for each individual color, the start time should be unique for each line
    for a_color in colors:
        a_color_supp_df = a_supp_df[a_supp_df["color"] == a_color].copy()
        a_color_original_df = a_original_df[a_original_df["initiator"] == a_color].copy()

        assert len(a_color_supp_df["old_start_time"].unique()) == len(a_color_supp_df["old_end_time"].unique())

        for a_unique_value in a_color_supp_df["old_start_time"].unique():
            detailized_df = a_color_supp_df[a_color_supp_df["old_start_time"] == a_unique_value]
            rounded_unique_value = round(a_unique_value, 2)
            # todo The following line should be added after testing
            # assert len(a_original_df[a_original_df["start_time"].round(2) == rounded_unique_value]) > 0

            if len(a_color_original_df[a_color_original_df["start_time"].round(2) == rounded_unique_value]) == 0:
                print("skipped")
                continue
            # it should be 1
            a_to_be_watched_df = a_color_original_df[
                a_color_original_df["start_time"].round(2) == rounded_unique_value]
            assert len(a_color_original_df[a_color_original_df["start_time"].round(2) == rounded_unique_value]) == 1
            to_be_removed_row = \
                a_color_original_df[a_color_original_df["start_time"].round(2) == rounded_unique_value].iloc[0]
            to_be_added_df = __generate_to_be_added_df(to_be_removed_row, detailized_df)

            a_color_original_df.drop(
                a_color_original_df.index[a_color_original_df["start_time"].round(2) == rounded_unique_value],
                inplace=True)

            a_color_original_df = a_color_original_df.append(to_be_added_df)

        a_template_df = a_template_df.append(a_color_original_df)
    a_template_df.sort_values(["conversation_id", "start_time"], ascending=True, inplace=True)
    a_template_df.reset_index(drop=True, inplace=True)

    if not os.path.exists(os.path.dirname(merged_xlsx_output_path)):
        os.makedirs(os.path.dirname(merged_xlsx_output_path))
    a_template_df.to_excel(merged_xlsx_output_path)
    """codes above replace the original lines with detailized ones"""
    # check if the code separated the lines
    # nan_replaced_df = a_template_df.fillna("0")
    # infer_df = nan_replaced_df[(nan_replaced_df["utterance_id"] == "0") & (nan_replaced_df["duration"].astype(float) > 2.5)]

    """codes below is used for merging"""
    # a_template_df =

    pass


def __scan_symbol_error_in_mfa_txts(mfa_folder):
    error_symbol = "’"
    filename_set = set()
    error_list = []

    for a_file in os.listdir(mfa_folder):
        filename_set.add(".".join(a_file.split(".")[:-1]))

    for a_filename in filename_set:
        with open(os.path.join(mfa_folder, a_filename + ".txt"), "r") as f:
            a_txt = f.readlines()
        for a_line in a_txt:
            if error_symbol in a_line:
                error_list.append(a_filename)

    pass


def merge_buffer(buffer_list) -> pd.Series():
    res_content_list = []

    for a_series in buffer_list:
        res_content_list.append(str(a_series["text"]).strip())
    res_series = pd.Series().reindex_like(buffer_list[0])
    res_series["text"] = " ".join(res_content_list)
    res_series["conversation_id"] = buffer_list[0]["conversation_id"]
    res_series["start_time"] = buffer_list[0]["start_time"]
    res_series["end_time"] = buffer_list[-1]["end_time"]
    res_series["location"] = buffer_list[0]["location"]
    res_series["initiator"] = buffer_list[0]["initiator"]
    res_series["receiver"] = buffer_list[0]["receiver"]
    res_series["duration"] = res_series["end_time"] - res_series["start_time"]
    return res_series


def collapse_detailized_excels(detd_excel_path: str, collapsed_excel_output_path: str):
    res_list = []
    a_df = pd.read_excel(detd_excel_path)
    a_df.fillna("", inplace=True)
    res_df = pd.DataFrame().reindex_like(a_df)
    res_df.drop("Unnamed: 0", axis=1, inplace=True)
    res_df.drop(labels=range(len(res_df)), axis=0, inplace=True)

    a_df.sort_values(["conversation_id", "start_time"], ascending=True, inplace=True)
    buffer_list = []

    for i, row in a_df.iterrows():
        if len(buffer_list) == 0:
            buffer_list.append(row)
            continue

        if row["text"] == "":
            continue

        last_row = buffer_list[-1]
        if last_row["conversation_id"] == row["conversation_id"] and last_row["initiator"] == row["initiator"]:
            if last_row["location"] == row["location"] and last_row["receiver"] == row["receiver"]:
                if row["start_time"] - last_row["end_time"] < 1.5:
                    buffer_list.append(row)
                    continue

        res_df = res_df.append(merge_buffer(buffer_list), ignore_index=True)
        buffer_list = [row]

    if len(buffer_list) != 0:
        res_df = res_df.append(merge_buffer(buffer_list), ignore_index=True)
    res_df.reset_index(drop=True, inplace=True)
    res_list.append(res_df)
    if not os.path.exists(os.path.dirname(collapsed_excel_output_path)):
        os.makedirs(os.path.dirname(collapsed_excel_output_path))
    res_df.to_excel(collapsed_excel_output_path)


def adding_timetag_to_collapsed_excels(merged_collapsed_excels_path, original_excel_path, output_path):
    timetag_tuple = ("#Ruth appeared", "#secondary nurses entered", "#doctor entered")
    for_timetag_df = pd.read_excel(original_excel_path)
    timetag_list = []
    for i, row in for_timetag_df.iterrows():
        for a_timetag in timetag_tuple:
            if row["text"] == a_timetag:
                timetag_list.append(row.copy())

    detd_df = pd.read_excel(merged_collapsed_excels_path)
    detd_df.fillna("", inplace=True)
    if "Unnamed: 0" in detd_df.columns:
        detd_df.drop("Unnamed: 0", axis=1, inplace=True)
    if "Unnamed: 0.2" in detd_df.columns:
        detd_df.drop("Unnamed: 0.2", axis=1, inplace=True)
    if "Unnamed: 0.1" in detd_df.columns:
        detd_df.drop("Unnamed: 0.1", axis=1, inplace=True)

    detd_df.drop(detd_df.index[detd_df["text"] == ""], inplace=True)
    for a_line in timetag_list:
        detd_df = detd_df.append(a_line, ignore_index=True)
    if not os.path.exists(os.path.dirname(output_path)):
        os.makedirs(os.path.dirname(output_path))
    detd_df.sort_values(by=["start_time"], inplace=True)

    # todo: what to do here? I forgot.
    detd_df.sort_values(by=["conversation_id", "start_time"], inplace=True)

    detd_df.to_excel(output_path)
    return detd_df


def old_main():
    """working process:
    处理2021年的audio的main function
    1. scan the files that you would like to use:
        to detect if they have missed duration, initiator... data
        manully separated cells
        and incomplete mid brackets(cause we will delete the information between a [] )"""
    orginal_execl_folder_path = "F:/!monash/2022_original_excel"

    __scan_conversation_for_completeness(orginal_execl_folder_path, "2022audio_refining/demo.xlsx")
    # __scan_conversation_for_mid_brackets("applying_text_analysis/coding/templated/excel_for_detializing_3_29_2022")
    # __scan_the_transcription_with_manually_changed_info("applying_text_analysis/coding/templated/excel_for_detializing_3_29_2022")
    # __scan_the_transcription_with_manually_changed_info_not_completed_info(orginal_execl_folder_path,
    #                                                                        "applying_text_analysis/coding/B/completeness_result.xlsx")
    # __find_troublesome_lines(orginal_execl_folder_path,
    #                          "applying_text_analysis/coding/B/troublesome lines.xlsx")
    """2. extract the start and end time of an utterance, and the transcription content to be used for force-alignment"""
    mfa_output_folder = "applying_text_analysis/coding/B/to_det"
    # __extract_files_for_mfa(orginal_execl_folder_path,
    #                         mfa_output_folder)
    # __handling_mfa_error()
    # __scan_symbol_error_in_mfa_txts(mfa_output_folder)
    # __find_which_file_is_more("applying_text_analysis/audio_clips/for_mfa_v3",
    #                           "applying_text_analysis/audio_clips/for_mfa_v3")
    # __find_which_file_is_not_mapped("applying_text_analysis/audio_clips/for_mfa_v4", "applying_text_analysis/audio_clips/for_mfa_v4_incompleted_ones")
    """you need to run mfa manually from command line"""
    """3. using the textgrid information to generate supplymentary excel data"""
    mfa_result_folder = "applying_text_analysis/coding/B/to_det/mfa_res_xlsx"

    # __extract_from_textgrid("applying_text_analysis/coding/B/to_det/for_mfa1_res",
    #                         mfa_result_folder)

    # # this function detect whether the detalised intervals have overlaps,
    # # overlaps may happen when two sentences have similar words
    # __detecting_errors_in_detailized_xlsx(mfa_result_folder, "applying_text_analysis/coding/B/to_det/error_records.xlsx")

    """4. use the supplymentary data to detailize the conversation xlsx"""
    # __testing_interval_algo()
    detd_session_output_folder = "applying_text_analysis/coding/B/to_det/detd_session_xlsx"
    feed_detailized_info_to_conversation(
        orginal_execl_folder_path,
        mfa_result_folder,
        detd_session_output_folder
    )
    # ！！！！！！！！！！！！！！！！！！！！！！！！！
    # after this step, going back to repair the files manually.
    # ！！！！！！！！！！！！！！！！！！！！！！！！！
    """5. merging the sentences"""
    # todo merge 的时候注意，有些学生在移动，这些移动记得要分进不同的行里
    second_last_output_folder = "applying_text_analysis/coding/B/to_det/second_final"
    # __collapse_detailized_excels("applying_text_analysis/coding/templated/detailized_sessions/collapse_test_folder",
    #                              "applying_text_analysis/coding/templated/detailized_sessions/collapse_test_output")
    # __collapse_detailized_excels(detd_session_output_folder, second_last_output_folder)
    # 输出的excel会产生过多的空行，最早出现问题出现在没有collapse的文件里
    # 测试并不足，可以多测测
    final_output_folder = "applying_text_analysis/coding/B/to_det/collapse_timetag_res"
    adding_timetag_to_collapsed_excels(second_last_output_folder,
                                       orginal_execl_folder_path,
                                       final_output_folder)


def add_utterance_id(data_df: pd.DataFrame, utterance_id_column: str):
    data_df[utterance_id_column] = pd.Series(range(data_df.shape[0]))


def refining_for_2022():
    # ！！！！！！！！这个要在添加session id之后再用
    """working process:
    1. scan the files that you would like to use:
        to detect if they have missed duration, initiator... data
        manully separated cells
        and incomplete mid brackets(cause we will delete the information between a [] )"""
    orginal_execl_folder_path = "original"

    # __scan_conversation_for_completeness(orginal_execl_folder_path,
    #                                      "applying_text_analysis/2022audio_refining/demo.xlsx")
    # __scan_conversation_for_mid_brackets("applying_text_analysis/coding/templated/excel_for_detializing_3_29_2022")
    # __scan_the_transcription_with_manually_changed_info("applying_text_analysis/coding/templated/excel_for_detializing_3_29_2022")
    # orginal_execl_folder_path = "F:/!monash/2022_excel/225_folder"
    # __scan_the_transcription_with_manually_changed_info_not_completed_info(orginal_execl_folder_path,
    #                                                                        "applying_text_analysis/coding/B/completeness_result.xlsx")
    # # # detect the lines that have "-" in content
    # __find_troublesome_lines(orginal_execl_folder_path,
    #                          "applying_text_analysis/coding/B/troublesome lines.xlsx")
    """2. extract the start and end time of an utterance, and the transcription content to be used for force-alignment"""
    ROOT_CLOUD_AUDIO2022_FOLDER = "H:/我的云端硬盘/2022 audio data/audio_clip_folder"
    mfa_clips_transcription = "F:/!monash/2022_audio_MFA"
    full_audio_path = "F:/!monash/2022_audio"

    # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    __filter_files_for_mfa_2022_using_original_excel(orginal_execl_folder_path, "F:/!monash/2022_audio_for_MFA",
                                                     "F:/!monash/2022_filtered_audio_for_MFA")
    __extract_files_for_mfa_2022_to_local(ROOT_CLOUD_AUDIO2022_FOLDER, ROOT_LOCAL_FOLDER_AUDIO2022_FOLDER)
    # # old function for extracting mfa audio files
    # __extract_files_for_mfa(orginal_execl_folder_path, ROOT_LOCAL_FOLDER_AUDIO2022_FOLDER)

    # 用code好的excel提取wav和txt
    # __extract_audio_clips_2022_using_excels(full_audio_path,orginal_execl_folder_path,
    #                                         mfa_clips_transcription)
    # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    # __handling_mfa_error()
    # __scan_symbol_error_in_mfa_txts(mfa_output_folder)
    # __find_which_file_is_more("applying_text_analysis/audio_clips/for_mfa_v3",
    #                           "applying_text_analysis/audio_clips/for_mfa_v3")
    # __find_which_file_is_not_mapped("applying_text_analysis/audio_clips/for_mfa_v4", "applying_text_analysis/audio_clips/for_mfa_v4_incompleted_ones")
    """you need to run mfa manually from command line"""
    """3. using the textgrid information to generate supplymentary excel data"""
    mfa_extraction_folder = "F:/!monash/2022_mfa_extraction/extracted_excel"
    # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    extract_from_textgrid(mfa_clips_transcription,
                          mfa_extraction_folder)

    # this function detect whether the detalised intervals have overlaps,
    # overlaps may happen when two sentences have similar words
    detecting_errors_in_detailized_xlsx_2022(mfa_extraction_folder, "F:/!monash/2022_mfa_extraction/error_records.xlsx")
    # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

    """4. use the supplymentary data to detailize the conversation xlsx"""
    # __testing_interval_algo()
    # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    detd_session_output_folder = "deted"
    feed_detailized_info_to_conversation(
        orginal_execl_folder_path,
        mfa_extraction_folder,
        detd_session_output_folder
    )
    # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
    # ！！！！！！！！！！！！！！！！！！！！！！！！！
    # after this step, going back to correct the files manually.
    # correct what?
    # ！！！！！！！！！！！！！！！！！！！！！！！！！
    """5. merging the sentences"""
    # todo merge 的时候注意，有些学生在移动，这些移动记得要分进不同的行里
    # second_last_output_folder_path = "F:/!monash/2022_excel/2022_secondlast_output"
    second_last_output_folder_path = "secondlast"
    # # ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
    # # __collapse_detailized_excels("applying_text_analysis/coding/templated/detailized_sessions/collapse_test_folder",
    # #                              "applying_text_analysis/coding/templated/detailized_sessions/collapse_test_output")
    collapse_detailized_excels(detd_session_output_folder, second_last_output_folder_path)
    # # 输出的excel会产生过多的空行，最早出现问题出现在没有collapse的文件里
    # # 测试并不足，可以多测测
    final_output_folder = "final"
    adding_timetag_to_collapsed_excels(second_last_output_folder_path,
                                       orginal_execl_folder_path,
                                       final_output_folder)
    # ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑


if __name__ == '__main__':
    cloud_folder = "H:/我的云端硬盘/2022 audio data/audio_clip_folder"
    local_folder = "F:/!monash/2022_excel/2022_original_excel"

    refining_for_2022()

    """codes below are for testing"""
    # bow_list = ["i", "am", "", "not", "", "like", "him", ""]
    # ngram1 = bow_to_ngram(bow_list, 2)
    # ngram2 = bow_to_ngram(bow_list, 3)
    # test_dict = {"first": [123, 123, 123, 444, 555, 444], "second": [123, 345, 345, 555, 444, 555]}
    # a_df = pd.DataFrame(test_dict)
    # print(a_df["first"].duplicated())
    # print(a_df["second"].duplicated())
    # dup_df_f = a_df[a_df["first"].duplicated()]
    # dup_df_s = a_df[a_df["second"].duplicated()]

    # the_session_id = 111
    # test_dict = {"content": ["", "awdawd", "", "awd","adad", ""],"start_time": ["123", "", "123", "444", "555", ""],
    #              "end_time": ["123", "345", "", "555", "444", ""]}
    # res_list = {"the_session_id": [], "start_time": [], "end_time": []}
    #
    # a_df = pd.DataFrame(test_dict)
    # a_df.fillna("", inplace=True)
    # for i, row in a_df.iterrows():
    #     if "#" not in str(row["content"]) and str(row["content"] != ""):
    #         if (row["start_time"] == "" and row["end_time"] != "") or (
    #                 row["start_time"] != "" and row["end_time"] == ""):
    #             res_list["the_session_id"].append(the_session_id)
    #             res_list["start_time"].append(row["start_time"])
    #             res_list["end_time"].append(row["end_time"])
    # a_sentence = "I am a [awdawd], yes, yes."
    # print(re.sub(r"\[[^]]*\]", "", a_sentence))
    pass
