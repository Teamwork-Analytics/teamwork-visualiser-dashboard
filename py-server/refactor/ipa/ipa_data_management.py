import os
import warnings
import pandas as pd
import numpy as np
from datetime import datetime

warnings.filterwarnings("ignore")


# calculate the number of unique IDs

def numberTrackers(df):
    tracker = df.student.unique()

    return len(tracker)


# assign an number to each ID starting from 1 to the total number of unique IDs

def enumerate_trackers(df):
    df_trackers = df.groupby(['student'], as_index=False)['timestamp'].count()

    df_trackers = df_trackers[['student']].set_index('student')

    prev_index = '-1'

    cont = 0

    enumeration = []

    for index, track in df_trackers.iterrows():

        if (index != prev_index):

            cont = cont + 1

        else:

            cont = 1

        enumeration.append(cont)

        prev_index = index

    df_trackers['enumeration'] = enumeration

    df_trackers.reset_index(level=0, inplace=True)

    return df_trackers


# assign the enumtrackers to the whole df

def asignEnumTrackers(df, enum_trackers):
    # create a dict that contains all the mapping ID:Enumeration

    IdtoEnumDct = enum_trackers.set_index('student')['enumeration'].to_dict()
    # print(IdtoEnumDct)

    # create an enumeration from mapping ID to the dict

    df['enumeration'] = df['student'].map(IdtoEnumDct)

    # print(df)

    return df


'''Distance'''


def pivot_table(df):
    df_pivot = df.pivot_table(

        index=['timestamp'],

        columns='enumeration',

        values=["x", "y", 'yaw']).reset_index()

    df_pivot.reset_index(level=0, inplace=True)

    df_pivot['timestamp'] = pd.to_datetime(df_pivot['timestamp'])

    df_pivot = df_pivot.set_index('timestamp').asfreq('1S')

    df_pivot['timestamp'] = df_pivot.index

    df_pivot = df_pivot.reset_index(drop=True)

    return df_pivot


# filling in missing data using linear interpolation

def fillmissing(df_pivoted):
    df_pivoted = df_pivoted[df_pivoted['index'].notna()]

    df_pivoted['x'] = df_pivoted['x'].interpolate(method='linear', axis=0, limit=60, limit_direction='both',
                                                  limit_area='inside')

    df_pivoted['y'] = df_pivoted['y'].interpolate(method='linear', axis=0, limit=60, limit_direction='both',
                                                  limit_area='inside')

    df_pivoted['yaw'] = df_pivoted['yaw'].interpolate(method='linear', axis=0, limit=60, limit_direction='both',
                                                      limit_area='inside')

    return df_pivoted


# assign proximity label to the distance

def proxemics(x):
    if 1000 >= x >= 0:

        x = 1

    elif x > 1000:

        x = 0

    else:

        x = np.NaN

    return x


'''This should only use for sessions with all students'''


# Input: pivoted dataframe, number of tracker

# Output: proximity matrix

def proxemicsLabelssimple(df_pivoted, numberOfTrackers):
    df_proxemics = pd.DataFrame(columns=['timestamp'])

    df_proxemics['timestamp'] = df_pivoted['timestamp']

    for x in range(1, numberOfTrackers):

        for i in range(x + 1, numberOfTrackers + 1):
            PLables_column_name = str(x) + '_' + str(i)

            df_proxemics[PLables_column_name] = (np.sqrt((df_pivoted['x', i] - df_pivoted['x', x]) ** 2 + (

                    df_pivoted['y', i] - df_pivoted['y', x]) ** 2)).map(lambda x: proxemics(x))

    # df_pivoted.drop(['X', 'Y',], axis=1, level = 0, inplace = True)

    # df_pivoted.columns= df_pivoted.columns.droplevel(level = 1)

    return df_proxemics


'''Proximity to meaningful spaces'''


def proximity(x, distance, a):
    if distance >= x >= 0:

        x = a

    elif x > distance:

        x = 'in'

    else:

        x = 'out'

    return x


