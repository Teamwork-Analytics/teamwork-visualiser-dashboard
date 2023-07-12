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
  "call-out": "Call-out",
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
  label_halignment = "center",
  label_valignment = "top",
  show_label = true
) {
  // console.log(node_name);
  return {
    group: "nodes",
    data: { id: node_name },
    style: {
      label: show_label ? "" : "",
      width: 25,
      height: 25,
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

let processing_adjacent_matrix = function (raw_json_data, startTime, end) {
  let node_size = [];
  let edge_width = [];

  for (const node_name in raw_json_data) {
    if (["questioning", "handover"].includes(node_name)) {
      node_size.push(
        generate_a_ena_node_dict(
          NODE_NAME_MAPPER[node_name],
          "center",
          "bottom"
        )
      );
    } else if (["escalation", "call-out"].includes(node_name)) {
      node_size.push(
        generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], "right", "top")
      );
    } else if (["task allocation", "responding"].includes(node_name)) {
      node_size.push(
        generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], "left", "top")
      );
    } else if (["acknowledging"].includes(node_name)) {
      node_size.push(
        generate_a_ena_node_dict(NODE_NAME_MAPPER[node_name], "center", "top")
      );
    }
  }
  let i = 0;
  for (let current_code in raw_json_data) {
    let j = 0;
    for (let other_code in raw_json_data[current_code]) {
      if (current_code === other_code) continue;
      if (j === i) break;
      edge_width.push({
        group: "edges",
        data: {
          id:
            NODE_NAME_MAPPER[current_code] + "_" + NODE_NAME_MAPPER[other_code],
          source: NODE_NAME_MAPPER[current_code],
          target: NODE_NAME_MAPPER[other_code],
        },
        style: {
          width: calculating_weights(
            raw_json_data[current_code][other_code],
            MIN_INDIVIDUAL_TALKING_TIME,
            MAX_INDIVIDUAL_TALKING_TIME,
            MIN_EDGE_WIDTH,
            MAX_EDGE_WIDTH
          ),
          "z-index": 10,
        },
      });
      j++;
    }
    i++;
  }

  return { nodes: node_size, edges: edge_width };
};

export { processing_adjacent_matrix };
