import React from "react";
import {
  Menu,
  Item,
  Separator,
  Submenu,
  MenuProvider,
  useContextMenu,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import { Link } from "react-router-dom";
import { DisplayName } from "../../Constants/Helper";

const CallsClicked = (props) => {
  const { show } = useContextMenu({
    id: "index" + props.index,
  });

  function handleContextMenu(event) {
    event.preventDefault();
    console.log(event, props);
    show(event, {
      props: {
        key: "value",
      },
    });
  }

  const checkIsMyContact = (firstNumber) => {
    let f = false;
    sessionStorage.getItem("my_contacts") !== null &&
      sessionStorage.getItem("my_contacts") !== undefined &&
      JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
      JSON.parse(sessionStorage.getItem("my_contacts")) !== "no data found" &&
      JSON.parse(sessionStorage.getItem("my_contacts")).map(
        (deatils, index) => {
          if (deatils.phoneDetail[0].phone === props.firstNumber) {
            f = true;
          }
        }
      );
    // console.log("In My contact : ", f);

    return f;
  };

  return (
    <>
      <p onContextMenu={handleContextMenu}>{props.children}</p>
      <Menu
        id={"index" + props.index}
        style={{ boxShadow: "0 0 0 0", border: "2px solid lightgray" }}
      >
        {JSON.parse(sessionStorage.getItem("userInfo")) !== undefined &&
          JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
            <Link onClick={() => props.dialcall()}>
              <Item>Call</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Link
              onClick={() => {
                props.smsfun();
              }}
            >
              <Item>SMS</Item>
            </Link>
          )}

        {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
           sessionStorage.getItem("currentNavHeader") === "Extensions" 
            && JSON.parse(sessionStorage.getItem("userInfo")).extension.efax === 1(
            <Item to="/faxLogs"
            >
              <Link> E-fax</Link>
            </Item>
          )} */}

        {props.NumberLength >= 10 &&
          DisplayName({ num: props.firstNumber }) === null &&
          JSON.parse(sessionStorage.getItem("userInfo")) !== null && (
            <Link
              onClick={() => {
                props.addProfile();
              }}
            >
              <Item>Add to Contact</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          checkIsMyContact() && (
            <Link
              onClick={() => {
                props.editProfile();
              }}
            >
              <Item>Edit My Contact</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms === 1 &&
          sessionStorage.getItem("currentNavHeader") === "My Contacts" && (
            <Link
              onClick={() => {
                props.deletefun();
              }}
            >
              <Item>
                {" "}
                <span
                  style={{
                    color: "red",
                  }}
                >
                  Delete My Contact
                </span>
              </Item>
            </Link>
          )}

        <Separator />
        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Link to="/newSMSChat">
              <Item>Send a new SMS</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Link to="/allSMSChats">
              <Item>Check SMS</Item>
            </Link>
          )}
        {sessionStorage.getItem("currentNavHeader") !== null &&
          sessionStorage.getItem("currentNavHeader") !== undefined &&
          sessionStorage.getItem("currentNavHeader").split(" ")[1] !==
            "Calls" && (
            <Link to="/allCalls">
              <Item>Go to Call logs</Item>
            </Link>
          )}

        {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
            1 && (
            <Link to="/allChats">
              <Item>Instant Message</Item>
            </Link>
          )} */}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
            1 && (
            <Link to="/faxLogs">
              <Item>E-fax</Item>
            </Link>
          )}
      </Menu>
    </>
  );
};

export default CallsClicked;