def proxemicsSpaces(df_pivoted, numberOfTrackers, dfco):
    df_proxemics = pd.DataFrame(columns=['timestamp'])

    df_proxemics['timestamp'] = df_pivoted['timestamp']

    arealist = dfco.area.unique()

    for i in range(1, numberOfTrackers + 1):

        for a in arealist:
            PLables_column_name = str(i) + '/' + str(a)

            distance = float(dfco[dfco.area == a].distance)

            area_x = float(dfco[dfco.area == a].x)

            area_y = float(dfco[dfco.area == a].y)

            df_proxemics[PLables_column_name] = np.sqrt((df_pivoted['x', i] - area_x) ** 2 +

                                                        (df_pivoted['y', i] - area_y) ** 2).map(
                lambda x: proximity(x, distance, a))

    return df_proxemics


def spacefilter(x):
    length = len(x)

    if length == 1:

        result = x[0]



    elif length == 2:

        temp = [i for i in x if 'Centre' not in i.split('_')]

        if len(temp) == 1:

            result = temp[0]

        else:

            temp = [i for i in x if 'Patient' not in i.split('_')]

            result = temp[0]



    elif length == 3:

        temp = [i for i in x if 'Patient' not in i.split('_') and 'Centre' not in i.split('_')]

        result = temp[0]

    return result


def proximitylabel(df_proxemics, EnumtoIdDct, numberOfTrackers):
    df_proxemicsLabel = pd.DataFrame(columns=['timestamp'])

    df_proxemicsLabel['timestamp'] = df_proxemics['timestamp']

    columnlist = df_proxemics.columns[1:]

    for i in range(1, numberOfTrackers + 1):
        templist = [x for x in columnlist if '{}/'.format(i) in x]

        color = EnumtoIdDct[i]

        df_proxemicsLabel[color] = df_proxemics[templist].values.tolist()

        df_proxemicsLabel[color] = df_proxemicsLabel[color].map(lambda x: [i for i in x if i != 'in'])

        df_proxemicsLabel[color] = df_proxemicsLabel[color].map(lambda x: 'out' if 'out' in x else x)

        df_proxemicsLabel[color] = df_proxemicsLabel[color].map(lambda x: 'in' if len(x) == 0 else x)

        df_proxemicsLabel[color] = df_proxemicsLabel[color].map(lambda x: spacefilter(x) if type(x) == list else x)

    return df_proxemicsLabel


'''Using Proximity to identify co-locations'''


def proxemicsCo(x):
    # 0=intimate, 1=personal, 2=social, 3=public, 999=other values

    if 1000 > x >= 0:

        x = 1

    elif x >= 1000:

        x = 0

    else:

        x = np.NaN

    return x


def proxemicsCollaboration(df_pivoted, numberOfTrackers, EnumtoIdDct):
    df_proxemicsCo = pd.DataFrame(columns=['timestamp'])

    df_proxemicsCo['timestamp'] = df_pivoted['timestamp']

    for x in range(1, numberOfTrackers):

        student1 = EnumtoIdDct[x]

        for i in range(x + 1, numberOfTrackers + 1):
            student2 = EnumtoIdDct[i]

            PLables_column_name = student1 + '_' + student2

            df_proxemicsCo[PLables_column_name] = (np.sqrt((df_pivoted['x', i] - df_pivoted['x', x]) ** 2 + (

                    df_pivoted['y', i] - df_pivoted['y', x]) ** 2)).map(lambda x: proxemicsCo(x))

    return df_proxemicsCo


'''Socio-procedural code'''

dicLA = {11: 'CP',

         21: 'CS',

         10: 'IP',

         20: 'IS',

         31: 'TD',

         30: 'TT',

         40: 'Out'}


