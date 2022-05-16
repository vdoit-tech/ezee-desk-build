import { GET_REMOTE_CONTACT, UPDATE_CONTACT_API } from "../../Constants/Api";
import {
  CALLEE_ID,
  CALLEE_NAME,
  CALL_END_TIME,
  CALL_NUMBER,
  CALL_START_TIME,
  CALL_TYPE,
  CREATE_CONTACT,
  DB_LOG_UPDATE,
  GET_ALL_EFAX,
  GET_CALL_LOG,
  GET_CENTRAL_CONTACT,
  GET_MY_CONTACT,
  N,
  GROUP_NOTIFICATION,
  GROUP_NOTIFICATION_ARRAY,
  GROUP_NOTIFICATION_REMOVE,
  NOTIFICATION_ARRAY,
  NOTIFICATION_REMOVE,
  SEND_EFAX,
  STATUS_CHANGE_NUMBER,
  UPDATE_CONTACT,
  SHOW_ONGOING,
} from "../Types";

export default (state, action) => {
  switch (action.type) {
    case NOTIFICATION_ARRAY:
      return {
        ...state,
        notificationsArray: state.notificationsArray.concat(action.payload),
      };
    case NOTIFICATION_REMOVE:
      console.log(state.notificationsArray);
      return {
        ...state,
        notificationsArray: state.notificationsArray.filter(
          (i) => i !== action.payload
        ),
      };

    case GROUP_NOTIFICATION:
      return {
        ...state,
        groupNotifications: action.payload,
      };
    case SHOW_ONGOING:
      return {
        ...state,
        showOngoing: action.payload,
      };

    case GET_MY_CONTACT:
      return {
        ...state,
        get_my_contact: action.payload,
      };

    case GET_CENTRAL_CONTACT:
      return {
        ...state,
        get_central_contact: action.payload,
      };
    case GET_CALL_LOG:
      return {
        ...state,
        get_call_log: action.payload,
      };
    case CREATE_CONTACT:
      return {
        ...state,
        create_contact_response: action.payload,
      };
    case UPDATE_CONTACT:
      return {
        ...state,
        update_contact_response: action.payload,
      };

    case GET_REMOTE_CONTACT:
      return {
        ...state,
        get_remote_contact: action.payload,
      };
    case CALL_START_TIME:
      return {
        ...state,
        call_start_time: [...state.call_start_time, action.payload],
      };
    case CALLEE_ID:
      return {
        ...state,
        callee_id: [...state.callee_id, action.payload],
      };
    case CALLEE_NAME:
      return {
        ...state,
        callee_name: [...state.callee_name, action.payload],
      };
    case CALL_NUMBER:
      return {
        ...state,
        call_number: [...state.call_number, action.payload],
      };
    case CALL_TYPE:
      return {
        ...state,
        call_type: [...state.call_type, action.payload],
      };
    case DB_LOG_UPDATE:
      return {
        ...state,
        db_log_update: action.payload,
      };
    case GET_ALL_EFAX:
      return {
        ...state,
        all_efax: action.payload,
      };
    case SEND_EFAX:
      return {
        ...state,
        send_efax_response: action.payload,
      };
    case STATUS_CHANGE_NUMBER:
      return {
        ...state,
        onLineStatusNumber: action.payload,
      };

    default: {
      return state;
    }
  }
};
