import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

const CustomTooltip = ({ message, children }) => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{message}</Tooltip>}
    >
      {children}
    </OverlayTrigger>
  );
};

export default CustomTooltip;
