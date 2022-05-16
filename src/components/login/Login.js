import React, { useContext, useState, useEffect } from "react";
import "./Login.css";
import ezeetelImg from "../../assets/imgs/ezeetel-Logo.png";
import LoginContext from "../../context/login/loginContext";
import ContactContext from "../../context/contact/contactContext";
import UserContext from "../../context/useragent/userContext";
import { detailsLogger, getTotalUnReplied } from "../../Constants/Helper";
import { socket } from "../../App";
import DataBase from "nedb";
import path from "path";
import { GET_SMS_CHATS } from "../../Constants/Api";
import axios from "axios";
import { getSMSChatsAPI } from "../../Constants/ApiHelper";

const Login = (props) => {
  const loginContext = useContext(LoginContext);
  const contactContext = useContext(ContactContext);
  const userContext = useContext(UserContext);
  const { userLogin, login_response, isLoading, setIsLoading } = loginContext;
  const {
    getMyContact,
    getCallLogs,

    getRemoteContact,
    getCentralContact,
    getGroupNotifications,
    onLineStatus,
  } = contactContext;
  const { getUAConfig, setGlobalUserAgent } = userContext;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState(null);

  var instantMessageDb = new DataBase({
    filename: path.join(__dirname, "/instantMessageDb.db"),
    autoload: true,
  });
  var callLogsDb = new DataBase({
    filename: path.join(__dirname, "/callLog.db"),
    autoload: true,
  });
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    setLoginResponse(login_response);
    setTimeout(() => {
      setLoginResponse(null);
    }, 5000);
  }, [login_response]);
  useEffect(() => {
    setLoginResponse(null);
  }, []);

  const loginData = (e) => {
    console.log(email);
    console.log(password);
    e.preventDefault();

    document.getElementById("submit-alert").innerHTML = "";

    if (email === "" && password !== "") {
      document.getElementById("submit-alert").innerHTML =
        "Email field is required";
    } else if (password === "" && email !== "") {
      document.getElementById("submit-alert").innerHTML =
        "Password field is required";
    } else if (email === "" && password === "") {
      document.getElementById("submit-alert").innerHTML =
        "Email and Password fields are required";
    } else if (email !== "" && password !== "") {
      let email_format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (email.match(email_format)) {
        let deviceToken = sessionStorage.getItem("deviceToken");
        // userLogin(email, password, deviceToken, props.history);
        // let deviceToken = `d0qR0Pewt1k:APA91bGH7wVB4etbiCIcX0_vDt3XQJktNrkDfXBlqjk31WEQ0oku7VQXbCMHlKfbG4mz003K3sutgiVTcL_xd2wmZE4Su7ps6IQldLIToyz9iKGOQjj7Ns6SKwX9XiJ8JRYmBqwD1BYt`;
        userLogin(email, password, deviceToken, props.history);
        // detailsLogger(`login with email:${email},password:${password}`);
        setTimeout(async () => {
          if (sessionStorage.getItem("userInfo") !== null) {
            let { userAgent } = await getUAConfig(
              JSON.parse(sessionStorage.getItem("userInfo")).extension.username,
              JSON.parse(sessionStorage.getItem("userInfo")).extension.name
            );
            setGlobalUserAgent(userAgent);
            console.log(userAgent);
          }
          if (
            sessionStorage.getItem("userInfo") !== null &&
            JSON.parse(sessionStorage.getItem("userInfo")).extension
              .telnyx_phone !== null
          ) {
            getSMSChats();
          }
          await onLineStatus(1);

          await getMyContact();
          await getRemoteContact();
          await getCentralContact();
          await getGroupNotifications(getTotalUnReplied);
          await addImData();

          // await addImData();
          await getCallLogs();
        }, 2000);
        setTimeout(() => {
          setIsLoading(false);
        }, 4000);
      } else {
        document.getElementById("submit-alert").innerHTML = "Enter valid email";
      }
    }
  };

  const getSMSChats = async () => {
    // setLoading(true);
    const token = sessionStorage.getItem("token");
    getSMSChatsAPI(token, sessionStorage.getItem("my_telnyx_num")).then(
      ({ status, data }) => {
        if (status == "success") {
          let exists = {},
            elm,
            elm2,
            arr = [];

          for (let i = 0; i < data.data.data.length; i++) {
            elm = data.data.data[i].to;
            elm2 = data.data.data[i].from;
            if (!exists[elm]) {
              arr.push(elm);
              exists[elm] = true;
            }
            if (!exists[elm2]) {
              arr.push(elm2);
              exists[elm2] = true;
            }
          }
          let demoObj = {};

          for (let j = 0; j < arr.length; j++) {
            demoObj[arr[j]] = [];
            for (let i = 0; i < data.data.data.length; i++) {
              if (data.data.data[i].to === arr[j]) {
                demoObj[arr[j]].push(data.data.data[i]);
              }
              if (data.data.data[i].from === arr[j]) {
                demoObj[arr[j]].push(data.data.data[i]);
              }
            }
          }

          smsdb.remove({}, { multi: true }, function (err, numRemoved) {
            smsdb.insert(demoObj, function (err, newDoc) {
              console.log("login", newDoc);
            });
          });
        } else if (status == "fail") {
          console.log("failed to get sms chats");
        }
      }
    );
    // setLoading(false);
  };

  const addImData = async () => {
    JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
      JSON.parse(sessionStorage.getItem("userInfo")).extension.chat === 1 &&
      (await socket.emit("listConver", {
        email: JSON.parse(sessionStorage.getItem("userInfo")).extension.email,
        token: `Bearer ${sessionStorage.getItem("token")}`,
      }));
    JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
      JSON.parse(sessionStorage.getItem("userInfo")).extension.chat === 1 &&
      (await socket.on("conversations", (data) => {
        console.log("data", data);
        let totalChat = data;
        if (totalChat.length > 0) {
          let arr = [];
          let obj = {};

          totalChat !== null &&
            totalChat.length !== 0 &&
            totalChat.map((i) => {
              obj[i._id] = [];
            });

          totalChat !== null &&
            totalChat.length !== 0 &&
            totalChat.map(async (i) => {
              await socket.emit("getMessageHistory", {
                conver_id: i._id,
              });
              await socket.on("messages", (info) => {
                if (info.length > 0 && info[0].conver_id == i._id) {
                  info.map((j) => {
                    obj[i._id].push(j);
                    obj[i._id].filter(
                      (v, b, a) => a.findIndex((t) => t._id === v._id) === b
                    );
                  });
                }
              });
            });
          console.log("IM db of login");
          instantMessageDb.remove(
            {},
            { multi: true },
            function (err, numRemoved) {
              instantMessageDb.insert(obj, function (err, newDoc) {
                console.log(newDoc);
              });
            }
          );
        }
      }));
  };

  return (
    <div>
      <div className="container-fluid min-vh-100 px-0 d-flex flex-column justify-content-center login-page">
        <div className="row mx-3 d-flex flex-column">
          <div className="col-12 text-center login-logo-div">
            <img src={ezeetelImg} alt="" />
          </div>
          <div className="col-12  form-container text-center ">
            <form
              className="d-flex flex-column align-items-center"
              onSubmit={loginData}
            >
              <div className="d-flex flex-column justify-content-center w-50">
                <div
                  id="submit-alert"
                  className="d-flex justify-content-center fw-bold fs-6 text-danger px-4 py-2"
                >
                  {loginResponse !== null &&
                    (loginResponse.errorMessage !== undefined
                      ? loginResponse.errorMessage
                      : loginResponse.message)}
                </div>

                <input
                  id="email"
                  placeholder="Email"
                  className="login-main-input my-3"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    document.getElementById("submit-alert").innerHTML = "";
                  }}
                />

                <div id="email-alert" className="ps-5"></div>

                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="login-main-input"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    document.getElementById("submit-alert").innerHTML = "";
                  }}
                />
                <div id="password-alert" className="ps-5"></div>
              </div>
              <div className="d-flex justify-content-center">
                <button
                  id="login-button"
                  type="submit"
                  className="submit-button d-flex align-items-center justify-content-center"
                  disabled={isLoading}
                >
                  {isLoading === true ? (
                    <lord-icon
                      src="https://cdn.lordicon.com/dpinvufc.json"
                      trigger="loop"
                      colors="primary:#ffffff,secondary:#08a88a"
                      style={{ width: "50px", height: "50px" }}
                    />
                  ) : (
                    <i className="fas fa-chevron-right submit-icon" />
                  )}
                </button>
              </div>
            </form>
          </div>
          <div className="col d-flex justify-content-center mt-5">
            <span
              className="forgot-password"
              onClick={() => {
                console.log("forgot");
                props.history.push("/forgotPassword");
              }}
            >
              Forgot Password?
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
