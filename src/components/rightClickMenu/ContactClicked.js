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

const ContactClicked = (props) => {
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
  return (
    <>
      <p onContextMenu={handleContextMenu}>{props.children}</p>
      <Menu id={"index" + props.index}>
        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
            <Item onClick={() => props.dialcall()}>
              <Link>Call</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms === 1 &&
          props.smsNumber !== null && (
            <Item
              onClick={() => {
                props.smsfun();
              }}
            >
              <Link>SMS</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          sessionStorage.getItem("currentNavHeader") === "Extensions" &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
            1 && (
            <Link to="/faxLogs">
              <Item>E-fax</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          sessionStorage.getItem("currentNavHeader") === "My Contacts" && (
            <Item
              onClick={() => {
                props.editProfile();
              }}
            >
              <Link> Edit My Contact</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          sessionStorage.getItem("currentNavHeader") === "My Contacts" && (
            <Item
              onClick={() => {
                props.deletefun();
              }}
            >
              <Link>
                {" "}
                <span
                  style={{
                    color: "red",
                  }}
                >
                  Delete My Contact
                </span>
              </Link>
            </Item>
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

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
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

export default ContactClicked;
