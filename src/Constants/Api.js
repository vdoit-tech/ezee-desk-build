 export let baseUrl = "https://ezeelink.stagingapps.xyz";
// export let baseUrl = "https://ez-link-prod.stagingapps.xyz";

//log apis
export const LOGIN_API = `${baseUrl}/api/login`;
export const FORGOT_PASSWORD = `${baseUrl}/api/forgotPassword`;
export const EXTENSION_FEEDBACK = `${baseUrl}/api/extensionFeedback`;
export const CHANGE_PASSWORD = `${baseUrl}/api/changePassword`;
export const FILE_UPLOAD = `${baseUrl}/api/fileUpload`;
//user profile apis
export const EDIT_PROFILE = `${baseUrl}/api/EditProfile`;
//contact apis
export const GET_MY_CONTACT_API = `${baseUrl}/api/myContect`;
export const GET_CENTRAL_CONTACT_API = `${baseUrl}/api/centralContect`;
export const ADD_CONTACT_API = `${baseUrl}/api/addContact`;
export const UPDATE_CONTACT_API = `${baseUrl}/api/updateContact`;
export const GET_REMOTE_CONTACT = `${baseUrl}/api/getExtensionDetail`;
export const DELETE_CONTACT = `${baseUrl}/api/deleteContect`;
export const CONTACT_IMAGE_UPDATE = `${baseUrl}/api/contactImageUpdate`;

//call apis
export const GET_CALL_LOGS_API = `${baseUrl}/api/getCallLogs`;
export const ADD_CALL_LOG_API = `${baseUrl}/api/addCallLog`;

//efax apis

export const SEND_EFAX_API = "https://api.telnyx.com/v2/faxes";
export const GET_ALL_EFAX_API = "https://api.telnyx.com/v2/faxes";
export const SAVE_EFAX_DETAILS = `${baseUrl}/api/telnyxApiDetailsSave`;

//notification apis
export const SEND_NOTIFICATION = `${baseUrl}/api/send-notification`;
export const SEND_SMS_NOTIFICATION = `${baseUrl}/api/sendSmsNotification`;

// status
export const CHANGE_STATUS_ONLINE = `${baseUrl}/api/isOnlineStatus`;

//sms apis
export const GET_SMS_CHATS = `${baseUrl}/api/getSmsChat?to=`;
export const CHANGE_SMS_CHAT_STATUS = `${baseUrl}/api/changeSmsChatStatus`;
export const CHANGE_PICKUP_STATUS = `${baseUrl}/api/postChangePickupStatus`;
export const CHANGE_READ_STATUS = `${baseUrl}/api/postIsRead`;
export const SEND_SMS = "https://api.telnyx.com/v2/messages";

//dashboard api
export const GET_DASHBOARD_DETAILS = `${baseUrl}/api/dashboardApi`;
