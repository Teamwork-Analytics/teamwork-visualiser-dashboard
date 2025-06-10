import os
import ffmpeg
import pandas as pd
from util.logging_util import logger
from vad.hive_automation import hive_main


def hive_data(colour, session, raw_audio_folder, hive_audio_folder, hive_positioning_folder, hive_csv_output_folder):
    # ------- This section of code is to check whether the processed audio data is provided -------
    audio_in = None
    audio_out = None
    is_hr_data_exist = False
    hr_file_path = '{}/heart rate-{}.csv'.format(raw_audio_folder, colour)
    try:
        filename_list = os.listdir(raw_audio_folder)
        for filename in filename_list:
            if filename.startswith("simulation_" + colour):
                audio_in = os.path.join(raw_audio_folder, filename)
                audio_out = os.path.join(
                    hive_audio_folder, "sim_" + colour + ".wav")
                break
        """Because we only saved the processed audio data, the audio_out is manually """
        if audio_out is None:
            audio_out = os.path.join(
                hive_audio_folder, "sim_" + colour + ".wav")
        if os.path.isfile(hr_file_path):
            is_hr_data_exist = True
        else:
            logger().info("HR data doesn't exist for:" + hr_file_path)
        if not audio_in or not audio_out:
            logger().info("please copy the audio files")
        # !ffmpeg - i {audio_in} - ar 48000 {audio_out}
        if os.path.exists(audio_out):
            os.remove(audio_out)
        logger().info(audio_in)
        stream = ffmpeg.input(audio_in)
        audio = stream.audio
        # , 'acodec': 'flac'})
        stream = ffmpeg.output(audio, audio_out, **{'ar': '32000'})
        ffmpeg.run(stream, capture_stdout=True, capture_stderr=True)
        if colour in ("BLACK", "WHITE"):
            return
        audio_csv_out = "{}/{}_{}.csv".format(
            hive_audio_folder, session, colour)

        # % run hive_automation.py - a {audio_out} - o {audio_csv_out} - s "145" - w "1" - t "3"
        # todo: the code above here is for preprocessing the audio data, commented for testing.
        """comment here to remove multithreding audio processing"""

        hive_main(audio_out, audio_csv_out, session, 1, 3)
    except Exception as error:
        logger().exception("Audio files are missing or cannot be processed.")
    dfp = pd.read_csv(
        '{}/{}_{}.csv'.format(hive_positioning_folder, session, colour))
    audio_file_path = '{}/{}_{}.csv'.format(hive_audio_folder, session, colour)
    # when the audio files don't exist or something is wrong, it will use position data without audio.
    if (os.path.exists(audio_file_path)):
        dfa = pd.read_csv(audio_file_path)
        # dfp.head()
        res = pd.merge(dfp, dfa, on="audio time")
        final = res.drop(
            labels=["Unnamed: 0_x", "Unnamed: 0_y", "session"], axis=1)
        final['tagId'] = colour
        final.head()
    else:
        dfp['audio'] = 0
        final = dfp
        final['tagId'] = colour
    # PROCESS HR data
    if (is_hr_data_exist):
        final = hive_heartrate_data(final, hr_file_path)
    result_csv = "{}/{}_{}.csv".format(hive_csv_output_folder, session, colour)
    final.to_csv(result_csv, sep=',', encoding='utf-8', index=False)


def hive_heartrate_data(processed_hive_df, hr_file_path):
    df = pd.read_csv(hr_file_path, parse_dates=['Server Time'], index_col='Server Time')
    # pre-process audio-pos hive data
    processed_hive_df['audio_start_timestamp'] = processed_hive_df['audio_start_timestamp'].astype('int64')
    processed_hive_df['audio_in_sec'] = pd.to_timedelta(processed_hive_df['audio time']).dt.total_seconds().astype(
        'int64')
    processed_hive_df['timestamp'] = processed_hive_df['audio_start_timestamp'] + processed_hive_df['audio_in_sec']
    # Resample the data to 1Hz frequency, taking the last value if there are multiple within one second
    hr_df = df.resample('1S').last()
    # Drop rows with NaN values that may appear after resampling
    hr_df.fillna(method='ffill', inplace=True)
    hr_df = hr_df.reset_index()
    hr_df = hr_df.rename(columns={'Value': 'heartrate'})
    hr_df['Server Time'] = hr_df['Server Time'].dt.tz_convert('Australia/Melbourne')
    hr_df['hr_timestamp'] = (hr_df['Server Time'] - pd.Timestamp("1970-01-01", tz='UTC')) // pd.Timedelta('1s')
    # sort values by timestamp:
    hr_df = hr_df.sort_values('hr_timestamp')
    # sort values by timestamp:
    merged_df = pd.merge_asof(processed_hive_df, hr_df, left_on='timestamp', right_on='hr_timestamp',
                              direction='nearest')
    return merged_df
