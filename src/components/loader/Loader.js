import React from "react";

const Loader = (props) => {
  return (
    <div>
      <lord-icon
        src="https://cdn.lordicon.com/dpinvufc.json"
        trigger="loop"
        colors="primary:#000,secondary:#08a88a"
        style={{ width: `${props.width}`, height: `${props.height}` }}
      ></lord-icon>
    </div>
  );
};

export default Loader;
