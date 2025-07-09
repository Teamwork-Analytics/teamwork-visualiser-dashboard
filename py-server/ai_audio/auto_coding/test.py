import json
import os


# print(awdawd)
def show_loc():
    abs_path = os.path.dirname(__file__)
    print(abs_path)
    print("awdawd")
    relative_path = "configuration_file/json_configuration_for_paper.json"
    print(os.path.join(abs_path, "configuration_file", "json_configuration_for_paper.json"))
    print(os.path.exists(os.path.join(abs_path, relative_path)))

    with open(os.path.join(abs_path, relative_path), "r") as fp:
        test = json.load(fp)
    # with open(os.path.join(abs_path, relative_path), "r") as fp:
    #     test = json.load(fp)
    print(test)
