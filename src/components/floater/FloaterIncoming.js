import React, { useContext, useEffect, useState } from "react";
import sample from "../../assets/imgs/default-profile.png";
// import "./Incoming.css";
import UserContext from "../../context/useragent/userContext";

import { Inviter, UserAgent } from "sip.js";

function FloaterIncoming(props) {
  const userContext = useContext(UserContext);

  const {
    sessionInfo,

    hide,
  } = userContext;

  let remoteContacts =
    sessionStorage.getItem("remote_contacts") !== null &&
    sessionStorage.getItem("remote_contacts") !== undefined &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let myContacts =
    sessionStorage.getItem("my_contacts") !== null &&
    sessionStorage.getItem("my_contacts") !== undefined &&
    JSON.parse(sessionStorage.getItem("my_contacts"));

  const acceptCall = () => {
    if (Array.isArray(sessionInfo)) {
      console.log("hide", hide);

      console.log("hide", hide);
      sessionInfo[sessionInfo.length - 1].accept();

      console.log("hide", hide);
    } else {
      sessionInfo.accept();
    }
  };

  function rejectCall() {
    if (Array.isArray(sessionInfo)) {
      switch (sessionInfo[sessionInfo.length - 1].state) {
        case "Initial":
        case "Establishing":
          if (sessionInfo[sessionInfo.length - 1] instanceof Inviter) {
            // An unestablished outgoing session
            console.log("cancel");

            sessionInfo[sessionInfo.length - 1].cancel();

            console.log(sessionInfo);
          } else {
            // An unestablished incoming session
            console.log("reject");
            sessionInfo[sessionInfo.length - 1].reject();

            console.log(sessionInfo);
          }
          break;
        case "Established":
          console.log("bye");
          sessionInfo[sessionInfo.length - 1].bye();

          console.log(sessionInfo);

          break;
        case "Terminating":
        case "Terminated":
          // Cannot terminate a session that is already terminated
          break;
        default:
          break;
      }
    } else {
      switch (sessionInfo.state) {
        case "Initial":
        case "Establishing":
          if (sessionInfo instanceof Inviter) {
            // An unestablished outgoing session
            console.log("cancel");
            sessionInfo.cancel();
          } else {
            // An unestablished incoming session
            console.log("reject");
            sessionInfo.reject();
          }
          break;
        case "Established":
          // An established session
          console.log("bye");
          sessionInfo.bye();

          break;
        case "Terminating":
        case "Terminated":
          // Cannot terminate a session that is already terminated
          break;
        default:
          break;
      }
    }
  }
  const SetCallImage = (num) => {
    let img = null;
    remoteContacts !== null &&
      remoteContacts !== undefined &&
      typeof remoteContacts !== "string" &&
      remoteContacts.map((item, index) => {
        if (item.extension_no == num.num) {
          img = item.profile;
        }
      });

    return (
      <img
        src={img === null ? sample : img}
        alt=""
        className="call-person-img"
      />
    );
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #be2edd, #d8374c, #fc8c0c)",
      }}
    >
      <div className="container-fluid min-vh-100 px-0 d-flex align-items-center justify-content-center">
        <div className="  d-flex flex-column align-items-center  justify-content-center">
          <SetCallImage
            num={
              sessionInfo[sessionInfo.length - 1].incomingInviteRequest.message
                .from.uri.raw.user
            }
          />
          <div className="text-white">
            {Array.isArray(sessionInfo)
              ? sessionInfo[sessionInfo.length - 1] !== undefined && (
                  <span>
                    {/* {myContacts !== null &&
                      myContacts !== undefined &&
                      typeof myContacts !== "string" &&
                      myContacts.map((item, index) => {
                        let num = item.phoneDetail;
                        let user =
                          sessionInfo[sessionInfo.length - 1]
                            .incomingInviteRequest.message.from.uri.raw.user;
                        if (
                          num[0].phone == user ||
                          num[1].phone == user ||
                          num[2].phone == user
                        ) {
                          return item.name;
                        }
                      })} */}
                    {remoteContacts !== null &&
                      remoteContacts !== undefined &&
                      typeof remoteContacts !== "string" &&
                      remoteContacts.map((item, index) => {
                        let user =
                          sessionInfo[sessionInfo.length - 1]
                            .incomingInviteRequest.message.from.uri.raw.user;
                        if (item.extension_no == user) {
                          return item.name;
                        }
                      })}

                    {
                      sessionInfo[sessionInfo.length - 1].incomingInviteRequest
                        .message.from.uri.raw.user
                    }
                  </span>
                )
              : sessionInfo !== undefined &&
                sessionInfo[sessionInfo.length - 1].incomingInviteRequest
                  .message.from._displayName}
          </div>
          <div className="d-flex  justify-content-center my-1">
            <div
              onClick={() => {
                acceptCall();
              }}
              className="d-flex justify-content-center align-items-center bottom-buttons mx-2 accept-call"
              style={{ height: "27px", width: "27px" }}
            >
              <i className="fas fa-phone-alt"></i>
            </div>
            <div
              onClick={() => {
                rejectCall();
              }}
              id="cancel"
              className="d-flex justify-content-center align-items-center bottom-buttons cancel-call"
              style={{ height: "27px", width: "27px" }}
            >
              <i className="fas fa-phone-slash"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FloaterIncoming;
