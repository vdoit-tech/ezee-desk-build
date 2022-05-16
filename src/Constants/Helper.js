//function to display name of the contact matched with the provided number
export const DisplayName = (num) => {
  let name = null;

  let remote_contacts =
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let my_contacts =
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("my_contacts"));
  let central_contacts =
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
      "string" &&
    JSON.parse(sessionStorage.getItem("central_contacts"));

  remote_contacts !== false &&
    remote_contacts.some((item, index) => {
      if (item.extension_no == num.num) {
        name = item.name;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.extension_no)
      ) {
        name = item.name;
      }
      if (name !== null) return true;
    });

  name == null &&
    remote_contacts !== false &&
    remote_contacts.some((item, index) => {
      if (item.telnyx_phone == num.num) {
        name = item.name;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.telnyx_phone)
      ) {
        name = item.name;
      }
      if (name !== null) return true;
    });

  //my contacts
  name == null &&
    my_contacts !== false &&
    my_contacts.some((item, index) => {
      item.phoneDetail.some((info) => {
        if (info.phone == num.num) {
          name = item.name;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          name = item.name;
        }
        if (name !== null) return true;
      });
      if (name !== null) return true;
    });

  //central contacts
  name == null &&
    central_contacts !== false &&
    central_contacts.some((item, index) => {
      item.phoneDetail.some((info) => {
        if (info.phone == num.num) {
          name = item.name;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          name = item.name;
        }
        if (name !== null) return true;
      });
      if (name !== null) return true;
    });
  return name;
};

export const getInfo = (num) => {
  let name = null;
  let numberorname = null;
  let img = null;

  let remote_contacts =
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let my_contacts =
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("my_contacts"));
  let central_contacts =
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
      "string" &&
    JSON.parse(sessionStorage.getItem("central_contacts"));

  remote_contacts !== false &&
    remote_contacts.map((item, index) => {
      //name
      if (item.extension_no == num.num) {
        name = item.name;
        numberorname = item.name;
        img = item.profile;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.extension_no)
      ) {
        name = item.name;
        numberorname = item.name;
        img = item.profile;
      }
    });
  remote_contacts !== false &&
    remote_contacts.map((item, index) => {
      if (item.telnyx_phone == num.num) {
        name = item.name;
        numberorname = item.name;
        img = item.profile;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.telnyx_phone)
      ) {
        name = item.name;
        numberorname = item.name;
        img = item.profile;
      }
    });

  //my contacts
  my_contacts !== false &&
    my_contacts.map((item, index) => {
      item.phoneDetail.map((info) => {
        if (info.phone == num.num) {
          name = item.name;
          numberorname = item.name;
          img = item.image;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          name = item.name;
          numberorname = item.name;
          img = item.image;
        }
      });
    });

  //central contacts
  central_contacts !== false &&
    central_contacts.map((item, index) => {
      item.phoneDetail.map((info) => {
        if (info.phone == num.num) {
          name = item.name;
          numberorname = item.name;
          img = item.image;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          name = item.name;
          numberorname = item.name;
          img = item.image;
        }
      });
    });

  var obj = { name: name, img: img, numberorname: numberorname };
  return obj;
};

//function to display name if found else number of the contact matched with the provided number
export const DisplayNameOrNumber = (num) => {
  let name = null;

  let remote_contacts =
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let my_contacts =
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("my_contacts"));
  let central_contacts =
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
      "string" &&
    JSON.parse(sessionStorage.getItem("central_contacts"));

  remote_contacts !== false &&
    remote_contacts !== null &&
    remote_contacts !== undefined &&
    typeof remote_contacts !== "string" &&
    remote_contacts.some((item, index) => {
      if (item.extension_no == num.num) {
        name = item.name;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.extension_no)
      ) {
        name = item.name;
      }
      if (name !== null) return true;
    });
  name == null &&
    remote_contacts !== false &&
    remote_contacts !== null &&
    remote_contacts !== undefined &&
    typeof remote_contacts !== "string" &&
    remote_contacts.some((item, index) => {
      if (item.telnyx_phone == num.num) {
        name = item.name;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.telnyx_phone)
      ) {
        name = item.name;
      }
      if (name !== null) return true;
    });

  //my contacts
  name == null &&
    my_contacts !== false &&
    my_contacts !== null &&
    my_contacts !== undefined &&
    typeof my_contacts !== "string" &&
    my_contacts.some((item, index) => {
      item.phoneDetail.some((info) => {
        if (info.phone == num.num) {
          name = item.name;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          name = item.name;
        }
        if (name !== null) return true;
      });
      if (name !== null) return true;
    });

  //central contacts
  name == null &&
    central_contacts !== false &&
    central_contacts !== null &&
    central_contacts !== undefined &&
    typeof central_contacts !== "string" &&
    central_contacts.some((item, index) => {
      item.phoneDetail.some((info) => {
        if (info.phone == num.num) {
          name = item.name;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          name = item.name;
        }
        if (name !== null) return true;
      });
      if (name !== null) return true;
    });
  return name == null ? num.num : name;
};

