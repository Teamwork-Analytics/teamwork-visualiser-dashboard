import os
from dotenv import load_dotenv
from util.validation_util import validate_string_argument


def load_env_file(path: str) -> bool:
    """
        Loads environment variables from the specified .env file.

        This function validates the provided file path and then loads the environment
        variables from the .env file located at that path.

        Args:
            path (str): The path to the .env file.

        Returns:
            bool: True if the .env file was loaded successfully, False otherwise.

        Raises:
            ValueError: If `path` is not a valid, non-empty string.
        """

    validate_string_argument(path)
    return load_dotenv(path)


def load_env_variable(key: str) -> str:
    """
        Retrieves the value of an environment variable by its key.

        This function validates the key as a non-empty string, then fetches the value
        of the environment variable associated with that key.

        Args:
            key (str): The key of the environment variable to retrieve.

        Returns:
            str: The value of the environment variable, or None if the variable is not found.

        Raises:
            ValueError: If `key` is not a valid, non-empty string.
        """

    validate_string_argument(key)
    return os.getenv(key)
