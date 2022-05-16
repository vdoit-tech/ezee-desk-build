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
import { DisplayName, DisplayNameOrNumber } from "../../Constants/Helper";

const SmsClicked = (props) => {
  const { show } = useContextMenu({
    id: "index" + props.index,
  });

  function handleContextMenu(event) {
    event.preventDefault();
    console.log(DisplayName({ num: props.firstNumber }));
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
        {JSON.parse(sessionStorage.getItem("userInfo")) !== undefined &&
          JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
            <Link onClick={() => props.dialcall()}>
              <Item>Call</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          DisplayName({ num: props.firstNumber }) == null && (
            <Item
              onClick={() => {
                props.addProfile();
              }}
            >
              <Link> Add to Contact</Link>
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
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
            <Link to="/allCalls">
              <Item>Go to Call logs</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms === 1 &&
          sessionStorage.getItem("currentNavHeader") !== null &&
          sessionStorage.getItem("currentNavHeader") !== undefined &&
          sessionStorage.getItem("currentNavHeader") !== "SMS" && (
            <Link to="/allSMSChats">
              <Item>Check SMS</Item>
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

export default SmsClicked;
