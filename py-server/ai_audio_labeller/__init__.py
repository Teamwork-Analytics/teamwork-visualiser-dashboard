from ai_audio_labeller.autolabeller import process_classification_with_genai_batch
import pandas as pd

def perform_classification(df: pd.DataFrame):
    return process_classification_with_genai_batch(df)