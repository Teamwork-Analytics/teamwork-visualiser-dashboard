import os

import pandas as pd

from refactor.helper.sync_file_processor import get_timestamp_from_sync
from refactor.ipa.ipa_data_management import IPA_for_front_end


def get_task_prioritisation_graph_data(data_folder: str, session_id: str, start_time, end_time):
    file = "%s.csv" % session_id
    dir_path = os.path.join(data_folder, session_id, "result")
    file_path = os.path.join(dir_path, file)
    sync_data_path = os.path.join(dir_path, "sync.txt")
    positioning_start_timestamp = get_timestamp_from_sync(
        sync_data_path, "positioning")
    processed_pozyx_data = pd.read_csv(file_path)
    output_data = IPA_for_front_end(processed_pozyx_data, session_id, positioning_start_timestamp,
                                    start_time, end_time)
    return output_data
