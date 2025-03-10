import React, { useState } from "react";
// import { Button } from "react-bootstrap";
import Button from "./ui/Button";
import { ChromePicker } from "react-color";

const ColorPicker = ({ component, property, color, onSave }) => {
  const [selectedColor, setSelectedColor] = useState(color || "#000000");
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="mt-3">
      <span>{`${property.charAt(0).toUpperCase() + property.slice(1)}:`}</span>
      <Button
        variant="link"
        onClick={() => setShowPicker((prev) => !prev)}
        className="mx-5"
      >
        {`Color Picker`}
      </Button>
      {showPicker && (
        <div className="mt-2">
          <ChromePicker
            color={selectedColor}
            onChange={(color) => setSelectedColor(color.hex)}
          />
          <Button
            variant="primary"
            className="mt-2"
            onClick={() => {
              onSave(component, property, selectedColor);
              setShowPicker(false);
            }}
          >
            Save {property.charAt(0).toUpperCase() + property.slice(1)}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
