// import React, { useContext, useEffect, useState } from "react";

// import UserContext from "../../../context/useragent/userContext";
// import ContactContext from "../../../context/contact/contactContext";

// const CreateGroups = (props) => {
//   const userContext = useContext(UserContext);
//   const contactContext = useContext(ContactContext);
//   const { setNavHeader } = userContext;
//   const { get_my_contact } = contactContext;
//   const [members, setMembers] = useState([]);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [checked, setChecked] = useState([]);

//   useEffect(() => {
//     setNavHeader("Create Group");
//     get_my_contact !== null && checked.fill(0, 0, get_my_contact.length);
//   }, []);

//   return (
//     <div className="container">
//       <div className="row mt-5 pt-5">
//         {/* <div className="col-4 d-flex justify-content-center">
//           <h4> Group</h4>
//         </div> */}
//         <div className="row">
//           <div className="d-flex flex-column">
//             <label for="name" className="ps-1 mt-2">
//               Name
//             </label>
//             <input
//               id="name"
//               className="form-control my-1"
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

//           <div className="d-flex flex-column">
//             <label for="description" className="ps-1 mt-2">
//               Description
//             </label>
//             <textarea
//               id="description"
//               className="form-control my-1"
//               onChange={(e) => setDescription(e.target.value)}
//             />
//           </div>
//           <div>
//             <label for="members" className="ps-1 mt-2">
//               Select Members
//             </label>
//             <select
//               className="form-select my-2"
//               id="members"
//               onChange={(e) => {
//                 setMembers((info) => {
//                   let data = [...info];
//                   data.push(e.target.value);
//                   return data;
//                 });
//               }}
//             >
//               <option selected>Choose Contact</option>
//               {/* {get_my_contact !== null &&
//                 get_my_contact.map((item, index) => {
//                   return (
//                     <option value={item.name} key={index}>
//                       {item.name}
//                     </option>
//                   );
//                 })} */}
//             </select>
//           </div>
//           {/* <div>
//             <ul>
//               {get_my_contact !== null &&
//                 get_my_contact.map((item, index) => {
//                   return (
//                     <li key={index}>
//                       {item.name} <input type="checkbox" className="px-2" />
//                     </li>
//                   );
//                 })}
//             </ul>
//           </div> */}

//           <div className="mt-2 cursor-pointer">
//             {members.length > 0 &&
//               members.map((i, j) => {
//                 return (
//                   <span className="bg-secondary text-white rounded p-2 mx-1">
//                     <span>{i}</span>
//                     <span
//                       className="px-1 ps-2 text-danger fw-bold "
//                       onClick={() => {
//                         setMembers(members.filter((k) => k !== i));
//                       }}
//                     >
//                       X
//                     </span>
//                   </span>
//                 );
//               })}
//           </div>
//         </div>
//       </div>
//       <div className="row my-2  pe-1 mt-5 pt-5">
//         <span className="d-flex justify-content-end">
//           <button className="btn btn-warning rounded-pill px-4 ">Create</button>
//         </span>
//       </div>
//     </div>
//   );
// };

// export default CreateGroups;
