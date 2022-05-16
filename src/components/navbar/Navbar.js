import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import sample from "../../assets/imgs/default-profile.png";
import NavbarClicked from "../rightClickMenu/NavbarClick";
import "./Navbar.css";
import { Menu, Dropdown } from "antd";
import UserContext from "../../context/useragent/userContext";
import LoginContext from "../../context/login/loginContext";
import ContactContext from "../../context/contact/contactContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import DataBase from "nedb";
import path from "path";
import axios from "axios";
import { Modal, Button } from "react-bootstrap";
import { CHANGE_PICKUP_STATUS, GET_SMS_CHATS } from "../../Constants/Api";
import {
  changePickupStatusAPI,
  getSMSChatsAPI,
} from "../../Constants/ApiHelper";
import { detailsLogger } from "../../Constants/Helper";

const Navbar = (props) => {
  const userContext = useContext(UserContext);
  const loginContext = useContext(LoginContext);
  const contactContext = useContext(ContactContext);
  const {
    nav_header,
    user_registered,
    dilaerFun,
    userAgentInfo,
    nav_subheader,
    setGlobalUserAgent,
    getUAConfig,
    sessionInfo,
    userLogOut,
    single_screen,
    setNavHeader,
    setNavSubHeader,
  } = userContext;
  const { collapse_sidebar, collapseSidebar, setLoginText } = loginContext;
  const { onLineStatus, onLineStatusNumber, setShowOngoing } = contactContext;
  const ipc = window.require("electron").ipcRenderer;

  const [onLineStatusNavbar, setOnlineStatusNavbar] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const [releaseSure, setReleaseSure] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [quitting, setQuitting] = useState(false);
  const [isQuit, setIsQuit] = useState(false);
  const logger = window.require("electron").remote.require("./logger");

  useEffect(() => {
    ipc.on("quitApp", function (event, url) {
      if (
        sessionStorage.getItem("userInfo") !== null &&
        JSON.parse(sessionStorage.getItem("userInfo")).extension.groupPhone !==
          null
      ) {
        releaseAllGroups();
        setQuitting(true);
      } else {
        ipc.send("quitApp", true);
      }
    });

    ipc.on("unlocked", function (event, url) {
      const register = async () => {
        if (sessionStorage.getItem("userInfo") !== null) {
          let { userAgent, registerer } = await getUAConfig(
            JSON.parse(sessionStorage.getItem("userInfo")).extension.username,
            JSON.parse(sessionStorage.getItem("userInfo")).extension.name
            // 213101,
            // "tanmay agarwal"
          );

          setGlobalUserAgent(userAgent);
        }
      };
      register();
    });
  }, []);

  const releaseAllGroups = () => {
    let groups;

    if (
      sessionStorage.getItem("groupNumbers") !== undefined &&
      sessionStorage.getItem("groupNumbers") !== null &&
      sessionStorage.getItem("groupNumbers").split(",").length > 0
    ) {
      groups = sessionStorage.getItem("groupNumbers").split(",");
      groups.forEach(async (ele) => {
        await getSMSChats(ele);
      });
    }
    console.log(groupData);
  };

  const getSMSChats = async (groupNum) => {
    sessionStorage.setItem("release_messages", JSON.stringify([]));
    // setLoading(true);
    let dataa = [];
    const token = sessionStorage.getItem("token");
    getSMSChatsAPI(token, groupNum).then(({ status, data }) => {
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
        console.log("nav 79", demoObj);

        Object.keys(demoObj).forEach((ele) => {
          if (ele !== groupNum) {
            let arr = demoObj[ele].map(
              (item, idx) => demoObj[ele][demoObj[ele].length - 1 - idx]
            );
            for (let i = 0; i < arr.length; i++) {
              if (
                sessionStorage.getItem("userInfo") !== null &&
                arr[i].pickup_status == 1 &&
                arr[i].pickup_by ==
                  JSON.parse(sessionStorage.getItem("userInfo")).extension
                    .ext_no
              ) {
                dataa.push(arr[i].message_id);
              }
            }
          }
        });
      } else if (status == "fail") {
        console.log(data);
      }
    });

    console.log(dataa);
    sessionStorage.setItem(
      "release_messages",
      JSON.stringify([
        ...JSON.parse(sessionStorage.getItem("release_messages")),
        ...dataa,
      ])
    );
  };

  useEffect(() => {
    const register = async () => {
      console.log(user_registered);
      if (user_registered === false) {
        if (sessionStorage.getItem("userInfo") !== null) {
          let { userAgent, registerer } = await getUAConfig(
            JSON.parse(sessionStorage.getItem("userInfo")).extension.username,
            JSON.parse(sessionStorage.getItem("userInfo")).extension.name
            // 213101,
            // "tanmay agarwal"
          );

          setGlobalUserAgent(userAgent);
        }
      }
    };
    register();
  }, []);

  useEffect(() => {
    if (sessionInfo.length !== 0) {
      onLineStatus(3);
    } else if (sessionInfo.length === 0) {
      onLineStatus(1);
    }
    if (
      sessionInfo.length !== 0 &&
      (sessionInfo[0]._state === "Established" ||
        sessionInfo[0]._state === "Establishing")
    ) {
      collapseSidebar(true);
    }
  }, [sessionInfo]);

  const history = useHistory();

  var callLogsDb = new DataBase({
    filename: path.join(__dirname, "/callLog.db"),
    autoload: true,
  });
  var instantMessageDb = new DataBase({
    filename: path.join(__dirname, "/instantMessageDb.db"),
    autoload: true,
  });
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });
  const handleQuit = async () => {
    setIsQuit(true);
    setTimeout(() => {
      changePickUp();
    }, 2000);
    setTimeout(() => {
      setIsQuit(false);
      ipc.send("quitApp", true);
    }, 4000);
  };

  const handleLogOut = async () => {
    if (
      sessionStorage.getItem("userInfo") !== null &&
      JSON.parse(sessionStorage.getItem("userInfo")).extension.groupPhone !==
        null
    ) {
      setTimeout(() => {
        changePickUp();
      }, 2000);
    }

    onLineStatus(0);
    await getUAConfig(null, null);

    await callLogsDb.remove({}, { multi: true }, function (err, numRemoved) {
      console.log("callLogsDb removed");
    });
    // await smsdb.remove({}, { multi: true }, function (err, numRemoved) {
    //   console.log("sms db removed");
    // });
    await instantMessageDb.remove(
      {},
      { multi: true },
      function (err, numRemoved) {
        console.log("IM db removed");
      }
    );
    if (
      sessionStorage.getItem("userInfo") !== null &&
      JSON.parse(sessionStorage.getItem("userInfo")).extension.groupPhone !==
        null
    ) {
      setTimeout(() => {
        userLogOut(history);
        setReleaseSure(false);
        setLoggingOut(false);
      }, 5000);
    } else {
      setTimeout(() => {
        userLogOut(history);
      }, 500);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="1">
        <Link to="/myProfile" className="link-color">
          <i className="fas fa-user-circle" /> Profile
        </Link>
      </Menu.Item>

      <Menu.Item key="2">
        <span
          onClick={() => {
            setShowOngoing({
              flag: true,
              number: "*123",
              image: null,
            });
            dilaerFun("*123", userAgentInfo, sessionInfo);
          }}
        >
          <i className="fas fa-voicemail me-1" />
          Voice Mails
        </span>
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={async () => {
          // handleLogOut();
          setLoginText(null);
          if (
            sessionStorage.getItem("userInfo") !== null &&
            JSON.parse(sessionStorage.getItem("userInfo")).extension
              .groupPhone !== null
          ) {
            setReleaseSure(true);
            releaseAllGroups();
          } else {
            handleLogOut();
          }
        }}
      >
        <i className="fas fa-sign-out-alt" /> Log out
      </Menu.Item>
    </Menu>
  );

  const statusMenu = (
    <Menu>
      <Menu.Item key="1" onClick={() => onLineStatus(1)}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="float-end register-icon"
            style={{
              backgroundColor: "green",
            }}
          ></span>{" "}
          <div>Online</div>
        </div>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => onLineStatus(0)}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="float-end register-icon"
            style={{
              backgroundColor: "grey",
            }}
          ></span>{" "}
          <div>Invisible</div>
        </div>
      </Menu.Item>
      <Menu.Item key="3" onClick={() => onLineStatus(2)}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="float-end register-icon"
            style={{
              backgroundColor: "#f5cf04",
            }}
          ></span>{" "}
          <div>Away</div>
        </div>
      </Menu.Item>
      <Menu.Item key="4" onClick={() => onLineStatus(3)}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            className="float-end register-icon"
            style={{
              backgroundColor: "#a63031",
              marginRight: 10,
            }}
          ></span>{" "}
          <div>Do not Disturb</div>
        </div>
      </Menu.Item>
    </Menu>
  );

  useEffect(() => {
    console.log(navigator.onLine);
    if (navigator.onLine) {
      setOnlineStatusNavbar(true);
    }

    window.addEventListener("offline", function (e) {
      console.log("offline");
      setOnlineStatusNavbar(false);
    });

    window.addEventListener("online", function (e) {
      console.log("online");
      setOnlineStatusNavbar(true);
    });
  }, []);

  const changePickUp = async () => {
    let token = sessionStorage.getItem("token");

    let sms_ids = JSON.parse(sessionStorage.getItem("release_messages"));
    console.log("sms_ids", sms_ids);

    changePickupStatusAPI(
      token,
      sms_ids,
      2,
      JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
    ).then(async ({ flag, response }) => {
      if (flag == "success") {
        console.log("success");
      } else if (flag == "fail") {
        console.log("Fail", response);
      }
    });
  };

  return (
    <NavbarClicked
      index="navbar"
      dialCall={() => {
        if (nav_header !== null && nav_header !== undefined) {
          setShowOngoing({
            flag: true,
            number: nav_header.split(" ")[1],
            image: null,
          });
          dilaerFun(nav_header.split(" ")[1], userAgentInfo, sessionInfo);
        }
      }}
      NumberLength={
        nav_subheader !== null && nav_subheader.number !== undefined
          ? nav_subheader.number.length
          : 1
      }
      addProfile={() => {
        var len =
          nav_subheader !== null ? nav_subheader.number.toString().length : 1;
        var number =
          nav_subheader !== null ? nav_subheader.number.toString() : 1;
        if (number.length >= 10) {
          props.history.push({
            pathname: "/createContact",
            state: {
              addNumber: `${number}`,
              // countryCode :`${info.callee_id.slice(0,len-10)}`
            },
          });
        }
      }}
    >
      <div>
        <div
          className={`row ${
            collapse_sidebar ? "navbar-uncollapsed" : "navbar"
          }  d-flex`}
        >
          {/* <button
            onClick={() => {
              // logger.logInfo("Clicked from navbar")
              detailsLogger("testing from navbar");
            }}
          >
            click
          </button> */}
          {releaseSure && (
            <Modal
              show={releaseSure}
              // onHide={props.setShow}
              backdrop="static"
              keyboard={false}
              centered
            >
              <div className="d-flex justify-content-end">
                <i
                  className="fas fa-times fs-4 mx-3 my-2"
                  onClick={() => setReleaseSure(false)}
                ></i>
              </div>
              <div className="d-flex justify-content-center align-items-center fs-5 flex-column my-2">
                {loggingOut ? (
                  <span className="my-2">Logging out...</span>
                ) : (
                  releaseSure && (
                    <div className="d-flex justify-content-center align-items-center fs-5 flex-column">
                      <span>Are you sure to Log out?</span>
                      <span className="text-danger">
                        All your picked up messages will be released.
                      </span>
                    </div>
                  )
                )}
              </div>
              {!loggingOut && (
                <Modal.Footer className="py-0">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      setLoggingOut(true);
                      handleLogOut();
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setReleaseSure(false);
                    }}
                  >
                    No
                  </Button>
                </Modal.Footer>
              )}
            </Modal>
          )}
          {quitting && (
            <Modal
              show={quitting}
              // onHide={props.setShow}
              backdrop="static"
              keyboard={false}
              centered
            >
              <div className="d-flex justify-content-end">
                <i
                  className="fas fa-times fs-4 mx-3 my-2"
                  onClick={() => setQuitting(false)}
                ></i>
              </div>
              <div className="d-flex justify-content-center align-items-center fs-5 flex-column my-2">
                {isQuit ? (
                  <span>Quiting</span>
                ) : (
                  <div className="d-flex justify-content-center align-items-center fs-5 flex-column">
                    <span>Are you sure to Quit?</span>
                    <span className="text-danger">
                      All your picked up messages will be released.
                    </span>
                  </div>
                )}
              </div>
              {!isQuit && (
                <Modal.Footer className="py-0">
                  <Button
                    variant="primary"
                    onClick={async () => {
                      setIsQuit(true);
                      handleQuit();
                    }}
                  >
                    Yes
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setQuitting(false);
                    }}
                  >
                    No
                  </Button>
                </Modal.Footer>
              )}
            </Modal>
          )}
          <span>
            <span
              className={`${
                window.matchMedia("(max-width: 740px)").matches === true ||
                (sessionInfo !== undefined &&
                  sessionInfo !== null &&
                  sessionInfo.length > 2)
                  ? "d-none"
                  : "px-2 fs-4 text-white"
              }`}
            >
              <i
                className="fas fa-bars"
                onClick={() => {
                  // detailsLogger("collapsed sidebar");
                  collapseSidebar(!collapse_sidebar);
                  console.log(collapse_sidebar);
                }}
              />
            </span>

            <span className="ps-2 fs-3 me-3">{nav_header}</span>
            {/* <span>{single_screen.toString()}</span> */}
            <span
              style={{ cursor: "pointer", fontSize: "1.5rem" }}
              className={nav_subheader !== null && nav_subheader.icon}
              onClick={() => {
                if (nav_header !== null && nav_subheader !== null) {
                  setShowOngoing({
                    flag: true,
                    number: nav_subheader.number,
                    image: null,
                  });
                  dilaerFun(nav_subheader.number, userAgentInfo, sessionInfo);
                }
              }}
            ></span>

            <Dropdown overlay={menu} trigger={["click"]} className="float-end">
              <span className="my-2 me-2">
                <i className="fas fa-ellipsis-v"></i>
              </span>
            </Dropdown>

            <Dropdown
              overlay={statusMenu}
              trigger={["click"]}
              className="float-end"
            >
              {sessionStorage.getItem("profileImage") !== "null" ? (
                <img
                  className="me-3 float-end person-img"
                  alt=""
                  src={sessionStorage.getItem("profileImage")}
                />
              ) : (
                <img
                  className="me-3 float-end person-img"
                  alt=""
                  src={sample}
                />
              )}
            </Dropdown>

            {/* {onLineStatusNavbar === true ? (
            <span
              className="float-end mt-4 register-icon"
              style={{
                backgroundColor: `${user_registered ? "#3ffb10" : "#838383"}`,
              }}
              onClick={() => console.log(onLineStatusNavbar)}
            ></span>
          ) : (
            <span
              className="spinner-border float-end mt-4 register-icon text-success"
              role="status"
              onClick={() => console.log(onLineStatusNavbar)}
            >
              <span className="sr-only">Loading...</span>
            </span>
          )} */}
            <span
              className="float-end mt-4 register-icon"
              style={{
                backgroundColor: `${
                  onLineStatusNumber === 1
                    ? "#3ffb10"
                    : onLineStatusNumber === 0
                    ? "grey"
                    : onLineStatusNumber === 2
                    ? "yellow"
                    : onLineStatusNumber === 3
                    ? "red"
                    : "#3ffb10"
                }`,
              }}
              onClick={() => {
                // detailsLogger("change online status");
                console.log(onLineStatusNumber);
              }}
            ></span>
          </span>
        </div>
      </div>
    </NavbarClicked>
  );
};

export default Navbar;
