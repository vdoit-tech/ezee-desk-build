import { Web, Inviter, UserAgent } from "sip.js";

export const holdCall = (session) => {
  const options = {
    sessionDescriptionHandlerModifiers: [Web.holdModifier],
    requestOptions: {
      extraHeaders: ["X-HoldModifier: sendonly"],
    },
  };
  const __session = session;
  __session.invite(options);
};

export const holdFunction = (
  session,
  sessionInfoDuplicate,
  sessionInfoDuplicateAdd
) => {
  const holdButton = document.getElementById(session._id);
  holdButton.classList.add("mute-enable");
  holdCall(session);

  //context duplicate clicked session on hold
  let data = [...sessionInfoDuplicate];
  sessionInfoDuplicate.map((i, index) => {
    if (i.session == session) {
      data[index].hold = "hold";
    }
  });

  sessionInfoDuplicateAdd(data);
};

export const unholdCall = (session) => {
  const options = {
    sessionDescriptionHandlerModifiers: [],
  };
  const __session = session;
  __session.invite(options);
};

export const unHoldFunction = (
  ses,
  sessionInfo,
  sessionInfoDuplicate,
  sessionInfoDuplicateAdd
) => {
  console.log("unhold", sessionInfo);
  for (let i = 0; i < sessionInfo.length; i++) {
    if (sessionInfo[i] === ses) {
      const holdButton = document.getElementById(sessionInfo[i]._id);
      holdButton.classList.remove("mute-enable");
      unholdCall(sessionInfo[i]);
      //context duplicate clicked session unhold
      let data = [...sessionInfoDuplicate];
      if (data[i].session == sessionInfo[i]) {
        data[i].hold = "unhold";
      }
      sessionInfoDuplicateAdd(data);
    } else {
      holdFunction(
        sessionInfo[i],
        sessionInfoDuplicate,
        sessionInfoDuplicateAdd
      );
    }
  }
};

export const dtmfWithKeyboard = (event, dtmf) => {
  let key = event.key;
  if (key >= 0 && key <= 9) {
    dtmf(key);
  } else if (key == "*" || key == "#") {
    dtmf(key);
  }
};

export const terminateFunctions = (
  ses,
  sessionInfo,
  deleteTerminatedAndOutgoingCall,
  callTones
) => {
  for (let i = 0; i < sessionInfo.length; i++) {
    if (sessionInfo[i] === ses) {
      if (Array.isArray(sessionInfo) && sessionInfo.length !== 0) {
        if (sessionInfo[i]._state === "Establishing") {
          sessionInfo[i].cancel();

          console.log("Establishing");

          if (sessionInfo[i].outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
          callTones.pause();
        } else if (sessionInfo[i]._state === "Established") {
          callTones.pause();

          sessionInfo[i].bye();

          console.log("Established1");

          //call log----------
          if (sessionInfo[i].outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
        } else if (
          sessionInfo[i]._state === "Terminating" ||
          sessionInfo[i]._state === "Terminated"
        ) {
          console.log("Terminating || Terminated");
          callTones.pause();

          if (sessionInfo[i].outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
        } else {
          sessionInfo[i].reject();

          if (sessionInfo.outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
        }
        console.log(sessionInfo);
      } else {
        if (sessionInfo._state === "Establishing") {
          sessionInfo.cancel();

          if (sessionInfo.outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
        } else if (sessionInfo._state === "Established") {
          sessionInfo.bye();

          if (sessionInfo.outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
        } else if (
          sessionInfo._state === "Terminating" ||
          sessionInfo._state === "Terminated"
        ) {
          if (sessionInfo.outgoingInviteRequest !== undefined)
            deleteTerminatedAndOutgoingCall(i);
        } else {
        }
      }
    }
  }
};

//incoming call

export const acceptCall = (sessionInfo, incomingRing) => {
  if (Array.isArray(sessionInfo)) {
    sessionInfo[0].accept();
  } else {
    sessionInfo.accept();
  }
  incomingRing.pause();
};

export const rejectCall = (sessionInfo, incomingRing) => {
  if (Array.isArray(sessionInfo)) {
    switch (sessionInfo[0].state) {
      case "Initial":
      case "Establishing":
        if (sessionInfo[0] instanceof Inviter) {
          // An unestablished outgoing session
          console.log("cancel");

          sessionInfo[0].cancel();

          console.log(sessionInfo);
        } else {
          // An unestablished incoming session
          console.log("reject");
          sessionInfo[0].reject();

          console.log(sessionInfo);
        }
        break;
      case "Established":
        console.log("bye");
        sessionInfo[0].bye();

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
  incomingRing.pause();
};

export const attendedTransfer = (
  userAgentInfo,
  blindTransferNumber,
  setAttendedTransferSession
) => {
  var session;
  var uri = UserAgent.makeURI(
    `sip:${blindTransferNumber.replace(/\s/g, "")}@${
      JSON.parse(sessionStorage.getItem("userInfo")).extension.server_address
    }`
  );
  session = new Inviter(userAgentInfo, uri);
  session
    .invite()
    .then((request) => {
      setAttendedTransferSession(session);
      session.stateChange.addListener(async (state) => {
        switch (state) {
          case "Established":
            const mediaElement = document.getElementById(
              `mediaElementAttendedTransfer`
            );
            const remoteStream = new MediaStream();

            session.sessionDescriptionHandler.peerConnection
              .getReceivers()
              .forEach((receiver) => {
                if (receiver.track) {
                  remoteStream.addTrack(receiver.track);
                }
              });
            if (mediaElement !== null) {
              mediaElement.srcObject = remoteStream;
              mediaElement.play();
            }

            break;
          case "Terminated":
            setAttendedTransferSession(null);
            break;
          default:
            break;
        }
      });
    })
    .catch((error) => {
      // console.error(" Failed to INVITE");
      // console.error(error.toString());
    });
};

export const blindTransfer = (blindTransferNumber, ses) => {
  // console.log(blindTransferNumber);
  const target = UserAgent.makeURI(
    `sip:${blindTransferNumber}@${
      JSON.parse(sessionStorage.getItem("userInfo")).extension.server_address
    }`
  );
  ses.refer(target);
};