//function to set image of the contact matched with the provided number
export const setCallImage = (num) => {
  let img = null;

  let remote_contacts =
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let my_contacts =
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("my_contacts"));
  let central_contacts =
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
      "string" &&
    JSON.parse(sessionStorage.getItem("central_contacts"));
  remote_contacts !== false &&
    remote_contacts !== null &&
    remote_contacts !== undefined &&
    typeof remote_contacts !== "string" &&
    remote_contacts.some((item, index) => {
      if (item.extension_no == num) {
        img = item.profile;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.extension_no)
      ) {
        img = item.profile;
      }

      if (img !== null) return true;
    });
  img == null &&
    remote_contacts !== false &&
    remote_contacts !== null &&
    remote_contacts !== undefined &&
    typeof remote_contacts !== "string" &&
    remote_contacts.some((item, index) => {
      if (item.telnyx_phone == num) {
        img = item.profile;
      } else if (
        removeCountryCode(num.num) == removeCountryCode(item.telnyx_phone)
      ) {
        img = item.profile;
      }
      if (img !== null) return true;
    });

  //my contacts
  img == null &&
    my_contacts !== false &&
    my_contacts !== null &&
    my_contacts !== undefined &&
    typeof my_contacts !== "string" &&
    my_contacts.some((item, index) => {
      item.phoneDetail.some((info) => {
        if (info.phone == num) {
          img = item.image;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          img = item.image;
        }

        if (img !== null) return true;
      });
      if (img !== null) return true;
    });

  //central contacts
  img == null &&
    central_contacts !== false &&
    central_contacts !== null &&
    central_contacts !== undefined &&
    typeof central_contacts !== "string" &&
    central_contacts.some((item, index) => {
      item.phoneDetail.some((info) => {
        if (info.phone == num) {
          img = item.image;
        } else if (
          removeCountryCode(num.num) == removeCountryCode(info.phone)
        ) {
          img = item.image;
        }

        if (img !== null) return true;
      });
      if (img !== null) return true;
    });
  return img;
};

