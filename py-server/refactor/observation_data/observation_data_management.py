from typing import Any, Mapping

from util.db_connect_util import *
from refactor.pozyx_data.pozyx_data_management import get_timestamp_from_sync

DATABASE_CONFIGURATION = "2023"


def retrieve_observation_data(simulation_id: str) -> Mapping[str, Any]:
    """
        Retrieves observation data associated with a specific simulation ID from the database.

        Args:
            simulation_id (str): Unique identifier for the simulation.

        Returns:
            Mapping[str, Any]: Retrieved observation data as a dictionary.

        Raises:
            ValueError: If the simulation or associated observation data cannot be found.
        """
    db = connect_to_mongodb_cluster()
    simulation_data = get_collection(db, "simulations").find_one({"simulationId": simulation_id})
    if simulation_data is None:
        raise ValueError(f"could not find any simulation with simulationId : {simulation_id}")
    observation_data = get_collection(db, "observations").find_one(
        {"_id": simulation_data["observation"]})
    if observation_data is None:
        raise ValueError(f"could not find any observations on  simulation with simulation_id : {simulation_id}")
    logger().info(f"observation data retrieved successfully for simulation id : {simulation_id}")
    return observation_data


def extract_timestamps_for_phases(observation_data: Mapping[str, Any]) -> tuple[
    float, float, float]:
    """
        Extracts timestamps for specific key events (handover ends, secondary nurse enters, and doctor enters)
        from the observation data.

        Args:
            observation_data (Mapping[str, Any]): Observation data containing event phases.

        Returns:
            tuple[float, float, float]: Timestamps for handover end, secondary nurse entry, and doctor entry.

        Raises:
            ValueError: If any key phase is missing from the observation data.
        """
    handover_finish_time = None
    secondary_nurses_enter_time = None
    doctor_enter_time = None

    for item in observation_data["phases"]:
        if item["phaseKey"] == "handover_ends":
            handover_finish_time = item["timestamp"].timestamp()
        elif item["phaseKey"] == "secondary_nurse_enters":
            secondary_nurses_enter_time = item["timestamp"].timestamp()
        elif item["phaseKey"] == "doctor_enters":
            doctor_enter_time = item["timestamp"].timestamp()
        elif item["phaseKey"] == "bed_4":
            pass

    if handover_finish_time is None:
        raise ValueError("Phase key 'handover_ends' is missing.")
    if secondary_nurses_enter_time is None:
        raise ValueError("Phase key 'secondary_nurse_enters' is missing.")
    if doctor_enter_time is None:
        raise ValueError("Phase key 'doctor_enters' is missing.")

    logger().info(f"timestamps for key events of the simulation:")
    logger().info(f"handover_finish_time: {handover_finish_time}")
    logger().info(f"secondary_nurses_enter_time: {secondary_nurses_enter_time}")
    logger().info(f"doctor_enter_time: {doctor_enter_time}")
    return handover_finish_time, secondary_nurses_enter_time, doctor_enter_time


def extract_timestamps_from_phases_based_on_year(observation_data: Mapping[str, Any]) -> \
        tuple[float, float, float]:
    """
        Extracts timestamps for specific key events based on the year of the database configuration.

        Args:
            observation_data (Mapping[str, Any]): Observation data containing event phases.

        Returns:
            tuple[float, float, float]: Timestamps for handover end, secondary nurse entry, and doctor entry.

        Raises:
            ValueError: If any key phase is missing from the observation data.
        """
    handover_finish_time = None
    secondary_nurses_enter_time = None
    doctor_enter_time = None

    if DATABASE_CONFIGURATION == "2022":
        for item in observation_data["phases"]:
            if item["phaseKey"] == "handover":
                handover_finish_time = item[
                    "timestamp"].timestamp()
            elif item["phaseKey"] == "ward_nurse":
                secondary_nurses_enter_time = item[
                    "timestamp"].timestamp()
            elif item["phaseKey"] == "met_doctor":
                doctor_enter_time = item[
                    "timestamp"].timestamp()
            elif item["phaseKey"] == "bed_4":
                pass
    elif DATABASE_CONFIGURATION == "2023":
        for item in observation_data["phases"]:
            if item["phaseKey"] == "handover_ends":
                handover_finish_time = item[
                    "timestamp"].timestamp()
            elif item["phaseKey"] == "secondary_nurse_enters":
                secondary_nurses_enter_time = item[
                    "timestamp"].timestamp()
            elif item["phaseKey"] == "doctor_enters":
                doctor_enter_time = item[
                    "timestamp"].timestamp()
            elif item["phaseKey"] == "bed_4":
                pass

    if handover_finish_time is None:
        raise ValueError("Phase key for  'handover' is missing.")
    if secondary_nurses_enter_time is None:
        raise ValueError("Phase key 'secondary' is missing.")
    if doctor_enter_time is None:
        raise ValueError("Phase key 'doctor' is missing.")

    logger().info(f"handover_finish_time: {handover_finish_time}")
    logger().info(f"secondary_nurses_enter_time: {secondary_nurses_enter_time}")
    logger().info(f"doctor_enter_time: {doctor_enter_time}")
    return handover_finish_time, secondary_nurses_enter_time, doctor_enter_time


def process_observation_timestamps(data_dir, doctor_enter_time, handover_finish_time, secondary_nurses_enter_time):
    """
        Adjusts timestamps of key events based on the audio synchronization file.

        Args:
            data_dir (str): Directory containing the sync file.
            doctor_enter_time (float): Timestamp when the doctor enters.
            handover_finish_time (float): Timestamp when the handover finishes.
            secondary_nurses_enter_time (float): Timestamp when secondary nurses enter.

        Returns:
            tuple[float, float, float]: Adjusted timestamps for key events.
        """
    audio_start_timestamp = get_timestamp_from_sync(os.path.join(data_dir, "sync.txt"), "audio")
    handover_finish_time -= audio_start_timestamp
    secondary_nurses_enter_time -= audio_start_timestamp
    doctor_enter_time -= audio_start_timestamp

    logger().info(f" processed timestamps:")
    logger().info(f"audio_start_timestamp:{audio_start_timestamp}")
    logger().info(f"handover_finish_time:{handover_finish_time}")
    logger().info(f"secondary_nurses_enter_time:{secondary_nurses_enter_time}")
    logger().info(f"doctor_enter_time:{doctor_enter_time}")
    return handover_finish_time, secondary_nurses_enter_time, doctor_enter_time
