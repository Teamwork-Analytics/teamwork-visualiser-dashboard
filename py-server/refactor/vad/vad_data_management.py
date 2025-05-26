from refactor.vad.vad_helper import vad_on_unlabelled_data_without_speech2text


def process_audio_file(audio_path, output_path, session_name, word_threshold, number_of_thread):
    if audio_path == "" or output_path == "" or session_name == "":
        raise ValueError("audio_path,output_path or session_name must have input value")
    return vad_on_unlabelled_data_without_speech2text(audio_path=audio_path, output_path=output_path,
                                                      session_name=session_name)
