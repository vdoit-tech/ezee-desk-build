import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import ContactContext from "../../../context/contact/contactContext";
import UserContext from "../../../context/useragent/userContext";

import person from "../../../assets/imgs/default-profile.png";
import noDataFound from "../../../assets/imgs/no-items-found.png";
import "../contact.css";
import "./MyContact.css";
import DataBase from "nedb";
import path from "path";
import { Link } from "react-router-dom";
import RightClickMenu from "../../../components/rightClickMenu/RightClickMenu";
import ContactClicked from "../../../components/rightClickMenu/ContactClicked";
import log from "../../../context/logger/log";
import { Modal, Button } from "react-bootstrap";

const MyContact = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const {
    setNavHeader,
    setNavSubHeader,
    dilaerFun,
    userAgentInfo,
    sessionInfo,
  } = userContext;
  const { getMyContact, deleteContact, setShowOngoing } = contactContext;
  let history = useHistory();

  const primaryPhone = [];
  const [element, setElement] = useState(null);
  const [deleteSure, setDeleteSure] = useState({ flag: false, deleteId: null });
  const [deleting, setDeleting] = useState(false);
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "My Contacts");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("My Contacts");
    setNavSubHeader("");
    getMyContact();
    log.info("Get My Contact and change nav header");
  }, []);

  //function for searching phone number

  const searchTerm = (num) => {
    log.info("Searched", num, "in my contact");
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

  const handleDelete = async () => {
    setDeleting(true);
    deleteSure.deleteId.map(async (details, i) => {
      await deleteContact(details.id);
    });
    await getMyContact();
    await setDeleteSure({ flag: false, deleteId: null });
    await setDeleting(false);
  };

  return (
    <div className=" container px-0">
      <Modal
        show={deleteSure.flag}
        // onHide={props.setShow}
        backdrop="static"
        keyboard={false}
        centered
      >
        <div className={`text-center fs-5 py-4 text-danger my-2`}>
          {deleting ? "Deleting..." : "Are you sure to delete this contact?"}
        </div>
        {!deleting && (
          <Modal.Footer className="py-0">
            <Button
              variant="danger"
              onClick={() => {
                handleDelete();
              }}
            >
              Yes
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteSure({ flag: false, deleteId: null });
              }}
            >
              No
            </Button>
          </Modal.Footer>
        )}
      </Modal>
      {
        <div className="row mt-4 ">
          {(JSON.parse(sessionStorage.getItem("my_contacts")) === null &&
            JSON.parse(sessionStorage.getItem("my_contacts")) === undefined) ||
          typeof JSON.parse(sessionStorage.getItem("my_contacts")) ===
            "string" ||
          (JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
            JSON.parse(sessionStorage.getItem("my_contacts")).length == 0) ? (
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
            <>
              <div className="form-group me-4 mb-2">
                <i className="fas fa-search" />
                <input
                  placeholder="Search Contact"
                  className="form-control sidebar-search rounded-pill"
                  onChange={(e) => setElement(e.target.value)}
                />
              </div>

              <div>
                {JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
                JSON.parse(sessionStorage.getItem("my_contacts")) !==
                  undefined &&
                JSON.parse(sessionStorage.getItem("my_contacts")).length > 0
                  ? JSON.parse(sessionStorage.getItem("my_contacts"))
                      .filter((item) => {
                        if (
                          (element !== null &&
                            item.name
                              .toLowerCase()
                              .includes(element.toLowerCase())) ||
                          (element !== null &&
                            item.email
                              .toLowerCase()
                              .includes(element.toLowerCase())) ||
                          (element !== null &&
                            item.address
                              .toLowerCase()
                              .includes(element.toLowerCase())) ||
                          (element !== null &&
                            item.company
                              .toLowerCase()
                              .includes(element.toLowerCase()))
                        ) {
                          return item;
                        } else if (element === null || element === "") {
                          return item;
                        } else {
                          if (searchTerm(item) == item) {
                            return item;
                          }
                        }
                      })
                      .map((contact, index) => {
                        return (
                          <>
                            {
                              <ContactClicked
                                dialcall={() => {
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
                                    "through context right click in my contact"
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
                                    let num = contact.phoneDetail[0].phone;
                                    if (data !== undefined) {
                                      let arr = Object.keys(data);

                                      log.info(arr, num);
                                      let chats =
                                        sessionStorage.getItem("currentChats");

                                      if (arr.includes(num)) {
                                        if (
                                          chats == null ||
                                          chats == undefined
                                        ) {
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
                                        } else if (
                                          JSON.parse(chats).length >
                                            data[num].length &&
                                          (JSON.parse(chats)[0].from == num ||
                                            JSON.parse(chats)[0].to == num)
                                        ) {
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
                                        } else {
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
                                        }
                                      } else if (!arr.includes(num)) {
                                        props.history.push({
                                          pathname: `/newSMSChat`,
                                          state: {
                                            contactNum: num,
                                          },
                                        });
                                      }
                                    } else {
                                      props.history.push({
                                        pathname: `/newSMSChat`,
                                        state: {
                                          contactNum: num,
                                        },
                                      });
                                    }
                                  });
                                }}
                                index={index}
                                deletefun={() => {
                                  log.info(
                                    "Delete",
                                    contact.phoneDetail[0].phone.toString(),
                                    "through context right click in my contact"
                                  );
                                  setDeleteSure({
                                    flag: true,
                                    deleteId: contact.phoneDetail,
                                  });
                                }}
                                editProfile={() => {
                                  log.info(
                                    "Edit",
                                    contact.phoneDetail[0].phone.toString(),
                                    "through context right click in my contact"
                                  );
                                  props.history.push({
                                    pathname: "/contactProfile",
                                    state: {
                                      id: contact.phoneDetail.map((i) => {
                                        return i.id;
                                      }),
                                      name: contact.name,
                                      phone_details: contact.phoneDetail,
                                      image:
                                        contact.image !== null
                                          ? contact.image
                                          : person,
                                      email: contact.email,
                                      address: contact.address,
                                      company: contact.company,
                                      description: contact.description,
                                    },
                                  });
                                }}
                              >
                                <div
                                  className=" row py-1 contact d-flex"
                                  key={contact.email}
                                  style={{ cursor: "pointer" }}
                                >
                                  <span
                                    className=""
                                    style={{ display: "contents" }}
                                  >
                                    <img
                                      src={`${
                                        contact.image !== null
                                          ? contact.image
                                          : person
                                      }`}
                                      alt=""
                                      className="contact-image"
                                    />
                                  </span>
                                  <div className="col row d-flex">
                                    <div className="col-10  contact-flex">
                                      <div
                                        className="d-flex col-5"
                                        onClick={() => {
                                          log.info(
                                            "Go to Contact Profile",
                                            contact.phoneDetail[0].phone.toString(),
                                            "through icon click in my contact"
                                          );
                                          props.history.push({
                                            pathname: "/contactProfile",
                                            state: {
                                              id: contact.phoneDetail.map(
                                                (i) => {
                                                  return i.id;
                                                }
                                              ),
                                              name: contact.name,
                                              phone_details:
                                                contact.phoneDetail,
                                              image:
                                                contact.image !== null
                                                  ? contact.image
                                                  : person,
                                              email: contact.email,
                                              address: contact.address,
                                              company: contact.company,
                                              description: contact.description,
                                            },
                                          });
                                        }}
                                      >
                                        <div className="mx-2 ">
                                          <div className="fs-6  fw-bold">
                                            {contact.name}
                                          </div>
                                          <div>
                                            {contact.phoneDetail.length > 1 ? (
                                              <>
                                                {contact.phoneDetail.map(
                                                  (phoneItem, i) => {
                                                    if (
                                                      phoneItem.default === 1
                                                    ) {
                                                      const id = phoneItem.id;
                                                      const num =
                                                        phoneItem.phone;
                                                      const obj = {};
                                                      obj[id] = num;

                                                      primaryPhone.push(obj);
                                                      return (
                                                        <div key={i}>
                                                          <span className="pe-1">
                                                            {phoneItem.phone}
                                                          </span>
                                                          <span className="fst-italic text-uppercase">
                                                            {
                                                              phoneItem.phone_type
                                                            }
                                                          </span>
                                                        </div>
                                                      );
                                                    }
                                                  }
                                                )}
                                              </>
                                            ) : (
                                              <>
                                                {contact.phoneDetail.map(
                                                  (detail) => {
                                                    const id = detail.id;
                                                    const num = detail.phone;
                                                    const obj = {};
                                                    obj[id] = num;

                                                    primaryPhone.push(obj);

                                                    return (
                                                      <>
                                                        <span className="me-1">
                                                          {detail.phone}
                                                        </span>
                                                        <span className="fst-italic text-uppercase">
                                                          {detail.phone_type}
                                                        </span>
                                                      </>
                                                    );
                                                  }
                                                )}
                                              </>
                                            )}
                                          </div>
                                          <div>{contact.email}</div>
                                        </div>
                                      </div>
                                      {/* ---- */}
                                      <div
                                        className="d-flex flex-column fs-6 col-6 justify-content-end"
                                        onClick={() => {
                                          log.info(
                                            "Go to contact profile ",
                                            contact.name,
                                            "through My Contacts"
                                          );
                                          props.history.push({
                                            pathname: "/contactProfile",
                                            state: {
                                              id: contact.phoneDetail.map(
                                                (i) => {
                                                  return i.id;
                                                }
                                              ),
                                              name: contact.name,
                                              phone_details:
                                                contact.phoneDetail,
                                              image:
                                                contact.image !== null
                                                  ? contact.image
                                                  : person,
                                              email: contact.email,
                                              address: contact.address,
                                              company: contact.company,
                                              description: contact.description,
                                            },
                                          });
                                        }}
                                      >
                                        {contact.address !== "" && (
                                          <span className="mx-1">
                                            <span className="fw-bold me-2">
                                              Address:
                                            </span>
                                            {contact.address}
                                          </span>
                                        )}

                                        {contact.company !== "" && (
                                          <span className="mx-1">
                                            <span className="fw-bold me-2">
                                              Company:
                                            </span>
                                            {contact.company}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* ---- */}
                                    <div className="col-2   row">
                                      {/* call icons */}
                                      <div className="  d-flex justify-content-end align-items-center">
                                        {JSON.parse(
                                          sessionStorage.getItem("userInfo")
                                        ) !== null &&
                                          JSON.parse(
                                            sessionStorage.getItem("userInfo")
                                          ).extension.calling === 1 && (
                                            <i
                                              id={`call-btn${index}`}
                                              className="fas fa-phone-alt fs-6 mx-3"
                                              style={{
                                                padding: "0.5rem",
                                                borderRadius: "20px",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                const primaryArr = primaryPhone
                                                  .flatMap(Object.keys)
                                                  .map(Number);

                                                contact.phoneDetail.map((i) => {
                                                  if (
                                                    primaryArr.includes(i.id)
                                                  ) {
                                                    log.info(i.phone);
                                                    let elem =
                                                      document.getElementById(
                                                        `call-btn${index}`
                                                      );
                                                    elem.style.background =
                                                      "rgb(256 256 256)";
                                                    elem.style.boxShadow =
                                                      "rgb(0 0 0 / 85%) 0px 1px 1px";
                                                    elem.style.transform =
                                                      "translateY(4px)";

                                                    setTimeout(() => {
                                                      elem.style.background =
                                                        "transparent";
                                                      elem.style.boxShadow =
                                                        "none";
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
                                                      "Call ",
                                                      contact.phoneDetail[0].phone.toString(),
                                                      "through icon click in MY contacts"
                                                    );
                                                  }
                                                });
                                              }}
                                            />
                                          )}
                                        {JSON.parse(
                                          sessionStorage.getItem("userInfo")
                                        ) !== null &&
                                          JSON.parse(
                                            sessionStorage.getItem("userInfo")
                                          ).extension.sms === 1 && (
                                            <i
                                              className="fas fa-envelope mx-3"
                                              id={`sms-btn${index}`}
                                              style={{
                                                padding: "0.5rem",
                                                borderRadius: "20px",
                                                cursor: "pointer",
                                              }}
                                              onClick={() => {
                                                let elem =
                                                  document.getElementById(
                                                    `sms-btn${index}`
                                                  );
                                                elem.style.background =
                                                  "rgb(256 256 256)";
                                                elem.style.boxShadow =
                                                  "rgb(0 0 0 / 85%) 0px 1px 1px";
                                                elem.style.transform =
                                                  "translateY(4px)";

                                                setTimeout(() => {
                                                  elem.style.background =
                                                    "transparent";
                                                  elem.style.boxShadow = "none";
                                                  elem.style.transform =
                                                    "translateY(0px)";
                                                }, 150);

                                                smsdb.find(
                                                  {},
                                                  function (err, docs) {
                                                    let data = docs[0];
                                                    console.log("newDoc", data);
                                                    log.info(
                                                      "SMS ",
                                                      contact.phoneDetail[0].phone.toString(),
                                                      "through icon click in MY contacts"
                                                    );
                                                    let num =
                                                      contact.phoneDetail[0]
                                                        .phone;

                                                    if (data !== undefined) {
                                                      let arr =
                                                        Object.keys(data);

                                                      log.info(arr, num);
                                                      let chats =
                                                        sessionStorage.getItem(
                                                          "currentChats"
                                                        );

                                                      if (arr.includes(num)) {
                                                        if (
                                                          chats == null ||
                                                          chats == undefined
                                                        ) {
                                                          sessionStorage.setItem(
                                                            "currentChats",
                                                            JSON.stringify(
                                                              data[num]
                                                            )
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
                                                        } else if (
                                                          JSON.parse(chats)
                                                            .length >
                                                            data[num].length &&
                                                          (JSON.parse(chats)[0]
                                                            .from == num ||
                                                            JSON.parse(chats)[0]
                                                              .to == num)
                                                        ) {
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
                                                        } else {
                                                          sessionStorage.setItem(
                                                            "currentChats",
                                                            JSON.stringify(
                                                              data[num]
                                                            )
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
                                                        }
                                                      } else if (
                                                        !arr.includes(num)
                                                      ) {
                                                        props.history.push({
                                                          pathname: `/newSMSChat`,
                                                          state: {
                                                            contactNum: num,
                                                          },
                                                        });
                                                      }
                                                    } else {
                                                      props.history.push({
                                                        pathname: `/newSMSChat`,
                                                        state: {
                                                          contactNum: num,
                                                        },
                                                      });
                                                    }
                                                  }
                                                );
                                              }}
                                            />
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </ContactClicked>
                            }
                          </>
                        );
                      })
                  : log.info("worked")}
              </div>
            </>
          )}
        </div>
      }
    </div>
  );
};

export default MyContact;
