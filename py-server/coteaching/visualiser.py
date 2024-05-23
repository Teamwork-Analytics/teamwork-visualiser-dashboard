import sys
import os
import pandas as pd
import get_text from textDescriptions

COLOUR_MAPPING = {
    "RED": "R",
    "GREEN": "G",
    "BLUE": "B"
}

PEDAGOGY_TYPES = ['authoritative', 'supervisory', 'interactional', 'personal']

PEDAGOGY_MAP = {
    "authoritative":["lecturing", "assisting"],
    "supervisory": ["monitoring", "surveillance"],
    "interactional": ["1-1 student teacher interaction","teacher-teacher interaction"],
    "personal":["personal","watching"]
}

def read_csv_by_time(DIRECTORY, session_id, start_time, end_time):
    file_new = "%s_coteach.csv" % session_id
    # file_path = DIRECTORY / session_id / "result" / file
    file_path = os.path.join(DIRECTORY, session_id, "result", file_new)

    df = pd.read_csv(file_path)
    start_time_int = int(start_time)
    end_time_int = int(end_time)

    # Filter the DataFrame based on the given start_time and end_time
    filtered_df = df[(df['seconds_int'] >= start_time_int) & (df['seconds_int'] <= end_time_int)]
    
    return filtered_df


# FILTER BY PERSON, get percentage immediately
def counting_by_person(df, colour_symbol:str):
    
    ta_filtered_df = df[df['TA'] == colour_symbol]
    # Drop columns that are not activity related
    ped_columns = ['surveillance', 'assisting', 'monitoring', '1-1 student teacher interaction', 'teacher-teacher interaction', 'lecturing', 'personal', 'watching']
    
    # Count the occurrences of each activity
    ped_counts = ta_filtered_df[ped_columns].sum()

    # Calculate the total counts of activities
    total_counts = ped_counts.sum()
    
    # Calculate percentages
    ped_percentages = (ped_counts / total_counts) * 100
    
    return ped_percentages


def map_pedagogies_by_ta(ped_counts):
    pedagogy_map = {
        "authoritative": ["lecturing", "assisting"],
        "supervisory": ["monitoring", "surveillance"],
        "interactional": ["1-1 student teacher interaction", "teacher-teacher interaction"],
        "personal": ["personal", "watching"]
    }
    
    # Create a dictionary to store the mapped activity counts
    pedagogy_counts = {}
    
    # loop through and round the percentage
    for pedagogy, activities in pedagogy_map.items():
        pedagogy_counts[pedagogy] = {}
        for activity in activities:
            pedagogy_counts[pedagogy][activity] = round(ped_counts.get(activity, 0))
    
    return pedagogy_counts

def get_all_ped_by_teacher(df, teacher:str):
    ta_colour = COLOUR_MAPPING.get(teacher)
    ped_data = counting_by_person(df, ta_colour)
    res = map_pedagogies_by_ta(ped_data)
    return res

## Wrapper around function
def get_textual_description(df, teacher_filter:str):
    text = get_text(df,teacher_filter)
    return text

# MATRIX CALCULATION
def calc_all_by_teacher_raw(df, teacher_filter):
    ped_columns = ['surveillance', 'assisting', 'monitoring', '1-1 student teacher interaction', 'teacher-teacher interaction', 'lecturing', 'personal', 'watching']

    ta_filtered_df = df[df['TA'] == teacher_filter]

    # Count the occurrences of each activity
    ped_counts = ta_filtered_df[ped_columns].sum()

    return ped_counts.to_dict()
            
def get_matrix(data):
    result = {}
    for ta in COLOUR_MAPPING.keys():
        result[ta] = {}
        calc_data = calc_all_by_teacher_raw(data, COLOUR_MAPPING[ta])
        temp ={}
        for pedagogy, activities in PEDAGOGY_MAP.items():
            result[ta][pedagogy] = sum(calc_data[activity] for activity in activities if activity in calc_data)
        temp = result[ta][pedagogy] 
        total = sum(result[ta].values())
        temp = {
            pedagogy: round((count / total) * 100) for pedagogy, count in result[ta].items()
        }
        result[ta]=temp
    return result


# UNFINISHED!
def counting_by_pedagogy(df, pedagogy_filter, teacher_filter):
    ta_filtered_df = df[df['TA'] == teacher_filter]

    ped_columns = PEDAGOGY_MAP[pedagogy_filter]
    
    # Count the occurrences of each activity
    ped_counts = ta_filtered_df[ped_columns].sum()

    # # Calculate the total counts of activities
    total_counts = ped_counts.sum()
    
    # # Calculate percentages
    activity_percentages = (ped_counts / total_counts) * 100
    
    # return total_counts
    return activity_percentages.to_dict()



def get_complete_coteach_data(data):
    result = {}
    for ta in COLOUR_MAPPING.keys(): 
        result[ta] = {}
        calc_data = calc_all_by_teacher_raw(data, COLOUR_MAPPING[ta])
        result[ta] = calc_data
        total = sum(result[ta].values())
        temp = {
            pedagogy: round((count / total) * 100) for pedagogy, count in result[ta].items()
        }
        result[ta]=temp

    # Function to convert the data based on the mapping
    res = {category: {} for category in PEDAGOGY_MAP}
    for color, activities in result.items():
        for category, activity_list in PEDAGOGY_MAP.items():
            if color not in res[category]:
                res[category][color] = {}
            for activity in activity_list:
                if activity in activities:
                    res[category][color][activity] = activities[activity]
    return res


    # result = {}
    # for ped in pedagogy:
    #     result[ped] = {}
    #     for ta in ta_colours:
    #         result[ped][ta] = counting_by_pedagogy(data, ped, ta)

    # return result



if __name__ == '__main__':
    ### example ###
    # generate_single_file("C:\\develop\\saved_data\\181\\181.json", "C:\\develop\\saved_data\\181\\")
    #
    # # code for extracting pozyx start timestamp
    # print(get_timestamp("pozyx test/sync.txt"))
    start_time = 0
    end_time = 3000
    session_id = "374"
    teacher = 'GREEN'
    # DIRECTORY = "E:\\research\\projects\\teamwork-visualiser-dashboard\\server\\saved_data\\"
    DIRECTORY = "/Users/riordanalfredo/Desktop/research-softeng/teamwork-visualiser-dashboard/server/saved_data"

    data = read_csv_by_time(DIRECTORY, session_id, start_time, end_time)
    result = get_all_ped_by_teacher(data, teacher)
    # result = get_matrix(data)

    print(result)


    # print(get_timestamp("Rio/pozyx/sync.txt"))
