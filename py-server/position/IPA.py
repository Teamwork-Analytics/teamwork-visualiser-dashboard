# -*- coding: utf-8 -*-

"""

Created on Fri Aug  5 09:56:04 2022



@author: jimmi

"""

import warnings

warnings.filterwarnings("ignore")

import pandas as pd

import numpy as np

import math

from datetime import datetime

import matplotlib.pyplot as plt

# from vad.pozyx_extraction import get_timestamp_from_sync

'''Import pozyx_json_csv data from csv file'''

'''Enumeration'''


def get_timestamp_from_sync(sync_path: str, timestamp_type: str):
    """
    for a specific sync file, read its start time data.
    :param sync_path: the path of sync.txt
    :return: the timestamp of when pozyx started
    """
    with open(sync_path) as f:
        sync_content = f.readlines()

    positioning_start_line = ""
    for line in sync_content:
        # find the line containing what we want
        if timestamp_type == "positioning":
            if "start receive position" in line and "baseline" not in line:
                positioning_start_line = line
                break
        elif timestamp_type == "audio":
            if "audio start" in line and "baseline" not in line:
                positioning_start_line = line
                break
        else:
            raise ValueError("'{}' is not a supported timestamp type to extract. Try to set timestamp type as audio or "
                             "positioning")

    time_string = positioning_start_line.split("_____")[1]
    # 01-Sep-2021_13-19-37-929 %d-%b-%Y-%H-%M-%S-%f

    # configure the timezone for the striptime:
    # https://statisticsglobe.com/convert-datetime-to-different-time-zone-python
    date = datetime.strptime(time_string.strip() + "-+1000", "%Y-%m-%d_%H-%M-%S-%f-%z")
    timestamp = date.timestamp()

    # timestamp = datetime.datetime.timestamp(date)
    return timestamp


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


