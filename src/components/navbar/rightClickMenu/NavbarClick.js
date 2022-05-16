import React,{ useEffect, useState, useContext } from 'react'
import { Menu, Item, Separator, Submenu, MenuProvider, useContextMenu } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import { Link } from "react-router-dom";

import { DisplayName } from "../../Constants/Helper";

const NavbarClicked = (props) => {

    const { show } = useContextMenu({
        id: "index"+props.index,
      });


    
    function handleContextMenu(event){
        event.preventDefault();
        console.log(event,props)
        show(event, {
          props: {
              key: 'value'
          }
        })
    }

    function count(main_str, sub_str) 
    {
            main_str += '';
            sub_str += '';

            if (sub_str.length <= 0) 
            {
                return main_str.length + 1;
            }

           var subStr = sub_str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return (main_str.match(new RegExp(subStr, 'gi')) || []).length;
    }


    const checkIsMyContact = (firstNumber)=>{
        let f = false;
        JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
        JSON.parse(sessionStorage.getItem("my_contacts"))
        .map((deatils,index)=>{
                if(deatils.phoneDetail[0].phone===props.firstNumber){
                  f=true;
                }
        })
    
        return f;
      }
    

    return (
        <>
            <p onContextMenu={handleContextMenu}>{props.children}</p> 
            {sessionStorage.getItem("currentNavHeader")!=='Dashboard' &&
            <Menu id={"index"+props.index}>
            {/* count(sessionStorage.getItem("currentNavHeader"),":")===1 && */}
                    {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
                    1 && sessionStorage.getItem("currentNavHeader")!==null &&
                     sessionStorage.getItem("currentNavHeader").includes("Groupname") && 
                    (
                            <Item onClick={()=>{props.dialCall()}}
                            > 
                                    <Link>Call</Link>
                            </Item>
                    )}

              

            {/* {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
                    1 && count(sessionStorage.getItem("currentNavHeader"),":")===2 && (
                    <Item onClick={handleItemClick}>
                        <Link to="/allSMSChats" >
                        SMS
                        </Link>
                    </Item>
            )} */}

            {props.NumberLength>=10 && 
                DisplayName({num:props.firstNumber})===null  &&  
                    JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    (
                        <Item onClick={()=>{
                            props.addProfile()
                            }}
                        >
                        <Link> Add to Contact</Link>
                        </Item>
            )}
                 
               
            { JSON.parse(sessionStorage.getItem("userInfo")) !== null
            &&
            count(sessionStorage.getItem("currentNavHeader"),":")===1 &&(
                    <Separator />
             )
            }
            {/* <Item disabled>Disabled</Item> */}
            {/* sessionStorage.getItem("currentNavHeader") */}
            {/* { JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
                    1 (
                        <Item >
                            <Link to="/newSMSChat" >
                                Send a new SMS
                            </Link>
                        </Item>
                    )} */}

            {  JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
            JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
            1 && (
                <Item >
                    <Link to="/allSMSChats">
                        Check SMS
                    </Link>
            </Item>
            )}
            {/* sessionStorage.getItem("currentNavHeader")===1  */}
            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
            JSON.parse(sessionStorage.getItem("userInfo")).extension.calling ===
            1 &&(
                <Item >
                    <Link to="/allCalls" >
                        Go to Call logs
                    </Link>
                </Item>
            )
            }


            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.chat ===
                    1 && (
                    <Item>
                        <Link to="/allChats" >
                           Go to Instant Messages
                        </Link>
                    </Item>
            )}

            {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
                    JSON.parse(sessionStorage.getItem("userInfo")).extension.efax ===
                    1 && (
                    <Item >
                        <Link to="/allSMSChats" >
                        Go to E-fax
                        </Link>
                    </Item>
            )}
    
    
            </Menu>
            }
        </>
    )
}

export default NavbarClicked ;



















// import React from 'react'
// import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
// // import {FaRegCopy, FaList,FaEllipsisV, FaShareAlt} from 'react-icons/fa'
// // import {RiSendPlaneFill, RiDeleteBin6Line} from 'react-icons/ri'
// import './clickmenu.css'
// import { Link } from "react-router-dom";


// const NavbarClick = (props) => {
   
//     return (
//         <>
//             <ContextMenuTrigger id="NavbarClick">
//               {props.children }
//             </ContextMenuTrigger>
 
//             <ContextMenu id="NavbarClick">
//                 {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
//                     JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
//                     1 && (
//                         <MenuItem >
//                             <Link to="/newSMSChat" className="link-color rightclick-menu-item">
//                                 Go to Dashboard           
//                             </Link>
//                     </MenuItem>

//                     )}
//                 {JSON.parse(sessionStorage.getItem("userInfo")) !== null &&
//                     JSON.parse(sessionStorage.getItem("userInfo")).extension.sms ===
//                     1 && (
//                         <MenuItem >
//                             <Link to="/allSMSChats" className="link-color rightclick-menu-item">
//                                 Check SMS
//                             </Link>
//                     </MenuItem>
//                     )}
//                     <MenuItem >
//                         <Link to="/allCalls" className="link-color rightclick-menu-item">
//                             Go to Call logs
//                         </Link>
//                     </MenuItem>
//             </ContextMenu>
//         </>
//     )
// }

// export default NavbarClick;
