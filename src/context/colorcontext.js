import React, { createContext, useContext, useState } from 'react';

const ColorContext = createContext();

export const useColorContext = () => useContext(ColorContext);

export const ColorProvider = ({ children }) => {
  const [componentColors, setComponentColors] = useState({});

  const updateColor = (component, color) => {
    setComponentColors((prevColors) => ({
      ...prevColors,
      [component]: color,
    }));
  };

  return (
    <ColorContext.Provider value={{ componentColors, updateColor }}>
      {children}
    </ColorContext.Provider>
  );
};
