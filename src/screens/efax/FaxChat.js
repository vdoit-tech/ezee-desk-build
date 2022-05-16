import React, { useContext, useEffect, useState } from "react";
import LoginContext from "../../context/login/loginContext";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import Loader from "../../components/loader/Loader";
import ScrollToBottom from "react-scroll-to-bottom";

import axios from "axios";
import { Modal, Button } from "react-bootstrap";

import "./FaxChat.css";
import pdfIcon from "../../assets/imgs/pdf.png";

import { showNameOrNumber } from "../../Constants/Helper";
import moment from "moment";
import { FILE_UPLOAD, SEND_EFAX_API } from "../../Constants/Api";
import { fileUploadAPI, sendEfaxAPI } from "../../Constants/ApiHelper";

const FaxChat = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const loginContext = useContext(LoginContext);
  const { collapse_sidebar } = loginContext;

  const { setNavHeader, setNavSubHeader } = userContext;
  // const { sendEfax, isFaxing } = contactContext;

  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [dates, setDates] = useState([]);
  const [dateTime, setDateTime] = useState([]);
  const [preview, setPreview] = useState(false);
  const [arr, setArr] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [faxing, setFaxing] = useState(false);
  const [displayPdf, setDisplayPdf] = useState(false);

  const { number, details } = props.location.state;

  let today = new Date();

  let yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);
  useEffect(() => {
    let isMounted = true;
    // console.log(props.location.state);
    // console.log(number);
    // console.log(name);
    if (isMounted) {
      sessionStorage.setItem("currentNavHeader", showNameOrNumber(number));
      setNavHeader(sessionStorage.getItem("currentNavHeader"));
      setNavHeader(showNameOrNumber(number));
      setNavSubHeader(null);

      details !== null &&
        details.map((i) => {
          setDates((dates) => {
            return [...dates, i.time.split("T")[0]];
          });
        });
      details !== null &&
        details.map((i) => {
          setDateTime((dateTime) => {
            return [...dateTime, i.time];
          });
        });
    }
    return () => {
      isMounted = false;
    };
  }, []);

  const pdfFileHandler = (event) => {
    setPreview(true);
    let file = event.target.files[0];

    if (event.target.files.length > 0) {
      if (file.type == "application/pdf") {
        setPreview(true);
        setPdfFile({
          filePreview: URL.createObjectURL(file),

          documentAsFile: file,
        });

        event.target.value = null;
      } else {
        document.getElementById("file-type-error").innerHTML =
          "choose a pdf file";
        setTimeout(() => {
          document.getElementById("file-type-error").innerHTML = "";
        }, 2000);
        setPreview(false);
        setPdfFile(null);

        event.target.value = null;
      }
    } else {
      setPreview(false);
      setPdfFile(null);

      event.target.value = null;
    }
  };

  const sendEfax = async (from, to) => {
    const telnyxToken = sessionStorage.getItem("telnyx_token");

    let token = sessionStorage.getItem("token");

    setFaxing(true);
    fileUploadAPI(token, pdfFile.documentAsFile).then(async ({ flag, res }) => {
      if (flag == "success") {
        setPdfUrl(res.data.data);

        setFaxing(true);
        sendEfaxAPI(telnyxToken, from, to, res.data.data).then(
          ({ status, response }) => {
            if (status == "success") {
              setArr([...arr, response.data.data]);
              setPreview(false);
              setFaxing(false);
              setPdfFile(null);
            } else if (status == "fail") {
              setFaxing(false);
              alert("Some error occurred!!");
              console.error(response);
            }
          }
        );
      } else if (flag == "fail") {
        setFaxing(false);
        alert("Some error occurred!!");
        console.log(res);
      }
    });
  };

  return (
    <ScrollToBottom
      className="chat-window w-100 h-100  position-relative"
      initialScrollBehavior="auto"
    >
      <div className="mt-2 position-fixed  w-100 d-flex justify-content-start ">
        <span className=" fs-1" onClick={() => props.history.goBack()}>
          <i className="fas fa-arrow-left fs-5"></i>
        </span>
      </div>
      <div className="">
        <div className="container-fluid min-vh-100  px-0">
          <div style={{ display: `${preview ? "" : "none"}` }}>
            <Modal
              show={preview}
              // onHide={props.setShow}
              backdrop="static"
              keyboard={false}
              centered
            >
              {/* <Modal.Body>modal body....</Modal.Body> */}
              <div className="text-center fs-5  py-4">
                <span className="fw-bold ms-1">
                  {/* {pdfFile !== null && pdfFile !== undefined && pdfFile.name} */}
                  {pdfFile !== null && pdfFile !== undefined && (
                    <iframe
                      title="document"
                      src={pdfFile.filePreview}
                      width="90%"
                      height="500px"
                    ></iframe>
                  )}
                </span>
              </div>
              <Modal.Footer className="py-0">
                <div>
                  {" "}
                  {pdfFile !== null &&
                    pdfFile !== undefined &&
                    pdfFile.documentAsFile.name}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPreview(false);
                    setPdfFile(null);
                  }}
                >
                  CANCEL
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    sendEfax(sessionStorage.getItem("my_telnyx_num"), number);
                  }}
                >
                  {faxing ? <Loader width="15" height="15" /> : "SEND"}
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
          <div className="row justify-content-center h-100">
            <div className="card-body fax-card-body ">
              {dates !== null &&
                [...new Set(dates)]
                  .sort((a, b) => (new Date(b) < new Date(a) ? 1 : -1))

                  .map((ele, index) => {
                    return (
                      <>
                        <div className="text-center mb-5">
                          <span className="my-3 header-date-span fw-600">
                            {today.toISOString().split("T")[0] === ele
                              ? "Today"
                              : yesterday.toISOString().split("T")[0] === ele
                              ? "Yesterday"
                              : ele}
                          </span>
                        </div>
                        {dateTime !== null &&
                          [...new Set(dateTime)]
                            .sort((a, b) =>
                              new Date(b) < new Date(a) ? 1 : -1
                            )

                            .map((item, index) => {
                              return (
                                <>
                                  {details.map((i) => {
                                    if (
                                      i.time.split("T")[0] === ele &&
                                      i.time === item
                                    ) {
                                      if (i.direction === "inbound") {
                                        return (
                                          <div className="row w-100 ">
                                            <div className="d-flex row justify-content-start mb-4 msg-container ">
                                              <div>
                                                <div className="fax-received-container row">
                                                  <div className="col-12 text-center">
                                                    <img
                                                      src={pdfIcon}
                                                      alt=""
                                                      className=""
                                                      style={{ height: "50px" }}
                                                    />
                                                  </div>

                                                  <div className="col-12 row">
                                                    <div className="col-4 d-flex flex-column ">
                                                      <span>{i.status}</span>
                                                      <span>
                                                        {i.page_count !==
                                                          undefined &&
                                                          `${i.page_count} Pages`}
                                                      </span>
                                                    </div>
                                                    <div className="col-4 d-flex ">
                                                      Document
                                                    </div>
                                                    <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                                                      <Modal
                                                        show={
                                                          displayPdf !==
                                                            false &&
                                                          displayPdf == i.id
                                                        }
                                                        backdrop="static"
                                                        keyboard={false}
                                                        centered
                                                      >
                                                        <div className="text-center fs-5  py-4">
                                                          <span className="fw-bold ms-1">
                                                            <iframe
                                                              title="document"
                                                              src={i.media_url}
                                                              width="90%"
                                                              height="500px"
                                                            ></iframe>
                                                          </span>
                                                        </div>
                                                        <Modal.Footer className="py-0">
                                                          <Button
                                                            variant="secondary"
                                                            onClick={() => {
                                                              setDisplayPdf(
                                                                false
                                                              );
                                                            }}
                                                          >
                                                            CLOSE
                                                          </Button>
                                                        </Modal.Footer>
                                                      </Modal>
                                                      <i
                                                        className="fas fa-eye"
                                                        onClick={() =>
                                                          setDisplayPdf(i.id)
                                                        }
                                                      />
                                                      <span className="d-flex align-items-center">
                                                        {moment
                                                          .utc(i.time)
                                                          .local()
                                                          .format("hh:mm A")}
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      } else if (i.direction === "outbound") {
                                        return (
                                          <div className="row w-100  justify-content-end ">
                                            <div className="d-flex flex-column align-items-end justify-content-end mb-4 float-end msg-container ">
                                              <div className="fax-send-container row">
                                                <div className="col-12 text-center">
                                                  <img
                                                    src={pdfIcon}
                                                    alt=""
                                                    className=""
                                                    style={{ height: "50px" }}
                                                  />
                                                </div>

                                                <div className="col-12 row">
                                                  <div className="col-4 d-flex flex-column ">
                                                    <span>{i.status}</span>
                                                    <span>
                                                      {i.page_count !==
                                                        undefined &&
                                                        `${i.page_count} Pages`}
                                                    </span>
                                                  </div>
                                                  <div
                                                    className="col-4 d-flex "
                                                    style={{
                                                      wordBreak: "break-word",
                                                    }}
                                                  >
                                                    {
                                                      i.media_url.split("/")[
                                                        i.media_url.split("/")
                                                          .length - 1
                                                      ]
                                                    }
                                                  </div>
                                                  <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                                                    <Modal
                                                      show={
                                                        displayPdf !== false &&
                                                        displayPdf == i.id
                                                      }
                                                      backdrop="static"
                                                      keyboard={false}
                                                      centered
                                                    >
                                                      <div className="text-center fs-5  py-4">
                                                        <span className="fw-bold ms-1">
                                                          <iframe
                                                            title="document"
                                                            src={i.media_url}
                                                            width="90%"
                                                            height="500px"
                                                          ></iframe>
                                                        </span>
                                                      </div>
                                                      <Modal.Footer className="py-0">
                                                        <Button
                                                          variant="secondary"
                                                          onClick={() => {
                                                            setDisplayPdf(
                                                              false
                                                            );
                                                          }}
                                                        >
                                                          CLOSE
                                                        </Button>
                                                      </Modal.Footer>
                                                    </Modal>
                                                    <i
                                                      className="fas fa-eye"
                                                      onClick={() =>
                                                        setDisplayPdf(i.id)
                                                      }
                                                    />
                                                    <span className="d-flex align-items-center">
                                                      {moment
                                                        .utc(i.time)
                                                        .local()
                                                        .format("hh:mm A")}
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }
                                    }
                                  })}
                                </>
                              );
                            })}

                        {/* receiver */}
                      </>
                    );
                  })}

              {arr.length > 0 &&
                arr.map((i, index) => {
                  return (
                    <div className="row w-100  justify-content-end ">
                      <div className="d-flex flex-column align-items-end justify-content-end mb-4 float-end msg-container ">
                        <div className="fax-send-container row">
                          <div className="col-12 text-center">
                            <img
                              src={pdfIcon}
                              alt=""
                              className=""
                              style={{ height: "50px" }}
                            />
                          </div>

                          <div className="col-12 row">
                            <div className="col-4 d-flex flex-column ">
                              <span>{i.status}</span>
                              <span>
                                {i.page_count !== undefined &&
                                  `${i.page_count} Pages`}
                              </span>
                            </div>
                            <div
                              className="col-4 d-flex "
                              style={{ wordBreak: "break-word" }}
                            >
                              {
                                i.media_url.split("/")[
                                  i.media_url.split("/").length - 1
                                ]
                              }
                            </div>
                            <div className="col-4 d-flex align-items-end flex-column justify-content-around ">
                              <Modal
                                show={
                                  displayPdf !== false && displayPdf == index
                                }
                                backdrop="static"
                                keyboard={false}
                                centered
                              >
                                <div className="text-center fs-5  py-4">
                                  <span className="fw-bold ms-1">
                                    <iframe
                                      title="document"
                                      src={i.media_url}
                                      width="90%"
                                      height="500px"
                                    ></iframe>
                                  </span>
                                </div>
                                <Modal.Footer className="py-0">
                                  <Button
                                    variant="secondary"
                                    onClick={() => {
                                      setDisplayPdf(false);
                                    }}
                                  >
                                    CLOSE
                                  </Button>
                                </Modal.Footer>
                              </Modal>
                              <i
                                className="fas fa-eye"
                                onClick={() => setDisplayPdf(index)}
                              />
                              <span className="d-flex align-items-center">
                                {moment
                                  .utc(i.created_at)
                                  .local()
                                  .format("hh:mm A")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              <div
                className={`row px-2  bottom-div pb-3 ${
                  collapse_sidebar
                    ? "send-fax-collapsed"
                    : "send-fax-uncollapsed"
                } d-flex justify-content-start m-0`}
              >
                <div id="file-type-error" className="text-danger mb-1"></div>
                <div
                  style={{ border: "2px solid #c12fc9" }}
                  className={
                    "col-1  py-2 d-flex flex-column align-items-center  bg-white rounded"
                  }
                >
                  <div className="d-flex align-items-center">
                    <label
                      htmlFor="file-input"
                      className="     
                 
                  "
                    >
                      <i className="fas fa-paperclip fs-5 mx-2" />
                    </label>
                    <input
                      style={{ display: "none" }}
                      id="file-input"
                      type="file"
                      name="upload"
                      accept="application/pdf"
                      onChange={(e) => pdfFileHandler(e)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollToBottom>
  );
};

export default FaxChat;
