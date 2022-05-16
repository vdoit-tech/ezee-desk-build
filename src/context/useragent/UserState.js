import {
  SESSION_STORE,
  SESSION_STORE_TO_NULL,
  SET_GLOBAL_USER_AGENT,
  HIDE,
  DELETE_ZEROTH_SESSION,
  DELETE_NTH_SESSION,
  SET_NEW_SESSION_INFO,
  NAV_HEADER,
  USER_REGISTERED,
  COLLAPSE_DASHBOARD,
  DEMO_STATE,
  MISSED_STATUS,
  NAV_SUBHEADER,
  ADD_CONFERENCE,
  SINGLE_SCREEN,
  REPEATED_NUMBER,
  REMOVE_CONFERENCE,
  SESSION_DUPLICATE_ADD,
  SESSION_DUPLICATE_DELETE,
  SESSION_INFO_DUPLICATE_ADD,
  DYNAMIC_DATA_CHANGE,
} from "../Types";
import UserContext from "./userContext";
import userReducer from "./userReducer";
import React, { useContext, useEffect, useReducer, useState } from "react";
import { Registerer, UserAgent, Inviter } from "sip.js";
import { SessionDescriptionHandler } from "sip.js/lib/platform/web";
import ContactContext from "../contact/contactContext";
import { SIP } from "jssip/lib/Constants";
import log from "../logger/log";
import { detailsLogger } from "../../Constants/Helper";

