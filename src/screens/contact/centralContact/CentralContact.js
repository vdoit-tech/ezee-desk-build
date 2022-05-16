import React, { useContext, useEffect, useState } from "react";

import ContactContext from "../../../context/contact/contactContext";
import UserContext from "../../../context/useragent/userContext";
import defaultPic from "../../../assets/imgs/default-profile.png";
import Loader from "../../../components/loader/Loader";
import noDataFound from "../../../assets/imgs/no-items-found.png";
import "../myContact/MyContact.css";
import DataBase from "nedb";
import path from "path";
import log from "../../../context/logger/log";

import { Link } from "react-router-dom";
import RightClickMenu from "../../../components/rightClickMenu/RightClickMenu";
import ContactClicked from "../../../components/rightClickMenu/ContactClicked";
// const logger = window.require("electron").remote.require("./logger");

const CentralContact = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);

  const {
    setNavHeader,
    setNavSubHeader,
    userAgentInfo,
    dilaerFun,
    sessionInfo,
  } = userContext;
  const { get_central_contact, getCentralContact, setShowOngoing } =
    contactContext;
  const [element, setElement] = useState(null);
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    getCentralContact();
    sessionStorage.setItem("currentNavHeader", "Central Contacts");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("Central Contacts");
    setNavSubHeader("");
    // logger.logInfo("Get all central contact...");
    // logger.logInfo("Change Nav header...");
  }, []);

  //function for searching phone numbers
  const searchTerm = (num) => {
    log.info("Searched", num, "in central contacts");
    let arr = [];
    num.phoneDetail.map((detail) => {
      arr.push(detail);
    });
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].phone.includes(element)) {
        return num;
      }
    }
  };

  return (
    <div className=" container px-0">
      {(JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
        JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
        typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
          "string") ||
      (JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
        JSON.parse(sessionStorage.getItem("central_contacts")).length == 0) ? (
        <div className="row mt-2 position-relative">
          <div className="form-group me-4 mt-4 mb-2">
            <i className="fas fa-search" />
            <input
              placeholder="Search Contact"
              className="form-control sidebar-search rounded-pill"
              onChange={(e) => setElement(e.target.value)}
            />
          </div>

          {JSON.parse(sessionStorage.getItem("central_contacts"))
            .filter((item) => {
              if (
                (element !== null &&
                  element !== null &&
                  item.name.toLowerCase().includes(element.toLowerCase())) ||
                (element !== null &&
                  item.email.toLowerCase().includes(element.toLowerCase())) ||
                (element !== null &&
                  item.address.toLowerCase().includes(element.toLowerCase())) ||
                (element !== null &&
                  item.company.toLowerCase().includes(element.toLowerCase()))
              ) {
                return item;
              } else if (element === null) {
                return item;
              } else {
                if (searchTerm(item) == item) {
                  return item;
                }
              }
            })

            .map((contact, index) => {
              return (
                <div key={index}>
                  {
                    <ContactClicked
                      index={index}
                      dialcall={() => {
                        setShowOngoing({
                          flag: true,
                          number: contact.phoneDetail[0].phone.toString(),
                          image: null,
                        });
                        dilaerFun(
                          contact.phoneDetail[0].phone.toString(),
                          userAgentInfo,
                          sessionInfo
                        );
                        log.info(
                          "called",
                          contact.phoneDetail[0].phone.toString(),
                          "through context right click in central contacts"
                        );
                      }}
                      smsfun={() => {
                        smsdb.find({}, function (err, docs) {
                          let data = docs[0];
                          log.info(
                            "SMS",
                            contact.phoneDetail[0].phone.toString(),
                            "through context right click in my contact"
                          );

                          if (data !== undefined) {
                            let arr = Object.keys(data);
                            log.info(arr);
                            let num = contact.phoneDetail[0].phone;
                            log.info(arr, num);

                            if (arr.includes(num)) {
                              sessionStorage.setItem(
                                "currentChats",
                                JSON.stringify(data[num])
                              );
                              sessionStorage.setItem("currentMember", num);
                              props.history.push({
                                pathname: `/SMSChat/${num}`,
                                state: {
                                  chats: data[num],
                                },
                              });
                            } else if (!arr.includes(num)) {
                              props.history.push({
                                pathname: `/newSMSChat`,
                                state: {
                                  contactNum: num,
                                },
                              });
                            }
                          }
                        });
                      }}
                    >
                      <div className=" row py-1 contact d-flex">
                        <span className="" style={{ display: "contents" }}>
                          <img
                            src={
                              contact.image !== null
                                ? contact.image
                                : defaultPic
                            }
                            alt=""
                            className="contact-image"
                          />
                        </span>
                        <div className="col row">
                          <div className="col-10 contact-flex">
                            <div className="col">
                              <div>
                                {" "}
                                <div className="fs-6 fw-bold">
                                  {contact.name}
                                </div>
                                <div>
                                  {contact.phoneDetail.length > 1 ? (
                                    <></>
                                  ) : (
                                    <>
                                      <span>
                                        {" "}
                                        {contact.phoneDetail[0].phone}
                                      </span>
                                      <span className="fst-italic text-uppercase mx-2">
                                        {contact.phoneDetail[0].phone_type}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div>{contact.email}</div>
                              </div>
                            </div>

                            <div className="d-flex flex-column fs-6 col">
                              <span className="mx-1">
                                <span className="fw-bold">Address:</span>{" "}
                                {contact.address}
                              </span>
                              <span className="mx-1">
                                <span className="fw-bold">Company:</span>{" "}
                                {contact.company}
                              </span>
                            </div>
                          </div>
                          <div className="col-2  row">
                            {/* call icons */}

                            <div className="col-sm-3 col-xs-12 d-flex justify-content-end align-items-center">
                              {JSON.parse(
                                sessionStorage.getItem("userInfo")
                              ) !== null &&
                                JSON.parse(sessionStorage.getItem("userInfo"))
                                  .extension.calling === 1 && (
                                  <i
                                    id={`call-btn${index}`}
                                    className="fas fa-phone-alt fs-6 mx-3"
                                    style={{
                                      padding: "0.5rem",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                    }}
                                    onClick={() => {
                                      let elem = document.getElementById(
                                        `call-btn${index}`
                                      );
                                      elem.style.background =
                                        "rgb(256 256 256)";
                                      elem.style.boxShadow =
                                        "rgb(0 0 0 / 85%) 0px 1px 1px";
                                      elem.style.transform = "translateY(4px)";

                                      setTimeout(() => {
                                        elem.style.background = "transparent";
                                        elem.style.boxShadow = "none";
                                        elem.style.transform =
                                          "translateY(0px)";
                                      }, 150);
                                      setShowOngoing({
                                        flag: true,
                                        number:
                                          contact.phoneDetail[0].phone.toString(),
                                        image: null,
                                      });
                                      dilaerFun(
                                        contact.phoneDetail[0].phone.toString(),
                                        userAgentInfo,
                                        sessionInfo
                                      );
                                      log.info(
                                        "Call",
                                        contact.phoneDetail[0].phone.toString(),
                                        "through icon click in central contact"
                                      );
                                    }}
                                  />
                                )}

                              {JSON.parse(
                                sessionStorage.getItem("userInfo")
                              ) !== null &&
                                JSON.parse(sessionStorage.getItem("userInfo"))
                                  .extension.sms === 1 && (
                                  <i
                                    id={`sms-btn${index}`}
                                    style={{
                                      padding: "0.5rem",
                                      borderRadius: "20px",
                                      cursor: "pointer",
                                    }}
                                    className="fas fa-envelope mx-3"
                                    onClick={() => {
                                      let elem = document.getElementById(
                                        `sms-btn${index}`
                                      );
                                      elem.style.background =
                                        "rgb(256 256 256)";
                                      elem.style.boxShadow =
                                        "rgb(0 0 0 / 85%) 0px 1px 1px";
                                      elem.style.transform = "translateY(4px)";

                                      setTimeout(() => {
                                        elem.style.background = "transparent";
                                        elem.style.boxShadow = "none";
                                        elem.style.transform =
                                          "translateY(0px)";
                                      }, 150);
                                      smsdb.find({}, function (err, docs) {
                                        let data = docs[0];
                                        log.info(
                                          "go to send SMS to",
                                          contact.phoneDetail[0].phone,
                                          "through icon click in central contacts"
                                        );
                                        let arr = Object.keys(data);
                                        let num = contact.phoneDetail[0].phone;

                                        if (arr.includes(num)) {
                                          sessionStorage.setItem(
                                            "currentChats",
                                            JSON.stringify(data[num])
                                          );
                                          sessionStorage.setItem(
                                            "currentMember",
                                            num
                                          );
                                          props.history.push({
                                            pathname: `/SMSChat/${num}`,
                                            state: {
                                              chats: data[num],
                                            },
                                          });
                                        } else if (!arr.includes(num)) {
                                          props.history.push({
                                            pathname: `/newSMSChat`,
                                            state: {
                                              contactNum: num,
                                            },
                                          });
                                        }
                                      });
                                    }}
                                  />
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </ContactClicked>
                  }
                </div>
              );
            })}
        </div>
      ) : (
        <div
          className="d-flex align-items-center justify-content-center w-100"
          style={{ height: "90vh" }}
        >
          <span>
            <img
              src={noDataFound}
              style={{ width: "350px" }}
              alt="no data found"
            />
          </span>
        </div>
      )}
    </div>
  );
};

export default CentralContact;
