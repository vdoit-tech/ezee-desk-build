import React, { useContext, useEffect, useState } from "react";

import UserContext from "../../context/useragent/userContext";

import DataBase from "nedb";
import path from "path";

import { Link } from "react-router-dom";
import avatar from "../../assets/imgs/avatar.png";
import person from "../../assets/imgs/person.jfif";
import people from "../../assets/imgs/people.png";
import upload from "../../assets/imgs/upload.png";
import pdf from "../../assets/imgs/pdf.png";
import jpegHome from "../../assets/imgs/jpeg-home.jpg";
import sun from "../../assets/imgs/sun.jpg";
import maple from "../../assets/imgs/maple.jpg";
import cherry from "../../assets/imgs/cherry.jpg";
import business from "../../assets/imgs/business.jpg";
import system from "../../assets/imgs/system.jpg";
import download from "../../assets/imgs/download.jfif";

// const logger = window.require("electron").remote.require("./logger");

const Documents = (props) => {
  const userContext = useContext(UserContext);

  const {
    setNavHeader,
    setNavSubHeader,
    userAgentInfo,
    dilaerFun,
    sessionInfo,
  } = userContext;

  const [element, setElement] = useState(null);
  var smsdb = new DataBase({
    filename: path.join(__dirname, "/smschats.db"),
    autoload: true,
  });

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "Documents");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("Documents");
    setNavSubHeader("");
    // logger.logInfo("Get all central contact...");
    // logger.logInfo("Change Nav header...");
  }, []);

  const [type, setType] = useState("media");

  let media = [avatar, person, people, upload];
  let count = [1, 2, 3, 4, 5];
  let imgs = [jpegHome, maple, sun, cherry];
  let img2 = [system, business, people, person];

  //function for searching phone numbers
  const searchTerm = (num) => {
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
      <div className="row mt-2 position-relative">
        <div className="form-group me-4 mt-4 mb-2">
          <i className="fas fa-search" />
          <input
            placeholder="Search"
            className="form-control sidebar-search rounded-pill"
            onChange={(e) => setElement(e.target.value)}
          />
        </div>
        <div className="my-2">
          <button
            onClick={() => setType("media")}
            className="btn btn-sm me-2 btn-secondary"
            style={{ cursor: "pointer" }}
          >
            Media
          </button>
          <button
            onClick={() => setType("document")}
            className="btn btn-secondary btn-sm mx-2"
            style={{ cursor: "pointer" }}
          >
            Documents
          </button>
        </div>
        {type == "media" && (
          <>
            <>
              {imgs.map((item) => (
                <span className="col-3 p-3 my-2 d-flex justify-content-center">
                  <img
                    src={item}
                    alt=""
                    className="m-3 p-1"
                    style={{ height: 200, width: 300, border: "1px solid" }}
                  />
                </span>
              ))}
            </>
            <>
              {img2.map((item) => (
                <span className="col-3 p-3 my-2 d-flex justify-content-center">
                  <img
                    src={item}
                    alt=""
                    className="m-3 p-1"
                    style={{ height: 200, width: 300, border: "1px solid" }}
                  />
                </span>
              ))}
            </>

            {count.map((i) => {
              return (
                <div className="row" key={i}>
                  {media.map((item) => (
                    <span className="col-3 p-3 my-2 d-flex justify-content-center">
                      <img
                        src={item}
                        alt=""
                        className="m-3 p-1"
                        style={{ height: 200, width: 300, border: "1px solid" }}
                      />
                    </span>
                  ))}
                </div>
              );
            })}
          </>
        )}
        {type == "document" && (
          <>
            <div>
              <span className="py-3 fw-bold text-secondary">THIS MONTH</span>
              {count.map((contact, index) => {
                return (
                  <div key={index} className="my-1">
                    <div className=" row py-1 contact d-flex">
                      <span className="" style={{ display: "contents" }}>
                        <img
                          src={pdf}
                          alt=""
                          style={{ height: 20, width: 20 }}
                        />
                      </span>
                      <div className="col row">
                        <div className="col-10 contact-flex">
                          <div className="col">
                            <div>
                              <div className="fs-6 fw-bold">
                                sample_123457_abcfff_45647www.pdf
                              </div>
                              <div>
                                <span>2 pages</span>
                                <span className=" text-uppercase mx-2">
                                  44KB
                                </span>
                                <span className="fst-italic text-uppercase mx-2">
                                  PDF
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-2  row d-flex align-items-end">
                          <span>10/03/2022</span>
                        </div>
                      </div>
                    </div>
                    <div className=" row py-1 contact d-flex">
                      <span className="" style={{ display: "contents" }}>
                        <img
                          src={pdf}
                          alt=""
                          style={{ height: 20, width: 20 }}
                        />
                      </span>
                      <div className="col row">
                        <div className="col-10 contact-flex">
                          <div className="col">
                            <div>
                              <div className="fs-6 fw-bold">passport.pdf</div>
                              <div>
                                <span>3 pages</span>
                                <span className=" text-uppercase mx-2">
                                  67KB
                                </span>
                                <span className="fst-italic text-uppercase mx-2">
                                  PDF
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-2  row d-flex align-items-end">
                          <span>18/03/2022</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <span className="my-3 fw-bold text-secondary">FEBRUARY</span>
              {count.map((contact, index) => {
                return (
                  <div key={index}>
                    {
                      <div className=" row py-1 contact d-flex">
                        <span className="" style={{ display: "contents" }}>
                          <img
                            src={pdf}
                            alt=""
                            style={{ height: 20, width: 20 }}
                          />
                        </span>
                        <div className="col row">
                          <div className="col-10 contact-flex">
                            <div className="col">
                              <div>
                                <div className="fs-6 fw-bold">
                                  sample_123457_abcfff_45647www.pdf
                                </div>
                                <div>
                                  <span>2 pages</span>
                                  <span className=" text-uppercase mx-2">
                                    44KB
                                  </span>
                                  <span className="fst-italic text-uppercase mx-2">
                                    PDF
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="col-2  row d-flex align-items-end">
                            <span>17/02/2022</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Documents;
