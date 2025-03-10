import React from "react";
import PropTypes from "prop-types";
import { useColorContext } from "../../context/colorcontext"; // Access color context

const Button = ({ children, onClick, variant = "primary", className = "", ...props }) => {
  const { componentColors } = useColorContext();

  const defaultColors = {
    background: "#007bff", // Default primary background color
    text: "#ffffff", // Default primary text color
  };

  // Get button colors from the context or fallback to defaults
  const buttonBackground =
    componentColors?.Button?.background || defaultColors.background;
  const buttonTextColor = componentColors?.Button?.text || defaultColors.text;

  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
      style={{
        backgroundColor: buttonBackground,
        color: buttonTextColor,
        borderColor: buttonBackground,
      }}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.string,
  className: PropTypes.string,
};

export default Button;
