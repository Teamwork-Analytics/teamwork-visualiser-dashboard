// const value for the social network visualisation
const MIN_TOTAL_TALKING_TIME = 0;
const MAX_TOTAL_TALKING_TIME = 200;
const MIN_NODE_SIZE = 30;
const MAX_NODE_SIZE = 100;

const MIN_INDIVIDUAL_TALKING_TIME = 0;
const MAX_INDIVIDUAL_TALKING_TIME = 50;
const MIN_EDGE_WIDTH = 0;
const MAX_EDGE_WIDTH = 10;

const OTHER_NODE_SIZE = 15;

const LOGGING = false;

// const MARGIN_MAPPER = {"blue": 10, "red": 10, "green": 10, "yellow": 10, "patient": 0, "doctor": 0, "relative": 0}

let update_bar_chart = function (data) {
  // const data = [
  //   { year: 2010, count: 10 },
  //   { year: 2011, count: 20 },
  //   { year: 2012, count: 15 },
  //   { year: 2013, count: 25 },
  //   { year: 2014, count: 22 },
  //   { year: 2015, count: 30 },
  //   { year: 2016, count: 28 },
  // ];
  // console.log(typeof data)
  // console.log(typeof a_list)
  return {
    type: "bar",
    data: {
      labels: data.map((row) => row.label),
      datasets: [
        {
          data: data.map((row) => row.value),
          backgroundColor: "rgba(30,144,255, 0.8)",
        },
      ],
    },
    options: {
      //https://www.chartjs.org/docs/3.9.1/configuration/legend.html
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          //https://www.chartjs.org/docs/3.9.1/axes/cartesian/linear.html
          // max: 100,
          // min: 0,
          title: {
            display: true,
            text: "Percentage (%)",
            //https://www.chartjs.org/docs/latest/general/fonts.html
            font: { size: 20 },
          },
        },
        x: {
          title: {
            display: true,
            text: "Behaviours",
            font: { size: 20 },
          },
        },
      },
    },
  };
};

export { update_bar_chart };
