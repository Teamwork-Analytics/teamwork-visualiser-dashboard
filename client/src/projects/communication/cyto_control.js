import * as dfd from "danfojs";
import { toast } from "react-hot-toast";
import { cssColourMatcher } from "../hive/Hexagon";

// const value for the social network visualisation
const MIN_TOTAL_TALKING_TIME = 0;
const MAX_TOTAL_TALKING_TIME = 200;
const MIN_NODE_SIZE = 30;
const MAX_NODE_SIZE = 100;

const MIN_INDIVIDUAL_TALKING_TIME = 0;
const MAX_INDIVIDUAL_TALKING_TIME = 70;
const MIN_EDGE_WIDTH = 0;
const MAX_EDGE_WIDTH = 4;

const OTHER_NODE_SIZE = 15;

const LOGGING = false;

const MARGIN_MAPPER = {
  blue: 10,
  red: 10,
  green: 10,
  yellow: 10,
  patient: 0,
  doctor: 0,
  relative: 0,
};
const NODE_NAME_MAPPER = {
  blue: "Primary Nurse 1",
  red: "Primary Nurse 2",
  green: "Secondary Nurse 1",
  yellow: "Secondary Nurse 2",
  patient: "Patient",
  doctor: "Doctor",
  relative: "Relative",
};

let logging = function (input) {
  if (LOGGING) console.log(input);
};

// this function contains the configuration of the edges
// let generate_social_network = function (network_data, container_id) {
//   let net_options = {
//     name: "circle",
//     fit: true, // whether to fit the viewport to the graph
//     padding: 60, // the padding on fit
//     boundingBox: { x1: 50, y1: 50, x2: 1000, y2: 800 }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
//     avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
//     nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
//     spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
//     radius: undefined, // the radius of the circle
//     startAngle: (3 / 2) * Math.PI, // where nodes start in radians
//     sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
//     clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
//     sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
//     animate: false, // whether to transition the node positions
//     animationDuration: 500, // duration of animation in ms if enabled
//     animationEasing: undefined, // easing of animation if enabled
//     animateFilter: function (node, i) {
//       return true;
//     }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
//     ready: undefined, // callback on layoutready
//     stop: undefined, // callback on layoutstop
//     transform: function (node, position) {
//       return position;
//     }, // transform a given node position. Useful for changing flow direction in discrete layouts
//   };

//   const cy = cytoscape({
//     container: document.getElementById(container_id), // container to render in
//     zoomingEnabled: false,
//     userPanningEnabled: false,

//     elements: network_data["nodes"].concat(network_data["edges"]),
//     style: [
//       // the stylesheet for the graph
//       {
//         selector: "node",
//         style: {
//           "background-color": "#666",
//           label: "data(id)",
//         },
//       },

//       {
//         selector: "edge",
//         style: {
//           // 'width': 3,
//           "line-color": "black",
//           "target-arrow-color": "black",
//           "target-arrow-shape": "triangle-backcurve",
//           "curve-style": "bezier",
//           "arrow-scale": 1.3,
//         },
//       },
//     ],

//     layout: net_options,
//   });

//   logging("script finished");
//   // logging(eles)
//   return cy;
// };

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

// Danfo.js has a glitch that if multiple times of slices were used, an unexpected error (reading 0) would happen
// this function is specifically used when error of reading 0 happened
const regenerating_df = function (a_df_slice) {
  if (a_df_slice.shape[0] === 0) return a_df_slice;
  else return new dfd.DataFrame(dfd.toJSON(a_df_slice, { format: "row" }));
};

// this function is to simulate the isin function in pandas
let str_isin_column = function (df, column, a_str) {
  // df.loc({ columns: ["initiator", "receiver"] }).print();
  let selected = df[column].apply((row_value) => {
    return !!row_value.includes(a_str);
  });
  // selected.print();
  let res = df.query(selected);
  logging(res);

  // if the dataframe is empty, error will happen, impressive
  if (res.shape[0] === 0) logging("no rows selected for a_str");
  else logging(a_str);
  // res.loc({ columns: ["initiator", "receiver"] }).print();
  return res;
};

let generate_a_node_dict = function (
  node_name,
  color,
  node_size,
  label_halignment = "center",
  label_valignment = "top",
  show_label = true
) {
  return {
    group: "nodes",
    data: { id: NODE_NAME_MAPPER[node_name] },
    style: {
      label: show_label ? "" : "",
      width: node_size,
      height: node_size,
      "background-color": cssColourMatcher[color.toUpperCase()],
      "background-opacity": 1,
      "border-color": "#333",
      "border-width": 1,
      "text-halign": label_halignment,
      "text-valign": label_valignment,
      "text-margin-x": MARGIN_MAPPER[node_name],
      "font-size": 20,
    },
  };
};

