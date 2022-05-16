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

const InstantMessagesClicked = (props) => {
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
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
      JSON.parse(sessionStorage.getItem("my_contacts")).map(
        (deatils, index) => {
          if (deatils.phoneDetail[0].phone === props.firstNumber) {
            f = true;
          }
        }
      );

    return f;
  };

  return (
    <>
      <p onContextMenu={handleContextMenu}>{props.children}</p>
      <Menu id={"index" + props.index}>
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
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Link to="/allSMSChats">
              <Item>Check SMS</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
            1 && (
            <Link to="/allChats">
              <Item>Instant Message</Item>
            </Link>
          )}

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

export default InstantMessagesClicked;
