"""
error_handling_util.py

This module provides utility functions for error handling
"""
from util.validation_util import validate_string_argument, validate_http_status_code


def build_http_error_response(error_message: str, status_code: int) -> tuple[str, int]:
    """
    Constructs an HTTP error response with the provided error message and status code.

    This function validates that the `error_message` is a non-empty string and the `status_code`
    is a valid HTTP status code. It returns a tuple containing the error message and status code,
    suitable for use in HTTP responses. The function also logs the error message for tracking purposes.

    Args:
        error_message (str): The error message to include in the HTTP response.
        status_code (int): The HTTP status code to associate with the error response.

    Returns:
        tuple[str, int]: A tuple containing the error message and status code.

    Raises:
        TypeError: If `error_message` is not a string or `status_code` is not an integer.
        ValueError: If `error_message` is an empty or whitespace-only string, or
                    `status_code` is not a valid HTTP status code.

    Example:
        >>> build_http_error_response("Bad Request", 400)
        ('Bad Request', 400)

        >>> build_http_error_response("", 400)
        ValueError: The provided value is an empty or whitespace-only string

        >>> build_http_error_response("Bad Request", 999)
        ValueError: The provided status code 999 is not a valid HTTP status code
    """
    validate_string_argument(error_message)
    validate_http_status_code(status_code)
    return error_message, status_code
