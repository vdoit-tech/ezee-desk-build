import React, { useState, useEffect, useContext } from "react";
import UserContext from "../../../context/useragent/userContext";
import axios from "axios";
import "./chatDetails.css";
import { Button, Modal } from "react-bootstrap";
import ContactContext from "../../../context/contact/contactContext";
import { socketUrlApi } from "../../../App";
import Checkbox from "antd/lib/checkbox/Checkbox";

const ChatDetails = (props) => {
  const [groupInfo, setGroupInfo] = useState(null);
  const [show, setShow] = useState(false);
  const userContext = useContext(UserContext);
  const { setNavHeader } = userContext;
  const contactContext = useContext(ContactContext);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState({});
  const [removePopUpOpen, setRemovePopUpOpen] = useState(false);
  const [listToAddUser, setListToAddUser] = useState([]);
  const { getRemoteContact, get_remote_contact } = contactContext;
  const {
    _id,
    users,
    timestamp,
    lastmessage,
    isGroup,
    groupName,
    conver_user_2,
    conver_user_1,
  } = props?.location?.state?.data;
  const { id } = props?.match?.params;
  // console.log(get_remote_contact,"selectedUserToRemove",selectedUserToRemove,"listToAddUser",listToAddUser)
  const getGroup = () => {
    axios
      .post(
        `${socketUrlApi}/getGroup`,

        { group_id: _id }
      )
      .then((response) => {
        console.log(response.data[0]);
        setGroupInfo(response.data[0]);
      });
  };

  useEffect(() => {
    console.log(props);
    setNavHeader(isGroup ? "Group Info" : "Contact Info");

    getRemoteContact();
    console.log(
      isGroup
        ? groupName
        : JSON.parse(conver_user_2).email ===
          JSON.parse(sessionStorage.getItem("userInfo")).extension.email
        ? JSON.parse(conver_user_1).email
        : JSON.parse(conver_user_2).email
    );
    if (isGroup) {
      getGroup();
    }
  }, []);

  useEffect(() => {
    if (listToAddUser.length === 0) {
      let newList = [...get_remote_contact];

      newList.forEach((ele) => {
        users.forEach((user) => {
          if (ele.email === user.email && !ele.isInGroup) {
            ele.isInGroup = true;
          }
        });
      });

      let finalList = newList.filter((ele) => {
        if (!ele.isInGroup) {
          return ele;
        }
      });
      setListToAddUser([...finalList]);
    }
  }, [get_remote_contact]);

  const deleteUser = () => {
    console.log(selectedUserToRemove);
    axios
      .post(
        `${socketUrlApi}/deleteUser`,

        {
          group_id: _id,
          userObj: selectedUserToRemove,
        }
      )
      .then((response) => {
        console.log(response);
        setRemovePopUpOpen(false);
        setSelectedUserToRemove({});
        getGroup();
      });
  };

  const addUser = (data) => {
    let newArr = listToAddUser.filter((ele) => {
      if (ele.isInGroup) {
        return ele;
      }
    });
    if (newArr.length > 0) {
      for (let i = 0; i < newArr.length; i++) {
        const addUserData = {
          id: "",
          user_name: newArr[i].name,
          img: "null",
          email: newArr[i].email,
          ext_no: newArr[i].extension_no,
        };
        console.log(addUserData);
        axios
          .post(
            `${socketUrlApi}/addUser`,

            {
              group_id: _id,
              userObj: addUserData,
            }
          )
          .then((response) => {
            console.log(response);
            if (i === newArr.length - 1) {
              getGroup();
            }
          });
      }
    }

    getRemoteContact();
  };
  const handleAddPeople = (user, index) => {
    listToAddUser[index].isInGroup = !listToAddUser[index].isInGroup;
  };

  const handleCancelAddPeople = () => {
    listToAddUser.forEach((ele) => {
      ele.isInGroup = false;
    });
    setShow(false);
  };

  const handleRemovePeople = (user) => {
    setRemovePopUpOpen(true);
    setSelectedUserToRemove({ ...user });
  };
  return (
    <div>
      {isGroup ? (
        groupInfo === null ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* NAME */}
            <div className="pt-4 p-0 d-flex justify-content-between align-items-center">
              {/* <div className="p-0">
                <h5>NAME:</h5>
              </div> */}
              <div className="p-0 ms-4">
                <h5>{groupInfo.groupName}</h5>
              </div>
              {JSON.parse(sessionStorage.getItem("userInfo")).extension
                .group_permission === 0 ? null : (
                <div className="p-0 me-4" style={{ fontSize: "10px" }}>
                  <i
                    className="fas fa-user-plus fa-2x"
                    onClick={() => setShow(true)}
                  ></i>
                </div>
              )}
            </div>
            {/* USERS */}
            <div className="pt-4" style={{ fontSize: "16px" }}>
              {/* <h5>GROUP MEMBERS</h5> */}
              {groupInfo.users.map((user, i) => (
                <div key={i} className="p-4">
                  <div className="card">
                    <div className="card-header h4 d-flex justify-content-between align-items-center">
                      <div style={{ fontSize: "15px" }}>
                        {groupInfo.adminUser !== undefined &&
                          user.email ===
                            JSON.parse(groupInfo.adminUser).email && (
                            <span>
                              <i className="fas fa-user-cog"></i>
                            </span>
                          )}
                        <span className="mx-2">
                          {user.user_name ? user.user_name : user.name}
                        </span>
                      </div>
                      {JSON.parse(sessionStorage.getItem("userInfo")).extension
                        .group_permission === 0 ? null : (
                        <div style={{ fontSize: "15px" }}>
                          <Button
                            style={{
                              background: "transparent",
                              borderColor: "transparent",
                            }}
                            onClick={(e) => {
                              handleRemovePeople(user);
                            }}
                          >
                            <i className="fas fa-trash-alt text-danger"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <h6 className="card-title h6">{user.email}</h6>
                      <p className="card-text">{user.ext_no}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <>
          {/* NAME */}
          <div className="row pt-4">
            <div className="col">
              <h3>NAME:</h3>
            </div>
            <div className="col">
              <h3>
                {JSON.parse(conver_user_2).email ===
                JSON.parse(sessionStorage.getItem("userInfo")).extension.email
                  ? JSON.parse(conver_user_1).email
                  : JSON.parse(conver_user_2).email}
              </h3>
            </div>
          </div>
          {/* Extension */}
          <div className="row pt-4">
            <div className="col">
              <h3>EXTENSION:</h3>
            </div>
            <div className="col">
              <h3>
                {JSON.parse(conver_user_2).email ===
                JSON.parse(sessionStorage.getItem("userInfo")).extension.email
                  ? JSON.parse(conver_user_1).extension
                  : JSON.parse(conver_user_2).extension}
              </h3>
            </div>
          </div>
        </>
      )}
      <Modal
        show={show}
        onHide={() => setShow(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          {/* <Modal.Header closeButton> */}
          <Modal.Title>Add Participants </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="text-center fs-5 py-4"
            style={{ maxHeight: 400, overflow: "auto" }}
          >
            {listToAddUser.length !== 0 &&
              listToAddUser.map((data, index) => (
                <div
                  key={data.id}
                  className="remote_list px-4 d-flex justify-content-between align-items-center"
                  style={{ cursor: "pointer", textAlign: "left" }}
                  // onClick={() => addUser(data)}
                >
                  {data.name}
                  <Checkbox
                    value={data.isInGroup}
                    onClick={() => handleAddPeople(data, index)}
                  ></Checkbox>
                </div>
              ))}
          </div>
        </Modal.Body>

        <Modal.Footer className="py-0">
          <button
            className="btn btn-primary"
            onClick={() => {
              addUser();
              setShow(false);
            }}
          >
            OK
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              handleCancelAddPeople();
            }}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={removePopUpOpen}
        onHide={() => setRemovePopUpOpen(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>Remove from Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="text-center fs-5 py-4"
            style={{ maxHeight: 400, overflow: "auto" }}
          >
            Do you want to remove{" "}
            {selectedUserToRemove.user_name
              ? selectedUserToRemove.user_name
              : selectedUserToRemove.name}{" "}
            ?
          </div>
        </Modal.Body>

        <Modal.Footer className="py-0">
          <button
            className="btn btn-danger"
            onClick={() => {
              deleteUser();
            }}
          >
            Yes
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setRemovePopUpOpen(false);
              setSelectedUserToRemove({});
            }}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ChatDetails;
