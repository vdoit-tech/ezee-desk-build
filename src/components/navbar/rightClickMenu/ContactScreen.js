import React from 'react'
import { Menu, Item, Separator, Submenu, MenuProvider, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { Link } from "react-router-dom";


const ContactScreens = (props) => {

    const { show } = useContextMenu({
        id: "contactScreens"+props.index,
      });
    
    function handleContextMenu(event){
        console.log(event,props)
        event.preventDefault();
        if(props.index===0)
        show(event, {
          props: {
              key: 'valu1e'
          }
        })

        show(event, {
          props: {
              key: 'value'
          }
        })

    }
    const handleItemClick = ({ event, props }) => console.log(event,props);
    return (
        <>

            <p onContextMenu={handleContextMenu}>{props.children}</p>  
            <Menu id={"contactScreens"+props.index}>
               
            {  JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                            JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
                            1 && (
                                <Item onClick={handleItemClick}>
                                    <Link to="/allSMSChats" >
                                    SMS
                                    </Link>
                                </Item>
                            )}
            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
                    1 && (
                        <Item >
                            <Link to="/newSMSChat" className="link-color rightclick-menu-item">
                                Send a new SMS
                            </Link>
                        </Item>
                    )}

                    {  JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
                    1 && (
                        <Item >
                            <Link to="/allSMSChats" className="link-color rightclick-menu-item">
                                Check SMS
                            </Link>
                    </Item>
                    )}
                    <Item >
                        <Link to="/allCalls" className="link-color rightclick-menu-item">
                            Go to Call logs
                        </Link>
                    </Item>
            
            {/* <Separator /> */}
            {/* <Item disabled>Disabled</Item> */}
            
            
            
            </Menu>
        </>
    )
}

export default ContactScreens;
