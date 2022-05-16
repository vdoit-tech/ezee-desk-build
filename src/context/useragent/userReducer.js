import {
  SESSION_STORE,
  SESSION_STORE_TO_NULL,
  SET_GLOBAL_USER_AGENT,
  HIDE,
  ONGOING,
  DELETE_NTH_SESSION,
  DELETE_ZEROTH_SESSION,
  SET_NEW_SESSION_INFO,
  NAV_HEADER,
  USER_REGISTERED,
  USER_DATABASE,
  COLLAPSE_DASHBOARD,
  DEMO_CALL,
  DELETE_DEMO_CALL,
  DEMO_STATE,
  MISSED_STATUS,
  NAV_SUBHEADER,
  ADD_CONFERENCE,
  SINGLE_SCREEN,
  REPEATED_NUMBER,
  REMOVE_CONFERENCE,
  SESSION_DUPLICATE_ADD,
  SESSION_DUPLICATE_DELETE,
  SESSION_INFO_DUPLICATE_ADD,
} from "../Types";

//eslint-disable-next-line
export default (state, action) => {
  switch (action.type) {
    case SESSION_STORE:
      // let arr = [...state.sessionInfoDuplicate];
      // arr[`${action.payload._id}`] = { data: action.payload };
      // console.log(arr);
      return {
        ...state,
        sessionInfo: [...state.sessionInfo, action.payload],
      };

    case SESSION_INFO_DUPLICATE_ADD:
      return {
        ...state,
        sessionInfoDuplicate: [...state.sessionInfoDuplicate, action.payload],
      };
    case SESSION_STORE_TO_NULL:
      return {
        ...state,
        sessionInfo: [],
      };
    case DELETE_ZEROTH_SESSION:
      console.log(state.sessionInfo);
      return {
        ...state,
        sessionInfo: Array.isArray(state.sessionInfo)
          ? state.sessionInfo.shift()
          : [],
      };

    case DELETE_NTH_SESSION:
      return {
        ...state,
        sessionInfo: state.sessionInfo.filter(
          (session) => session._id !== action.payload
        ),
      };
    case SESSION_DUPLICATE_DELETE:
      return {
        ...state,
        sessionInfoDuplicate: state.sessionInfoDuplicate.filter(
          (session) => session.id !== action.payload
        ),
      };

    case SET_GLOBAL_USER_AGENT:
      return {
        ...state,
        userAgentInfo: action.payload,
      };

    case HIDE: {
      return {
        ...state,
        hide: action.payload,
      };
    }

    case NAV_HEADER: {
      return {
        ...state,
        nav_header: action.payload,
      };
    }
    case NAV_SUBHEADER: {
      return {
        ...state,
        nav_subheader: action.payload,
      };
    }
    case USER_REGISTERED: {
      return {
        ...state,
        user_registered: action.payload,
      };
    }

    case COLLAPSE_DASHBOARD: {
      return {
        ...state,
        collapse_dashboard: action.payload,
      };
    }

    case DEMO_STATE: {
      return {
        ...state,
        demo_state: action.payload,
      };
    }
    case MISSED_STATUS: {
      return {
        ...state,
        missed_status: action.payload,
      };
    }

    case ADD_CONFERENCE: {
      return {
        ...state,
        conferenceData: [...state.conferenceData, action.payload],
      };
    }
    case REMOVE_CONFERENCE: {
      return {
        ...state,
        conferenceData: action.payload,
      };
    }
    case SINGLE_SCREEN: {
      return {
        ...state,
        single_screen: action.payload,
      };
    }

    default:
      return state;
  }
};
