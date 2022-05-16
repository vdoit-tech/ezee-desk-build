import React, { useEffect, useState } from "react";
import { useStopwatch } from "react-timer-hook";

const StopWatch = () => {
  const { seconds, minutes, hours } = useStopwatch({
    autoStart: true,
  });

  const formatTime = (time) => {
    return String(time).padStart(2, "0");
  };

  let windowSize = window.matchMedia("(max-width: 300px)").matches;

  return (
    <div
      style={{ textAlign: "center" }}
      className={`${windowSize ? "mx-5" : "mx-1"}`}
    >
      <div>
        {hours > 0 && (
          <>
            <span className="font-weight-bold " style={{ fontSize: "15px" }}>
              {formatTime(hours)}
            </span>
            <span className="">:</span>
          </>
        )}
        <span className="font-weight-bold " style={{ fontSize: "15px" }}>
          {formatTime(minutes)}
        </span>
        <span className="">:</span>
        <span className="font-weight-bold " style={{ fontSize: "15px" }}>
          {formatTime(seconds)}
        </span>
      </div>
    </div>
  );
};

export default StopWatch;
