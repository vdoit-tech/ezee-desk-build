import React, { useContext, useEffect, useState } from "react";
import "./OngoingContainer.css";
import Ongoing from "./Ongoing";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import FloaterOngoing from "../../components/floater/FloaterOngoing";
import OngoingScreen from "./OngoingScreen";
import OnGoingCall from "./OnGoingCall";
import { session } from "electron";

const OngoingContainer = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { collapse_dashboard, sessionInfo } = userContext;
  const { showOngoing, setShowOngoing } = contactContext;
  useEffect(() => {
    if (sessionInfo.length > 1) {
      setShowOngoing({ flag: false, number: null, image: null });
    }
  }, [sessionInfo]);

  return (
    <div
      // className={`${
      //   sessionInfo.length === 1
      //     ? "d-flex justify-content-center align-items-center"
      //     : ""
      // } h-100 `}
      className={`${"d-flex justify-content-center align-items-center"} h-100 `}
    >
      {/* <Ongoing size={props.size} /> */}
      <div className="ongoing h-100">
        <div className="row p-0 m-0 d-flex h-100">
          {sessionInfo.length == 0 ? (
            <div
              className={`col-12 d-flex justify-content-center align-items-center`}
              style={{
                background: "#fafafa",
              }}
            >
              <OnGoingCall />
            </div>
          ) : (
            sessionInfo.map((ses, i) => (
              <div
                key={ses._id}
                className={`col-${
                  sessionInfo.length >= 3 && sessionInfo.length <= 4 ? 6 : 12
                } d-flex justify-content-center align-items-center`}
                style={{
                  background: "#fafafa",
                }}
              >
                <OnGoingCall key={ses._id} ses={ses} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OngoingContainer;
