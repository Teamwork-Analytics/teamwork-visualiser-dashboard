import os
import shutil
import subprocess

import pandas as pd

from ai_audio.audio_processing.organising_into_excel import clip_transcription_to_excel_with_filtering, \
    clip_to_excel_with_filtering
from ai_audio.audio_processing.processing_audios import processing_audio_to_clips
from ai_audio.audio_processing.whisper_transcription_cleansing import export_utterance_to_txt
from ai_audio.audio_transcription.pozyx_extraction import extract_interpolate_single_session
from ai_audio.audio_transcription.whisper_transcription import transcribing_audio_clips, \
    initialise_whisper_model, calculate_duration_of_clips
from ai_audio.auto_coding.auto_punctuation import add_punctuation
from ai_audio.auto_coding.processing_conversation_for_classification import get_conv_df, \
    filtering_conv_text, CODE_NAME_MAPPER
from ai_audio.dividing_simulation_spaces.testing_corrdinates import assigning_location_in_ena_data, \
    assigning_conversation
from ai_audio.fine_graining_utterances.refining_conversation_ready_excel import extract_from_textgrid, \
    detecting_errors_in_detailized_xlsx_2022, feed_detailized_info_to_conversation, collapse_detailized_excels, \
    adding_timetag_to_collapsed_excels, add_utterance_id
from ai_audio.formation_detection.formation_differentiation import get_formation_dict, \
    detecting_receiver
from ai_audio.my_util.Timer import Timers
from ai_audio_labeller import perform_classification


# in test mode, file will be copy, not move
TEST_MODE = True


@Timers.calculate_time_effciecny
def audio_processing(folder_path: str, session_id: int, create_archive: bool = False):
    """
    Doing vad using the processed audio files, following naming format of sim_{color}.wav

    @param create_archive:
    @param session_id:
    @param folder_path: The path to the folder containing all the audio files
    @return: none
    """

    # todo: may need further processing on extracting the the_session_id
    processing_audio_to_clips(folder_path, session_id)
    if create_archive:
        shutil.make_archive(os.path.join(folder_path, str(session_id), "clips_and_intervals"), "zip",
                            os.path.join(folder_path, str(session_id), "audio_clip_folder"))


def __move_textgrid_to_clips_folder(textgrid_folder: str, audio_clip_folder: str):
    """
    This function is move the textgrid files created from mfa algorithm to
    @param textgrid_folder:
    @param audio_clip_folder:
    @return:
    """
    for a_textgrid in os.listdir(textgrid_folder):
        if ".TextGrid" in a_textgrid:
            if TEST_MODE:
                shutil.copy(os.path.join(textgrid_folder, a_textgrid), os.path.join(audio_clip_folder, a_textgrid))
            else:
                shutil.move(os.path.join(textgrid_folder, a_textgrid), os.path.join(audio_clip_folder, a_textgrid))


def __call_mfa(mfa_folder: str, mfa_output_folder: str):
    result = subprocess.run(["powershell", "./run_force_alignment.bat", mfa_folder, mfa_output_folder],
                            capture_output=True, text=True)
    print(result)
    if result.returncode == 0:
        print(result.stdout)
    else:
        print("Command execution failed. Error message:")
        print(result.stderr)
        print(result.stdout)


def __generate_batch_for_processing(output_folder: str, session_id: int, mfa_folder: str, mfa_output_folder: str):
    with open(os.path.join(output_folder, "{}_mfa.bat".format(session_id)), "w") as fp:
        fp.write("""
        call conda activate aligner
        ECHO conda environment started
        call mfa align {} english_us_arpa english_us_arpa {}
        """.format(mfa_folder, mfa_output_folder))


