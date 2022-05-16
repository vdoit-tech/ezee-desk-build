import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import UserState from "./context/useragent/UserState";
import ContactState from "./context/contact/ContactState";
import LoginState from "./context/login/LoginState";

ReactDOM.render(
  <React.StrictMode>
    <LoginState>
      <ContactState>
        <UserState>
          <App />
        </UserState>
      </ContactState>
    </LoginState>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
