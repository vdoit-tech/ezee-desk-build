import React, { useEffect, useState, useContext } from "react";
import { Inviter, UserAgent, Web } from "sip.js";

import UserContext from "../../context/useragent/userContext";

import "./Ongoing.css";

import StopWatch from "./StopWatch";
import OnGoingCall from "./OnGoingCall";
import OngoingScreen from "./OngoingScreen";

const Ongoing = (props) => {
  const userContext = useContext(UserContext);

  const { sessionInfo } = userContext;

  return (
    <div className="ongoing h-100">
      <div className="row p-0 m-0 d-flex h-100">
        {sessionInfo.map((ses, i) => (
          <div
            key={ses._id}
            className={`col-${
              sessionInfo.length >= 3 && sessionInfo.length <= 4 ? 6 : 12
            } d-flex justify-content-center align-items-center`}
            style={{
              //  borderBottom: "1px solid black",
              background: "#fafafa",
            }}
          >
            {/* <OnGoingCall key={ses._id} ses={ses} /> */}
            <OngoingScreen key={ses._id} ses={ses} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ongoing;