def __move_clips_to_mfa_folder(audio_clip_folder: str, mfa_folder: str, session_id: int):
    if not os.path.exists(mfa_folder):
        os.makedirs(mfa_folder)

    for a_color_folder in os.listdir(audio_clip_folder):
        # go through folder, for each utterance, if both of its wav and transcription text exists, copy it to mfa folder
        txt_exists_set = set()
        wav_exists_set = set()

        if "." not in a_color_folder:
            for a_file in os.listdir(os.path.join(audio_clip_folder, a_color_folder)):
                if ".txt" in a_file:
                    txt_exists_set.add(os.path.splitext(a_file)[0])
                elif ".wav" in a_file:
                    wav_exists_set.add(os.path.splitext(a_file)[0])

            both_exist_list = list(txt_exists_set.intersection(wav_exists_set))

            for a_filename in both_exist_list:
                original_txt_path = os.path.join(audio_clip_folder, a_color_folder, a_filename + ".txt")
                original_wav_path = os.path.join(audio_clip_folder, a_color_folder, a_filename + ".wav")
                copy_to_txt_path = os.path.join(mfa_folder,
                                                "{}_{}_{}".format(str(session_id), a_color_folder, a_filename + ".txt"))
                copy_to_wav_path = os.path.join(mfa_folder,
                                                "{}_{}_{}".format(str(session_id), a_color_folder, a_filename + ".wav"))

                if not (os.path.exists(copy_to_txt_path) and os.path.exists(copy_to_wav_path)):
                    # add the session id, color before the files
                    if TEST_MODE:
                        shutil.copy(original_txt_path, copy_to_txt_path)
                        shutil.copy(original_wav_path, copy_to_wav_path)
                    else:
                        shutil.move(original_txt_path, copy_to_txt_path)
                        shutil.move(original_wav_path, copy_to_wav_path)
                else:
                    print("'{}' already exists in the mfa folder, skipped".format(copy_to_txt_path))
                # raise FileExistsError("{} already exists in the mfa folder. This is likely due to there is two "
                #                       "utterance started and ended on exactly the same time, please double-check")


def __timestamp_storage_for_sessions(session_id):
    timestamp_dict = {
        225: {
            "handover_ends": 335,
            "secondary_entered": 628,
            "doctor_entered": 1167
        },
        245: {
            "handover_ends": 162,
            "secondary_entered": 763,
            "doctor_entered": 902
        },
        247: {
            "handover_ends": 139,
            "secondary_entered": 360,
            "doctor_entered": 532
        },
        249: {
            "handover_ends": 158,
            "secondary_entered": 543,
            "doctor_entered": 828
        },
        259: {
            "handover_ends": 306,
            "secondary_entered": 760,
            "doctor_entered": 1104
        },
        263: {
            "handover_ends": 366,
            "secondary_entered": 980,
            "doctor_entered": 1303
        },
    }
    return timestamp_dict[session_id]["handover_ends"], \
           timestamp_dict[session_id]["secondary_entered"], \
           timestamp_dict[session_id]["doctor_entered"]


def filtering_conversation_text(conversation_df: pd.DataFrame):
    """
    This
    @param conversation_df:
    @return:
    """
    index_to_drop = []
    for i, row in conversation_df.iterrows():

        # todo add the filtering for the error words of short utterances
        #   This should be added before the filtering of empty utterance
        # place holder
        if not filtering_conv_text(row["text"]):
            index_to_drop.append(i)
    conversation_df.drop(index_to_drop, axis=0, inplace=True)


