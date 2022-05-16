import React, { useEffect, useState, useContext } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import axios from "axios";

import { ReactVideo } from "reactjs-media";
import ReactPlayer from "react-player";
import pdfIcon from "../../../assets/imgs/pdf.png";

import UserContext from "../../../context/useragent/userContext";
import ContactContext from "../../../context/contact/contactContext";
import {
  CheckMessages,
  DisplayName,
  DisplayNameOrNumber,
  download,
  getTotalUnReplied,
} from "../../../Constants/Helper";

import DataBase from "nedb";
import path from "path";
import {
  CHANGE_READ_STATUS,
  CHANGE_SMS_CHAT_STATUS,
  FILE_UPLOAD,
  GET_SMS_CHATS,
  SEND_SMS,
  SEND_SMS_NOTIFICATION,
} from "../../../Constants/Api";
import {
  changeReadStatusAPI,
  changeSMSChatStatusAPI,
  fileUploadAPI,
  getSMSChatsAPI,
  sendSMSMediaAPI,
  sendSMSTextAPI,
} from "../../../Constants/ApiHelper";
import { stat } from "fs";

const SMSGroupChat = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const { getGroupNotifications } = contactContext;

  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [messageDemoList, setMessageDemoList] = useState([]);
  const [media, setMedia] = useState(null);

  const [userNumber, setUserNumber] = useState(
    sessionStorage.getItem("currentGroup") !== null &&
      JSON.parse(sessionStorage.getItem("currentGroup"))[0]
  );
  const [smsChats, setSmsChats] = useState({});
  const [dbRemoteInformation, setDbRemoteInformation] = useState(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [found, setFound] = useState({});
  const [totalSearches, setTotalSearches] = useState(null);
  const [outgoingArray, setOutgoingArray] = useState([]);
  const [enableSend, setEnableSend] = useState(false);
  const [pickedUpBy, setPickedUpBy] = useState(null);
  const [disabled, setDisabled] = useState(false);
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    if (sessionStorage.getItem("currentGroup") !== null) {
      sessionStorage.setItem(
        "currentNavHeader",
        `Groupname:${
          JSON.parse(sessionStorage.getItem("currentGroup"))[1]
        }, ${sessionStorage.getItem("currentMember")}`
      );
      setNavHeader(sessionStorage.getItem("currentNavHeader"));
      setNavHeader(
        `Groupname:${
          JSON.parse(sessionStorage.getItem("currentGroup"))[1]
        }, ${sessionStorage.getItem("currentMember")}`
      );

      getSMSChats();

      setMessageList(JSON.parse(sessionStorage.getItem("currentChats")));
      smsdb.find({}, function (err, docs) {
        // console.log(docs);
      });
      sessionStorage.getItem("remote_contacts") !== null &&
        sessionStorage.getItem("remote_contacts") !== undefined &&
        setDbRemoteInformation(
          JSON.parse(sessionStorage.getItem("remote_contacts"))
        );
      const data = [
        {
          notes: "Game was played",
          time: "2017-10-04T20:24:30+00:00",
          sport: "hockey",
          owner: "steve",
          players: "10",
          game_id: 1,
        },
        {
          notes: "Game was played",
          time: "2017-10-04T12:35:30+00:00",
          sport: "lacrosse",
          owner: "steve",
          players: "6",
          game_id: 2,
        },
        {
          notes: "Game was played",
          time: "2017-10-14T20:32:30+00:00",
          sport: "hockey",
          owner: "steve",
          players: "4",
          game_id: 3,
        },
        {
          notes: "Game was played",
          time: "2017-10-04T10:12:30+00:00",
          sport: "hockey",
          owner: "henry",
          players: "10",
          game_id: 4,
        },
        {
          notes: "Game was played",
          time: "2017-10-14T20:34:30+00:00",
          sport: "soccer",
          owner: "john",
          players: "12",
          game_id: 5,
        },
      ];

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
    }
  }, []);

  const getNameorNumber = (num) => {
    let name = null;

    let remote_contacts =
      JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
      JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
      typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !==
        "string" &&
      JSON.parse(sessionStorage.getItem("remote_contacts"));

    remote_contacts !== false &&
      remote_contacts !== null &&
      remote_contacts !== undefined &&
      typeof remote_contacts !== "string" &&
      remote_contacts.some((item, index) => {
        if (item.extension_no == num) {
          name = item.name;
        }
        if (name !== null) return true;
      });

    return name == null ? num : name;
  };

  const checkPickUp = (num) => {
    let currentGroup = sessionStorage.getItem("currentGroup");
    let currentChats = JSON.parse(sessionStorage.getItem("currentChats"));
    let arr = currentChats.map(
      (item, idx) => currentChats[currentChats.length - 1 - idx]
    );
    let index = 0;
    let startIndex = 0;

    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].pickup_status == 1 &&
        arr[i].pickup_by ==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
      ) {
        setEnableSend(true);
        return null;
      }
      if (
        arr[i].pickup_status == 1 &&
        arr[i].pickup_by !==
          JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
      ) {
        setEnableSend(false);
        setPickedUpBy(arr[i].pickup_by);
        return null;
      }
    }

    for (let i = 0; i < arr.length; i++) {
      if (
        arr[i].pickup_status == 2 &&
        currentGroup !== null &&
        arr[i].from == JSON.parse(currentGroup)[0]
      ) {
        setEnableSend(false);
        return null;
      }
      if (
        arr[i].pickup_status == 2 &&
        currentGroup !== null &&
        arr[i].to == JSON.parse(currentGroup)[0] &&
        arr[i].read_status == 0
      ) {
        setEnableSend(false);
        return null;
      }
      if (
        arr[i].pickup_status == 2 &&
        currentGroup !== null &&
        arr[i].to == JSON.parse(currentGroup)[0] &&
        arr[i].read_status == 1
      ) {
        setEnableSend(false);
        return null;
      }
    }

    return "";
  };

  useEffect(() => {
    checkPickUp();
  }, []);

  // useEffect(() => {
  //   let num = sessionStorage.getItem("currentMember");
  //   let currentGroup = sessionStorage.getItem("currentGroup");
  //   let currentChats = JSON.parse(sessionStorage.getItem("currentChats"));

  //   let arr = currentChats.map(
  //     (item, idx) => currentChats[currentChats.length - 1 - idx]
  //   );
  //   let enable = false;
  //   let index = 0;
  //   let replyIndex = 0;
  //   for (let i = 0; i < arr.length; i++) {
  //     if (arr[i].from == JSON.parse(currentGroup)[0]) {
  //       index = i;
  //       break;
  //     }
  //   }

  //   for (let i = 0; i < arr.length; i++) {
  //     if (arr[i].repliedBy != null) {
  //       replyIndex = i;
  //       break;
  //     }
  //   }

  //   console.log(index);
  //   console.log(arr);
  //   console.log(replyIndex);
  //   for (let i = 0; i < index; i++) {
  //     if (
  //       arr[i].pickup_status == 1 &&
  //       sessionStorage.getItem("userInfo") !== null &&
  //       arr[i].pickup_by ==
  //         JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
  //     ) {
  //       console.log(arr[i]);
  //       setEnableSend(true);
  //       enable = true;
  //       console.log(enable);
  //       break;
  //     }
  //   }

  //   for (let i = 0; i < index; i++) {
  //     if (
  //       enable == false &&
  //       arr[i].pickup_status == 1 &&
  //       sessionStorage.getItem("userInfo") !== null &&
  //       arr[i].pickup_by !==
  //         JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
  //     ) {
  //       setPickedUpBy(arr[i].pickup_by);
  //       break;
  //     }
  //   }

  //   if (
  //     arr[0].to !==
  //       JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no &&
  //     arr[replyIndex].pickup_status == 1 &&
  //     sessionStorage.getItem("userInfo") !== null &&
  //     arr[replyIndex].pickup_by ==
  //       JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
  //   ) {
  //     console.log(arr[replyIndex]);
  //     enable = true;
  //     setEnableSend(true);
  //     console.log(enable);
  //   }

  //   if (
  //     enable == false &&
  //     arr[0].to !==
  //       JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no &&
  //     arr[replyIndex].pickup_status == 1 &&
  //     sessionStorage.getItem("userInfo") !== null &&
  //     arr[replyIndex].pickup_by !==
  //       JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
  //   ) {
  //     setPickedUpBy(arr[replyIndex].pickup_by);
  //   }
  //   console.log(arr);

  //   for (let i = 0; i < arr.length; i++) {
  //     // if (arr[i].to == JSON.parse(currentGroup)[0]) {
  //     //   break;
  //     // }
  //     if (
  //       arr[i].pickup_status == 1 &&
  //       sessionStorage.getItem("userInfo") !== null &&
  //       arr[i].pickup_by ==
  //         JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
  //     ) {
  //       console.log(arr[i]);
  //       setEnableSend(true);
  //       enable = true;
  //       console.log(enable);
  //       break;
  //     }
  //     if (
  //       enable == false &&
  //       arr[i].pickup_status == 1 &&
  //       sessionStorage.getItem("userInfo") !== null &&
  //       arr[i].pickup_by !==
  //         JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
  //     ) {
  //       setPickedUpBy(arr[i].pickup_by);
  //       break;
  //     }
  //   }
  // }, []);

  const sendMessage = async (msg) => {
    console.log(sessionStorage.getItem("my_telnyx_num"));
    setDisabled(true);

    if (
      sessionStorage.getItem("currentGroup") !== null &&
      currentMessage !== "" &&
      media === null
    ) {
      let dataMessage = `#${sessionStorage.getItem(
        "userName"
      )}: ${currentMessage}`;

      sendSMSTextAPI(
        JSON.parse(sessionStorage.getItem("currentGroup"))[0],
        sessionStorage.getItem("currentMember"),
        dataMessage,
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
              messages: dataMessage,
              media: null,
              date: date.toISOString(),
              from: JSON.parse(sessionStorage.getItem("currentGroup"))[0],
              to: sessionStorage.getItem("currentMember"),
              message_id: data.data.data.id,
            });
            return arr;
          });
          let currentData = {
            messages: dataMessage,
            media: null,
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

          let token = sessionStorage.getItem("token");

          setCurrentMessage("");

          if (msg !== undefined && msg.repliedBy == null) {
            let token = sessionStorage.getItem("token");

            changeSMSChatStatusAPI(
              token,
              msg.message_id,
              JSON.parse(sessionStorage.getItem("userInfo")).extension.ext_no
            ).then(({ status, response }) => {
              if (status == "success") {
                console.log(response);
                getGroupNotifications(getTotalUnReplied);
              } else if (status == "fail") {
                console.log(response);
              }
            });

            //change read status

            changeReadStatusAPI(token, msg.message_id).then(
              ({ status, response }) => {
                if (status == "success") {
                  console.log(response);
                } else if (status == "fail") {
                  console.log(response);
                }
              }
            );
          }
        }

        setDisabled(false);
      });
    } else if (
      sessionStorage.getItem("currentGroup") !== null &&
      currentMessage === "" &&
      media !== null &&
      media !== undefined
    ) {
      // setSending(true);
      let token = sessionStorage.getItem("token");

      fileUploadAPI(token, media.documentAsFile)
        .then(async ({ flag, res }) => {
          if (flag == "success") {
            sendSMSMediaAPI(
              JSON.parse(sessionStorage.getItem("currentGroup"))[0],
              sessionStorage.getItem("currentMember"),
              [`${res.data.data}`],
              sessionStorage.getItem("telnyx_token")
            ).then(async ({ flag, data }) => {
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
                    from: JSON.parse(sessionStorage.getItem("currentGroup"))[0],
                    to: sessionStorage.getItem("currentMember"),
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

                if (msg !== undefined && msg.repliedBy == null) {
                  let token = sessionStorage.getItem("token");

                  changeSMSChatStatusAPI(
                    token,
                    msg.message_id,
                    JSON.parse(sessionStorage.getItem("userInfo")).extension
                      .ext_no
                  ).then(({ status, response }) => {
                    if (status == "success") {
                      console.log(response);
                      getGroupNotifications(getTotalUnReplied);
                    } else if (status == "fail") {
                      console.log(response);
                    }
                  });

                  //change read status

                  changeReadStatusAPI(token, msg.message_id).then(
                    ({ status, response }) => {
                      if (status == "success") {
                        console.log(response);
                      } else if (status == "fail") {
                        console.log(response);
                      }

                      // changePickUp(msg.id, 0);
                    }
                  );
                }
              }
            });
            setMedia(null);
          }
        })
        .catch((err) => {
          // setSending(false);
          document.getElementById("error-header").classList.add = "d-flex";
          setTimeout(() => {
            document.getElementById("error-header").classList.remove = "d-flex";
          }, 2000);
          console.log(err);
          setDisabled(false);
        });
    }
  };

  const getSMSChats = () => {
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
          console.log(demoObj);
          setSmsChats(demoObj);
          smsdb.remove({}, { multi: true }, function (err, numRemoved) {
            smsdb.insert(demoObj, function (err, newDoc) {
              // console.log(newDoc);
            });
          });
        } else if (status == "fail") {
          console.log(data);
        }
      }
    );
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
        <span className=" fs-1" onClick={() => props.history.goBack()}>
          <i className="fas fa-arrow-left fs-5"></i>
        </span>
      </div>
      <ScrollToBottom
        className="chat-window w-100 h-100  position-relative"
        initialScrollBehavior="auto"
      >
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
        <div className="chat-body mb-5 pb-2">
          <div className="message-container mb-5">
            {messageDemoList.map((data, index) => (
              <>
                <div key={data.date} className="text-center my-3">
                  <span className="my-3 header-date-span fw-600 ">
                    {data.date}
                  </span>
                </div>
                {data.games.map((info, infoIndex) => {
                  return userNumber !== info.from ? (
                    <div
                      key={infoIndex}
                      className={`${
                        info.media === null && info.messages === null
                          ? "d-none"
                          : "row w-100"
                      }`}
                    >
                      <div className="d-flex row justify-content-start mb-4 msg-container ">
                        <div className="d-flex  align-items-start flex-column">
                          <div>
                            <div
                              id={`${info.id}`}
                              className={`${
                                info.media === null && info.messages === null
                                  ? "d-none"
                                  : "msg_received_container"
                              }`}
                            >
                              <span className="px-0 mx-0 d-flex flex-column sms-group-image">
                                {info.messages !== null ? (
                                  <CheckMessages message={info.messages} />
                                ) : info.media !== null ? (
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
                                    info.media.match(/\.(mp3|wav|ogg)$/) !=
                                      null ? (
                                    <audio
                                      src={info.media}
                                      controls
                                      style={{ display: "block !important" }}
                                    />
                                  ) : info.content_type !== null &&
                                    info.content_type === "video/mp4" ? (
                                    // <ReactVideo
                                    //   src={info.media}
                                    //   primaryColor="red"
                                    // />
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
                                            onClick={() =>
                                              window.open(info.media)
                                            }
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => window.open(info.media)}
                                    >
                                      {info.media}
                                    </div>
                                  )
                                ) : (
                                  ""
                                )}
                              </span>
                            </div>
                            {/* {sessionStorage.getItem("currentMember") !==
                              sessionStorage.getItem("my_telnyx_num") &&
                              infoIndex === data.games.length - 1 &&
                              index === messageDemoList.length - 1 &&
                              info.status == 0 && (
                                <button
                                  className=" mx-2 mt-1 btn btn-sm btn-warning"
                                  onClick={async () => {
                                    replySMS(
                                      info.id,
                                      info.messages !== null
                                        ? info.messages
                                        : "media"
                                    );
                                  }}
                                >
                                  reply
                                </button>
                              )} */}
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
                            <span style={{ paddingLeft: 10 }}>
                              {info.repliedBy !== null && (
                                <>
                                  <span>
                                    <span className="fw-bold me-1">
                                      <DisplayNameOrNumber
                                        num={info.repliedBy}
                                      />
                                    </span>
                                    replied
                                  </span>
                                </>
                              )}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    info.from == userNumber && (
                      <div
                        className="row w-100 justify-content-end"
                        key={info.id}
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
                                <span className="d-flex flex-column">
                                  <span>{info.messages.split(":")[1]}</span>
                                  <span className="fw-bold">
                                    {info.messages.split(":")[0]}
                                  </span>
                                </span>
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
                                        onClick={() => window.open(info.media)}
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
                    )
                  );
                })}
              </>
            ))}
          </div>
        </div>
        <div>
          {outgoingArray.length > 0 &&
            outgoingArray.map((info, infoIndex) => (
              <div key={infoIndex}>
                {info.from === userNumber ? (
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
                            // <CheckMessages message={info.messages} />
                            <span className="d-flex flex-column">
                              <span>{info.messages.split(":")[1]}</span>
                              <span className="fw-bold">
                                {info.messages.split(":")[0]}
                              </span>
                            </span>
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
                                <div className="col-8 d-flex ">Document</div>
                                <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                                  <i
                                    className="fas fa-eye"
                                    onClick={() => window.open(info.media)}
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
                            <CheckMessages message={info.messages} />
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
        {pickedUpBy !== null && (
          <div className="text-danger fw-bold fs-5 position-absolute mb-5 bottom-0">
            picked up by: {getNameorNumber(pickedUpBy)}
          </div>
        )}

        {(enableSend || sessionStorage.getItem("pickup_status") == 1) && (
          <div className="row position-absolute bottom-0 bg-white w-100">
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
                  accept=".png, .gif, .jpeg,.pdf,.wav,.mp3,.ogg,.mp4,.m4v,.mov"
                  // onChange={mediaHandler}
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
                // onKeyPress={(event) => {
                //   let term = messageDemoList[messageDemoList.length - 1].games;

                //   if (term[term.length - 1].from !== userNumber) {
                //     event.key === "Enter" &&
                //       disabled == false &&
                //       sendMessage(term[term.length - 1]);
                //   } else {
                //     event.key === "Enter" && disabled == false && sendMessage();
                //   }
                // }}
              />

              <span className=" d-flex  align-items-center mb-4  ">
                <i
                  className="fas fa-paper-plane px-2"
                  onClick={() => {
                    let term =
                      messageDemoList[messageDemoList.length - 1].games;

                    if (term[term.length - 1].from !== userNumber) {
                      disabled == false && sendMessage(term[term.length - 1]);
                    } else {
                      disabled == false && sendMessage();
                    }
                  }}
                />
              </span>
            </div>
          </div>
        )}
      </ScrollToBottom>
    </>
  );
};

export default SMSGroupChat;
