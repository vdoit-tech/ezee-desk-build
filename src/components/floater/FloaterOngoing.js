import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../context/useragent/userContext";
import defaultPic from "../../assets/imgs/default-profile.png";

const FloaterOngoing = ({ ses }) => {
  const userContext = useContext(UserContext);
  const { sessionInfo } = userContext;

  return (
    <div>
      {sessionInfo.length > 0 &&
      sessionInfo[sessionInfo.length - 1]._state === "Initial" ? (
        <div>
          <button
            onClick={() => {
              sessionInfo[sessionInfo.length - 1].accept();
            }}
          >
            accept
          </button>
          <button
            onClick={() => {
              sessionInfo[sessionInfo.length - 1].reject();
            }}
          >
            reject
          </button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default FloaterOngoing;
