import datetime


def get_timestamp_from_sync(sync_path: str, timestamp_type: str):
    """
        Extracts the start timestamp for a specific type (audio or positioning) from the sync file.

        Args:
            sync_path (str): Path to the sync file.
            timestamp_type (str): Type of timestamp to extract ("audio" or "positioning").

        Returns:
            float: Extracted timestamp.

        Raises:
            ValueError: If the specified timestamp type is invalid.
        """
    with open(sync_path) as f:
        sync_content = f.readlines()

    positioning_start_line = ""
    for line in sync_content:
        # find the line containing what we want
        if timestamp_type == "positioning":
            if "start receive position" in line and "baseline" not in line:
                positioning_start_line = line
                break
        elif timestamp_type == "audio":
            if "audio start" in line and "baseline" not in line:
                positioning_start_line = line
                break
        else:
            raise ValueError("'{}' is not a supported timestamp type to extract. Try to set timestamp type as audio or "
                             "positioning")

    time_string = positioning_start_line.split("_____")[1]
    # 01-Sep-2021_13-19-37-929 %d-%b-%Y-%H-%M-%S-%f

    # configure the timezone for the striptime:
    # https://statisticsglobe.com/convert-datetime-to-different-time-zone-python
    date = datetime.datetime.strptime(time_string.strip() + "-+1000", "%Y-%m-%d_%H-%M-%S-%f-%z")
    timestamp = date.timestamp()

    # timestamp = datetime.datetime.timestamp(date)
    return timestamp
