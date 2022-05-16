import React, { useEffect, useState, useContext } from "react";
import DataBase from "nedb";
import path from "path";
import defaultPic from "../../../assets/imgs/default-profile.png";
import ContactContext from "../../../context/contact/contactContext";
import UserContext from "../../../context/useragent/userContext";
import noDataFound from "../../../assets/imgs/no-items-found.png";
import { CheckName, DisplayNameOrNumber } from "../../../Constants/Helper";
import CallsClicked from "../../../components/rightClickMenu/CallsClicked";
import log from "../../../context/logger/log";

const OutgoingCalls = (props) => {
  const contactContext = useContext(ContactContext);
  const { db_log_update, get_call_log, setShowOngoing } = contactContext;
  const userContext = useContext(UserContext);
  const {
    setNavHeader,
    dilaerFun,
    userAgentInfo,
    sessionInfo,
    setNavSubHeader,
  } = userContext;

  const [outgoingCallLogs, setOutgoingCallLogs] = useState(null);

  var callLogsDb = new DataBase({
    filename: path.join(__dirname, "/callLog.db"),
    autoload: true,
  });
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });
  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "Outgoing Calls");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("Outgoing Calls");
    setNavSubHeader("");

    // callLogsDb.find({}, function (err, docs) {
    //   let data = docs[0];
    //   console.log(data);
    //   console.log(docs);
    //   setOutgoingCallLogs(data);
    //   log.info("Fetched all Outgoing call logs...");
    // });
    setOutgoingCallLogs(JSON.parse(sessionStorage.getItem("callLogs")));
  }, []);

  // useEffect(() => {
  //   console.log(db_log_update);
  //   callLogsDb.find({}, function (err, docs) {
  //     let data = docs[0];
  //     console.log(data);
  //     console.log(docs);
  //     setOutgoingCallLogs(data);
  //     log.info("Update all outgoing call logs...");
  //   });
  // }, [db_log_update]);

  const RenderedData = ({ keys, values }) => {
    return (
      <div className="px-0" key={keys}>
        <h5
          className="my-3"
          onClick={() => {
            console.log(values.some((e) => e.call_type === 1));
          }}
        >
          {keys}
        </h5>

        <div className=" row  mx-auto mt-1  py-1 d-flex align-items-center">
          {Array.isArray(values) &&
            values.map(
              (info, i) =>
                info.call_type === 2 && (
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
                          "through context right click in Outgoing calls"
                        );
                      }}
                      firstNumber={`${info.number}`}
                      // editProfile={() => {
                      //                 props.history.push({
                      //                   pathname: "/contactProfile",
                      //                   state: {
                      //                     id:[`${values[0].callee_id}`,],
                      //                     // name: contact.name,
                      //                     // phone_details: contact.phoneDetail,
                      //                     // image:
                      //                     //   contact.image !== null
                      //                     //     ? contact.image
                      //                     //     : person,
                      //                     // email: contact.email,
                      //                     // address: contact.address,
                      //                     // company: contact.company,
                      //                     // description: contact.description,
                      //                   },
                      //                 });
                      //               }}
                      addProfile={() => {
                        log.info(
                          "Add to profile called for",
                          info.number,
                          "through context right click in Outgoing calls"
                        );
                        var len = info.number.length;
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
                            "SMS function called for",
                            info.number,
                            "through context right click in Outgoing calls"
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
                            <span className="mx-3 text-primary">
                              Outgoing Call
                            </span>
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
                                      "through icon click in Outgoing calls"
                                    );
                                  }}
                                />
                              )}
                          </div>
                        </div>
                      </div>
                    </CallsClicked>
                  </div>
                )
            )}
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
            if (keys !== "_id" && values.some((e) => e.call_type == 2))
              return <RenderedData keys={keys} values={values} key={keys} />;
          })
      ) : (
        <div className="d-flex align-items-center justify-content-center w-100 min-vh-100">
          <img src={noDataFound} alt="no data found" height={350} width={400} />
        </div>
      )}
      {/* {(outgoingCallLogs === "" ||
        outgoingCallLogs == undefined ||
        outgoingCallLogs == null ||
        outgoingCallLogs.length == 0) &&
      get_call_log !== undefined &&
      get_call_log !== null
        ? Object.entries(get_call_log)
            .sort()
            .reverse()
            .map(([keys, values]) => {
              if (keys !== "_id" && values.some((e) => e.call_type === 2))
                return <RenderedData keys={keys} values={values} key={keys} />;
            })
        : outgoingCallLogs !== null &&
          outgoingCallLogs !== undefined &&
          Object.entries(outgoingCallLogs)
            .sort()
            .reverse()
            .map(([keys, values]) => {
              if (keys !== "_id" && values.some((e) => e.call_type === 2))
                return <RenderedData keys={keys} values={values} key={keys} />;
            })} */}
    </div>
  );
};

export default OutgoingCalls;