//function to display name if found else number of the contact matched with the provided number
export const showNameOrNumber = (num) => {
  let name = null;

  let remote_contacts =
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("remote_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("remote_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("remote_contacts"));

  let my_contacts =
    JSON.parse(sessionStorage.getItem("my_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("my_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("my_contacts")) !== "string" &&
    JSON.parse(sessionStorage.getItem("my_contacts"));
  let central_contacts =
    JSON.parse(sessionStorage.getItem("central_contacts")) !== null &&
    JSON.parse(sessionStorage.getItem("central_contacts")) !== undefined &&
    typeof JSON.parse(sessionStorage.getItem("central_contacts")) !==
      "string" &&
    JSON.parse(sessionStorage.getItem("central_contacts"));

  remote_contacts !== false &&
    remote_contacts !== null &&
    remote_contacts !== undefined &&
    typeof remote_contacts !== "string" &&
    remote_contacts.map((item, index) => {
      if (item.extension_no == num) {
        name = item.name;
      } else if (
        removeCountryCode(num) == removeCountryCode(item.extension_no)
      ) {
        name = item.name;
      }
    });
  remote_contacts !== false &&
    remote_contacts !== null &&
    remote_contacts !== undefined &&
    typeof remote_contacts !== "string" &&
    remote_contacts.map((item, index) => {
      if (item.telnyx_phone == num) {
        name = item.name;
      } else if (
        removeCountryCode(num) == removeCountryCode(item.telnyx_phone)
      ) {
        name = item.name;
      }
    });

  //my contacts
  my_contacts !== false &&
    my_contacts !== null &&
    my_contacts !== undefined &&
    typeof my_contacts !== "string" &&
    my_contacts.map((item, index) => {
      item.phoneDetail.map((info) => {
        if (info.phone == num) {
          name = item.name;
        } else if (removeCountryCode(num) == removeCountryCode(info.phone)) {
          name = item.name;
        }
      });
    });

  //central contacts
  central_contacts !== false &&
    central_contacts !== null &&
    central_contacts !== undefined &&
    typeof central_contacts !== "string" &&
    central_contacts.map((item, index) => {
      item.phoneDetail.map((info) => {
        if (info.phone == num) {
          name = item.name;
        } else if (removeCountryCode(num) == removeCountryCode(info.phone)) {
          name = item.name;
        }
      });
    });
  return name == null ? num : name;
};

export const CheckName = (num, callee) => {
  let val = showNameOrNumber(num.num);
  let displayName = "";

  if (val !== num.num && val !== null) {
    displayName = val;
  } else if (num.callee !== "null" && num.callee !== null) {
    displayName = num.callee;
  }
  return displayName;
};

//function for dowloading sent or received images in SMS and IM
// export const download = (url) => {
//   var element = document.createElement("a");
//   var file = new Blob([url], { type: "image/*" });
//   element.href = URL.createObjectURL(file);
//   element.download = "image.jpg";
//   element.click();
// };
export function download(source) {
  var link = document.createElement("a");
  link.href = "images.jpg";
  link.download = "Download.jpg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

//function to check messages if they are from group or not
export const CheckMessages = (message) => {
  // try {
  //   if (typeof JSON.parse(message.message) === "object") {
  //     if (
  //       JSON.parse(message.message).replyTo !== undefined &&
  //       JSON.parse(message.message).replyTo !== "" &&
  //       JSON.parse(message.message).text !== undefined
  //     ) {
  //       return (
  //         <span>
  //           <span className="fw-bold me-1">
  //             {JSON.parse(message.message).replyTo}
  //           </span>
  //           <span className=" mx-1">
  //             {`"${JSON.parse(message.message).text}"`}
  //           </span>
  //           :<span className="ms-1">{JSON.parse(message.message).msg}</span>
  //         </span>
  //       );
  //     } else if (
  //       JSON.parse(message.message).replyTo !== undefined &&
  //       JSON.parse(message.message).replyTo !== "" &&
  //       JSON.parse(message.message).text === undefined
  //     ) {
  //       return (
  //         <span>
  //           <span className="fw-bold me-1">
  //             {JSON.parse(message.message).replyTo}
  //           </span>
  //           :<span className="ms-1">{JSON.parse(message.message).msg}</span>
  //         </span>
  //       );
  //     } else if (JSON.parse(message.message).replyTo === "") {
  //       return <span className="">{JSON.parse(message.message).msg}</span>;
  //     }
  //   }
  // } catch (e) {
  //   return message.message;
  // }

  try {
    if (
      sessionStorage.getItem("groupNames") !== undefined &&
      sessionStorage.getItem("groupNames") !== null
    ) {
      if (
        sessionStorage
          .getItem("groupNames")
          .split(",")
          .includes(message.message.split(":")[0])
      ) {
        return (
          <span>
            <span className="fw-bold me-1">
              {message.message.split(":")[0]}:
            </span>
            <span className=" mx-1">{message.message.split(":")[1]}</span>
          </span>
        );
      } else {
        return <span className="">{message.message}</span>;
      }
    }
  } catch (e) {
    return message.message;
  }
  return null;
};

//function to remove country code and return original number
const removeCountryCode = (val) => {
  if (val !== null && val !== undefined) {
    if (val.length > 10) {
      val = val.slice(val.length - 10, val.length);
    }
  }

  return val;
};

const unReplied = (val, smsChats, group) => {
  let arr = [];
  let num = 0;
  let index = 0;
  let arrr = smsChats[val]
    .filter((i) => i.from !== group)
    .map((item, idx) => smsChats[val][smsChats[val].length - 1 - idx]);

  for (let i = 0; i < arrr.length; i++) {
    console.log(arrr[i]);
    if (arrr[i].read_status == 1) {
      index = i;
      break;
    }
  }

  for (let i = index - 1; i >= 0; i--) {
    console.log(arrr[i]);
    if (arrr[i].read_status == 0) {
      console.log("later", arrr, arrr[i], num);
      num += 1;
    }
  }
  console.log("num", num);
  return num;
};

export const getTotalUnReplied = (smsChats, group) => {
  var numb = 0;
  console.log("keys", Object.keys(smsChats));

  if (smsChats !== {}) {
    let smsArr = Object.keys(smsChats);
    for (let i = 0; i < smsArr.length; i++) {
      if (
        sessionStorage.getItem("groupNumbers") !== null &&
        sessionStorage.getItem("groupNumbers") !== undefined
      ) {
        if (
          smsArr[i] !== sessionStorage.getItem("my_telnyx_num") &&
          smsArr[i] !== group
        ) {
          console.log("group", smsArr[i], smsChats, group);
          numb += unReplied(smsArr[i], smsChats, group);
        }
      }
    }
  }
  // smsChats !== {} &&
  //   Object.keys(smsChats).map((item) => {
  //     console.log("item", item);
  //     if (
  //       sessionStorage.getItem("groupNumbers") !== null &&
  //       sessionStorage.getItem("groupNumbers") !== undefined
  //     ) {
  //       if (
  //         item !== sessionStorage.getItem("my_telnyx_num") &&
  //         item !== group
  //       ) {
  //         console.log("group", item, smsChats, group);
  //         numb += unReplied(item, smsChats, group);
  //         console.log("numb", numb);
  //       }
  //     }
  //   });
  // !sessionStorage.getItem("groupNumbers").split(",").includes(item) &&
  console.log("numb", numb);
  return numb;
};

//logger for console logs
export const detailsLogger = (text) => {
  const path = window.require("path");
  const fs = window.require("fs");
  fs.appendFile(
    path.join(path.resolve("./"), "/src/logger.log"),
    `\n[${new Date().toLocaleString()}] [info] :${text}`,
    (err) => {
      if (err) {
        console.log("An error ocurred creating the file " + err.message);
      }

      console.log("The file has been succesfully saved");
    }
  );
};
