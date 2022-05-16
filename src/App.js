import React, { useState, useEffect, useContext, useRef } from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { Modal } from "react-bootstrap";
import "./App.css";
import Login from "./components/login/Login";
import Calls from "./screens/calls/Calls";
import Dialpad from "./screens/dialerpad/Dialpad";
import Incoming from "./screens/incoming/Incoming";
import UserContext from "../src/context/useragent/userContext";
import Navbar from "./components/navbar/Navbar";
import SideBar from "./components/sidebar/sidebar";
import CreateContact from "./screens/createContact/CreateContact";
// import SMS from './screens/sms/SMS';
import MyProfile from "./screens/myprofile/MyProfile";
import AllCalls from "./screens/calls/allCalls/AllCalls";
import MissedCalls from "./screens/calls/missedCalls/MissedCalls";
import OutgoingCalls from "./screens/calls/outgoingCalls/OutgoingCalls";
import ReceivedCalls from "./screens/calls/receivedCalls/ReceivedCalls";
import ContactProfile from "./screens/contact/myContact/ContactProfile";
import CentralContact from "./screens/contact/centralContact/CentralContact";
import MyContact from "./screens/contact/myContact/MyContact";
import OngoingContainer from "./screens/ongoing/OngoingContainer";
import ContactContext from "./context/contact/contactContext";
import LoginContext from "./context/login/loginContext";
import RemoteContact from "./screens/contact/remoteContact/RemoteContact";
import ForgotPassword from "./screens/forgotPassword/ForgotPassword";
import CreateGroups from "./screens/groups/createGroups/CreateGroups";
// import AllGroups from "./screens/groups/allGroups/AllGroups";
import NewChat from "./screens/instantMessage/newChat/NewChat";
import DataBase from "nedb";
import path from "path";
import io from "socket.io-client";
import Chat from "./Chat";
import moment from "moment";
import Messages from "./screens/instantMessage/messages/Messages";
import AllChats from "./screens/instantMessage/allChats/AllChats";
import Efax from "./screens/efax/Efax";
import FaxLogs from "./screens/efax/FaxLogs";
import FaxChat from "./screens/efax/FaxChat";
import SMS from "./screens/sms/SMS";
import SMSChats from "./screens/sms/SMSChats";
import NewSMSChat from "./screens/sms/newChat/NewSMSChat";
import SMSGroupChat from "./screens/sms/smsGroups/SMSGroupChat";

import SMSGroup from "./screens/sms/smsGroups/SMSGroup";
import AllSMSGroups from "./screens/sms/smsGroups/AllSMSGroups";
import Dashboard from "./components/dashboard/Dashboard";
import FloaterIncoming from "./components/floater/FloaterIncoming";
import Feedback from "./components/feedback/Feedback";
import Loader from "./components/loader/Loader";
import ChatDetails from "./screens/instantMessage/chatDetails/ChatDetails";
import { getTotalUnReplied } from "./Constants/Helper";
import ModalConversations from "./screens/instantMessage/messages/ModalConversations";
import smsTone from "./assets/audio/sms1.mp3";
import notification from "./assets/audio/notification.mp3";
import ezeetelImg from "./assets/imgs/ezeetel-Logo.png";
import NewGroupChat from "./screens/sms/smsGroups/NewGroupChat";
import incomingTone from "./assets/audio/incoming.mp3";
import ChangePassword from "./screens/changePassword/ChangePassword";
import DisplayOngoingScreen from "./screens/ongoing/DisplayOngoingScreen";
import Documents from "./screens/documents/Documents";

console.log("start");
export const socketUrlApi = "http://159.203.24.15:4000";
// export const socket = io.connect("http://159.203.24.15:3000");
export const socket = "";
// export const socket = io.connect(
//   "http://cd9a-2405-204-8082-8ae4-1ca-65cc-5597-6bec.ngrok.io"
// );

// const socket = "Ezeetel Application";
console.log("end");

const ipc = window.require("electron").ipcRenderer;

