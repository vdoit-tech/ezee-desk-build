import { FORGOT_PASSWORD } from "../../Constants/Api";
import {
  COLLAPSE_SIDEBAR,
  DYNAMIC_DATA_CHANGE,
  LOGIN,
  LOGIN_CHANGE,
  SCREEN_SIZE_CHANGE,
} from "../Types";

export default (state, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        login_response: action.payload,
      };
    case FORGOT_PASSWORD:
      return {
        ...state,
        forgot_password: action.payload,
      };
    case COLLAPSE_SIDEBAR:
      return {
        ...state,
        collapse_sidebar: action.payload,
      };
    case DYNAMIC_DATA_CHANGE:
      return {
        ...state,
        // dynamic_data: action.payload,
        loginChange: action.payload,
      };

    case LOGIN_CHANGE:
      return {
        ...state,
        loginChange: action.payload,
      };
    case SCREEN_SIZE_CHANGE:
      return {
        ...state,
        loaderOnSizeChange: action.payload,
      };

    default:
      return {
        state,
      };
  }
};
