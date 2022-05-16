import React from "react";
import { Doughnut } from "react-chartjs-2";

const dataFunc = (val) => {
  const data = {
    labels: ["Calls", "SMS", "E-Fax", "IM"],
    datasets: [
      {
        label: "activity",
        data: val,
        backgroundColor: [
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(0, 206, 86, 0.5)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(0, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };
  return data;
};

const DoughnutChart = (props) => (
  <>
    <div className="header">
      <h3 className="title mt-2 ms-2">Today's Activity</h3>
    </div>

    {props.data[0] === 0 &&
    props.data[1] === 0 &&
    props.data[2] === 0 &&
    props.data[3] === 0 ? (
      <div
        className="d-flex align-items-center justify-content-center fs-4"
        style={{ height: 300 }}
      >
        No data to display!
      </div>
    ) : (
      <Doughnut data={dataFunc(props.data)} />
    )}
  </>
);

export default DoughnutChart;
