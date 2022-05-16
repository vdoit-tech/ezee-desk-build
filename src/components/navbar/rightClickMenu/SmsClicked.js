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
    console.log(DisplayName({num:props.firstNumber}))
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
      {JSON.parse(sessionStorage.getItem("userInfo")) !==
        undefined &&
        JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
        JSON.parse(sessionStorage.getItem("userInfo")).extension
        .calling === 1 && (
            <Item onClick={() => props.dialcall()}>
              <Link>Call</Link>
            </Item>
          )}

        {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Item onClick={()=>{
                props.smsfun()
                }}>
              <Link>SMS</Link>
            </Item>
          )} */}

          {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
           sessionStorage.getItem("currentNavHeader") === "Extensions" 
            && JSON.parse(sessionStorage.getItem("userInfo")).extension.efax === 1(
            <Item to="/faxLogs"
            >
              <Link> E-fax</Link>
            </Item>
          )} */}
          {JSON.parse(sessionStorage.getItem("userInfo")) !== null && 
            DisplayName({num:props.firstNumber})==null && (
            <Item onClick={()=>{
                props.addProfile()
                }}
            >
              <Link> Add to Contact</Link>
            </Item>
          )}

        
        <Separator />
        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
            <Item >
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

          {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
          JSON.parse(sessionStorage.getItem("userInfo")).extension
            .calling === 1 && (
                <Item>
                <Link to="/allCalls">Go to Call logs</Link>
                </Item>
        )}

        {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                            JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
                            1 && (
                <Item>
                    <Link to="/allChats" >
                      Instant Message
                    </Link>
                </Item>
            )}

            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                            JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
                            1 && (
                <Item >
                    <Link  to="/faxLogs" >
                    E-fax
                    </Link>
                </Item>
              )}

      </Menu>
    </>
  );
};

export default SmsClicked;