const UserState = (props) => {
  const contactContext = useContext(ContactContext);
  const {
    setCallStartTime,
    setCalleeName,
    setCallNumber,
    setCalleeId,
    setCallType,
  } = contactContext;
  const initialState = {
    sessionInfo: [],
    sessionInfoDuplicate: [],
    userAgentInfo: null,
    hide: true,

    nav_header: null,
    nav_subheader: null,
    user_registered: false,

    collapse_dashboard: false,

    demo_state: null,
    missed_status: null,
    conferenceData: [],
    single_screen: false,

    dynamic_data: null,
  };
  const [state, dispatch] = useReducer(userReducer, initialState);
  const ipc = window.require("electron").ipcRenderer;

  //actions
  let userAgent, configuration, registerer;
  let _displayname;
  let _sipUsername;
  let _sipServer;
  let _sipPassword;
  let _wssServer;
  let invitationData;

  const getUAConfig = async (_extension, _name) => {
    // detailsLogger("In getUAConfig : ", _extension, _name);

    let alreadyLogin = "";
    try {
      alreadyLogin = "yes";
      if (alreadyLogin == "yes") {
        _displayname = _name;
        _sipUsername = _extension;
        _sipServer = JSON.parse(sessionStorage.getItem("userInfo")).extension
          .server_address;
        // _sipPassword = "WelcomeVdoit123!";
        _sipPassword = JSON.parse(sessionStorage.getItem("userInfo")).extension
          .api_secret_key;
        // _wssServer = `wss://ezeepush.stagingapps.xyz`;
        _wssServer = `wss://${
          JSON.parse(sessionStorage.getItem("userInfo")).extension
            .server_address
        }/wsrtc`;

        const uri = UserAgent.makeURI("sip:" + _sipUsername + "@" + _sipServer);
        const transportOptions = {
          wsServers: `wss://${
            JSON.parse(sessionStorage.getItem("userInfo")).extension
              .server_address
          }/wsrtc`,
          // _wssServers: `wss://ezeepush.stagingapps.xyz`,
          traceSip: true,
          // rel100: SIP.C.supported.REQUIRED,
          maxReconnectionAttempts: 5,
        };

        const userAgentOptions = {
          uri: uri,
          transportOptions: transportOptions,
          userAgentString: "ezeelink desktop",
          authorizationPassword: _sipPassword,
          sipExtension100rel: "Supported",
          sipExtensionReplaces: "Supported",
          register: true,
          contactTransport: "wss",
          dtmfType: "info",

          registerOptions: {
            extraContactHeaderParams: [
              "extno" +
                `${
                  JSON.parse(sessionStorage.getItem("userInfo")).extension
                    .ext_no
                }`,
            ],
            expires: 3600,
          },
          displayName: _name,
          sessionDescriptionHandlerFactoryOptions: {
            peerConnectionOptions: {
              rtcpMuxPolicy: "negotiate",
              iceCheckingTimeout: 1000,
              iceTransportPolicy: "all",
              iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            },
          },
          media: {
            render: {
              remote: {
                audio: new Audio(),
              },
            },
          },

          // sessionDescriptionHandlerFactory: (session, option) => {
          //   return new SessionDescriptionHandler.defaultFactory(session, option);
          // },
        };

        userAgent = await new UserAgent(userAgentOptions);
        // const registerOptions = {
        //     extraContactHeaderParams: [
        //       "extno" +
        //         `${
        //           JSON.parse(sessionStorage.getItem("userInfo")).extension
        //             .ext_no
        //         }`,
        //     ],
        //   },
        // registerer = await new Registerer(userAgent, registerOptions);
        registerer = await new Registerer(userAgent);

        registerer.stateChange.addListener((newState) => {});

        userAgent.start().then(async () => {
          // detailsLogger(
          //   "Successfully Useragent Start : Connected with WebSocket."
          // );
          // Send REGISTER
          await registerer
            .register()
            .then((request) => {
              // detailsLogger(
              //   "In getUAConfig : Successfully sent REGISTER,",
              //   request
              // );
              // detailsLogger(request);
              // detailsLogger(request.delegate);
              dispatch({
                type: USER_REGISTERED,
                payload: true,
              });
            })
            .catch((error) => {
              log.warn("In getUAConfig : Failed to send REGISTER", error);
            });
        });

        userAgent.delegate = {
          async onInvite(_session) {
            // detailsLogger(
            //   "In getUAConfig, On Invite : Session store user state called"
            // );
            let data = _session;
            // detailsLogger(_session);
            if (_session._state === "Initial") {
              // detailsLogger(
              //   "In getUAConfig, On Invite : Session in Initial State"
              // );

              setMissedStatus(3);
              setCalleeName({
                id: _session._id,
                name: _session.incomingInviteRequest.message.from._displayName,
              });
              setCallNumber({
                id: _session._id,
                number:
                  _session.incomingInviteRequest.message.from.uri.raw.user,
              });
              setCalleeId({
                id: _session._id,
                call_id:
                  _session.incomingInviteRequest.message.from.uri.raw.user,
              });
              sessionInfoDuplicateAdd({
                id: data._id,
                session: data,
                hold: "unhold",
              });
            }

            dispatch({
              type: SESSION_STORE,
              payload: data,
            });

            _session.stateChange.addListener(async (state) => {
              switch (state) {
                case "Initial":
                  detailsLogger(_session);
                  break;
                case "Established":
                  setMissedStatus(null);
                  // detailsLogger(
                  //   "In getUAConfig, On Invite : Session in Established State",
                  //   _session
                  // );

                  const start = new Date();
                  let finalStart = start;

                  setCallStartTime({
                    id: _session._id,
                    start_time: finalStart,
                  });
                  setCallType({ id: _session._id, type: 1 });
                  setCalleeName({
                    id: _session._id,
                    name: _session.incomingInviteRequest.message.from
                      ._displayName,
                  });
                  setCallNumber({
                    id: _session._id,
                    number:
                      _session.incomingInviteRequest.message.from.uri.raw.user,
                  });
                  setCalleeId({
                    id: _session._id,
                    call_id:
                      _session.incomingInviteRequest.message.from.uri.raw.user,
                  });

                  const mediaElement = document.getElementById(
                    `mediaElement${_session._id}`
                  );
                  const remoteStream = new MediaStream();
                  console.log("remoteStream", remoteStream);

                  _session.sessionDescriptionHandler.peerConnection
                    .getReceivers()
                    .forEach((receiver) => {
                      if (receiver.track) {
                        remoteStream.addTrack(receiver.track);
                      }
                    });
                  console.log("remoteStream", remoteStream);
                  mediaElement.srcObject = remoteStream;
                  mediaElement.play();
                  break;
                case "Terminated":
                  // detailsLogger(
                  //   "In getUAConfig, On Invite : Session in Terminated State",
                  //   _session
                  // );

                  dispatch({
                    type: DEMO_STATE,
                    payload: _session._id,
                  });

                  dispatch({
                    type: DELETE_NTH_SESSION,
                    payload: _session._id,
                  });
                  deleteSessionDuplicate(_session._id);
                  break;
                default:
                  break;
              }
            });
          },

          async onDisconnect(error) {
            console.log("disconnect");
            // detailsLogger(error);
            if (
              sessionStorage.getItem("userInfo") !== null &&
              sessionStorage.getItem("userInfo") !== undefined
            ) {
              dispatch({
                type: USER_REGISTERED,
                payload: false,
              });
            }
            registerer.unregister().catch((e) => {
              log.warn(
                "In getUAConfig, On DISCONNECT : Unregister failed with cause " +
                  e
              );
            });
          },
          async onRegister(e) {
            console.log("registered");
            // detailsLogger("registered");
            // detailsLogger(e);
          },
          async onConnect(e) {
            console.log("connected");
            // detailsLogger("connected");
          },
        };
        return { userAgent, registerer };
      } else {
        return null;
      }
    } catch (error) {
      log.warn("In getUAConfig: ", error.message + "");
      return null;
    }
  };

  const dilaerFun = (inputNumber, userAgentInfo, sessionInfo) => {
    var session;
    var uri = UserAgent.makeURI(
      `sip:${inputNumber.replace(/\s/g, "")}@${
        JSON.parse(sessionStorage.getItem("userInfo")).extension.server_address
      }`
    );
    session = new Inviter(userAgentInfo, uri);

    session
      .invite()
      .then((request) => {
        // detailsLogger("In dilaerFun : Successfully sent INVITE", session);
        sessionInfoAdd(session);
        sessionInfoDuplicateAdd({
          id: session._id,
          session: session,
          hold: "unhold",
        });
        // detailsLogger(request);
        const start = new Date();
        let finalStart = start;
        setCallStartTime({ id: session._id, start_time: finalStart });
        setCallType({ id: session._id, type: 2 });

        setCalleeName({
          id: session._id,
          name: null,
        });
        setCallNumber({
          id: session._id,
          number: session.outgoingInviteRequest.message.to.uri.raw.user,
        });
        setCalleeId({
          id: session._id,
          call_id: session.outgoingInviteRequest.message.to.uri.raw.user,
        });

        session.stateChange.addListener(async (state) => {
          // detailsLogger(state);
          // detailsLogger(session);
          switch (state) {
            case "Established":
              setMissedStatus(null);
              // detailsLogger("In dilaerFun : Established Outgoing...", session);
              //call log---
              const start = new Date();
              let finalStart = start;
              setCallStartTime({ id: session._id, start_time: finalStart });
              setCallType({ id: session._id, type: 2 });

              setCalleeName({
                id: session._id,
                name: null,
              });
              setCallNumber({
                id: session._id,
                number: session.outgoingInviteRequest.message.to.uri.raw.user,
              });
              setCalleeId({
                id: session._id,
                call_id: session.outgoingInviteRequest.message.to.uri.raw.user,
              });

              //outgoing call log-----
              const mediaElement = document.getElementById(
                `mediaElement${session._id}`
              );
              const remoteStream = new MediaStream();
              console.log("remoteStream", remoteStream);

              session.sessionDescriptionHandler.peerConnection
                .getReceivers()
                .forEach((receiver) => {
                  if (receiver.track) {
                    remoteStream.addTrack(receiver.track);
                  }
                });
              console.log("remoteStream", remoteStream);
              mediaElement.srcObject = remoteStream;
              mediaElement.play();
              break;
            case "Terminated":
              // detailsLogger("In dilaerFun : Terminated Outgoing...", session);

              dispatch({
                type: DEMO_STATE,
                payload: session._id,
              });

              deleteTerminatedAndOutgoingCall(session._id);
              deleteSessionDuplicate(session._id);

              break;
            default:
              break;
          }
        });
      })
      .catch((error) => {
        log.warn(" Failed to INVITE", error);
      });
  };

  const setGlobalUserAgent = (useragent) => {
    // detailsLogger("In setGlobalUserAgent : ", useragent);
    dispatch({
      type: SET_GLOBAL_USER_AGENT,
      payload: useragent,
    });
  };

  const sessionInfoAdd = (session) => {
    // detailsLogger("In sessionInfoAdd : ", session);

    dispatch({
      type: SESSION_STORE,
      payload: session,
    });
  };

  const sessionInfoDuplicateAdd = (session) => {
    // detailsLogger("In sessionInfoDuplicateAdd : ", session);

    dispatch({
      type: SESSION_INFO_DUPLICATE_ADD,
      payload: session,
    });
  };

  const setSessionInfoNull = () => {
    // detailsLogger("In setSessionInfoNull :  Set all sessions to NULL !!");
    dispatch({
      type: SESSION_STORE_TO_NULL,
    });
  };
  const deleteZerothSession = () => {
    // detailsLogger("In deleteZerothSession :  Delete last session");

    dispatch({
      type: DELETE_ZEROTH_SESSION,
    });
  };

  const deleteTerminatedAndOutgoingCall = (id) => {
    // detailsLogger(
    //   "In deleteTerminatedAndOutgoingCall : Delete specific Session ",
    //   id
    // );

    dispatch({
      type: DELETE_NTH_SESSION,
      payload: id,
    });
  };

  const deleteSessionDuplicate = (id) => {
    //detailsLogger("In deleteSessionDuplicate : Delete specific Session ", id);

    dispatch({
      type: SESSION_DUPLICATE_DELETE,
      payload: id,
    });
  };

  const setHide = (hide) => {
    //detailsLogger("In setHide : ", hide);

    dispatch({
      type: HIDE,
      payload: hide,
    });
  };

  const setNavHeader = (nav_header) => {
    //detailsLogger("In setNavHeader : ", nav_header);

    dispatch({
      type: NAV_HEADER,
      payload: nav_header,
    });
  };

  const setNavSubHeader = (nav_subheader) => {
    //detailsLogger("In setNavSubHeader : ", nav_subheader);

    dispatch({
      type: NAV_SUBHEADER,
      payload: nav_subheader,
    });
  };

  const setDashboardCollapse = (collapse_dashboard) => {
    //detailsLogger("In setDashboardCollapse : ", collapse_dashboard);

    dispatch({
      type: COLLAPSE_DASHBOARD,
      payload: collapse_dashboard,
    });
  };

  const setMissedStatus = (missed_status) => {
    //detailsLogger("In setMissedStatus : ", missed_status);

    dispatch({
      type: MISSED_STATUS,
      payload: missed_status,
    });
  };

  const addConference = (data) => {
    //detailsLogger("In addConference : ", data);

    dispatch({
      type: ADD_CONFERENCE,
      payload: data,
    });
  };
  const removeConference = (data) => {
    //detailsLogger("In removeConference : ", data);

    dispatch({
      type: REMOVE_CONFERENCE,
      payload: data,
    });
  };

  const changeScreenView = (single_screen) => {
    //detailsLogger("In changeScreenView : ", single_screen);

    dispatch({
      type: SINGLE_SCREEN,
      payload: single_screen,
    });
  };

  const userLogOut = (history) => {
    var options = {
      all: true,
    };

    // userAgent._transport.disconnect();
    // console.log("userAgent12", userAgent._transport.disconnect());
    // ipc.send("logOut", true);

    setGlobalUserAgent(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authenticated");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("connection_id");
    sessionStorage.removeItem("my_telnyx_num");
    sessionStorage.removeItem("telnyx_token");
    sessionStorage.removeItem("groupNames");
    sessionStorage.removeItem("groupNumbers");
    sessionStorage.removeItem("profileImage");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("my_contacts");

    sessionStorage.removeItem("central_contacts");
    sessionStorage.removeItem("currentNavHeader");
    sessionStorage.removeItem("currentMember");
    sessionStorage.removeItem("currentChats");
    sessionStorage.removeItem("redialNumber");
    sessionStorage.removeItem("currentGroup");
    sessionStorage.removeItem("pickup_status");
    sessionStorage.removeItem("start_status");
    sessionStorage.removeItem("release_messages");
    sessionStorage.removeItem("callLogs");
    sessionStorage.removeItem("remote_contacts");

    dispatch({
      type: DYNAMIC_DATA_CHANGE,
      payload: null,
    });
    // userAgent.stop().then(() => {
    //   console.log("UA stopped");
    // });
    userAgent.unloadListener();
    console.log(registerer);
    // registerer.unregister();
    console.log(userAgent);
    //detailsLogger("On userLogout :  Remove all session storage!!!");
    setTimeout(() => {
      history.push("/");
    }, 500);
  };

  return (
    <UserContext.Provider
      value={{
        sessionInfo: state.sessionInfo,
        sessionInfoDuplicate: state.sessionInfoDuplicate,
        userAgentInfo: state.userAgentInfo,
        hide: state.hide,

        nav_header: state.nav_header,
        nav_subheader: state.nav_subheader,
        user_registered: state.user_registered,

        collapse_dashboard: state.collapse_dashboard,

        demo_state: state.demo_state,
        missed_status: state.missed_status,
        conferenceData: state.conferenceData,
        single_screen: state.single_screen,

        getUAConfig,
        setSessionInfoNull,
        setGlobalUserAgent,
        sessionInfoAdd,

        deleteZerothSession,
        deleteTerminatedAndOutgoingCall,
        deleteSessionDuplicate,
        setHide,

        setNavHeader,
        setNavSubHeader,

        setDashboardCollapse,
        dilaerFun,
        sessionInfoDuplicateAdd,

        addConference,
        removeConference,
        changeScreenView,

        userLogOut,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState;