def auto_transcription_and_coding(the_data_folder: str, the_session_id: int, handover_ends: float,
                                  secondary_entered: float,
                                  doctor_entered: float,
                                  whisper_model_name: str):
    Timers.initialise_start_time()

    # # changed from variables to parameters
    # the_data_folder = "testing_data"  # the folder holding the data
    # the_session_id = 245  # the current session id
    # handover_ends, secondary_entered, doctor_entered = __timestamp_storage_for_sessions(
    #     the_session_id)  # the critical timestamp

    # this is the absolute path of this main.py. It is used for adjust the relative path used in several functions
    absolute_path = os.path.dirname(__file__)

    transcription_folder_path_in_session = "transcriptions"  # the folder to do the transcription

    transcription_excel_output_path_in_session = "transcriptions"
    transcription_excel_name = "transcriptions.xlsx"

    # todo this raw audio file path may need to be changed once we merged the system.
    # new paths added for formation detection
    raw_audio_folder = os.path.join(the_data_folder, str(the_session_id))
    raw_pozyx_file_path = os.path.join(the_data_folder, str(the_session_id), "{}.json".format(the_session_id))
    sync_data_path = os.path.join(the_data_folder, str(the_session_id), "sync.txt")
    formation_detection_export_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder",
                                                     "formation_detection_export")

    # new paths for autocoding:
    final_result_folder = os.path.join(the_data_folder, str(the_session_id), "final_result")
    final_result_path = os.path.join(final_result_folder, "{}_coded_conversation.csv".format(the_session_id))

    # model configuration file

    audio_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder")
    audio_clip_folder = os.path.join(audio_folder, "audio_clips")
    transcription_folder = os.path.join(the_data_folder, str(the_session_id), transcription_folder_path_in_session)
    transcription_excel_output_path = os.path.join(the_data_folder, str(the_session_id),
                                                   transcription_excel_output_path_in_session,
                                                   transcription_excel_name)
    excel_result_in_middle_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder",
                                                 "excel_in_middle_output")
    # m means the excels in the middle
    m_detd_path = os.path.join(excel_result_in_middle_folder, "detd", "detd_" + str(the_session_id) + ".xlsx")
    m_collapsed_path = os.path.join(excel_result_in_middle_folder, "collapsed",
                                    "collapsed_" + str(the_session_id) + ".xlsx")
    m_final_path = os.path.join(excel_result_in_middle_folder, "final", "final_" + str(the_session_id) + ".xlsx")

    # todo: this path is for testing, do change it after testing
    mfa_folder_path = os.path.join(audio_folder, "mfa_folder_{}".format(the_session_id))
    mfa_excel_output_folder = os.path.join(mfa_folder_path, "mfa_excel")
    mfa_excel_output_path = os.path.join(mfa_folder_path, "mfa_excel", str(the_session_id) + ".xlsx")
    mfa_forcealignment_folder_name = "{}_force_alignment_files".format(the_session_id)
    mfa_forcealignment_output_folder = os.path.join(mfa_forcealignment_folder_name,
                                                    "{}_aligner_output".format(the_session_id))
    # mfa_unzip_folder = os.path.join("")
    uploaded_mfa_name = "{}_aligner_output".format(the_session_id)
    uploaded_mfa_path = "{}.zip".format(uploaded_mfa_name)
    textgrid_output_folder_path = os.path.join(mfa_folder_path, "{}_aligner_output".format(the_session_id))
    textgrid_debug_folder = "debug_output"
    finer_grained_utterances_path = os.path.join(mfa_excel_output_folder, str(the_session_id) + ".xlsx")

    # __call_mfa(mfa_folder_path, textgrid_output_folder_path)
    """ old comments """
    # currently we have to upload the audio clips into cloud (whether on m3 or colab), to do the transcription
    # If no transcription provided, the script we only run the code from VAD and clipping the audio files
    # After the VAD and clipping, a zip file called
    """======================================"""
    # if using my only laptop, then no need to upload to the cloud.
    # if not os.path.exists(transcription_folder):

    # This if statement checks whether the textgrid folder exists.
    # This folder should be generated by calling the batch script.
    # if not os.path.exists(textgrid_output_folder_path):

    if not os.path.exists(uploaded_mfa_path):

        whisper_model = initialise_whisper_model(model_name=whisper_model_name)

        # # use the clipped audio files for transcription
        audio_processing(the_data_folder, the_session_id)  # took less than 5 seconds

        # # do the transcription
        # # medium.en, transcription took 405.51 seconds, on 1740.72 seconds of audio
        # # medium.en, transcription took 576.70 seconds, on 1849.52 seconds of audio
        # # medium.en, transcription took 460.16 seconds, on 1521.21 seconds of audio
        # # medium.en, transcription took 860.51 seconds, on 2068.16 seconds of audio
        # # medium.en, transcription took 759.90 seconds, on 2426.07 seconds of audio
        # transcribing_audio_clips_with_timestamp(whisper_model, the_session_id=str(the_session_id),
        #                                         audio_clip_folder_path=the_data_folder, handover_ends=handover_ends,
        #                                         secondary_entered=secondary_entered, met_entered=doctor_entered)
        transcribing_audio_clips(whisper_model, session_id=str(the_session_id), audio_clip_folder_path=the_data_folder)
        calculate_duration_of_clips(session_id=str(the_session_id), audio_clip_folder_path=the_data_folder)

        """    # If we want to use the cloud transcription manually, this elif statement should be added"""
        # processing took 1000 seconds
        """============================================================== """
        intervals_df: pd.DataFrame = clip_transcription_to_excel_with_filtering(
            transcription_folder,
            transcription_excel_output_path,
            handover_ends=handover_ends,
            secondary_entered=secondary_entered,
            met_entered=doctor_entered)

        # from the excel of transcription, export the transcription into txt for conducting force alignment
        # todo: the cleansing of whisper transcribed transcription still needs some work to do.
        export_utterance_to_txt(intervals_df,
                                audio_clip_folder)

        # force alignment took around 142 seconds

        __move_clips_to_mfa_folder(audio_clip_folder, mfa_folder_path, the_session_id)
        #
        # # todo: here should call the script to run the mfa,
        # This function generate a batch file that can be directly run, to perform the force alignment.

        #
        __generate_batch_for_processing("", the_session_id, mfa_forcealignment_folder_name,
                                        mfa_forcealignment_output_folder)
        # __call_mfa(mfa_folder_path, textgrid_output_folder_path)
        shutil.make_archive(mfa_forcealignment_folder_name, "zip", mfa_folder_path)

        print("!!!!!!!!!!!!!!!!!!!!!!!\nNow you should refresh the cloud folder")
    # if the grid output folder exists, this means the force alignment script was performed.
    else:

        # unpack the uploaded aligner results

        shutil.unpack_archive(uploaded_mfa_path, mfa_folder_path)

        # this line is just a data stub for testing the refining of mfa
        # intervals_df = pd.read_excel(
        #     "force_alignment_test/test_excel_data/test_utterance.xlsx")

        # This function is moving the
        __move_textgrid_to_clips_folder(textgrid_output_folder_path, mfa_folder_path)

        # This function extract the information in the textgrid files generated by the batch script to run mfa.
        extract_from_textgrid(mfa_folder_path, mfa_excel_output_folder, debug_output_folder=textgrid_debug_folder)

        # this function detect whether the detalised intervals have overlaps,
        # overlaps may happen when two sentences have similar words

        # This is to detect whether there is error in the refined excel data
        if TEST_MODE:
            detecting_errors_in_detailized_xlsx_2022(mfa_excel_output_folder,
                                                     os.path.join(absolute_path, textgrid_debug_folder,
                                                                  "error_records.xlsx"))

        # This three functions are to refine the functions.
        # There will be some files exported to disk for testing.
        # Those exported files should be in excel_in_middle_output
        feed_detailized_info_to_conversation(transcription_excel_output_path, mfa_excel_output_path, m_detd_path)
        collapse_detailized_excels(m_detd_path, m_collapsed_path)
        conversation_df = adding_timetag_to_collapsed_excels(m_collapsed_path, transcription_excel_output_path,
                                                             m_final_path)

        add_utterance_id(conversation_df, "utterance_id")
        conversation_df["text"].fillna("", inplace=True)

        conversation_df["text"] = conversation_df["text"].apply(clean_nonutf8)

        # assigning conversation id of students by location and phases
        location_dict = extract_interpolate_single_session(raw_pozyx_file_path,
                                                           sync_txt_path=sync_data_path)
        assigning_location_in_ena_data(conversation_df, the_session_id, location_dict)
        assigning_conversation(conversation_df, secondary_enter_timestamp=secondary_entered,
                               doctor_enter_timestamp=doctor_entered)

        # This function uses the f-foramtion based detection algorithm to find the receiver of a conversation.
        formation_dict = get_formation_dict(raw_audio_folder, the_session_id, raw_pozyx_file_path, sync_data_path)
        # use the f-formation theory based detection algo to detect the receiver of an utterance
        detecting_receiver(conversation_df, formation_dict)
        conversation_df.to_csv(os.path.join(the_data_folder, "{}_sna_dump.csv".format(the_session_id)))
        # if TEST_MODE:
        #     # This is a cut-in point for testing. Will load the files saved locally to continue processing.
        #     # export_formation_dict(formation_dict, formation_detection_export_folder)
        #     formation_dict = import_formation_dict(formation_detection_export_folder)
        #     conversation_df = pd.read_excel(m_final_path)

        # add session id to the df
        conversation_df["the_session_id"] = the_session_id

        # This function applies an external automated punctuation to the utterance without any punctuation.
        add_punctuation(conversation_df)



        # filter the conversation data
        conversation_df = get_conv_df(conversation_df)

        # filter the text
        filtering_conversation_text(conversation_df)

        coded_df = perform_classification(conversation_df)
        if not os.path.exists(final_result_folder):
            os.makedirs(final_result_folder)

        # change the name of columns to the version that will be used in the visualisations
        coded_df.rename(columns=CODE_NAME_MAPPER, inplace=True)
        # coded_df.to_csv(final_result_path)
        return coded_df