// this function contains the configuration of the edges
let generate_social_network = function (network_data, container_id) {
  let net_options = {
    name: "circle",
    fit: true, // whether to fit the viewport to the graph
    padding: 10, // the padding on fit
    boundingBox: { x1: 50, y1: 50, x2: 600, y2: 300 }, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
    nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
    spacingFactor: undefined, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    radius: undefined, // the radius of the circle
    startAngle: (3 / 2) * Math.PI, // where nodes start in radians
    sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
    clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
    sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    animationEasing: undefined, // easing of animation if enabled
    animateFilter: function (node, i) {
      return true;
    }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
    ready: undefined, // callback on layoutready
    stop: undefined, // callback on layoutstop
    transform: function (node, position) {
      return position;
    }, // transform a given node position. Useful for changing flow direction in discrete layouts
  };

  return {
    container: document.getElementById(container_id), // container to render in
    zoomingEnabled: false,
    userPanningEnabled: false,

    elements: network_data["nodes"].concat(network_data["edges"]),
    style: [
      // the stylesheet for the graph
      {
        selector: "node",
        style: {
          "background-color": "#666",
          label: "data(id)",
        },
      },

      {
        selector: "edge",
        style: {
          // 'width': 3,
          "line-color": "black",
          "target-arrow-color": "black",
          "target-arrow-shape": "triangle-backcurve",
          "curve-style": "bezier",
          "arrow-scale": 1.3,
        },
      },
    ],

    layout: net_options,
  };
};

let processing_csv = function (
  raw_json_data,
  start_time,
  end_time,
  max_edge_width,
  max_node_size,
  use_comm
) {
  // selection of data: https://danfo.jsdata.org/getting-started#selection-with-boolean-mask

  // use Danfo.js to create the slice of data
  try {
    if (raw_json_data.length === 0 || raw_json_data === undefined) return {};

    const test_df = new dfd.DataFrame(raw_json_data);

    if (use_comm) {
    }
    // moved into for loop, because glitch will happen if use mask loading on slice

    // const init_slice = test_df.iloc({
    //   rows: test_df["start_time"].ge(start_time),
    // });
    // const new_df_slice = init_slice.iloc({
    //   rows: init_slice["start_time"].le(end_time),
    // });

    console.log("Start time: ", start_time, " type: ", typeof start_time);
    console.log("End time: ", end_time, " type: ", typeof end_time);
    console.log("DataFrame start_time column: ", test_df["start_time"]);

    const new_df_slice = test_df.query(
      test_df["start_time"]
        .ge(start_time)
        .and(test_df["start_time"].le(end_time))
    );

    // const new_df_slice = test_df
    //   .query({ column: "start_time", is: ">=", to: start_time })
    //   .query({ column: "end_time", is: "<=", to: end_time });

    // df_slice["initiator"].print();
    const df_slice = regenerating_df(new_df_slice);

    // for each student, get their total duration of speaking time, and the duration of speaking time to others
    const students = ["blue", "green", "red", "yellow"];
    const others = ["patient", "relative", "doctor"];
    let students_and_others = students.concat(others);

    let node_size = [];
    let edge_width = [];

    for (const a_student_index in students) {
      let a_student = students[a_student_index];

      let slice = df_slice["initiator"].eq(a_student);
      // slice.print();
      let student_slice = df_slice.iloc({ rows: slice });

      // if the dataframe does not contain anything, just continue.
      // Danfo.js cannot handle the empty dataframe properly
      if (student_slice.shape[0] === 0) {
        node_size.push(
          generate_a_node_dict(
            students[a_student_index],
            students[a_student_index],
            MIN_NODE_SIZE,
            "right",
            "center"
          )
        );
        continue;
      }

      const student_slice_new = regenerating_df(student_slice);
      const time_sum = student_slice_new["duration"].sum();

      logging(time_sum);

      // here calculates the node size of students
      //{group: 'edges', data: {id: 'red_blue', source: 'red', target: 'blue'}, style: {"width": 0}},
      const node_size_value = calculating_weights(
        time_sum,
        MIN_TOTAL_TALKING_TIME,
        MAX_TOTAL_TALKING_TIME,
        MIN_NODE_SIZE,
        MAX_NODE_SIZE
      );

      node_size.push(
        generate_a_node_dict(
          students[a_student_index],
          students[a_student_index],
          node_size_value,
          "right",
          "center"
        )
      );

      // calculating edge weights
      logging("======= start to record the generation of edges ==============");
      for (let an_id in students_and_others) {
        if (students[a_student_index] === students_and_others[an_id]) continue;
        logging(an_id);
        logging(students[an_id]);

        // get the rows that one student talk to another
        let talk_to_df = str_isin_column(
          student_slice_new,
          "receiver",
          students_and_others[an_id]
        );
        let talking_to_time = talk_to_df["duration"].sum();
        logging(
          students[a_student_index] +
            " to " +
            students_and_others[an_id] +
            ":" +
            talking_to_time
        );

        edge_width.push({
          group: "edges",
          data: {
            id:
              NODE_NAME_MAPPER[students[a_student_index]] +
              "_" +
              NODE_NAME_MAPPER[students_and_others[an_id]],
            source: NODE_NAME_MAPPER[students[a_student_index]],
            target: NODE_NAME_MAPPER[students_and_others[an_id]],
          },
          style: {
            width: calculating_weights(
              talking_to_time,
              MIN_INDIVIDUAL_TALKING_TIME,
              MAX_INDIVIDUAL_TALKING_TIME,
              MIN_EDGE_WIDTH,
              MAX_EDGE_WIDTH
            ),
          },
        });
        logging("---------- next student ------------------");
      }
    }

    for (let an_other_index in others)
      node_size.push(
        generate_a_node_dict(
          others[an_other_index],
          others[an_other_index],
          OTHER_NODE_SIZE,
          "left"
        )
      );
    return { nodes: node_size, edges: edge_width };
  } catch (error) {
    // toast.error(`SNA error: unable to change visualisation based on time`);
    console.error(error);
  }
};

export { processing_csv, generate_social_network };
