import React, { useContext, useState, useEffect, memo } from "react";
import dtmf_logo from "../../assets/imgs/dtmf-keypad-2.ico";
import call_transfer from "../../assets/imgs/call-transfer1.png";
import UserContext from "../../context/useragent/userContext";
import StopWatch from "./StopWatch";
import { Web, Inviter, UserAgent } from "sip.js";
import { Modal, Button } from "react-bootstrap";
import defaultPic from "../../assets/imgs/avatar.png";
import callBackTone from "../../assets/audio/callbacktone.mp3";
import incomingBeepTone from "../../assets/audio/incoming.mp3";
import "./OngoingScreen.css";

import {
  DisplayName,
  DisplayNameOrNumber,
  setCallImage,
} from "../../Constants/Helper";
import {
  attendedTransfer,
  blindTransfer,
  dtmfWithKeyboard,
  holdCall,
  holdFunction,
  terminateFunctions,
  unholdCall,
  unHoldFunction,
} from "../../Constants/CallOperations";

const OngoingScreen = memo(({ ses }) => {
  const userContext = useContext(UserContext);

  const {
    sessionInfo,
    deleteTerminatedAndOutgoingCall,
    userAgentInfo,
    dilaerFun,
    addConference,
    removeConference,
    conferenceData,
    sessionInfoDuplicate,
    sessionInfoDuplicateAdd,
  } = userContext;

  const [callImage, setImage] = useState(null);
  const [callName, setName] = useState(null);
  const [callNumber, setNumber] = useState(null);

  const [muteState, setMuteState] = useState("");
  const [holdState, setHoldState] = useState("");
  const [show, setShow] = useState(false);
  const [blindTransferNumber, setBlindTransferNumber] = useState("");
  const [blindTransferInfo, setBlindTransferInfo] = useState(null);
  const [attendedTransferSession, setAttendedTransferSession] = useState(null);
  const [conferenceArr, setConferenceArr] = useState([]);
  const [conferenceSessions, setConferenceSessions] = useState([]);
  const [dtmfEnable, setDtmfEnable] = useState(false);
  const [dtmfInput, setDtmfInput] = useState(null);

  let windowSize = window.matchMedia("(max-width: 300px)").matches;

  const handleClose = () => {
    setBlindTransferInfo(null);
    setBlindTransferNumber("");
    setAttendedTransferPosition(null);
    setShow(false);
  };
  const handleShow = () => setShow(true);

  const [attendedTransferPosition, setAttendedTransferPosition] =
    useState(null);

  useEffect(() => {
    if (holdState === true) {
      holdCall(ses);
    } else if (holdState === false) {
      unholdCall(ses);
    }
  }, [holdState]);

  const [callTones, setCallTones] = useState(new Audio(callBackTone));
  const [incomingTones, setIncomingTones] = useState(
    new Audio(incomingBeepTone)
  );

  useEffect(() => {
    console.log("session state", ses.outgoingInviteRequest);
    let callBack = callTones;
    console.log(callBack);

    if (ses.outgoingInviteRequest !== undefined) {
      if (ses._state === "Establishing") {
        callTones.play();
        console.log(callTones);

        console.log("Establishing");
        // callBack.pause()
      }

      if (ses._state === "Established") {
        callTones.pause();
        console.log("Established");
        callTones.currentTime = 0;
        console.log(callTones);
      }
      if (ses._state === "Terminated") {
        callTones.pause();
        console.log("Terminated");
        console.log(callTones);

        callTones.currentTime = 0;
      }
    }
    //  else {
    //   callTones.pause();
    //   console.log("Other");

    //   callTones.currentTime = 0;
    // }
  }, [ses._state]);

  useEffect(() => {
    console.log("session1", ses._state);

    if (ses._state === "Established" || ses._state === "Establishing") {
      for (let i = 0; i < sessionInfo.length; i++) {
        if (sessionInfo[i] !== ses) {
          document
            .getElementById(sessionInfo[i]._id)
            .classList.add("mute-enable");
          holdCall(sessionInfo[i]);
          let data = [...sessionInfoDuplicate];
          if (data[i].session == sessionInfo[i]) {
            data[i].hold = "hold";
          }
          sessionInfoDuplicateAdd(data);
        }
      }
    }
    console.log("state change", ses);
  }, [ses._state]);

  const dtmf = (digit) => {
    if (sessionInfo.length !== 0) {
      const options = {
        requestOptions: {
          body: {
            contentDisposition: "render",
            contentType: "application/dtmf-relay",
            content: `Signal=${digit}\r\nDuration=100`,
          },
        },
      };
      setDtmfInput((dtmfInput) => {
        let val = dtmfInput;
        if (val === null || val === "") {
          val = digit;
          // console.log(typeof val);
        } else {
          val += digit;
        }
        return val;
      });
      if (ses._state === "Established") ses.info(options);
    }
  };

  useEffect(() => {
    var img = null;
    var name = null;
    var nameornumber = null;

    if (ses !== undefined) {
      if (ses.incomingInviteRequest !== undefined) {
        console.log(ses.incomingInviteRequest.message.from._displayName);
        img = setCallImage(ses.incomingInviteRequest.message.from.uri.raw.user);
        name = (
          <DisplayName
            num={ses.incomingInviteRequest.message.from.uri.raw.user}
          />
        );
        name == null
          ? setName(ses.incomingInviteRequest.message.from._displayName)
          : setName(name);
        setImage(img);

        console.log(img, name);
      } else if (ses.outgoingRequestMessage !== undefined) {
        setImage(setCallImage(ses.outgoingRequestMessage.to.uri.raw.user));
        setName(
          <DisplayName num={ses.outgoingRequestMessage.to.uri.raw.user} />
        );
        setNumber(
          <DisplayNameOrNumber
            num={ses.outgoingRequestMessage.to.uri.raw.user}
          />
        );
      }
    }
  }, []);

  return ses._state === "Initial" ? (
    <div
      className={`d-flex justify-content-center align-items-center ${
        sessionInfo.length < 5 ? "flex-column" : ""
      }`}
      style={{
        height: `${sessionInfo.length < 5 ? "21rem" : "3rem"}`,
      }}
    >
      {ses.incomingInviteRequest !== undefined && (
        <img
          alt=""
          src={callImage !== null ? callImage : defaultPic}
          style={{ height: "70px", width: "70px", borderRadius: "50%" }}
        />
      )}

      <div className="fs-5 mb-3 d-flex justify-content-center ">
        {ses !== undefined ? (
          ses.incomingInviteRequest !== undefined ? (
            <span className="d-flex flex-column">
              <span className="">
                {/* {ses.incomingInviteRequest.message.from._displayName} */}
                {DisplayName({
                  num: ses.incomingInviteRequest.message.from.uri.raw.user,
                }) !== null
                  ? DisplayName({
                      num: ses.incomingInviteRequest.message.from.uri.raw.user,
                    })
                  : ses.incomingInviteRequest.message.from._displayName !== ""
                  ? ses.incomingInviteRequest.message.from._displayName
                  : ""}
              </span>
              <span>{ses.incomingInviteRequest.message.from.uri.raw.user}</span>
            </span>
          ) : (
            callNumber !== null && callNumber
            // <DisplayNameOrNumber
            // num={ses.outgoingInviteRequest.message.to.uri.raw.user}
            // />
          )
        ) : (
          ""
        )}
      </div>
      <div className="d-flex">
        <div
          className="accept-call d-flex justify-content-center align-items-center bottom-buttons mx-1"
          onClick={() => {
            ses._state === "Initial" && ses.accept();
          }}
        >
          <i className="fas fa-phone-alt"></i>
        </div>
        <div
          className="cancel-call d-flex justify-content-center align-items-center bottom-buttons"
          onClick={() => {
            ses._state === "Initial" && ses.reject();
          }}
        >
          <i className="fas fa-phone-slash"></i>
        </div>
      </div>
    </div>
  ) : (
    //right here------------------------------------------------

    <div
      style={{
        width: sessionInfo.length > 4 && "100%",
        marginTop: windowSize === true && "5rem",
      }}
      className={`${windowSize === true && "d-flex"} ongoing-container`}
    >
      {sessionInfo.length < 4 && windowSize === false && (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {ses.outgoingRequestMessage !== undefined ? (
            <img
              alt=""
              src={callImage !== null ? callImage : defaultPic}
              style={{ height: "100px", width: "100px", borderRadius: "50%" }}
            />
          ) : (
            ses.incomingInviteRequest !== undefined && (
              <img
                alt=""
                src={
                  setCallImage(
                    ses.incomingInviteRequest.message.from.uri.raw.user
                  ) !== null
                    ? setCallImage(
                        ses.incomingInviteRequest.message.from.uri.raw.user
                      )
                    : defaultPic
                }
                style={{ height: "70px", width: "70px", borderRadius: "50%" }}
              />
            )
          )}
        </div>
      )}

      <div className="text-center  d-flex flex-column mx-1">
        <span className="d-flex flex-column">
          <span className="fw-bold">
            {ses.outgoingRequestMessage !== undefined
              ? ses.outgoingRequestMessage.to.uri.raw.user ==
                JSON.parse(sessionStorage.getItem("userInfo")).extension.conf_no
                ? "Conference Bridge"
                : callName !== null && callName
              : ses.incomingInviteRequest !== undefined &&
                ses.incomingInviteRequest.message.from.uri.raw.user ==
                  JSON.parse(sessionStorage.getItem("userInfo")).extension
                    .conf_no
              ? "Conference Bridge"
              : DisplayName({
                  num: ses.incomingInviteRequest.message.from.uri.raw.user,
                }) !== null
              ? DisplayName({
                  num: ses.incomingInviteRequest.message.from.uri.raw.user,
                })
              : ses.incomingInviteRequest.message.from._displayName !== ""
              ? ses.incomingInviteRequest.message.from._displayName
              : ""}
          </span>
          <span>
            {ses.outgoingRequestMessage !== undefined
              ? ses.outgoingRequestMessage.to.uri.raw.user ==
                JSON.parse(sessionStorage.getItem("userInfo")).extension.conf_no
                ? ""
                : ses.outgoingRequestMessage.to.uri.raw.user
              : ses.incomingInviteRequest !== undefined &&
                ses.incomingInviteRequest.message.from.uri.raw.user ==
                  JSON.parse(sessionStorage.getItem("userInfo")).extension
                    .conf_no
              ? "Conference Bridge"
              : ses.incomingInviteRequest.message.from.uri.raw.user}
          </span>
        </span>
      </div>
      {ses !== undefined &&
        ses.outgoingRequestMessage != undefined &&
        ses.outgoingRequestMessage.to.uri.raw.user ==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.conf_no && (
          <div className="text-center">
            {conferenceData !== undefined &&
              conferenceData.length !== 0 &&
              conferenceData.map((info, i) => (
                <span key={i} style={{ marginLeft: 10 }} className="">
                  <DisplayNameOrNumber num={info.name} />
                </span>
              ))}
          </div>
        )}

      {ses._state !== "Initial" && ses._state !== "Establishing" && (
        <StopWatch />
      )}
      <audio
        className="ongoing-audio"
        style={{ display: "none !important" }}
        id={`mediaElement${ses._id}`}
        controls="controls"
      ></audio>
      {dtmfEnable ? (
        <div>
          <div className="my-1 text-center">
            <input
              value={dtmfInput}
              style={{
                border: "1px solid black",
                borderRadius: "1rem",
                background: "transparent",
                // color: "white",
              }}
              onKeyPress={(event) => {
                dtmfWithKeyboard(event, dtmf);
              }}
            />
            {/* <span>
              <i
                className="fas fa-backspace  mx-1"
                onClick={() => {
                  setDtmfInput(dtmfInput.slice(0, dtmfInput.length - 1));
                }}
              ></i>
            </span> */}
          </div>

          <div className="row p-0 m-0 d-flex justify-content-center">
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-end"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("1")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                1
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-center"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("2")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                2
              </p>
            </div>
            {/* mute */}
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-start"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("3")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                3
              </p>
            </div>
            {/* call transfer */}
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-end"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("4")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                4
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-center"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("5")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                5
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-start"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("6")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                6
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-end"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("7")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                7
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-center"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("8")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                8
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-start"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("9")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                9
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-end"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("*")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                *
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-center"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("0")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                0
              </p>
            </div>
            <div
              className="col-4 p-0 mx-0 my-1  text-center d-flex justify-content-center align-items-start"
              style={{ flexDirection: "column" }}
              onClick={() => dtmf("#")}
            >
              <p
                className="pt-1 d-block dtmf-number m-0"
                style={{
                  height: "45px",
                  width: "45px",
                  border: "1px solid black",
                  borderRadius: "50%",
                  // color: "white",
                }}
              >
                #
              </p>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            {" "}
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setDtmfEnable(!dtmfEnable);
                setDtmfInput(null);
              }}
            >
              Back
            </button>
          </div>
        </div>
      ) : (
        <div className="row p-0 m-0 my-2">
          {sessionInfo.length > 4 && (
            <div className="col p-0 m-0 text-center">
              <img
                src={defaultPic}
                style={{ height: "45px", width: "45px" }}
                alt=""
              />
            </div>
          )}
          {windowSize === false && (
            <div
              className="col p-0 m-0 text-center"
              onClick={() => {
                // console.log(`dtmf button clicked ${ses._id}`);
                setDtmfEnable(!dtmfEnable);

                setDtmfInput(null);
              }}
            >
              <img
                id={`dtmf${ses._id}`}
                alt=""
                src={dtmf_logo}
                className="dtmf-logo"
                style={{
                  height: 45,
                  width: 45,
                  border: "1px solid #bfbfbf",
                  borderRadius: "50%",
                  padding: 7,
                }}
              />
              <div className="fw-bold" style={{ fontSize: "0.8rem" }}>
                DTMF
              </div>
            </div>
          )}
          {/* hold */}
          {/* {windowSize === false && ( */}
          <div
            className={`${
              windowSize
                ? "d-none"
                : "col p-0 m-0 text-center d-flex justify-content-center align-items-center  mute-disable"
            }`}
            style={{
              flexDirection: "column",
            }}
            onClick={() => {
              // console.log(`hold button clicked ${ses._id}`);
              // if (holdState === '' || holdState === false) setHoldState(true);
              // else if (holdState === true) setHoldState(false);
              const holdButton = document.getElementById(ses._id);
              if (holdButton.classList.contains("mute-enable")) {
                // holdButton.classList.remove("mute-enable");
                // holdButton.classList.add("mute-disable");
                unHoldFunction(
                  ses,
                  sessionInfo,
                  sessionInfoDuplicate,
                  sessionInfoDuplicateAdd
                );
              } else {
                // holdButton.classList.remove("mute-disable");
                // holdButton.classList.add("mute-enable");
                holdFunction(
                  ses,
                  sessionInfoDuplicate,
                  sessionInfoDuplicateAdd
                );
              }
            }}
          >
            <i
              id={`${ses._id}`}
              className={`far fa-pause fa-2x pt-2 d-block`}
              style={{
                height: 45,
                width: 45,
                border: "1px solid #bfbfbf",
                borderRadius: "50%",
                color: "black",
                fontSize: 21,
                display: "flex",
                justifyContent: "center",
              }}
            ></i>

            <div
              className="text-black fw-bold"
              style={{ fontSize: "0.8rem", color: "#000" }}
            >
              Hold
            </div>
          </div>
          {/* )} */}
          {/* mute */}
          <div
            className="col p-0 m-0 text-center d-flex justify-content-center align-items-center"
            style={{ flexDirection: "column" }}
          >
            <i
              id={`mute${ses._id}`}
              onClick={() => {
                let pc = ses.sessionDescriptionHandler.peerConnection;
                pc.getLocalStreams().forEach(function (stream) {
                  stream.getAudioTracks().forEach(function (track) {
                    // console.log(track.enabled);
                    if (track.enabled === true) {
                      setMuteState(true);
                    } else {
                      setMuteState(false);
                    }
                    try {
                      track.enabled = !track.enabled;
                    } catch (e) {
                      // console.log("Error occured in executing this command.");
                      // console.log(e);
                    }
                  });
                });
              }}
              className={`far fa-microphone-slash fa-2x pt-2 ${
                muteState === "" || muteState === false ? "" : "mute-enable"
              }`}
              style={{
                height: windowSize === true ? 30 : 45,
                width: windowSize === true ? 30 : 45,
                border: "1px solid #bfbfbf",
                borderRadius: "50%",
                fontSize: windowSize === true ? "0.8rem" : 21,
                color: `${
                  muteState === "" || muteState === false ? "black" : "white"
                }`,
              }}
            ></i>
            {windowSize === false && (
              <div className="fw-bold" style={{ fontSize: "0.8rem" }}>
                Mute
              </div>
            )}
          </div>
          {/* call transfer */}
          {windowSize === false && (
            <div
              className="col p-0 m-0 text-center"
              onClick={() => {
                for (let f = 0; f < sessionInfo.length; f++) {
                  // holdFunction(sessionInfo[f]);
                  holdFunction(
                    sessionInfo[f],
                    sessionInfoDuplicate,
                    sessionInfoDuplicateAdd
                  );
                }
                setBlindTransferInfo({
                  session: ses,
                });
                // setAttendedTransferPosition(i);
                handleShow();
              }}
            >
              <img
                alt=""
                src={call_transfer}
                className="dtmf-logo"
                style={{
                  height: 45,
                  width: 45,
                  border: "1px solid #bfbfbf",
                  borderRadius: "50%",
                  padding: 7,
                }}
              />
              <div className="fw-bold" style={{ fontSize: "0.8rem" }}>
                Transfer
              </div>
            </div>
          )}
          <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
          >
            <Modal.Header
              closeButton
              style={{
                background: "#d22edd",
                color: "#000",
              }}
            >
              <Modal.Title
                style={{
                  color: "#fff",
                }}
              >
                {blindTransferInfo !== null &&
                blindTransferInfo.session !== null
                  ? blindTransferInfo.session.incomingInviteRequest !==
                    undefined
                    ? blindTransferInfo.session.incomingInviteRequest.message
                        .from._displayName
                    : blindTransferInfo.session.outgoingInviteRequest.message.to
                        .uri.raw.user
                  : ""}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <audio
                className="ongoing-audio"
                style={{ display: "none !important" }}
                id={`mediaElementAttendedTransfer`}
                controls="controls"
              ></audio>
              <input
                type="text"
                name=""
                id=""
                className="form-control"
                value={blindTransferNumber}
                onChange={(e) => setBlindTransferNumber(e.target.value)}
              />
              {attendedTransferSession !== null && (
                <div style={{ paddingTop: 10 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      ses.refer(attendedTransferSession);
                      terminateFunctions(
                        ses,
                        sessionInfo,
                        deleteTerminatedAndOutgoingCall,
                        callTones
                      );
                      handleClose();
                    }}
                  >
                    REFER
                  </button>
                  <button
                    className="mx-2 btn btn-secondary"
                    onClick={() => {
                      if (attendedTransferSession._state === "Establishing") {
                        attendedTransferSession.cancel();
                      } else if (
                        attendedTransferSession._state === "Established"
                      ) {
                        attendedTransferSession.bye();
                      } else if (
                        attendedTransferSession._state === "Terminating" ||
                        attendedTransferSession._state === "Terminated"
                      ) {
                      }
                    }}
                  >
                    CANCEL
                  </button>
                  <button
                    className="mx-2 btn btn-primary"
                    onClick={() => {
                      const _session = attendedTransferSession;

                      holdCall(_session);
                      unHoldFunction(
                        ses,
                        sessionInfo,
                        sessionInfoDuplicate,
                        sessionInfoDuplicateAdd
                      );
                    }}
                  >
                    HOLD
                  </button>
                  <button
                    className="mx-2 btn btn-primary"
                    onClick={() => {
                      const _session = attendedTransferSession;
                      unholdCall(_session);

                      holdFunction(
                        ses,
                        sessionInfoDuplicate,
                        sessionInfoDuplicateAdd
                      );
                    }}
                  >
                    UNHOLD
                  </button>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  attendedTransfer(
                    userAgentInfo,
                    blindTransferNumber,
                    setAttendedTransferSession
                  );
                }}
              >
                Attended Transfer
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (blindTransferNumber !== "") {
                    blindTransfer(blindTransferNumber, ses);
                    handleClose();
                    terminateFunctions(
                      ses,
                      sessionInfo,
                      deleteTerminatedAndOutgoingCall,
                      callTones
                    );
                  }
                }}
              >
                Blind Transfer
              </Button>
            </Modal.Footer>
          </Modal>
          {/* add track */}
          {(windowSize === false &&
            ses.outgoingRequestMessage !== undefined &&
            ses.outgoingRequestMessage.to.uri.raw.user !=
              JSON.parse(sessionStorage.getItem("userInfo")).extension
                .conf_no) ||
          (windowSize === false &&
            ses.incomingInviteRequest !== undefined &&
            sessionInfo.length > 0) ? (
            <div
              className="col p-0 m-0 text-center d-flex justify-content-center align-items-center"
              style={{ flexDirection: "column" }}
              onClick={async () => {
                // start
                function conferenceCheck() {
                  for (let i = 0; i < sessionInfo.length; i++) {
                    if (
                      sessionInfo[i].outgoingRequestMessage !== undefined &&
                      sessionInfo[i].outgoingRequestMessage.to.uri.raw.user ==
                        JSON.parse(sessionStorage.getItem("userInfo")).extension
                          .conf_no
                    ) {
                      return "there";
                    }
                  }
                  return "not there";
                }

                let conferenceThereOrNot = conferenceCheck();
                if (conferenceThereOrNot === "there") {
                  const target = UserAgent.makeURI(
                    `sip:${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .conf_no
                    }@${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .server_address
                    }`
                  );

                  await ses.refer(target);
                  addConference(
                    ses.outgoingRequestMessage !== undefined
                      ? {
                          name: ses.outgoingRequestMessage.to.uri.raw.user,
                          session: ses,
                        }
                      : {
                          name: ses.incomingInviteRequest.message.from.uri.raw
                            .user,
                          session: ses,
                        }
                  );

                  setConferenceArr([
                    ...conferenceArr,
                    ses.outgoingRequestMessage !== undefined
                      ? ses.outgoingRequestMessage.to.uri.raw.user
                      : ses.incomingInviteRequest.message.from.uri.raw.user,
                  ]);
                  setConferenceSessions([...conferenceSessions, ses]);
                  terminateFunctions(
                    ses,
                    sessionInfo,
                    deleteTerminatedAndOutgoingCall,
                    callTones
                  );
                } else {
                  await dilaerFun(
                    JSON.parse(
                      sessionStorage.getItem("userInfo")
                    ).extension.conf_no.toString(),
                    userAgentInfo,
                    sessionInfo
                  );
                  const target = UserAgent.makeURI(
                    `sip:${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .conf_no
                    }@${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .server_address
                    }`
                  );
                  await ses.refer(target);
                  addConference(
                    ses.outgoingRequestMessage !== undefined
                      ? {
                          name: ses.outgoingRequestMessage.to.uri.raw.user,
                          session: ses,
                        }
                      : {
                          name: ses.incomingInviteRequest.message.from.uri.raw
                            .user,
                          session: ses,
                        }
                  );
                  setConferenceArr([
                    ...conferenceArr,
                    ses.outgoingRequestMessage !== undefined
                      ? ses.outgoingRequestMessage.to.uri.raw.user
                      : ses.incomingInviteRequest.message.from.uri.raw.user,
                  ]);
                  setConferenceSessions([...conferenceSessions, ses]);
                  terminateFunctions(
                    ses,
                    sessionInfo,
                    deleteTerminatedAndOutgoingCall,
                    callTones
                  );
                }
              }}
            >
              <i
                // id={`${ses._id}`}
                className={`far fa-users fa-2x pt-2`}
                style={{
                  height: 45,
                  width: 45,
                  border: "1px solid #bfbfbf",
                  borderRadius: "50%",
                  //   color: "white",
                  fontSize: 21,
                  display: "flex",
                  justifyContent: "center",
                }}
              ></i>
              <div className="fw-bold ms-1" style={{ fontSize: "0.8rem" }}>
                Conf.
              </div>
            </div>
          ) : (
            ""
          )}
          <div className="row d-flex justify-content-center">
            <div
              className={`${
                sessionInfo.length > 4 || windowSize === true ? "col " : "col-5"
              } p-0   text-center mx-1 my-2 end-call-container`}
              onClick={() => {
                terminateFunctions(
                  ses,
                  sessionInfo,
                  deleteTerminatedAndOutgoingCall,
                  callTones
                );
                if (
                  ses.outgoingRequestMessage !== undefined &&
                  ses.outgoingRequestMessage.to.uri.raw.user ==
                    JSON.parse(sessionStorage.getItem("userInfo")).extension
                      .conf_no
                ) {
                  removeConference([]);
                } else if (
                  ses.incomingInviteRequest !== undefined &&
                  ses.incomingInviteRequest.message.from.uri.raw.user ==
                    JSON.parse(sessionStorage.getItem("userInfo")).extension
                      .conf_no
                ) {
                  removeConference([]);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              <i
                className="far fa-phone-slash text-center fw-bold"
                style={{
                  height: windowSize === true ? 30 : 45,
                  width: windowSize === true ? 30 : 45,
                  paddingTop: windowSize === true ? "0.3rem" : "1rem",

                  marginTop: windowSize === true ? "0.4rem" : 0,

                  color: "black",

                  fontSize: windowSize === true ? "0.8rem" : "1.2rem",
                }}
              ></i>
              {windowSize === false && (
                <div className="fw-bold" style={{ fontSize: "0.8rem" }}>
                  End Call
                </div>
              )}
            </div>

            {windowSize === false && (
              <div
                className={`${
                  sessionInfo.length > 4 ? "col" : "col-5"
                } p-0 m-0  text-center mx-1 end-call-container my-2`}
                onClick={() => {
                  const target = UserAgent.makeURI(
                    `sip:${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .ext_no
                    }@${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .server_address
                    }`
                  );
                  ses.refer(target);
                  terminateFunctions(
                    ses,
                    sessionInfo,
                    deleteTerminatedAndOutgoingCall,
                    callTones
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <i
                  className="far fa-bell text-center pt-3"
                  style={{
                    height: 45,
                    width: 45,

                    color: "black",

                    fontSize: windowSize === true ? "0.8rem" : "1.2rem",
                  }}
                ></i>
                <div className="fw-bold" style={{ fontSize: "0.8rem" }}>
                  Ring All
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default OngoingScreen;
