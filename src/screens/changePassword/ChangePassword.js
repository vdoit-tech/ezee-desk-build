import React, { useContext, useState, useEffect } from "react";
import "../../components/login/Login.css";
import ezeetelImg from "../../assets/imgs/ezeetel-Logo.png";
import LoginContext from "../../context/login/loginContext";
import UserContext from "../../context/useragent/userContext";
import Loader from "../../components/loader/Loader";
import "./ChangePassword.css";
import axios from "axios";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { CHANGE_PASSWORD } from "../../Constants/Api";
import { changePasswordAPI } from "../../Constants/ApiHelper";

const ChangePassword = (props) => {
  const loginContext = useContext(LoginContext);
  const userContext = useContext(UserContext);
  // const { userLogOut } = loginContext;
  const { userLogOut } = userContext;
  const history = useHistory();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [passwordVerify, setPasswordVerify] = useState("");

  const changePassword = async () => {
    if (oldPassword == "") {
      document.getElementById("old-password-error").innerHTML =
        "This field cannot be empty";
      setTimeout(() => {
        document.getElementById("old-password-error").innerHTML = "";
      }, 2000);
      return null;
    }

    if (newPassword == "") {
      document.getElementById("new-password-error").innerHTML =
        "This field cannot be empty";
      setTimeout(() => {
        document.getElementById("new-password-error").innerHTML = "";
      }, 2000);
      return null;
    }
    if (passwordVerify == "") {
      document.getElementById("verify-password-error").innerHTML =
        "This field cannot be empty";
      setTimeout(() => {
        document.getElementById("verify-password-error").innerHTML = "";
      }, 2000);
      return null;
    }
    if (passwordVerify !== newPassword) {
      document.getElementById("verify-password-error").innerHTML =
        "Password mismatch.";
      setTimeout(() => {
        document.getElementById("verify-password-error").innerHTML = "";
      }, 2000);
      return null;
    }
    if (
      oldPassword !== "" &&
      newPassword !== "" &&
      passwordVerify !== "" &&
      newPassword == passwordVerify
    ) {
      setChanging(true);
      const token = sessionStorage.getItem("token");

      changePasswordAPI(token, oldPassword, newPassword).then(
        ({ status, response }) => {
          if (status == "success") {
            console.log(response);
            setChanging(false);
            document.getElementById("change-password-error").innerHTML =
              "Password changed Successfully";
            document.getElementById("change-password-error").style.color =
              "green";
            setLoggingOut(true);
            setTimeout(() => {
              document.getElementById("change-password-error").innerHTML = "";
              userLogOut(history);
              setLoggingOut(false);
            }, 2000);
          } else if (status == "fail") {
            setChanging(false);
            document.getElementById("change-password-error").innerHTML =
              "Error while changing password. Please Try Again.";
            document.getElementById("change-password-error").style.color =
              "red";
            setTimeout(() => {
              document.getElementById("change-password-error").innerHTML = "";
            }, 2000);
            console.error(response);
          }
        }
      );
    }
  };

  return (
    <div className="testbox">
      <div id="feedback-form" className="w-100 mx-3 my-2">
        <h4 className="text-center">Change Password</h4>
        <div className="mt-2">
          <span id="old-password-error" className="text-danger"></span>
          <h6>Old Password</h6>
          <input
            className="feedback-input"
            id="old-password"
            name="old-password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className="mt-2">
          <span id="new-password-error" className="text-danger"></span>
          <h6>New Password</h6>
          <input
            className="feedback-input"
            id="new-password"
            name="new-password"
            value={newPassword}
            type="password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mt-2">
          <span id="verify-password-error" className="text-danger"></span>
          <h6>Re-enter New Password</h6>
          <input
            className="feedback-input"
            id="verify-password"
            name="verify-password"
            value={passwordVerify}
            type="password"
            onChange={(e) => setPasswordVerify(e.target.value)}
          />
        </div>

        <div className="btn-block d-flex flex-column justify-content-center align-items-center">
          <span id="change-password-error" className="my-2"></span>
          <button
            className="submit-feedback"
            id="submit"
            disabled={changing || loggingOut}
            onClick={() => changePassword()}
          >
            {changing ? (
              <span className="d-flex align-items-center justify-content-center">
                <Loader height="50" width="50" />
              </span>
            ) : loggingOut ? (
              <span className="d-flex align-items-center justify-content-center">
                Logging out..
              </span>
            ) : (
              "Set Password"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
