import platform

system = platform.system()


def is_windows() -> bool:
    """
        Checks if the current operating system is Windows.

        Returns:
            bool: True if the operating system is Windows, otherwise False.

        Example:
            >>> is_windows()
            True
        """
    if system == "Windows":
        return True
    else:
        return False


def is_linux() -> bool:
    """
        Checks if the current operating system is Linux.

        Returns:
            bool: True if the operating system is Linux, otherwise False.

        Example:
            >>> is_linux()
            False
        """
    if system == "Linux":
        return True
    else:
        return False


def is_mac_os() -> bool:
    """
        Checks if the current operating system is macOS.

        Returns:
            bool: True if the operating system is macOS (Darwin), otherwise False.

        Example:
            >>> is_mac_os()
            False
        """
    if system == "Darwin":
        return True
    else:
        return False
