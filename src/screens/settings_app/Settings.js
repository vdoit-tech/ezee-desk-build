import React from "react";
import logo from "../../assets/imgs/icnkeypad.ico";
import sample from "../../assets/imgs/person.jfif";
import "./Settings.css";

function Settings() {
  return (
    <div className="Login">
      <div className="container-fluid h-100 ">
        <div
          className="h-100 d-flex flex-column align-items-center justify-content-center"
          style={{ margin: "auto" }}
        >
          <div className="row main-div d-flex flex-column align-items-center justify-content-center">
            <div className="row d-flex flex-column align-items-center justify-content-center">
              <div>
                <img
                  alt=""
                  src={sample}
                  style={{
                    width: "10rem",
                    height: "10rem",
                    border: "1px solid gray",
                    borderRadius: "50%",
                    boxShadow: "0px 3px 5px rgb(44, 44, 44,0.4)",
                  }}
                ></img>
              </div>
              <div>
                <div
                  style={{ fontSize: "1.5rem", color: "#fff" }}
                  className="mt-4"
                >
                  <span>John</span>
                  <span>Doe</span>
                </div>
                <div></div>
                <span
                  className="d-flex justify-content-center"
                  style={{ fontSize: "1.2rem", color: "#fff" }}
                >
                  1002
                </span>
              </div>
            </div>

            <div
              className="row d-flex flex-column align-items-center justify-content-center mb-2"
              style={{ width: "100%", marginTtop: "5rem" }}
            >
              <div className="row">
                <div className="col-4">
                  <span className="icon">
                    <img
                      alt=""
                      src={logo}
                      style={{ height: "40px", width: "40px" }}
                    ></img>
                  </span>
                </div>
                <div className="col-4 icon-div">
                  <span className="">
                    <i className="fas fa-volume-up icon"></i>
                  </span>
                </div>
                <div className="col-4">
                  <span>
                    <i className="fas fa-microphone-slash icon"></i>
                  </span>
                </div>
              </div>
              <div className="row">
                <div className="col-6" style={{ padding: "0 !important" }}>
                  <span>
                    <i className="fas fa-phone-volume icon"></i>
                  </span>
                </div>
                <div className="col-6" style={{ padding: "0 !important" }}>
                  <span>
                    <i className="fas fa-pause icon"></i>
                  </span>
                </div>
              </div>
            </div>
            <div
              className="row d-flex justify-content-center align-items-center"
              style={{ marginTop: "3rem" }}
            >
              <span
                id="cancel"
                style={{
                  height: "5rem",
                  width: "5rem",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1.6rem",
                  color: "#fff",
                  backgroundColor: "rgb(253, 14, 14)",
                }}
                className="d-flex justify-content-center align-items-center"
              >
                <i className="fas fa-phone-slash"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
