import React, { useState, useEffect, useContext } from "react";

import UserContext from "../../context/useragent/userContext";
import LoginContext from "../../context/login/loginContext";
import ContactContext from "../../context/contact/contactContext";
import OngoingContainer from "./OngoingContainer";

const DisplayOngoingScreen = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const loginContext = useContext(LoginContext);
  const { sessionInfo, single_screen } = userContext;
  const { showOngoing, setShowOngoing } = contactContext;
  const { loaderOnSizeChange } = loginContext;

  //change call view
  const colFunc = () => {
    if (
      (sessionInfo.length == 0 &&
        window.innerWidth >= 576 &&
        single_screen == false) ||
      (sessionInfo.length > 0 &&
        sessionInfo.length <= 2 &&
        window.innerWidth >= 576 &&
        single_screen == false)
    ) {
      return "col-4";
    } else if (
      (sessionInfo.length == 0 &&
        window.innerWidth < 576 &&
        single_screen == true) ||
      (sessionInfo.length > 2 &&
        window.innerWidth > 576 &&
        single_screen == false) ||
      (sessionInfo.length > 0 &&
        window.innerWidth <= 576 &&
        single_screen == true)
    ) {
      return "col";
    } else if (
      sessionInfo.length == 0 ||
      (sessionInfo.length > 0 &&
        window.innerWidth <= 576 &&
        single_screen == false)
    ) {
      return "";
    } else {
      return "";
    }
  };

  return showOngoing.flag == true ||
    sessionInfo.length > 1 ||
    (sessionInfo.length == 1 && sessionInfo[0]._state == "Established") ? (
    <div
      className={`${colFunc()} p-0 half-dashboard 
          
          `}
      style={{
        display: "",
        zIndex: "1000 !important",
        top: loaderOnSizeChange !== true && window.outerWidth <= 310 && "0px",
        position:
          loaderOnSizeChange !== true && window.outerWidth <= 310 && "fixed",
        // width:loaderOnSizeChange !== true  && window.outerWidth <= 310 & "100px",
        height:
          loaderOnSizeChange !== true && window.outerWidth <= 310 && "200px",
        marginBottom:
          loaderOnSizeChange !== true && window.outerWidth <= 310 && "20px",
        backgroundColor:
          loaderOnSizeChange !== true && window.outerWidth <= 310 && "black",
      }}
    >
      <OngoingContainer />
    </div>
  ) : (
    <span></span>
  );
};

export default DisplayOngoingScreen;
