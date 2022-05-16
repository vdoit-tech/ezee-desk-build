import Password from "antd/lib/input/Password";
import axios from "axios";
import React, { useReducer, useState } from "react";
import DataBase from "nedb";
import path from "path";
import { v4 as uuid } from "uuid";
import log from "../logger/log";
import {
  ADD_CALL_LOG_API,
  ADD_CONTACT_API,
  CALL_LOGS_API,
  CHANGE_STATUS_ONLINE,
  DELETE_CONTACT,
  GET_ALL_EFAX_API,
  GET_CALL_LOGS_API,
  GET_CENTRAL_CONTACT_API,
  GET_CONTACT_API,
  GET_MY_CONTACT_API,
  GET_REMOTE_CONTACT,
  GET_SMS_CHATS,
  SAVE_EFAX_DETAILS,
  SEND_EFAX_API,
  UPDATE_CONTACT_API,
} from "../../Constants/Api";
import {
  CALLEE_ID,
  CALLEE_NAME,
  CALL_NUMBER,
  CALL_START_TIME,
  CALL_TYPE,
  CREATE_CONTACT,
  DB_LOG_UPDATE,
  GET_ALL_EFAX,
  GET_CALL_LOG,
  GET_CENTRAL_CONTACT,
  GET_CONTACT,
  GET_MY_CONTACT,
  GROUP_NOTIFICATION,
  NOTIFICATION_ARRAY,
  NOTIFICATION_REMOVE,
  SEND_EFAX,
  SHOW_ONGOING,
  STATUS_CHANGE_NUMBER,
  UPDATE_CONTACT,
} from "../Types";
import contactContext from "./contactContext";
import contactReducer from "./contactReducer";
import {
  addCallLogsAPI,
  addContactAPI,
  changeOnlineStatusAPI,
  deleteContactAPI,
  getAllEfaxAPI,
  getCallLogsAPI,
  getCentralContactAPI,
  getMyContactAPI,
  getRemoteContactAPI,
  getSMSChatsAPI,
  saveEfaxDetailsAPI,
  sendEfaxAPI,
  updateContactAPI,
} from "../../Constants/ApiHelper";
import { stat } from "fs";
import { detailsLogger } from "../../Constants/Helper";