def learningActions(df_proxemicsLabel, df_proxemicsCo, scenario):
    dfLA = pd.DataFrame(columns=['timestamp'])

    dfLA['timestamp'] = df_proxemicsLabel['timestamp']

    studentlist = df_proxemicsLabel.columns[1:]

    '''Learning Actions for each scenario'''

    priorityA = ['B4_Laptop', 'B4_Centre', 'B4_Monitor', 'B4_Oxygen', 'B4_Patient',

                 'Resource_Phone']

    secondaryA = ['B2_Laptop', 'B2_Centre', 'B2_Monitor', 'B2_Oxygen', 'B2_Patient',

                  'B3_Laptop', 'B3_Centre', 'B3_Monitor', 'B3_Oxygen', 'B3_Patient',

                  'B1_Laptop', 'B1_Centre', 'B1_Monitor', 'B1_Oxygen', 'B1_Patient',

                  'Resource_ResusTrolley', 'Resource_ECG', 'Resource_IV1left', 'Resource_IV2right']

    priorityB = ['B4_Laptop', 'B4_Centre', 'B4_Monitor', 'B4_Oxygen', 'B4_Patient',

                 'Resource_Phone', 'Resource_ECG', 'Resource_IV1left', 'Resource_IV2right']

    secondaryB = ['B2_Laptop', 'B2_Centre', 'B2_Monitor', 'B2_Oxygen', 'B2_Patient',

                  'B3_Laptop', 'B3_Centre', 'B3_Monitor', 'B3_Oxygen', 'B3_Patient',

                  'B1_Laptop', 'B1_Centre', 'B1_Monitor', 'B1_Oxygen', 'B1_Patient',

                  'Resource_ResusTrolley']

    for student in studentlist:

        cols = [s for s in df_proxemicsCo.columns[1:] if student in s]

        df_temp1 = df_proxemicsCo[cols].sum(axis=1).map(lambda x: 1 if x >= 1 else x)

        # priority and secondary task differs between scenario A and B

        if scenario == 'A':
            df_temp2 = df_proxemicsLabel[student].map(lambda x: 'priority' if x in priorityA

            else 'secondary' if x in secondaryA

            else x).copy()

        if scenario == 'B':
            df_temp2 = df_proxemicsLabel[student].map(lambda x: 'priority' if x in priorityB

            else 'secondary' if x in secondaryB

            else x).copy()

        df_temp2 = df_temp2.map(lambda x: 10 if x == 'priority'

        else 20 if x == 'secondary'

        else 30 if x == 'in'

        else 40 if x == 'out'

        else x)

        dfLA[student] = df_temp1 + df_temp2

        dfLA[student] = dfLA[student].map(lambda x: dicLA[x])

    return dfLA


def GroupBehaviours(dfLA, LAitems):
    blist = dfLA[dfLA.columns[1:]].values.tolist()

    blist = [i for b in blist for i in b]

    blist = [x for x in blist if x != 'Out']

    total = len(blist)

    resultlist = []

    for item in LAitems:
        count = blist.count(item)

        percentage = count / total * 100

        resultlist.append([item, percentage])

    dfresult = pd.DataFrame(resultlist, columns=['behaviours', 'percentage'])

    return dfresult


dicLA = {11: 'CP',
         21: 'CS',
         10: 'IP',
         20: 'IS',
         31: 'TD',
         30: 'TT',
         40: 'Out'}

behaviour_name_mapper = {"CP": ['Working together', 'on tasks for Ruth'],
                         "CS": ['Working together', 'on other tasks'],
                         "IP": ['Working individually', 'on tasks for Ruth'],
                         "IS": ['Working individually', 'on other tasks'],
                         "TD": ['Working together', 'away from all beds'],
                         "TT": ['Moving around', 'the beds']}


