import React, { useContext, useEffect, useState } from "react";
import defaultPic from "../../assets/imgs/default-profile.png";
import noDataFound from "../../assets/imgs/no-items-found.png";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import "./Dashboard.css";
import DoughnutChart from "./charts/Doughnut";
import LineChart from "./charts/LineChart";
import axios from "axios";
import DataBase from "nedb";
import path from "path";

import { CheckMessages, DisplayNameOrNumber } from "../../Constants/Helper";
import moment from "moment";
import { GET_DASHBOARD_DETAILS, GET_SMS_CHATS } from "../../Constants/Api";
import {
  getDashboardDetailsAPI,
  getSMSChatsAPI,
} from "../../Constants/ApiHelper";

const Dashboard = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const {
    setNavHeader,
    setNavSubHeader,
    userAgentInfo,
    dilaerFun,
    sessionInfo,
  } = userContext;
  const { getAllEfax, all_efax, getCallLogs, db_log_update, setShowOngoing } =
    contactContext;

  const [monthlyFax, setMonthlyFax] = useState(0);
  const [dailyCalls, setDailyCalls] = useState(0);

  const [dailyFax, setDailyFax] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalSentSMS, setTotalSentSMS] = useState(0);
  const [totalReceivedSMS, setTotalReceivedSMS] = useState(0);
  const [dailySentSMS, setDailySentSMS] = useState(0);
  const [dailyReceivedSMS, setDailyReceivedSMS] = useState(0);

  const [monthlyCallData, setMonthlyCallData] = useState([]);
  const [dailyCallData, setDailyCallData] = useState([]);
  const [callCounter, setCallCounter] = useState("daily");
  const [monthlySMSData, setMonthlySMSData] = useState([]);
  const [dailySMSData, setDailySMSData] = useState([]);
  const [smsCounter, setSMSCounter] = useState("daily");
  const [monthlyEfaxData, setMonthlyEfaxData] = useState([]);
  const [dailyEfaxData, setDailyEfaxData] = useState([]);
  const [efaxCounter, setEfaxCounter] = useState("daily");

  const [recentSMS, setRecentSMS] = useState({});
  const [smsChats, setSmsChats] = useState({});
  const [logsInformation, setLogsInformation] = useState(null);
  const [recentCalls, setRecentCalls] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imLogs, setIMLogs] = useState(null);
  const [dailyIM, setDailyIM] = useState([]);
  const [monthlyIM, setMonthlyIM] = useState([]);
  const [imCounter, setIMCounter] = useState("daily");

  // var instantMessageDb = new DataBase({
  //   filename: path.join(__dirname, "/instantMessageDb.db"),
  //   autoload: true,
  // });
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    getSMSChats();
    getDashboardDetails();
  }, []);
  const getSMSChats = () => {
    // setLoading(true);
    const token = sessionStorage.getItem("token");
    getSMSChatsAPI(token, sessionStorage.getItem("my_telnyx_num")).then(
      ({ status, data }) => {
        if (status == "success") {
          let exists = {},
            elm,
            elm2,
            arr = [];

          for (let i = 0; i < data.data.data.length; i++) {
            elm = data.data.data[i].to;
            elm2 = data.data.data[i].from;
            if (!exists[elm]) {
              arr.push(elm);
              exists[elm] = true;
            }
            if (!exists[elm2]) {
              arr.push(elm2);
              exists[elm2] = true;
            }
          }
          let demoObj = {};

          for (let j = 0; j < arr.length; j++) {
            demoObj[arr[j]] = [];
            for (let i = 0; i < data.data.data.length; i++) {
              if (data.data.data[i].to === arr[j]) {
                demoObj[arr[j]].push(data.data.data[i]);
              }
              if (data.data.data[i].from === arr[j]) {
                demoObj[arr[j]].push(data.data.data[i]);
              }
            }
          }

          setSmsChats(demoObj);
        } else if (status == "fail") {
          console.log("failed to get sms");
        }
      }
    );
  };

  const getDashboardDetails = () => {
    setLoading(true);
    let token = sessionStorage.getItem("token");
    getDashboardDetailsAPI(token).then(({ status, response }) => {
      if (status == "success") {
        console.log(response);
        let data = response.data.data[0];
        let monthCalls = [];
        let monthSMS = [];
        let monthEfax = [];
        let dayCall = [];
        let daySMS = [];
        let dayEfax = [];
        let date = new Date().toISOString().split("T")[0];

        let month = new Date().getMonth() + 1;
        let year = new Date().getFullYear();
        let datesArr = getDaysInMonth(month, year);

        setTotalCalls(data["total-calls-of-current-month"]);
        setDailyCalls(data["total-calls-of-today"]);
        setDailyReceivedSMS(data["total-received-sms-of-today"]);
        setDailySentSMS(data["total-sent-sms-of-today"]);
        setTotalReceivedSMS(data["total-received-sms-of-current-month"]);
        setTotalSentSMS(data["total-sent-sms-of-current-month"]);
        setDailyFax(data["total-efax-of-today"]);
        setMonthlyFax(data["total-efax-of-current-month"]);
        setRecentSMS(data["recent-5-received-sms-list"]);
        setRecentCalls(data["recent-5-calls-list"]);
        Object.entries(data["list-of-total-calls-month wise"]).map(
          (key, value) => {
            monthCalls.push(key[1]);
          }
        );

        setMonthlyCallData(monthCalls);
        Object.entries(data["list-of-total-sms-month-wise"]).map(
          (key, value) => {
            monthSMS.push(key[1]);
          }
        );
        setMonthlySMSData(monthSMS);
        Object.entries(data["list-of-total-efax-month-wise"]).map(
          (key, value) => {
            monthEfax.push(key[1]);
          }
        );
        setMonthlyEfaxData(monthEfax);

        datesArr.map((i) => {
          // console.log(data[i]);
          if (
            data["list-of-total-calls-date-wise-of-current-month_count"][i] ===
            undefined
          ) {
            dayCall.push(0);
          } else {
            dayCall.push(
              data["list-of-total-calls-date-wise-of-current-month_count"][i]
            );
          }
        });
        setDailyCallData(dayCall);

        datesArr.map((i) => {
          if (
            data["list-of-total-sms-date-wise-of-current-month"][
              moment(i).format("DD/MM/YYYY")
            ] === undefined
          ) {
            daySMS.push(0);
          } else {
            daySMS.push(
              data["list-of-total-sms-date-wise-of-current-month"][
                moment(i).format("DD/MM/YYYY")
              ]
            );
          }
        });
        setDailySMSData(daySMS);

        datesArr.map((i) => {
          // console.log(data[i]);
          if (
            data["list-of-total-sms-date-wise-of-current-month"][
              moment(i).format("DD/MM/YYYY")
            ] === undefined
          ) {
            dayEfax.push(0);
          } else {
            dayEfax.push(
              data["list-of-total-sms-date-wise-of-current-month"][
                moment(i).format("DD/MM/YYYY")
              ]
            );
          }
        });
        setDailyEfaxData(dayEfax);
        setLoading(false);
      } else if (status == "fail") {
        console.log(response);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      sessionStorage.setItem("currentNavHeader", "Dashboard");
      setNavHeader(sessionStorage.getItem("currentNavHeader"));
      setNavHeader("Dashboard");
      setNavSubHeader("");
    }

    // instantMessageDb.find({}, function (err, docs) {
    //   ;

    //   console.log(docs);
    //   docs.length > 0 && setIMLogs(docs[0]);
    // });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let arr = [];
    let current = new Date().getMonth() + 1;
    if (current.toString().length == 1) {
      current = "0" + current.toString();
    }
    let currentDate = new Date().toISOString().split("T")[0];
    imLogs !== null &&
      Object.entries(imLogs).map((keys, index) => {
        if (keys[0] != "_id" && keys[1].length > 0) {
          Array.isArray(keys[1]) &&
            keys[1].map((i) => {
              if (
                i.sender_email !==
                JSON.parse(sessionStorage.getItem("userInfo")).extension.email
              ) {
                arr.push(i);
              }
            });
        }
      });
    let monthArr = [];
    let dailyArr = [];

    arr.map((i) => {
      if (
        i.timestamp.split(" ") !== undefined &&
        i.timestamp.split(" ")[0].split("-")[1] == current
      ) {
        monthArr.push(i);
      }
      if (
        i.timestamp.split(" ") !== undefined &&
        i.timestamp.split(" ")[0] == currentDate
      ) {
        dailyArr.push(i);
      }
    });
    setMonthlyIM(monthArr);
    setDailyIM(dailyArr);
    setLogsInformation(arr);
  }, [imLogs]);

  const getDaysInMonth = (month, year) =>
    new Array(31)
      .fill("")
      .map(
        (v, i) => new Date(year, month - 1, i + 1).toISOString().split("T")[0]
      )
      .filter((v) => v.split("-")[1] == month);

  const fiveCallLogs = (information) => {
    let arr = [];
    information !== null &&
      information !== undefined &&
      Object.entries(information).map(
        ([keys, values]) =>
          Array.isArray(values) && values.map((info, i) => arr.push(info))
      );

    // setFiveCallInfo(arr);
    console.log(arr);
  };

  return (
    <>
      {loading === true ? (
        <div className="vh-100 d-flex justify-content-center align-items-center mb-2">
          <lord-icon
            src="https://cdn.lordicon.com/ulhdumaq.json"
            trigger="loop"
            colors="primary:#121331,secondary:#08a88a"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
      ) : (
        <div className="dash px-0 mx-0  mt-2 bg-white ">
          <div className="">
            <div className=" row ">
              {/* calls daily */}
              {/* <div className="w-25 mx-2 my-2  bg-white top-cards d-flex flex-column justify-content-between"> */}
              <div className="   col-sm-6 col-xs-12 col-lg-6 col-xl-3   my-2">
                <div className="top-cards bg-white me-1">
                  <div className="d-flex  align-items-center justify-content-between p-3">
                    <span>
                      <h3>
                        {callCounter === "daily" ? dailyCalls : totalCalls}
                      </h3>
                      <span>Calls</span>
                    </span>

                    <span>
                      <i className="fas fa-phone fs-4"></i>
                    </span>
                  </div>
                  <div className=" row bg-warning  text-white text-center fw-bold fs-6 top-card ">
                    <div
                      style={{
                        borderBottomLeftRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        callCounter === "daily" && "top-card-active-button"
                      }`}
                      onClick={() => setCallCounter("daily")}
                    >
                      Daily
                    </div>
                    <div
                      style={{
                        borderBottomRightRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        callCounter === "monthly" && "top-card-active-button"
                      }`}
                      onClick={() => setCallCounter("monthly")}
                    >
                      Monthly
                    </div>
                  </div>
                </div>
              </div>
              {/* im monthly */}
              <div className="  col-sm-6 col-xs-12 col-lg-6 col-xl-3  my-2">
                <div className="top-cards bg-white me-1">
                  <div className="d-flex  align-items-center justify-content-between p-3">
                    <span>
                      <h3>
                        {" "}
                        {/* {imCounter === "daily"
                          ? dailyIM.length
                          : monthlyIM.length} */}
                        {imCounter === "daily" ? 0 : 0}
                      </h3>
                      <span>IM</span>
                    </span>

                    <span>
                      <i className="fas fa-envelope fs-4"></i>
                    </span>
                  </div>
                  <div
                    style={{ background: "#f74657" }}
                    className=" row  text-white text-center fw-bold fs-6 top-card "
                  >
                    <div
                      style={{
                        borderBottomLeftRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        imCounter === "daily" && "top-card-active-button"
                      }`}
                      onClick={() => setIMCounter("daily")}
                    >
                      Daily
                    </div>
                    <div
                      style={{
                        borderBottomRightRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        imCounter === "monthly" && "top-card-active-button"
                      }`}
                      onClick={() => setIMCounter("monthly")}
                    >
                      Monthly
                    </div>
                  </div>
                </div>
              </div>
              {/* sms monthly */}
              <div className="   col-sm-6 col-xs-12 col-lg-6 col-xl-3   my-2">
                <div className="top-cards bg-white me-1">
                  <div className="d-flex  align-items-center justify-content-between p-3">
                    <span className="d-flex ">
                      <span className="me-3">
                        <h3>
                          {smsCounter === "daily" ? dailySentSMS : totalSentSMS}
                        </h3>
                        <span>Sent</span>
                      </span>
                      <span>
                        <h3>
                          {smsCounter === "daily"
                            ? dailyReceivedSMS
                            : totalReceivedSMS}
                        </h3>
                        <span>Received</span>
                      </span>
                    </span>

                    <span>
                      <i className="fas fa-sms fs-4 me-1"></i>
                    </span>
                  </div>
                  <div
                    style={{ background: "#2ac47d" }}
                    className=" row  text-white text-center fw-bold fs-6 top-card "
                    // onClick={callCounterHandler}
                  >
                    <div
                      style={{
                        borderBottomLeftRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        smsCounter === "daily" && "top-card-active-button"
                      }`}
                      onClick={() => setSMSCounter("daily")}
                    >
                      Daily
                    </div>
                    <div
                      style={{
                        borderBottomRightRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        smsCounter === "monthly" && "top-card-active-button"
                      }`}
                      onClick={() => setSMSCounter("monthly")}
                    >
                      Monthly
                    </div>
                  </div>
                </div>
              </div>

              {/* fax monthly */}
              <div className="   col-sm-6 col-xs-12 col-lg-6 col-xl-3   my-2">
                <div className="top-cards bg-white me-1">
                  <div className="d-flex  align-items-center justify-content-between p-3">
                    <span>
                      <h3>{efaxCounter === "daily" ? dailyFax : monthlyFax}</h3>
                      <span>E-Fax</span>
                    </span>

                    <span>
                      <i className="fas fa-fax fs-4"></i>
                    </span>
                  </div>
                  <div
                    style={{ background: "#5b9cfd" }}
                    className=" row  text-white text-center fw-bold fs-6 top-card "
                  >
                    <div
                      style={{
                        borderBottomLeftRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        efaxCounter === "daily" && "top-card-active-button"
                      }`}
                      onClick={() => setEfaxCounter("daily")}
                    >
                      Daily
                    </div>
                    <div
                      style={{
                        borderBottomRightRadius: "0.5rem",
                        cursor: "pointer",
                      }}
                      className={`col-6 p-2 ${
                        efaxCounter === "monthly" && "top-card-active-button"
                      }`}
                      onClick={() => setEfaxCounter("monthly")}
                    >
                      Monthly
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* second row */}
          <div className="d-flex row ">
            {/* <div className="w-50 mx-2 my-2  bg-white top-cards d-flex flex-column justify-content-between"> */}
            <div className="col-sm-6 col-xs-12 col-lg-6 col-xl-4 my-2">
              <div className="top-cards bg-white ">
                <span className="fw-bold mx-2 fs-5">Recent Calls</span>
                {recentCalls !== null && recentCalls.length > 0 ? (
                  recentCalls.map(
                    (info, i) =>
                      i < 5 && (
                        <div
                          key={info.id}
                          className="py-1 px-2 mt-1 dash-list-item d-flex justify-content-between"
                        >
                          <span className="d-flex flex-column">
                            <div className="d-flex w-100 justify-content-between">
                              <span className="fw-bold">
                                <DisplayNameOrNumber num={info.number} />
                              </span>

                              <span className="ms-4"></span>
                            </div>

                            <span
                              className={`${
                                info.call_type === 1
                                  ? "received-call-text"
                                  : `${
                                      info.call_type === 2
                                        ? "outgoing-call-text"
                                        : "missed-call-text"
                                    }`
                              } d-flex align-items-end`}
                            >
                              {info.call_type === 1 && "Received"}
                              {info.call_type === 2 && "Outgoing"}
                              {info.call_type === 3 && "Missed"}
                            </span>
                          </span>

                          <span className="d-flex align-items-end">
                            <span className="me-2">
                              {moment(info.call_start_date).format(
                                "DD-MM-YYYY"
                              )}
                              ,{/* {info.call_start_date}, */}
                              {info.call_start_time !== null &&
                                info.call_start_time.split(" ")[0].slice(0, -3)}
                            </span>
                            {JSON.parse(sessionStorage.getItem("userInfo")) !==
                              null &&
                              JSON.parse(sessionStorage.getItem("userInfo"))
                                .extension.calling === 1 && (
                                <i
                                  id={`call-btn${i}`}
                                  className="fas fa-phone-alt  ms-2 mb-2"
                                  onClick={() => {
                                    let elem = document.getElementById(
                                      `call-btn${i}`
                                    );
                                    elem.style.background = "rgb(256 256 256)";
                                    elem.style.boxShadow =
                                      "rgb(0 0 0 / 85%) 0px 1px 1px";
                                    elem.style.transform = "translateY(4px)";
                                    elem.style.padding = "5px";
                                    elem.style.borderRadius = "10px";

                                    setTimeout(() => {
                                      elem.style.background = "transparent";
                                      elem.style.boxShadow = "none";
                                      elem.style.transform = "translateY(0px)";
                                      elem.style.padding = "0px";
                                      elem.style.borderRadius = "0px";
                                    }, 150);
                                    setShowOngoing({
                                      flag: true,
                                      number: info.number,
                                      image: null,
                                    });
                                    dilaerFun(
                                      info.number,
                                      userAgentInfo,
                                      sessionInfo
                                    );
                                  }}
                                ></i>
                              )}
                          </span>
                        </div>
                      )
                  )
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center w-100"
                    style={{ height: "38vh" }}
                  >
                    <span>
                      <img
                        src={noDataFound}
                        style={{ width: "200px" }}
                        alt="no data found"
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* sms */}
            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
              JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
                1 && (
                <div className="col-sm-6 col-xs-12 col-lg-6 col-xl-4 my-2">
                  <div className="top-cards bg-white mx-1">
                    <span className="fw-bold mx-2 fs-5">Recent SMS </span>
                    {Object.keys(recentSMS).length !== 0 ? (
                      Object.values(recentSMS).map((i) => (
                        <div
                          onClick={() => {
                            sessionStorage.setItem("currentMember", i.from);
                            setTimeout(() => {
                              sessionStorage.setItem(
                                "currentChats",
                                JSON.stringify(smsChats[i.from])
                              );
                              console.log(smsChats[i.from]);

                              props.history.push({
                                pathname: `/SMSChat/${i.from}`,
                                state: {
                                  chats: smsChats[i.from],
                                },
                              });
                            }, 0);
                          }}
                          key={i.id}
                          className="py-1 px-2 mt-1 dash-list-item d-flex justify-content-between"
                        >
                          <span className="d-flex flex-column">
                            <span className="fw-bold">
                              <DisplayNameOrNumber num={i.from} />
                            </span>
                            <span>
                              {i.messages !== null ? (
                                i.messages.length > 35 ? (
                                  <span>{i.messages.slice(0, 30) + "..."}</span>
                                ) : (
                                  <span>{i.messages}</span>
                                )
                              ) : (
                                <i className="fas fa-photo-video" />
                              )}
                            </span>
                          </span>
                          <span className="d-flex flex-column align-items-end justify-content-end">
                            <span>{i.date.replaceAll("/", "-")}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div
                        className="d-flex align-items-center justify-content-center w-100"
                        style={{ height: "38vh" }}
                      >
                        <span>
                          <img
                            src={noDataFound}
                            style={{ width: "200px" }}
                            alt="no data found"
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* IM */}
            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
              JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
                1 && (
                <div className="col-sm-6 col-xs-12 col-lg-6 col-xl-4 my-2">
                  <div
                    className="top-cards bg-white"
                    style={{ height: "19.3rem" }}
                  >
                    <span className="fw-bold mx-2 fs-5">Recent IM</span>
                    <div
                      className="fs-5 d-flex text-danger justify-content-center align-items-center"
                      style={{ height: "70%" }}
                    >
                      Service not available yet.
                    </div>

                    {/* {logsInformation == null || logsInformation.length == 0 ? (
                      <div
                        className="d-flex align-items-center justify-content-center w-100"
                        style={{ height: "38vh" }}
                      >
                        <span>
                          <img
                            src={noDataFound}
                            style={{ width: "200px" }}
                            alt="no data found"
                          />
                        </span>
                      </div>
                    ) : (
                      <div className="d-flex flex-column">
                        {logsInformation
                          .filter((a, b) => a._id !== b._id)
                          .reverse()
                          .sort(
                            (a, b) =>
                              new Date(b.timestamp) - new Date(a.timestamp)
                          )
                          .map((info, index) => {
                            if (index < 5) {
                              return (
                                <div
                                  key={index}
                                  className="py-1 px-2 mt-1 dash-list-item d-flex justify-content-between"
                                >
                                  <span className="d-flex flex-column">
                                    <div className="d-flex w-100 justify-content-between">
                                      <span className="fw-bold">
                                        {info.sender_name}
                                      </span>

                                      <span className="ms-4"></span>
                                    </div>

                                    <span className="d-flex align-items-end">
                                      {info.message.match(
                                        /^http[^\?]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim
                                      ) ||
                                      info.message.match(/\.(mp3|wav|ogg)$/) ||
                                      info.message.match(/\.(pdf)$/) ||
                                      info.message.match(/\.(mp4|mov|m4v)$/) ? (
                                        <i className="fas fa-photo-video" />
                                      ) : info.message.length > 35 ? (
                                        <CheckMessages
                                          message={
                                            info.message.slice(0, 30) + "..."
                                          }
                                        />
                                      ) : (
                                        <CheckMessages message={info.message} />
                                      )}
                                    </span>
                                  </span>

                                  <span className="d-flex align-items-end">
                                    <span className="me-2">
                                      {info.timestamp.split(" ")[0]},
                                      {info.timestamp.split(" ")[1].slice(0, 5)}
                                    </span>
                                  </span>
                                </div>
                              );
                            }
                          })}
                      </div>
                    )} */}
                  </div>
                </div>
              )}
          </div>
          {/* third row */}
          <div className="d-flex row">
            {/* <div className="w-75 mx-2 my-2  bg-white top-cards "> */}
            <div className="col-sm-12 col-xs-12  col-md-12 col-lg-8   my-2">
              <div className="top-cards bg-white me-1">
                <LineChart
                  dailyCall={dailyCallData}
                  monthlyCall={monthlyCallData}
                  dailySMS={dailySMSData}
                  monthlySMS={monthlySMSData}
                  dailyEfax={dailyEfaxData}
                  monthlyEfax={monthlyEfaxData}
                />
              </div>
            </div>
            {/* <div className="w-25 mx-2 my-2  bg-white top-cards "> */}
            <div className="col-sm-12 col-xs-12  col-md-12 col-lg-4   my-2">
              <div className="top-cards bg-white ">
                <DoughnutChart
                  data={[dailyCalls, dailyReceivedSMS, dailyFax, 0]}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Dashboard;
