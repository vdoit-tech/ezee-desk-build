import React, { useEffect, useState, useContext } from "react";

import UserContext from "../../context/useragent/userContext";
import LoginContext from "../../context/login/loginContext";
import Incoming from "../../screens/incoming/Incoming";
import OnGoingCall from "../../screens/ongoing/OnGoingCall";
import OngoingContainer from "../../screens/ongoing/OngoingContainer";
import FloaterIncoming from "./FloaterIncoming";
import FloaterOngoing from "./FloaterOngoing";
import ezeetelImg from "../../assets/imgs/ezeetel-Logo.png";
const Floater = (props) => {
  const userContext = useContext(UserContext);
  const loginContext = useContext(LoginContext);
  const { sessionInfo } = userContext;
  const { loaderOnSizeChange, setLoaderOnSizeChange } = loginContext;

  return (
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
      <div className="d-flex    align-items-center justify-content-center">
        {sessionInfo.length === 0 && (
          <img className="" src={ezeetelImg} alt="" />
        )}
      </div>

      {sessionInfo.length > 0 &&
      sessionInfo[0]._state === "Initial" &&
      sessionInfo[sessionInfo.length - 1].incomingInviteRequest !==
        undefined ? (
        <FloaterIncoming propData={props.history} />
      ) : sessionInfo.length > 1 &&
        sessionInfo[sessionInfo.length - 1]._state === "Initial" &&
        sessionInfo[sessionInfo.length - 1].incomingInviteRequest !==
          undefined ? (
        <div className="text-center text-white d-flex align-items-center justify-content-center fs-5 mx-1">
          You have another incoming call, expand to view
        </div>
      ) : sessionInfo[sessionInfo.length - 1] !== undefined &&
        sessionInfo !== null &&
        sessionInfo[sessionInfo.length - 1].outgoingRequestMessage !==
          undefined &&
        sessionInfo.length < 2 ? (
        <OngoingContainer />
      ) : sessionInfo.length !== 0 &&
        (sessionInfo[sessionInfo.length - 1]._state === "Established" ||
          sessionInfo[sessionInfo.length - 1]._state === "Establishing") &&
        sessionInfo.length < 2 ? (
        <OngoingContainer />
      ) : (
        sessionInfo.length !== 0 &&
        (sessionInfo[sessionInfo.length - 1]._state === "Established" ||
          sessionInfo[sessionInfo.length - 1]._state === "Establishing") &&
        sessionInfo.length > 1 && (
          <span className="w-100 fs-5 min-vh-100 d-flex justify-content-center align-items-center text-white">
            {sessionInfo.length} ongoing calls
          </span>
        )
      )}
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
    </div>
  );
};

export default Floater;
