import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import "./ProductList.css";

export const ItemTypes = {
  CABINET: "CABINET",
};

// Utility functions for localStorage
const saveNotesToLocalStorage = (notes) => {
  localStorage.setItem("cabinetNotes", JSON.stringify(notes));
};

const getNotesFromLocalStorage = () => {
  const storedNotes = localStorage.getItem("cabinetNotes");
  return storedNotes ? JSON.parse(storedNotes) : {};
};

// Modal Component
const AddNotesModal = ({ isOpen, onClose, onSave, item }) => {
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "white",
        padding: "20px",
        boxShadow: "0px 0px 10px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      <h3>Add Notes for {item?.name}</h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="4"
        cols="30"
      />
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={() => {
            onSave(item, note);
            setNote("");
          }}
        >
          Save
        </button>
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// Draggable Cabinet Component
export const DraggableCabinet = ({ name, imageSrc, onCabinetClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CABINET,
    item: { name, imageSrc },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={() => onCabinetClick({ name, imageSrc })} // Click Event
      style={{
        opacity: isDragging ? 0.5 : 1,
        margin: "10px",
        cursor: "pointer",
      }}
    >
      <img
        src={imageSrc}
        alt={name}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
};

// Drop Zone Component
export const DropZone = ({ onDrop, droppedItems, onRemove }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CABINET,
    drop: (item) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));


  // Base aur Tall Cabinets ko alag-alag categorize karna
  const baseCabinets = droppedItems.filter((item) =>
    item.name.includes("Base")
  );
  const tallCabinets = droppedItems.filter((item) =>
    item.name.includes("Tall")
  );

  //  Modal State for Notes
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

  useEffect(() => {
    saveNotesToLocalStorage(notesMap);
  }, [notesMap]);

  const handleCabinetClick = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleSaveNotes = (item, note) => {
    setNotesMap((prevNotesMap) => {
      const existingNotes = prevNotesMap[item.name] || [];
      const updatedNotes = {
        ...prevNotesMap,
        [item.name]: [...existingNotes, note],
      };

      // Save to localStorage
      saveNotesToLocalStorage(updatedNotes);

      // Fire a storage event
      window.dispatchEvent(new Event("storage"));

      return updatedNotes;
    });
    setModalOpen(false);
  };




  return (
    <div>

      {/* Notes Modal */}
      <AddNotesModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNotes}
        item={selectedItem}
      />

      {/* Drop Area */}
      <div
        ref={drop}
        style={{
          width: "75%",
          height: "400px",
          border: isOver ? "2px dashed #00bfff" : "2px dashed #ccc",
          textAlign: "center",
          backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",

          position: "relative",
          padding: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "9px",
          alignContent: "flex-start",
        }}
         className="sidemenu"
      >
        {/* Base Cabinets - Column wise */}
        <div>
          {baseCabinets.length === 0 && (
            <p className="boxtxt">.</p>
          )}
          {baseCabinets.map((item, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={item.imageSrc}
                alt={item.name}
                onClick={() => handleCabinetClick(item)}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
                className="itmimg"
              />
              <button
                onClick={() => onRemove(index)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "#0dcaf0",
                  color: "#343a40",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Tall Cabinets - Next to Base */}
        <div style={{ display: "flex", gap: "10px" }}>
          {tallCabinets.length === 0 && (
            <p className="boxtxt">Drag and drop cabinets here</p>
          )}
          {tallCabinets.map((item, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={item.imageSrc}
                alt={item.name}
                onClick={() => handleCabinetClick(item)}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                  cursor: "pointer",
                }}
                className="itmimg"
              />
              <button
                onClick={() => onRemove(index)}
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  background: "#0dcaf0",
                  color: "#343a40",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};


// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();
