import os
import ast
from collections import defaultdict


def extract_functions_with_content(root_dir, exclude_dirs=None):
    if exclude_dirs is None:
        exclude_dirs = ['venv', '.venv', '__pycache__']  # Directories to exclude

    functions = defaultdict(list)

    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Exclude unwanted directories
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]

        for filename in filenames:
            if filename.endswith(".py"):
                file_path = os.path.join(dirpath, filename)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as file:
                        tree = ast.parse(file.read(), filename=file_path)
                        for node in ast.walk(tree):
                            if isinstance(node, ast.FunctionDef):
                                # Normalize function content (ignores formatting)
                                func_content = ast.dump(node)
                                functions[func_content].append((node.name, file_path))
                except Exception as e:
                    print(f"Error parsing {file_path}: {e}")

    duplicates = {content: locations for content, locations in functions.items() if len(locations) > 1}
    return duplicates


if __name__ == '__main__':
    root_directory = "/home/dasun-dev/python-workspace/mmla-tool/py-server-main/ai_audio"
    duplicates_by_content = extract_functions_with_content(root_directory,
                                                           exclude_dirs=['venv', '.venv', '__pycache__'])

    for content, occurrences in duplicates_by_content.items():
        print("Duplicate function content found:")
        for func_name, file_path in occurrences:
            # clickable_path = f"\033[34m{file_path}\033[0m"
            print(f"  - Function '{func_name}'")
            print(f" - {file_path}")
        print("=================================")
