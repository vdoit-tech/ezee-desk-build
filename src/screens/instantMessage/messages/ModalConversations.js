import React, { useState, useEffect, useContext } from "react";
import defaultPic from "../../../assets/imgs/default-profile.png";
import UserContext from "../../../context/useragent/userContext";
import { v4 as uuidv4 } from "uuid";
import DataBase from "nedb";
import path from "path";
import { socket } from "../../../App";

const ModalConversations = (props) => {
  const userContext = useContext(UserContext);
  const { setNavHeader } = userContext;
  const [chats, setChats] = useState([]);
  const [search, setSearch] = useState("");
  var instantMessageDb = new DataBase({
    filename: path.join(__dirname, "/instantMessageDb.db"),
    autoload: true,
  });

  useEffect(() => {
    console.log(props);
    setNavHeader("Forward To");
    socket.emit("listConver", {
      email: JSON.parse(sessionStorage.getItem("userInfo")).extension.email,
    });

    socket.on("conversations", (data) => {
      console.log(data);
      setChats(data);
    });
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      socket.removeListener("listConver", () => console.log("listener off"));
      socket.removeListener("conversations");
    }
  }, [chats]);
  return (
    <div className="container px-0">
      <div className="row mt-3">
        <div className="form-group me-4 mb-2">
          <i className="fas fa-search" />
          <input
            placeholder="Search Contact"
            className="form-control sidebar-search rounded-pill"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {chats.length !== 0 &&
        chats
          .filter((term) => {
            if (search !== "") {
              let name = term.isGroup
                ? term.groupName
                : JSON.parse(term.conver_user_2).user_name;
              if (name.toLowerCase().includes(search.toLowerCase()))
                return term;
            } else {
              return term;
            }
          })
          .map((data, i) => {
            return (
              <div
                key={i}
                className="row mt-2 py-1 position-relative border-bottom  one-chat"
                onClick={async () => {
                  console.log(
                    data.isGroup
                      ? data.groupName
                      : JSON.parse(data.conver_user_2).email
                  );
                  let chatData;
                  let heading = data.isGroup
                    ? data.groupName
                    : JSON.parse(data.conver_user_2).email;
                  socket.emit("getMessageHistory", {
                    conver_id: data._id,
                  });
                  let messageData = {
                    _id: uuidv4(),
                    sender_id: uuidv4(),
                    sender_ext_no: JSON.parse(
                      sessionStorage.getItem("userInfo")
                    ).extension.ext_no,
                    sender_email: JSON.parse(sessionStorage.getItem("userInfo"))
                      .extension.email,
                    sender_name: JSON.parse(sessionStorage.getItem("userInfo"))
                      .extension.name,
                    receiver_id: "",
                    receiver_ext_no: "",
                    receiver_email: "",
                    receiver_name: "",
                    message: props.location.state.message,
                    type: "text",
                    timestamp:
                      new Date()
                        .toLocaleString()
                        .split(", ")[0]
                        .replaceAll("/", "-") +
                      " " +
                      new Date().toLocaleString().split(", ")[1],
                    conver_id: data._id,
                    isRead: false,
                    isReply: false,
                    isDelivered: false,
                    reply_messageObj: "",
                  };

                  await socket.emit("sendMessage", messageData);
                  instantMessageDb.find({}, function (err, docs) {
                    let data = docs[0];
                    // console.log(data);
                    if (data !== undefined) {
                      if (data[data._id] === undefined) {
                        data[data._id] = [messageData];
                      } else {
                        data[data._id] = [messageData, ...data[data._id]];
                      }
                    }

                    instantMessageDb.remove(
                      {},
                      { multi: true },
                      function (err, numRemoved) {
                        instantMessageDb.insert(data, function (err, newDoc) {
                          console.log("IM db updated from modal conver");
                          console.log(docs);
                        });
                      }
                    );
                  });
                  await socket.on("messages", (info) => {
                    let chatData = info;
                    let heading = data.isGroup
                      ? data.groupName
                      : JSON.parse(data.conver_user_2).user_name;
                    setTimeout(() => {
                      props.history.push(
                        `/Messages/${data._id}/${heading}/${data.isGroup}`
                      );
                    }, 1000);
                  });
                }}
              >
                <div className="row position-relative">
                  <div className="col-6 d-flex align-items-center">
                    <div className="">
                      <img
                        src={defaultPic}
                        alt=""
                        className="call-person-img"
                      />
                    </div>
                    <div className="mx-4">
                      <div className="fs-6 fw-bold px-0">
                        {data.isGroup
                          ? data.groupName
                          : JSON.parse(data.conver_user_2).user_name}
                      </div>
                    </div>
                  </div>
                  <div className="col-3"></div>
                  <div className="col-3 d-flex align-items-center justify-content-end">
                    <div className="mx-4 ">
                      {/* <div className="px-0">
                      {`${String(new Date(data.timestamp).getHours()).padStart(
                        2,
                        "0"
                      )}:${String(
                        new Date(data.timestamp).getMinutes()
                      ).padStart(2, "0")}`}
                    </div> */}
                    </div>
                  </div>
                </div>

                {/* <div className="row  ps-4  ps-5">
                <span
                  className="col d-flex  "
                  style={{ paddingLeft: "2.3rem" }}
                >
                  {data._id}
                </span>
              </div> */}
              </div>
            );
          })}
    </div>
  );
};

export default ModalConversations;
