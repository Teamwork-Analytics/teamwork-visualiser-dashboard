import sys
import os
import pandas as pd


color_mapping = {
    "RED": "R",
    "GREEN": "G",
    "BLUE": "B"
}

pedagogy_types = ['authoritative', 'supervisory', 'interactional', 'personal']

pedagogy_map = {
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
    
    for pedagogy, activities in pedagogy_map.items():
        pedagogy_counts[pedagogy] = {}
        for activity in activities:
            pedagogy_counts[pedagogy][activity] = round(ped_counts.get(activity, 0))
    
    return pedagogy_counts

def get_all_ped_by_teacher(df, teacher:str):
    ta_colour = color_mapping.get(teacher)
    ped_data = counting_by_person(df, ta_colour)
    res = map_pedagogies_by_ta(ped_data)
    return res



# MATRIX CALCULATION
def calc_all_by_teacher_raw(df, teacher_filter):
    ped_columns = ['surveillance', 'assisting', 'monitoring', '1-1 student teacher interaction', 'teacher-teacher interaction', 'lecturing', 'personal', 'watching']

    ta_filtered_df = df[df['TA'] == teacher_filter]

    # Count the occurrences of each activity
    ped_counts = ta_filtered_df[ped_columns].sum()

    return ped_counts.to_dict()
            
def get_matrix(data):
    result = {}
    for ta in color_mapping.keys():
        result[ta] = {}
        calc_data = calc_all_by_teacher_raw(data, color_mapping[ta])
        temp ={}
        for pedagogy, activities in pedagogy_map.items():
            result[ta][pedagogy] = sum(calc_data[activity] for activity in activities if activity in calc_data)
        temp = result[ta][pedagogy] 
        total = sum(result[ta].values())
        temp = {
            pedagogy: round((count / total) * 100) for pedagogy, count in result[ta].items()
        }
        result[ta]=temp
    return result





# UNFINISHED!

def countring_by_pedagogy(pedagogy_type:str):
    return 

def get_teachers_by_pedagogy(pedagogy_type: str):

    primary = [22, 32, 4] # red, green, blue
    secondary = [17, 22, 13] # red, green, blue
    result = [primary, secondary]
    return result



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
    DIRECTORY = "E:\\research\\projects\\teamwork-visualiser-dashboard\\server\\saved_data\\"

    data = read_csv_by_time(DIRECTORY, session_id, start_time, end_time)
    # result = get_all_ped_by_teacher(data, teacher)
    result = get_matrix(data)

    print(result)


    # print(get_timestamp("Rio/pozyx/sync.txt"))
