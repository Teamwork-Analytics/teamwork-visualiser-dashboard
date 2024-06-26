import json



import pandas



RED_ID = 27226

BLUE_ID = 27209
# before 318 green id is 27160
GREEN_ID = 27176

YELLOW_ID = 27263

ID_TO_COLOR = {27209: "blue", 27176: "green", 27226: "red", 27263: "yellow"}

REGION_COLORS = ("region_blue", "region_green", "region_red", "region_yellow")

REGION_COLORS_TO_INDEX = {"region_blue": 0, "region_green": 1, "region_red": 2, "region_yellow": 3}





def generate_files_J_visualisation(session_id, json_path: str, output_csv_path: str):

    """实际调用的function，生成相应的文件"""

    a_dict = generate_poxyz_data_J_visualization(json_path, session_id)

    blue = pandas.DataFrame(a_dict)

    blue.to_csv(output_csv_path)





def generate_poxyz_data_J_visualization(path: str,session_id):

    """提取pozyx内的信息"""



    def gen_sub_dict():

        another_dict = {}

        another_dict["timestamp"] = []

        another_dict["x"] = []

        another_dict["y"] = []

        another_dict["z"] = []

        another_dict["yaw"] = []

        another_dict["roll"] = []

        another_dict["pitch"] = []

        another_dict["latency"] = []

        another_dict["student"] = []

        another_dict["session"] = []

        another_dict["success"] = []

        return another_dict



    a_dict = gen_sub_dict()



    jsons = loading_json(path)

    for line in jsons:

        tag_id = int(line["tagId"])

        if tag_id in (BLUE_ID, GREEN_ID, YELLOW_ID, RED_ID):

            if bool(line["success"]):

                a_dict["timestamp"].append(line["timestamp"])

                a_dict["x"].append(line["data"]["coordinates"]["x"])

                a_dict["y"].append(line["data"]["coordinates"]["y"])

                a_dict["z"].append(line["data"]["coordinates"]["z"])

                a_dict["yaw"].append(line["data"]["orientation"]["yaw"])

                a_dict["roll"].append(line["data"]["orientation"]["roll"])

                a_dict["pitch"].append(line["data"]["orientation"]["pitch"])

                a_dict["latency"].append(line["data"]["metrics"]["latency"])

                a_dict["session"].append(session_id)

                a_dict["success"].append("TRUE")



                if tag_id == BLUE_ID:

                    a_dict["student"].append("blue")

                elif tag_id == GREEN_ID:

                    a_dict["student"].append("green")

                elif tag_id == RED_ID:

                    a_dict["student"].append("red")

                elif tag_id == YELLOW_ID:

                    a_dict["student"].append("yellow")

                else:

                    raise ValueError("tag id error")

    return a_dict





def loading_json(path: str):

    """解析pozyx的json数据"""

    json_list = []

    with open(path, "r", encoding="utf8") as f:

        lines = f.readlines()

        for line in lines:

            if len(line) > 3:

                string = line.strip()

                json_list.append(json.loads(string[1:-1]))

    return json_list




def pozyx_json_to_csv(session_id, pozyx_json_path, output_path):
    # session_id = 141
    #
    # pozyx_json_path = "pozyx data/149.json"
    #
    # output_path = "pic/testJoutput.csv"

    

    generate_files_J_visualisation(session_id, pozyx_json_path, output_path)

