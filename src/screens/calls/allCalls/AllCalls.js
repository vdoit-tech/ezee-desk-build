import React, { useEffect, useState, useContext } from "react";
import DataBase from "nedb";
import path from "path";
import defaultPic from "../../../assets/imgs/default-profile.png";
import noDataFound from "../../../assets/imgs/no-items-found.png";
import ContactContext from "../../../context/contact/contactContext";
import UserContext from "../../../context/useragent/userContext";
import { v4 as uuid } from "uuid";
import { CheckName } from "../../../Constants/Helper";

import CallsClicked from "../../../components/rightClickMenu/CallsClicked";
import log from "../../../context/logger/log";

const AllCalls = (props) => {
  const contactContext = useContext(ContactContext);
  const {
    db_log_update,
    dbLogUpdateFunction,
    get_call_log,
    getCallLogs,
    setShowOngoing,
  } = contactContext;
  const userContext = useContext(UserContext);
  const {
    setNavHeader,
    dilaerFun,
    userAgentInfo,
    sessionInfo,
    setNavSubHeader,
  } = userContext;

  const [allCallLogs, setAllCallLogs] = useState([]);

  var callLogsDb = new DataBase({
    filename: path.join(__dirname, "/callLog.db"),
    autoload: true,
  });
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });
  useEffect(() => {
    getCallLogs();
  }, []);

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "All Calls");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("All Calls");
    setNavSubHeader("");

    callLogsDb.find({}, function (err, docs) {
      let data = docs[0];
      // console.log(data);
      // console.log(docs);
      log.info("All call logs data fetch....");
      // setAllCallLogs(data);
    });
    setAllCallLogs(JSON.parse(sessionStorage.getItem("callLogs")));
  }, []);

  // useEffect(() => {
  //   console.log(db_log_update);
  //   callLogsDb.find({}, function (err, docs) {
  //     let data = docs[0];
  //     console.log(data);
  //     console.log(docs);
  //     log.info("All call logs data Updated....");
  //     setAllCallLogs(data);
  //   });
  // }, [db_log_update]);

  const RenderedData = ({ keys, values }) => {
    return (
      <div className="px-0" key={keys}>
        <h5 className="my-3">
          {keys}
          <span className="mx-3">
            {/* {new Date().toISOString().slice(0, 10) === ele
          ? 'Today'
          : ele !== undefined &&
            days[new Date(ele.split('-').join('/')).getDay()]} */}
          </span>
        </h5>

        <div className=" row  mx-auto mt-1  py-1 d-flex align-items-center">
          {Array.isArray(values) &&
            values.map((info, i) => (
              <div>
                <CallsClicked
                  index={i}
                  dialcall={() => {
                    setShowOngoing({
                      flag: true,
                      number: info.number,
                      image: null,
                    });
                    dilaerFun(`${info.number}`, userAgentInfo, sessionInfo);
                    log.info(
                      "Dilaer function called for",
                      info.number,
                      "through context right click in All calls"
                    );
                  }}
                  firstNumber={`${info.number}`}
                  addProfile={() => {
                    var len = info.number.length;
                    log.info(
                      "Add to profile called for",
                      info.number,
                      "through context right click in All calls"
                    );
                    props.history.push({
                      pathname: "/createContact",
                      state: {
                        addNumber: `${info.number}`,
                        // countryCode :`${info.number.slice(0,len-10)}`
                      },
                    });
                  }}
                  smsfun={() => {
                    smsdb.find({}, function (err, docs) {
                      log.info(
                        "smsfun function called for",
                        info.number,
                        "through context right click in All calls"
                      );
                      let data = docs[0];

                      if (data !== undefined) {
                        let arr = Object.keys(data);
                        let num = `${info.number}`;
                        // contact.phoneDetail[0]
                        //   .phone;
                        console.log(arr, num);

                        if (arr.includes(num)) {
                          sessionStorage.setItem(
                            "currentChats",
                            JSON.stringify(data[num])
                          );
                          sessionStorage.setItem("currentMember", num);
                          props.history.push({
                            pathname: `/SMSChat/${num}`,
                            state: {
                              chats: data[num],
                            },
                          });
                        } else if (!arr.includes(num)) {
                          props.history.push({
                            pathname: `/newSMSChat`,
                            state: {
                              contactNum: num,
                            },
                          });
                        }
                      }
                    });
                  }}
                >
                  <div key={i}>
                    <div className="row w-100 px-0  d-flex mb-3 calls py-2 justify-content-between">
                      <div className="col-3 d-flex align-items-center">
                        <div className="">
                          <img
                            src={defaultPic}
                            alt=""
                            className="call-person-img"
                          />
                        </div>

                        <div className="mx-3 d-flex flex-column">
                          <span className="fw-bold">
                            <CheckName
                              num={info.number}
                              callee={info.callee_name}
                            />
                          </span>
                          <span>{info.number}</span>
                        </div>
                      </div>

                      <div className="px-0 col-6 mx-3 d-flex align-items-end ps-4">
                        <span className="mx-1">
                          {info.call_start_time !== null &&
                            info.call_start_time.slice(0, 5)}
                        </span>
                        {info.call_type == 1 ? (
                          <span className="mx-3 text-success">
                            Received Call
                          </span>
                        ) : info.call_type == 2 ? (
                          <span className="mx-3 text-primary">
                            Outgoing Call
                          </span>
                        ) : (
                          <span className="mx-3 text-danger">Missed Call</span>
                        )}

                        <span className="mx-1">{info.call_duration}</span>
                      </div>
                      <div className="col-2 d-flex align-items-end justify-content-end px-2">
                        {JSON.parse(sessionStorage.getItem("userInfo")) !==
                          undefined &&
                          JSON.parse(sessionStorage.getItem("userInfo")) !==
                            null &&
                          JSON.parse(sessionStorage.getItem("userInfo"))
                            .extension.calling === 1 && (
                            <i
                              id={`call-btn${i}`}
                              style={{
                                padding: "0.5rem",
                                borderRadius: "20px",
                                cursor: "pointer",
                              }}
                              className="fas fa-phone-alt fs-6 "
                              onClick={() => {
                                let elem = document.getElementById(
                                  `call-btn${i}`
                                );
                                elem.style.background = "rgb(256 256 256)";
                                elem.style.boxShadow =
                                  "rgb(0 0 0 / 85%) 0px 1px 1px";
                                elem.style.transform = "translateY(4px)";

                                setTimeout(() => {
                                  elem.style.background = "transparent";
                                  elem.style.boxShadow = "none";
                                  elem.style.transform = "translateY(0px)";
                                }, 150);
                                setShowOngoing({
                                  flag: true,
                                  number: info.number,
                                  image: null,
                                });
                                dilaerFun(
                                  `${info.number}`,
                                  userAgentInfo,
                                  sessionInfo
                                );
                                log.info(
                                  "Dilaer function called for",
                                  info.number,
                                  "through icon click in All calls"
                                );
                              }}
                            />
                          )}
                      </div>
                    </div>
                  </div>
                </CallsClicked>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {sessionStorage.getItem("callLogs") !== null &&
      sessionStorage.getItem("callLogs") !== undefined &&
      typeof JSON.parse(sessionStorage.getItem("callLogs")) !== "string" &&
      JSON.parse(sessionStorage.getItem("callLogs")) !== null &&
      JSON.parse(sessionStorage.getItem("callLogs")) !== undefined &&
      Object.keys(JSON.parse(sessionStorage.getItem("callLogs"))).length > 0 ? (
        Object.entries(JSON.parse(sessionStorage.getItem("callLogs")))
          .sort()
          .reverse()
          .map(([keys, values]) => {
            if (
              keys !== "_id" &&
              values.some(
                (e) => e.call_type == 1 || e.call_type == 2 || e.call_type == 3
              )
            )
              return <RenderedData keys={keys} values={values} key={keys} />;
          })
      ) : (
        <div className="d-flex align-items-center justify-content-center w-100 min-vh-100">
          <img src={noDataFound} alt="no data found" height={350} width={400} />
        </div>
      )}
      {/* {(allCallLogs === "" ||
        allCallLogs == undefined ||
        allCallLogs == null ||
        allCallLogs.length == 0) &&
      get_call_log !== undefined &&
      get_call_log !== null
        ? Object.entries(get_call_log)
            .sort()
            .reverse()
            .map(([keys, values]) => {
              if (
                keys !== "_id" &&
                values.some(
                  (e) =>
                    e.call_type == 1 || e.call_type == 2 || e.call_type == 3
                )
              )
                return <RenderedData keys={keys} values={values} key={keys} />;
            })
        : allCallLogs !== null &&
          allCallLogs !== undefined &&
          allCallLogs.length !== 0 &&
          Object.entries(allCallLogs)
            .sort()
            .reverse()
            .map(([keys, values]) => {
              if (
                keys !== "_id" &&
                values.some(
                  (e) =>
                    e.call_type == 1 || e.call_type == 2 || e.call_type == 3
                )
              )
                return <RenderedData keys={keys} values={values} key={keys} />;
            })} */}
    </div>
  );
};

export default AllCalls;
