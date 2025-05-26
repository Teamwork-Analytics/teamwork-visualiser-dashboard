from http import HTTPStatus

"""
validation_util.py

This module provides utility functions for validating various types of input.
Each validation function raises an exception if the input is invalid, helping
to enforce input constraints throughout the application.

Functions:
    validate_string_argument(value: str) -> bool: Validates that the input is a non-empty string.
"""


def validate_string_argument(value: str) -> bool:
    """
        Validates that the provided value is a non-empty string.

        Args:
            value (str): The string input to validate.

        Returns:
            bool: True if the input is a valid, non-empty string.

        Raises:
            ValueError: If `value` is not a string or is an empty/whitespace-only string.
    """

    if not isinstance(value, str):
        raise ValueError("The input must be a string.")
    if not value.strip():
        raise ValueError("The string cannot be empty or whitespace.")
    return True


def validate_http_status_code(status_code: int) -> bool:
    """
    Validates whether a given status code is a valid HTTP status code.

    Args:
        status_code (int): The HTTP status code to validate.

    Returns:
        bool: True if the status code is valid, False otherwise.

    Raises:
        ValueError: If the provided status code is not a valid HTTP status code.
    """
    if not isinstance(status_code, int):
        raise ValueError("The status code must be an integer.")

    if status_code in [code.value for code in HTTPStatus]:
        return True
    else:
        raise ValueError(f"{status_code} is not a valid HTTP status code.")
