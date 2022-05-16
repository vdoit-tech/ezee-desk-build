import React, { useEffect, useState, useContext } from "react";
import { v4 as uuid } from "uuid";
import ContactContext from "../../../context/contact/contactContext";
import UserContext from "../../../context/useragent/userContext";
import { socket } from "../../../App";
import { useHistory } from "react-router-dom";

import defaultPic from "../../../assets/imgs/default-profile.png";
import { Dropdown, Menu } from "antd";
import DataBase from "nedb";
import path from "path";

const NewChat = () => {
  const [listToShowPeople, setListToPrint] = useState([]);
  const [oneChatEnabled, setOneChatEnabled] = useState(true);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedMembersData, setSelectedMembersData] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [groupName, setGroupName] = useState("");
  const history = useHistory();
  const contactContext = useContext(ContactContext);
  const userContext = useContext(UserContext);
  const { getRemoteContact, get_remote_contact } = contactContext;
  const { setNavSubHeader, setNavHeader } = userContext;
  var instantMessageDb = new DataBase({
    filename: path.join(__dirname, "/instantMessageDb.db"),
    autoload: true,
  });

  useEffect(() => {
    getRemoteContact();
    sessionStorage.setItem("currentNavHeader", "New Chat");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("New Chat");
    setNavSubHeader("");
  }, []);

  useEffect(() => {
    if (
      listToShowPeople.length === 0 &&
      sessionStorage.getItem("remote_contacts") !== null &&
      sessionStorage.getItem("remote_contacts") !== undefined
    ) {
      setListToPrint([
        ...JSON.parse(sessionStorage.getItem("remote_contacts")),
      ]);
    }
  }, [get_remote_contact]);
  useEffect(() => {
    if (oneChatEnabled === true) {
      setSelectedMembers([]);
      setSelectedMembersData([]);
      setGroupName("");
    } else setSelectedMember("");
  }, [oneChatEnabled]);

  const joinGroup = async () => {
    let newArrToMakeGroup = listToShowPeople.filter((ele) => {
      if (ele.isInGroup) {
        return ele;
      }
    });
    if (newArrToMakeGroup.length !== 0 && groupName !== "") {
      let data = {
        _id: uuid(),
        conver_user_1: "",
        conver_user_2: "",
        lastmessage: "",
        timestamp:
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toISOString().split("T")[1].split(".")[0],
        isGroup: true,
        users: [
          ...newArrToMakeGroup,
          {
            id: "",
            user_name: sessionStorage.getItem("userName"),
            img: "",
            email: JSON.parse(sessionStorage.getItem("userInfo")).extension
              .email,
            ext_no: JSON.parse(sessionStorage.getItem("userInfo")).extension
              .ext_no,
          },
        ],
        groupName: groupName,
      };

      await socket.emit("joinGroup", data);

      instantMessageDb.find({}, function (err, docs) {
        let data = docs[0];
        if (data !== undefined) {
          if (data[uuid()] === undefined) {
            data[uuid()] = [];
          }
        }

        instantMessageDb.remove(
          {},
          { multi: true },
          function (err, numRemoved) {
            instantMessageDb.insert(data, function (err, newDoc) {
              console.log("new group IM db updated");
            });
          }
        );
      });

      console.log(data);
      setTimeout(() => {
        history.push("/allChats");
      }, [1000]);
    }
  };

  const handleOneToOneChat = async (user) => {
    if (Object.keys(user).length > 0) {
      let conver_user_1 = {
        email: JSON.parse(sessionStorage.getItem("userInfo")).extension.email,
        user_name: sessionStorage.getItem("userName"),
        extension: JSON.parse(sessionStorage.getItem("userInfo")).extension
          .ext_no,
        img: "",
      };
      let conver_user_2 = {
        email: user.email,
        user_name: user.name,
        extension: user.extension_no,
        img: user.profile,
      };

      await socket.emit("joinGroup", {
        _id: uuid(),
        conver_user_1: JSON.stringify(conver_user_1),
        conver_user_2: JSON.stringify(conver_user_2),
        lastmessage: "",
        timestamp:
          new Date().toISOString().split("T")[0] +
          " " +
          new Date().toISOString().split("T")[1].split(".")[0],
        isGroup: false,
        users: [],
        groupName: "",
      });

      instantMessageDb.find({}, function (err, docs) {
        let data = docs[0];
        if (data !== undefined) {
          if (data[uuid()] === undefined) {
            data[uuid()] = [];
          }
        }

        instantMessageDb.remove(
          {},
          { multi: true },
          function (err, numRemoved) {
            instantMessageDb.insert(data, function (err, newDoc) {
              console.log("new chat IM db updated");
            });
          }
        );
      });

      // socket.emit('listConver', {
      //   email: JSON.parse(sessionStorage.getItem('userInfo')).extension.email,
      // });
      // socket.on('conversations', (data) => {
      //   console.log("data",data);
      //   data.forEach((ele)=>{
      //     if(ele.email===user.email){
      //       let heading = ele.isGroup
      //       ? ele.groupName
      //       : JSON.parse(ele.conver_user_2).user_name;

      //     history.push(`/Messages/${ele._id}/${heading}/${ele.isGroup}`)
      //     }
      //   })
      // });
      setTimeout(() => {
        history.push("/allChats");
      }, [2000]);
    }
  };

  const handleAddPeople = (user, index) => {
    let filtered = [...listToShowPeople];
    filtered[index].isInGroup = !listToShowPeople[index].isInGroup;
    setListToPrint([...filtered]);
  };
  //   const menu = () => {
  //   return (
  //     <Menu>
  //       {oneChatEnabled?
  //        <Menu.Item key="5"  onClick={(e)=>setOneChatEnabled(false)}>Create Group</Menu.Item>:
  //        <Menu.Item key="5" onClick={(e)=>setOneChatEnabled(true)}>Message Privatly</Menu.Item>
  //       }
  //       {/* <Menu.Item key="5">
  //         {/* <Link
  //           to={{
  //             pathname: `chatDetails/${data._id}`,
  //             state: {
  //               socket: socket,
  //               data: data,
  //             },
  //           }}
  //         >
  //           <i className="fas fa-user-circle" /> Profile
  //         {/* </Link>
  //       </Menu.Item> */}
  //     </Menu>
  //   );
  // };

  return (
    <div style={{ minHeight: "100%", display: "flex" }}>
      <div className="container-fluid   px-0">
        <div className="row justify-content-center h-100 d-flex">
          <div className="container px-0">
            <div className="row mt-4 pt-1">
              <div className="col-10 form-group mb-2">
                <i className="fas fa-search" />
                <input
                  placeholder="Search Contact"
                  className="form-control sidebar-search rounded-pill"
                />
              </div>
              {JSON.parse(sessionStorage.getItem("userInfo")).extension
                .group_permission === 0 ? null : (
                <div className="col-2 p-0 m-0 d-flex justify-content-end w-100">
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      setOneChatEnabled(!oneChatEnabled);
                    }}
                  >
                    {oneChatEnabled ? "New Group" : "New Chat"}{" "}
                  </button>
                  {/* <Dropdown
                  overlay={() => menu()}
                  trigger={['click']}
                  className="float-end"
                >
                  <span className="my-2 me-2">
                    <i className="fas fa-ellipsis-v"></i>
                  </span>
                </Dropdown> */}
                </div>
              )}
            </div>

            {oneChatEnabled ? (
              <>
                {listToShowPeople.length > 0 &&
                  listToShowPeople.map((data, i) => {
                    return data.email ===
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .email
                      ? ""
                      : data.chat == 1 && (
                          <div
                            key={i}
                            style={{
                              border: "0px solid",
                              borderRadius: "32px",
                            }}
                            className="row  mt-3  py-1 position-relative border-bottom  one-chat"
                            onClick={() => {
                              handleOneToOneChat(data);
                            }}
                          >
                            <div className="col-11 p-0 m-0">
                              <div className="row position-relative">
                                <div className="d-flex align-items-center">
                                  <div className="">
                                    <img
                                      src={
                                        data.profile ? data.profile : defaultPic
                                      }
                                      alt=""
                                      className="call-person-img"
                                    />
                                  </div>
                                  <div className="ms-3">
                                    <div className="fs-6 fw-bold px-0">
                                      {data.name}
                                    </div>
                                    <div>{data.email}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                  })}
              </>
            ) : (
              <>
                <div className="row mt-4 d-flex align-items-center justify-content-between flex-direction-row ">
                  <div className="col-9 form-group ">
                    <input
                      type="text"
                      className="form-control mb-2 px-2"
                      placeholder="Group Name"
                      value={groupName}
                      onChange={(e) => {
                        // console.log(e.target.value);
                        setGroupName(e.target.value);
                      }}
                    />
                  </div>
                  <div className="col-3 text-center">
                    <button
                      className="btn btn-success"
                      onClick={() => joinGroup()}
                    >
                      Create Group
                    </button>
                  </div>
                </div>
                {listToShowPeople.length > 0 &&
                  listToShowPeople.map((data, index) => {
                    return data.email ===
                      JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .email
                      ? ""
                      : data.chat == 1 && (
                          <div
                            key={index}
                            className="row  mt-3  py-1 position-relative border-bottom  one-chat"
                            style={
                              data.isInGroup
                                ? {
                                    backgroundColor: "lightBlue",
                                    border: "0px solid",
                                    borderRadius: "32px",
                                  }
                                : { border: "0px solid", borderRadius: "32px" }
                            }
                            onClick={() => handleAddPeople(data, index)}
                          >
                            <div className="col-11 p-0 m-0">
                              <div className="row position-relative">
                                <div className="d-flex align-items-center ">
                                  <div className="">
                                    <img
                                      src={
                                        data.profile ? data.profile : defaultPic
                                      }
                                      alt=""
                                      className="call-person-img"
                                    />
                                  </div>
                                  <div className="ms-3">
                                    <div className="fs-6 fw-bold px-0">
                                      {data.name}
                                    </div>
                                    <div>{data.email}</div>
                                  </div>
                                  <div>
                                    {data.isInGroup ? (
                                      <div className="text-center mt-4">
                                        <i className="fa fa-check-circle"></i>
                                        {/* <Checkbox value={data.isInGroup} ></Checkbox> */}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                  })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChat;
