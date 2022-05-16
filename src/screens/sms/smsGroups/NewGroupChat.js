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
  CHANGE_PICKUP_STATUS,
  SEND_SMS,
} from "../../../Constants/Api";
import {
  changePickupStatusAPI,
  fileUploadAPI,
  getSMSChatsAPI,
  sendSMSMediaAPI,
  sendSMSTextAPI,
} from "../../../Constants/ApiHelper";

const NewGroupChat = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const { getGroupNotifications } = contactContext;
  let currentGroup = sessionStorage.getItem("currentGroup");
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
  const [smsChats, setSmsChats] = useState({});
  const [dateData, setDateData] = useState([]);
  const [searching, setSearching] = useState(false);
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
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    console.log(props.location);
    sessionStorage.setItem("currentNavHeader", "New Group SMS");
    sessionStorage.setItem("pickup_status", 0);
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("New Group SMS");
    setNavSubHeader("");
    getSMSChats();
  }, []);

  const getSMSChats = () => {
    // setLoading(true);
    const token = sessionStorage.getItem("token");
    getSMSChatsAPI(token, JSON.parse(currentGroup)[0]).then(
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
          // console.log(demoObj);
          setSmsChats(demoObj);

          smsdb.remove({}, { multi: true }, function (err, numRemoved) {
            smsdb.insert(demoObj, function (err, newDoc) {
              // console.log(newDoc);
            });
          });
          // setLoading(false);
          let dataa = [];
          demoObj !== {} &&
            Object.keys(demoObj)
              .filter((k) => k !== `${JSON.parse(currentGroup)[0]}`)
              .map((item, i) => {
                // console.log(item);
                dataa.push({
                  id: demoObj[item][demoObj[item].length - 1].id,
                  number: item,
                  date: demoObj[item][demoObj[item].length - 1].date,
                  chats: demoObj[item],
                });
              });
          // console.log(dataa);
          dataa = dataa
            .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
            .filter(
              (v, i, a) => a.findIndex((t) => t.number === v.number) === i
            );

          dataa = [...new Set(dataa)].sort(function (a, b) {
            var dateA = new Date(a.date),
              dateB = new Date(b.date);
            return dateB - dateA;
          });
          // console.log(dataa);

          setDateData(dataa);
        } else if (status == "fail") {
          console.log(data);
        }
      }
    );
  };

  const sendMessage = async () => {
    if (number !== "") {
      if (currentMessage !== "" && number !== "") {
        let dataMessage = `#${sessionStorage.getItem(
          "userName"
        )}: ${currentMessage}`;
        setSendingText(true);

        sendSMSTextAPI(
          JSON.parse(currentGroup)[0],
          number,
          dataMessage,
          sessionStorage.getItem("telnyx_token")
        ).then(async (res) => {
          if (res.flag == "success") {
            console.log(res.data.data.data);
            let date = new Date(res.data.data.data.received_at);
            let event = new Date();
            let latestDate = JSON.stringify(event);
            latestDate = latestDate.slice(1, 11);
            console.log(latestDate);
            const token = sessionStorage.getItem("token");
            getSMSChatsAPI(token, JSON.parse(currentGroup)[0]).then(
              async ({ status, data }) => {
                if (status == "success") {
                  setSendingMessage(true);
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
                  console.log(demoObj[number]);
                  setTimeout(() => {
                    if (demoObj[number] !== undefined) {
                      changePickupStatusAPI(
                        token,
                        res.data.data.data.id,

                        1,
                        JSON.parse(sessionStorage.getItem("userInfo")).extension
                          .ext_no
                      ).then(async ({ flag, response }) => {
                        if (flag == "success") {
                          console.log(res);
                          await getSMSChats();
                          sessionStorage.setItem(
                            "currentChats",
                            JSON.stringify(demoObj[number])
                          );
                          sessionStorage.setItem("currentMember", number);
                          sessionStorage.setItem("pickup_status", 1);

                          setSendingMessage(false);
                          props.history.push({
                            pathname: `/SMSGroupsChat/${number}`,
                            state: {
                              chats: demoObj[number],
                              group: JSON.parse(currentGroup)[1],
                              groupNumber: JSON.parse(currentGroup)[0],
                            },
                          });
                        } else if (flag == "fail") {
                          console.log(response);
                          document.getElementById(
                            "sms-already-picked"
                          ).innerHTML = "SMS already picked up";
                          setTimeout(() => {
                            document.getElementById(
                              "sms-already-picked"
                            ).innerHTML = "";
                          }, 2000);
                        }
                      });
                    } else if (demoObj[number] == undefined) {
                      document.getElementById("valid-number-alert").innerHTML =
                        "SMS sent successfully.";
                      setSendingMessage(false);
                      setTimeout(() => {
                        if (
                          currentGroup !== null &&
                          currentGroup !== undefined
                        ) {
                          props.history.push(
                            `/SMSGroup/:${JSON.parse(currentGroup)[0]}`
                          );
                        }
                      }, 2000);
                    }
                  }, 10000);
                }
              }
            );

            setCurrentMessage("");
          } else if (res.flag == "fail") {
            setSendingText(false);
            console.log(res.data);
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
                JSON.parse(currentGroup)[0],
                number,
                res.data.data,
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
                  setSending(true);
                  getSMSChatsAPI(token, JSON.parse(currentGroup)[0]).then(
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
                        setTimeout(() => {
                          if (demoObj[number] !== undefined) {
                            changePickupStatusAPI(
                              token,
                              res.data.data.data.id,

                              1,
                              JSON.parse(sessionStorage.getItem("userInfo"))
                                .extension.ext_no
                            ).then(async ({ flag, response }) => {
                              if (flag == "success") {
                                console.log(res);
                                await getSMSChats();
                                sessionStorage.setItem(
                                  "currentChats",
                                  JSON.stringify(demoObj[number])
                                );
                                sessionStorage.setItem("currentMember", number);
                                sessionStorage.setItem("pickup_status", 1);

                                setSendingMessage(false);
                                props.history.push({
                                  pathname: `/SMSGroupsChat/${number}`,
                                  state: {
                                    chats: demoObj[number],
                                    group: JSON.parse(currentGroup)[1],
                                    groupNumber: JSON.parse(currentGroup)[0],
                                  },
                                });
                              } else if (flag == "fail") {
                                console.log(response);
                                document.getElementById(
                                  "sms-already-picked"
                                ).innerHTML = "SMS already picked up";
                                setTimeout(() => {
                                  document.getElementById(
                                    "sms-already-picked"
                                  ).innerHTML = "";
                                }, 2000);
                              }
                            });
                          } else if (demoObj[number] == undefined) {
                            document.getElementById(
                              "valid-number-alert"
                            ).innerHTML = "SMS sent successfully.";
                            setSendingMessage(false);
                            setTimeout(() => {
                              if (
                                currentGroup !== null &&
                                currentGroup !== undefined
                              ) {
                                props.history.push(
                                  `/SMSGroup/:${JSON.parse(currentGroup)[0]}`
                                );
                              }
                            }, 2000);
                          }
                        }, 10000);
                        // if (demoObj[number] !== undefined) {
                        //   sessionStorage.setItem(
                        //     "currentChats",
                        //     JSON.stringify(demoObj[number])
                        //   );
                        //   sessionStorage.setItem("currentMember", number);
                        //   props.history.push({
                        //     pathname: `/SMSChat/${number}`,
                        //     state: { chats: demoObj[number] },
                        //   });
                        // } else if (demoObj[number] == undefined) {
                        //   document.getElementById(
                        //     "valid-number-alert"
                        //   ).innerHTML =
                        //     "SMS sent successfully but failed to get logs.";
                        //   setSendingMessage(false);
                        //   setTimeout(() => {
                        //     if (
                        //       currentGroup !== null &&
                        //       currentGroup !== undefined
                        //     ) {
                        //       props.history.push(
                        //         `/SMSGroup/:${JSON.parse(currentGroup)[0]}`
                        //       );
                        //     }
                        //   }, 2000);
                        // }
                      }
                    }
                  );
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

  const searchForContact = (num) => {
    let flag = 0;
    if (num !== undefined) {
      setSearching(true);
      dateData.map((item) => {
        if (item.number == num) {
          console.log(item.chats);
          sessionStorage.setItem("currentChats", JSON.stringify(item.chats));
          sessionStorage.setItem("currentMember", num);
          console.log({
            chats: item.chats,
            group: JSON.parse(currentGroup)[1],
            groupNumber: JSON.parse(currentGroup)[0],
          });
          flag = 1;
          setTimeout(() => {
            props.history.push({
              pathname: `/SMSGroupsChat/${num}`,
              state: {
                chats: item.chats,
                group: JSON.parse(currentGroup)[1],
                groupNumber: JSON.parse(currentGroup)[0],
              },
            });
          }, 2000);
        }
        setSearching(false);
      });
      if (flag == 0 && document.getElementById("searching") !== null) {
        document.getElementById("searching").innerHTML = "No records found";
        setTimeout(() => {
          document.getElementById("searching").innerHTML = "";
        }, 2000);
        setSearching(false);
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
                  searchForContact(e.target.value);
                  document.getElementById("contactInput").style.boxShadow =
                    "none";
                  document.getElementById("contactInput").style.borderRadius =
                    "none";
                  document.getElementById("valid-number-alert").innerHTML = "";
                }}
              />
            </div>
            <span className="col-1">
              {/* here */}
              <i
                className="far fa-user"
                onClick={() => {
                  searchForContact(number);
                }}
              />
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
                  // console.log(contact);
                  if (
                    search !== null &&
                    search !== undefined &&
                    search !== "" &&
                    contact.telnyx_phone !== null &&
                    contact.telnyx_phone !== undefined &&
                    contact.telnyx_phone.includes(search)
                  ) {
                    return contact;
                  } else if (
                    search !== null &&
                    search !== undefined &&
                    search !== "" &&
                    contact.telnyx_phone !== null &&
                    contact.name !== undefined &&
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
                    search !== undefined &&
                    search !== "" &&
                    searchTerm(term) !== undefined &&
                    searchTerm(term).term == term
                  ) {
                    return term;
                  } else if (
                    search !== null &&
                    search !== undefined &&
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
                    search !== undefined &&
                    search !== "" &&
                    searchTerm(term) !== undefined &&
                    searchTerm(term).term == term
                  ) {
                    return term;
                  } else if (
                    search !== null &&
                    search !== undefined &&
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
              <span className="fs-5 mx-2 text-primary">Starting Chat</span>
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
                  accept=".png,.gif,.jpeg,.pdf,.wav,.mp3,.ogg,.mp4,.m4v,.mov"
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
export default NewGroupChat;
