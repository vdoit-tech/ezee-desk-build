import React, { useContext, useEffect, useState } from "react";
import sample from "../../assets/imgs/default_profile.png";
import incomingTone from "../../assets/audio/incoming.mp3";
import "./Incoming.css";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import LoginContext from "../../context/login/loginContext";
import { Inviter, UserAgent } from "sip.js";
import { DisplayName, setCallImage } from "../../Constants/Helper";
import { acceptCall, rejectCall } from "../../Constants/CallOperations";

function Incoming(props) {
  const loginContext = useContext(LoginContext);
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { collapse_sidebar } = loginContext;

  const {
    sessionInfo,

    hide,
    changeScreenView,
  } = userContext;

  const { setShowOngoing } = contactContext;
  // const [incomingRing, setIncomingRing] = useState(
  //   // new Audio(
  //   //   "https://www.mediacollege.com/audio/tone/files/100Hz_44100Hz_16bit_30sec.mp3"
  //   // )
  //   new Audio(incomingTone)
  // );
  useEffect(() => {
    props.incomingRing.play();
  }, []);

  useEffect(() => {
    if (sessionInfo[0]._state == "Terminated") {
      props.incomingRing.pause();
    }
  }, [sessionInfo[0]._state]);

  return (
    <div>
      <div
        className={`container-fluid  px-0  ${
          collapse_sidebar ? "incoming-collapsed" : "incoming"
        }`}
      >
        {/* <audio
          className="ongoing-audio"
          // style={{ display: "none !important" }}
          // id={`mediaElement${ses._id}`}
          controls="controls"
          src="https://www.mediacollege.com/audio/tone/files/100Hz_44100Hz_16bit_30sec.mp3"
        ></audio> */}
        <div className="row incoming-div">
          <div className="col-12  py-2 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <img
                alt=""
                src={
                  setCallImage(
                    sessionInfo[0].incomingInviteRequest.message.from.uri.raw
                      .user
                  ) !== null
                    ? setCallImage(
                        sessionInfo[0].incomingInviteRequest.message.from.uri
                          .raw.user
                      )
                    : sample
                }
                className="call-person-img"
              ></img>

              <div className="ps-1 text-white">
                {Array.isArray(sessionInfo) && sessionInfo[0] !== undefined && (
                  <span>
                    {DisplayName({
                      num: sessionInfo[0].incomingInviteRequest.message.from.uri
                        .raw.user,
                    }) == null
                      ? sessionInfo[0].incomingInviteRequest.message.from
                          ._displayName !== ""
                        ? sessionInfo[0].incomingInviteRequest.message.from
                            ._displayName
                        : sessionInfo[0].incomingInviteRequest.message.from.uri
                            .raw.user
                      : DisplayName({
                          num: sessionInfo[0].incomingInviteRequest.message.from
                            .uri.raw.user,
                        })}
                    <span className="ms-1">
                      {
                        sessionInfo[0].incomingInviteRequest.message.from.uri
                          .raw.user
                      }
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="d-flex ml-auto">
              <div
                onClick={() => {
                  setShowOngoing({
                    flag: true,
                    number:
                      sessionInfo[0].incomingInviteRequest.message.from.uri.raw
                        .user,
                    image: null,
                  });
                  acceptCall(sessionInfo, props.incomingRing);
                  window.innerWidth <= 600 && changeScreenView(true);
                }}
                className="d-flex justify-content-center align-items-center bottom-buttons mx-1 accept-call"
              >
                <i className="fas fa-phone-alt"></i>
              </div>

              <div
                onClick={() => {
                  rejectCall(sessionInfo, props.incomingRing);
                }}
                id="cancel"
                className="d-flex justify-content-center align-items-center bottom-buttons cancel-call"
              >
                <i className="fas fa-phone-slash"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Incoming;