const ContactState = (props) => {
  const [isLoading, setIsLoading] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [isAdding, setIsAdding] = useState(null);
  const [isFaxing, setIsFaxing] = useState(null);
  const [isGettingFax, setIsGettingFax] = useState(null);
  const [gettingRemote, setGettingRemote] = useState(null);
  var callLogsDb = new DataBase({
    filename: path.join(__dirname, "/callLog.db"),
    autoload: true,
  });

  callLogsDb.loadDatabase();

  //initial states
  const initialState = {
    get_my_contact: null,
    get_central_contact: null,
    get_remote_contact: null,
    get_call_log: null,
    create_contact_response: null,
    update_contact_response: null,
    call_start_time: [],
    callee_name: [],
    call_number: [],
    callee_id: [],
    call_type: [],
    db_log_update: null,
    all_efax: null,
    send_efax_response: null,
    notificationsArray: [],
    onLineStatusNumber: 1,
    groupNotifications: 0,
    groupInitialNotifications: 0,
    showOngoing: { flag: false, number: null, image: null },
  };

  const [state, dispatch] = useReducer(contactReducer, initialState);

  const unReplied = (val, smsChats, group) => {
    let arr = [];
    let num = 0;
    let index = 0;
    let arrr = smsChats[val]
      .filter((i) => i.from !== group)
      .map((item, idx) => smsChats[val][smsChats[val].length - 1 - idx]);

    for (let i = 0; i < arrr.length; i++) {
      if (arrr[i] !== undefined && arrr[i].read_status == 1) {
        index = i;
        break;
      }
    }

    for (let i = index; i >= 0; i--) {
      if (
        arrr[i] !== undefined &&
        arrr[i].read_status == 0 &&
        arrr[i].from !== group
      ) {
        num += 1;
      }
    }

    return num;
  };

  const getTotalUnReplied = (smsChats, group) => {
    let numb1 = 0;

    if (Object.keys(smsChats).length !== 0) {
      let smsArr = Object.keys(smsChats);

      for (let i = 0; i < smsArr.length; i++) {
        if (
          sessionStorage.getItem("groupNumbers") !== null &&
          sessionStorage.getItem("groupNumbers") !== undefined &&
          smsArr[i] !== sessionStorage.getItem("my_telnyx_num") &&
          smsArr[i] !== group
        ) {
          numb1 += unReplied(smsArr[i], smsChats, group);
        }
      }
    }

    return numb1;
  };

  //CONTACT MODULE

  //function for getting user's contacts
  const getMyContact = () => {
    //  detailsLogger(
    //   "In getMyContact function, Getting call my contacts from api"
    // );
    setIsLoading(true);
    const token = sessionStorage.getItem("token");

    getMyContactAPI(token).then(({ status, response }) => {
      if (status == "success") {
        sessionStorage.setItem(
          "my_contacts",
          JSON.stringify(response.data.data)
        );

        dispatch({
          type: GET_MY_CONTACT,
          payload: response.data.data,
        });
        setIsLoading(false);
        //  detailsLogger(
        //   "In getMyContact Function, Successfully Received all My Contact data from API!!"
        // );
      } else if (status == "fail") {
        setIsLoading(false);
        log.warn(
          "In getMyContact Function, Failed to Received all My Contact data from API!!",
          response
        );
      }
    });
  };

  //function for creating new contact

  const addContact = (data, image) => {
    // detailsLogger("In addContact function");
    setIsAdding(true);
    const token = sessionStorage.getItem("token");

    addContactAPI(token, data, image).then(({ status, response }) => {
      if (status == "success") {
        setIsAdding(false);
        dispatch({
          type: CREATE_CONTACT,
          payload: response.data.data,
        });
        // detailsLogger(
          //"In addContact function , Successfully Created New Contact!!"
        // );
      } else if (status == "fail") {
        setIsLoading(false);

        dispatch({
          type: CREATE_CONTACT,
          payload: response.response.data.errorMessage,
        });
        log.warn(
          "In addContact function , Failed to Created New Contact!!",
          response.response.data.errorMessage
        );
      }
    });
  };

  //function for updating existing user's contact
  const updateContact = (data) => {
    // detailsLogger("In updateContact function");
    setIsUpdating({ flag: true, success: 0, response: "" });
    const token = sessionStorage.getItem("token");
    updateContactAPI(token, data).then(({ status, response }) => {
      if (status == "success") {
        dispatch({
          type: UPDATE_CONTACT,
          payload: response.data.data,
        });
        setIsUpdating({
          flag: false,
          success: 1,
          response: response.data.data,
        });
        //  detailsLogger(
        //   "In updateContact function, Successfully Updated Contact!!"
        // );
      } else if (status == "fail") {
        setIsUpdating({ flag: false, success: 2, response: response });
        log.warn(
          "In updateContact function, Failed to Updated Contact!!",
          response
        );
      }
    });
  };

  //function for deleting  user's contact
  const deleteContact = (id) => {
    // detailsLogger("In deleteContact function");
    const token = sessionStorage.getItem("token");

    deleteContactAPI(token, id).then(({ status, response }) => {
      if (status == "success") {
        console.log("in deleteContact")
        //  detailsLogger(
        //   "In deleteContact function, Successfully Deleted Contact!!"
        // );
      } else if (status == "fail") {
        log.warn(
          "In deleteContact function, Failed to Delete Contact!!",
          response
        );
      }
    });
  };

  //function for getting central contacts

  const getCentralContact = () => {
    // detailsLogger("In getCentralContact function");
    setIsLoading(true);

    const token = sessionStorage.getItem("token");

    getCentralContactAPI(token).then(({ status, response }) => {
      if (status == "success") {
        setIsLoading(false);
        sessionStorage.setItem(
          "central_contacts",
          JSON.stringify(response.data.data)
        );
        dispatch({
          type: GET_CENTRAL_CONTACT,
          payload: response.data.data,
        });
        // detailsLogger(
        //   "In getCentralContact function, Successfully Received Central Contact Data from API!! "
        // );
      } else if (response == "fail") {
        setIsLoading(false);
        log.warn(
          "In getCentralContact function, Failed to Received Central Contact Data from API!! ",
          response
        );
      }
    });
  };

  //function for getting remote contacts

  const getRemoteContact = () => {
    setGettingRemote(true);
    const token = sessionStorage.getItem("token");
    getRemoteContactAPI(token).then(({ status, response }) => {
      if (status == "success") {
        setGettingRemote(false);
        sessionStorage.setItem(
          "remote_contacts",
          JSON.stringify(response.data.data)
        );
        response.data.data.forEach((ele) => {
          ele.isInGroup = false;
        });

        dispatch({
          type: GET_REMOTE_CONTACT,
          payload: response.data.data,
        });
      } else if (status == "fail") {
        setGettingRemote(false);
        log.warn(
          "In getRemoteContact function, Failed to Received Remote Contact Data from API!! ",
          response
        );
      }
    });
  };
  //function to set add contact text
  const setAddContactText = (addText) => {
    // detailsLogger("In setAddContactText function, setting text : ", addText);

    dispatch({
      type: CREATE_CONTACT,
      payload: addText,
    });
  };
  //function to set update contact text
  const setUpdateContactText = (updateText) => {
    // detailsLogger(
    //   "In setUpdateContactText function, setting text : ",
    //   updateText
    // );

    dispatch({
      type: UPDATE_CONTACT,
      payload: updateText,
    });
  };

  // CALL LOGS MODULE

  //function for getting all call logs
  const getCallLogs = () => {
    // detailsLogger("In getCallLogs function");

    setIsLoading(true);
    const token = sessionStorage.getItem("token");
    getCallLogsAPI(token).then(({ status, response }) => {
      if (status == "success") {
        // detailsLogger(
        //   "In getCallLogs function, Successfully Received All call logs from API!!"
        // );

        sessionStorage.setItem("callLogs", JSON.stringify(response.data.data));
        callLogsDb.remove({}, { multi: true }, function (err, numRemoved) {
          callLogsDb.insert(response.data.data, function (err, newDoc) {
            // detailsLogger(
            //   "In getCallLogs function , Updated callLogsDb with Latest Data!",
            //   err
            // );
          });
        });

        dispatch({
          type: GET_CALL_LOG,
          payload: response.data.data,
        });
      } else if (status == "fail") {
        log.warn(
          "In getCallLogs function, Failed to Received All call logs from API!!",
          response
        );
      }
    });

    setIsLoading(false);
  };

  const getCallLogsFromDb = () => {
    callLogsDb.find({}, function (err, docs) {
      // detailsLogger(
      //   "In getCallLogsFromDb function , Get All data from callLogsDb!"
      // );
     // detailsLogger("error", err);

      dispatch({
        type: GET_CALL_LOG,
        payload: docs[0],
      });
    });
  };

  //function for adding a new call log
  const addCallLog = (
    contact_id,
    callee_id,
    callee_name,
    number,
    call_type,
    call_duration,
    call_start_time,
    call_end_time,
    start__date,
    end__date,
    start__time,
    end__time
  ) => {
    // detailsLogger("In addCalllog function ");
    setIsLoading(true);
    const dbData = {
      call_duration,
      call_end_date: end__date,
      call_end_time: end__time,
      call_start_date: start__date,
      call_start_time: start__time,
      call_type,
      callee_id,
      callee_name,
      contact_id,
      number,
      created_at: start__date,
      updated_at: start__date,
      date: start__date,
      id: uuid(),
    };
    callLogsDb.find({}, function (err, docs) {
      // detailsLogger("In addCalllog function, Call logs data from callLogsDb");
      let data = docs[0];
      // detailsLogger(data);
      if (data !== undefined) {
        if (data[start__date] === undefined) {
          data[start__date] = [dbData];
        } else {
          data[start__date] = [dbData, ...data[start__date]];
        }

        callLogsDb.remove({}, { multi: true }, function (err, numRemoved) {
          callLogsDb.insert(data, function (err, newDoc) {
            //  detailsLogger(
            //   "In addCalllog function, Call log db updated with new calls"
            // );
            dbLogUpdateFunction(uuid());
          });
        });
      }
    });

    const token = sessionStorage.getItem("token");

    addCallLogsAPI(
      token,
      contact_id,
      callee_id,
      callee_name,
      number,
      call_type,
      call_duration,
      call_start_time,
      call_end_time
    ).then(({ status, response }) => {
      if (status == "success") {
        setTimeout(() => {
          setIsLoading(false);
        }, 5000);
        // detailsLogger(
        //   "In addCalllog function, Successfully Post data to add in call logs"
        // );
      } else if (status == "fail") {
        log.warn(
          "In addCalllog function, Failed to Post data to add in call logs",
          response
        );
      }
    });
  };

  //function to set start time of a call for call logs
  const setCallStartTime = (call_start_time) => {
    // detailsLogger(
    //   "In setCallStartTime, set start Time of Calls",
    //   call_start_time
    // );
    dispatch({
      type: CALL_START_TIME,
      payload: call_start_time,
    });
  };
  //function to set start time of a call for call logs
  const setCalleeName = (callee_name) => {
    // detailsLogger("In setCalleeName, set Callee Name : ", callee_name);

    dispatch({
      type: CALLEE_NAME,
      payload: callee_name,
    });
  };
  //function to set called or incoming call number for call logs
  const setCallNumber = (call_number) => {
    // detailsLogger("In setCallNumber, set Call Number : ", call_number);

    dispatch({
      type: CALL_NUMBER,
      payload: call_number,
    });
  };
  //function to set callee id for call logs
  const setCalleeId = (callee_id) => {
    // detailsLogger("In setCalleeId, set Callee Id");

    dispatch({
      type: CALLEE_ID,
      payload: callee_id,
    });
  };
  //function to set call type 1(received),2(outgoing),3(missed) for call logs
  const setCallType = (call_type) => {
    // detailsLogger("In setCallType, set Call Type : ", call_type);

    dispatch({
      type: CALL_TYPE,
      payload: call_type,
    });
  };

  //E-FAX MODULE

  //function for sending an efax

  const sendEfax = (from, to, pdf) => {
    setIsFaxing(true);
    const token = sessionStorage.getItem("telnyx_token");

    sendEfaxAPI(token, from, to, pdf).then(({ status, response }) => {
      if (status == "success") {
      //  detailsLogger(
      //     "In sendEfax Function, Successfully send Efax to : ",
      //     to,
      //     " from : ",
      //     from
      //   );
        dispatch({
          type: SEND_EFAX,
          payload: "Efax sent successfully",
        });
        setIsFaxing(false);
      } else if (status == "fail") {
        dispatch({
          type: SEND_EFAX,
          payload: "Error while sending",
        });
        setIsFaxing(false);
        // detailsLogger(
        //   "In sendEfax Function, Failed to send Efax to : ",
        //   to,
        //   " from : ",
        //   from
        // );
      }
    });
  };
  //function for getting all efax
  const getAllEfax = () => {
    setIsGettingFax(true);
    const telnyx_token = sessionStorage.getItem("telnyx_token");
    const token = sessionStorage.getItem("token");

    getAllEfaxAPI(telnyx_token).then(async ({ status, response }) => {
      if (status == "success") {
        // detailsLogger(response.data.data);

        dispatch({
          type: GET_ALL_EFAX,
          payload: response.data.data,
        });
        setIsGettingFax(false);

        let params = { data: response.data.data };
      //  detailsLogger(
      //     "In getAllEfax Function, Successfully Got All Efax from API!!"
      //   );
        saveEfaxDetailsAPI(token, params).then(({ flag, res }) => {
          if (flag == "success") {
            console.log("success");
          } else if (flag == "fail") {
            // detailsLogger(res);
          }
           // detailsLogger(val);
        });
      } else if (status == "fail") {
        log.warn(
          "In getAllEfax Function, Failed to get All Efax from API!!",
          response
        );
      }
    });
  };

  //function to update database
  const dbLogUpdateFunction = (id) => {
    dispatch({
      type: DB_LOG_UPDATE,
      payload: id,
    });
  };

  //function to set online status of a user
  const onLineStatus = (id) => {
    const token = sessionStorage.getItem("token");
    changeOnlineStatusAPI(token, id).then(({ status, response }) => {
      if (status == "success") {
        //  detailsLogger(
        //   "In onLineStatus Function, Successfully Change the Status of User to ",
        //   id
        // );
        dispatch({
          type: STATUS_CHANGE_NUMBER,
          payload: id,
        });
      } else if (status == "fail") {
        log.warn(
          "In onLineStatus Function, Failed to Change the Status of User to ",
          id,
          response
        );
      }
    });
  };

  //NOTIFICATIONS MODULE

  //add sms number for new sms notification
  const setNotificationsArray = (groupNotifications) => {
    // detailsLogger(
    //   "In setNotificationsArray Function, setting group notification "
    // );

    dispatch({
      type: NOTIFICATION_ARRAY,
      payload: groupNotifications,
    });
  };

  //remove sms number for read sms notification
  const removeNotifications = (num) => {
    // detailsLogger("In removeNotifications Function, Remove notifications ");
    // dispatch({
    //   type: NOTIFICATION_REMOVE,
    //   payload: num,
    // });
  };

  //add sms number for new sms notification

  const getGroupNotifications = async () => {
    const token = sessionStorage.getItem("token");
    var num = 0;

    sessionStorage.getItem("groupNumbers") !== null &&
      sessionStorage.getItem("groupNumbers") !== undefined &&
      sessionStorage
        .getItem("groupNumbers")
        .split(",")
        .map(async (group) => {
          getSMSChatsAPI(token, group).then(({ status, data }) => {
            if (status == "success") {
              let exists = {},
                elm,
                elm2,
                arr = [];
              for (let i = 0; i < data.data.data.length; i++) {
                elm = data.data.data[i].to;
                elm2 = data.data.data[i].from;
                if (!exists[elm]) {
                  arr.push(elm);
                  exists[elm] = true;
                }
                if (!exists[elm2]) {
                  arr.push(elm2);
                  exists[elm2] = true;
                }
              }
              let demoObj = {};
              for (let j = 0; j < arr.length; j++) {
                demoObj[arr[j]] = [];
                for (let i = 0; i < data.data.data.length; i++) {
                  if (data.data.data[i].to === arr[j]) {
                    demoObj[arr[j]].push(data.data.data[i]);
                  }
                  if (data.data.data[i].from === arr[j]) {
                    demoObj[arr[j]].push(data.data.data[i]);
                  }
                }
              }

              num += getTotalUnReplied(demoObj, group);

              dispatch({
                type: GROUP_NOTIFICATION,
                payload: num,
              });
              // detailsLogger(num);

              // detailsLogger(
              //   "In getGroupNotifications Function,Successfully Get all data of unreplied from API "
              // );
            } else if (status == "fail") {
              log.warn(
                "In getGroupNotifications Function,Failed to Get all data of unreplied from API ",
                data
              );
            }
          });
        });
  };
  const setShowOngoing = (showOngoing) => {
    // detailsLogger(
    //   "In setNotificationsArray Function, setting group notification "
    // );

    dispatch({
      type: SHOW_ONGOING,
      payload: showOngoing,
    });
  };
  return (
    <contactContext.Provider
      value={{
        isLoading,
        isUpdating,
        isAdding,
        isFaxing,
        isGettingFax,
        get_my_contact: state.get_my_contact,
        get_central_contact: state.get_central_contact,
        get_remote_contact: state.get_remote_contact,
        update_contact_response: state.update_contact_response,
        get_call_log: state.get_call_log,
        create_contact_response: state.create_contact_response,
        call_start_time: state.call_start_time,
        call_number: state.call_number,
        callee_id: state.callee_id,
        callee_name: state.callee_name,
        call_type: state.call_type,
        db_log_update: state.db_log_update,
        all_efax: state.all_efax,
        send_efax_response: state.send_efax_response,
        notificationsArray: state.notificationsArray,
        onLineStatusNumber: state.onLineStatusNumber,
        groupNotifications: state.groupNotifications,
        groupInitialNotifications: state.groupInitialNotifications,
        showOngoing: state.showOngoing,

        getMyContact,
        getCentralContact,
        addContact,
        updateContact,
        deleteContact,
        getCallLogs,
        addCallLog,
        setCalleeId,
        setCalleeName,
        setCallNumber,
        getRemoteContact,
        setCallStartTime,
        setCallType,
        setUpdateContactText,
        setAddContactText,
        dbLogUpdateFunction,
        sendEfax,
        getAllEfax,
        setNotificationsArray,
        removeNotifications,
        onLineStatus,
        getCallLogsFromDb,

        getGroupNotifications,
        setShowOngoing,
      }}
    >
      {props.children}
    </contactContext.Provider>
  );
};

export default ContactState;
