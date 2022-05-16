import React, { useState } from "react";
import { Line } from "react-chartjs-2";

const monthsArr = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const getDaysInMonth = (month, year) =>
  new Array(31)
    .fill("")
    .map((v, i) => new Date(year, month - 1, i + 1).toISOString().split("T")[0])
    .filter((v) => v.split("-")[1] == month);

const dataFunc = (arr, type, datatype) => {
  let month = new Date().getMonth() + 1;
  const chartMonth = month < 10 ? `0${month}` : month;
  let year = new Date().getFullYear();
  let datesArr = getDaysInMonth(month, year);
  const data = {
    labels: type ? datesArr : monthsArr,
    datasets: [
      {
        label: `No. of ${datatype} `,
        data: arr,
        fill: false,
        backgroundColor: `${
          datatype == "Calls"
            ? "rgba(54, 162, 235, 1)"
            : datatype == "SMS"
            ? "rgba(255, 99, 132, 1)"
            : datatype == "E-Fax" && "rgba(255, 206, 86, 1)"
        }`,
        borderColor: `${
          datatype == "Calls"
            ? "rgba(54, 162, 235, 1)"
            : datatype == "SMS"
            ? "rgba(255, 99, 132, 1)"
            : datatype == "E-Fax" && "rgba(255, 206, 86, 1)"
        }`,
      },
    ],
  };

  return data;
};

const options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const LineChart = (props) => {
  const [type, setType] = useState(true);
  const [dataType, setDataType] = useState("Calls");
  return (
    <>
      <div className="header">
        <h1 className="title fs-4 ms-2 mt-2">
          {" "}
          {type ? "This Month's" : "This Year's"} {dataType}
        </h1>
        <div className="links d-flex justify-content-end me-2">
          <select
            onChange={(e) => setDataType(e.target.value)}
            className="me-2"
          >
            <option value="Calls">Calls</option>
            <option value="SMS">SMS</option>
            <option value="E-Fax">E-Fax</option>
          </select>
          <button
            style={{
              background: `${
                dataType == "Calls"
                  ? "rgba(54, 162, 235, 1)"
                  : dataType == "SMS"
                  ? "rgba(255, 99, 132, 1)"
                  : dataType == "E-Fax" && "rgba(255, 206, 86, 1)"
              }`,
            }}
            className="btn text-white btn-sm"
            onClick={() => setType(!type)}
          >
            {type ? "Monthly" : "Daily"}
          </button>
        </div>
      </div>
      <Line
        data={dataFunc(
          dataType === "Calls"
            ? type
              ? props.dailyCall
              : props.monthlyCall
            : dataType === "SMS"
            ? type
              ? props.dailySMS
              : props.monthlySMS
            : type
            ? props.dailyEfax
            : props.monthlyEfax,
          type,
          dataType
        )}
        options={options}
      />
    </>
  );
};

export default LineChart;
