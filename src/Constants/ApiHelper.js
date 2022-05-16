import axios from "axios";
import {
  ADD_CALL_LOG_API,
  ADD_CONTACT_API,
  CHANGE_PASSWORD,
  CHANGE_PICKUP_STATUS,
  CHANGE_READ_STATUS,
  CHANGE_SMS_CHAT_STATUS,
  CHANGE_STATUS_ONLINE,
  CONTACT_IMAGE_UPDATE,
  DELETE_CONTACT,
  EDIT_PROFILE,
  EXTENSION_FEEDBACK,
  FILE_UPLOAD,
  FORGOT_PASSWORD,
  GET_ALL_EFAX_API,
  GET_CALL_LOGS_API,
  GET_CENTRAL_CONTACT_API,
  GET_DASHBOARD_DETAILS,
  GET_MY_CONTACT_API,
  GET_REMOTE_CONTACT,
  GET_SMS_CHATS,
  LOGIN_API,
  SAVE_EFAX_DETAILS,
  SEND_EFAX_API,
  SEND_NOTIFICATION,
  SEND_SMS,
  SEND_SMS_NOTIFICATION,
  UPDATE_CONTACT_API,
} from "./Api";

//api calls for login
export const loginAPI = async (email, password, deviceToken) => {
  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);
  formData.append("deviceToken", deviceToken);
  formData.append("deviceUUID", "77c7bab9-7419-4e1e-9c80-479ad450a9de");
  formData.append("platform", "Windows");
  return await axios
    .post(LOGIN_API, formData)
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const forgotPasswordAPI = async (email) => {
  const formData = new FormData();
  formData.append("email", email);

  return await axios
    .post(FORGOT_PASSWORD, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const changePasswordAPI = async (token, oldPassword, newPassword) => {
  const formData = new FormData();
  formData.append("oldPassword", oldPassword);
  formData.append("newPassword", newPassword);
  formData.append(
    "email",
    JSON.parse(sessionStorage.getItem("userInfo")).extension.email
  );

  return await axios
    .post(CHANGE_PASSWORD, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

//api calls for contact
export const getMyContactAPI = async (token) => {
  return await axios
    .get(GET_MY_CONTACT_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const addContactAPI = async (token, data, image) => {
  const formData = new FormData();

  formData.append("data", JSON.stringify(data));
  formData.append("image", image);

  return await axios
    .post(ADD_CONTACT_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const updateContactAPI = async (token, data) => {
  const formData = new FormData();

  formData.append("data", JSON.stringify(data));

  return await axios
    .post(UPDATE_CONTACT_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const updateImageAPI = async (token, ids, image) => {
  let formData = new FormData();

  formData.append("ids", JSON.stringify(ids));
  formData.append("image", image);

  return await axios
    .post(CONTACT_IMAGE_UPDATE, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const deleteContactAPI = async (token, id) => {
  const formData = new FormData();
  formData.append("id", id);

  return await axios
    .post(DELETE_CONTACT, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const getCentralContactAPI = async (token) => {
  return await axios
    .get(GET_CENTRAL_CONTACT_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const getRemoteContactAPI = async (token) => {
  return await axios
    .get(GET_REMOTE_CONTACT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      console.log("response from extension", res);
      return { status: "success", response: res };
    })
    .catch((err) => {
      console.log("response from extension", err);
      return { status: "fail", response: err };
    });
};

//api calls for call logs
export const getCallLogsAPI = async (token) => {
  return await axios
    .get(GET_CALL_LOGS_API, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const addCallLogsAPI = async (
  token,
  contact_id,
  callee_id,
  callee_name,
  number,
  call_type,
  call_duration,
  call_start_time,
  call_end_time
) => {
  const formData = new FormData();
  formData.append("contact_id", contact_id);
  formData.append("callee_id", callee_id);
  formData.append("callee_name", callee_name);
  formData.append("number", number);
  formData.append("call_type", call_type);
  formData.append("call_duration", call_duration);
  formData.append("call_start_time", call_start_time);
  formData.append("call_end_time", call_end_time);

  return await axios
    .post(ADD_CALL_LOG_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

//api call for efax

export const sendEfaxAPI = async (token, from, to, pdf) => {
  const connectionId = sessionStorage.getItem("connection_id");
  const formData = new FormData();
  formData.append("connection_id", connectionId);
  formData.append("to", to);
  formData.append("from", from);
  formData.append("media_url", pdf);
  return await axios
    .post(SEND_EFAX_API, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const getAllEfaxAPI = async (telnyx_token) => {
  return await axios
    .get(GET_ALL_EFAX_API, {
      headers: {
        Authorization: `Bearer ${telnyx_token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};
export const saveEfaxDetailsAPI = async (token, params) => {
  return await axios
    .post(SAVE_EFAX_DETAILS, params, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { flag: "success", res: res };
    })
    .catch((err) => {
      return { flag: "fail", res: err };
    });
};

//set online status api
export const changeOnlineStatusAPI = async (token, id) => {
  const formData = new FormData();
  formData.append("status", id);

  return axios
    .post(CHANGE_STATUS_ONLINE, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

//sms apis
export const getSMSChatsAPI = async (token, number) => {
  return await axios
    .get(`${GET_SMS_CHATS}${number}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", data: res };
    })
    .catch((err) => {
      return { status: "fail", data: err };
    });
};

export const sendSMSTextAPI = async (from, to, text, token) => {
  return await axios
    .post(
      SEND_SMS,
      {
        from: from,
        to: to,
        text: text,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(async (res) => {
      return { flag: "success", data: res };
    })
    .catch((err) => {
      return { flag: "fail", data: err };
    });
};

export const sendSMSMediaAPI = async (from, to, media_urls, token) => {
  return await axios
    .post(
      SEND_SMS,
      {
        from: from,
        to: to,
        media_urls: [`${media_urls}`],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then(async (res) => {
      return { flag: "success", data: res };
    })
    .catch((err) => {
      return { flag: "fail", data: err };
    });
};

export const changeSMSChatStatusAPI = async (token, id, repliedBy) => {
  const formData = new FormData();
  formData.append("message_id", id);
  formData.append("repliedBy", repliedBy);
  return await axios
    .post(CHANGE_SMS_CHAT_STATUS, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const changeReadStatusAPI = async (token, sms_id) => {
  const formData = new FormData();
  formData.append("message_id", sms_id);
  formData.append("isReadStatus", 1);
  return await axios
    .post(CHANGE_READ_STATUS, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

export const changePickupStatusAPI = async (
  token,
  sms_id,
  status,
  pickupBy
) => {
  const formData = new FormData();
  formData.append("message_id", sms_id);
  formData.append("pickupBy", pickupBy);
  formData.append("pickupStatus", status);
  return await axios
    .post(CHANGE_PICKUP_STATUS, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { flag: "success", response: res };
    })
    .catch((err) => {
      return { flag: "fail", response: err };
    });
};
export const sendSMSNotificationAPI = async (token, to, message) => {
  let notificationData = new FormData();
  notificationData.append("to", to);
  notificationData.append("message", message);
  return await axios
    .post(SEND_SMS_NOTIFICATION, notificationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};
//dashboard api
export const getDashboardDetailsAPI = async (token) => {
  return await axios
    .get(GET_DASHBOARD_DETAILS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};
//feedback api
export const sendExtensionFeedbackAPI = async (
  token,
  subject,
  enquiry,
  description,
  image,
  logsFile,
  deviceType
) => {
  const formData = new FormData();
  formData.append("heading", subject);
  formData.append("relationTo", enquiry);
  formData.append("description", description);
  image !== undefined &&
    image !== "" &&
    image !== null &&
    formData.append("image", image);
  formData.append("ApplicationLogs", logsFile);
  formData.append("DeviceType", deviceType);
  return await axios
    .post(EXTENSION_FEEDBACK, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

//notification apis
export const sendIncomingCallNotificationAPI = async (token, number) => {
  const formData = new FormData();
  formData.append("text", "Incoming Call");
  formData.append("number", number);
  return await axios
    .post(SEND_NOTIFICATION, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};

//general api calls
export const fileUploadAPI = async (token, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await axios
    .post(FILE_UPLOAD, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { flag: "success", res: res };
    })
    .catch((err) => {
      return { flag: "fail", res: err };
    });
};

//profile api
export const updateProfileAPI = async (token, photo) => {
  let formData = new FormData();
  formData.append("photo", photo);
  return await axios
    .post(EDIT_PROFILE, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (res) => {
      return { status: "success", response: res };
    })
    .catch((err) => {
      return { status: "fail", response: err };
    });
};
