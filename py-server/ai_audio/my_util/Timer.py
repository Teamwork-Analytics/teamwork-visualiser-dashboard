import os
from time import time
import subprocess


class Timers:
    start_time = -1
    end_time = -1

    @staticmethod
    def calculate_time_effciecny(func):
        def wrap_func(*args, **kwargs):
            t1 = time()
            print(f'===== Function {func.__name__!r} started ======')
            result = func(*args, **kwargs)
            t2 = time()
            print("------------------------------")
            print(f'Function {func.__name__!r} executed in {(t2 - t1):.4f}s')
            print("------------------------------")
            if Timers.start_time == -1:
                Timers.start_time = t1
            Timers.end_time = t2
            return result

        return wrap_func

    @staticmethod
    def print_total_running_time():
        print("************************************************")
        print("All function finished, took {} seconds".format(time() - Timers.start_time))

    @staticmethod
    def initialise_start_time():
        Timers.start_time = time()


if __name__ == '__main__':
    command = """
    echo Hello, World!
    echo This is a multi-line command.
    echo It can be executed using subprocess in Python.
    """

    # Run the command
    result = subprocess.run(["cmd", "/c", "dummy.bat"], capture_output=True, text=True)
    print(result)
    print("=============")
    # Print the output
    if result.returncode == 0:
        print(result.stdout)
    else:
        print("Command execution failed. Error message:")
        print(result.stderr)