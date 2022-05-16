import { useContext, useEffect, useState } from "react";
import "../contact.css";
import ContactContext from "../../../context/contact/contactContext";
import Loader from "../../../components/loader/Loader";
import person from "../../../assets/imgs/default-profile.png";
import UserContext from "../../../context/useragent/userContext";
import noDataFound from "../../../assets/imgs/no-items-found.png";
import DataBase from "nedb";
import path from "path";
import { Link } from "react-router-dom";
import ContactClicked from "../../../components/rightClickMenu/ContactClicked";
import log from "../../../context/logger/log";

const RemoteContact = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const {
    userAgentInfo,
    dilaerFun,
    setNavHeader,
    setNavSubHeader,
    sessionInfo,
  } = userContext;
  const { getRemoteContact, setShowOngoing } = contactContext;
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "Extensions");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("Extensions");
    setNavSubHeader("");
    log.info("Change Nav Header in Remote Contact");
  }, []);
  const [element, setElement] = useState(null);

  return (
    <div className="container  px-0">
      {(JSON.parse(sessionStorage.getItem("remote_contacts")) === null &&
        sessionStorage.getItem("remote_contacts") === undefined) ||
      typeof JSON.parse(sessionStorage.getItem("remote_contacts")) ===
        "string" ||
      (JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
        JSON.parse(sessionStorage.getItem("remote_contacts")).length == 0) ? (
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
      ) : (
        // <div></div>
        <div className="row mt-2 position-relative">
          <div className="form-group mt-2  me-4 mb-4">
            <i className="fas fa-search" />
            <input
              placeholder="Search Contact"
              className="form-control sidebar-search rounded-pill"
              onChange={(e) => setElement(e.target.value)}
            />
            {/* {`${found} found `} */}
          </div>
          {JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
            sessionStorage.getItem("remote_contacts") !== undefined &&
            JSON.parse(sessionStorage.getItem("remote_contacts")).length > 0 &&
            JSON.parse(sessionStorage.getItem("remote_contacts"))
              .filter((item) => {
                if (element !== null) {
                  if (
                    (element !== null &&
                      item.name !== null &&
                      item.name
                        .toLowerCase()
                        .includes(element.toLowerCase())) ||
                    (element !== null &&
                      item.email !== null &&
                      item.email
                        .toLowerCase()
                        .includes(element.toLowerCase())) ||
                    (item.telnyx_phone !== null &&
                      item.telnyx_phone.toLowerCase().includes(element)) ||
                    (item.extension_no !== null &&
                      item.extension_no.toString().includes(element))
                  ) {
                    return item;
                  }
                } else if (element === null) {
                  return item;
                }
              })
              .map((contact, index) => {
                return (
                  <div>
                    <ContactClicked
                      smsNumber={contact.telnyx_phone}
                      dialcall={() => {
                        setShowOngoing({
                          flag: true,
                          number: contact.extension_no.toString(),
                          image: null,
                        });
                        dilaerFun(
                          contact.extension_no.toString(),
                          userAgentInfo,
                          sessionInfo
                        );
                        log.info(
                          "Call",
                          contact.extension_no.toString(),
                          "through context right click in remote contacts"
                        );
                      }}
                      index={index}
                      smsfun={() => {
                        smsdb.find({}, function (err, docs) {
                          let data = docs[0];
                          log.info(
                            "SMS",
                            contact.extension_no.toString(),
                            "through context right click in remote contacts"
                          );

                          let arr = Object.keys(data);
                          let num = contact.telnyx_phone;
                          if (num !== null || num !== "null") {
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
                      <div key={index} className="row py-1 contact d-flex">
                        <span className="" style={{ display: "contents" }}>
                          <img
                            src={
                              contact.profile !== null
                                ? contact.profile
                                : person
                            }
                            alt=""
                            className="contact-image"
                          />
                          <span
                            className="position-absolute  register-icon"
                            style={{
                              background: `${
                                contact.is_online === 0
                                  ? "gray"
                                  : contact.is_online === 1
                                  ? "#3ffb10"
                                  : contact.is_online === 2
                                  ? "yellow"
                                  : "red"
                              }`,
                              marginTop: "1.9rem",
                              marginLeft: "1.9rem",
                            }}
                          ></span>
                        </span>
                        <div className="col row">
                          <div className="col-10  change-flex">
                            <div className="col d-flex  flex-column">
                              <div className="fs-6 fw-bold ">
                                {contact.name}
                              </div>
                              <div className="fs-6 ">
                                {contact.extension_no}
                              </div>
                            </div>
                            <div className="col  d-flex  flex-column mt-1">
                              <div className="fs-6 ">
                                <span className="fw-bold me-1">email:</span>
                                {contact.email}
                              </div>
                              <div className="fs-6  ">
                                {contact.telnyx_phone !== null && (
                                  <span>
                                    <span className="fw-bold">SMS number</span>
                                    {contact.telnyx_phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-2 d-flex justify-content-end align-items-center">
                            {JSON.parse(sessionStorage.getItem("userInfo")) !==
                              null &&
                              JSON.parse(sessionStorage.getItem("userInfo"))
                                .extension.calling === 1 && (
                                <i
                                  id={`call-btn${index}`}
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "20px",
                                    cursor: "pointer",
                                  }}
                                  className="fas fa-phone-alt fs-6 mx-3"
                                  onClick={() => {
                                    let elem = document.getElementById(
                                      `call-btn${index}`
                                    );
                                    elem.style.background = "rgb(256 256 256)";
                                    elem.style.boxShadow =
                                      "rgb(0 0 0 / 85%) 0px 1px 1px";
                                    elem.style.transform = "translateY(4px)";

                                    setTimeout(() => {
                                      elem.style.background = "transparent";
                                      elem.style.boxShadow = "none";
                                      elem.style.transform = "translateY(0px)";
                                    }, 150);
                                    setShowOngoing({
                                      flag: true,
                                      number: contact.extension_no.toString(),
                                      image: null,
                                    });
                                    dilaerFun(
                                      contact.extension_no.toString(),
                                      userAgentInfo,
                                      sessionInfo
                                    );

                                    log.info(
                                      "Call",
                                      contact.extension_no.toString(),
                                      "through icon click in remote contacts"
                                    );
                                  }}
                                />
                              )}

                            {/* {JSON.parse(sessionStorage.getItem("userInfo")) !==
                            null &&
                            JSON.parse(sessionStorage.getItem("userInfo"))
                              .extension.sms === 1 && (
                              <i
                                style={{
                                  visibility: `${
                                    contact.telnyx_phone !== null
                                      ? "visible"
                                      : "hidden"
                                  }`,
                                }}
                                className="fas fa-envelope mx-3"
                                onClick={() => {
                                  smsdb.find({}, function (err, docs) {
                                    let data = docs[0];

                                    let arr = Object.keys(data);
                                    let num = contact.telnyx_phone;
                                    if (num !== null || num !== "null") {
                                      if (arr.includes(num)) {
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
                              />
                            )} */}
                          </div>
                        </div>
                      </div>
                    </ContactClicked>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
};

export default RemoteContact;
