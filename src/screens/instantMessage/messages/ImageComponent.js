import React, { useEffect, useState } from 'react';

const ImageComponent = ({ fileName, blob, username, author, time }) => {
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      setImageSrc(reader.result);
    };
  }, [blob]);

  return username === author ? (
    <div className="row w-100  justify-content-end">
      <div className="d-flex flex-column justify-content-end mb-4 float-end msg-container ">
        <div className="msg_send_container bg-white text-end">
          <img
            src={imageSrc}
            alt=""
            style={{ width: '140px', height: 'auto' }}
          />
        </div>

        <span className="text-end pe-4">
          {time}
          <span style={{ paddingLeft: 10 }}> {author}</span>
        </span>
      </div>
    </div>
  ) : (
    <div className="row w-100 ">
      <div className="d-flex row justify-content-start mb-4 msg-container ">
        <div>
          <div className="msg_received_container_image bg-white text-start">
            <img
              src={imageSrc}
              alt=""
              style={{ width: '140px', height: 'auto' }}
            />
          </div>
          <span className="ps-4">
            {time}
            <span style={{ paddingLeft: 10 }}> {author}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageComponent;
