import os

from util.file_handling_util import create_path
from util.logging_util import logger


def configure_folders(simulation_id: str, base_path: str):
    """
        Configures and creates the directory structure for storing simulation data.

        This function:
        - Sets up folders for raw and processed audio, positioning data, and Hive-related outputs.
        - Ensures all required directories are created.
        - Logs the paths of all configured directories.

        Args:
            simulation_id (str): The unique identifier for the simulation session.
            base_path (str): The base directory where simulation data will be stored.

        Returns:
            tuple: Paths to the following directories:
                - `data_dir` (str): Main directory for simulation data.
                - `audio_folder` (str): Directory for audio files.
                - `raw_audio_folder` (str): Directory for raw audio files.
                - `processed_audio_folder` (str): Directory for processed audio files.
                - `hive_data_folder` (str): Directory for Hive data.
                - `hive_positioning_data_folder` (str): Directory for Hive positioning data.
                - `hive_csv_output_folder` (str): Directory for Hive CSV outputs.
                - `result_dir` (str): Directory for simulation results.

        Raises:
            Exception: If folder creation fails.

        Logs:
            - Information about the successfully created directories.
            - Errors encountered during folder creation.
        """
    try:
        session = simulation_id
        data_dir = os.path.join(base_path, str(session))
        audio_folder = os.path.join(data_dir, "audio")
        positioning_data_folder = os.path.join(data_dir, "positioning_data")
        raw_audio_folder = os.path.join(data_dir)

        processed_audio_folder = create_path(
            os.path.join(audio_folder, "processed_audio"))
        hive_data_folder = create_path(
            os.path.join(data_dir, "hive_data_folder"))
        hive_positioning_data_folder = create_path(
            os.path.join(hive_data_folder, "pos"))
        hive_csv_output_folder = create_path(
            os.path.join(hive_data_folder, "result"))
        processed_pozyx_folder = create_path(
            os.path.join(positioning_data_folder, "pozyx_json_csv"))
        raw_pozyx_data_folder = create_path(
            os.path.join(positioning_data_folder, "raw_positioning"))

        result_dir = create_path(os.path.join(data_dir, "result"))

        logger().info(f"data directory for simulation :{data_dir}")
        logger().info(f" following folder have successfully created under :{data_dir}")
        logger().info(f"audio_folder :{audio_folder}")
        logger().info(f"raw_audio_folder :{raw_audio_folder}")
        logger().info(f"processed_audio_folder :{processed_audio_folder}")
        logger().info(f"hive_data_folder:{hive_data_folder}")
        logger().info(f"hive_positioning_data_folder:{hive_positioning_data_folder}")
        logger().info(f"processed_pozyx_folder:{processed_pozyx_folder}")
        logger().info(f"raw_pozyx_data_folder:{raw_pozyx_data_folder}")
        logger().info(f"hive_csv_output_folder:{hive_csv_output_folder}")
        logger().info(f"result_dir:{result_dir}")
        return data_dir, audio_folder, raw_audio_folder, processed_audio_folder, hive_data_folder, hive_positioning_data_folder, hive_csv_output_folder, result_dir

    except Exception:
        logger().exception("Failed to create folder")
        raise


def configure_paths(data_dir, result_dir, session):
    """
       Configures the file paths for JSON, Pozyx, and sync files required for the simulation.

       This function:
       - Constructs paths for key files like JSON output, raw Pozyx data, and the synchronization file.
       - Logs the configured paths for debugging and validation.

       Args:
           data_dir (str): The main directory containing simulation data.
           result_dir (str): The directory for storing output results.
           session (str): The session identifier for the simulation.

       Returns:
           tuple: Paths to the following files:
               - `json_csv_output_path` (str): Path for the generated JSON CSV file.
               - `raw_pozyx_data_path` (str): Path for the raw Pozyx data file.
               - `sync_txt_path` (str): Path for the synchronization file.

       Logs:
           - Details of all configured paths.
       """
    json_csv_output_path = os.path.join(
        result_dir, "{}.csv".format(session))
    raw_pozyx_data_path = os.path.join(data_dir, "{}.json".format(session))
    sync_txt_path = os.path.join(data_dir, "sync.txt")
    logger().info(f"following paths configured (not yet created) successfully")
    logger().info(f"json_csv_output_path:{json_csv_output_path}")
    logger().info(f"raw_pozyx_data_path:{raw_pozyx_data_path}")
    logger().info(f"sync_txt_path:{sync_txt_path}")
    return json_csv_output_path, raw_pozyx_data_path, sync_txt_path
