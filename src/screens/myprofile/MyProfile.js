import React, { useContext, useEffect, useState } from "react";
// import sample from "../../assets/imgs/person.jfif";
import defaultPic from "../../assets/imgs/default-profile.png";
import "./MyProfile.css";
import Incoming from "../incoming/Incoming";
import UserContext from "../../context/useragent/userContext";
import axios from "axios";
import Loader from "../../components/loader/Loader";
import PopUp from "../../components/popup/PopUp";
import { Modal, Button } from "react-bootstrap";
import ChangePassword from "../changePassword/ChangePassword";
import { EDIT_PROFILE } from "../../Constants/Api";
import { updateProfileAPI } from "../../Constants/ApiHelper";

const MyProfile = (props) => {
  const userContext = useContext(UserContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const details = JSON.parse(sessionStorage.getItem("userInfo"));
  const [image, setImage] = useState(null);
  const [pic, setPic] = useState(
    sessionStorage.getItem("profileImage") !== null &&
      sessionStorage.getItem("profileImage") !== undefined &&
      sessionStorage.getItem("profileImage")
  );
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState({ text: "", color: "text-success" });
  const [change, setChange] = useState(false);

  const ImageHandler = (event) => {
    if (event.target.files.length > 0) {
      let img = event.target.files[0];
      if (img.size <= 500000) {
        setPic(URL.createObjectURL(img));
        setImage(img);
        event.target.value = null;
      } else {
        alert("Image size too large. Select image less than 5 MB");
      }
    } else {
      event.target.value = null;
    }
  };
  const updateProfile = async (photo) => {
    setLoading(true);

    let token = sessionStorage.getItem("token");
    updateProfileAPI(token, photo).then(({ status, response }) => {
      if (status == "success") {
        console.log(response);
        setLoading(false);
        setResponse({ text: "Updated Successfully", color: "text-success" });

        sessionStorage.setItem("profileImage", response.data.path);
        setTimeout(() => {
          setResponse({ text: "", color: "text-success" });
        }, 5000);
      } else if (status == "fail") {
        console.log(response);
        setLoading(false);
        setResponse({ text: "Failed to upload image", color: "text-danger" });

        setTimeout(() => {
          // setResponse({ text: "", color: "text-success" });
          setPic(
            sessionStorage.getItem("profileImage") !== null &&
              sessionStorage.getItem("profileImage") !== undefined &&
              sessionStorage.getItem("profileImage")
          );
        }, 5000);
      }
    });
  };
  useEffect(() => {
    setNavSubHeader("");
    sessionStorage.setItem("currentNavHeader", "My Profile");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("My Profile");
  }, []);

  return (
    <div className="container">
      <div className="row mt-2 pt-3">
        {change && (
          <Modal
            show={change}
            // onHide={props.setShow}
            backdrop="static"
            keyboard={false}
            centered
          >
            <div className="d-flex justify-content-end">
              <i
                className="fas fa-times fs-4 mx-3 my-2"
                onClick={() => setChange(false)}
              ></i>
            </div>

            <ChangePassword />
          </Modal>
        )}
        <div className="col-8 d-flex flex-column justify-content-center">
          <div className="row">
            <div className="col">
              <label for="name" className="ps-1 mt-2 fs-5 fw-bold">
                Name
              </label>

              <div
                id="name"
                className="my-2 ms-1"
                style={{ borderBottom: "1px solid gray" }}
              >
                {details != null && details.extension.name}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <label for="username" className="ps-1 mt-2 fs-5 fw-bold">
                Username
              </label>
              <div
                id="username"
                className="my-2 ms-1"
                style={{ borderBottom: "1px solid gray" }}
              >
                {details != null && details.extension.username}
              </div>
            </div>
          </div>
          {details != null && details.extension.ext_no !== null && (
            <div className="row">
              <div className="col">
                <label for="extension" className="ps-1 mt-2 fs-5 fw-bold">
                  Extension Number
                </label>
                <div
                  id="extension"
                  className="my-2 ms-1"
                  style={{ borderBottom: "1px solid gray" }}
                >
                  {details != null && details.extension.ext_no}
                </div>
              </div>
            </div>
          )}

          <div className="row">
            <div className="col">
              <label for="email" className="ps-1 mt-2 fs-5 fw-bold">
                Email
              </label>
              <div
                id="email"
                className="my-2 ms-1"
                style={{ borderBottom: "1px solid gray" }}
              >
                {details != null && details.extension.email}
              </div>
            </div>
          </div>
          {details != null && details.extension.telnyx_phone !== null && (
            <div className="row">
              <div className="col">
                <label for="telnyx" className="ps-1 mt-2 fs-5 fw-bold">
                  SMS Number
                </label>
                <div
                  id="telnyx"
                  className="my-2 ms-1"
                  style={{ borderBottom: "1px solid gray" }}
                >
                  {details != null && details.extension.telnyx_phone}
                </div>
              </div>
            </div>
          )}
          {sessionStorage.getItem("groupNumbers") !== null &&
            sessionStorage.getItem("groupNumbers") !== undefined && (
              <div className="row">
                <div className="col">
                  <label for="groups" className="ps-1 mt-2 fs-5 fw-bold">
                    Groups
                  </label>

                  {details != null &&
                    details.extension.groupName !== null &&
                    details != null &&
                    details.extension.groupName.map((i, index) => {
                      let groupNumbers =
                        details != null && details.extension.groupPhone;
                      return (
                        <div
                          key={groupNumbers[index]}
                          style={{
                            padding: "0.5rem 0.3rem",
                            borderBottom: "1px solid gray",

                            margin: "0.5rem 0rem",
                          }}
                        >
                          <span className="fw-bold me-1">{i}</span>:
                          <span className="ms-1">{groupNumbers[index]}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          <span
            style={{
              padding: "0.5rem",
              margin: "1rem 0rem",
              cursor: "pointer",
            }}
            className="fw-bold text-secondary"
            onClick={() => setChange(true)}
          >
            Change Password
          </span>
        </div>
        <div className="col-4 row mt-2 ">
          <div className="d-flex flex-column ps-2">
            <h6>Profile Photo</h6>
            <img
              className="mt-1"
              alt=""
              src={pic === "null" || pic === null ? defaultPic : pic}
              style={{
                width: "8rem",
                height: "8rem",
                // border: "1px solid gray gray",
                borderRadius: "50%",
                // boxShadow: "0px 3px 5px rgb(44, 44, 44,0.4)",
              }}
            />
            <label
              htmlFor="file-input"
              style={{
                width: "8rem",
                boxShadow: "0 0 2px rgb(0 0 0)",
                cursor: "pointer",
              }}
              className="text-center p-1 my-2 border border-secondary border-1 bg-white"
            >
              Upload an Image
            </label>
            <div style={{ marginBottom: "3rem" }}>
              <button
                className=" btn btn-success rounded-pill text-center p-1 px-3 my-2 "
                // className="btn btn-success rounded-pill px-4 mx-1 "
                onClick={() => updateProfile(image)}
              >
                {image !== null && loading ? (
                  <Loader width="30px" height="30px" />
                ) : (
                  " Save Changes"
                )}
              </button>
              {response.text !== "" && (
                <PopUp
                  show={response !== "" ? true : false}
                  handleClose={() =>
                    setResponse({ text: "", color: "text-success" })
                  }
                  message={response.text}
                  color={response.color}
                />
              )}
            </div>
            {/* <label
              style={{ width: "8rem", color: "#ee5253", cursor: "pointer" }}
              className="text-center fw-bold fs-6"
              onClick={() => {
                setPic(null);
                setImage("null");
              }}
            >
              Remove photo
            </label> */}
          </div>
          <input
            type="file"
            id="file-input"
            onChange={ImageHandler}
            accept="image/png, image/jpeg"
            style={{ display: "none" }}
          />
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
