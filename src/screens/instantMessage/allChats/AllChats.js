import React, { useContext, useEffect, useState } from "react";
import defaultPic from "../../../assets/imgs/default-profile.png";
import groupPic from "../../../assets/imgs/people.png";
import UserContext from "../../../context/useragent/userContext";
import { Dropdown, Menu } from "antd";
import "./AllChats.css";
import { Link } from "react-router-dom";
import { socket } from "../../../App";
import { useHistory } from "react-router-dom";
import DataBase from "nedb";
import path from "path";
import moment from "moment";

const AllChats = () => {
  const userContext = useContext(UserContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const history = useHistory();
  const [chats, setChats] = useState([]);
  const [totalChat, setTotalChat] = useState({});
  const [search, setSearch] = useState("");
  const [information, setInformation] = useState({});

  var instantMessageDb = new DataBase({
    filename: path.join(__dirname, "/instantMessageDb.db"),
    autoload: true,
  });

  useEffect(() => {
    console.log(socket);
    console.log("hey");
    sessionStorage.setItem("currentNavHeader", "Chats");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));

    setNavHeader("Chats");

    setNavSubHeader("");
    //turning socket events off

    //get conversations

    socket.emit("listConver", {
      email: JSON.parse(sessionStorage.getItem("userInfo")).extension.email,
      token: `Bearer ${sessionStorage.getItem("token")}`,
    });
    console.log({
      email: JSON.parse(sessionStorage.getItem("userInfo")).extension.email,
      token: `Bearer ${sessionStorage.getItem("token")}`,
    });

    socket.on("conversations", (data) => {
      console.log("data", data);
      setTotalChat(data);
      // let totalChat = data;
      // if (totalChat.length > 0) {
      //   let arr = [];
      //   let obj = {};

      //   totalChat !== null &&
      //     totalChat.length !== 0 &&
      //     totalChat.map((i) => {
      //       obj[i._id] = [];
      //     });

      //   totalChat !== null &&
      //     totalChat.length !== 0 &&
      //     totalChat.map(async (i) => {
      //       socket.emit("getMessageHistory", {
      //         conver_id: i._id,
      //       });
      //       socket.on("messages", (info) => {
      //         if (info.length > 0 && info[0].conver_id == i._id) {
      //           info.map((j) => {
      //             obj[i._id].push(j);
      //             obj[i._id].filter(
      //               (v, b, a) => a.findIndex((t) => t._id === v._id) === b
      //             );
      //           });
      //         }
      //       });
      //     });
      //   console.log("IM db");
      //   instantMessageDb.remove(
      //     {},
      //     { multi: true },
      //     function (err, numRemoved) {
      //       instantMessageDb.insert(obj, function (err, newDoc) {
      //         console.log(newDoc);
      //         // setInformation(newDoc);
      //       });
      //     }
      //   );
      // }
    });
  }, []);
  useEffect(() => {
    instantMessageDb.find({}, function (err, docs) {
      // let data = docs[0];
      console.log("of all chats", docs);
      docs !== null &&
        docs[0] !== undefined &&
        docs[0] !== null &&
        setInformation(docs[0]);
    });
  }, []);

  useEffect(() => {
    if (totalChat.length > 0) {
      setChats(totalChat);
      socket.removeListener("listConver", () => console.log("listener off"));
      socket.removeListener("getMessageHistory");
      socket.removeListener("messages");

      socket.removeListener("openConversation");
      socket.removeListener("conversations");
    }
  }, [totalChat]);

  const menu = (data) => {
    return (
      <Menu>
        <Menu.Item key="5">
          <Link
            to={{
              pathname: `chatDetails/${data._id}`,
              state: {
                socket: socket,
                data: data,
              },
            }}
          >
            <i className="fas fa-user-circle" /> Profile
          </Link>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <div className="container px-0">
      <div className="row mt-2 pt-3 ">
        <div className="form-group me-4 mb-2">
          <i className="fas fa-search" />
          <input
            placeholder="Search Contact"
            className="form-control sidebar-search rounded-pill"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* <button
        onClick={() => {
          console.log(information);
          console.log(chats);
          instantMessageDb.find({}, function (err, docs) {
            // let data = docs[0];
            console.log("of all chats", docs);
            docs !== null &&
              docs[0] !== undefined &&
              docs[0] !== null &&
              console.log(docs);
          });
        }}
      >
        click
      </button> */}

      {search !== null &&
      search !== "" &&
      information !== {} &&
      Object.entries(information)[0] !== undefined &&
      Object.entries(information)[0][1].length > 0 &&
      information !== undefined ? (
        information !== null &&
        information !== undefined &&
        Object.entries(information).map((keys, index) => {
          if (keys[0] != "_id")
            return (
              <div>
                {Array.isArray(keys[1]) &&
                  keys[1].length > 0 &&
                  keys[1]

                    .filter((term) => {
                      if (search !== "" && totalChat[index] !== undefined) {
                        if (
                          term.message
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        ) {
                          return term;
                        } else if (
                          term.isGroup &&
                          totalChat[index].groupName
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        ) {
                          return term;
                        } else if (
                          !totalChat[index].isGroup &&
                          JSON.parse(totalChat[index].conver_user_2)
                            .user_name.toLowerCase()
                            .includes(search.toLowerCase())
                        ) {
                          return term;
                        }
                      } else {
                        return term;
                      }
                    })
                    .reverse()

                    .map((data, i) => {
                      if (
                        i == 0 &&
                        totalChat.length > 0 &&
                        totalChat[index] !== null &&
                        totalChat[index] !== undefined
                      ) {
                        return (
                          <div
                            key={keys[1]}
                            className="row  mt-3  py-1 position-relative border-bottom  one-chat"
                          >
                            <div
                              className="col-11 p-0 m-0"
                              onClick={() => {
                                console.log(data);
                                console.log(
                                  totalChat[index].isGroup
                                    ? totalChat[index].groupName
                                    : JSON.parse(totalChat[index].conver_user_2)
                                        .user_name
                                );
                                let chatData;
                                let heading;
                                let userInfo = {};
                                heading = totalChat[index].isGroup
                                  ? totalChat[index].groupName
                                  : (userInfo["name"] = JSON.parse(
                                      totalChat[index].conver_user_2
                                    ).user_name);

                                if (totalChat[index].isGroup) {
                                  userInfo["name"] = totalChat[index].groupName;
                                  userInfo["email"] = totalChat[index].users;
                                  userInfo["isGroup"] = true;
                                } else {
                                  userInfo["name"] = JSON.parse(
                                    totalChat[index].conver_user_2
                                  ).user_name;
                                  userInfo["email"] = JSON.parse(
                                    totalChat[index].conver_user_2
                                  ).email;
                                  userInfo["isGroup"] = false;
                                }
                                console.log(heading);

                                history.push({
                                  pathname: `/Messages/${totalChat[index]._id}/${heading}/${totalChat[index].isGroup}`,
                                  state: {
                                    userInfo: userInfo,
                                  },
                                });
                              }}
                            >
                              <div className="row position-relative">
                                <div className="col-6 d-flex align-items-center">
                                  <div className="">
                                    <img
                                      src={
                                        data.is_Group !== "false"
                                          ? groupPic
                                          : defaultPic
                                      }
                                      alt=""
                                      className="call-person-img"
                                    />
                                  </div>
                                  <div className="mx-4">
                                    <div className="fs-6 fw-bold px-0">
                                      {totalChat[index].isGroup
                                        ? totalChat[index].groupName
                                        : JSON.parse(
                                            totalChat[index].conver_user_2
                                          ).user_name !==
                                          sessionStorage.getItem("userName")
                                        ? JSON.parse(
                                            totalChat[index].conver_user_2
                                          ).user_name
                                        : JSON.parse(
                                            totalChat[index].conver_user_1
                                          ).user_name}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-3"></div>
                                <div className="col-3 d-flex align-items-center justify-content-end">
                                  <div className="mx-4 ">
                                    <div className="px-0">
                                      {moment(data.timestamp).format(
                                        "DD-MM-YYYY hh:mm A"
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="row  ps-4  ps-5">
                                <span
                                  className="col d-flex  "
                                  style={{ paddingLeft: "2.3rem" }}
                                >
                                  {data.message.match(
                                    /^http[^\?]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim
                                  ) ||
                                  data.message.match(/\.(mp3|wav|ogg)$/) ||
                                  data.message.match(/\.(pdf)$/) ||
                                  data.message.match(/\.(mp4|mov|m4v)$/) ? (
                                    <i className="fas fa-photo-video" />
                                  ) : (
                                    data.message
                                  )}
                                </span>
                              </div>
                            </div>
                            {data.is_Group ? (
                              <div className="col-1 p-0 m-0">
                                <Dropdown
                                  overlay={() => menu(data)}
                                  trigger={["click"]}
                                  className="float-end"
                                >
                                  <span className="my-2 me-2">
                                    <i className="fas fa-ellipsis-v"></i>
                                  </span>
                                </Dropdown>
                              </div>
                            ) : null}
                          </div>
                        );
                      } else if (keys[1].length == 0) {
                        return <div>{keys[0]}</div>;
                      }
                    })}
              </div>
            );
        })
      ) : (
        <div>
          {chats !== null &&
            chats.length !== 0 &&
            chats
              .filter((term) => {
                if (search !== "") {
                  if (
                    term.lastmessage !== null &&
                    term.lastmessage
                      .toLowerCase()
                      .includes(search.toLowerCase())
                  ) {
                    return term;
                  } else if (
                    term.isGroup &&
                    term.groupName.toLowerCase().includes(search.toLowerCase())
                  ) {
                    return term;
                  } else if (
                    !term.isGroup &&
                    JSON.parse(term.conver_user_2)
                      .user_name.toLowerCase()
                      .includes(search.toLowerCase())
                  ) {
                    return term;
                  }
                } else {
                  return term;
                }
              })
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map((data, i) => {
                return (
                  <div
                    key={i}
                    className="row  mt-3  py-1 position-relative border-bottom  one-chat"
                  >
                    <div
                      className="col-11 p-0 m-0"
                      onClick={() => {
                        console.log(data);
                        let chatData;
                        let heading = data.isGroup
                          ? data.groupName
                          : JSON.parse(data.conver_user_1).email !==
                            JSON.parse(sessionStorage.getItem("userInfo"))
                              .extension.email
                          ? JSON.parse(data.conver_user_1).user_name
                          : JSON.parse(data.conver_user_2).user_name;
                        console.log(heading);
                        history.push({
                          pathname: `/Messages/${data._id}/${heading}/${data.isGroup}`,
                          state: {
                            userInfo: data,
                          },
                        });
                        // history.push(
                        //   `/Messages/${data._id}/${heading}/${data.isGroup}`
                        // );
                      }}
                    >
                      <div className="row position-relative">
                        <div className="col-6 d-flex align-items-center">
                          <div className="">
                            <img
                              src={data.isGroup ? groupPic : defaultPic}
                              alt=""
                              className="call-person-img"
                            />
                          </div>
                          <div className="mx-4">
                            <div className="fs-6 fw-bold px-0">
                              {data.isGroup
                                ? data.groupName
                                : JSON.parse(data.conver_user_2).user_name !==
                                  sessionStorage.getItem("userName")
                                ? JSON.parse(data.conver_user_2).user_name
                                : JSON.parse(data.conver_user_1).user_name}
                            </div>
                          </div>
                        </div>
                        <div className="col-3"></div>
                        <div className="col-3 d-flex align-items-center justify-content-end">
                          <div className="mx-4 ">
                            <div className="px-0">
                              {moment(data.timestamp).format(
                                "DD-MM-YYYY  hh:mm A"
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row  ps-4  ps-5">
                        <span
                          className="col d-flex  "
                          style={{ paddingLeft: "2.3rem" }}
                        >
                          {data.lastmessage.match(
                            /^http[^\?]*.(jpg|jpeg|gif|png)(\?(.*))?$/gim
                          ) ||
                          data.lastmessage.match(/\.(mp3|wav|ogg)$/) ||
                          data.lastmessage.match(/\.(pdf)$/) ||
                          data.lastmessage.match(/\.(mp4|mov|m4v)$/) ? (
                            <i className="fas fa-photo-video" />
                          ) : (
                            data.lastmessage
                          )}
                        </span>
                      </div>
                    </div>
                    {data.isGroup ? (
                      <div className="col-1 p-0 m-0">
                        <Dropdown
                          overlay={() => menu(data)}
                          trigger={["click"]}
                          className="float-end"
                        >
                          <span className="my-2 me-2">
                            <i className="fas fa-ellipsis-v"></i>
                          </span>
                        </Dropdown>
                      </div>
                    ) : null}
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
};
export default AllChats;

{
  /* {chats !== null &&
        chats.length !== 0 &&
        chats
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .map((data, i) => {
            return (
              <div
                key={i}
                className="row  mt-3  py-1 position-relative border-bottom  one-chat"
              >
                <div
                  className="col-11 p-0 m-0"
                  onClick={() => {
                    console.log(
                      data.isGroup
                        ? data.groupName
                        : JSON.parse(data.conver_user_2).user_name
                    );
                    let chatData;
                    let heading = data.isGroup
                      ? data.groupName
                      : JSON.parse(data.conver_user_2).user_name;

                    history.push(
                      `/Messages/${data._id}/${heading}/${data.isGroup}`
                    );
                  }}
                >
                  <div className="row position-relative">
                    <div className="col-6 d-flex align-items-center">
                      <div className="">
                        <img
                          src={data.isGroup ? groupPic : defaultPic}
                          alt=""
                          className="call-person-img"
                        />
                      </div>
                      <div className="mx-4">
                        <div className="fs-6 fw-bold px-0">
                          {data.isGroup
                            ? data.groupName
                            : JSON.parse(data.conver_user_2).user_name !==
                              sessionStorage.getItem("userName")
                            ? JSON.parse(data.conver_user_2).user_name
                            : JSON.parse(data.conver_user_1).user_name}
                        </div>
                      </div>
                    </div>
                    <div className="col-3"></div>
                    <div className="col-3 d-flex align-items-center justify-content-end">
                      <div className="mx-4 ">
                        <div className="px-0">
                          {data.timestamp.split(" ")[0]},
                          {data.timestamp.split(" ")[1].slice(0, -3)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row  ps-4  ps-5">
                    <span
                      className="col d-flex  "
                      style={{ paddingLeft: "2.3rem" }}
                    >
                      {data.lastmessage}
                    </span>
                  </div>
                </div>
                {data.isGroup ? (
                  <div className="col-1 p-0 m-0">
                    <Dropdown
                      overlay={() => menu(data)}
                      trigger={["click"]}
                      className="float-end"
                    >
                      <span className="my-2 me-2">
                        <i className="fas fa-ellipsis-v"></i>
                      </span>
                    </Dropdown>
                  </div>
                ) : null}
              </div>
            );
          })} */
}

// totalChat[index] !== null &&
//                     totalChat[index] !== undefined && (
//                       <div className="row  mt-3  py-1 position-relative border-bottom  one-chat">
//                         <div
//                           className="col-11 p-0 m-0"
//                           onClick={() => {
//                             console.log(
//                               totalChat[index].isGroup
//                                 ? totalChat[index].groupName
//                                 : JSON.parse(totalChat[index].conver_user_2)
//                                     .user_name
//                             );
//                             let chatData;
//                             let heading = totalChat[index].isGroup
//                               ? totalChat[index].groupName
//                               : JSON.parse(totalChat[index].conver_user_2)
//                                   .user_name;
//                             history.push(
//                               `/Messages/${totalChat[index]._id}/${heading}/${totalChat[index].isGroup}`
//                             );
//                           }}
//                         >
//                           <div className="row position-relative">
//                             <div className="col-6 d-flex align-items-center">
//                               <div className="">
//                                 <img
//                                   src={
//                                     totalChat[index].isGroup
//                                       ? groupPic
//                                       : defaultPic
//                                   }
//                                   alt=""
//                                   className="call-person-img"
//                                 />
//                               </div>
//                               <div className="mx-4">
//                                 <div className="fs-6 fw-bold px-0">
//                                   {totalChat[index].isGroup
//                                     ? totalChat[index].groupName
//                                     : JSON.parse(totalChat[index].conver_user_2)
//                                         .user_name !==
//                                       sessionStorage.getItem("userName")
//                                     ? JSON.parse(totalChat[index].conver_user_2)
//                                         .user_name
//                                     : JSON.parse(totalChat[index].conver_user_1)
//                                         .user_name}
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="col-3"></div>
//                             <div className="col-3 d-flex align-items-center justify-content-end">
//                               <div className="mx-4 ">
//                                 <div className="px-0">
//                                   {moment(totalChat[index].timestamp).format(
//                                     "DD-MM-YYYY hh:mm A"
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="row  ps-4  ps-5">
//                             <span
//                               className="col d-flex  "
//                               style={{ paddingLeft: "2.3rem" }}
//                             ></span>
//                           </div>
//                         </div>
//                         {totalChat[index].isGroup ? (
//                           <div className="col-1 p-0 m-0">
//                             <Dropdown
//                               overlay={() => menu(totalChat[index])}
//                               trigger={["click"]}
//                               className="float-end"
//                             >
//                               <span className="my-2 me-2">
//                                 <i className="fas fa-ellipsis-v"></i>
//                               </span>
//                             </Dropdown>
//                           </div>
//                         ) : null}
//                       </div>
//                     )
