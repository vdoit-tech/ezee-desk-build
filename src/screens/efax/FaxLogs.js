import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import Loader from "../../components/loader/Loader";
import { DisplayName, setCallImage } from "../../Constants/Helper";
import defaultPic from "../../assets/imgs/default-profile.png";
import noDataFound from "../../assets/imgs/no-items-found.png";
import moment from "moment";
import DataBase from "nedb";
import path from "path";

import EFaxClicked from "../../components/rightClickMenu/EfaxClicked";

const FaxLogs = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const {
    userAgentInfo,
    dilaerFun,
    setNavHeader,
    setNavSubHeader,
    sessionInfo,
  } = userContext;

  const { getAllEfax, all_efax, isGettingFax, isLoading, setShowOngoing } =
    contactContext;
  const [info, setInfo] = useState([]);
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });
  let days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat"];
  let today = new Date();
  // today = today.toISOString().split("T")[0];

  let yesterday = new Date(today);
  // yesterday = yesterday.toISOString().split("T")[0];

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "All Fax");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("All Fax");
    setNavSubHeader(null);

    getAllEfax();
    // getMyContact();
  }, []);
  useEffect(() => {
    let data = [];
    console.log(all_efax);

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
    console.log(data);
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

    console.log(arr2);

    setInfo(arr2);
  }, [all_efax]);

  return (
    <div className="container px-0">
      {isGettingFax === true || isLoading === true ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <Loader width="150px" height="150px" />
        </div>
      ) : (
        <>
          {info.length > 0 ? (
            info.map((i, index) => {
              // if (i.number == sessionStorage.getItem("my_telnyx_num")) {
              return (
                <EFaxClicked
                  index={index}
                  dialCall={() => {
                    setShowOngoing({
                      flag: true,
                      number: i.number.toString(),
                      image: null,
                    });
                    dilaerFun(i.number.toString(), userAgentInfo, sessionInfo);
                  }}
                  smsFun={() => {
                    smsdb.find({}, function (err, docs) {
                      let data = docs[0];

                      if (data !== undefined) {
                        let arr = Object.keys(data);
                        let num = i.number.toString();
                        console.log(arr, num);

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
                  firstNumber={i.number.toString()}
                  NumberLength={i.number.toString().length}
                  history={props.history}
                  addProfile={() => {
                    var len = i.number.toString().length;

                    props.history.push({
                      pathname: "/createContact",
                      state: {
                        addNumber: `${i.number
                          .toString()
                          .slice(len - 10, len)}`,
                        countryCode: `${i.number
                          .toString()
                          .slice(0, len - 10)}`,
                      },
                    });
                  }}
                >
                  <div
                    key={i.updated_at}
                    className="row d-flex mt-3  py-1 position-relative border-bottom  one-chat"
                  >
                    <div
                      className="row position-relative col-11"
                      onClick={() => {
                        console.log(i);
                        props.history.push({
                          pathname: "/faxChat",
                          state: {
                            number: i.number,
                            details: i.value,

                            id: i.id,
                          },
                        });
                      }}
                    >
                      <div className="col-3 d-flex align-items-center">
                        <div className="">
                          <img
                            src={
                              setCallImage(i.number) !== null
                                ? setCallImage(i.number)
                                : defaultPic
                            }
                            alt=""
                            className="call-person-img"
                          />
                        </div>
                        <div className="mx-4 ">
                          <div className="fs-6 fw-bold px-0 d-flex  flex-column">
                            <span>
                              <DisplayName num={i.number} />
                            </span>
                            <span>{i.number}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-6"></div>

                      <div className="col-3 d-flex align-items-center justify-content-start ps-5">
                        <div className="mx-4 ">
                          <div className="px-0 d-flex ">
                            <span className="me-2">
                              {today.toISOString().split("T")[0] ===
                              i.value[0].time.split("T")[0]
                                ? "Today"
                                : yesterday.toISOString().split("T")[0] ===
                                  i.value[0].time.split("T")[0]
                                ? "Yesterday"
                                : moment(i.value[0].time.split("T")[0]).format(
                                    "M-DD-YYYY"
                                  )}
                              ,
                            </span>
                            <span>
                              {moment
                                .utc(i.value[0].time)
                                .local()
                                .format("hh:mm A")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-1 d-flex align-items-center"></div>
                  </div>
                </EFaxClicked>
              );
              // }
            })
          ) : (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "80vh" }}
            >
              <img
                src={noDataFound}
                alt="no data found"
                style={{ height: "300px" }}
              />
            </div>
          )}
        </>
      )}
      <div></div>
    </div>
  );
};
export default FaxLogs;