def IPA_for_front_end(df_import: pd.DataFrame, sessionid: str, positioning_start_timestamp: float,
                      start_time: float, end_time: float):
    # filter out two warden nurses outside at the begining
    df = df_import[df_import.y >= 0]
    '''Import coordinates of meaningful spaces'''

    # TODO: instead of relying on csv configuration like this, we should put it in database.
    coordinate_file = os.path.join(
        os.path.dirname(__file__), "coordinates.csv")
    print(coordinate_file)
    dfco = pd.read_csv(coordinate_file, delimiter=",")

    '''Output PNG figure'''

    # outputfig = 'Team Task Prioritisation'

    '''Import scenario of the current simulation'''
    # if sessionid % 2 == 0:
    #     scenario = 'B'
    # else:
    #     scenario = 'A'
    # TODO: please remove this line once we're done with the trial.
    scenario = 'A'

    """ add a new column for the timestamp starting at the beginning of session """
    df["sessional_timestamp"] = df["timestamp"] - positioning_start_timestamp

    '''added 2023/6/13 Change timestamp and normalise to one second'''
    used_timestamp = df[(df["sessional_timestamp"] >= start_time) & (
            df["sessional_timestamp"] <= end_time)]
    df.timestamp = used_timestamp.timestamp.map(
        lambda x: datetime.utcfromtimestamp(x).replace(microsecond=0))

    # df.timestamp = df.timestamp.map(lambda x: datetime.utcfromtimestamp(x).replace(microsecond=0))

    df = df.groupby(["timestamp", "success", 'student', 'session'], as_index=False)[['x', 'y', 'z',
                                                                                     'yaw', 'roll', 'pitch',
                                                                                     'latency']].mean()
    prev_high_A = [['CP', 23.267898598414295],
                   ['CS', 9.897867140836253],
                   ['IP', 29.09875403918844],
                   ['IS', 15.031147780592661],
                   ['TD', 13.009524294729317],
                   ['TT', 9.694808146239035]]

    df_high_A = pd.DataFrame(prev_high_A, columns=['behaviours', 'high'])

    prev_high_B = [['CP', 35.16215302071544],
                   ['CS', 3.020721727300755],
                   ['IP', 30.81886013302892],
                   ['IS', 8.367811061263106],
                   ['TD', 10.898692419330263],
                   ['TT', 11.731761638361515]]

    df_high_B = pd.DataFrame(prev_high_B, columns=['behaviours', 'high'])

    LAitems = list(dicLA.values())[:-1]

    '''RUN'''

    # number of trackers

    numberOfTrackers = numberTrackers(df)
    # call the function that enumerates trackers

    df_trackers = enumerate_trackers(df)
    # create a dict that change enumeration back to ID

    EnumtoIdDct = df_trackers.set_index('enumeration')['student'].to_dict()
    # asign tracker number to the whole dataset

    df = asignEnumTrackers(df, df_trackers)
    # DISTANCES in pivot format with one data point per second

    df_pivoted = pivot_table(df)

    # fill in the missing value
    df_pivoted = fillmissing(df_pivoted)

    # calculate the proximity matrix
    df_proxemics = proxemicsSpaces(df_pivoted, numberOfTrackers, dfco)

    # assign a space for each student and for each second
    df_proxemicsLabel = proximitylabel(
        df_proxemics, EnumtoIdDct, numberOfTrackers)

    # calculate collaboration status for each students
    df_proxemicsCo = proxemicsCollaboration(
        df_pivoted, numberOfTrackers, EnumtoIdDct)

    # identify learning actions from proximity to spaces and students
    dfLA = learningActions(df_proxemicsLabel, df_proxemicsCo, scenario)

    # calculate the percentage of each learning actions
    dfresult = GroupBehaviours(dfLA, LAitems)

    # added 2023/6/13, a new parameter to determine whether to show the bar of good performing teams

    # xticks = df_graph.iloc[:,0]
    xticks = ['Working together \n on primary task',
              'Working together \n on secondary task',
              'Working individually \n on primary task',
              'Working individually \n on secondary task',
              'Team discussion',
              'Task transition']

    return_list = []

    for i, row in dfresult.iterrows():
        return_list.append(
            {"label": behaviour_name_mapper[row["behaviours"]], "value": row["percentage"]})

    # switch the position of labels, to group the bars for ruth and others
    poped_data = return_list.pop(1)
    return_list.insert(2, poped_data)

    # recalculate the percentage
    return_list.pop(4)

    total_percentage = 0
    for an_element in return_list:
        total_percentage += an_element["value"]

    for an_element in return_list:
        an_element["value"] = an_element["value"] / total_percentage * 100
        # an_element["value"] = round(an_element["value"], 0)

    return return_list
