import React, { useContext, useEffect, useState } from "react";
import defaultPic from "../../assets/imgs/default-profile.png";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import SmsClicked from "../../components/rightClickMenu/SmsClicked";
import "./SMS.css";
import axios from "axios";
import DataBase from "nedb";
import path from "path";
import moment from "moment";
import {
  DisplayName,
  setCallImage,
  showNameOrNumber,
} from "../../Constants/Helper";
import Loader from "../../components/loader/Loader";
import { GET_SMS_CHATS } from "../../Constants/Api";
import { getSMSChatsAPI } from "../../Constants/ApiHelper";

const ipc = window.require("electron").ipcRenderer;

const SMSChats = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const {
    setNavHeader,
    dilaerFun,
    userAgentInfo,
    sessionInfo,
    setNavSubHeader,
  } = userContext;
  const {
    setNotificationsArray,
    notificationsArray,
    removeNotifications,
    setShowOngoing,
  } = contactContext;

  const [smsChats, setSmsChats] = useState({});

  const [dateData, setDateData] = useState([]);
  const [search, setSearch] = useState(null);
  const [loading, setLoading] = useState(false);

  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      sessionStorage.setItem("currentNavHeader", "SMS");
      setNavHeader(sessionStorage.getItem("currentNavHeader"));
      setNavHeader("SMS");
      setNavSubHeader(null);
      getSMSChats();
      ipc.on("notification", function (event, url) {
        // console.log(JSON.parse(url.notification.body).from);
        JSON.parse(url.notification.body).to ==
          sessionStorage.getItem("my_telnyx_num") && getSMSChats();
        // setNotificationsArray(JSON.parse(url.notification.body).from);
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const Count = (num) => {
    let val = 0;
    notificationsArray.length > 0 &&
      notificationsArray.map((i) => {
        if (i == num.num) {
          val += 1;
        }
      });
    return val;
  };

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

          smsdb.remove({}, { multi: true }, function (err, numRemoved) {
            smsdb.insert(demoObj, function (err, newDoc) {
              // console.log(newDoc);
            });
          });
        } else if (status == "fail") {
          console.log(data);
        }
      }
    );
    // setLoading(false);
  };

  useEffect(() => {
    let isMount = true;
    if (isMount) {
      let dataa = [];
      smsChats !== {} &&
        Object.keys(smsChats)
          .filter((k) => k !== sessionStorage.getItem("my_telnyx_num"))
          .map((item, i) => {
            dataa.push({
              id: smsChats[item][smsChats[item].length - 1].id,
              number: item,
              date: new Date(
                smsChats[item][smsChats[item].length - 1].date
              ).toLocaleString(),
            });
          });
      dataa = dataa
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
        .filter((v, i, a) => a.findIndex((t) => t.number === v.number) === i);

      dataa = [...new Set(dataa)].sort(function (a, b) {
        var dateA = new Date(a.date),
          dateB = new Date(b.date);
        return dateB - dateA;
      });

      setDateData(dataa);
    }
    return () => {
      isMount = false;
    };
  }, [smsChats]);

  const CheckMessages = (message) => {
    try {
      if (typeof JSON.parse(message.message) === "object") {
        if (
          JSON.parse(message.message).replyTo !== undefined &&
          JSON.parse(message.message).replyTo !== "" &&
          JSON.parse(message.message).text !== undefined
        ) {
          return (
            <span>
              <span className="fw-bold me-1">
                {JSON.parse(message.message).replyTo}
              </span>
              <span className=" mx-1">
                {`"${JSON.parse(message.message).text}"`}
              </span>
              :<span className="ms-1">{JSON.parse(message.message).msg}</span>
            </span>
          );
        } else if (
          JSON.parse(message.message).replyTo !== undefined &&
          JSON.parse(message.message).replyTo !== "" &&
          JSON.parse(message.message).text === undefined
        ) {
          return (
            <span>
              <span className="fw-bold me-1">
                {JSON.parse(message.message).replyTo}
              </span>
              :<span className="ms-1">{JSON.parse(message.message).msg}</span>
            </span>
          );
        } else if (JSON.parse(message.message).replyTo === "") {
          return <span className="">{JSON.parse(message.message).msg}</span>;
        }
      }
    } catch (e) {
      return message.message;
    }
    return null;
  };

  const searchTerm = (num) => {
    let arr = [];
    Object.keys(smsChats).map((i) => {
      if (i == num) {
        smsChats[i].map((item) => {
          if (
            item.messages !== null &&
            item.messages.toLowerCase().includes(search.toLowerCase())
          ) {
            arr.push(item);
          }
        });
      }
    });
    return arr;
  };

  const DisplayMessage = (num) => {
    let arr = [];
    Object.keys(smsChats).map((i) => {
      if (i == num) {
        smsChats[i].map((item) => {
          if (
            item.messages !== null &&
            item.messages.toLowerCase().includes(search.toLowerCase())
          ) {
            arr.push(item);
          }
        });
      }
    });

    return arr;
  };

  return (
    <>
      {loading ? (
        <span className="w-100 min-vh-100 d-flex justify-content-center align-items-center">
          <Loader height="100px" width="100px" />
        </span>
      ) : (
        <div className=" px-0">
          <div className="row mt-4 ">
            <div className="form-group me-4 mb-2">
              <i className="fas fa-search" />
              <input
                placeholder="Search"
                onChange={(e) => setSearch(e.target.value)}
                className="form-control sidebar-search rounded-pill"
              />
            </div>
          </div>
          {
            // Object.keys(smsChats).map((item, i) => {
            dateData.length > 0 &&
              dateData
                .filter((a, b) => a.id !== b.id)
                .filter((term) => {
                  if (search !== null && term.number.includes(search)) {
                    return term;
                  } else if (search === null) {
                    return term;
                  } else if (
                    search !== null &&
                    showNameOrNumber(term.number)
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  ) {
                    return term;
                  } else {
                    let arr = searchTerm(term.number);
                    if (arr.length > 0) {
                      return term;
                    }
                  }
                })

                .map((item, i) => {
                  return (
                    <SmsClicked
                      dialcall={() => {
                        setShowOngoing({
                          flag: true,
                          number: item.number,
                          image: null,
                        });
                        dilaerFun(item.number, userAgentInfo, sessionInfo);
                      }}
                      index={i}
                      firstNumber={item.number}
                      addProfile={() => {
                        var len = item.number.length;
                        props.history.push({
                          pathname: "/createContact",
                          state: {
                            addNumber: `${item.number.slice(len - 10, len)}`,
                            countryCode: `${item.number.slice(0, len - 10)}`,
                          },
                        });
                      }}
                      smsfun={() => {
                        removeNotifications(item.number);

                        sessionStorage.setItem(
                          "currentChats",
                          JSON.stringify(smsChats[item.number])
                        );
                        sessionStorage.setItem("currentMember", item.number);

                        props.history.push({
                          pathname: `/SMSChat/${item.number}`,
                          state: {
                            chats: smsChats[item.number],
                          },
                        });
                      }}
                      editProfile={() => {
                        console.log(item);
                        props.history.push({
                          pathname: "/contactProfile",
                          state: {
                            id: [`${item.id}`],
                            name: "",
                            // phone_details:,
                            // image:
                            //   contact.image !== null
                            //     ? contact.image
                            //     : person,
                            // email: contact.email,
                            // address: contact.address,
                            // company: contact.company,
                            // description: contact.description,
                          },
                        });
                      }}
                    >
                      <div
                        key={item.number}
                        className="row  mt-3  py-1 position-relative border-bottom  one-chat"
                        onClick={() => {
                          removeNotifications(item.number);

                          sessionStorage.setItem(
                            "currentChats",
                            JSON.stringify(smsChats[item.number])
                          );
                          sessionStorage.setItem("currentMember", item.number);

                          props.history.push({
                            pathname: `/SMSChat/${item.number}`,
                            state: {
                              chats: smsChats[item.number],
                            },
                          });
                        }}
                      >
                        <div className="row position-relative">
                          <div className="col-3 d-flex align-items-center">
                            <div className="">
                              <img
                                src={
                                  setCallImage(item.number) !== null
                                    ? setCallImage(item.number)
                                    : defaultPic
                                }
                                alt=""
                                className="call-person-img"
                              />
                            </div>
                            <div className="mx-4">
                              <div className="fs-6 fw-bold px-0 d-flex flex-column">
                                <span>
                                  <DisplayName num={item.number} />
                                </span>
                                <span>{item.number}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-3"></div>
                          <div className="col-6 d-flex align-items-center justify-content-end">
                            <div className="mx-4 ">
                              <div className="px-0">
                                {search !== null &&
                                search !== "" &&
                                DisplayMessage(item.number)[0] !== undefined
                                  ? `${new Date(
                                      DisplayMessage(item.number)[0].date
                                    )
                                      .toLocaleString()
                                      .split(",")[0]
                                      .replaceAll("/", "-")} , ${
                                      new Date(
                                        DisplayMessage(item.number)[0].date
                                      )
                                        .toLocaleString()
                                        .split(",")[1]
                                        .slice(0, -6) +
                                      new Date(
                                        DisplayMessage(item.number)[0].date
                                      )
                                        .toLocaleString()
                                        .split(",")[1]
                                        .slice(-3)
                                    }`
                                  : `${new Date(
                                      smsChats[item.number][
                                        smsChats[item.number].length - 1
                                      ].date
                                    )
                                      .toLocaleString()
                                      .split(",")[0]
                                      .replaceAll("/", "-")} , ${
                                      new Date(
                                        smsChats[item.number][
                                          smsChats[item.number].length - 1
                                        ].date
                                      )
                                        .toLocaleString()
                                        .split(",")[1]
                                        .slice(0, -6) +
                                      new Date(
                                        smsChats[item.number][
                                          smsChats[item.number].length - 1
                                        ].date
                                      )
                                        .toLocaleString()
                                        .split(",")[1]
                                        .slice(-3)
                                    }`}
                              </div>
                              {notificationsArray.length > 0 &&
                                notificationsArray.includes(item.number) && (
                                  <div className="d-flex justify-content-end mt-2">
                                    <span
                                      className="d-flex justify-content-center align-items-center text-white"
                                      style={{
                                        width: "20px",
                                        background: "rgb(12 220 124)",
                                        height: " 20px",

                                        borderRadius: " 50%",
                                      }}
                                    >
                                      <Count num={item.number} />
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>

                        <div className="row  ps-4  ps-5">
                          <span
                            className="col d-flex  "
                            style={{ paddingLeft: "2.3rem" }}
                          >
                            {smsChats[item.number][
                              smsChats[item.number].length - 1
                            ].messages !== null ? (
                              search !== null &&
                              search !== "" &&
                              DisplayMessage(item.number)[0] !== undefined ? (
                                <CheckMessages
                                  message={
                                    DisplayMessage(item.number)[0].messages
                                  }
                                />
                              ) : (
                                <CheckMessages
                                  message={
                                    smsChats[item.number][
                                      smsChats[item.number].length - 1
                                    ].messages
                                  }
                                />
                              )
                            ) : (
                              <i className="fas fa-photo-video" />
                            )}
                          </span>
                        </div>
                      </div>
                    </SmsClicked>
                  );
                })
          }
        </div>
      )}
    </>
  );
};
export default SMSChats;
