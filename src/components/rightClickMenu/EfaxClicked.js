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

const EFaxClicked = (props) => {
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

  const editProfile = (number) => {
    let myContacts = sessionStorage.getItem("my_contacts");
    if (
      myContacts !== null &&
      myContacts !== undefined &&
      typeof JSON.parse(myContacts) !== "string"
    ) {
      let arr = JSON.parse(myContacts);
      console.log("arr", arr);
      for (let i = 0; i < arr.length; i++) {
        console.log(arr[i]);
        if (arr[i].phoneDetail[0].phone == number) {
          let contact = arr[i];
          console.log("props", contact, props);
          props.history.push({
            pathname: "/contactProfile",
            state: {
              id: contact.phoneDetail.map((i) => {
                return i.id;
              }),
              name: contact.name,
              phone_details: contact.phoneDetail,
              image: contact.image !== null ? contact.image : null,
              email: contact.email,
              address: contact.address,
              company: contact.company,
              description: contact.description,
            },
          });
        }
        break;
      }
    }
  };

  const checkIsMyContact = (firstNumber) => {
    let f = false;
    sessionStorage.getItem("my_contacts") !== null &&
      sessionStorage.getItem("my_contacts") !== undefined &&
      typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
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
        {JSON.parse(sessionStorage.getItem("userInfo")) !== undefined &&
          JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 && (
            <Link onClick={() => props.dialCall()}>
              <Item>Call</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Link
              onClick={() => {
                props.smsFun();
              }}
            >
              <Item>SMS</Item>
            </Link>
          )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          sessionStorage.getItem("currentNavHeader") === "Extensions" &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
            1(
              <Link to="/faxLogs">
                <Item>E-fax</Item>
              </Link>
            )}

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
          checkIsMyContact(props.firstNumber) && (
            <Link
              onClick={() => {
                editProfile(props.firstNumber);
              }}
            >
              <Item>Edit My Contact</Item>
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

        {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
            1 && (
            <Link to="/allChats">
              <Item>Instant Message</Item>
            </Link>
          )} */}

        {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                            JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
                            1 && (
                    <Link  to="/faxLogs">
                        <Item >
                            
                            E-fax
                          
                        </Item>
                    </Link>
              )} */}
      </Menu>
    </>
  );
};

export default EFaxClicked;
