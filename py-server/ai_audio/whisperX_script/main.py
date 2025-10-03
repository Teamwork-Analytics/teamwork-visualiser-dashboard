import json
import os
from dotenv import load_dotenv

import pandas as pd
import whisperx
import gc
import torch
from docx import Document
from docx.shared import Pt

torch.backends.cuda.matmul.allow_tf32 = True
torch.backends.cudnn.allow_tf32 = True

device = "cuda"
batch_size = 8  # reduce if low on GPU mem
compute_type = "float16"  # change to "int8" if low on GPU mem (may reduce accuracy)
# model_name = "turbo"

# import model

def initialise_whisperX(model_name):
    return whisperx.load_model(model_name, device, compute_type=compute_type, language="en")

def whisperx_transcribe(model, audio_file, output_path, enable_diarization=False):
    print("========= start processing {} =============".format(audio_file))
    if os.path.exists(output_path):
        print(output_path + " already exists, skip processing")
        return

    speaker_name = audio_file.split("_")[1]
    # 1. Transcribe with original whisper (batched)

    # save model to local path (optional)
    # model_dir = "/path/"
    # model = whisperx.load_model("large-v2", device, compute_type=compute_type, download_root=model_dir)

    audio = whisperx.load_audio(audio_file)
    result = model.transcribe(audio, batch_size=batch_size, language="en")
    print("finished importing model")

    # delete model if low on GPU resources
    # import gc; gc.collect(); torch.cuda.empty_cache(); del model
    if enable_diarization:
    # 2. Align whisper output
        model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
        result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
        print("finished whisperx")

        # delete model if low on GPU resources
        # import gc; gc.collect(); torch.cuda.empty_cache(); del model_a

        # 3. Assign speaker labels
        diarize_model = whisperx.DiarizationPipeline(use_auth_token=os.getenv('huggingface_token'), device=device)

        # add min/max number of speakers if known
        diarize_segments = diarize_model(audio)
        # diarize_model(audio, min_speakers=min_speakers, max_speakers=max_speakers)

        result = whisperx.assign_word_speakers(diarize_segments, result)
        print(diarize_segments)
        print(result["segments"])  # segments are now assigned speaker IDs

    print("start organising data")
    res_dict = {"start": [], "end": [], "speaker": [], "text": [], "words_json": []}
    for a_utterance in result["segments"]:
        res_dict["start"].append(a_utterance["start"])
        res_dict["end"].append(a_utterance["end"])
        res_dict["speaker"].append(speaker_name)
        res_dict["text"].append(a_utterance["text"])
        if "words" in res_dict:
            res_dict["words_json"].append(json.dumps(a_utterance["words"]))
        else:
            res_dict["words_json"].append("")

    res_df = pd.DataFrame(res_dict)
    res_df.to_excel(output_path)
    # with open(output_path, "w") as f:
    #     json.dump(result, f)




############ to doc ###########

def seconds_to_mmss(t: float) -> str:
    """Convert float seconds to MM:SS format (rounding or truncating fractional part)."""
    mins = int(t // 60)
    secs = int(t % 60)
    return f"{mins:02d}:{secs:02d}"


def to_doc(xlsx_path, output_path):
    # Create a new Document
    document = Document()
    df = pd.read_excel(xlsx_path)
    # Optional: set default font size or other styles if desired
    style = document.styles['Normal']
    font = style.font
    font.name = 'Arial'
    font.size = Pt(11)

    # Iterate through the DataFrame rows
    for _, row in df.iterrows():
        start_str = seconds_to_mmss(row['start'])
        end_str = seconds_to_mmss(row['end'])

        # Create a new paragraph in the document
        paragraph = document.add_paragraph()

        # Speaker, start, and end in bold
        run_header = paragraph.add_run(f"{row['speaker']} {start_str} - {end_str}\n")
        run_header.bold = True

        # Transcript text in the next line
        paragraph.add_run(row['text'] + "\n\n")

    # Save the Word document
    document.save(output_path)



# transcribe("harvard.wav", "result/res.xlsx")
# audio_file = "harvard.wav"
