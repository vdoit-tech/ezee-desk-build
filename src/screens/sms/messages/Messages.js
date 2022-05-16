import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import ImageComponent from "./ImageComponent";
import "./Messages.css";

const Messages = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [file, setFile] = useState();
  const [typing, setTyping] = useState("");

  const sendMessage = async () => {
    if (file) {
      const messageData = {
        room: room,
        author: username,
        type: "file",
        message: file,
        miniType: file.type,
        fileName: file.name,
        // attachment:null,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setFile();
    } else {
      if (currentMessage !== "") {
        const messageData = {
          room: room,
          author: username,
          tye: "text",
          message: currentMessage,
          // attachment:null,
          time:
            new Date(Date.now()).getHours() +
            ":" +
            new Date(Date.now()).getMinutes(),
        };
        console.log(messageData);

        await socket.emit("send_message", messageData);
        setMessageList((list) => [...list, messageData]);
        setCurrentMessage("");
      }
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  useEffect(() => {
    console.log();
    socket.on("receive_typing", (user) => {
      setTyping(`${user.username} is typing…..`);
    });
  }, []);

  const selectFile = (e) => {
    setCurrentMessage(e.target.files[0].name);
    setFile(e.target.files[0]);
  };

  return (
    <ScrollToBottom className="chat-window w-100 h-100">
      <div className="chat-header"></div>
      <div className="chat-body mb-5">
        <div className="message-container">
          {messageList.map((messageContent) => {
            if (messageContent.type !== "file") {
              return username !== messageContent.author ? (
                <div className="row w-100 ">
                  <div className="d-flex row justify-content-start mb-4 msg-container ">
                    <div>
                      <div className="msg_received_container">
                        {messageContent.message}
                      </div>
                      <span className="ps-4">
                        {messageContent.time}
                        <span style={{ paddingLeft: 10 }}>
                          {" "}
                          {messageContent.author}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row w-100  justify-content-end">
                  <div className="d-flex flex-column justify-content-end mb-4 float-end msg-container ">
                    <div className="msg_send_container ">
                      {messageContent.message}
                    </div>

                    <span className="text-end pe-4">
                      {messageContent.time}
                      <span style={{ paddingLeft: 10 }}>
                        {" "}
                        {messageContent.author}
                      </span>
                    </span>
                  </div>
                </div>
              );
            } else {
              const blob = new Blob([messageContent.message], {
                type: messageContent.type,
              });
              return (
                <ImageComponent
                  fileName={messageContent.fileName}
                  blob={blob}
                  username={username}
                  author={messageContent.author}
                  time={messageContent.time}
                />
                // <div
                //   className="message"
                //   id={username === messageContent.author ? 'other' : 'you'}
                // >
                //   <div>
                //     <img
                //       src={`data:image/*;base64,${messageContent.message}`}
                //       alt=""
                //     />
                //     <div className="message-content">
                //       <p>{messageContent.fileName}</p>
                //     </div>
                //     <div className="message-meta">
                //       <p id="time">{messageContent.time}</p>
                //       <p id="author">{messageContent.author}</p>
                //     </div>
                //   </div>
                // </div>
              );
            }
          })}
        </div>
      </div>
      <div className="row px-2 bottom-div pb-4 pt-0 msg_input bg-white">
        <div className="col-12 d-flex justify-content-end">
          <input
            type="text"
            className="search-input mb-2"
            placeholder="Enter your message"
            style={{ width: "100%" }}
            value={currentMessage}
            onChange={async (event) => {
              setCurrentMessage(event.target.value);
              await socket.emit("send_typing", {
                room: room,
                username: username,
              });
            }}
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />

          <span className=" d-flex  align-items-end pb-2  ">
            {/* normal or base 64 */}
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={selectFile}
            />
            <label
              htmlFor="file"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                paddingLeft: "4px",
              }}
            >
              <i className="fas fa-paperclip px-2" />
            </label>

            <i className="fas fa-paper-plane px-2" onClick={sendMessage} />
          </span>
        </div>
      </div>
    </ScrollToBottom>
  );
};

export default Messages;
