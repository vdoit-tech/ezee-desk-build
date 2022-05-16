import React, { useContext, useEffect, useState } from "react";
import defaultPic from "../../../assets/imgs/default-profile.png";
import refresh from "../../../assets/imgs/refresh.png";
import UserContext from "../../../context/useragent/userContext";
import ContactContext from "../../../context/contact/contactContext";
import { useLocation } from "react-router-dom";
import SmsClicked from "../../../components/rightClickMenu/SmsClicked";

import axios from "axios";
import DataBase from "nedb";
import path from "path";
import { Menu, Dropdown } from "antd";
// import { machineId, machineIdSync } from "node-machine-id";

import {
  CheckMessages,
  DisplayName,
  DisplayNameOrNumber,
  getTotalUnReplied,
  setCallImage,
  showNameOrNumber,
} from "../../../Constants/Helper";
import Loader from "../../../components/loader/Loader";
import {
  GET_SMS_CHATS,
  CHANGE_PICKUP_STATUS,
  CHANGE_READ_STATUS,
} from "../../../Constants/Api";
import {
  changePickupStatusAPI,
  changeReadStatusAPI,
  getSMSChatsAPI,
} from "../../../Constants/ApiHelper";

const ipc = window.require("electron").ipcRenderer;

const SMSGroup = (props) => {
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
    get_remote_contact,
    setGroupNotifications,
    groupNotifications,
    getGroupNotifications,
    setShowOngoing,
  } = contactContext;
  const location = useLocation();
  let currentGroup = sessionStorage.getItem("currentGroup");

  const [smsChats, setSmsChats] = useState({});
  const [dateData, setDateData] = useState([]);
  const [search, setSearch] = useState(null);

  const [change, setChange] = useState(
    currentGroup !== null && JSON.parse(currentGroup)[0]
  );
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    // getSMSChats();
    sessionStorage.setItem("pickup_status", 0);
    sessionStorage.setItem("start_status", 0);
  }, []);

  // useEffect(() => {
  //   let isMounted = true;
  //   if (isMounted) {
  //     if (currentGroup !== null) {
  //       ipc.on("notification", function (event, url) {
  //         console.log(JSON.parse(url.notification.body));
  //         if (
  //           JSON.parse(url.notification.body).to == JSON.parse(currentGroup)[0]
  //         ) {
  //           getSMSChats();
  //           console.log("called");
  //         }
  //       });
  //     }
  //   }
  //   return () => {
  //     isMounted = false;
  //   };
  // }, []);

  useEffect(() => {
    if (currentGroup !== null) {
      setChange(JSON.parse(currentGroup)[0]);
    }
  }, [currentGroup !== null && JSON.parse(currentGroup)[0]]);

  useEffect(() => {
    // const { groupName, groupNumber } = location.state;
    if (currentGroup !== null) {
      sessionStorage.setItem(
        "currentNavHeader",
        `Group: ${JSON.parse(currentGroup)[1]}, Number:${
          JSON.parse(currentGroup)[0]
        }`
      );
      setNavHeader(sessionStorage.getItem("currentNavHeader"));

      setNavHeader(
        `Group: ${JSON.parse(currentGroup)[1]}, Number:${
          JSON.parse(currentGroup)[0]
        }`
      );
      setNavSubHeader("");
      getSMSChats();
    }
  }, [change]);

  useEffect(() => {
    let isMount = true;
    if (isMount && currentGroup !== null) {
      let dataa = [];
      smsChats !== {} &&
        Object.keys(smsChats)
          .filter((k) => k !== `${JSON.parse(currentGroup)[0]}`)
          .map((item, i) => {
            dataa.push({
              id: smsChats[item][smsChats[item].length - 1].id,
              number: item,
              date: smsChats[item][smsChats[item].length - 1].date,
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

  //menu for mark as read
  const menu = (sms_id) => {
    return (
      <Menu>
        <Menu.Item key="1">
          <span
            onClick={async () => {
              let token = sessionStorage.getItem("token");

              changeReadStatusAPI(token, sms_id).then(
                ({ status, response }) => {
                  if (status == "success") {
                    getSMSChats();
                    getGroupNotifications(getTotalUnReplied);
                  } else if (status == "fail") {
                    console.log(response);
                  }
                }
              );
            }}
          >
            mark as read
          </span>
        </Menu.Item>
      </Menu>
    );
  };

  const getSMSChats = () => {
    // setLoading(true);
    const token = sessionStorage.getItem("token");
    getSMSChatsAPI(token, JSON.parse(currentGroup)[0]).then(
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
          // console.log(demoObj);
          setSmsChats(demoObj);
          smsdb.remove({}, { multi: true }, function (err, numRemoved) {
            smsdb.insert(demoObj, function (err, newDoc) {
              // console.log(newDoc);
            });
          });
          // setLoading(false);
          let dataa = [];
          demoObj !== {} &&
            Object.keys(demoObj)
              .filter((k) => k !== `${JSON.parse(currentGroup)[0]}`)
              .map((item, i) => {
                dataa.push({
                  id: demoObj[item][demoObj[item].length - 1].id,
                  number: item,
                  date: demoObj[item][demoObj[item].length - 1].date,
                });
                // dataa.push({
                //   id: smsChats[item][smsChats[item].length - 1].id,
                //   number: item,
                //   date: smsChats[item][smsChats[item].length - 1].date,
                // });
              });
          dataa = dataa
            .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
            .filter(
              (v, i, a) => a.findIndex((t) => t.number === v.number) === i
            );

          dataa = [...new Set(dataa)].sort(function (a, b) {
            var dateA = new Date(a.date),
              dateB = new Date(b.date);
            return dateB - dateA;
          });

          setDateData(dataa);
        } else if (status == "fail") {
          console.log(data);
        }
      }
    );
  };

  const changePickUp = async (sms_id, status, numb) => {
    let token = sessionStorage.getItem("token");
    let num = numb.num;
    console.log(num, smsChats[num]);

    changePickupStatusAPI(
      token,
      sms_id,
      status,
      JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
    ).then(async ({ flag, response }) => {
      if (flag == "success") {
        await getSMSChats();
        if (status == 1) {
          sessionStorage.setItem("pickup_status", 1);

          console.log(smsChats[num]);
          await sessionStorage.setItem(
            "currentChats",
            JSON.stringify(smsChats[num])
          );
          await sessionStorage.setItem("currentMember", num);
          await props.history.push({
            pathname: `/SMSGroupsChat/${num}`,
            state: {
              chats: smsChats[num],
              group: JSON.parse(currentGroup)[1],
              groupNumber: JSON.parse(currentGroup)[0],
            },
          });
        }
      } else if (flag == "fail") {
        console.log(response);
        document.getElementById("sms-already-picked").innerHTML =
          "SMS already picked up";
        setTimeout(() => {
          document.getElementById("sms-already-picked").innerHTML = "";
          getSMSChats();
        }, 500);
      }
    });
  };

  const GetTotalUnReplied = (detail) => {
    let arr = [];
    let num = 0;
    let val = detail.detail;
    let index = 0;
    let arrr = smsChats[val]
      .filter(
        (i) => currentGroup !== null && i.from !== JSON.parse(currentGroup)[0]
      )
      .map((item, idx) => smsChats[val][smsChats[val].length - 1 - idx]);

    for (let i = 0; i < arrr.length; i++) {
      if (arrr[i] !== undefined && arrr[i].read_status == 1) {
        index = i;
        break;
      }
    }

    // for (let i = index; i >= 0; i--) {
    //   if (arrr[i] !== undefined && arrr[i].read_status == 0) {
    //     num += 1;
    //   }
    // }
    for (let i = index; i >= 0; i--) {
      if (
        arrr[i] !== undefined &&
        arrr[i].read_status == 0 &&
        arrr[i].from !== JSON.parse(currentGroup)[0]
      ) {
        num += 1;
      }
    }

    return (
      num !== 0 && (
        <Dropdown overlay={() => menu(arrr[0].message_id)} trigger={["click"]}>
          <span
            onClick={() => console.log(arrr[0])}
            className="fw-bold me-3"
            style={{
              background: "rgb(12 220 124)",

              padding: "0px 7px",
              borderRadius: "20rem",
              fontSize: "0.9rem",
              color: "#fff",
            }}
          >
            {num}
          </span>
        </Dropdown>
      )
    );
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
            if (
              currentGroup !== null &&
              item.from !== JSON.parse(currentGroup)[0]
            ) {
              arr.push(item);
            }
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
          )
            if (
              currentGroup !== null &&
              item.from !== JSON.parse(currentGroup)[0]
            ) {
              arr.push(item);
            }
        });
      }
    });

    return arr;
  };
  const getNameorNumber = (num) => {
    let name = null;

    let remote_contacts =
      JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
      JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
      typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !==
        "string" &&
      JSON.parse(sessionStorage.getItem("remote_contacts"));

    remote_contacts !== false &&
      remote_contacts !== null &&
      remote_contacts !== undefined &&
      typeof remote_contacts !== "string" &&
      remote_contacts.some((item, index) => {
        if (item.extension_no == num) {
          name = item.name;
        }
        if (name !== null) return true;
      });

    return name == null ? num : name;
  };
  const GetRepliedBy = (num) => {
    let arr = smsChats[num.num].map(
      (item, idx) => smsChats[num.num][smsChats[num.num].length - 1 - idx]
    );

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].repliedBy != null) {
        return (
          <span>
            <span className="fw-bold me-1">replied by:</span>

            {getNameorNumber(arr[i].repliedBy)}
          </span>
        );
      }
    }

    return null;
  };

  const HandlePickUp = (num) => {
    let arr = smsChats[num.num].map(
      (item, idx) => smsChats[num.num][smsChats[num.num].length - 1 - idx]
    );
    let index = 0;
    let startIndex = 0;

    for (let i = 0; i < arr.length; i++) {
      if (
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_status == 1 &&
        arr[i].pickup_by ==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
      ) {
        return (
          <button
            className="btn btn-warning btn-sm mx-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 2, num);
            }}
          >
            release
          </button>
        );
      }
      if (
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_status == 1 &&
        arr[i].pickup_by !==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
      ) {
        return (
          <span className="text-primary mx-1">
            picked up by {getNameorNumber(arr[i].pickup_by)}
          </span>
        );
      }
    }

    for (let i = 0; i < arr.length; i++) {
      if (
        sessionStorage.getItem("currentGroup") !== null &&
        currentGroup !== null &&
        arr[0].from == JSON.parse(currentGroup)[0] &&
        (arr[i].pickup_status == 0 || arr[i].pickup_status == 2)
      ) {
        return (
          <button
            className="btn btn-primary btn-sm mx-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 1, num);
            }}
          >
            start
          </button>
        );
      }
      if (
        sessionStorage.getItem("currentGroup") !== null &&
        currentGroup !== null &&
        arr[0].to == JSON.parse(currentGroup)[0] &&
        arr[0].read_status == 1 &&
        (arr[i].pickup_status == 0 || arr[i].pickup_status == 2)
      ) {
        return (
          <button
            className="btn btn-primary btn-sm mx-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 1, num);
            }}
          >
            start
          </button>
        );
      }
      if (
        sessionStorage.getItem("currentGroup") !== null &&
        currentGroup !== null &&
        arr[0].to == JSON.parse(currentGroup)[0] &&
        arr[0].read_status == 0 &&
        (arr[i].pickup_status == 0 || arr[i].pickup_status == 2)
      ) {
        return (
          <button
            className="btn btn-danger btn-sm mx-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 1, num);
            }}
          >
            pick up
          </button>
        );
      }
    }

    return "";
  };

  const HandlePickupStatus = (num) => {
    let arr = smsChats[num.num].map(
      (item, idx) => smsChats[num.num][smsChats[num.num].length - 1 - idx]
    );
    let index = 0;
    let startIndex = 0;

    for (let i = 0; i < arr.length; i++) {
      if (currentGroup !== null && arr[i].from == JSON.parse(currentGroup)[0]) {
        index = i;
        break;
      }
    }
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].repliedBy !== null) {
        startIndex = i;
        break;
      }
    }

    if (
      arr[startIndex].pickup_status == 1 &&
      sessionStorage.getItem("userInfo") !== null &&
      arr[startIndex].pickup_by ==
        JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
    ) {
      return (
        <button
          className="btn btn-warning btn-sm mx-1"
          onClick={() => {
            console.log(arr[startIndex]);
            changePickUp(arr[startIndex].message_id, 2);
          }}
        >
          release
        </button>
      );
    } else if (
      arr[startIndex].pickup_status == 1 &&
      sessionStorage.getItem("userInfo") !== null &&
      arr[startIndex].pickup_by !=
        JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
    ) {
      return (
        <span className="text-primary mx-1">
          picked up by {getNameorNumber(arr[startIndex].pickup_by)}
        </span>
      );
    }

    for (let i = 0; i < index; i++) {
      if (
        arr[i].pickup_status == 1 &&
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_by ==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
      ) {
        return (
          <button
            className="btn btn-warning btn-sm me-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 2);
            }}
          >
            release
          </button>
        );
      } else if (
        arr[i].pickup_status == 1 &&
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_by !=
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
      ) {
        return (
          <span className="text-primary me-1">
            picked up by {getNameorNumber(arr[i].pickup_by)}
          </span>
        );
      }
    }
    if (arr[0].read_status == 1) {
      return (
        <button
          className="btn btn-primary btn-sm me-1"
          onClick={() => {
            console.log(arr[0]);
            changePickUp(arr[0].message_id, 1, num.num);
          }}
        >
          start
        </button>
      );
    }

    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].pickup_status == 1 &&
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_by ==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no &&
        arr[i] &&
        currentGroup !== null &&
        arr[i].from == JSON.parse(currentGroup)[0]
      ) {
        return (
          <button
            className="btn btn-warning btn-sm mx-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 2);
            }}
          >
            release
          </button>
        );
      } else if (
        arr[i].pickup_status == 1 &&
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_by !==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no &&
        currentGroup !== null &&
        arr[i].from == JSON.parse(currentGroup)[0]
      ) {
        return (
          <span className="text-primary mx-1">
            picked up by {getNameorNumber(arr[i].pickup_by)}
          </span>
        );
      }
    }

    return (
      <button
        className="btn btn-danger btn-sm me-1"
        onClick={() => {
          console.log(arr[0]);
          changePickUp(arr[0].message_id, 1, num.num);
        }}
      >
        pick up
      </button>
    );
  };

  const StartChat = (num) => {
    let arr = smsChats[num.num].map(
      (item, idx) => smsChats[num.num][smsChats[num.num].length - 1 - idx]
    );
    let index = 0;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i].repliedBy !== null) {
        index = i;
        break;
      }
    }

    if (
      arr[index].pickup_status == 1 &&
      sessionStorage.getItem("userInfo") !== null &&
      arr[index].pickup_by ==
        JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
    ) {
      return (
        <button
          className="btn btn-warning btn-sm mx-1"
          onClick={() => {
            console.log(arr[index]);
            changePickUp(arr[index].message_id, 2);
          }}
        >
          release
        </button>
      );
    } else if (
      arr[index].pickup_status == 1 &&
      sessionStorage.getItem("userInfo") !== null &&
      arr[index].pickup_by !=
        JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
    ) {
      return (
        <span className="text-primary mx-1">
          picked up by {getNameorNumber(arr[index].pickup_by)}
        </span>
      );
    }

    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].pickup_status == 1 &&
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_by ==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no &&
        currentGroup !== null &&
        arr[i].from == JSON.parse(currentGroup)[0]
      ) {
        //changed here arr[i]
        return (
          <button
            className="btn btn-warning btn-sm mx-1"
            onClick={() => {
              console.log(arr[i]);
              changePickUp(arr[i].message_id, 2);
            }}
          >
            release
          </button>
        );
      } else if (
        arr[i].pickup_status == 1 &&
        sessionStorage.getItem("userInfo") !== null &&
        arr[i].pickup_by !==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no &&
        currentGroup !== null &&
        arr[i].from == JSON.parse(currentGroup)[0]
      ) {
        return (
          <span className="text-primary mx-1">
            picked up by {getNameorNumber(arr[i].pickup_by)}
          </span>
        );
      }
    }

    return (
      <button
        className="btn btn-primary btn-sm mx-1"
        onClick={() => {
          console.log(arr);
          console.log(arr[index]);
          sessionStorage.setItem("pickup_status", 1);
          changePickUp(arr[index].message_id, 1, num.num);
        }}
      >
        start
      </button>
    );
  };

  // async function getMachineId() {
  //   // let id = machineIdSync();
  //   // console.log(id);
  //   let id = await machineId();
  //   console.log(id);

  //   // machineId().then((id) => {
  //   //   console.log(id);
  //   // });
  // }

  // Syncronous call

  return (
    <>
      {loading ? (
        <div className="w-100 min-vh-100 d-flex align-items-center justify-content-center">
          <Loader height="100px" width="100px" />
        </div>
      ) : (
        <div className=" px-0 mb-5">
        
          <div className="row mt-4 d-flex">
            <div className="form-group me-4 mb-2">
              <i className="fas fa-search" />
              <input
                placeholder="Search "
                className="form-control sidebar-search rounded-pill"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <div
              id="sms-already-picked"
              className="me-5 fs-5 text-danger"
            ></div>
            <img
              src={refresh}
              alt="refresh"
              height={30}
              style={{ cursor: "pointer" }}
              onClick={() => {
                console.log("click");
                console.log("click");
                getSMSChats();
              }}
            />
          </div>
          {dateData.length > 0 &&
            dateData
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
                if (
                  smsChats[item.number] !== undefined &&
                  // smsChats[item.number][smsChats[item.number].length - 1]
                  //   .from !== JSON.parse(currentGroup)[0] &&
                  // smsChats[item.number] !== undefined &&
                  smsChats[item.number][smsChats[item.number].length - 1]
                    .from !== sessionStorage.getItem("my_telnyx_num")
                ) {
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
                        key={i}
                        className="row  mt-3  py-1 position-relative border-bottom  one-chat px-0"
                        // onClick={() => {
                        //   console.log(smsChats[item.number]);
                        // }}
                      >
                        <div
                          className="row position-relative"
                          onClick={() => {
                            console.log(
                              smsChats[item.number].filter(
                                (i) =>
                                  currentGroup !== null &&
                                  i.from !== JSON.parse(currentGroup)[0]
                              )
                            );
                            if (currentGroup !== null) {
                              sessionStorage.setItem(
                                "currentChats",
                                JSON.stringify(smsChats[item.number])
                              );
                              sessionStorage.setItem(
                                "currentMember",
                                item.number
                              );
                              props.history.push({
                                pathname: `/SMSGroupsChat/${item.number}`,
                                state: {
                                  chats: smsChats[item.number],
                                  group: JSON.parse(currentGroup)[1],
                                  groupNumber: JSON.parse(currentGroup)[0],
                                },
                              });
                            }
                          }}
                        >
                          <div className="col-3 d-flex align-items-center">
                            <div className="ms-0">
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
                            <div className="mx-2">
                              <span className="fw-bold">
                                <DisplayName num={item.number} />
                              </span>
                              <div className="fs-6 fw-bold px-0">
                                {item.number}
                              </div>
                            </div>
                          </div>
                          <div className="col-3"></div>
                          <div className="col-6 d-flex align-items-end justify-content-end flex-column">
                            <div className="mx-2 ">
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
                            </div>
                          </div>
                        </div>

                        <div className="row  ps-5">
                          <span
                            onClick={() => {
                              console.log(smsChats[item.number]);
                              if (currentGroup !== null) {
                                sessionStorage.setItem(
                                  "currentChats",
                                  JSON.stringify(smsChats[item.number])
                                );
                                sessionStorage.setItem(
                                  "currentMember",
                                  item.number
                                );
                                props.history.push({
                                  pathname: `/SMSGroupsChat/${item.number}`,
                                  state: {
                                    chats: smsChats[item.number],
                                    group: JSON.parse(currentGroup)[1],
                                    groupNumber: JSON.parse(currentGroup)[0],
                                  },
                                });
                              }
                            }}
                            className="col-7 d-flex  "
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
                          <div className="d-flex justify-content-end mt-1 col-5 pe-4">
                            <HandlePickUp num={item.number} />
                            {currentGroup !== null &&
                            smsChats[item.number][
                              smsChats[item.number].length - 1
                            ].from == JSON.parse(currentGroup)[0] ? (
                              <div>
                                <div className="d-flex">
                                  <span className="me-1">
                                    {/* <span>
                                      <span className="fw-bold me-1">
                                        replied by:
                                      </span> */}

                                    <GetRepliedBy num={item.number} />
                                    {/* <HandlePickupStatus num={item.number} /> */}
                                    {/* </span> */}
                                    {/* <StartChat num={item.number} /> */}
                                  </span>
                                  <span></span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {/* {smsChats[item.number][
                                  smsChats[item.number].length - 1
                                ].pickup_status == 0 ? (
                                  <button
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => {
                                      changePickUp(item.id, 1);
                                    }}
                                  >
                                    pick up
                                  </button>
                                ) : sessionStorage.getItem("userInfo") !==
                                    null &&
                                  smsChats[item.number][
                                    smsChats[item.number].length - 1
                                  ].pickup_status == 1 &&
                                  smsChats[item.number][
                                    smsChats[item.number].length - 1
                                  ].pickup_by ==
                                    JSON.parse(
                                      sessionStorage.getItem("userInfo")
                                    ).extension.ext_no ? (
                                  <button
                                    className="me-1 btn btn-sm btn-warning"
                                    onClick={() => changePickUp(item.id, 2)}
                                  >
                                    release
                                  </button>
                                ) : sessionStorage.getItem("userInfo") !==
                                    null &&
                                  smsChats[item.number][
                                    smsChats[item.number].length - 1
                                  ].pickup_status == 1 &&
                                  smsChats[item.number][
                                    smsChats[item.number].length - 1
                                  ].pickup_by !==
                                    JSON.parse(
                                      sessionStorage.getItem("userInfo")
                                    ).extension.ext_no ? (
                                  <span className="fw-bold text-primary">
                                    <span>picked up by</span>
                                    <span className="mx-1">
                                      {
                                        smsChats[item.number][
                                          smsChats[item.number].length - 1
                                        ].pickup_by
                                      }
                                    </span>
                                  </span>
                                ) : smsChats[item.number][
                                    smsChats[item.number].length - 1
                                  ].pickup_status == 2 ? (
                                  <button
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => {
                                      changePickUp(item.id, 1);
                                    }}
                                  >
                                    pick up
                                  </button>
                                ) : (
                                  ""
                                )} */}
                                {/* <HandlePickupStatus num={item.number} /> */}

                                <GetTotalUnReplied detail={item.number} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </SmsClicked>
                  );
                }
              })}
        </div>
      )}
    </>
  );
};
export default SMSGroup;