def clean_nonutf8(line: str):
    """remove the line that contains non-utf8 characters"""
    if line.isascii():
        return line
    else:
        print("!!!!!!\nnon-ascii character appeared in {}".format(line))
        cleaned_text = line.encode('ascii', 'ignore').decode('ascii')
        print("cleaned text is: " + cleaned_text)
        if len(cleaned_text) > 10:
            print("cleaned text long enough, return. ")
            return cleaned_text
        else:
            print("cleaned text not long enough, NOT return")
            return ""


def generate_sna_csv(the_data_folder: str, the_session_id: int,
                                                          handover_ends: float,
                                                          secondary_entered: float,
                                                          doctor_entered: float):
    raw_audio_folder = os.path.join(the_data_folder, str(the_session_id))
    audio_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder")
    audio_clip_folder = os.path.join(audio_folder, "audio_clips")
    raw_pozyx_file_path = os.path.join(the_data_folder, str(the_session_id), "{}.json".format(the_session_id))
    sync_data_path = os.path.join(the_data_folder, str(the_session_id), "sync.txt")

    audio_processing(the_data_folder, the_session_id)  # took less than 5 seconds
    intervals_df: pd.DataFrame = clip_to_excel_with_filtering(
        clips_folder=audio_clip_folder,
        handover_ends=handover_ends,
        secondary_entered=secondary_entered,
        met_entered=doctor_entered)

    formation_dict = get_formation_dict(raw_audio_folder, the_session_id, raw_pozyx_file_path, sync_data_path)
    print("get_formation_dict finishd")
    detecting_receiver(intervals_df, formation_dict)
    print("detecting receiver finishd")
    return intervals_df, formation_dict
