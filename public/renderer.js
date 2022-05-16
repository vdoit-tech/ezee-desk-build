const { ipcRenderer } = require("electron");
const {
  START_NOTIFICATION_SERVICE,
  NOTIFICATION_SERVICE_STARTED,
  NOTIFICATION_SERVICE_ERROR,
  NOTIFICATION_RECEIVED,
  TOKEN_UPDATED,
} = require("electron-push-receiver/src/constants");
// let serverNotificationPayload;
const senderId = "977061224445";
let win = require("electron").remote.getCurrentWindow();
console.log(senderId);

// Listen for service successfully started
ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, (_, token) => {
  console.log("service started", token);
  sessionStorage.setItem("deviceToken", token);
});
// Handle notification errors
ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, (_, error) => {
  console.log("service error");
});
ipcRenderer.on(TOKEN_UPDATED, (_, token) => {
  console.log("Getting Token");
  console.log(token);
});
ipcRenderer.on(NOTIFICATION_RECEIVED, (_, serverNotificationPayload) => {
  // console.log("display notification", serverNotificationPayload);
  if (
    sessionStorage.getItem("token") !== null &&
    sessionStorage.getItem("token") !== undefined
  ) {
    if (serverNotificationPayload.notification.body) {
      console.log("display notification", serverNotificationPayload);
      let from = JSON.parse(serverNotificationPayload.notification.body).from;
      let messages = JSON.parse(
        serverNotificationPayload.notification.body
      ).messages;
      let number = serverNotificationPayload.notification.title;
      let text = serverNotificationPayload.notification.body;
      if (from !== sessionStorage.getItem("my_telnyx_num")) {
        ipcRenderer.send("payload", serverNotificationPayload);
      }

      console.log("body", serverNotificationPayload.notification);

      let myNotification = new Notification(
        from !== undefined ? displayNameOrNumber(from) : number,
        {
          body:
            messages !== undefined
              ? messages === null
                ? "media"
                : messages
              : displayNameOrNumber(text),
        }
      );
      myNotification.onclick = () => {
        console.log("notification received");

        win.show();
      };
    } else {
      console.log(
        "do something with the key/value pairs in the data",
        serverNotificationPayload.data
      );
    }
  }
});

console.log("starting service and registering a client");
ipcRenderer.send(START_NOTIFICATION_SERVICE, senderId);
console.log(senderId);

function isOnline(user_callback) {
  /**
   * Show a warning to the user.
   * You can retry in the dialog until a internet connection
   * is active.
   */
  var message = function () {
    const { dialog } = require("electron").remote;
    console.log("offline");

    return dialog.showMessageBox(
      {
        title: "There's no internet",
        message: "No internet available, do you want to try again?",
        type: "warning",
        buttons: ["Try again please", "I don't want to work anyway"],
        defaultId: 0,
      },
      function (index) {
        // if clicked "Try again please"
        if (index == 0) {
          execute();
        }
      }
    );
  };

  var execute = function () {
    if (navigator.onLine) {
      // Execute action if internet available.
      user_callback();
    } else {
      // Show warning to user
      // And "retry" to connect
      message();
    }
  };

  // Verify for first time
  execute();
}

// Use it, the alert("Hello world"); will be executed only if there's an active internet connection.
isOnline(function () {
  // alert("Connected!");
});

const displayNameOrNumber = (num) => {
  let name = null;

  let remote_contacts =
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let my_contacts =
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("my_contacts"));
  let central_contacts =
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
      "string" &&
    JSON.parse(sessionStorage.getItem("central_contacts"));

  remote_contacts !== false &&
    remote_contacts.map((item, index) => {
      if (item.extension_no == num) {
        name = item.name;
      } else if (
        removeCountryCode(num) == removeCountryCode(item.extension_no)
      ) {
        name = item.name;
      }
    });
  remote_contacts !== false &&
    remote_contacts.map((item, index) => {
      if (item.telnyx_phone == num) {
        name = item.name;
      } else if (
        removeCountryCode(num) == removeCountryCode(item.telnyx_phone)
      ) {
        name = item.name;
      }
    });

  //my contacts
  my_contacts !== false &&
    my_contacts.map((item, index) => {
      item.phoneDetail.map((info) => {
        if (info.phone == num) {
          name = item.name;
        } else if (removeCountryCode(num) == removeCountryCode(info.phone)) {
          name = item.name;
        }
      });
    });

  //central contacts
  central_contacts !== false &&
    central_contacts.map((item, index) => {
      item.phoneDetail.map((info) => {
        if (info.phone == num) {
          name = item.name;
        } else if (removeCountryCode(num) == removeCountryCode(info.phone)) {
          name = item.name;
        }
      });
    });
  return name == null ? num : name;
};

const removeCountryCode = (val) => {
  if (val !== null && val !== undefined) {
    if (val.length === 13) {
      val = val.slice(3, val.length);
    } else if (val.length == 12) {
      val = val.slice(2, val.length);
    }
  }

  return val;
};

// export function send(sql) {
//   return new Promise((resolve) => {
//     ipcRenderer.once("asynchronous-reply", (_, arg) => {
//       resolve(arg);
//     });
//     ipcRenderer.send("asynchronous-message", sql);
//   });
// }

const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
ipcRenderer.on('update_available', () => {
  ipcRenderer.removeAllListeners('update_available');
  message.innerText = 'A new update is available. Downloading now...';
  notification.classList.remove('hidden');
});
ipcRenderer.on('update_downloaded', () => {
  ipcRenderer.removeAllListeners('update_downloaded');
  message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
  restartButton.classList.remove('hidden');
  notification.classList.remove('hidden');
});

function closeNotification() {
  notification.classList.add('hidden');
}
function restartApp() {
  ipcRenderer.send('restart_app');
}