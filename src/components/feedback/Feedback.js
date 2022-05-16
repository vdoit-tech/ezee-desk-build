import axios from "axios";
import React, { useState, useEffect } from "react";
import "./Feedback.css";
import Loader from "../loader/Loader";
import { EXTENSION_FEEDBACK } from "../../Constants/Api";
import { sendExtensionFeedbackAPI } from "../../Constants/ApiHelper";
import path from "path";
import logsFile from "../../logger.log";

// const path = window.require("path");

const Feedback = () => {
  const [subject, setSubject] = useState("");
  const [enquiry, setEnquiry] = useState("Contacts");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState("");

  //function to send feedback

  const sendFeedback = () => {
    let token = sessionStorage.getItem("token");

    if (subject !== "" && description !== "" && enquiry !== "") {
      setSending(true);
      sendExtensionFeedbackAPI(
        token,
        subject,
        enquiry,
        description,
        image,
        logsFile,
        "windows"
      ).then(({ status, response }) => {
        if (status == "success") {
          console.log(response);
          setSending(false);
          setResponse("Your Query has been successfully sent!!!");
        } else if (response == "fail") {
          console.log(response);
          setSending(false);
          setResponse("Some error occurred");
        }
      });
    }
  };

  //function to handle image
  const ImageHandler = (event) => {
    if (event.target.files.length > 0) {
      let img = event.target.files[0];
      console.log(img);

      setImage(img);
    } else {
      event.target.value = null;
    }
  };
  return (
    <div className="testbox">
      {response !== "" ? (
        <div style={{ padding: "5rem 2rem" }}>
          <span className="fs-5 fw-bold">{response}</span>
        </div>
      ) : (
        <div id="feedback-form" className="w-100 mx-3 my-2">
          <h3> Query Form</h3>
          <h5>
            Subject<span className="text-danger">*</span>
          </h5>
          <input
            className="feedback-input"
            id="feedback-type"
            name="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <h5>
            Enquiry on<span className="text-danger">*</span>
          </h5>
          <select
            className="enquiries"
            id="feedback-on"
            value={enquiry}
            onChange={(e) => setEnquiry(e.target.value)}
          >
            <option value="Contacts">Contacts</option>
            <option value="Calls">Call</option>
            <option value="SMS">SMS</option>
            <option value="IM">IM</option>
            <option value="Efax">E-Fax</option>
          </select>

          <h5>
            Description <span className="text-danger">*</span>
          </h5>

          <textarea
            className="feedback-description"
            rows="5"
            id="feedback-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <h5>upload image if required</h5>
          <input
            type="file"
            id="myImage"
            onChange={ImageHandler}
            accept="image/png, image/jpeg"
          />
          <div className="btn-block">
            <button
              className="submit-feedback"
              id="submit"
              type="submit"
              onClick={() => {
                console.log("abababbabab");
                sendFeedback();
              }}
            >
              {sending ? <Loader height="20px" width="20px" /> : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
