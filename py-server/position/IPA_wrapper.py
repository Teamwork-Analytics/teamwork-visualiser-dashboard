import pandas as pd
from datetime import datetime
import os

from position.IPA import numberTrackers, enumerate_trackers, asignEnumTrackers, pivot_table, \
    fillmissing, proxemicsSpaces, proximitylabel, proxemicsCollaboration, learningActions, GroupBehaviours

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


    return return_list
