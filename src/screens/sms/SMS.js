import React, { useEffect, useState, useContext, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";

import ReactPlayer from "react-player";
import pdfIcon from "../../assets/imgs/pdf.png";
import "./SMS.css";

import { Modal, Button } from "react-bootstrap";
import Loader from "../../components/loader/Loader";
import {
  download,
  showNameOrNumber,
  CheckMessages,
  getTotalUnReplied,
} from "../../Constants/Helper";
import path from "path";

import DataBase from "nedb";
import {
  CHANGE_SMS_CHAT_STATUS,
  FILE_UPLOAD,
  SEND_SMS,
  SEND_SMS_NOTIFICATION,
} from "../../Constants/Api";
import {
  fileUploadAPI,
  sendSMSMediaAPI,
  sendSMSTextAPI,
} from "../../Constants/ApiHelper";

const ipc = window.require("electron").ipcRenderer;

const SMS = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const { getGroupNotifications } = contactContext;
  const [currentMessage, setCurrentMessage] = useState("");
  const [media, setMedia] = useState(null);

  const [messageList, setMessageList] = useState([]);
  const [messageDemoList, setMessageDemoList] = useState([]);
  const [userNumber, setUserNumber] = useState(
    sessionStorage.getItem("my_telnyx_num")
  );
  const [preview, setPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [incomingArray, setIncomingArray] = useState([]);
  const [outgoingArray, setOutgoingArray] = useState([]);
  const [disappear, setDisappear] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [found, setFound] = useState({});
  const [totalSearches, setTotalSearches] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [displayPdf, setDisplayPdf] = useState(null);

  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    let num = sessionStorage.getItem("currentMember");
    if (showNameOrNumber(num) !== num) {
      sessionStorage.setItem(
        "currentNavHeader",
        `${showNameOrNumber(num)}:${num}`
      );
      setNavHeader(sessionStorage.getItem("currentNavHeader"));

      setNavHeader(`${showNameOrNumber(num)}:${num}`);
    } else {
      sessionStorage.setItem("currentNavHeader", num);
      setNavHeader(sessionStorage.getItem("currentNavHeader"));

      setNavHeader(num);
    }

    setNavSubHeader({
      icon: "fas fa-phone-alt",
      number: `${num}`,
    });
    console.log(JSON.parse(sessionStorage.getItem("currentChats")));
    setMessageList(JSON.parse(sessionStorage.getItem("currentChats")));

    // this gives an object with dates as keys
    const groups = JSON.parse(sessionStorage.getItem("currentChats")).reduce(
      (groups, game) => {
        const date =
          game.date.split(" ").length > 1
            ? game.date.split(" ")[0]
            : game.date.split("T")[0];

        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(game);
        return groups;
      },
      {}
    );

    // Edit: to add it in the array format instead
    const groupArrays = Object.keys(groups).map((date) => {
      return {
        date,
        games: groups[date],
      };
    });

    setMessageDemoList(groupArrays);
    // console.log(props.location.state.chats);
  }, []);

  useEffect(() => {
    let isMount = true;
    if (isMount) {
      ipc.on("notification", function (event, url) {
        // console.log(JSON.parse(url.notification.body).messages);
        if (
          JSON.parse(url.notification.body).from !==
            sessionStorage.getItem("my_telnyx_num") &&
          JSON.parse(url.notification.body).to ==
            sessionStorage.getItem("my_telnyx_num")
        ) {
          setOutgoingArray((list) => {
            let arr = [...list];
            let data = url.data;
            if (
              JSON.parse(url.notification.body).from !==
              sessionStorage.getItem("my_telnyx_num")
            ) {
              arr.push({
                messages: JSON.parse(url.notification.body).messages,
                media: null,
                date: JSON.parse(url.notification.body).date,
                from: JSON.parse(url.notification.body).from,
                to: JSON.parse(url.notification.body).to,
              });
            }

            return arr;
          });
        }

        return null;
      });
    }
    return () => {
      isMount = false;
    };
  }, []);

  const sendMessage = async () => {
    setDisabled(true);

    if (currentMessage !== "" && media === null) {
      sendSMSTextAPI(
        sessionStorage.getItem("my_telnyx_num"),
        sessionStorage.getItem("currentMember"),
        currentMessage,
        sessionStorage.getItem("telnyx_token")
      ).then(async ({ flag, data }) => {
        if (flag == "success") {
          console.log(data.data.data);

          let date = new Date(data.data.data.received_at);
          let event = new Date();
          let latestDate = JSON.stringify(event);

          latestDate = latestDate.slice(1, 11);

          var index = messageDemoList.findIndex((p) => p.date == latestDate);
          console.log(index);

          setOutgoingArray((list) => {
            let arr = [...list];
            arr.push({
              messages: currentMessage,
              media: null,
              date: date.toISOString(),
              from: data.data.data.from.phone_number,
              to: data.data.data.to[0].phone_number,
              message_id: data.data.data.id,
            });
            return arr;
          });

          let currentData = {
            messages: currentMessage,
            media: null,
            date: date.toISOString(),
            from: data.data.data.from.phone_number,
            to: data.data.data.to[0].phone_number,
            message_id: data.data.data,
          };
          console.log("currentChats", [
            ...JSON.parse(sessionStorage.getItem("currentChats")),
            currentData,
          ]);
          sessionStorage.setItem(
            "currentChats",
            JSON.stringify([
              ...JSON.parse(sessionStorage.getItem("currentChats")),
              currentData,
            ])
          );

          let token = sessionStorage.getItem("token");

          setDisappear(true);
          setCurrentMessage("");
          setDisabled(false);
        }
      });
    } else if (currentMessage === "" && media !== null && media !== undefined) {
      setSending(true);
      let token = sessionStorage.getItem("token");

      fileUploadAPI(token, media.documentAsFile).then(async ({ flag, res }) => {
        if (flag == "success") {
          sendSMSMediaAPI(
            sessionStorage.getItem("my_telnyx_num"),
            sessionStorage.getItem("currentMember"),
            res.data.data,
            sessionStorage.getItem("telnyx_token")
          ).then(({ flag, data }) => {
            if (flag == "success") {
              console.log(data.data.data);
              let date = new Date(data.data.data.received_at);
              let event = new Date();
              let latestDate = JSON.stringify(event);
              latestDate = latestDate.slice(1, 11);
              console.log(latestDate);
              var index = messageDemoList.findIndex(
                (p) => p.date == latestDate
              );
              setOutgoingArray((list) => {
                let arr = [...list];
                arr.push({
                  messages: null,
                  media: res.data.data,
                  date: date.toISOString(),
                  from: data.data.data.from.phone_number,
                  to: data.data.data.to[0].phone_number,
                  message_id: data.data.data.id,
                });
                return arr;
              });
              let currentData = {
                messages: null,
                media: res.data.data,
                date: date.toISOString(),
                from: data.data.data.from.phone_number,
                to: data.data.data.to[0].phone_number,
                message_id: data.data.data.id,
              };
              sessionStorage.setItem(
                "currentChats",
                JSON.stringify([
                  ...JSON.parse(sessionStorage.getItem("currentChats")),
                  currentData,
                ])
              );
              setMedia(null);
              setPreview(false);
              setSending(false);
              setDisabled(false);
            } else if (flag == "fail") {
              setSending(false);
              document.getElementById("error-header").classList.add = "d-flex";
              setTimeout(() => {
                document.getElementById("error-header").classList.remove =
                  "d-flex";
              }, 2000);
              console.log(data);
              setDisabled(false);
            }
          });
        } else if (flag == "fail") {
          setSending(false);
        }
      });
    }
  };

  const mediaHandler = async (e) => {
    if (e.target.files.length > 0) {
      console.log(e.target.files, e.target.accept);
      var accepted = e.target.accept.split(",");
      console.log(accepted);
      if (accepted.includes("." + e.target.files[0].name.split(".")[1])) {
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
        alert("File type is not supported");
        e.target.value = null;
        setPreview(false);
        setMedia(null);
      }
    } else {
      setPreview(false);
      setMedia(null);

      e.target.value = null;
    }
  };

  function scrollIt(element) {
    const elm = document.getElementById(element);

    elm.scrollIntoView(false);
  }

  const searchItem = () => {
    let arr = [];
    let current = null;
    messageDemoList.map((item) => {
      item.games.map((game) => {
        if (
          game.messages !== null &&
          game.messages &&
          game.messages.toLowerCase().includes(search.toLowerCase())
        ) {
          console.log(game);

          arr.push(game.id);
          current = game.id;
          scrollIt(game.id);
        }
      });
    });
    search !== null && search !== "" && setTotalSearches(arr.length);

    setFound({ current: current, all: arr });
  };
  const searchUp = () => {
    console.log(found.current, found.all);

    let { current, all } = found;
    all.map((i, index) => {
      if (i == current && index !== 0) {
        console.log(all[index - 1]);
        scrollIt(all[index - 1]);
        setFound({ current: all[index - 1], all: all });
      }
    });
  };
  const searchDown = () => {
    console.log(found.current, found.all);

    let { current, all } = found;
    all.map((i, index) => {
      if (i == current && index !== all.length - 1) {
        console.log(all[index + 1]);
        scrollIt(all[index + 1]);
        setFound({ current: all[index + 1], all: all });
      }
    });
  };

  return (
    <>
      <div
        className="mt-1 position-fixed  w-100 d-flex justify-content-start "
        style={{ zIndex: 500, float: "right" }}
      >
        <span
          className=""
          onClick={() => {
            props.history.goBack();
          }}
        >
          <i className="fas fa-arrow-left fs-5"></i>
        </span>
      </div>
      <ScrollToBottom
        className="chat-window w-100 h-100  position-relative"
        initialScrollBehavior="auto"
      >
        {displayPdf !== null && (
          <Modal
            show={displayPdf !== null}
            backdrop="static"
            keyboard={false}
            centered
          >
            <div className="text-center fs-5  py-4">
              <span className="fw-bold ms-1">
                <iframe
                  title="document"
                  src={displayPdf.url}
                  width="90%"
                  height="500px"
                ></iframe>
              </span>
            </div>
            <Modal.Footer className="py-0">
              <Button
                variant="secondary"
                onClick={() => {
                  setDisplayPdf(null);
                }}
              >
                CLOSE
              </Button>
            </Modal.Footer>
          </Modal>
        )}
        <div
          className="mt-2 position-fixed  w-100 d-flex justify-content-start "
          style={{ position: "relative", zIndex: 500, top: 105, float: "left" }}
        >
          {showSearch ? (
            <div
              style={{
                padding: "0.5rem",
                boxShadow: "0px 0px 3px #868686",
                borderRadius: "0.4rem",
                background: "white",
              }}
            >
              {/* {media !== null && (
              <iframe
                title="document"
                src={media.filePreview.path}
                width="90%"
                height="500px"
              ></iframe>
            )} */}

              <span>
                <i
                  className="fas fa-arrow-left"
                  onClick={() => {
                    setShowSearch(false);
                    setFound({});
                    setSearch("");
                    setTotalSearches(null);
                  }}
                ></i>
              </span>
              {totalSearches !== null && (
                <span className="mx-1">{totalSearches} results</span>
              )}
              <input
                className="mx-2"
                style={{
                  border: "none",
                  borderBottom: "1px solid",
                }}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
              />
              <span className="mx-2">
                <i
                  className="fas fa-search"
                  onClick={() => {
                    searchItem();
                  }}
                ></i>
              </span>
              <span className="mx-2">
                <i className="fas fa-chevron-up" onClick={() => searchUp()}></i>
              </span>
              <span className="mx-2">
                <i
                  className="fas fa-chevron-down"
                  onClick={() => searchDown()}
                ></i>
              </span>
            </div>
          ) : (
            <span
              style={{
                padding: "0.5rem",
                boxShadow: "0px 0px 3px #868686",
                borderRadius: "0.4rem",
                background: "white",
                marginRight: "10rem",
              }}
            >
              <i
                className="fas fa-search"
                onClick={() => setShowSearch(true)}
              ></i>
            </span>
          )}
        </div>
        <div
          id="error-header"
          style={{
            zIndex: 500,
          }}
          className="d-none mt-2 ms-5 position-fixed  w-50 fs-5 p-2  text-danger "
        >
          Some error occurred
        </div>
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
                    width="90%"
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

        <div className="chat-body mb-5 pb-2">
          <div className="message-container mb-5">
            {messageDemoList.map((data, index) => (
              <>
                <div key={data.date} className="text-center my-3">
                  <span className="my-3 header-date-span fw-600 ">
                    {data.date.split(" ")[0]}
                  </span>
                </div>
                {data.games.map((info, infoIndex) => {
                  return userNumber !== info.from ? (
                    <div
                      className={`${
                        info.media === null && info.messages === null
                          ? "d-none"
                          : "row w-100"
                      }`}
                      key={info.message_id}
                    >
                      <div className="d-flex row justify-content-start 2 msg-container ">
                        <div className="d-flex  align-items-start flex-column">
                          <div
                            className="msg_received_container"
                            id={`${info.id}`}
                          >
                            {info.messages !== null ? (
                              // JSON.stringify(info.messages)

                              <span>{info.messages}</span>
                            ) : info.media !== null && media !== undefined ? (
                              info.content_type !== null &&
                              (info.content_type === "image/jpeg" ||
                                info.content_type === "image/png" ||
                                info.content_type === "image/gif") ? (
                                <>
                                  <img
                                    src={info.media}
                                    alt=""
                                    style={{
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                    }}
                                  />
                                  <a
                                    href={info.media}
                                    download
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => download(info.media)}
                                  >
                                    <i className="fa fa-download" />
                                    download
                                  </a>
                                </>
                              ) : info.content_type !== null &&
                                info.content_type ===
                                  ("audio/mp3" ||
                                    "audio/ogg" ||
                                    "audio/amr") ? (
                                <audio
                                  src={info.media}
                                  controls
                                  style={{ display: "block !important" }}
                                />
                              ) : info.content_type !== null &&
                                info.content_type === "video/mp4" ? (
                                // <ReactVideo src={info.media} primaryColor="red" />
                                <ReactPlayer
                                  url={info.media}
                                  width="100%"
                                  height="100%"
                                  controls={true}
                                />
                              ) : info.content_type !== null &&
                                info.content_type === "application/pdf" ? (
                                <div className="row">
                                  <div className="col-12 text-center">
                                    <img
                                      src={pdfIcon}
                                      alt=""
                                      className=""
                                      style={{ height: "50px" }}
                                    />
                                  </div>

                                  <div className="col-12 row">
                                    <div className="col-8 d-flex ">
                                      Document
                                    </div>
                                    <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                                      <i
                                        className="fas fa-eye"
                                        onClick={() => {
                                          // window.open(info.media)
                                          setDisplayPdf({ url: info.media });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div onClick={() => window.open(info.media)}>
                                  {info.media}
                                </div>
                              )
                            ) : (
                              ""
                            )}
                          </div>
                          <span className="ps-4">
                            {`${
                              new Date(info.date)
                                .toLocaleString()
                                .split(", ")[1]
                                .slice(0, -6) +
                              new Date(info.date)
                                .toLocaleString()
                                .split(", ")[1]
                                .slice(-3)
                            }`}

                            <span style={{ paddingLeft: 10 }}></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="row w-100 justify-content-end"
                      key={info.message_id}
                    >
                      <div
                        style={{
                          display: `${
                            info.media === null &&
                            info.messages === null &&
                            "none !important"
                          }`,
                        }}
                        className="d-flex flex-column  justify-content-end mb-2 float-end msg-container  "
                      >
                        <div className="d-flex justify-content-end align-items-end flex-column">
                          <div className="p-1 border-1"></div>
                          <div
                            id={`${info.id}`}
                            className={`${
                              info.media === null && info.messages === null
                                ? "d-none"
                                : "msg_send_container"
                            }`}
                            onClick={() => console.log(info.media)}
                          >
                            {info.messages !== null ? (
                              // info.messages
                              <span>{info.messages}</span>
                            ) : // <CheckMessages message={info.messages} />
                            info.media !== null &&
                              info.media !== undefined &&
                              info.media.match(
                                /^http[^\?]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim
                              ) != null ? (
                              <img
                                src={info.media}
                                alt=""
                                style={{ height: "150px", width: "200px" }}
                              />
                            ) : info.media !== null &&
                              info.media !== undefined &&
                              info.media.match(/\.(mp3|wav|ogg)$/) != null ? (
                              <audio
                                src={info.media}
                                controls
                                style={{ display: "block !important" }}
                              />
                            ) : info.media !== null &&
                              info.media !== undefined &&
                              info.media.match(/\.(mp4|mov|m4v)$/) != null ? (
                              // <ReactVideo src={info.media} primaryColor="red" />
                              <ReactPlayer
                                url={info.media}
                                width="100%"
                                height="100%"
                                controls={true}
                              />
                            ) : info.media !== null &&
                              info.media !== undefined &&
                              info.media.match(/\.(pdf)$/) != null ? (
                              <div className="row">
                                <div className="col-12 text-center">
                                  <img
                                    src={pdfIcon}
                                    alt=""
                                    className=""
                                    style={{ height: "50px" }}
                                  />
                                </div>

                                <div className="col-12 row">
                                  <div className="col-8 d-flex ">Document</div>
                                  <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                                    <i
                                      className="fas fa-eye"
                                      onClick={() => {
                                        // window.open(info.media);
                                        setDisplayPdf({ url: info.media });
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              ""
                            )}
                          </div>
                          <span
                            className={`${
                              info.media === null && info.messages === null
                                ? "d-none"
                                : "ps-4"
                            }`}
                          >
                            {`${
                              new Date(info.date)
                                .toLocaleString()
                                .split(", ")[1]
                                .slice(0, -6) +
                              new Date(info.date)
                                .toLocaleString()
                                .split(", ")[1]
                                .slice(-3)
                            }`}
                            <span style={{ paddingLeft: 10 }}></span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            ))}
            <div>
              {outgoingArray.length > 0 &&
                outgoingArray.map((info, infoIndex) => (
                  <div key={infoIndex}>
                    {info.from === sessionStorage.getItem("my_telnyx_num") ? (
                      <div className="row w-100 justify-content-end">
                        <div className="d-flex flex-column  justify-content-end mb-4 float-end msg-container">
                          <div className="d-flex justify-content-end align-items-end flex-column">
                            <div
                              className={`${
                                info.media === null && info.messages === null
                                  ? "d-none"
                                  : "msg_send_container"
                              }`}
                            >
                              {info.messages !== null ? (
                                <span>{info.messages}</span>
                              ) : info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(
                                  /^http[^\?]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim
                                ) != null ? (
                                <img
                                  src={info.media}
                                  alt=""
                                  style={{ height: "150px", width: "200px" }}
                                />
                              ) : info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(/\.(mp3|wav|ogg)$/) != null ? (
                                <audio
                                  src={info.media}
                                  controls
                                  style={{ display: "block !important" }}
                                />
                              ) : info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(/\.(mp4|mov|m4v)$/) != null ? (
                                // <ReactVideo src={info.media} primaryColor="red" />
                                <ReactPlayer
                                  url={info.media}
                                  width="100%"
                                  height="100%"
                                  controls={true}
                                />
                              ) : info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(/\.(pdf)$/) != null ? (
                                <div className="row">
                                  <div className="col-12 text-center">
                                    <img
                                      src={pdfIcon}
                                      alt=""
                                      className=""
                                      style={{ height: "50px" }}
                                    />
                                  </div>

                                  <div className="col-12 row">
                                    <div className="col-8 d-flex ">
                                      Document
                                    </div>
                                    <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                                      <i
                                        className="fas fa-eye"
                                        onClick={() => {
                                          // window.open(info.media)
                                          setDisplayPdf({ url: info.media });
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                            <span
                              className={`${
                                info.media === null && info.messages === null
                                  ? "d-none"
                                  : "ps-4"
                              }`}
                            >
                              {info.date !== undefined &&
                                `${
                                  new Date(info.date)
                                    .toLocaleString()
                                    .split(", ")[1]
                                    .slice(0, -6) +
                                  new Date(info.date)
                                    .toLocaleString()
                                    .split(", ")[1]
                                    .slice(-3)
                                }`}
                              <span style={{ paddingLeft: 10 }}></span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row w-100 justify-content-start">
                        <div className="d-flex row justify-content-start mb-2 msg-container ">
                          <div className="d-flex  align-items-start flex-column">
                            <div
                              className={`${
                                info.media === null && info.messages === null
                                  ? "d-none"
                                  : "msg_received_container"
                              }`}
                            >
                              {info.messages !== null ? (
                                <span>{info.messages}</span>
                              ) : //
                              info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(
                                  /^http[^\?]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim
                                ) != null ? (
                                <img
                                  src={info.media}
                                  alt=""
                                  style={{ height: "150px", width: "200px" }}
                                />
                              ) : info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(/\.(mp3|wav|ogg)$/) != null ? (
                                <audio
                                  src={info.media}
                                  controls
                                  style={{ display: "block !important" }}
                                />
                              ) : info.media !== null &&
                                info.media !== undefined &&
                                info.media.match(/\.(mp4|mov|m4v)$/) != null ? (
                                // <ReactVideo src={info.media} primaryColor="red" />
                                <ReactPlayer
                                  url={info.media}
                                  width="100%"
                                  height="100%"
                                  controls={true}
                                />
                              ) : (
                                ""
                              )}
                            </div>
                            <span
                              className={`${
                                info.media === null && info.messages === null
                                  ? "d-none"
                                  : "ps-4"
                              }`}
                            >
                              {info.date !== undefined &&
                                `${
                                  new Date(info.date)
                                    .toLocaleString()
                                    .split(", ")[1]
                                    .slice(0, -6) +
                                  new Date(info.date)
                                    .toLocaleString()
                                    .split(", ")[1]
                                    .slice(-3)
                                }`}
                              <span style={{ paddingLeft: 10 }}></span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
            {/* incoming via notifications...... */}
            {/* <div>
            {incomingArray.length > 0 &&
              incomingArray.map((info, infoIndex) => (
                <div
                  className="row w-100 justify-content-start"
                  key={infoIndex}
                >
                  
                </div>
              ))}
          </div> */}
          </div>
        </div>

        <div className="row position-absolute bottom-0 bg-white w-100">
          {/* {props.location.state !== undefined &&
            props.location.state.sms_id !== undefined && (
              <div
                className={`${
                  disappear === false ? "d-flex flex-column ms-2" : "d-none"
                }`}
                style={{
                  padding: "0.3rem 1rem",
                  background: "#bfbfbf",
                  fontSize: "1.2rem",
                  borderRadius: "0.5rem",
                  borderTopLeftRadius: "0",
                  width: "20rem",
                }}
              >
                <span>message from {props.location.state.groupName}:</span>
                <span className="fw-bold">
                  <CheckMessages message={props.location.state.text} />
                 
                </span>
              </div>
            )} */}
          <div className="col-12 d-flex justify-content-end">
            <span className=" d-flex  align-items-center mb-4  ">
              <label
                htmlFor="media"
                className="fas fa-paperclip px-2"
                // onClick={mediaHandler}
              />
              <input
                type="file"
                id="media"
                name="image"
                accept=".png,.gif,.jpeg,.pdf,.wav,.mp3,.ogg,.mp4,.m4v,.mov"
                onChange={mediaHandler}
                style={{ display: "none" }}
              />
            </span>
            <input
              type="text"
              className="search-input mb-4"
              placeholder="Enter your message"
              style={{ width: "100%" }}
              value={currentMessage}
              onChange={async (event) => {
                setCurrentMessage(event.target.value);
              }}
              onKeyPress={(event) => {
                // disabled == false && event.key === "Enter" && sendMessage();
                // props.location.state.text !== undefined
                //   ? console.log(`${props.location.state.text}: ${currentMessage}`)
                //   : console.log(currentMessage);
              }}
            />

            <span className=" d-flex  align-items-center mb-4  ">
              <i
                className="fas fa-paper-plane px-2"
                onClick={() => {
                  disabled == false && sendMessage();
                }}
              />
            </span>
          </div>
        </div>
      </ScrollToBottom>
    </>
  );
};

export default SMS;
