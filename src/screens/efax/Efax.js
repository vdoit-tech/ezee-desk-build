import React, { useState, useEffect, useContext } from "react";
import ContactContext from "../../context/contact/contactContext";
import UserContext from "../../context/useragent/userContext";
import Loader from "../../components/loader/Loader";
import "./Efax.css";
import uploadFile from "../../assets/imgs/upload.png";
import axios from "axios";
import PopUp from "../../components/popup/PopUp";
import { FILE_UPLOAD, SEND_EFAX_API } from "../../Constants/Api";
import { fileUploadAPI, sendEfaxAPI } from "../../Constants/ApiHelper";
const Efax = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { setNavHeader, setNavSubHeader } = userContext;
  const { getAllEfax, all_efax } = contactContext;
  const [to, setTo] = useState("");
  const [inputTo, setInputTo] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [efaxResponse, setEfaxResponse] = useState({
    text: null,
    color: "text-success",
  });
  const [disableSend, setDisableSend] = useState(false);
  const [phoneDetails, setPhoneDetails] = useState([]);
  const [info, setInfo] = useState([]);
  const [isFaxing, setIsFaxing] = useState(false);

  let remoteContacts =
    sessionStorage.getItem("remote_contacts") !== null &&
    sessionStorage.getItem("remote_contacts") !== undefined &&
    sessionStorage.getItem("remote_contacts");
  let myContacts = sessionStorage.getItem("my_contacts");

  useEffect(() => {
    let arr = [];
    myContacts !== undefined &&
      myContacts !== null &&
      typeof JSON.parse(myContacts) !== "string" &&
      JSON.parse(myContacts).length > 0 &&
      JSON.parse(myContacts).map((num, index) => {
        num.phoneDetail.map((i) => {
          arr.push({ name: num.name, phone: i.phone });
        });
      });
    setPhoneDetails(arr);
  }, []);
  useEffect(() => {
    setEfaxResponse({ text: null, color: "text-success" });

    sessionStorage.setItem("currentNavHeader", "E-Fax");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("E-Fax");
    setNavSubHeader("");
  }, []);

  const pdfHandler = async (event) => {
    setDisableSend(true);
    let from = sessionStorage.getItem("my_telnyx_num");

    let token = sessionStorage.getItem("token");
    console.log(pdfFile);

    let sendTo = to !== "" ? to : inputTo;
    console.log(sendTo);
    if (sendTo !== "") {
      fileUploadAPI(token, pdfFile).then(({ flag, res }) => {
        if (flag == "success") {
          sendFax(from, sendTo, res.data.data);
          setDisableSend(false);
        } else if (flag == "fail") {
          document.getElementById("number-error").innerHTML =
            "Some error occurred!!";
          setDisableSend(false);
          console.log(res);
        }
      });
    } else {
      document.getElementById("number-error").innerHTML = "Please Enter Number";
      setDisableSend(false);
    }
  };

  const pdfFileHandler = (event) => {
    console.log(event.target.files[0]);
    if (event.target.files.length > 0) {
      let file = event.target.files[0];
      if (file.type == "application/pdf") {
        if (file.size <= 5000000) {
          setPdfFile(file);

          event.target.value = null;
        } else {
          setPdfFile(null);

          document.getElementById("file-type-error").innerHTML =
            "Please choose file less than 5 MB";
          setTimeout(() => {
            document.getElementById("file-type-error").innerHTML = "";
          }, 2000);
        }
      } else {
        document.getElementById("file-type-error").innerHTML =
          "choose a pdf file";
        setTimeout(() => {
          document.getElementById("file-type-error").innerHTML = "";
        }, 2000);
        setPdfFile(null);

        event.target.value = null;
      }
    } else {
      setPdfFile(null);

      event.target.value = null;
    }
    //
  };

  const setDisabled = () => {
    if ((to === "" || inputTo === "") && pdfFile === null) {
      return true;
    } else if (disableSend === true) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    let data = [];
    // console.log(all_efax);

    all_efax !== null &&
      all_efax.map((i) => {
        if (
          i.direction === "inbound" &&
          i.to == sessionStorage.getItem("my_telnyx_num")
        ) {
          data.push({
            id: i.id,
            number: i.from,
            media_url: i.media_url,
            time: i.updated_at,
            direction: i.direction,
            page_count: i.page_count,
            status: i.status,
            failure_reason: i.failure_reason,
            quality: i.quality,
            from: i.from,
            to: i.to,
          });
        } else if (
          i.direction === "outbound" &&
          i.from == sessionStorage.getItem("my_telnyx_num")
        ) {
          data.push({
            id: i.id,
            number: i.to,
            media_url: i.media_url,
            time: i.updated_at,
            direction: i.direction,
            page_count: i.page_count,
            status: i.status,
            failure_reason: i.failure_reason,
            quality: i.quality,

            from: i.from,
            to: i.to,
          });
        }
      });
    // console.log(data);
    let arr2 = [];
    data.forEach((element) => {
      // remove duplicate name
      let match = arr2.find((r) => r.number == element.number);
      if (match) {
      } else {
        arr2.push({ number: element.number, value: [] });
      }
    });
    arr2.map((item) => {
      data.map((e) => {
        if (e.number == item.number) {
          item.value.push({
            id: e.id,
            media_url: e.media_url,
            direction: e.direction,
            time: e.time,

            page_count: e.page_count,
            status: e.status,
            failure_reason: e.failure_reason,
            quality: e.quality,
            to: e.to,
            from: e.from,
          });
        }
      });
    });

    // console.log(arr2);

    setInfo(arr2);
  }, [all_efax]);

  const sendFax = async (from, to, pdf) => {
    setIsFaxing(true);
    const token = sessionStorage.getItem("telnyx_token");

    sendEfaxAPI(token, from, to, pdf).then(async ({ status, response }) => {
      if (status == "success") {
        console.log(response);
        await getAllEfax();

        setEfaxResponse({
          text: "E-Fax sent successfully",
          color: "text-success",
        });
        setIsFaxing(false);
      } else if (status == "fail") {
        console.error(response);

        setEfaxResponse({
          text:
            response.message.slice(-3) == "422"
              ? "Invalid Number. Please try again"
              : "Some error occurred.",
          color: "text-danger",
        });

        setIsFaxing(false);
      }
    });
  };

  const handleClose = () => {
    info.length > 0 &&
      info.map((i, index) => {
        if (i.number == to || i.number == inputTo) {
          props.history.push({
            pathname: "/faxChat",
            state: {
              number: i.number,
              details: i.value,

              id: i.id,
            },
          });
        }
      });
    setEfaxResponse({ text: null, color: "text-success" });
  };

  return (
    <div className="container">
      <div
        className="row mt-5 pt-5 ps-2 text-danger fs-5"
        id="number-error"
      ></div>
      <div className="row mt-1">
        <div className="col-md-8">
          <label
            for="members"
            className="ps-1  mb-2 col"
            style={{ fontWeight: 700 }}
          >
            Select a fax number
          </label>

          <select
            className="form-select my-2 "
            id="members"
            onChange={(e) => {
              console.log(e.target.value);
              inputTo === "" && setTo(e.target.value);
              document.getElementById("number-error").innerHTML = "";
            }}
            disabled={inputTo !== ""}
          >
            <option selected disabled>
              Choose Contact
            </option>
            {remoteContacts !== undefined &&
              remoteContacts !== null &&
              remoteContacts !== "no data found" &&
              JSON.parse(remoteContacts).length > 0 &&
              JSON.parse(remoteContacts).map((num, index) => {
                if (
                  num.telnyx_phone !== null &&
                  num.telnyx_phone !== sessionStorage.getItem("my_telnyx_num")
                ) {
                  return (
                    <option key={num.telnyx_phone} value={num.telnyx_phone}>
                      {num.name}:{num.telnyx_phone}
                    </option>
                  );
                }
              })}
            {phoneDetails.length > 0 &&
              phoneDetails !== false &&
              phoneDetails.map((num, index) => {
                if (num.phone !== sessionStorage.getItem("my_telnyx_num"))
                  return (
                    <option key={num.phone} value={num.phone}>
                      {num.name}:{num.phone}
                    </option>
                  );
              })}
          </select>

          <div className=" mt-4 fs-5 fw-lighter mb-1">or</div>
          <div className="d-flex flex-column mt-2">
            <label
              htmlFor="new-number"
              className="ps-1 my-2 col "
              style={{ fontWeight: 700 }}
            >
              Enter a number
            </label>
            <input
              id="new-number"
              className="mt-2 py-1 mb-2"
              value={inputTo}
              onChange={(e) => {
                to === "" && setInputTo(e.target.value);
                document.getElementById("number-error").innerHTML = "";
              }}
              style={{ border: "1px solid #ced4da", borderRadius: "3px" }}
            />
          </div>
        </div>
        <div className="col-md-1"></div>
        <div className="col-md-3 row d-flex flex-column align-items-center justify-content-center ">
          <div
            id="file-type-error"
            className="text-danger fs-5 d-flex justify-content-center mb-1"
          ></div>
          <div className="col d-flex flex-column align-items-center justify-content-center upload-file-div">
            <img src={uploadFile} alt="upload" className="upload-file-icon" />
            <label
              htmlFor="file-input"
              className=" mt-2 text-center fs-6  choose-btn"
            >
              Choose Pdf File
            </label>
            <input
              style={{ display: "none" }}
              id="file-input"
              type="file"
              name="upload"
              accept="application/pdf"
              onChange={(e) => pdfFileHandler(e)}
            />
            <div className="mt-1" style={{ wordBreak: " break-all" }}>
              {pdfFile !== null && ` ${pdfFile.name}`}
            </div>
          </div>
        </div>
      </div>
      <div className="row my-2  pe-1 mt-5 pt-5">
        <span className="fs-5 fw-bold mb-2 ms-1">
          {efaxResponse.text !== null && (
            <PopUp
              show={efaxResponse.text !== null ? true : false}
              handleClose={handleClose}
              message={efaxResponse.text}
              color={efaxResponse.color}
            />
          )}
        </span>
        <span className="d-flex justify-content-start ">
          <button
            disabled={setDisabled()}
            className="btn text-white  py-2 px-4 ms-1"
            onClick={pdfHandler}
            style={{ background: "#d834de" }}
          >
            {isFaxing !== null && isFaxing === true ? (
              <Loader height="30px" width="30px" />
            ) : (
              "Send"
            )}
          </button>
        </span>
      </div>
    </div>
  );
};

export default Efax;
