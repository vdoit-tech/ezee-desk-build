import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../context/useragent/userContext";
import ContactContext from "../../context/contact/contactContext";
import Loader from "../../components/loader/Loader";
import person from "../../assets/imgs/default-profile.png";
import "./CreateContact.css";
import PopUp from "../../components/popup/PopUp";
import countryCodes from "./countryCode.json";

const CreateContact = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const { addContact, create_contact_response, isAdding, setAddContactText } =
    contactContext;
  const { setNavHeader } = userContext;

  const [image, setImage] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  // const [code, setCode] = useState(["+1"]);
  // const [phoneDetails, setPhoneDetails] = useState([
  //   { type: "work", number: null, default: 1 },
  // ]);
  const [code, setCode] = useState([
    props.location.state !== undefined &&
    props.location.state.countryCode !== undefined &&
    props.location.state.countryCode !== null
      ? props.location.state.countryCode
      : "+1",
  ]);
  const [phoneDetails, setPhoneDetails] = useState([
    {
      type: "work",
      number:
        props.location.state !== undefined &&
        props.location.state.addNumber !== undefined &&
        props.location.state.addNumber !== null
          ? props.location.state.addNumber
          : null,
      default: 1,
    },
  ]);
  const [phoneDetailsDuplicate, setPhoneDetailsDuplicate] = useState([
    {
      type: "work",
      number:
        props.location.state !== undefined &&
        props.location.state.addNumber !== undefined &&
        props.location.state.addNumber !== null
          ? props.location.state.addNumber
          : null,
      default: 1,
    },
  ]);

  const [defaultType, setDefaultType] = useState(0);

  const [responseText, setResponseText] = useState(null);

  const [pic, setPic] = useState(null);

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "Add Contact");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("Add Contact");
    setResponseText(null);
  }, []);

  useEffect(() => {
    console.log(defaultType);
    //changing phone details when the default type changes
    setPhoneDetails((info) => {
      let data = [...info];
      for (let i = 0; i < data.length; i++) {
        if (defaultType === i) {
          data[i].default = 1;
        } else {
          data[i].default = 0;
        }
      }
      console.log(data);

      return data;
    });
    setPhoneDetailsDuplicate((info) => {
      let data = [...info];
      for (let i = 0; i < data.length; i++) {
        if (defaultType === i) {
          data[i].default = 1;
        } else {
          data[i].default = 0;
        }
      }
      console.log(data);

      return data;
    });
  }, [defaultType]);

  const createContact = (props) => {
    // let data = {
    //   first_name: "shishui",
    //   last_name: "Uchiha",
    //   email: "shishui@konoha.com",
    //   phone: [{ type: "work", number: "11343", default: "1" }],
    //   address: "konoha",
    //   company: "LeafVillage",
    //   description: "abc",
    // };
    console.log(phoneDetails);
    let arr = phoneDetails.slice();

    if (firstName === "") {
      document.getElementById("firstname").style.border = "1px solid #dc3545";
    }
    if (lastName === "") {
      document.getElementById("lastname").style.border = "1px solid #dc3545";
    }
    if (email === "") {
      document.getElementById("email").style.border = "1px solid #dc3545";
    }
    if (phoneDetails[0].number == null) {
      document.getElementById("phone-number").style.border =
        "1px solid #dc3545";
    }
    if (phoneDetails[0].number !== null) {
      let count = 0;
      phoneDetails.map((i) => {
        if (i.number.includes("+")) {
          let val = i.number.replace("+", "");
          if (val.match(/^[0-9]+$/) == null) {
            count = 1;
            document.getElementById("phone-alert").innerHTML =
              "Enter a valid number";
          }
          if (i.number.match(/^[0-9]+$/) == null) {
            count = 1;
            document.getElementById("phone-alert").innerHTML =
              "Enter a valid number";
          }
        }
        if (i.number.length !== 10) {
          count = 1;
          document.getElementById("phone-alert").innerHTML =
            "Enter a valid number";
        }
      });

      if (
        count == 0 &&
        firstName !== "" &&
        lastName !== "" &&
        email !== "" &&
        phoneDetails.length > 0 &&
        phoneDetails[0].number !== null
      ) {
        //checking if email is valid
        let email_format = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
        if (email.match(email_format)) {
          // arr = arr
          //   .filter((item) => item.type !== null && item.number !== null)
          //   .map((j, k) => {
          //     j.number = code[k] + j.number;
          //     return j;
          //   })
          //   ;
          let detail = {};
          detail = {
            first_name: firstName,
            // middle_name: middleName,
            last_name: lastName,
            email: email,
            phone: arr
              .filter((item) => item.type !== null && item.number !== null)
              .map((j, k) => {
                j.number = code[k] + j.number;
                return j;
              }),

            address: address,
            company: company,
            description: description,
          };
          console.log(detail, phoneDetails);
          addContact(detail, image); //calling add contact API
        } else if (!email.match(email_format)) {
          document.getElementById("email").style.border = "1px solid #dc3545";
          document.getElementById("email-span").innerHTML = "Enter valid email";
        }
      }
    }
  };

  //function to handle image changes
  const ImageHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      if (img.size <= 5000000) {
        setPic(URL.createObjectURL(img));
        setImage(img);
        event.target.value = null;
      } else {
        alert("File size should be less than 5 MB");
        event.target.value = null;
      }
    }
  };

  useEffect(() => {
    setResponseText("Contact Added Successfully");
  }, [create_contact_response]);

  useEffect(() => {
    setResponseText(null);
    console.log(responseText);
  }, []);

  //on closing the pop up
  const handleClose = () => {
    setAddContactText(null);
    props.history.push("/myContact");
  };
  return (
    <div className="container position-relative" style={{ paddingTop: "3px" }}>
      <span className="px-1 " onClick={() => props.history.goBack()}>
        <i className="fas fa-arrow-left fs-5"></i>
      </span>
      <div className="row mt-3 pt-5">
        <div className="col px-0 ">
          <fieldset>
            <div className="row">
              <div className="col-8 p-0 row">
                <div className="col-8 px-0" id="float-label">
                  <label htmlFor="firstname">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="firstname"
                    className="form-control my-1"
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      document.getElementById("firstname").style.border =
                        "1px solid #ced4da";
                    }}
                    required
                  />
                </div>
                <div className="col-8 p-0" id="float-label">
                  <label htmlFor="middlename">Middle Name</label>
                  <input
                    id="middlename"
                    className="form-control my-1"
                    onChange={(e) => setMiddleName(e.target.value)}
                  />
                </div>
                <div className="col-8 p-0" id="float-label">
                  <label htmlFor="lastname">Last Name</label>
                  <span className="text-danger">*</span>
                  <input
                    id="lastname"
                    className="form-control my-1"
                    onChange={(e) => {
                      setLastName(e.target.value);
                      document.getElementById("lastname").style.border =
                        "1px solid #ced4da";
                    }}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="col px-0 d-flex flex-column align-items-center">
                  <img
                    src={pic !== null ? pic : person}
                    style={{
                      height: "80px",
                      width: "80px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    alt=""
                  />
                  <div className="d-flex">
                    <label
                      htmlFor="file-input"
                      className="ms-1 my-2 btn btn-primary"
                    >
                      CHOOSE
                    </label>

                    <label
                      className="btn btn-danger my-2 ms-1"
                      onClick={() => {
                        setPic(null);
                        setImage(null);
                      }}
                    >
                      REMOVE
                    </label>
                  </div>
                  <input
                    type="file"
                    id="file-input"
                    onChange={ImageHandler}
                    accept=".png,.jpeg"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
              <div></div>
            </div>
            <div className="row">
              <div className="col px-0" id="float-label">
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
                <span id="email-span" className="text-danger"></span>
                <input
                  id="email"
                  type="email"
                  className="form-control my-1"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    document.getElementById("email").style.border =
                      "1px solid #ced4da";
                    document.getElementById("email-span").innerHTML = "";
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col px-0" id="float-label">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  className="form-control my-1"
                  onChange={(e) => {
                    setCompany(e.target.value);
                    document.getElementById("company").style.border =
                      "1px solid #ced4da";
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col px-0" id="float-label">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  className="form-control my-1"
                  onChange={(e) => {
                    setAddress(e.target.value);
                    document.getElementById("address").style.border =
                      "1px solid #ced4da";
                  }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col px-0">
                <label htmlFor="description" className="p-0 pt-3 py-1">
                  Description
                </label>
                <textarea
                  id="description"
                  type="text"
                  className="form-control my-1"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </fieldset>
          <fieldset className="mt-4">
            <legend>
              <h4 onClick={() => console.log(phoneDetails)}>
                Numbers <span className="text-danger">*</span>
              </h4>
            </legend>

            <div className="d-flex flex-column">
              {/* display added numbers */}

              {phoneDetails.length > 0 &&
                phoneDetails.map((i, index) => {
                  return (
                    <span
                      key={index}
                      className=" d-flex align-items-center position-relative   my-1 "
                    >
                      <table className="w-100">
                        <thead
                          className=""
                          style={{
                            visibility: `${index === 0 ? "" : "hidden"}`,
                          }}
                        >
                          <tr>
                            <th> Type </th>
                            <th>
                              Number
                              <span
                                id="phone-alert"
                                className="ms-2 fw-normal text-danger"
                              ></span>
                            </th>
                            <th className="text-center">default</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="w-25">
                              <select
                                className="form-control "
                                defaultValue="choose"
                                onChange={(e) => {
                                  setPhoneDetails(() => {
                                    let data = [...phoneDetails];
                                    data[index].type = e.target.value;
                                    return data;
                                  });
                                  setPhoneDetailsDuplicate(() => {
                                    let data = [...phoneDetailsDuplicate];
                                    data[index].type = e.target.value;
                                    return data;
                                  });
                                }}
                              >
                                <option> Work </option>
                                <option> Mobile </option>
                                <option> Home </option>
                                <option> Fax </option>
                              </select>
                            </td>
                            <td className="w-100 d-flex">
                              <select
                                className="form-control w-25"
                                defaultValue={code[index]}
                                onChange={(e) => {
                                  setCode(() => {
                                    let data = [...code];
                                    data[index] = e.target.value;
                                    return data;
                                  });
                                }}
                              >
                                {countryCodes.countries
                                  .filter((a, b) => a.code !== b.code)
                                  .map((i) => {
                                    return <option>{i.code}</option>;
                                  })}
                              </select>
                              <input
                                id="phone-number"
                                className="form-control w-75"
                                value={phoneDetailsDuplicate[index].number}
                                pattern="[0-9.]+"
                                type="text"
                                onChange={(e) => {
                                  document.getElementById(
                                    "phone-alert"
                                  ).innerHTML = "";
                                  if (e.target.value.match(/^[0-9\s]*$/)) {
                                    setPhoneDetails(() => {
                                      let data = [...phoneDetails];
                                      data[index].number = e.target.value;
                                      return data;
                                    });
                                    setPhoneDetailsDuplicate(() => {
                                      let data = [...phoneDetailsDuplicate];
                                      data[index].number = e.target.value;
                                      return data;
                                    });
                                  } else {
                                    setPhoneDetails(() => {
                                      let data = [...phoneDetails];
                                      data[index].number = "";
                                      return data;
                                    });
                                    setPhoneDetailsDuplicate(() => {
                                      let data = [...phoneDetailsDuplicate];
                                      data[index].number = "";
                                      return data;
                                    });
                                  }

                                  document.getElementById(
                                    "phone-number"
                                  ).style.border = "1px solid #ced4da";
                                }}
                              />
                            </td>
                            <td className="text-center">
                              <input
                                type="radio"
                                // value={`default${index}`}
                                name="default"
                                checked={defaultType === index}
                                onChange={() => {
                                  setDefaultType(index);
                                  if (phoneDetails.length === 1) {
                                    setDefaultType(0);
                                  }
                                }}
                              />
                            </td>
                            {/* add phone numbers*/}
                            <td className="d-flex justify-content-end">
                              {index == 0 ? (
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => {
                                    //inserts an object in phoneDetails array with below values
                                    setPhoneDetails([
                                      ...phoneDetails,
                                      {
                                        type: "work",
                                        number: null,
                                        default: 0,
                                      },
                                    ]);
                                    setCode([...code, "+1"]);
                                    setPhoneDetailsDuplicate([
                                      ...phoneDetailsDuplicate,
                                      {
                                        type: "work",
                                        number: null,
                                        default: 0,
                                      },
                                    ]);
                                  }}
                                >
                                  Add
                                </button>
                              ) : (
                                <span
                                  // style={{
                                  //   visibility: `${index > 0 ? "" : "hidden"}`,
                                  // }}
                                  className={`px-3 py-1 ms-1  text-danger rounded border border-dark`}
                                  onClick={() => {
                                    setPhoneDetails(
                                      phoneDetails.filter(
                                        (item) =>
                                          phoneDetails.indexOf(item) !== index
                                      )
                                    );
                                    setCode(
                                      code.filter(
                                        (item) => code.indexOf(item) !== index
                                      )
                                    );
                                    setPhoneDetailsDuplicate(
                                      phoneDetailsDuplicate.filter(
                                        (item) =>
                                          phoneDetailsDuplicate.indexOf(
                                            item
                                          ) !== index
                                      )
                                    );
                                  }}
                                >
                                  <i className="fas fa-times fs-5" />
                                </span>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </span>
                  );
                })}
            </div>
          </fieldset>
        </div>
      </div>

      <span className="d-flex flex-column justify-content-start mt-5 mb-2 bottom-0 end-0">
        <div>
          <button
            className="btn btn-warning rounded-pill px-4 "
            onClick={() => {
              createContact();
            }}
          >
            {isAdding === true ? (
              <Loader width="30px" height="30px" />
            ) : (
              "Create"
            )}
          </button>
        </div>
        <div className="fs-6 fw-bold mb-2 text-danger">
          <span id="response-text">
            {responseText !== null && (
              <PopUp
                show={responseText !== null ? true : false}
                handleClose={handleClose}
                message={responseText}
              />
            )}
          </span>
        </div>
      </span>
    </div>
  );
};

export default CreateContact;
