import axios from "axios";
import React, { useReducer, useState, useContext } from "react";
import {
  FORGOT_PASSWORD,
  LOGIN_API,
  SEND_NOTIFICATION,
} from "../../Constants/Api";
import {
  COLLAPSE_SIDEBAR,
  DYNAMIC_DATA_CHANGE,
  LOGIN,
  LOGIN_CHANGE,
  SCREEN_SIZE_CHANGE,
} from "../Types";
import loginContext from "./loginContext";
import loginReducer from "./loginReducer";
import ContactContext from "../contact/contactContext";
import UserContext from "../useragent/userContext";
import log from "../logger/log";
import {
  forgotPasswordAPI,
  loginAPI,
  sendIncomingCallNotificationAPI,
} from "../../Constants/ApiHelper";

const LoginState = (props) => {
  const [isLoading, setIsLoading] = useState(null);

  const initialState = {
    login_response: null,
    collapse_sidebar: false,
    forgot_password: null,

    loginChange: null,
    loaderOnSizeChange: false,
  };

  const [state, dispatch] = useReducer(loginReducer, initialState);

  const userLogin = (email, password, deviceToken, history) => {
    setIsLoading(true);
    loginAPI(email, password, deviceToken).then(({ status, response }) => {
      if (status == "success") {
        sessionStorage.setItem("token", response.data.access_token);
        sessionStorage.setItem("authenticated", true);
        sessionStorage.setItem("userInfo", JSON.stringify(response.data));
        sessionStorage.setItem(
          "connection_id",
          response.data.extension.telnyx_app_id
        );

        sessionStorage.setItem(
          "my_telnyx_num",
          response.data.extension.telnyx_phone
        );
        sessionStorage.setItem(
          "telnyx_token",

          response.data.extension.telnyx_api_key
        );
        response.data.extension.groupName !== null &&
          sessionStorage.setItem(
            "groupNames",
            response.data.extension.groupName
          );
        response.data.extension.groupPhone !== null &&
          sessionStorage.setItem(
            "groupNumbers",
            response.data.extension.groupPhone
          );
        sessionStorage.setItem("userName", response.data.extension.name);
        sessionStorage.setItem("profileImage", response.data.extension.profile);

        log.info(
          "In userLogin Function : API Called Successfully, user log in with correct information!!"
        );
        dispatch({
          type: DYNAMIC_DATA_CHANGE,
          payload: response.data,
        });

        setTimeout(() => {
          history.push("/dashboard");
          setIsLoading(false);
        }, [4000]);
      } else if (status == "fail") {
        log.warn("In userLogin Function : API Called Failed!!", response);

        dispatch({
          type: LOGIN,
          payload: response.response.data,
        });
        setIsLoading(false);
      }
    });
  };

  const collapseSidebar = (collapse_sidebar) => {
    log.info("In collapseSidebar : Change sidebar!!!");

    dispatch({
      type: COLLAPSE_SIDEBAR,
      payload: collapse_sidebar,
    });
  };

  const forgotPassword = async (email) => {
    setIsLoading(true);
    forgotPasswordAPI(email).then(({ status, response }) => {
      if (status == "success") {
        setIsLoading(false);
        dispatch({
          type: FORGOT_PASSWORD,
          payload: "Mail sent successfully.",
        });
        log.info(
          "In forgotPassword Function : Successfully Call forgot password API and send MAIL!!!"
        );
      } else if (status == "fail") {
        log.info(response);
        dispatch({
          type: FORGOT_PASSWORD,
          payload: "some error occurred",
        });
        log.warn(
          "In forgotPassword Function : Failed to Call forgot password API and send MAIL!!!"
        );
      }
    });
  };

  const setForgotText = (forgotText) => {
    log.info("In setForgotText Function : SET FORGOT TEXT !!!");

    dispatch({
      type: FORGOT_PASSWORD,
      payload: forgotText,
    });
  };
  const setLoginText = (loginText) => {
    dispatch({
      type: LOGIN,
      payload: loginText,
    });
  };

  const sendIncomingCallNotification = async (number) => {
    let token = sessionStorage.getItem("token");

    sendIncomingCallNotificationAPI(token, number).then(
      ({ status, response }) => {
        if (status == "success") {
          log.info(
            "In sendIncomingCallNotification Function : Send Incoming Call Notification for ",
            number
          );
        } else if (status == "fail") {
          log.warn(
            "In sendIncomingCallNotification Function : Failed to Incoming Call Notification for ",
            number,
            response
          );
        }
      }
    );
  };

  const loginChangeFun = (data) => {
    dispatch({
      type: LOGIN_CHANGE,
      payload: true,
    });
  };

  const setLoaderOnSizeChange = (data) => {
    log.info("In setLoaderOnSizeChange Function :", data);

    dispatch({
      type: SCREEN_SIZE_CHANGE,
      payload: data,
    });
  };

  return (
    <loginContext.Provider
      value={{
        isLoading,
        login_response: state.login_response,
        collapse_sidebar: state.collapse_sidebar,
        forgot_password: state.forgot_password,
        dynamic_data: state.dynamic_data,
        loginChange: state.loginChange,
        loaderOnSizeChange: state.loaderOnSizeChange,
        userLogin,

        collapseSidebar,
        forgotPassword,
        setForgotText,
        setLoginText,
        setIsLoading,
        sendIncomingCallNotification,
        loginChangeFun,
        setLoaderOnSizeChange,
      }}
    >
      {props.children}
    </loginContext.Provider>
  );
};

export default LoginState;
