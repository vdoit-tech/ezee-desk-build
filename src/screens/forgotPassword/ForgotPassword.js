import React, { useContext, useState, useEffect } from "react";
import "../../components/login/Login.css";
import ezeetelImg from "../../assets/imgs/ezeetel-Logo.png";
import LoginContext from "../../context/login/loginContext";
import Loader from "../../components/loader/Loader";
import { FORGOT_PASSWORD } from "../../Constants/Api";
import axios from "axios";
import { forgotPasswordAPI } from "../../Constants/ApiHelper";

const ForgotPassword = (props) => {
  const loginContext = useContext(LoginContext);
  const {
    userLogin,
    login_response,
    isLoading,

    forgot_password,
  } = loginContext;
  const [email, setEmail] = useState("");
  const [responseText, setResponseText] = useState(null);
  const [forgetting, setForgetting] = useState(false);

  const handleSubmit = (e) => {
    // props.history.push("/");
    e.preventDefault();
    if (email === null || email === "") {
      document.getElementById("submit-alert").innerHTML =
        "Email cannot be empty";
    } else if (email !== null || email !== "") {
      let email_format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!email.match(email_format)) {
        document.getElementById("submit-alert").innerHTML = "Enter valid email";
      } else {
        forgotPassword(email);
      }
    }
  };
  useEffect(() => {
    setResponseText(null);
  }, []);

  const forgotPassword = async (email) => {
    setForgetting(true);
    const formData = new FormData();
    formData.append("email", email);

    forgotPasswordAPI(email).then(({ status, response }) => {
      if (status == "success") {
        // log.info(res);
        setResponseText("Mail sent successfully");
        setTimeout(() => {
          setResponseText(null);
        }, 3000);
        setForgetting(false);
      } else if (status == "fail") {
        setResponseText("Some error occurred");
        setTimeout(() => {
          setResponseText(null);
        }, 3000);
      }
    });
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
              onSubmit={handleSubmit}
            >
              <div className="d-flex flex-column justify-content-center w-50">
                <div
                  id="submit-alert"
                  className="d-flex justify-content-center fw-bold fs-6  px-4 py-2"
                >
                  {responseText !== null && responseText}
                </div>

                <input
                  id="email"
                  placeholder="Email"
                  className="login-main-input my-3"
                  value={email}
                  onChange={(e) => {
                    document.getElementById("submit-alert").innerHTML = "";
                    setEmail(e.target.value);
                  }}
                />

                <div id="email-alert" className="ps-5"></div>
              </div>
              <div className="d-flex">
                <div className="d-flex justify-content-center mx-2">
                  <button
                    onClick={() => props.history.push("/")}
                    id="login-button"
                    type="button"
                    className="text-white fs-5 submit-button d-flex align-items-center justify-content-center"
                    disabled={forgetting}
                  >
                    back
                  </button>
                </div>
                <div className="d-flex justify-content-center mx-2">
                  <button
                    id="login-button"
                    type="submit"
                    className="submit-button d-flex align-items-center justify-content-center"
                    disabled={forgetting}
                  >
                    {forgetting === true ? (
                      <Loader width="50px" height="50px" />
                    ) : (
                      <i className="fas fa-chevron-right submit-icon" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
