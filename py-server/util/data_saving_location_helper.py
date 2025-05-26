import logging
import os
from util.env_util import load_env_variable


def set_data_save_location() -> str:
    """
        Determines the directory path for saving data based on environment configuration.

        This function checks the value of `USE_ABSOLUTE_PATH` from the environment variables.
        If set to 'false', it defaults to a predefined local path. If `USE_ABSOLUTE_PATH` is
        set to 'true', it retrieves the path from the `VISUALISATION_DIR` environment variable.

        Returns:
            str: The directory path for saving data.

        Raises:
            KeyError: If `VISUALISATION_DIR` is not defined in the environment when
                      `USE_ABSOLUTE_PATH` is 'true'.
        """

    # Get the value of USE_ABSOLUTE_PATH
    USE_ABSOLUTE_PATH = load_env_variable("USE_ABSOLUTE_PATH")

    # Check if USE_ABSOLUTE_PATH is equal true (defined in the .env located in teamwork-visualiser-dashboard)
    if USE_ABSOLUTE_PATH == 'false':
        # Location defined as teamwork-visualiser-dashboard/server/saved_data/
        # DIRECTORY = os.path.join(parent_directory, 'server', 'saved_data')
        DIRECTORY = "C:\\develop\\saved_data\\"

    else:
        # Assign the DIRECTORY to VISUALISATION_DIR (defined in the .env located in teamwork-visualiser-dashboard)
        DIRECTORY = os.getenv('VISUALISATION_DIR')

    logging.info(f"PYTHON DIRECTORY: {DIRECTORY}")

    return DIRECTORY
