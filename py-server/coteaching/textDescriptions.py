import pandas as pd 

COLOUR_MAPPING = {
    "RED": "R",
    "GREEN": "G",
    "BLUE": "B"
}

def get_ta_pairs(current_TA, ta_list = ['B', 'G', 'R']):
    ta_list = ['B', 'G', 'R']
    ta_list.remove(current_TA)
    partner1 = ta_list[0]
    partner2 = ta_list[1]

    if partner1 > current_TA:
        pair1 = f'{current_TA}{partner1}'
    else:
        pair1 = f'{partner1}{current_TA}'

    if partner2 > current_TA:
        pair2 = f'{current_TA}{partner2}'
    else:
        pair2 = f'{partner2}{current_TA}'

    return partner1, partner2, pair1, pair2


def get_max_coteaching(pair1, partner1, df_time, spatial_type = 'None'):
    one_pair = df_time[f'{pair1}_coteaching'].value_counts()/len(df_time)
    one_pair = pd.DataFrame(one_pair).reset_index()
    one_pair.columns = ['coteaching', 'percentage']
    one_pair['partner'] = partner1

    one_pair = one_pair.query('coteaching != "None"').copy()
    one_pair.sort_values('percentage', ascending=False, inplace=True)

    if one_pair.shape[0] == 0:
        return 0, 'None'
    
    # All of them have lecturing. So if it is lecturing or None, nothing changes. 
    print(spatial_type == 'supervisory')

    if spatial_type == 'supervisory':
        one_pair = one_pair.query('coteaching == "One Teacher, One Assistant"' ).copy() 
    elif spatial_type == 'interactional':
        one_pair = one_pair.query('coteaching ==  "One Teacher, One Assistant" or coteaching == "Alternative Teaching"').copy() 
    elif spatial_type == 'personal':
        one_pair = one_pair.query('coteaching ==  "One Teacher, One Observer"').copy() 

    if one_pair.shape[0] == 0:
        return 0, 'None'

    one_pair.sort_values('percentage', ascending=False, inplace=True)
    one_pair_max = one_pair.iloc[0]
    one_pair_max_perc = one_pair_max['percentage']
    one_pair_max_coteaching = one_pair_max['coteaching']

    return one_pair_max_perc, one_pair_max_coteaching



def get_text_description_coteaching_strategy(one_pair_max_coteaching, one_pair_max_perc, 
                                            second_pair_max_coteaching, second_pair_max_perc, 
                                            partner1, partner2):
    text = ""

    full_names = {'B': 'Blue', 'G': 'Green', 'R': 'Red'}

    bgr_coteaching = pd.DataFrame({'names': [full_names[partner1], full_names[partner2]],
                'percentage': [one_pair_max_perc, second_pair_max_perc], 
                'coteaching': [one_pair_max_coteaching, second_pair_max_coteaching]})

    bgr_coteaching.sort_values('percentage', ascending=False, inplace=True)
    bgr_coteaching['percentage'] = round(bgr_coteaching['percentage']*100).astype(int)
    bgr_coteaching = bgr_coteaching.query('coteaching != "None"').query('percentage > 0').copy()

    # Case 1: Both pairs do not have a coteaching strategy
    if one_pair_max_coteaching == 'None' and second_pair_max_coteaching == 'None':
        text = "During this period, we did <b>not</b> identify any co-teaching strategies with the other TAs."

    # Case 2: At least one has a co-teaching strategy
    else: 
        strategy = bgr_coteaching.iloc[0]['coteaching']
        text = f"""Your most common co-teaching strategy was 
        <a
        data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
        <mark><b>{strategy}</b></mark>
        </a>, 
        which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
        with the <b>{bgr_coteaching.iloc[0]['names']}</b> TA. """  
        
    text.replace('\n', '')
    text = ' '.join(text.split())

    return text


def get_text_description_all(df_time, spatial_type ):
    bg_perc, bg_coteaching = get_max_coteaching('BG', '', df_time,spatial_type)
    br_perc, br_coteaching = get_max_coteaching('BR', '', df_time,spatial_type)
    gr_perc, gr_coteaching = get_max_coteaching('GR', '', df_time,spatial_type)

    bgr_coteaching = pd.DataFrame({'pair': ['BG', 'BR', 'GR'], 
                'percentage': [bg_perc, br_perc, gr_perc], 
                'coteaching': [bg_coteaching, br_coteaching, gr_coteaching],
                'names': ["<b>Blue</b> and <b>Green</b> TA", 
                          "<b>Blue</b> and <b>Red</b> TA",
                          "<b>Green</b> and <b>Red</b> TA"]})

    bgr_coteaching['percentage'] = round(bgr_coteaching['percentage']*100).astype(int)
    bgr_coteaching = bgr_coteaching.query('coteaching != "None"').query('percentage > 0').copy()

    if type == 'None': #Give most common strategy
        bgr_coteaching.sort_values('percentage', ascending=False, inplace=True)
    

    text = "Error in text description all"
    ### Case 1: They are all missing
    extra_text = ''
    if spatial_type != 'None':
        extra_text= ' and category'

    if (bg_coteaching == 'None') & (br_coteaching == 'None') & (gr_coteaching == 'None'):
        text = f"During this period{extra_text}, we did not identify any co-teaching strategies with the other TAs."

    ### Case 2: There's only one present
    elif len(bgr_coteaching) > 1: 
        strategy = bgr_coteaching.iloc[0]['coteaching']
        text = f"""During this period{extra_text}, the most common co-teaching strategy was 
        <a
        data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
        <mark><b>{strategy}</b></mark>
        </a>, 
        which was used {bgr_coteaching.iloc[0]['percentage']}% of the time 
        by the {bgr_coteaching.iloc[0]['names']}. """ 


    text.replace('\n', '')
    text = ' '.join(text.split())

    return text 

def get_text(df_time, current_TA='ALL', spatial_type = 'None'):
    # Type: authoritative, supervisory, interactional, personal
    text = "Error"

    if current_TA == 'ALL':
        text = get_text_description_all(df_time, spatial_type)
    else:
        partner1, partner2, pair1, pair2 = get_ta_pairs(COLOUR_MAPPING[current_TA])
        one_pair_max_perc, one_pair_max_coteaching = get_max_coteaching(pair1, partner1, df_time)
        second_pair_max_perc, second_pair_max_coteaching = get_max_coteaching(pair2, partner2, df_time)
        text = get_text_description_coteaching_strategy(one_pair_max_coteaching, one_pair_max_perc, 
                                                second_pair_max_coteaching, second_pair_max_perc, 
                                                partner1, partner2) 
    return text 