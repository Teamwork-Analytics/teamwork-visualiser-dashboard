from refactor.observation_data.observation_data_management import *
from refactor.pozyx_data.pozyx_data_management import pozyx_json_to_csv
from refactor.video_transcode.video_transcode_management import transcode_video
from refactor.visualisation.file_system_management import configure_folders, configure_paths
from refactor.visualisation.visualisation_general.hive_data_management import generate_csv_files_for_hive, \
    generate_positioning_csv_files
from util.data_save_location_handler import config_data_save_location
from util.file_handling_util import *


def generate_visualization(simulation_id: str):
    """
        Generates all necessary visualizations and processed data files for a given simulation.

        This function orchestrates the following tasks:
        - Configures directories and file paths for simulation data.
        - Retrieves observation data for the simulation.
        - Extracts and processes key timestamps (e.g., handover finish time, secondary nurse entry, doctor entry).
        - Copies synchronization files for alignment.
        - Converts raw Pozyx JSON data to CSV format for visualization.
        - Generates positioning and Hive-related CSV files.
        - Transcodes video files to a standardized format.

        Args:
            simulation_id (str): Unique identifier for the simulation.

        Logs:
            - Key milestones in the visualization generation process, including successful file creations and conversions.
            - Errors or issues encountered during the process.

        Returns:
            None
        """
    session = simulation_id
    base_path = config_data_save_location()
    data_dir, audio_folder, raw_audio_folder, processed_audio_folder, hive_data_folder, hive_positioning_data_folder, hive_csv_output_folder, result_dir = configure_folders(
        simulation_id, base_path)
    json_csv_output_path, raw_pozyx_data_path, sync_txt_path = configure_paths(data_dir, result_dir, session)
    observation_data = retrieve_observation_data(simulation_id)
    handover_finish_time, secondary_nurses_enter_time, doctor_enter_time = extract_timestamps_for_phases(
        observation_data)
    process_observation_timestamps(data_dir,
                                   handover_finish_time,
                                   secondary_nurses_enter_time,
                                   doctor_enter_time)
    copy_file(sync_txt_path, result_dir)
    pozyx_json_to_csv(session, raw_pozyx_data_path, json_csv_output_path)
    logger().info(f"{raw_pozyx_data_path} successfully converted to {json_csv_output_path}")

    generate_positioning_csv_files(hive_positioning_data_folder,
                                   raw_pozyx_data_path, sync_txt_path)
    generate_csv_files_for_hive(hive_csv_output_folder, hive_positioning_data_folder, processed_audio_folder,
                                raw_audio_folder, result_dir, session)
    transcode_video(simulation_id, data_dir, result_dir)
    logger().info("generate_visualisation method ends successfully")


"""
send get request to localhost:5000/audio-pos
"""
if __name__ == '__main__':
    # 286--> working
    generate_visualization("286")
