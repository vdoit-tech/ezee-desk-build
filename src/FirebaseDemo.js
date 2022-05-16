import React from "react";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const FirebaseDemo = () => {
  const firebaseConfig = {
    apiKey: "AIzaSyAmdIdKUAbgSgFoPGJMNNOxxvzlHpoxmgw",
    authDomain: "ezeelink-1c874.firebaseapp.com",
    projectId: "ezeelink-1c874",
    storageBucket: "ezeelink-1c874.appspot.com",
    messagingSenderId: "977061224445",
    appId: "1:977061224445:web:34be4d20981c21bae1c394",
    measurementId: "G-1G8J6T4XVD",
  };
  initializeApp(firebaseConfig);
  const fapp = initializeApp(firebaseConfig);
  const messaging = getMessaging(fapp);
  const clickHandler = () => {
    console.log(messaging);
    // An error occurred while retrieving token.  FirebaseError: Messaging: We are unable to register the default service worker. Failed to register a ServiceWorker: The document is in an invalid state. (messaging/failed-service-worker-registration).
    // messaging().getToken({
    //   vapidKey:
    //     "BK741SIgQmcEbcLS2lyILPXzteubetCrNxCjLiP2VQX99KViRG1GoNhz3X-bbF7WZhANPH6lH0iP8gijzU1c75s",
    // });
    getToken(messaging, {
      vapidKey:
        "BK741SIgQmcEbcLS2lyILPXzteubetCrNxCjLiP2VQX99KViRG1GoNhz3X-bbF7WZhANPH6lH0iP8gijzU1c75s",
    })
      .then((currentToken) => {
        console.log(currentToken);
        if (currentToken) {
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
        }
      })
      .catch((err) => {
        console.log("An error occurred while retrieving token. ", err);
      });
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
      // ...
    });
  };

  return (
    <div>
      <button onClick={clickHandler}>click</button>
    </div>
  );
};

export default FirebaseDemo;
