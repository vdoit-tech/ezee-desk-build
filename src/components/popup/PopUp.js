import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const PopUp = (props) => {
  const [show, setShow] = useState(props.show);
  return (
    <Modal
      show={props.show}
      // onHide={props.setShow}
      backdrop="static"
      keyboard={false}
      centered
    >
      {/* <Modal.Body>modal body....</Modal.Body> */}
      <div className={`text-center fs-5 py-4 ${props.color}`}>
        {props.message}
      </div>
      <Modal.Footer className="py-0">
        <Button
          variant="primary"
          onClick={() => {
            // setShow(false);
            props.handleClose();
          }}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PopUp;
