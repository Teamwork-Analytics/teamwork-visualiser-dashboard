from ai_audio_labeller.autolabeller import process_csv, process_classification_with_genai
import pandas as pd

def perform_classification(df: pd.DataFrame):
    return process_classification_with_genai(df)