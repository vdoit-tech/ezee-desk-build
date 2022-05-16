import React, { useContext, useEffect, useState } from "react";
import "./Calls.css";

import person from "../../assets/imgs/person.jfif";
import UserContext from "../../context/useragent/userContext";
// import {
//   AutoSizer,
//   List,

// } from "react-virtualized";
// import "react-virtualized/styles.css";

const Calls = (props) => {
  const userContext = useContext(UserContext);
  const { sessionInfo } = userContext;
  const arr = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10,
  ];
  const [people, setPeople] = useState([]);
  const [time, setTime] = useState(new Date());

  // useEffect(() => {
  //   setPeople(
  //     ...arr.map((key) => {
  //       return (
  //         <div
  //           className="col-12  mx-auto my-1 py-1 ps-3 d-flex align-items-center calls"
  //           key={key}
  //         >
  //           <div className="">
  //             <img
  //               src={person}
  //               alt=""
  //               style={{
  //                 width: "2rem",
  //                 height: "2rem",
  //                 border: "1px solid gray",
  //                 borderRadius: "50%",
  //               }}
  //             />
  //           </div>
  //           <div className="mx-2">
  //             <div style={{ fontWeight: 700 }}>Williams</div>
  //             <div style={{ fontSize: "0.85rem" }}>
  //               <span className="me-2">
  //                 <i className="fas fa-phone-alt"></i>
  //               </span>
  //               <span>Call Ended</span>-<span>10m 12s</span>
  //             </div>
  //           </div>
  //         </div>
  //       );
  //     })
  //   );
  // }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return clearInterval(interval);
  }, []);

  return (
    <div className="container-fluid h-100 px-0 calls-div">
      <div style={{ width: "100%", height: "30vh" }}>
        {/* <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              rowCount={arr.length}
              rowHeight={55}
              rowRenderer={({ key, index, style }) => {
                return (
                  <div key={key} style={style}>
                    {people}
                  </div>
                );
              }}
              width={width}
            />
          )}
        </AutoSizer> */}
      </div>
    </div>
  );
};

export default Calls;