def auto_transcription_and_coding_without_force_alignment(the_data_folder: str, the_session_id: int,
                                                          handover_ends: float,
                                                          secondary_entered: float,
                                                          doctor_entered: float,
                                                          whisper_model_name: str,
                                                          formation_dict):
    Timers.initialise_start_time()

    # # changed from variables to parameters
    # the_data_folder = "testing_data"  # the folder holding the data
    # the_session_id = 245  # the current session id
    # handover_ends, secondary_entered, doctor_entered = __timestamp_storage_for_sessions(
    #     the_session_id)  # the critical timestamp

    # this is the absolute path of this main.py. It is used for adjust the relative path used in several functions
    absolute_path = os.path.dirname(__file__)

    transcription_folder_path_in_session = "transcriptions"  # the folder to do the transcription

    transcription_excel_output_path_in_session = "transcriptions"
    transcription_excel_name = "transcriptions.xlsx"

    # todo this raw audio file path may need to be changed once we merged the system.
    # new paths added for formation detection
    raw_audio_folder = os.path.join(the_data_folder, str(the_session_id))
    raw_pozyx_file_path = os.path.join(the_data_folder, str(the_session_id), "{}.json".format(the_session_id))
    sync_data_path = os.path.join(the_data_folder, str(the_session_id), "sync.txt")
    formation_detection_export_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder",
                                                     "formation_detection_export")

    # new paths for autocoding:
    final_result_folder = os.path.join(the_data_folder, str(the_session_id), "final_result")
    final_result_path = os.path.join(final_result_folder, "{}_coded_conversation.csv".format(the_session_id))

    # model configuration file

    audio_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder")
    audio_clip_folder = os.path.join(audio_folder, "audio_clips")
    transcription_folder = os.path.join(the_data_folder, str(the_session_id), transcription_folder_path_in_session)
    transcription_excel_output_path = os.path.join(the_data_folder, str(the_session_id),
                                                   transcription_excel_output_path_in_session,
                                                   transcription_excel_name)
    excel_result_in_middle_folder = os.path.join(the_data_folder, str(the_session_id), "audio_clip_folder",
                                                 "excel_in_middle_output")
    # m means the excels in the middle
    m_detd_path = os.path.join(excel_result_in_middle_folder, "detd", "detd_" + str(the_session_id) + ".xlsx")
    m_collapsed_path = os.path.join(excel_result_in_middle_folder, "collapsed",
                                    "collapsed_" + str(the_session_id) + ".xlsx")
    m_final_path = os.path.join(excel_result_in_middle_folder, "final", "final_" + str(the_session_id) + ".xlsx")

    # todo: this path is for testing, do change it after testing
    mfa_folder_path = os.path.join(audio_folder, "mfa_folder_{}".format(the_session_id))
    mfa_excel_output_folder = os.path.join(mfa_folder_path, "mfa_excel")
    mfa_excel_output_path = os.path.join(mfa_folder_path, "mfa_excel", str(the_session_id) + ".xlsx")
    mfa_forcealignment_folder_name = "{}_force_alignment_files".format(the_session_id)
    mfa_forcealignment_output_folder = os.path.join(mfa_forcealignment_folder_name,
                                                    "{}_aligner_output".format(the_session_id))
    # mfa_unzip_folder = os.path.join("")
    uploaded_mfa_name = "{}_aligner_output".format(the_session_id)
    uploaded_mfa_path = "{}.zip".format(uploaded_mfa_name)
    textgrid_output_folder_path = os.path.join(mfa_folder_path, "{}_aligner_output".format(the_session_id))
    textgrid_debug_folder = "debug_output"
    finer_grained_utterances_path = os.path.join(mfa_excel_output_folder, str(the_session_id) + ".xlsx")

    # __call_mfa(mfa_folder_path, textgrid_output_folder_path)
    """ old comments """
    # currently we have to upload the audio clips into cloud (whether on m3 or colab), to do the transcription
    # If no transcription provided, the script we only run the code from VAD and clipping the audio files
    # After the VAD and clipping, a zip file called
    """======================================"""
    # if using my only laptop, then no need to upload to the cloud.
    # if not os.path.exists(transcription_folder):

    # This if statement checks whether the textgrid folder exists.
    # This folder should be generated by calling the batch script.
    # if not os.path.exists(textgrid_output_folder_path):


    # # use the clipped audio files for transcription

    whisper_model = initialise_whisper_model(model_name=whisper_model_name)

    # # do the transcription
    # # medium.en, transcription took 405.51 seconds, on 1740.72 seconds of audio
    # # medium.en, transcription took 576.70 seconds, on 1849.52 seconds of audio
    # # medium.en, transcription took 460.16 seconds, on 1521.21 seconds of audio
    # # medium.en, transcription took 860.51 seconds, on 2068.16 seconds of audio
    # # medium.en, transcription took 759.90 seconds, on 2426.07 seconds of audio
    # transcribing_audio_clips_with_timestamp(whisper_model, the_session_id=str(the_session_id),
    #                                         audio_clip_folder_path=the_data_folder, handover_ends=handover_ends,
    #                                         secondary_entered=secondary_entered, met_entered=doctor_entered)
    transcribing_audio_clips(whisper_model, session_id=str(the_session_id), audio_clip_folder_path=the_data_folder)
    calculate_duration_of_clips(session_id=str(the_session_id), audio_clip_folder_path=the_data_folder)

    # usually the interval will be empty if there is no pozyx data
    intervals_df: pd.DataFrame = clip_transcription_to_excel_with_filtering(
        transcription_folder,
        transcription_excel_output_path,
        handover_ends=handover_ends,
        secondary_entered=secondary_entered,
        met_entered=doctor_entered)

    # force alignment code is removed
    conversation_df = intervals_df

    conversation_df["text"] = conversation_df["text"].apply(clean_nonutf8)
    conversation_df["text"].fillna("", inplace=True)

    add_utterance_id(conversation_df, "utterance_id")

    # assigning conversation id of students by location and phases
    location_dict = extract_interpolate_single_session(raw_pozyx_file_path,
                                                       sync_txt_path=sync_data_path)
    assigning_location_in_ena_data(conversation_df, the_session_id, location_dict)
    assigning_conversation(conversation_df, secondary_enter_timestamp=secondary_entered,
                           doctor_enter_timestamp=doctor_entered)

    # This function uses the f-foramtion based detection algorithm to find the receiver of a conversation.
    # use the f-formation theory based detection algo to detect the receiver of an utterance
    detecting_receiver(conversation_df, formation_dict)
    conversation_df.to_csv(os.path.join(the_data_folder, str(the_session_id), "result", "{}_network_data.csv".format(the_session_id)))
    # add session id to the df
    conversation_df["the_session_id"] = the_session_id

    # filter the text
    filtering_conversation_text(conversation_df)

    # This function applies an external automated punctuation to the utterance without any punctuation.
    add_punctuation(conversation_df)


    # filter the conversation data
    conversation_df = get_conv_df(conversation_df)


    coded_df = perform_classification(conversation_df)
    if not os.path.exists(final_result_folder):
        os.makedirs(final_result_folder)

    # change the name of columns to the version that will be used in the visualisations
    coded_df.rename(columns=CODE_NAME_MAPPER, inplace=True)
    coded_df.to_csv(final_result_path)
    return coded_df


if __name__ == '__main__':
    # data_folder = "debug_data"  # the folder holding the data
    # session_id = 249  # the current session id
    # handover, secondary, doctor = __timestamp_storage_for_sessions(session_id)  # the critical timestamp
    # # def auto_transcription_and_coding(the_data_folder: str, the_session_id: int, handover_ends, secondary_entered,
    # #                                   doctor_entered):
    # auto_transcription_and_coding_without_force_alignment(data_folder, session_id, handover, secondary, doctor)

    # Timers.print_total_running_time()
    # # os.makedirs()
    # MBC 뉴스 김성현입니다
    text = "– yep. Great. 500 mils. Yes. And we're running at – Dr. Holly?"

    # Remove non-ASCII characters
    ascii_text = text.encode('ascii', 'ignore').decode('ascii')

    print(ascii_text)