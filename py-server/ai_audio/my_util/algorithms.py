def filter_unused_clips(a_color, start_time, handover_ends, secondary_entered, met_entered):
    if a_color.lower() == "blue" or a_color.lower() == "red" or a_color.lower() == "black":
        if handover_ends > float(start_time):
            return True
    elif a_color.lower() == "green" or a_color.lower() == "yellow":
        if secondary_entered > float(start_time):
            return True
    elif a_color.lower() == "white":
        if met_entered > float(start_time):
            return True
    else:
        raise ValueError("unexpected color of pariticipants: {}, at start_time of: {}".format(a_color, start_time))

    return False