const App = (props) => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [info, setInfo] = useState(null);
  const [openCount, setOpenCount] = useState(0);
  const [dialpadInput, setDialpadInput] = useState("");
  const [feedback, setFeedback] = useState(false);
  const [display, setDisplay] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  ipc.on("link", function (event, url) {
    console.log("link calling");
    console.log(url);
    setOpenCount(1);
    setInfo(url);
    setCallDivHeight(true);
  });
  ipc.on("logger", function (event, logger) {
    console.log("here", logger);
    logger.logInfo("hello 0|-");
  });
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const loginContext = useContext(LoginContext);
  const {
    sessionInfo,

    hide,
    setHide,
    demo_state,
    missed_status,
    single_screen,
    changeScreenView,
    setNavHeader,
    setNavSubHeader,
    getUAConfig,
    setGlobalUserAgent,
  } = userContext;
  const {
    get_call_log,
    addCallLog,
    call_start_time,
    call_number,
    callee_id,
    call_type,
    callee_name,
    getRemoteContact,
    onLineStatusNumber,
    setNotificationsArray,
    getCallLogs,
    getCallLogsFromDb,
    getGroupNotifications,
    groupNotifications,
    groupInitialNotifications,
    setGroupNotifications,
    showOngoing,
    setShowOngoing,
  } = contactContext;
  const {
    collapse_sidebar,
    collapseSidebar,
    sendIncomingCallNotification,
    loginChange,
    loginChangeFun,
    setLoaderOnSizeChange,
    loaderOnSizeChange,
  } = loginContext;
  const [callDivHeight, setCallDivHeight] = useState(false);
  const [displayIncoming, setDisplayIncoming] = useState(false);
  const [width, setWidth] = useState(false);
  const [incomingRing, setIncomingRing] = useState(
    // new Audio(
    //   "https://www.mediacollege.com/audio/tone/files/100Hz_44100Hz_16bit_30sec.mp3"
    // )
    new Audio(incomingTone)
  );

  const intervalRef = useRef();
  const breakpoint = 700;

  useEffect(() => {
    getCallLogs();
  }, []);

  useEffect(() => {
    if (isOnline == false) {
      console.log("online", isOnline);
      // if (sessionStorage.getItem("userInfo") !== null) {
      //   let { userAgent } = getUAConfig(
      //     JSON.parse(sessionStorage.getItem("userInfo")).extension.username,
      //     JSON.parse(sessionStorage.getItem("userInfo")).extension.name
      //   );
      //   setGlobalUserAgent(userAgent);
      //   console.log(userAgent);
      // }
    }
  }, [isOnline]);

  //change call view

  //collapse sidebar for more than 2 calls
  useEffect(() => {
    if (
      sessionInfo !== undefined &&
      sessionInfo.length > 2 &&
      collapse_sidebar == false
    ) {
      collapseSidebar(true);
    }
    // else if (sessionInfo.length == 0 && window.outerWidth > 600) {
    //   collapseSidebar(false);
    // }
    if (window.innerWidth <= 600 && sessionInfo.length < 1) {
      changeScreenView(false);
    }
  }, [sessionInfo]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      var x = window.matchMedia("(max-width: 740px)");

      if (x) {
        handleWidth(x); // Call listener function at run time
        x.addListener(handleWidth);
      }
      if (sessionInfo.length > 0 && window.innerWidth <= 576) {
        if (
          sessionInfo[0]._state == "Establishing" ||
          sessionInfo[0]._state == "Established"
        ) {
          changeScreenView(true);
        }
      } else if (sessionInfo.length > 0 && window.innerWidth > 576) {
        changeScreenView(false);
      }
    }
    return () => {
      isMounted = false;
    };
  }, [window.innerWidth]);

  function handleWidth(x) {
    // console.log(x);
    if (x.matches) {
      // If media query matches
      collapseSidebar(true);
    } else if (sessionInfo.length == 0) {
      collapseSidebar(false);
    }
  }

  useEffect(() => {
    if (single_screen == true) {
      setNavHeader("");
      setNavSubHeader("");
    } else if (single_screen == false) {
      setNavHeader(sessionStorage.getItem("currentNavHeader"));
    }
  }, [single_screen]);

  //calling get Extension after every 10s
  useEffect(() => {
    if (loginChange !== null && loginChange !== undefined) {
      const id = setInterval(() => {
        getRemoteContact();
      }, 10000);
      intervalRef.current = id;
      console.log("loggin successfully");
    } else if (loginChange === null || loginChange === undefined) {
      if (sessionStorage.getItem("userInfo") !== null) {
        loginChangeFun(true);
      } else {
        clearInterval(intervalRef.current);
        console.log("logout successfully");
      }
    }
  }, [loginChange]);

  //initializing database

  var callLogsDb = new DataBase({
    filename: path.join(__dirname, "/callLog.db"),
    autoload: true,
  });
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  //inserting data in database

  useEffect(() => {
    // console.log(get_call_log);
    if (get_call_log === null) {
      getCallLogsFromDb();
    } else if (get_call_log !== null) {
      callLogsDb.remove({}, { multi: true }, function (err, numRemoved) {
        callLogsDb.insert(get_call_log, function (err, newDoc) {
          console.log(newDoc);
        });
      });
    }
  }, [get_call_log]);

  //for events from electron.js
  useEffect(() => {
    ipc.on("hide", function (event, url) {
      console.log("hide here", url);
      setDisplay(url);
    });
    ipc.on("feedback", function (event, url) {
      console.log(url);
      setFeedback(true);
    });
    ipc.on("changeBg", function (event, url) {
      console.log(url);
      setLoaderOnSizeChange(url);
    });
  }, []);
  //for sms notifications
  useEffect(() => {
    getGroupNotifications();
  }, []);
  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      ipc.on("notification", function (event, url) {
        console.log(JSON.parse(url.notification.body).to);
        if (
          JSON.parse(url.notification.body).to ==
            sessionStorage.getItem("my_telnyx_num") &&
          sessionStorage.getItem("currentMember") !==
            JSON.parse(url.notification.body).from
        ) {
          setNotificationsArray(JSON.parse(url.notification.body).from);
          var audio = new Audio(notification);
          audio.play();
        } else if (
          JSON.parse(url.notification.body).to !==
          sessionStorage.getItem("my_telnyx_num")
        ) {
          var notif = new Audio(smsTone);
          notif.play();
          getGroupNotifications();
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  //for call notifications

  useEffect(() => {
    console.log("display ", display);
    if (
      sessionInfo.length > 0 &&
      sessionInfo[sessionInfo.length - 1]._state === "Initial"
    ) {
      ipc.send("ShowScreen", true);
    }

    if (display == true && sessionInfo !== null) {
      if (
        sessionInfo[sessionInfo.length - 1] !== undefined &&
        sessionInfo[sessionInfo.length - 1].incomingInviteRequest !== undefined
      ) {
        let num =
          sessionInfo[sessionInfo.length - 1].incomingInviteRequest.message.from
            .uri.raw.user;
        console.log(num);

        sendIncomingCallNotification(num);
      }
    }
  }, [sessionInfo, display]);

  //inserting call log in db and backend
  const sendCallLog = (
    startTime,
    endTime,
    callType,
    calleeNumber,
    calleeId,
    calleeName
  ) => {
    let dateStart = new Date(startTime);
    let dateEnd = new Date(endTime);
    const callDuration = moment
      .utc(
        moment(dateEnd, "DD/MM/YYYY HH:mm:ss").diff(
          moment(dateStart, "DD/MM/YYYY HH:mm:ss")
        )
      )
      .format("HH:mm:ss");
    addCallLog(
      null,
      calleeNumber,
      calleeName,
      calleeNumber,
      callType,
      callDuration,
      moment(dateStart).format("YYYY-MM-DD HH:mm:ss"),
      moment(dateEnd).format("YYYY-MM-DD HH:mm:ss"),
      moment(dateStart).format("YYYY-MM-DD"),
      moment(dateEnd).format("YYYY-MM-DD"),
      moment(dateStart).format("HH:mm:ss"),
      moment(dateEnd).format("HH:mm:ss")
    );
  };

  useEffect(() => {
    const end = new Date();
    let finalEnd = end;

    demo_state !== null &&
    missed_status === null &&
    call_start_time.length !== 0
      ? sendCallLog(
          call_start_time
            .map((i) => {
              if (i.id === demo_state) return i.start_time;
            })
            .filter((k) => k !== undefined)[0],
          finalEnd,
          call_type
            .map((i) => {
              if (i.id === demo_state) return i.type;
            })
            .filter((k) => k !== undefined)[0],

          call_number
            .map((i) => {
              if (i.id === demo_state) return i.number;
            })
            .filter((k) => k !== undefined)[0],
          callee_id
            .map((i) => {
              if (i.id === demo_state) return i.call_id;
            })
            .filter((k) => k !== undefined)[0],
          callee_name
            .map((i) => {
              if (i.id === demo_state) return i.name;
            })
            .filter((k) => k !== undefined)[0]
        )
      : missed_status === 3 &&
        sendCallLog(
          finalEnd,
          finalEnd,
          3,

          call_number
            .map((i) => {
              if (i.id === demo_state) return i.number;
            })
            .filter((k) => k !== undefined)[0],
          callee_id
            .map((i) => {
              if (i.id === demo_state) return i.call_id;
            })
            .filter((k) => k !== undefined)[0],
          null
        );
  }, [demo_state]);

  //for hiding incoming call  bar
  useEffect(() => {
    if (sessionInfo.length > 0 && sessionInfo[0]._state == "Terminated") {
      setShowOngoing({ flag: false, number: null, image: null });
    }
    if (sessionInfo.length === 0) {
      setHide(false);
    }
    if (
      sessionInfo.length !== 0 &&
      (sessionInfo[0]._state === "Established" ||
        sessionInfo[0]._state === "Establishing" ||
        sessionInfo[0]._state === "Terminated")
    ) {
      setHide(false);
      incomingRing.pause();
    } else if (
      sessionInfo.length !== 0 &&
      sessionInfo[0]._state === "Initial"
    ) {
      setHide(true);
    }
  }, [sessionInfo, sessionInfo[0] !== undefined && sessionInfo[0]._state]);

  //for displaying incoming call bar
  useEffect(() => {
    if (hide) {
      setDisplayIncoming(false);
    } else {
      setDisplayIncoming(true);
    }
  }, [hide]);

  // const DisplayOngoingScreen = () => {
  //   return (
  //     (showOngoing.flag == true ||
  //       sessionInfo.length > 1 ||
  //       (sessionInfo.length == 1 &&
  //         sessionInfo[0]._state == "Established")) && (
  //       <div
  //         className={`${
  //           (sessionInfo.length == 0 &&
  //             window.innerWidth >= 576 &&
  //             single_screen == false) ||
  //           (sessionInfo.length > 0 &&
  //             sessionInfo.length <= 2 &&
  //             window.innerWidth >= 576 &&
  //             single_screen == false)
  //             ? "col-4"
  //             : (sessionInfo.length == 0 &&
  //                 window.innerWidth < 576 &&
  //                 single_screen == true) ||
  //               (sessionInfo.length > 2 &&
  //                 window.innerWidth > 576 &&
  //                 single_screen == false) ||
  //               (sessionInfo.length > 0 &&
  //                 window.innerWidth <= 576 &&
  //                 single_screen == true)
  //             ? "col"
  //             : sessionInfo.length == 0 ||
  //               (sessionInfo.length > 0 &&
  //                 window.innerWidth <= 576 &&
  //                 single_screen == false)
  //             ? ""
  //             : //"d-none"
  //               ""
  //         } p-0 half-dashboard

  //           `}
  //         style={{
  //           display: "",
  //           zIndex: "1000 !important",
  //           top:
  //             loaderOnSizeChange !== true && window.outerWidth <= 310 && "0px",
  //           position:
  //             loaderOnSizeChange !== true &&
  //             window.outerWidth <= 310 &&
  //             "fixed",
  //           // width:loaderOnSizeChange !== true  && window.outerWidth <= 310 & "100px",
  //           height:
  //             loaderOnSizeChange !== true &&
  //             window.outerWidth <= 310 &&
  //             "200px",
  //           marginBottom:
  //             loaderOnSizeChange !== true && window.outerWidth <= 310 && "20px",
  //           backgroundColor:
  //             loaderOnSizeChange !== true &&
  //             window.outerWidth <= 310 &&
  //             "black",
  //         }}
  //       >
  //         <OngoingContainer />
  //       </div>
  //     )
  //   );
  // };

  return (
    <>
      {
        <>
          {loaderOnSizeChange === true && (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
              <Loader height="100px" width="100px" />
            </div>
          )}
          {/* { window.outerWidth <= 310 && window.outerWidth !== 576 &&
                loaderOnSizeChange === true && 
                  <div  className="d-flex justify-content-center align-items-center min-vh-100"  >
                    <Loader height="100px" width="100px" />
                  </div>
              } */}

          {window.outerWidth <= 310 &&
            window.outerWidth !== 576 &&
            loaderOnSizeChange !== true &&
            sessionInfo.length === 0 && (
              <div
                style={{
                  width: "100vw",
                  height: "100vh",
                  background: `${
                    sessionInfo.length !== 0
                      ? "linear-gradient(to right, #be2edd, #d8374c, #fc8c0c)"
                      : "#000"
                  }`,
                }}
              >
                <div className="d-flex align-items-center justify-content-center">
                  <>
                    <div className=" d-flex justify-content-end w-100 position-absolute bottom-0 left-0">
                      <i
                        className="fas fa-external-link-alt fs-6 text-white m-2 mt-3"
                        onClick={() => {
                          setLoaderOnSizeChange(true);
                          let width =
                            window.screen.availWidth -
                            (window.outerWidth - window.innerWidth);
                          let height =
                            window.screen.availHeight -
                            (window.outerHeight - window.innerHeight);

                          window.resizeTo(width + 105, height + 105);
                          setTimeout(() => {
                            setLoaderOnSizeChange(false);
                          }, [700]);
                        }}
                      ></i>
                    </div>
                    <img className="" src={ezeetelImg} alt="" />
                  </>
                </div>
              </div>
            )}
          {window.outerWidth <= 310 &&
            window.outerWidth !== 576 &&
            loaderOnSizeChange !== true &&
            sessionInfo.length > 0 &&
            sessionInfo[0]._state === "Initial" && (
              <div
                style={{
                  width: "100vw",
                  height: "100vh",
                  background: `${
                    sessionInfo.length !== 0
                      ? "linear-gradient(to right, #be2edd, #d8374c, #fc8c0c)"
                      : "#000"
                  }`,
                }}
              >
                {sessionInfo.length > 0 &&
                sessionInfo[0]._state === "Initial" &&
                sessionInfo[sessionInfo.length - 1].incomingInviteRequest !==
                  undefined ? (
                  <FloaterIncoming propData={props.history} />
                ) : (
                  sessionInfo.length > 1 &&
                  sessionInfo[sessionInfo.length - 1]._state === "Initial" &&
                  sessionInfo[sessionInfo.length - 1].incomingInviteRequest !==
                    undefined && (
                    <div className="text-center text-white d-flex align-items-center justify-content-center fs-5 mx-1">
                      You have another incoming call, expand to view
                    </div>
                  )
                )}
              </div>
            )}

          <>
            {
              <HashRouter>
                <Route exact path="/" component={Login} />
                <Route
                  exact
                  path="/forgotPassword"
                  component={ForgotPassword}
                />

                {window.outerWidth > 310 && (
                  <>
                    <SideBar />
                    <Navbar />
                  </>
                )}

                <div
                  // className="row"
                  className={`row
                  ${
                    collapse_sidebar
                      ? window.outerWidth > 310 && "dashboard-uncollapsed"
                      : "dashboard"
                  }`}
                >
                  {feedback && (
                    <Modal
                      show={feedback}
                      // onHide={props.setShow}
                      backdrop="static"
                      keyboard={false}
                      centered
                    >
                      <div className="d-flex justify-content-end">
                        <i
                          className="fas fa-times fs-4 mx-3 my-2"
                          onClick={() => setFeedback(false)}
                        ></i>
                      </div>

                      <Feedback />
                    </Modal>
                  )}
                  <div
                    className={`${
                      sessionInfo.length !== 0 &&
                      window.matchMedia("(max-width: 740px)").matches == true &&
                      single_screen === true
                        ? "d-none"
                        : "col half-dashboard"
                    }`}
                    style={{
                      display:
                        loaderOnSizeChange !== true &&
                        window.outerWidth <= 310 &&
                        "none",
                      top:
                        loaderOnSizeChange !== true &&
                        window.outerWidth <= 310 &&
                        "0px",
                      position:
                        loaderOnSizeChange !== true &&
                        window.outerWidth <= 310 &&
                        "fixed",
                    }}
                  >
                    {sessionStorage.getItem("userInfo") !== null &&
                      sessionInfo.length === 1 &&
                      sessionInfo[0]._state === "Initial" && (
                        <Incoming
                          propData={props.history}
                          incomingRing={incomingRing}
                        />
                      )}
                    <Switch>
                      <Route exact path="/dashboard" component={Dashboard} />

                      <Route exact path="/calls" component={Calls} />
                      {/* <Route
                        exact
                        path="/createGroups"
                        component={CreateGroups}
                      /> */}

                      <Route exact path="/allChats" component={AllChats} />

                      <Route
                        exact
                        path="/messages/:id/:heading/:isGroup"
                        component={Messages}
                      />

                      <Route exact path="/demo" component={NewChat} />

                      <Route
                        exact
                        path="/chatDetails/:id"
                        render={(props) => <ChatDetails {...props} />}
                      />

                      <Route
                        exact
                        path="/createContact"
                        component={CreateContact}
                      />
                      <Route exact path="/sms" />
                      <Route exact path="/myProfile" component={MyProfile} />
                      <Route
                        exact
                        path="/changePassword"
                        component={ChangePassword}
                      />
                      <Route exact path="/allCalls" component={AllCalls} />

                      <Route
                        exact
                        path="/missedCalls"
                        component={MissedCalls}
                      />
                      <Route
                        exact
                        path="/outgoingCalls"
                        component={OutgoingCalls}
                      />

                      <Route
                        exact
                        path="/receivedCalls"
                        component={ReceivedCalls}
                      />

                      <Route
                        exact
                        path="/centralContact"
                        component={CentralContact}
                      />
                      <Route
                        exact
                        path="/contactProfile"
                        component={ContactProfile}
                      />
                      <Route exact path="/myContact" component={MyContact} />
                      <Route
                        exact
                        path="/remoteContact"
                        component={RemoteContact}
                      />
                      <Route exact path="/eFax" component={Efax} />
                      <Route exact path="/faxLogs" component={FaxLogs} />
                      <Route exact path="/faxChat" component={FaxChat} />

                      <Route exact path="/allSMSChats" component={SMSChats} />
                      <Route exact path="/SMSChat/:number" component={SMS} />
                      <Route exact path="/newSMSChat" component={NewSMSChat} />
                      <Route
                        exact
                        path="/SMSGroup/:number"
                        component={SMSGroup}
                      />
                      <Route
                        exact
                        path="/allSMSGroups"
                        component={AllSMSGroups}
                      />
                      <Route
                        exact
                        path="/SMSGroupsChat/:number"
                        component={SMSGroupChat}
                      />
                      <Route
                        exact
                        path="/NewGroupChat/:number"
                        component={NewGroupChat}
                      />
                      <Route
                        exact
                        path="/modalConversations"
                        render={(props) => <ModalConversations {...props} />}
                      />
                      <Route exact path="/documents" component={Documents} />
                    </Switch>
                  </div>
                  <DisplayOngoingScreen />

                  {/* {(showOngoing.flag == true ||
                    sessionInfo.length > 1 ||
                    (sessionInfo.length == 1 &&
                      sessionInfo[0]._state == "Established")) && (
                    <div
                      className={`${
                        (sessionInfo.length == 0 &&
                          window.innerWidth >= 576 &&
                          single_screen == false) ||
                        (sessionInfo.length > 0 &&
                          sessionInfo.length <= 2 &&
                          window.innerWidth >= 576 &&
                          single_screen == false)
                          ? "col-4"
                          : (sessionInfo.length == 0 &&
                              window.innerWidth < 576 &&
                              single_screen == true) ||
                            (sessionInfo.length > 2 &&
                              window.innerWidth > 576 &&
                              single_screen == false) ||
                            (sessionInfo.length > 0 &&
                              window.innerWidth <= 576 &&
                              single_screen == true)
                          ? "col"
                          : sessionInfo.length == 0 ||
                            (sessionInfo.length > 0 &&
                              window.innerWidth <= 576 &&
                              single_screen == false)
                          ? ""
                          : //"d-none"
                            ""
                      } p-0 half-dashboard 
                          
                          `}
                      style={{
                        display: "",
                        zIndex: "1000 !important",
                        top:
                          loaderOnSizeChange !== true &&
                          window.outerWidth <= 310 &&
                          "0px",
                        position:
                          loaderOnSizeChange !== true &&
                          window.outerWidth <= 310 &&
                          "fixed",
                        // width:loaderOnSizeChange !== true  && window.outerWidth <= 310 & "100px",
                        height:
                          loaderOnSizeChange !== true &&
                          window.outerWidth <= 310 &&
                          "200px",
                        marginBottom:
                          loaderOnSizeChange !== true &&
                          window.outerWidth <= 310 &&
                          "20px",
                        backgroundColor:
                          loaderOnSizeChange !== true &&
                          window.outerWidth <= 310 &&
                          "black",
                      }}
                    >
                      <OngoingContainer />
                    </div>
                  )} */}

                  {/* {sessionInfo.length !== 0 &&
                    (sessionInfo[0]._state === "Established" ||
                      sessionInfo[0]._state === "Establishing") && (
                      <>
                        <div
                          className={`${
                            sessionInfo.length > 0 &&
                            sessionInfo.length <= 2 &&
                            window.innerWidth >= 576 &&
                            single_screen == false
                              ? "col-4"
                              : (sessionInfo.length > 2 &&
                                  window.innerWidth > 576 &&
                                  single_screen == false) ||
                                (sessionInfo.length > 0 &&
                                  window.innerWidth <= 576 &&
                                  single_screen == true)
                              ? "col"
                              : sessionInfo.length == 0 ||
                                (sessionInfo.length > 0 &&
                                  window.innerWidth <= 576 &&
                                  single_screen == false)
                              ? ""
                              : //"d-none"
                                ""
                          } p-0 half-dashboard 
                          
                          `}
                          // ongoing-div
                          style={{
                            display: "",
                            zIndex: "1000 !important",
                            top:
                              loaderOnSizeChange !== true &&
                              window.outerWidth <= 310 &&
                              "0px",
                            position:
                              loaderOnSizeChange !== true &&
                              window.outerWidth <= 310 &&
                              "fixed",
                            // width:loaderOnSizeChange !== true  && window.outerWidth <= 310 & "100px",
                            height:
                              loaderOnSizeChange !== true &&
                              window.outerWidth <= 310 &&
                              "200px",
                            marginBottom:
                              loaderOnSizeChange !== true &&
                              window.outerWidth <= 310 &&
                              "20px",
                            backgroundColor:
                              loaderOnSizeChange !== true &&
                              window.outerWidth <= 310 &&
                              "black",
                          }}
                        >
                          {window.outerWidth <= 310 &&
                            window.outerWidth !== 576 &&
                            sessionInfo.length > 1 &&
                            sessionInfo[sessionInfo.length - 1]._state ===
                              "Initial" &&
                            sessionInfo[sessionInfo.length - 1]
                              .incomingInviteRequest !== undefined && (
                              <div
                                className="text-center d-flex align-items-center justify-content-center fs-5 mx-1"
                                style={{ color: "white", height: "248px" }}
                              >
                                You have another incoming call, expand to view
                                <>
                                  <div className=" d-flex justify-content-end w-100 position-absolute bottom-0 left-0">
                                    <i
                                      className="fas fa-external-link-alt fs-6 text-white m-2 mt-3"
                                      onClick={() => {
                                        setLoaderOnSizeChange(true);
                                        let width =
                                          window.screen.availWidth -
                                          (window.outerWidth -
                                            window.innerWidth);
                                        let height =
                                          window.screen.availHeight -
                                          (window.outerHeight -
                                            window.innerHeight);

                                        window.resizeTo(
                                          width + 105,
                                          height + 105
                                        );
                                        setTimeout(() => {
                                          setLoaderOnSizeChange(false);
                                        }, [700]);
                                      }}
                                    ></i>
                                  </div>
                                </>
                              </div>
                            )}

                          <OngoingContainer />
                        </div>
                      </>
                    )} */}
                </div>
              </HashRouter>
            }
          </>
        </>
      }
      <>
        {window.matchMedia("(max-width: 300px)").matches === true
          ? ""
          : loaderOnSizeChange === false &&
            JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
            JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
              1 && (
              <div
                id="callDiv"
                className="d-flex justify-content-end align-items-end"
                style={{
                  height: callDivHeight ? "0vh" : 32,
                }}
              >
                <div
                  style={{
                    height: callDivHeight ? 490 : 32,
                    transition: "all 0.5s",
                  }}
                >
                  <div
                    id="callDivTop"
                    onClick={() => {
                      sessionInfo.length !== 0 &&
                      single_screen === false &&
                      window.matchMedia("(max-width: 740px)").matches === true
                        ? changeScreenView(true)
                        : setCallDivHeight(!callDivHeight);
                      setDialpadInput(false);
                      setOpenCount(0);
                    }}
                    className={`text-center fs-5 ${
                      sessionInfo.length !== 0 &&
                      window.matchMedia("(max-width: 740px)").matches ===
                        true &&
                      single_screen === false
                        ? "ongoing-animated-icon"
                        : ""
                    }`}
                  >
                    <i className="fas fa-phone "></i>
                  </div>

                  <Dialpad
                    setCallDivHeight={setCallDivHeight}
                    onlineNumber={info}
                    dialpadInput={callDivHeight}
                    openCount={openCount}
                  />
                </div>
              </div>
            )}
      </>
      {}
    </>
  );
};

export default App;
