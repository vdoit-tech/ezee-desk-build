import React, { useContext, useEffect } from 'react';
import defaultPic from '../../../assets/imgs/default-profile.png';
import UserContext from '../../../context/useragent/userContext';
import './AllGroups.css';

const AllGroups = (props) => {
  const userContext = useContext(UserContext);
  const { setNavHeader, userAgentInfo, dilaerFun } = userContext;
  const arr = [1, 2, 3, 4, 5, 6, 7];
  useEffect(() => {
    setNavHeader('Groups');
  }, []);
  return (
    <div className="container px-0">
      <div className="row mt-4 ">
        <div className="form-group me-4 mb-2">
          <i className="fas fa-search" />
          <input
            placeholder="Search Contact"
            className="form-control sidebar-search rounded-pill"
          />
        </div>
      </div>
      {arr.map((i, index) => {
        return (
          <div
            className="row  mt-3  py-1 position-relative border-bottom  one-chat"
            onClick={() => {
              props.history.push('/Messages');
            }}
          >
            <div className="row position-relative">
              <div className="col-3 d-flex align-items-center">
                <div className="">
                  <img src={defaultPic} alt="" className="call-person-img" />
                </div>
                <div className="mx-4">
                  <div className="fs-6 fw-bold px-0">Name</div>
                </div>
              </div>
              <div className="col-6"></div>
              <div className="col-3 d-flex align-items-center justify-content-end">
                <div className="mx-4 ">
                  <div className="px-0">02:34 AM</div>
                </div>
              </div>
            </div>

            <div className="row  ps-4  ps-5">
              <span className="col d-flex  " style={{ paddingLeft: '2.3rem' }}>
                some text
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default AllGroups;
