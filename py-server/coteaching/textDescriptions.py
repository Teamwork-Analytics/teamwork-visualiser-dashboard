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
        text = "We <b>cannot</b> identify your co-teaching strategies with the other TAs."
    

    # Case 2: One pair has a coteaching strategy and the other pair does not have a coteaching strategy
    elif one_pair_max_coteaching == 'None' or second_pair_max_coteaching == 'None':
        strategy = bgr_coteaching.iloc[0]['coteaching']
        if one_pair_max_coteaching == 'None':
             text = f"""Your most common co-teaching strategy was <a data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top"> 
             <mark>{strategy}</mark>
             </a> with <b>{bgr_coteaching.iloc[0]['names']} TA </b> ({bgr_coteaching.iloc[0]['percentage']}% of the selected time). We cannot identify your co-teaching strategy with the {full_names[partner1]} TA."""
        else:
            text = f"""Your most common co-teaching strategy was <a data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top"> 
             <mark>{strategy}</mark>
             </a> with <b>{bgr_coteaching.iloc[0]['names']} TA </b> ({bgr_coteaching.iloc[0]['percentage']}%). We cannot identify your co-teaching strategy with the {full_names[partner2]} TA."""
            
    # Case 3: Both pairs have a coteaching strategy
    else:
        strategy = bgr_coteaching.iloc[0]['coteaching']
        strategy_other = bgr_coteaching.iloc[1]['coteaching']
        if one_pair_max_coteaching == second_pair_max_coteaching:
            # Case 3.1: Both pairs use the same coteaching strategy
            text = f""" Your most common co-teaching strategy was <a data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top"> <mark>{strategy}</mark>
            </a> with both <b>{bgr_coteaching.iloc[0]['names']} TA </b> ({bgr_coteaching.iloc[0]['percentage']}%) and <b>{full_names[partner2]} TA</b> ({bgr_coteaching.iloc[1]['percentage']}%)."""
        else:
            # Case 3.2: Each pair uses a different coteaching strategy
            strategy = bgr_coteaching.iloc[0]['coteaching']
            text = f"""Your most common co-teaching strategy was 
            <a
            data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
            <mark>{strategy}</mark>
            </a> with <b>{bgr_coteaching.iloc[0]['names']} TA </b> ({bgr_coteaching.iloc[0]['percentage']}%). 
            With <b>{bgr_coteaching.iloc[1]['names']} TA</b>, the co-teaching strategy was <a
            data-tooltip-id="{strategy_other.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
            <mark>{strategy_other}</mark>
            </a> ({bgr_coteaching.iloc[1]['percentage']}%).
            """
            # if one_pair_max_perc > second_pair_max_perc:
            #     text = f"""Your most common co-teaching strategy was <a data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top"> 
            #     <mark>{strategy}</mark>
            #     </a> with <b>{bgr_coteaching.iloc[0]['names']} TA </b> ({bgr_coteaching.iloc[0]['percentage']}% of the selected time). Differently, your co-teaching strategy with the {full_names[partner2]} TA was{second_pair_max_coteaching} ({round(second_pair_max_perc*100)}%)."""
            # else:
            #     text = f"""Your most common co-teaching strategy was {second_pair_max_coteaching}, 
            #     which was used {round(second_pair_max_perc*100)}% of the time 
            #     with the {full_names[partner2]} TA. Differently, with the {full_names[partner1]} TA, 
            #     '{one_pair_max_coteaching}' was the most frequent co-teaching strategy, 
            #     occurring {round(one_pair_max_perc*100)}% of the time."""
        
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
                'names': ["<b>Blue</b> and <b>Green</b> TAs", 
                          "<b>Blue</b> and <b>Red</b> TAs",
                          "<b>Green</b> and <b>Red</b> TAs"]})

    bgr_coteaching.sort_values('percentage', ascending=False, inplace=True)
    bgr_coteaching['percentage'] = round(bgr_coteaching['percentage']*100).astype(int)
    bgr_coteaching = bgr_coteaching.query('coteaching != "None"').query('percentage > 0').copy()

    if type == 'None': #Give most common strategy
        bgr_coteaching.sort_values('percentage', ascending=False, inplace=True)
    

    text = "Error in text description all"
    ### Case 1: They are all missing
    extra_text = ''
    if spatial_type != 'None':
        extra_text= ' and space usage category'

    if (bg_coteaching == 'None') & (br_coteaching == 'None') & (gr_coteaching == 'None'):
        text = f"We cannot identify any co-teaching strategies in the selected time period{extra_text}."

    ### Case 2: There's only one present
    elif len(bgr_coteaching) == 1: 
        strategy = bgr_coteaching.iloc[0]['coteaching']
        text = f"""We found the most common co-teaching strategy by {bgr_coteaching.iloc[0]['names']} was 
        <a
        data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
        <mark><b>{strategy}</b></mark>
        </a> 
        ({bgr_coteaching.iloc[0]['percentage']}%). We cannot identify any co-teaching strategies from other teachers. """ 

    ## Case 3: There are two present
    elif len(bgr_coteaching) == 2:
        strategy = bgr_coteaching.iloc[0]['coteaching']
        strategy_1 = bgr_coteaching.iloc[1]['coteaching']

        # 3.1 They are the same
        if bgr_coteaching.iloc[0]['coteaching'] == bgr_coteaching.iloc[1]['coteaching']:
            text = f"""The most common co-teaching strategy was <a
                    data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
                    <mark><b>{strategy}</b></mark> by all teachers:
                     <ul>
                      <li> {bgr_coteaching.iloc[0]['names']} ({bgr_coteaching.iloc[0]['percentage']}%)</li>
                      <li> {bgr_coteaching.iloc[1]['names']} ({bgr_coteaching.iloc[1]['percentage']}%)</li>
                       </ul> """
        # 3.2 They are different
        else:
            text = f"""The most common co-teaching strategy by {bgr_coteaching.iloc[0]['names']} was <a
                    data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
                    <mark><b>{strategy}</b></mark> ({bgr_coteaching.iloc[0]['percentage']}%). Between {bgr_coteaching.iloc[1]['names']},
            the most frequent co-teaching strategy was <a
                    data-tooltip-id="{strategy_1.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
                    <mark><b>{strategy_1}</b></mark> ({bgr_coteaching.iloc[1]['percentage']}%)."""

    ### Case 4: The three are present
    elif len(bgr_coteaching) == 3:
        strategy = bgr_coteaching.iloc[0]['coteaching']
        strategy_1 = bgr_coteaching.iloc[1]['coteaching']
        strategy_2 = bgr_coteaching.iloc[2]['coteaching']

        # 4.1 They are the same
        if (bg_coteaching == br_coteaching) & (br_coteaching == gr_coteaching):
            
            text = f"""The most common co-teaching strategy was  <a
                    data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
                    <mark><b>{strategy}</b></mark>
                    </a>  between: 
                    <ul>
                    <li> {bgr_coteaching.iloc[0]['names']} ({bgr_coteaching.iloc[0]['percentage']}%)</li> 
                    <li> {bgr_coteaching.iloc[1]['names']} ({bgr_coteaching.iloc[1]['percentage']}%)</li> 
                    <li> {bgr_coteaching.iloc[2]['names']} ({bgr_coteaching.iloc[2]['percentage']}%)</li> 
                    </ul>
                    """
            
        # 4.2 Two are the same: Pending
        # 4.3 They are all different
        else:
            text = f"""The strategies are:
            <ul>
            <li>  <a data-tooltip-id="{strategy.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
            <mark><b>{strategy}</b></mark>
            </a> :{bgr_coteaching.iloc[0]['names']} ({bgr_coteaching.iloc[0]['percentage']}%).</li> 
            <li>  <a data-tooltip-id="{strategy_1.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
            <mark><b>{strategy_1}</b></mark>
            </a> :{bgr_coteaching.iloc[1]['names']} ({bgr_coteaching.iloc[1]['percentage']}%).</li> 
            <li>  <a data-tooltip-id="{strategy_2.lower().replace(',','').replace(' ', '-')}" data-tooltip-place="top">
            <mark><b>{strategy_2}</b></mark>
            </a> :{bgr_coteaching.iloc[2]['names']} ({bgr_coteaching.iloc[0]['percentage']}%).</li> 
            """
             # Between {bgr_coteaching.iloc[1]['names']},
            # the most frequent co-teaching strategy was {bgr_coteaching.iloc[1]['coteaching']}({bgr_coteaching.iloc[1]['percentage']}% of the time).
            # Lastly, {bgr_coteaching.iloc[2]['coteaching']} was the most used co-teaching strategy 
            # by the {bgr_coteaching.iloc[2]['names']} ({bgr_coteaching.iloc[2]['percentage']}% of the time). 


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