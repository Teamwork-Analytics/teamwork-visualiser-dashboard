import pandas as pd 

COLOUR_MAPPING = {
    "RED": "R",
    "GREEN": "G",
    "BLUE": "B"
}

def get_ta_pairs(current_TA, ta_list = ['B', 'G', 'R']):
    first = True
    for ta in ta_list:
        if first & (ta != current_TA):
            partner1 = ta
            if ta > current_TA:
                pair1 = f'{current_TA}{ta}'
            else:
                pair1 = f'{ta}{current_TA}'
            first = False
        partner2 = ta
        if ta > current_TA:
            pair2 = f'{current_TA}{ta}'
        else:
            pair2 = f'{ta}{current_TA}'
    return partner1, partner2, pair1, pair2


def get_max_coteaching(pair1, partner1, df_time):
    one_pair = df_time[f'{pair1}_coteaching'].value_counts()/len(df_time)
    one_pair = pd.DataFrame(one_pair).reset_index()
    one_pair.columns = ['coteaching', 'percentage']
    one_pair['partner'] = partner1

    one_pair = one_pair.query('coteaching != "None"').copy()
    one_pair.sort_values('percentage', ascending=False, inplace=True)

    if one_pair.shape[0] == 0:
        return 0, 'None'
    one_pair_max = one_pair.iloc[0]
    one_pair_max_perc = one_pair_max['percentage']
    one_pair_max_coteaching = one_pair_max['coteaching']

    return one_pair_max_perc, one_pair_max_coteaching



def get_text_description_coteaching_strategy(one_pair_max_coteaching, one_pair_max_perc, 
                                            second_pair_max_coteaching, second_pair_max_perc, 
                                            partner1, partner2):
    text = ""

    full_names = {'B': 'Blue', 'G': 'Green', 'R': 'Red'}

    # Case 1: Both pairs do not have a coteaching strategy
    if one_pair_max_coteaching == 'None' and second_pair_max_coteaching == 'None':
        text = "During this period, we did not identify any co-teaching strategies with the other TAs."

    # Case 2: One pair has a coteaching strategy and the other pair does not have a coteaching strategy
    elif one_pair_max_coteaching == 'None' or second_pair_max_coteaching == 'None':
        if one_pair_max_coteaching == 'None':
            text = f"""Your most common co-teaching strategy was '{second_pair_max_coteaching}', 
                    which was used {round(second_pair_max_perc*100)}% of the time 
                    with the {full_names[partner2]} TA. In contrast, during this period, 
                    you did not share a co-teaching strategy with the {full_names[partner1]} TA."""
        else:
            text = f"""Your most common co-teaching strategy was '{one_pair_max_coteaching}', 
                    which was used {round(one_pair_max_perc*100)}% of the time 
                    with the {full_names[partner1]} TA. In contrast, during this period, 
                    you did not share a co-teaching strategy with the {full_names[partner2]} TA."""

    # Case 3: Both pairs have a coteaching strategy
    else:
        if one_pair_max_coteaching == second_pair_max_coteaching:
            # Case 3.1: Both pairs use the same coteaching strategy
            text = f"""Your most common co-teaching strategy was '{one_pair_max_coteaching}', 
                    which was used {round(one_pair_max_perc*100)}% of the time 
                    with the {full_names[partner1]} TA and {round(second_pair_max_perc*100)}% of the time 
                    with the {full_names[partner2]} TA."""
        else:
            # Case 3.2: Each pair uses a different coteaching strategy
            if one_pair_max_perc > second_pair_max_perc:
                text = f"""Your most common co-teaching strategy was '{one_pair_max_coteaching}', 
                        which was used {round(one_pair_max_perc*100)}% of the time 
                        with the {full_names[partner1]} TA. Differently, with the {full_names[partner2]} TA, 
                        {second_pair_max_coteaching} was the most frequent co-teaching strategy, 
                        occurring {round(second_pair_max_perc*100)}% of the time."""
            else:
                text = f"""Your most common co-teaching strategy was {second_pair_max_coteaching}, 
                        which was used {round(second_pair_max_perc*100)}% of the time 
                        with the {full_names[partner2]} TA. Differently, with the {full_names[partner1]} TA, 
                        '{one_pair_max_coteaching}' was the most frequent co-teaching strategy, 
                        occurring {round(one_pair_max_perc*100)}% of the time."""
    text.replace('\n', '')
    text = ' '.join(text.split())

    return text


