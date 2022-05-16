import { useState, useRef } from "react";

const useTimer = (initialState = 0) => {
  const [timer, setTimer] = useState(initialState);
  const [isActive, setIsActive] = useState(false);

  const countRef = useRef(null);

  const handleStart = () => {
    setIsActive(true);

    countRef.current = setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  };

  return { timer, isActive, handleStart };
};

export default useTimer;

export const formatTime = (timer) => {
  const getSeconds = `0${timer % 60}`.slice(-2);
  const minutes = `${Math.floor(timer / 60)}`;
  const getMinutes = `0${minutes % 60}`.slice(-2);
  const getHours = `0${Math.floor(timer / 3600)}`.slice(-2);

  return `${getHours} : ${getMinutes} : ${getSeconds}`;
};
