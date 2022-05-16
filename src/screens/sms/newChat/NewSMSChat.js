import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../../context/useragent/userContext";
import ContactContext from "../../../context/contact/contactContext";
import axios from "axios";
import DataBase from "nedb";
import path from "path";

import ReactPlayer from "react-player";
import { Modal, Button } from "react-bootstrap";
import Loader from "../../../components/loader/Loader";
import {
  CheckMessages,
  getTotalUnReplied,
  showNameOrNumber,
} from "../../../Constants/Helper";
import {
  CHANGE_SMS_CHAT_STATUS,
  FILE_UPLOAD,
  GET_SMS_CHATS,
  SEND_SMS,
} from "../../../Constants/Api";
import {
  fileUploadAPI,
  getSMSChatsAPI,
  sendSMSMediaAPI,
  sendSMSTextAPI,
} from "../../../Constants/ApiHelper";

const NewSMSChat = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const { getGroupNotifications } = contactContext;
  const [number, setNumber] = useState(
    props.location.state !== undefined
      ? props.location.state.groupNumber !== undefined
        ? props.location.state.replyTo
        : props.location.state.contactNum !== undefined &&
          props.location.state.contactNum !== null
        ? props.location.state.contactNum
        : ""
      : ""
  );

  const [currentMessage, setCurrentMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [search, setSearch] = useState(
    props.location.state !== undefined
      ? props.location.state.groupNumber !== undefined
        ? props.location.state.replyTo
        : props.location.state.contactNum !== undefined &&
          props.location.state.contactNum !== null
        ? showNameOrNumber(props.location.state.contactNum)
        : null
      : null
  );

  const [preview, setPreview] = useState(false);
  const [display, setDisplay] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingText, setSendingText] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  let remote_contacts =
    sessionStorage.getItem("remote_contacts") !== null &&
    sessionStorage.getItem("remote_contacts") !== undefined &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    JSON.parse(sessionStorage.getItem("remote_contacts"))
      ? JSON.parse(sessionStorage.getItem("remote_contacts"))
      : null;
  let my_contacts =
    sessionStorage.getItem("my_contacts") !== null &&
    sessionStorage.getItem("my_contacts") !== undefined &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    JSON.parse(sessionStorage.getItem("my_contacts"))
      ? JSON.parse(sessionStorage.getItem("my_contacts"))
      : null;
  let central_contacts =
    sessionStorage.getItem("central_contacts") !== null &&
    sessionStorage.getItem("central_contacts") !== undefined &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    JSON.parse(sessionStorage.getItem("central_contacts"))
      ? JSON.parse(sessionStorage.getItem("central_contacts"))
      : null;

  useEffect(() => {
    console.log(props.location);
    sessionStorage.setItem("currentNavHeader", "New SMS");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("New SMS");
    setNavSubHeader("");

    var smsdb = new DataBase({
      filename: path.join(__dirname, "/smschats.db"),
      autoload: true,
    });
    smsdb.find({}, function (err, docs) {
      // console.log(docs);
    });
  }, []);

  const sendMessage = async () => {
    if (number.length < 10 || !number.includes("+")) {
      document.getElementById("valid-number-alert").innerHTML =
        "Please enter a valid number. May be you are missing the country code.";
      return "";
    }
    if (number !== "") {
      if (currentMessage !== "" && number !== "") {
        setSendingText(true);
        let dataMessage = `${
          props.location.state !== undefined &&
          props.location.state.groupName !== undefined
            ? props.location.state.groupName
            : ""
        }:"${
          props.location.state !== undefined &&
          props.location.state.groupName !== undefined
            ? props.location.state.text
            : ""
        }" ${currentMessage}`;

        sendSMSTextAPI(
          sessionStorage.getItem("my_telnyx_num"),
          number,
          currentMessage,
          sessionStorage.getItem("telnyx_token")
        ).then(async ({ flag, data }) => {
          if (flag == "success") {
            console.log(data.data.data);
            let date = new Date(data.data.data.received_at);
            let event = new Date();
            let latestDate = JSON.stringify(event);
            latestDate = latestDate.slice(1, 11);
            console.log(latestDate);

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
                  setSendingText(false);
                  setSendingMessage(true);
                  console.log(demoObj[number]);
                  setTimeout(() => {
                    if (demoObj[number] !== undefined) {
                      sessionStorage.setItem(
                        "currentChats",
                        JSON.stringify(demoObj[number])
                      );
                      sessionStorage.setItem("currentMember", number);

                      // setTimeout(() => {
                      setSendingMessage(false);
                      props.history.push({
                        pathname: `/SMSChat/${number}`,
                        state: { chats: demoObj[number] },
                      });
                      // }, 5000);
                    } else if (demoObj[number] == undefined) {
                      setSendingMessage(false);
                      document.getElementById("valid-number-alert").innerHTML =
                        "SMS sent successfully.";
                      setTimeout(() => {
                        props.history.push("/allSMSChats");
                      }, 2000);
                    }
                  }, 10000);
                  setCurrentMessage("");
                }
              }
            );
          } else if (flag == "fail") {
            setSendingText(false);
            console.log(data);
            document.getElementById("valid-number-alert").innerHTML =
              "Some error occurred while sending. Please check the number entered or try again.";
          }
        });
      } else if (currentMessage === "" && number !== "" && media !== null) {
        let token = sessionStorage.getItem("token");

        fileUploadAPI(token, media.documentAsFile).then(
          async ({ flag, res }) => {
            if (flag == "success") {
              sendSMSMediaAPI(
                sessionStorage.getItem("my_telnyx_num"),
                number,
                res.data.data,
                token
              ).then(async ({ flag, data }) => {
                if (flag == "success") {
                  console.log(data.data.data);
                  let date = new Date(data.data.data.received_at);
                  let event = new Date();
                  let latestDate = JSON.stringify(event);
                  latestDate = latestDate.slice(1, 11);
                  console.log(latestDate);

                  const token = sessionStorage.getItem("token");
                  setSending(true);
                  getSMSChatsAPI(
                    token,
                    sessionStorage.getItem("my_telnyx_num")
                  ).then(({ status, data }) => {
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
                      setSendingMessage(true);
                      setTimeout(() => {
                        if (demoObj[number] !== undefined) {
                          sessionStorage.setItem(
                            "currentChats",
                            JSON.stringify(demoObj[number])
                          );
                          sessionStorage.setItem("currentMember", number);
                          setSendingMessage(false);
                          props.history.push({
                            pathname: `/SMSChat/${number}`,
                            state: { chats: demoObj[number] },
                          });
                        } else if (demoObj[number] == undefined) {
                          setSendingMessage(false);
                          document.getElementById(
                            "valid-number-alert"
                          ).innerHTML = "SMS sent successfully.";
                          setTimeout(() => {
                            props.history.push("/allSMSChats");
                          }, 2000);
                        }
                      }, 10000);
                    }
                  });

                  setMedia(null);
                  setSending(false);
                }
              });
            } else if (flag == "fail") {
              document.getElementById("valid-number-alert").innerHTML =
                "Some error occurred while sending. Please check the number entered or try again.";
              setMedia(null);
              setPreview(false);
              setSending(false);
              console.log(res);
            }
          }
        );
      } else if (currentMessage === "" && media == null) {
        document.getElementById("textInput").style.boxShadow =
          "0px 0px 10px 1px #e278f7";
      }
    } else {
      document.getElementById("contactInput").style.boxShadow =
        "0px 0px 10px 1px #e278f7";
      document.getElementById("contactInput").style.borderRadius = "0.3rem";
    }
  };

  const mediaHandler = (e) => {
    if (e.target.files.length > 0) {
      let doc = e.target.files[0];
      if (doc.size <= 5000000) {
        setPreview(true);
        setMedia({
          filePreview: URL.createObjectURL(doc),

          documentAsFile: doc,
        });

        e.target.value = null;
      } else {
        alert("File size should be less than 5 MB");
        e.target.value = null;
      }
    } else {
      setPreview(false);
      setMedia(null);

      e.target.value = null;
    }
  };

  const searchTerm = (num) => {
    let arr = [];
    let val = "";

    num.phoneDetail.map((detail) => {
      arr.push(detail);
    });
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].phone.includes(search)) {
        return { term: num, number: arr[i].phone };
      }
    }
  };

  return (
    <div className="">
      <div className="container-fluid   px-0">
        <div style={{ display: `${preview ? "" : "none"}` }}>
          <Modal
            show={preview}
            // onHide={props.setShow}
            backdrop="static"
            keyboard={false}
            centered
          >
            {/* <Modal.Body>modal body....</Modal.Body> */}
            <div className="text-center fs-5  py-4">
              <span className="fw-bold ms-1 text-center">
                {media !== null &&
                media !== undefined &&
                media.documentAsFile.name.match(/\.(jpeg|jpg|png|gif)$/) !==
                  null ? (
                  <img
                    src={
                      preview && media !== null && media !== undefined
                        ? media.filePreview
                        : ""
                    }
                    alt=""
                    style={{ width: "400px", height: "400px" }}
                  />
                ) : media !== null &&
                  media !== undefined &&
                  media.documentAsFile.name.match(/\.(mp4)$/) !== null ? (
                  // <video width="70%" src={media.documentAsFile} controls />
                  // <ReactVideo src={media.documentAsFile} primaryColor="red" />
                  <ReactPlayer
                    url={media.filePreview}
                    width="100%"
                    height="100%"
                    controls={true}
                  />
                ) : media !== null &&
                  media !== undefined &&
                  media.documentAsFile.name.match(/\.(mp3|wav|ogg)$/) !==
                    null ? (
                  <audio controls>
                    <source src={media.filePreview} />
                  </audio>
                ) : media !== null &&
                  media !== undefined &&
                  media.documentAsFile.name.match(/\.(pdf)$/) !== null ? (
                  <iframe
                    title="document"
                    src={media.filePreview}
                    width="100%"
                    height="500px"
                  ></iframe>
                ) : (
                  media !== null &&
                  media !== undefined &&
                  media.documentAsFile.name
                )}
                {/*  media !== null && media!==undefined && media.documentAsFile.name*/}
              </span>
            </div>
            <Modal.Footer className="py-0">
              <div>
                {media !== null &&
                  media !== undefined &&
                  (media.documentAsFile.name.match(/\.(jpeg|jpg|png|gif)$/) !==
                    null ||
                    media.documentAsFile.name.match(/\.(mp3|wav|ogg)$/) !==
                      null ||
                    media.documentAsFile.name.match(/\.(mp4)$/) !== null ||
                    media.documentAsFile.name.match(/\.(pdf)$/) !== null) &&
                  media.documentAsFile.name}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setMedia(null);
                  setPreview(false);
                  console.log(media);
                }}
              >
                CANCEL
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  sendMessage();
                  console.log(media);
                }}
              >
                {sending ? <Loader width="15px" height="15px" /> : "SEND"}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>

        <div className="row col-12 justify-content-center d-flex ">
          <div className="row mt-4 d-flex px-0 align-items-center">
            {/* <span className="fs-5 col-1">Recipient: </span> */}
            <div className="form-group  mb-2 col-11" id="contactInput">
              <i className="fas fa-search" />
              <input
                placeholder="Search Contact or Enter a number"
                className="form-control border-0 border-bottom "
                style={{ borderRadius: "0px" }}
                value={search}
                onChange={(e) => {
                  setDisplay(true);
                  setSearch(e.target.value);
                  setNumber(e.target.value);
                  document.getElementById("contactInput").style.boxShadow =
                    "none";
                  document.getElementById("contactInput").style.borderRadius =
                    "none";
                  document.getElementById("valid-number-alert").innerHTML = "";
                }}
              />
            </div>
            <span className="col-1">
              <i className="far fa-user" onClick={() => {}} />
            </span>
          </div>
          <div
            className="position-absolute ms-5 ps-4 text-danger mt-1"
            id="valid-number-alert"
            style={{
              top: 80,
            }}
          ></div>
          <div
            className={`position-absolute ${
              display ? "row  d-flex flex-column px-0" : "d-none"
            }`}
            style={{
              left: 25,
              top: 70,
            }}
          >
            {remote_contacts !== null &&
              remote_contacts !== undefined &&
              typeof remote_contacts !== "string" &&
              remote_contacts
                .filter((contact) => {
                  if (
                    search !== null &&
                    search !== "" &&
                    contact.telnyx_phone !== null &&
                    contact.telnyx_phone.toLowerCase().includes(search)
                  ) {
                    return contact;
                  } else if (
                    search !== null &&
                    search !== "" &&
                    contact.telnyx_phone !== null &&
                    contact.name.toLowerCase().includes(search.toLowerCase())
                  ) {
                    return contact;
                  }
                })
                .map((item, index) => {
                  if (
                    item.telnyx_phone !== null &&
                    item.telnyx_phone !==
                      sessionStorage.getItem("my_telnyx_num")
                  ) {
                    return (
                      <div
                        className="border-bottom w-25 py-2 chat-list-item"
                        onClick={() => {
                          setSearch(item.name);
                          setNumber(item.telnyx_phone);
                          setDisplay(false);
                        }}
                      >
                        <span className="me-2 fw-bold">{item.name}:</span>
                        {item.telnyx_phone}
                      </div>
                    );
                  }
                })}

            {my_contacts !== null &&
              my_contacts !== undefined &&
              typeof my_contacts !== "string" &&
              my_contacts
                .filter((term) => {
                  if (
                    search !== null &&
                    search !== "" &&
                    searchTerm(term) !== undefined &&
                    searchTerm(term).term == term
                  ) {
                    return term;
                  } else if (
                    search !== null &&
                    search !== "" &&
                    term.name.toLowerCase().includes(search.toLowerCase())
                  ) {
                    return term;
                  }
                })
                .map((item) => {
                  return (
                    <div
                      className="border-bottom w-25 py-2 chat-list-item"
                      onClick={() => {
                        setSearch(item.name);

                        searchTerm(item) !== undefined
                          ? setNumber(searchTerm(item).number)
                          : setNumber(item.phoneDetail[0].phone);

                        setDisplay(false);
                      }}
                    >
                      <span className="me-2 fw-bold">{item.name}:</span>
                      {item.phoneDetail[0].phone}
                    </div>
                  );
                })}

            {central_contacts !== null &&
              central_contacts !== undefined &&
              typeof central_contacts !== "string" &&
              central_contacts
                .filter((term) => {
                  if (
                    search !== null &&
                    search !== "" &&
                    searchTerm(term) !== undefined &&
                    searchTerm(term).term == term
                  ) {
                    return term;
                  } else if (
                    search !== null &&
                    search !== "" &&
                    term.name.toLowerCase().includes(search.toLowerCase())
                  ) {
                    return term;
                  }
                })
                .map((item) => {
                  return (
                    <div
                      className="border-bottom w-25 py-2 chat-list-item"
                      onClick={() => {
                        setSearch(item.name);

                        searchTerm(item) !== undefined
                          ? setNumber(searchTerm(item).number)
                          : setNumber(item.phoneDetail[0].phone);

                        setDisplay(false);
                      }}
                    >
                      <span className="me-2 fw-bold">{item.name}:</span>
                      {item.phoneDetail[0].phone}
                    </div>
                  );
                })}
          </div>
          {sendingMessage && (
            <div
              id="searching"
              className="d-flex justify-content-center position-absolute"
              style={{ top: "8rem" }}
            >
              <span className="fs-5 mx-2 text-primary">Checking Logs</span>
              <Loader height={40} width={40} />
            </div>
          )}

          <div
            className="row px-2 pb-3   position-relative bg-white bottom-0"
            style={{ marginBottom: "5rem" }}
          ></div>
          <div className="row mt-4 d-flex px-0 align-items-start ">
            <div
              className="col-12 col-lg-12 position-relative justify-content-center d-flex"
              style={{
                position: "fixed",
                top: 360,
              }}
            >
              <span className=" d-flex  align-items-end justify-content-center pb-2   ">
                <label
                  htmlFor="media"
                  className="fas fa-paperclip px-2"
                  // onClick={mediaHandler}
                />
                <input
                  accept=".png, .gif, .jpeg,.pdf,.wav,.mp3,.ogg,.mp4,.m4v,.mov"
                  type="file"
                  id="media"
                  name="image"
                  onChange={mediaHandler}
                  style={{ display: "none" }}
                />
              </span>
              <input
                id="textInput"
                type="text"
                className="search-input mt-5 w-100"
                placeholder="Enter your message"
                value={currentMessage}
                onChange={async (event) => {
                  setCurrentMessage(event.target.value);
                  document.getElementById("textInput").style.boxShadow = "";
                }}
                onKeyPress={(event) => {
                  event.key === "Enter" && sendMessage();
                }}
              />

              <span className=" d-flex  align-items-end pb-2  ">
                {sendingText ? (
                  <Loader height="30px" width="30px" />
                ) : (
                  <i
                    className="fas fa-paper-plane px-2"
                    onClick={() => {
                      sendMessage();
                    }}
                  />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewSMSChat;
