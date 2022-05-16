import React, { useEffect, useContext, useState } from "react";
import "./Dialpad.css";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import Tone from "../../Constants/sound";

const Dialpad = (props) => {
  const [inputNumber, setInputNumber] = useState("");
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { sessionInfo, userAgentInfo, dilaerFun } = userContext;
  const { setShowOngoing } = contactContext;

  useEffect(() => {
    console.log("number", props.onlineNumber);
    if (props.onlineNumber !== null && props.openCount == 1) {
      setInputNumber(props.onlineNumber.replace(/\D/g, ""));
    } else if (props.openCount == 0) {
      setInputNumber("");
    }
  }, [props.onlineNumber, props.dialpadInput]);
  // useEffect(() => {
  //   if (props.openCount == 0) {

  //   }
  // }, [props.dialpadInput]);

  const callFunction = (inputNumber, userAgentInfo, sessionInfo) => {
    console.log(inputNumber, userAgentInfo, sessionInfo);
    dilaerFun(inputNumber, userAgentInfo, sessionInfo);
    setTimeout(() => {
      props.setCallDivHeight();
      setInputNumber("");
    }, [500]);
  };

  // stop 2 seconds after the current time
  var dtmfFrequencies = {
    1: { f1: 697, f2: 1209 },
    2: { f1: 697, f2: 1336 },
    3: { f1: 697, f2: 1477 },
    4: { f1: 770, f2: 1209 },
    5: { f1: 770, f2: 1336 },
    6: { f1: 770, f2: 1477 },
    7: { f1: 852, f2: 1209 },
    8: { f1: 852, f2: 1336 },
    9: { f1: 852, f2: 1477 },
    "*": { f1: 941, f2: 1209 },
    0: { f1: 941, f2: 1336 },
    "#": { f1: 941, f2: 1477 },
  };

  return (
    <div
      className="container-fluid  d-flex justify-content-center align-items-center 
      px-0"
    >
      <div className="dialpad-area  d-flex justify-content-center align-items-center">
        <div className="row mt-0">
          <div className="col d-flex justify-content-center align-items-center">
            <input
              type="text"
              placeholder="Enter Number"
              id="input-key"
              className="search-dial-input mb-4 px-2 text-center fs-5"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter" && inputNumber !== "") {
                  setShowOngoing({
                    flag: true,
                    number: inputNumber,
                    image: null,
                  });
                  callFunction(inputNumber, userAgentInfo, sessionInfo);
                }
              }}
            />
            <span className="d-flex align-items-center mb-4">
              <div
                className="back mb-1"
                id="back"
                onClick={() => setInputNumber(inputNumber.slice(0, -1))}
              >
                <i className="fas fa-backspace fs-6" />
              </div>
            </span>
          </div>

          <div className="col-12 d-flex justify-content-center">
            <span className="mx-2">
              <div
                className="number  pb-3"
                value="1"
                onClick={() => {
                  setInputNumber(inputNumber.concat(1));
                  // let freq1 = dtmfFrequencies[1].f1;
                  // let freq2 = dtmfFrequencies[1].f2;
                  // Tone(freq1, freq2);
                }}
              >
                1<div className="sub fw-normal"></div>
              </div>
            </span>
            <span className="mx-2  ">
              <div
                className="number"
                value="2"
                onClick={() => {
                  setInputNumber(inputNumber.concat(2));
                  // let freq1 = dtmfFrequencies[2].f1;
                  // let freq2 = dtmfFrequencies[2].f2;
                  // Tone(freq1, freq2);
                }}
              >
                2<div className="sub fw-normal pb-2">ABC</div>
              </div>
            </span>
            <span className="mx-2 ">
              <div
                className="number"
                value="3"
                onClick={() => {
                  setInputNumber(inputNumber.concat(3));
                  // let freq1 = dtmfFrequencies[3].f1;
                  // let freq2 = dtmfFrequencies[3].f2;
                  // Tone(freq1, freq2);
                }}
              >
                3<div className="sub fw-normal pb-2">DEF</div>
              </div>
            </span>
          </div>

          <div className="col-12 d-flex justify-content-center">
            <span className="mx-2">
              <div
                className="number"
                value="4"
                onClick={() => {
                  setInputNumber(inputNumber.concat(4));
                  // let freq1 = dtmfFrequencies[4].f1;
                  // let freq2 = dtmfFrequencies[4].f2;
                  // Tone(freq1, freq2);
                }}
              >
                4<div className="sub fw-normal pb-2">GHI</div>
              </div>
            </span>
            <span className="mx-2 ">
              <div
                className="number"
                value="5"
                onClick={() => {
                  setInputNumber(inputNumber.concat(5));
                  // let freq1 = dtmfFrequencies[5].f1;
                  // let freq2 = dtmfFrequencies[5].f2;
                  // Tone(freq1, freq2);
                }}
              >
                5<div className="sub fw-normal pb-2">JKL</div>
              </div>
            </span>

            <span className="mx-2 ">
              <div
                className="number"
                value="6"
                onClick={() => {
                  setInputNumber(inputNumber.concat(6));
                  // let freq1 = dtmfFrequencies[6].f1;
                  // let freq2 = dtmfFrequencies[6].f2;
                  // Tone(freq1, freq2);
                }}
              >
                6<div className="sub fw-normal pb-2">MNO</div>
              </div>
            </span>
          </div>
          <div className="col-12 d-flex justify-content-center">
            <span className="mx-2">
              <div
                className="number"
                value="7"
                onClick={() => {
                  setInputNumber(inputNumber.concat(7));
                  // let freq1 = dtmfFrequencies[7].f1;
                  // let freq2 = dtmfFrequencies[7].f2;
                  // Tone(freq1, freq2);
                }}
              >
                7<div className="sub fw-normal pb-2">PQRS</div>
              </div>
            </span>

            <span className="mx-2 ">
              <div
                className="number"
                value="8"
                onClick={() => {
                  setInputNumber(inputNumber.concat(8));
                  // let freq1 = dtmfFrequencies[8].f1;
                  // let freq2 = dtmfFrequencies[8].f2;
                  // Tone(freq1, freq2);
                }}
              >
                8<div className="sub fw-normal pb-2">TUV</div>
              </div>
            </span>

            <span className="mx-2 ">
              <div
                className="number"
                value="3"
                onClick={() => {
                  setInputNumber(inputNumber.concat(9));
                  // let freq1 = dtmfFrequencies[9].f1;
                  // let freq2 = dtmfFrequencies[9].f2;
                  // Tone(freq1, freq2);
                }}
              >
                9<div className="sub fw-normal pb-2">WXYZ</div>
              </div>
            </span>
          </div>

          <div className="col-12 d-flex justify-content-center">
            <span className="mx-2">
              <div
                className="number"
                value="*"
                onClick={() => {
                  setInputNumber(inputNumber.concat("*"));
                  // let freq1 = dtmfFrequencies["*"].f1;
                  // let freq2 = dtmfFrequencies["*"].f2;
                  // Tone(freq1, freq2);
                }}
              >
                *
              </div>
            </span>
            <span className="mx-2 ">
              <div
                className="number"
                value="0"
                onClick={() => {
                  setInputNumber(inputNumber.concat(0));
                  // let freq1 = dtmfFrequencies[0].f1;
                  // let freq2 = dtmfFrequencies[0].f2;
                  // Tone(freq1, freq2);
                }}
              >
                0
              </div>
            </span>
            <span className="mx-2 ">
              <div
                className="number"
                value="#"
                onClick={() => {
                  setInputNumber(inputNumber.concat("#"));
                  // let freq1 = dtmfFrequencies["#"].f1;
                  // let freq2 = dtmfFrequencies["#"].f2;
                  // Tone(freq1, freq2);
                }}
              >
                #
              </div>
            </span>
          </div>

          {/* ------*/}
          <div className="col-12 d-flex justify-content-center ">
            <button
              className="call ms-1"
              id="call"
              onClick={() => {
                inputNumber !== "" &&
                  sessionStorage.setItem("redialNumber", inputNumber);

                if (
                  sessionStorage.getItem("redialNumber") !== undefined &&
                  sessionStorage.getItem("redialNumber") !== null &&
                  inputNumber == ""
                ) {
                  setInputNumber(sessionStorage.getItem("redialNumber"));
                } else if (inputNumber !== "") {
                  setShowOngoing({
                    flag: true,
                    number: inputNumber,
                    image: null,
                  });
                  callFunction(inputNumber, userAgentInfo, sessionInfo);
                }
              }}
            >
              <i className="fas fa-phone-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialpad;
