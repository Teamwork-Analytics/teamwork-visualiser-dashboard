"""
validation_util.py

This module provides utility function for creating logger
from logging configuration file.
"""

import logging.config
import os
from logging import Logger
import yaml


def logger() -> Logger:
    """
        Creates and configures a logger from the logging configuration file.

        This function reads a YAML configuration file, sets up the logging system
        using the configuration, and returns the root logger for use in the application.

        Returns:
            Logger: The configured logger instance.

        Example:
            >>> from util.logging_util import logger
            >>> log = logger()
            >>> log.info("This is an informational message.")
            >>> log.error("This is an error message.")
        """
    config_path = os.path.join(os.path.dirname(__file__), '..', 'config', 'logging_config.yaml')
    with open(config_path, 'r') as file:
        config = yaml.safe_load(file)
    logging.config.dictConfig(config)
    return logging.getLogger()
