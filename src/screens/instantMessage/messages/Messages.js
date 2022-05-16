import React, { useEffect, useState, useContext } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { v4 as uuidv4 } from "uuid";
import "./Messages.css";
import axios from "axios";
import UserContext from "../../../context/useragent/userContext";
import { Dropdown, Menu } from "antd";
import { useParams, useHistory } from "react-router-dom";
import { socket } from "../../../App";
import DataBase from "nedb";
import path from "path";
import moment from "moment";
import { userInfo } from "os";
import { FILE_UPLOAD } from "../../../Constants/Api";

const Messages = (props) => {
  const userContext = useContext(UserContext);
  const { setNavHeader, setNavSubHeader, sessionInfo } = userContext;
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isTyping, setIsTyping] = useState(null);
  const [replyData, setReplyData] = useState("");
  const [reply, setReply] = useState(false);
  const history = useHistory();
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  let { id, heading, isGroup } = useParams();
  var instantMessageDb = new DataBase({
    filename: path.join(__dirname, "/instantMessageDb.db"),
    autoload: true,
  });

  useEffect(() => {
    // console.log(heading);
    // console.log(props.history.location.state.userInfo);
    let isMounted = true;
    if (isMounted) {
      if (messageList.length === 0) {
        sessionStorage.setItem("currentNavHeader", heading);
        setNavHeader(sessionStorage.getItem("currentNavHeader"));
        setNavHeader(heading);
        setNavSubHeader("");
        socket.emit("getMessageHistory", {
          conver_id: id,
        });
        socket.emit("openConversation", {
          converid: id,
        });

        socket.on("messages", (info) => {
          let chatData = info;
          // console.log(info);
          setMessageList(chatData);
          socket.emit("joinedConver", {
            conver_id: id,
          });
          // console.log(heading);
          // console.log(props.history.location.state);
        });
      }
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const changeHandler = (event) => {
    console.log(event.target.files[0]);
    let type = event.target.files[0].type;
    const token = sessionStorage.getItem("token");
    let data = new FormData();
    data.append("file", event.target.files[0]);
    try {
      axios
        .post(FILE_UPLOAD, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(async (res) => {
          // console.log(res.data);
          let messageData = {
            _id: uuidv4(),
            sender_id: uuidv4(),
            sender_ext_no: JSON.parse(sessionStorage.getItem("userInfo"))
              .extension.ext_no,
            sender_email: JSON.parse(sessionStorage.getItem("userInfo"))
              .extension.email,
            sender_name: JSON.parse(sessionStorage.getItem("userInfo"))
              .extension.name,
            receiver_id: "",
            receiver_ext_no: "",
            receiver_email: "",
            receiver_name: "",
            message: res.data.data,
            type: type,

            timestamp:
              new Date().toLocaleString().split(", ")[0].replaceAll("/", "-") +
              " " +
              new Date().toLocaleString().split(", ")[1],
            conver_id: id,
            isRead: false,
            isReply: reply,
            isDelivered: false,
            reply_messageObj: replyData,
            is_Group: isGroup,
          };
          console.log(messageData);
          await socket.emit(
            "sendMessage",
            messageData,
            function (confirmation) {
              // send data
              // know we got it once the server calls this callback
              // note -in this ex we dont need to send back any data
              // - could just have called fn() at server side
              console.log(confirmation);
            }
          );
        });
    } catch (error) {
      console.log(error);
    }
    event.target.value = null;
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      let messageData = {
        _id: uuidv4(),
        sender_id: uuidv4(),
        sender_ext_no: JSON.parse(sessionStorage.getItem("userInfo")).extension
          .ext_no,
        sender_email: JSON.parse(sessionStorage.getItem("userInfo")).extension
          .email,
        sender_name: JSON.parse(sessionStorage.getItem("userInfo")).extension
          .name,
        receiver_id: "",
        receiver_ext_no: "",
        receiver_email: "",
        receiver_name: "",
        message: currentMessage,
        type: "text",
        timestamp:
          new Date().toLocaleString().split(", ")[0].replaceAll("/", "-") +
          " " +
          new Date().toLocaleString().split(", ")[1],
        conver_id: id,
        isRead: false,
        isReply: reply,
        isDelivered: false,
        reply_messageObj: replyData,
        is_Group: isGroup,
      };

      console.log(messageData);
      instantMessageDb.find({}, function (err, docs) {
        let data = docs[0];
        // console.log(data);
        if (data !== undefined) {
          if (data[id] === undefined) {
            data[id] = [messageData];
          } else {
            data[id] = [messageData, ...data[id]];
          }
        }

        instantMessageDb.remove(
          {},
          { multi: true },
          function (err, numRemoved) {
            instantMessageDb.insert(data, function (err, newDoc) {
              console.log("IM db updated");
              console.log(docs);
            });
          }
        );
      });
      await socket.emit("sendMessage", messageData);
      // setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
    setReply(false);
    setReplyData("");
  };

  useEffect(() => {
    console.log(props.history);
    // let info = props.history.location.state.userInfo;
    socket.on("message_receive", (data) => {
      console.log(data);
      if (
        data.sender_email ==
        JSON.parse(sessionStorage.getItem("userInfo")).extension.email
      ) {
        socket.emit("openConversation", {
          converid: id,
        });
        setMessageList((list) => [...list, data]);
      } else if (isGroup == true) {
        let flag = 0;
        console.log(data);
        // props.history.location.state.email.map((i) => {
        //   if (i.email == data.sender_email) {
        //     flag = 1;
        //   }
        // });
        flag == 1 && setMessageList((list) => [...list, data]);
        flag == 1 &&
          instantMessageDb.find({}, function (err, docs) {
            let imData = docs[0];
            // console.log(data);
            if (imData !== undefined) {
              if (imData[id] === undefined) {
                imData[id] = [data];
              } else {
                imData[id] = [data, ...imData[id]];
              }
            }

            instantMessageDb.remove(
              {},
              { multi: true },
              function (err, numRemoved) {
                instantMessageDb.insert(data, function (err, newDoc) {
                  console.log("IM received db updated");
                  console.log(docs);
                });
              }
            );
          });
      } else if (data.conver_id == id) {
        console.log(isGroup);
        // if (props.history.location.state.email == data.sender_email) {
        socket.emit("openConversation", {
          converid: id,
        });
        setMessageList((list) => [...list, data]);

        instantMessageDb.find({}, function (err, docs) {
          let imData = docs[0];
          // console.log(data);
          if (imData !== undefined) {
            if (imData[id] === undefined) {
              imData[id] = [data];
            } else {
              imData[id] = [data, ...imData[id]];
            }
          }

          instantMessageDb.remove(
            {},
            { multi: true },
            function (err, numRemoved) {
              instantMessageDb.insert(data, function (err, newDoc) {
                console.log("IM received db updated");
                console.log(docs);
              });
            }
          );
        });
        // }
      }

      console.log(data);
    });
    socket.on("isTyping", (data) => {
      if (
        data != JSON.parse(sessionStorage.getItem("userInfo")).extension.name
      ) {
        setIsTyping(`${data} is typing`);
        setTimeout(() => {
          setIsTyping(null);
        }, [1000]);
      }
    });
  }, [socket]);

  const download = (url) => {
    var element = document.createElement("a");
    var file = new Blob([url], { type: "image/*" });
    element.href = URL.createObjectURL(file);
    element.download = "image.jpg";
    element.click();
  };

  return (
    <>
      <ScrollToBottom className="chat-window w-100 h-100">
        <div className="chat-header"></div>
        <div className="chat-body">
          <div className="message-container" style={{ paddingTop: 100 }}>
            {messageList.length !== 0
              ? messageList.map((messageContent) => {
                  return JSON.parse(sessionStorage.getItem("userInfo"))
                    .extension.email !== messageContent.sender_email ? (
                    <div
                      className="row w-100"
                      id={messageContent._id}
                      key={messageContent._id}
                      onClick={() => console.log(`#${messageContent._id}`)}
                      style={{ scrollMargin: 200 }}
                    >
                      <div className="d-flex row justify-content-start mb-4 msg-container">
                        <div>
                          {/* <div id={messageContent._id}>
                            {messageContent._id}
                          </div> */}
                          <div className="msg_received_container d-flex align-items-center justify-content-between">
                            {messageContent.isReply && (
                              <div
                                style={{
                                  borderTopLeftRadius: 5,
                                  borderTopRightRadius: 5,
                                  background: "lightgrey",
                                  paddingLeft: 5,
                                }}
                                onClick={() => {
                                  document
                                    .getElementById(
                                      messageContent.reply_messageObj._id
                                    )
                                    .scrollIntoView({
                                      block: "start",
                                      behavior: "smooth",
                                    });
                                }}
                              >
                                {messageContent.reply_messageObj.message.match(
                                  /\.(jpeg|jpg|gif|png)$/
                                ) ? (
                                  <img
                                    src={
                                      messageContent.reply_messageObj.message
                                    }
                                    alt=""
                                    style={{
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                    }}
                                  />
                                ) : messageContent.reply_messageObj.message.match(
                                    /\.(mp4|ogg|webm)$/
                                  ) ? (
                                  <video
                                    style={{
                                      maxHeight: "100%",
                                      maxWidth: "100%",
                                    }}
                                    controls
                                  >
                                    <source
                                      src={
                                        messageContent.reply_messageObj.message
                                      }
                                    />
                                  </video>
                                ) : messageContent.reply_messageObj.message.match(
                                    /\.(pdf)$/
                                  ) ? (
                                  <iframe
                                    src={
                                      messageContent.reply_messageObj.message
                                    }
                                    title={
                                      messageContent.reply_messageObj.message
                                    }
                                    style={{
                                      maxWidth: "100%",
                                      maxHeight: "100%",
                                      overflow: "hidden",
                                    }}
                                  />
                                ) : messageContent.reply_messageObj.message.match(
                                    /\.(mp3|wav|ogg)$/
                                  ) ? (
                                  <audio
                                    style={{
                                      maxWidth: "104%",
                                      maxHeight: "40%",
                                    }}
                                    controls
                                  >
                                    <source
                                      src={
                                        messageContent.reply_messageObj.message
                                      }
                                    />
                                  </audio>
                                ) : (
                                  <span>
                                    {messageContent.reply_messageObj.message}
                                  </span>
                                )}
                              </div>
                            )}
                            {messageContent.message.match(
                              /\.(jpeg|jpg|gif|png)$/
                            ) ? (
                              <img
                                src={messageContent.message}
                                alt=""
                                style={{ maxHeight: "100%", maxWidth: "100%" }}
                              />
                            ) : messageContent.message.match(
                                /\.(mp4|ogg|webm)$/
                              ) ? (
                              <video
                                style={{ maxHeight: "100%", maxWidth: "100%" }}
                                controls
                              >
                                <source src={messageContent.message} />
                              </video>
                            ) : messageContent.message.match(/\.(pdf)$/) ? (
                              <iframe
                                src={messageContent.message}
                                title={messageContent.message}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  overflow: "hidden",
                                }}
                              />
                            ) : messageContent.message.match(
                                /\.(mp3|wav|ogg)$/
                              ) ? (
                              <audio
                                style={{ maxWidth: "104%", maxHeight: "40%" }}
                                controls
                              >
                                <source src={messageContent.message} />
                              </audio>
                            ) : (
                              <span>{messageContent.message}</span>
                            )}

                            <Dropdown
                              overlay={
                                <Menu style={{ minWidth: 100 }}>
                                  {!messageContent.message.match(
                                    /\.(jpeg|jpg|gif|png)$/
                                  ) && (
                                    <Menu.Item
                                      key="1"
                                      onClick={() => {
                                        console.log(messageContent);
                                        setReplyData(messageContent);
                                        setReply(true);
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "row",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                        }}
                                      >
                                        <span>Reply</span>
                                      </div>
                                    </Menu.Item>
                                  )}
                                  <Menu.Item key="2">
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                      onClick={() => {
                                        history.push({
                                          pathname: "/modalConversations",
                                          state: {
                                            message: messageContent.message,
                                            socket: socket,
                                            converId: id,
                                          },
                                        });
                                      }}
                                    >
                                      <span>Forward</span>
                                      {/* <i className="fas fa-forward"></i> */}
                                    </div>
                                  </Menu.Item>
                                </Menu>
                              }
                              trigger={["click"]}
                              className="float-start"
                            >
                              <span className="my-2 me-2">
                                <i className="fas fa-ellipsis-v"></i>
                              </span>
                            </Dropdown>
                          </div>
                          <span className="ps-4">
                            {moment(messageContent.timestamp).format("hh:mm A")}
                            <span style={{ paddingLeft: 10 }}>
                              {messageContent.sender_name}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="row w-100  justify-content-end"
                      id={messageContent._id}
                      key={messageContent._id}
                      style={{ scrollMargin: 200 }}
                    >
                      <div className="d-flex flex-column justify-content-end mb-4 float-end msg-container ">
                        {/* <div id={messageContent._id}>{messageContent._id}</div> */}
                        <div className="msg_send_container">
                          {messageContent.isReply && (
                            <div
                              style={{
                                borderTopLeftRadius: 5,
                                borderTopRightRadius: 5,
                                background: "lightgrey",
                                paddingLeft: 5,
                              }}
                              onClick={() => {
                                console.log(messageContent);
                                var element = document.getElementById(
                                  messageContent.reply_messageObj._id
                                );
                                element.scrollIntoView({
                                  block: "start",
                                  behavior: "smooth",
                                });
                              }}
                            >
                              {messageContent.reply_messageObj.message.match(
                                /\.(jpeg|jpg|gif|png)$/
                              ) ? (
                                <img
                                  src={messageContent.reply_messageObj.message}
                                  alt=""
                                  style={{
                                    maxHeight: "100%",
                                    maxWidth: "100%",
                                  }}
                                />
                              ) : messageContent.reply_messageObj.message.match(
                                  /\.(mp4|ogg|webm)$/
                                ) ? (
                                <video
                                  style={{
                                    maxHeight: "100%",
                                    maxWidth: "100%",
                                  }}
                                  controls
                                >
                                  <source
                                    src={
                                      messageContent.reply_messageObj.message
                                    }
                                  />
                                </video>
                              ) : messageContent.reply_messageObj.message.match(
                                  /\.(pdf)$/
                                ) ? (
                                <iframe
                                  src={messageContent.reply_messageObj.message}
                                  title={
                                    messageContent.reply_messageObj.message
                                  }
                                  style={{
                                    maxWidth: "100%",
                                    maxHeight: "100%",
                                    overflow: "hidden",
                                  }}
                                />
                              ) : messageContent.reply_messageObj.message.match(
                                  /\.(mp3|wav|ogg)$/
                                ) ? (
                                <audio
                                  style={{ maxWidth: "104%", maxHeight: "40%" }}
                                  controls
                                >
                                  <source
                                    src={
                                      messageContent.reply_messageObj.message
                                    }
                                  />
                                </audio>
                              ) : (
                                <span>
                                  {messageContent.reply_messageObj.message}
                                </span>
                              )}
                            </div>
                          )}
                          {messageContent.message.match(
                            /\.(jpeg|jpg|gif|png)$/
                          ) ? (
                            <>
                              <img
                                src={messageContent.message}
                                alt=""
                                style={{ maxHeight: "100%", maxWidth: "100%" }}
                              />
                              <a
                                href={messageContent.message}
                                download
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => download(messageContent.message)}
                              >
                                <i className="fa fa-download" />
                                download
                              </a>
                            </>
                          ) : messageContent.message.match(
                              /\.(mp4|ogg|webm)$/
                            ) ? (
                            <>
                              <video
                                style={{ maxHeight: "100%", maxWidth: "100%" }}
                                controls
                              >
                                <source src={messageContent.message} />
                              </video>
                            </>
                          ) : messageContent.message.match(
                              /\.(mp3|wav|ogg)$/
                            ) ? (
                            <audio
                              style={{ maxWidth: "104%", maxHeight: "40%" }}
                              controls
                            >
                              <source src={messageContent.message} />
                            </audio>
                          ) : messageContent.message.match(/\.(pdf)$/) ? (
                            <>
                              <iframe
                                src={messageContent.message}
                                title={messageContent.message}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "100%",
                                  overflow: "hidden",
                                }}
                              />
                              <a
                                href={messageContent.message}
                                download
                                target="_blank"
                                rel="noreferrer"
                                // onClick={() => download(messageContent.message)}
                              >
                                <i className="fa fa-download" />
                                download
                              </a>
                            </>
                          ) : (
                            <span
                              onClick={() => {
                                console.log(messageContent);
                                console.log(messageContent._id);
                                console.log(
                                  messageContent.isReply
                                    ? messageContent.reply_messageObj._id
                                    : null
                                );
                              }}
                            >
                              {messageContent.message}
                            </span>
                          )}

                          <Dropdown
                            overlay={
                              <Menu style={{ minWidth: 100 }}>
                                {!messageContent.message.match(
                                  /\.(jpeg|jpg|gif|png)$/
                                ) && (
                                  <Menu.Item
                                    key="1"
                                    onClick={() => {
                                      console.log(messageContent);
                                      setReplyData(messageContent);
                                      setReply(true);
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span>Reply</span>
                                    </div>
                                  </Menu.Item>
                                )}
                                <Menu.Item
                                  key="2"
                                  onClick={() => {
                                    console.log(messageContent);
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "row",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                    onClick={() => {
                                      history.push({
                                        pathname: "/modalConversations",
                                        state: {
                                          message: messageContent.message,
                                          socket: socket,
                                          converId: id,
                                        },
                                      });
                                    }}
                                  >
                                    <span>Forward</span>
                                    {/* <i className="fas fa-forward"></i> */}
                                  </div>
                                </Menu.Item>
                              </Menu>
                            }
                            trigger={["click"]}
                            className="float-end"
                          >
                            <span className="my-2 me-2">
                              <i className="fas fa-ellipsis-v"></i>
                            </span>
                          </Dropdown>
                          <div className="d-flex align-items-center justify-content-end mt-1">
                            {messageContent.isRead ? (
                              <i
                                className="fas fa-check-double"
                                style={{ color: "#34b7f1", fontSize: "13px" }}
                              ></i>
                            ) : messageContent.isDelivered ? (
                              <i
                                className="fas fa-check-double"
                                style={{ color: "lightgray", fontSize: "13px" }}
                              ></i>
                            ) : (
                              <i
                                className="fas fa-check"
                                style={{ color: "lightgray", fontSize: "13px" }}
                              ></i>
                            )}
                          </div>
                        </div>

                        <span className="text-end pe-4">
                          {moment(messageContent.timestamp).format("hh:mm A")}
                          <span style={{ paddingLeft: 10 }}>
                            {messageContent.sender_name}
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </div>
        <div
          // className={`row px-2  pb-3  mb-4 mt-5 ${
          //   window.innerWidth > 700 && sessionInfo.length > 0
          //     ? "msg_call_input"
          //     : "msg_input"
          // }`}
          className="row px-2  pb-3  mb-4 mt-5 im-input"
        >
          {isTyping !== null && <div>{isTyping}</div>}
          {reply && (
            <div
              className="col-10 ml-2"
              style={{
                background: "rgb(143, 141, 141)",
                margin: "0 0 0 1rem",
                borderRadius: 5,
                opacity: 0.9,
              }}
            >
              <div className="row p-0 m-0">
                <div className="col-10 p-0 m-0">
                  {replyData.message.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <img
                      src={replyData.message}
                      alt=""
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                    />
                  ) : replyData.message.match(/\.(mp4|ogg|webm)$/) ? (
                    <video
                      style={{ maxHeight: "100%", maxWidth: "100%" }}
                      controls
                    >
                      <source src={replyData.message} />
                    </video>
                  ) : replyData.message.match(/\.(mp3|wav|ogg)$/) ? (
                    <audio
                      style={{ maxWidth: "100%", maxHeight: "75%" }}
                      controls
                    >
                      <source src={replyData.message} />
                    </audio>
                  ) : replyData.message.match(/\.(pdf)$/) ? (
                    <iframe
                      src={replyData.message}
                      title={replyData.message}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        overflow: "hidden",
                      }}
                    />
                  ) : (
                    <span>{replyData.message}</span>
                  )}
                </div>
                <div className="col-2 p-0 m-0 text-center">
                  <i
                    className="fa fa-times"
                    aria-hidden="true"
                    onClick={() => {
                      setReply(false);
                      setReplyData("");
                    }}
                  ></i>
                </div>
              </div>
            </div>
          )}
          <div className="col-12 d-flex justify-content-end">
            <div className="col-12 d-flex justify-content-end">
              <input
                type="text"
                className="search-input"
                placeholder="Enter your message"
                style={{ width: "100%" }}
                value={currentMessage}
                onChange={(event) => {
                  setCurrentMessage(event.target.value);
                }}
                onKeyDown={async (e) => {
                  await socket.emit(
                    "isTyping",
                    `${
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .name
                    }`
                  );
                }}
                onKeyPress={(event) => {
                  event.key === "Enter" && sendMessage();
                }}
              />

              <span className=" d-flex  align-items-end pb-2  ">
                <input
                  type="file"
                  id="file"
                  style={{ display: "none" }}
                  onChange={changeHandler}
                />
                <label
                  htmlFor="file"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: "4px",
                  }}
                >
                  <i className="fas fa-paperclip px-2" />
                </label>

                <i
                  className="fas fa-paper-plane px-2"
                  type="submit"
                  onClick={() => sendMessage()}
                />
              </span>
            </div>
          </div>
        </div>
      </ScrollToBottom>
    </>
  );
};

export default Messages;