def get_text_description_all(df_time):
    bg_perc, bg_coteaching = get_max_coteaching('BG', '', df_time)
    br_perc, br_coteaching = get_max_coteaching('BR', '', df_time)
    gr_perc, gr_coteaching = get_max_coteaching('GR', '', df_time)

    bgr_coteaching = pd.DataFrame({'pair': ['BG', 'BR', 'GR'], 
                'percentage': [bg_perc, br_perc, gr_perc], 
                'coteaching': [bg_coteaching, br_coteaching, gr_coteaching],
                'names': ["Blue TA and Green TA", "Blue TA and Red TA", "Green TA and Red TA"]})

    bgr_coteaching.sort_values('percentage', ascending=False, inplace=True)
    bgr_coteaching['percentage'] = round(bgr_coteaching['percentage']*100).astype(int)
    bgr_coteaching = bgr_coteaching.query('coteaching != "None"').query('percentage > 0').copy()

    text = "Error in text description all"
    ### Case 1: They are all missing
    if (bg_coteaching == 'None') & (br_coteaching == 'None') & (gr_coteaching == 'None'):
        text = "During this period, we did not identify any co-teaching strategies with the other TAs."

    ### Case 2: There's only one present
    elif len(bgr_coteaching) == 1: 
        text = f"""The most common co-teaching strategy was {bgr_coteaching.iloc[0]['coteaching']}, 
            which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
            by the {bgr_coteaching.iloc[0]['names']}. 
            We did not identify any other co-teaching strategies for the other TAs interaction."""  

    ## Case 3: There are two present
    elif len(bgr_coteaching) == 2:
        # 3.1 They are the same
        if bgr_coteaching.iloc[0]['coteaching'] == bgr_coteaching.iloc[1]['coteaching']:
            text = f"""The most common co-teaching strategy was {bgr_coteaching.iloc[0]['coteaching']}, 
                which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
                by the {bgr_coteaching.iloc[0]['names']}; 
                and {bgr_coteaching.iloc[1]['percentage']}% of the time 
                by the {bgr_coteaching.iloc[1]['names']}. """
        # 3.2 They are different
        else:
            text = f"""The most common co-teaching strategy was {bgr_coteaching.iloc[0]['coteaching']}, 
                which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
                by the {bgr_coteaching.iloc[0]['names']}. For the {bgr_coteaching.iloc[1]['names']},
                the most frequent co-teaching strategy was {bgr_coteaching.iloc[1]['coteaching']}, 
                used {bgr_coteaching.iloc[1]['percentage']}% of the time."""

    ### Case 4: The three are present
    elif len(bgr_coteaching) == 3:
        # 4.1 They are the same
        if (bg_coteaching == br_coteaching) & (br_coteaching == gr_coteaching):
            
            text = f"""The most common co-teaching strategy was {br_coteaching}, 
                    which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
                    by the {bgr_coteaching.iloc[0]['names']}; 
                    {bgr_coteaching.iloc[1]['percentage']}% of the time 
                    by the {bgr_coteaching.iloc[1]['names']}; 
                    and {bgr_coteaching.iloc[2]['percentage']}% of the time 
                    by the {bgr_coteaching.iloc[2]['names']}."""
            
        # 4.2 Two are the same: Pending
        # 4.3 They are all different
        else:
            text = f"""The most common co-teaching strategy was {bgr_coteaching.iloc[0]['coteaching']}, 
            which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
            by the {bgr_coteaching.iloc[0]['names']}. For the {bgr_coteaching.iloc[1]['names']},
            the most frequent co-teaching strategy was {bgr_coteaching.iloc[1]['coteaching']}, 
            used {bgr_coteaching.iloc[1]['percentage']}% of the time.
            Lastly, {bgr_coteaching.iloc[2]['coteaching']} was the most used co-teaching strategy 
            by the {bgr_coteaching.iloc[2]['names']} ({bgr_coteaching.iloc[2]['percentage']}% of the time). 
            """

    text.replace('\n', '')
    text = ' '.join(text.split())

    return text 

def get_text(df_time, current_TA='ALL'):
    text = "Error"

    if current_TA == 'ALL':
        text = get_text_description_all(df_time)
    else:
        partner1, partner2, pair1, pair2 = get_ta_pairs(COLOUR_MAPPING[current_TA])
        one_pair_max_perc, one_pair_max_coteaching = get_max_coteaching(pair1, partner1, df_time)
        second_pair_max_perc, second_pair_max_coteaching = get_max_coteaching(pair2, partner2, df_time)
        text = get_text_description_coteaching_strategy(one_pair_max_coteaching, one_pair_max_perc, 
                                                second_pair_max_coteaching, second_pair_max_perc, 
                                                partner1, partner2) 
    return text 