"""
file_handling_util.py

This module provides utility functions for handling files/folders
"""

import os
import shutil
from util.logging_util import logger


def check_path_exist(path) -> bool:
    """
    Checks if a file or folder exists at the given path.

    Args:
        path (str): The path to the file or folder.

    Returns:
        bool: True if the file or folder exists, False otherwise.

    Example:
        >>> check_path_exist("/path/to/file_or_folder")
        True
    """
    return os.path.exists(path)


def clean_up_delete(folder):
    """
     Deletes all files and subfolders within the specified folder.

     This function iterates through the contents of the folder and deletes
     files, symbolic links, and subdirectories.

     Args:
         folder (str): The path to the folder to clean.

     Raises:
         Exception: If an error occurs while deleting a file or folder,
                    the exception is logged

     Example:
         >>> clean_up_delete("/path/to/folder")
         # Logs the success or failure of each deletion.
     """
    for filename in os.listdir(folder):
        file_path = os.path.join(folder, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
                logger().info(f"successfully delete files in {file_path}")
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
                logger().info(f"successfully delete files in {file_path}")
        except Exception as e:
            logger().exception(f"failed to delete files in {file_path}")


def copy_file(source_path, destination_path):
    """
        Copies a file to another file or folder.

        If the destination is a folder, the source file is copied into the folder.
        If the destination is a file, the source file is copied and replaces the destination file.

        Args:
            source_path (str): The path to the source file.
            destination_path (str): The path to the destination file or folder.

        Raises:
            FileNotFoundError: If the source file or destination folder does not exist.
            PermissionError: If the operation lacks necessary permissions.
            Exception: For any other errors, the exception is logged.

        Example:
            >>> copy_file("/path/to/source_file.txt", "/path/to/destination_folder/")
            # Logs success or failure of the copy operation.
        """
    try:
        shutil.copy(source_path, destination_path)
        logger().info(f"{source_path} copied to {destination_path} successfully")
    except FileNotFoundError:
        logger().exception(f"couldn't find file/directory")
    except PermissionError:
        logger().exception(f" do not have permission for this operation")
    except Exception as e:
        logger().exception(f"failed to copy {source_path} to {destination_path}")


def create_path(path):
    """
        Creates a directory at the specified path if it does not already exist.

        This function:
        - Checks if the directory exists.
        - Creates the directory if it does not exist.
        - Logs success or failure messages.

        Args:
            path (str): The path of the directory to create.

        Returns:
            str: The created directory path if successful.

        Logs:
            - Debug log if the directory is successfully created.
            - Info log if the directory already exists.
            - Exception logs for permission errors or other unexpected failures.

        Raises:
            PermissionError: If the operation lacks necessary permissions.
            Exception: For other errors encountered during directory creation.
        """
    try:
        if not check_path_exist(path):
            os.makedirs(path)
            logger().debug(f"{path} created successfully")
            return path
        else:
            logger().info(f"{path} already exists")
            return path
    except PermissionError:
        logger().exception(f" do not have permission for this operation")
    except Exception as e:
        logger().exception(f"failed to create {path}")
