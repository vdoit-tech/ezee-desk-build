import useContextMenu from "../customHooks/useContextMenu";

const RightClickMenu = (props) => {
  const { anchorPoint, show } = useContextMenu();
  // console.log(props);
  if (show) {
    return (
      <p style={{ paddingLeft: 40 }}>
        <ul
          className="menu rightclick-menu"
          style={{
            top: anchorPoint.y,
            left: anchorPoint.x,
            border: "ridge",
            // background:"#E8E8E8",
            borderRadius: 0,
            width: 200,
          }}
        >
          {props.children}
          {/* <Link to="/newSMSChat" className="link-color rightclick-menu-item">
           <p 
            style={{paddingLeft:10}}
           > Send a new SMS
           </p>
          </Link> */}
          {/* <Link to="/allSMSChats" className="link-color rightclick-menu-item">
            Check SMS
          </Link>
          <Link to="/allCalls" className="link-color rightclick-menu-item">
            Go to Call logs
          </Link> */}
        </ul>
      </p>
    );
  }
  return <></>;
};

export default RightClickMenu;
