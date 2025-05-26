from refactor.observation_data.observation_data_management import *
import nltk
from ai_audio.changing_names import change_name_of_black_and_white
from ai_audio.main import auto_transcription_and_coding, generate_sna_csv, \
    auto_transcription_and_coding_without_force_alignment

nltk.download('punkt')
whisper_model_name = "medium.en"  # @param ["medium.en", "small.en", "base.en", "large"]
use_force_alignment = False  # @param {type:"boolean"}


def generate_visualization_with_audio_data(simulation_id: str, data_dir):
    observation_data = retrieve_observation_data(simulation_id)
    handover_finish_time, secondary_nurses_enter_time, doctor_enter_time = extract_timestamps_from_phases_based_on_year(
        observation_data)
    session = simulation_id
    handover_finish_time, secondary_nurses_enter_time, doctor_enter_time = process_observation_timestamps(os.path.join(data_dir, str(session)),
                                                                                                          handover_finish_time,
                                                                                                          secondary_nurses_enter_time,
                                                                                                          doctor_enter_time)
    _run_auto_transcription_coding(data_dir, simulation_id, handover_finish_time, secondary_nurses_enter_time,
                                   doctor_enter_time)


def _run_auto_transcription_coding(data_folder, the_session_id, handover, secondary, doctor):
    # the_session_id = "416"  # @param {type:"string"}
    if use_force_alignment:
        coded_df = auto_transcription_and_coding(data_folder, the_session_id, handover, secondary, doctor,
                                                 whisper_model_name)
    else:
        sna_df, formation_dict = generate_sna_csv(data_folder, the_session_id, handover, secondary, doctor)

        sna_df = change_name_of_black_and_white(sna_df)
        # sna_df.to_csv("{}_sna.csv".format(the_session_id))
        sna_df.to_csv(os.path.join(data_folder, the_session_id, "result", "{}_sna.csv".format(the_session_id)))



        coded_df = auto_transcription_and_coding_without_force_alignment(data_folder, the_session_id, handover,
                                                                         secondary, doctor, whisper_model_name,
                                                                         formation_dict)

    coded_df = change_name_of_black_and_white(coded_df)
    # coded_df.to_csv("{}_network_data.csv".format(the_session_id))
    coded_df.to_csv(os.path.join(data_folder, the_session_id, "result",
                                 "{}_network_data.csv".format(the_session_id)))
