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
    console.log("In My contact : ", f);

    return f;
  };

  return (
    <>
      <p onContextMenu={handleContextMenu}>{props.children}</p>
      <Menu id={"index" + props.index}>
        {JSON.parse(sessionStorage.getItem("userInfo")) !== undefined &&
          JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
            <Item onClick={() => props.dialcall()}>
              <Link>Call</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Item
              onClick={() => {
                props.smsfun();
              }}
            >
              <Link>SMS</Link>
            </Item>
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
            <Item
              onClick={() => {
                props.addProfile();
              }}
            >
              <Link> Add to Contact</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          checkIsMyContact() && (
            <Item
              onClick={() => {
                props.editProfile();
              }}
            >
              <Link> Edit My Contact</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms === 1 &&
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
            <Item>
              <Link to="/newSMSChat">Send a new SMS</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Item>
              <Link to="/allSMSChats">Check SMS</Link>
            </Item>
          )}

        <Item>
          <Link to="/allCalls">Go to Call logs</Link>
        </Item>

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
            1 && (
            <Item>
              <Link to="/allChats">Instant Message</Link>
            </Item>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
            1 && (
            <Item>
              <Link to="/faxLogs">E-fax</Link>
            </Item>
          )}
      </Menu>
    </>
  );
};

export default CallsClicked;
