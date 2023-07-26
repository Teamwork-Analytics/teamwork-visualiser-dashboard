import * as dfd from "danfojs";

const MIN_INDIVIDUAL_TALKING_TIME = 0;
const MAX_INDIVIDUAL_TALKING_TIME = 50;
const MIN_EDGE_WIDTH = 0;
const MAX_EDGE_WIDTH = 10;

const LOGGING = false;

// const MARGIN_MAPPER = {
//   blue: 10,
//   red: 10,
//   green: 10,
//   yellow: 10,
//   patient: 0,
//   doctor: 0,
//   relative: 0,
// };
const NODE_NAME_MAPPER = {
  "task allocation": "Task allocation",
  handover: "Handover",
  "call-out": "Sharing information",
  escalation: "Escalation",
  questioning: "Questioning",
  responding: "Responding",
  acknowledging: "Acknowledging",
};

// const NODE_NAME_MAPPER = {"blue": "Graduate Nurse 1", "red": "Graduate Nurse 2", "green": "Ward Nurse 1",
//                     "yellow": "Ward Nurse 2", "patient": "Patient", "doctor": "Doctor", "relative": "Relative"}

let calculating_weights = function (
  original_value,
  min_value,
  max_value,
  min_thick,
  max_thick
) {
  // max_value and min_value work as scaler
  return (
    min_thick +
    (original_value * (max_thick - min_thick)) / (max_value - min_value)
  );
};

let generate_a_ena_node_dict = function (
  node_name,
  node_frequency,
  label_halignment = "center",
  label_valignment = "top",
  show_label = true
) {
  let calculated_node_size = calculating_weights(node_frequency, 0, 250, 5, 170)

  // console.log(node_name);
  return {
    group: "nodes",
    'data': {"id": formating_node_id(node_name, node_frequency)},
    'style': {
        // "label": show_label ? "" : "",
        // "width": 150,
        // "height": 150,
        "width": calculated_node_size,
        "height": calculated_node_size,
      // "background-color": color,
      "background-opacity": 0.5,
      "border-color": "#333",
      "border-width": 1,
      "text-halign": label_halignment,
      "text-valign": label_valignment,
      // "text-margin-x": MARGIN_MAPPER[node_name],
      "font-size": 20,
      "z-index": 100,
    },
  };
};

let generate_node_data = function (node_name, node_size){
    if (["handover"].includes(node_name)){
            return generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], node_size, "center", "bottom");
        }
        else if (["questioning"].includes(node_name)){
            return generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], node_size, "left", "bottom");
        }
        else if (["escalation", "call-out"].includes(node_name)){
            return generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], node_size, "right", "top");
        }
        else if (["task allocation", "responding"].includes(node_name)){
            return generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], node_size,"left", "top");
        }
        else if (["acknowledging"].includes(node_name)){
            return generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], node_size, "center", "top");
        }
};


let formating_node_id = function (node_name, node_frequency){
    return node_name + "(" + node_frequency + ")"
};


let processing_adjacent_matrix = function (raw_json_data, startTime, end) {
  let node_size = [];
  let edge_width = [];
  let node_size_map = {};
  
  let i = 0;
    for (let current_code in raw_json_data) {
        let j = 0;
        let node_size_num = 0;

        for (let other_code in raw_json_data[current_code]) {
            if (current_code === other_code)
                continue;
            node_size_num += raw_json_data[current_code][other_code];
            j++;
        }
        node_size_map[current_code] = node_size_num
        node_size.push(generate_node_data(current_code, node_size_num))
        i++;

    }
i = 0;
for (let current_code in raw_json_data) {
    let j = 0;
    for (let other_code in raw_json_data[current_code]) {
        if (current_code === other_code)
            continue;
        if (j === i)
            break;
        edge_width.push({
            "group": 'edges',
            "data": {
                    "id": formating_node_id(NODE_NAME_MAPPER[current_code], node_size_map[current_code]) + "_" +
                        formating_node_id(NODE_NAME_MAPPER[other_code], node_size_map[other_code]),
                    "source": formating_node_id(NODE_NAME_MAPPER[current_code], node_size_map[current_code]),
                    "target": formating_node_id(NODE_NAME_MAPPER[other_code], node_size_map[other_code]),
            },
            "style": {
                "width": calculating_weights(raw_json_data[current_code][other_code],
                        MIN_INDIVIDUAL_TALKING_TIME, MAX_INDIVIDUAL_TALKING_TIME, MIN_EDGE_WIDTH, MAX_EDGE_WIDTH),
                "z-index": 10
            }
        });
        j++;
    }
    i++;
}
    

return { nodes: node_size, edges: edge_width };
};

export { processing_adjacent_matrix };
