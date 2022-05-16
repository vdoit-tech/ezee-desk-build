import React, { useContext, useEffect, useState } from "react";
import UserContext from "../../../context/useragent/userContext";
import ContactContext from "../../../context/contact/contactContext";
import Loader from "../../../components/loader/Loader";
import person from "../../../assets/imgs/default-profile.png";
import PopUp from "../../../components/popup/PopUp";
import axios from "axios";
import countryCodes from "../../createContact/countryCode.json";
import { Modal, Button } from "react-bootstrap";
import {
  CONTACT_IMAGE_UPDATE,
  UPDATE_CONTACT_API,
} from "../../../Constants/Api";
import { updateContactAPI, updateImageAPI } from "../../../Constants/ApiHelper";

const ContactProfile = (props) => {
  const userContext = useContext(UserContext);
  const contactContext = useContext(ContactContext);
  const {
    userAgentInfo,
    dilaerFun,
    setNavHeader,
    setNavSubHeader,
    sessionInfo,
  } = userContext;

  const {
    get_my_contact,
    getMyContact,
    updateContact,
    update_contact_response,
    isUpdating,
    addContact,
    deleteContact,
    isAdding,
    isLoading,
    setUpdateContactText,
    setShowOngoing,
  } = contactContext;

  const details = props.location.state;

  const [name, setName] = useState(details.name);

  const [email, setEmail] = useState(details.email);
  const [company, setCompany] = useState(details.company);
  const [address, setAddress] = useState(details.address);
  const [description, setDescription] = useState(details.description);
  const [image, setImage] = useState(details.image);
  const [newImg, setNewImg] = useState(details.image);
  const [edit, setEdit] = useState(false);
  const [responseText, setResponseText] = useState(false);
  const [newDetailsArr, setNewDetailsArr] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [changingContact, setChangingContact] = useState({
    flag: false,
    success: 0,
    response: "",
  });
  const [show, setShow] = useState(false);

  const [ids, setIds] = useState(
    get_my_contact !== null &&
      get_my_contact
        .map((i, index) => {
          if (i.email === details.email) {
            return i;
          }
        })
        .filter((k) => k !== undefined)[0]
        .phoneDetail.map((j) => {
          return j.id;
        })
  );

  const [phoneDetails, setPhoneDetails] = useState(
    get_my_contact !== null &&
      get_my_contact
        .map((i, index) => {
          if (i.email === details.email) {
            return i.phoneDetail;
          }
        })
        .filter((k) => k !== undefined)[0]
  );

  //initial phone details of contact
  const [initialDetails, setInitialDetails] = useState(
    get_my_contact !== null &&
      get_my_contact
        .map((i, index) => {
          if (i.email === details.email) {
            return i.phoneDetail;
          }
        })
        .filter((k) => k !== undefined)[0]
        .map((j) => {
          let data = {
            id: j.id,
            phone: null,
            phone_type: null,
            default: j.default,
          };
          return data;
        })
  );

  const [defaultType, setDefaultType] = useState(
    details.phone_details
      .map((i) => {
        if (i.default === 1) {
          return i.id;
        }
      })
      .filter((k) => k !== undefined)[0]
  );

  const [finalArr, setFinalArr] = useState([]);
  const [deleteSure, setDeleteSure] = useState({ flag: false, deleteId: null });

  useEffect(() => {
    sessionStorage.setItem("currentNavHeader", "Contact Profile");
    setNavHeader(sessionStorage.getItem("currentNavHeader"));
    setNavHeader("Contact Profile");
    setNavSubHeader("");
    console.log("Nav header Updated to contact Profile");
  }, []);

  useEffect(() => {
    //set phone details when contact detail changes
    setPhoneDetails(
      get_my_contact !== null &&
        get_my_contact
          .map((i, index) => {
            if (i.email === details.email) {
              return i.phoneDetail;
            }
          })
          .filter((k) => k !== undefined)[0]
    );
    //set ids when contact detail changes
    setIds(
      get_my_contact !== null &&
        get_my_contact
          .map((i, index) => {
            if (i.email === details.email) {
              return i;
            }
          })
          .filter((k) => k !== undefined)[0]
          .phoneDetail.map((j) => {
            return j.id;
          })
    );
    //set initial phone details when contact detail changes
    setInitialDetails(
      get_my_contact !== null &&
        get_my_contact
          .map((i, index) => {
            if (i.email === details.email) {
              return i.phoneDetail;
            }
          })
          .filter((k) => k !== undefined)[0]
          .map((j) => {
            let data = {
              id: j.id,
              phone: null,
              phone_type: null,
              default: j.default,
            };
            return data;
          })
    );

    //set default types of phone numbers when contact detail changes
    setDefaultType(
      get_my_contact !== null &&
        get_my_contact
          .map((i, index) => {
            if (i.email === details.email) {
              return i.phoneDetail;
            }
          })
          .filter((k) => k !== undefined)[0]
          .map((j) => {
            if (j.default === 1) {
              return j.id;
            }
          })
          .filter((m) => m !== undefined)[0]
    );

    console.log(
      "set Phone details, set Ids, set Initial Pone details, set Default Type of contact details changes in contact Profile"
    );
  }, [get_my_contact]);

  useEffect(() => {
    //set final details of phone when phoneDetails changes
    setFinalArr(() => {
      let obj = {};
      let data = [];
      phoneDetails.map((i) => {
        const key = i.id;
        const phone = i.phone;
        const phone_type = i.phone_type;
        const default_type = i.default;

        obj[key] = {
          phone_type: phone_type,
          phone: phone,
          default: default_type,
        };

        data.push(obj);
      });

      return data.filter((k, j) => j === 0);
    });
  }, [phoneDetails]);

  useEffect(() => {
    //set phone details when default type changes
    setPhoneDetails((info) => {
      let data = [...info];
      for (let i = 0; i < data.length; i++) {
        if (defaultType === data[i].id) {
          data[i].default = 1;
        } else {
          data[i].default = 0;
        }
      }

      return data;
    });
    //set initial details when default type changes
    setInitialDetails((info) => {
      if (info.length > 0) {
        let data = [...info];
        for (let i = 0; i < data.length; i++) {
          if (defaultType === data[i].id) {
            data[i].default = 1;
          } else {
            data[i].default = 0;
          }
        }
        return data;
      }
    });
    //set new details for default type when default type changes
    setNewDetailsArr((info) => {
      let data = [...info];
      for (let i = 0; i < data.length; i++) {
        if (defaultType === i) {
          data[i].default = 1;
        } else {
          data[i].default = 0;
        }
      }

      return data;
    });
  }, [defaultType]);

  useEffect(() => {
    console.log(isUpdating);
    console.log("update_contact_response", update_contact_response);
    setResponseText("Contact Updated Successfully");
    console.log("Contact Updated Successfully");
  }, [update_contact_response]);
  useEffect(() => {
    setResponseText(null);
    console.log(responseText);
  }, []);

  //change contact

  const changeContactDetails = async (data) => {
    console.log("data", data);
    setChangingContact({
      flag: true,
      success: 0,
      response: "",
    });
    const token = sessionStorage.getItem("token");
    const formData = new FormData();
    formData.append("data", data);
    updateContactAPI(token, data).then(({ status, response }) => {
      if (status == "success") {
        console.log(response.data.data);
        setShow(true);
        setChangingContact({
          flag: false,
          success: 1,
          response: "Contact updated successfully",
        });
      } else if (status == "fail") {
        setShow(true);
        setChangingContact({
          flag: false,
          success: 2,
          response: "Error while updating contact",
        });
      }
    });
  };

  //function called when contact is updated
  const handleClose = () => {
    if (changingContact.success == 1) {
      getMyContact();
      props.history.push("/myContact");
      setShow(false);
    } else {
      setShow(false);
    }
  };

  //function for sending all the edited details to the API
  const editedDetails = () => {
    console.log("called");
    let phoneData = {};
    let email_format = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
    //check for empty name
    if (name == "") {
      document.getElementById("name").innerText = "Name cannot be empty.";
      setTimeout(() => {
        document.getElementById("name").innerText = "";
      }, 2000);
      return null;
    }
    //check for incorrect email
    if (email == "") {
      document.getElementById("email-error").innerText =
        "Email cannot be empty.";
      setTimeout(() => {
        document.getElementById("email-error").innerText = "";
      }, 2000);
      return null;
    } else if (!email.match(email_format)) {
      document.getElementById("email-error").innerText = "Enter a valid email";
      setTimeout(() => {
        document.getElementById("email-error").innerText = "";
      }, 2000);
      return null;
    }

    //insert only the phone data that is different form initial values
    initialDetails.length > 0 &&
      initialDetails.map((item, index) => {
        if (item.id !== undefined) {
          // if (item.phone === null || item.phone === "") {
          //   document.getElementById(`phone-number-error-${index}`).innerText =
          //     "Phone number cannot be empty.";
          //   setTimeout(() => {
          //     document.getElementById(`phone-number-error-${index}`).innerText =
          //       "";
          //   }, 2000);
          //   return null;
          // }
          if (
            (item.phone !== null || item.phone !== "") &&
            item.phone_type === null
          ) {
            phoneData[item.id] = {
              phone: item.phone,
              default: item.default,
            };
          } else if (
            (item.phone === null || item.phone === "") &&
            item.phone_type !== null
          ) {
            phoneData[item.id] = {
              phone_type: item.phone_type,
              default: item.default,
            };
          } else if (
            (item.phone === null || item.phone === "") &&
            item.phone_type !== null
          ) {
            phoneData[item.id] = {
              phone_type: item.phone_type,
              default: item.default,
            };
          } else if (
            (item.phone !== null || item.phone !== "") &&
            item.phone_type !== null
          ) {
            phoneData[item.id] = {
              phone_type: item.phone_type,
              phone: item.phone,
              default: item.default,
            };
          } else if (
            (item.phone !== null || item.phone !== "") &&
            item.phone_type === null
          ) {
            phoneData[item.id] = {
              phone: item.phone,
              default: item.default,
            };
          } else if (
            (item.phone === null || item.phone === "") &&
            item.phone_type === null &&
            item.default !== null
          ) {
            phoneData[item.id] = {
              default: item.default,
            };
          } else if (
            (item.phone !== null || item.phone !== "") &&
            item.phone_type !== null &&
            item.default !== null
          ) {
            phoneData[item.id] = {
              phone_type: item.phone_type,
              phone: item.phone,
              default: item.default,
            };
          }
        } else if (
          (item.phone === null || item.phone === "") &&
          item.phone_type === null
        ) {
          phoneData[item.id] = {
            default: item.default,
          };
        }
      });

    ids.map((i) => {
      if (
        phoneData !== {} &&
        phoneData[i] !== undefined &&
        phoneData[i].phone === null
      ) {
        delete phoneData[i].phone;
      }
    });

    //update the phone details

    console.log(phoneData);
    Object.keys(phoneData).length !== 0 &&
      phoneData.constructor === Object &&
      changeContactDetails(phoneData);

    //updating details other than phone details
    let data = {};
    let finalData = {};

    name !== details.name && Object.assign(data, { name: name });

    email !== details.email &&
      email.match(email_format) &&
      Object.assign(data, { email: email });

    address !== details.address && Object.assign(data, { address: address });
    company !== details.company && Object.assign(data, { company: company });
    description !== details.description &&
      Object.assign(data, { description: description });

    //assigning data against phone id as the key
    console.log(ids);
    ids.map((i) => {
      finalData[i] = data;
    });
    console.log("finalData", finalData);
    //updating image if it is modified
    newImg !== details.image && updateImage();

    // updating contact details other than phone details
    console.log(phoneData);

    Object.keys(finalData).length !== 0 &&
      finalData.constructor === Object &&
      changeContactDetails(finalData);
    console.log("finalData", finalData);

    console.log("initialDetails", initialDetails);
    return null;
  };

  //function to be executed when new phone number added
  const createContact = () => {
    let data = {
      first_name: details.name.split(" ")[0],
      middle_name:
        details.name.split(" ").length > 2 ? details.name.split(" ")[1] : null,
      last_name:
        details.name.split(" ").length > 2
          ? details.name.split(" ")[2] !== undefined
            ? details.name.split(" ")[2]
            : null
          : details.name.split(" ")[1] !== undefined
          ? details.name.split(" ")[1]
          : null,
      email: details.email,
      phone: newDetailsArr,
      address: details.address,
      company: details.company,
      description: details.description,
      image: details.image,
    };
    console.log("Send all data for Add contact");
    addContact(data);
  };

  //function to handle change in the image
  const ImageHandler = (event) => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      console.log(img);
      setImage(URL.createObjectURL(img));
      setNewImg(img);
      console.log("Updated Image in Add contact");
    }
  };

  //function to update image for all the ids of the phone numbers
  const updateImage = async () => {
    console.log(ids, newImg);
    let token = sessionStorage.getItem("token");
    updateImageAPI(token, ids, newImg).then(({ status, response }) => {
      if (status == "success") {
        console.log("Image Updated Successfully in add contact....");
        // console.log(res);
      } else if (status == "fail") {
        console.log(
          "Error occur while updating image in Add contact....",
          response
        );
      }
    });
  };

  const handleDelete = async () => {
    setDeleting(true);
    if (phoneDetails.length > 1) {
      await deleteContact(deleteSure.deleteId);
      getMyContact();
      setDeleteSure({ flag: false, deleteId: null });
      setDeleting(false);
    } else {
      await deleteContact(deleteSure.deleteId);
      setDeleteSure({ flag: false, deleteId: null });
      setDeleting(false);
      props.history.push("/myContact");
    }
  };

  return (
    <div className=" container position-relative">
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
      <div className="d-flex mt-3 justify-content-between">
        <span onClick={() => props.history.goBack()}>
          <i className="fas fa-arrow-left fs-5" />
        </span>
        <span onClick={() => setEdit(!edit)}>
          <i className="fas fa-edit fs-5" />
        </span>
      </div>
      <div className="row mt-3 pt-5">
        <div className="col px-0 ">
          <fieldset>
            <div className="row">
              <div className="col-8 p-0 row">
                <span id="name" className="text-danger"></span>
                <div className="col-10 mt-5 px-0" id="float-label">
                  <label htmlFor="firstname">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    id="firstname"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control my-1"
                    disabled={!edit}
                  />
                </div>
              </div>
              <div className="col-4">
                <div className="col px-0 d-flex flex-column align-items-center">
                  <img
                    src={image !== null ? image : person}
                    style={{
                      height: "80px",
                      width: "80px",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    alt=""
                  />
                  {edit === true && (
                    <div className="d-flex">
                      <label
                        htmlFor="file-input"
                        className="ms-1 my-2 btn btn-primary btn-sm"
                      >
                        CHOOSE
                      </label>

                      <label
                        className="btn btn-danger my-2 ms-1 btn-sm"
                        onClick={() => {
                          setImage(null);
                          setNewImg("");
                          console.log("Removed Image from Add contact");
                        }}
                      >
                        REMOVE
                      </label>
                    </div>
                  )}
                  <input
                    type="file"
                    id="file-input"
                    onChange={ImageHandler}
                    accept="image/png, image/jpeg"
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>
            {/* here--------- */}
            <div className="row mt-3 p-0">
              <div className="col d-flex justify-content-end"></div>
            </div>
            {(isUpdating !== null && isUpdating.flag === true) ||
            isAdding === true ||
            isLoading === true ? (
              <span className="text-center">
                <Loader width="50px" height="50px" />
              </span>
            ) : (
              phoneDetails.map((detail, index) => {
                return (
                  <div className="row my-1" key={index}>
                    <div className="col ps-0">
                      <label htmlFor="phone-type" className="ps-1 mt-2">
                        Phone Type
                      </label>
                      <select
                        className="form-control my-1"
                        // value={phoneDetails[index].phone_type}
                        disabled={!edit}
                        onChange={(e) => {
                          setPhoneDetails((info) => {
                            let data = [...info];
                            data[index].phone_type =
                              e.target.value.toLowerCase();
                            return data;
                          });
                          setInitialDetails((info) => {
                            let data = [...info];
                            data[index].phone_type =
                              e.target.value.toLowerCase();

                            return data;
                          });
                          console.log(
                            "Change Phone type to",
                            e.target.value.toLowerCase()
                          );
                        }}
                      >
                        <option
                          selected={
                            phoneDetails[index].phone_type === "work"
                              ? true
                              : false
                          }
                        >
                          Work
                        </option>
                        <option
                          selected={
                            phoneDetails[index].phone_type === "mobile"
                              ? true
                              : false
                          }
                        >
                          Mobile
                        </option>
                        <option
                          selected={
                            phoneDetails[index].phone_type === "home"
                              ? true
                              : false
                          }
                        >
                          Home
                        </option>
                        <option
                          selected={
                            phoneDetails[index].phone_type === "fax"
                              ? true
                              : false
                          }
                        >
                          Fax
                        </option>
                      </select>
                    </div>

                    <div className="col ps-0">
                      <label htmlFor="mobile" className="ps-1 mt-2">
                        Phone No.
                      </label>
                      <input
                        id="mobile"
                        value={phoneDetails[index].phone}
                        pattern="/^[+]?[0-9]+$/"
                        onChange={(e) => {
                          if (
                            e.target.value.match(/^[+]?[0-9]+$/) !== null &&
                            e.target.value.length < 15
                          ) {
                            setPhoneDetails((info) => {
                              let data = [...info];
                              data[index].phone = e.target.value;

                              return data;
                            });
                            setInitialDetails((info) => {
                              let data = [...info];
                              if (e.target.value !== "") {
                                data[index].phone = e.target.value;
                              }

                              return data;
                            });
                            console.log(
                              "Change Phone Number to",
                              e.target.ariaValueText
                            );
                          } else if (
                            e.target.value == "" ||
                            e.target.value == "+"
                          ) {
                            setPhoneDetails((info) => {
                              let data = [...info];
                              data[index].phone = e.target.value;

                              return data;
                            });
                            setInitialDetails((info) => {
                              let data = [...info];
                              if (e.target.value !== "") {
                                data[index].phone = e.target.value;
                              }

                              return data;
                            });
                            // console.log(
                            //   "Change Phone Number to",
                            //   e.target.ariaValueText
                            // );
                          }
                        }}
                        className="form-control my-1"
                        disabled={!edit}
                      />
                      <span
                        id={`phone-number-error-${index}`}
                        className="text-danger"
                      ></span>
                    </div>

                    <div className="col ps-1 mt-4 pt-2 d-flex align-items-center">
                      {/* check box */}
                      <span className="me-2">
                        <input
                          type="radio"
                          disabled={!edit}
                          checked={defaultType === detail.id}
                          onChange={() => setDefaultType(detail.id)}
                        />
                      </span>
                      {/* delete a contact */}
                      <button
                        className="ms-1 btn btn-danger"
                        id="edit-phone"
                        disabled={!edit}
                        onClick={async () => {
                          setDeleteSure({ flag: true, deleteId: detail.id });
                        }}
                      >
                        Delete
                      </button>

                      <span className="ms-4">
                        {edit && (
                          <i
                            className="fas fa-phone-alt fs-6 "
                            onClick={() => {
                              setShowOngoing({
                                flag: true,
                                number: detail.phone,
                                image: null,
                              });
                              dilaerFun(
                                detail.phone,
                                userAgentInfo,
                                sessionInfo
                              );
                              console.log(
                                "Call",
                                detail.phone,
                                "in Add contact"
                              );
                            }}
                          />
                        )}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div className="row text-end">
              {edit === true && (
                <i
                  className="fas fa-plus fs-5"
                  onClick={() => {
                    setNewDetailsArr([
                      ...newDetailsArr,
                      {
                        type: "work",
                        number: "",
                        default: 0,
                      },
                    ]);
                  }}
                />
              )}
            </div>

            {newDetailsArr.length > 0 &&
              newDetailsArr.map((item, index) => {
                return (
                  <div className="row my-1" key={index}>
                    <div className="col ps-0 d-flex flex-column">
                      <label htmlFor="new-phone-type" className="ps-1 mt-2">
                        Phone Type
                      </label>
                      <select
                        disabled={!edit}
                        className="form-control my-1"
                        value={newDetailsArr[index].phone_type}
                        onChange={(e) => {
                          setNewDetailsArr((info) => {
                            let data = [...info];
                            data[index].type = e.target.value;

                            return data;
                          });
                        }}
                      >
                        <option value="work">Work</option>
                        <option value="mobile">Mobile</option>
                        <option value="home">Home</option>
                        <option value="fax">Fax</option>
                      </select>
                    </div>

                    <div className="col ps-0 d-flex flex-column">
                      <label htmlFor="new-phone" className="ps-1 mt-2">
                        Phone
                      </label>
                      <input
                        disabled={!edit}
                        id="new-phone"
                        pattern="/^[+]?[0-9]+$/"
                        className="form-control my-1"
                        value={newDetailsArr[index].number}
                        onChange={(e) => {
                          if (e.target.value.match(/^[+]?[0-9]+$/) !== null) {
                            setNewDetailsArr((info) => {
                              let data = [...info];
                              data[index].number = e.target.value;
                              return data;
                            });
                          } else if (
                            e.target.value == "" ||
                            e.target.value == "+"
                          ) {
                            setNewDetailsArr((info) => {
                              let data = [...info];
                              data[index].number = e.target.value;
                              return data;
                            });
                          }
                        }}
                      />
                      <span
                        id={`add-number-error-${index}`}
                        className="text-danger"
                      ></span>
                    </div>
                    <div className="col ps-1 mt-4 pt-2">
                      <span className="me-2">
                        <input
                          type="radio"
                          disabled={!edit}
                          checked={defaultType === index}
                          onChange={() => setDefaultType(index)}
                        />
                      </span>
                      <button
                        className="btn btn-success me-1"
                        onClick={async () => {
                          console.log(index, newDetailsArr);
                          if (
                            newDetailsArr[index].number !== "" &&
                            newDetailsArr[index].number.match(
                              /^[+]?[0-9]+$/
                            ) !== null
                          ) {
                            await editedDetails();
                            createContact();
                            getMyContact();
                            setNewDetailsArr([]);
                          } else if (newDetailsArr[index].number == "") {
                            document.getElementById(
                              `add-number-error-${index}`
                            ).innerHTML = "Phone Number cannot be empty.";
                            setTimeout(() => {
                              document.getElementById(
                                `add-number-error-${index}`
                              ).innerHTML = "";
                            }, 2000);
                          } else if (
                            newDetailsArr[index].number.match(/^[+]?[0-9]+$/) ==
                            null
                          ) {
                            document.getElementById(
                              `add-number-error-${index}`
                            ).innerHTML = "Enter a valid phone number";
                            setTimeout(() => {
                              document.getElementById(
                                `add-number-error-${index}`
                              ).innerHTML = "";
                            }, 2000);
                          }
                        }}
                      >
                        ADD
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => {
                          setNewDetailsArr(
                            newDetailsArr.filter(
                              (item) => newDetailsArr.indexOf(item) !== index
                            )
                          );
                        }}
                      >
                        X
                      </button>
                    </div>
                  </div>
                );
              })}

            <div className="row">
              <span id="email-error" className="text-danger"></span>
              <div className="col px-0" id="float-label">
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  id="email"
                  value={email}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control my-1"
                  disabled={!edit}
                />
              </div>
            </div>
            <div className="row">
              <div className="col px-0" id="float-label">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  value={company}
                  type="text"
                  onChange={(e) => setCompany(e.target.value)}
                  className="form-control my-1"
                  disabled={!edit}
                />
              </div>
            </div>
            <div className="row">
              <div className="col px-0" id="float-label">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  value={address}
                  type="text"
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-control my-1"
                  disabled={!edit}
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
                  value={description}
                  type="text"
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control my-1"
                  disabled={!edit}
                />
              </div>
            </div>
          </fieldset>
        </div>
      </div>

      <span className="d-flex flex-column justify-content-start mt-5 mb-2 bottom-0 end-0">
        <div className="fs-6 fw-bold mb-2 text-danger">
          <span id="response-text">
            {changingContact !== null && changingContact.success !== 0 && (
              <PopUp
                show={show}
                handleClose={handleClose}
                message={
                  changingContact.success == 1 ? (
                    <span className="text-success">
                      {changingContact.response}
                    </span>
                  ) : isUpdating.success == 2 ? (
                    <span className="text-danger">
                      {changingContact.response}
                    </span>
                  ) : (
                    ""
                  )
                }
              />
            )}
          </span>
        </div>
        <div>
          <button
            disabled={!edit}
            className="btn btn-warning rounded-pill px-4 "
            onClick={() => {
              editedDetails();
            }}
          >
            {changingContact !== null && changingContact.flag == true ? (
              <Loader width="30px" height="30px" />
            ) : (
              "Update"
            )}
          </button>
        </div>
      </span>
      {/* </div> */}
    </div>
  );
};

export default ContactProfile;
