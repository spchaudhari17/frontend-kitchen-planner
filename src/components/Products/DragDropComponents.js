import React, { useState, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import "./ProductList.css";
import Draggable from "react-draggable";

export const ItemTypes = {
  CABINET: "CABINET",
};

// Utility functions for localStorage
const saveNotesToLocalStorage = (notes) => {
  sessionStorage.setItem("cabinetNotes", JSON.stringify(notes));
};

const getNotesFromLocalStorage = () => {
  const storedNotes = sessionStorage.getItem("cabinetNotes");
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
export const DraggableCabinet = ({ name, imageSrc, }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CABINET",
    item: { name, imageSrc },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        margin: "10px",
        cursor: "grab",
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


//sahi hai 
export const DropZone = ({ onDrop, droppedItems, onRemove, onRotate, currentStep, setDroppedItems }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CABINET",
    drop: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      if (offset) {
        const x = offset.x;
        const y = offset.y;
        onDrop({ ...item, x, y, rotation: 0 });
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));


  //  Modal State for Notes
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

  useEffect(() => {
    saveNotesToLocalStorage(notesMap);
  }, [notesMap]);

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  // ✅ Global click event listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".cabinet-item")) {
        setSelectedItemIndex(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


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

  // const handleCabinetClick = (item) => {
  //   setSelectedItem(item);
  //   setModalOpen(true);
  // };


  const handleCabinetClick = (item) => {
    // Only show notes modal in "Add Notes" step
    if (currentStep === "Add Notes") {
      setSelectedItem(item);
      setModalOpen(true);
    }
  };


  const handlePositionChange = (index, position) => {
    setDroppedItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        x: position.x,
        y: position.y
      };
      return updated;
    });
  };


  // const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

// Add this useEffect to sync with localStorage changes
useEffect(() => {
  const handleStorageChange = () => {
    setNotesMap(getNotesFromLocalStorage());
  };

  window.addEventListener('storage', handleStorageChange);
  
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}, []);

  return (
    <div>


      <AddNotesModal
        isOpen={isModalOpen && currentStep === "Add Notes"}
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
          backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
          position: "relative",
          padding: "10px",
          textAlign: "center",
          display: "flex",
          flexWrap: "wrap",
          gap: "9px",
          alignContent: "flex-start",
        }}
      >
        {droppedItems.map((item, index) => (
          <Draggable key={item.id || index} position={{ x: item.x || 50, y: item.y || 50 }} 
          bounds="parent" 
          onStop={(e, data) => handlePositionChange(index, data)}>
            <div
              className="cabinet-item" // ✅ Added class for easy detection
              style={{
                position: "absolute",
                cursor: "move",
                transform: `rotate(${item.rotation}deg)`,
                transition: "transform 0.3s ease-in-out",
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemIndex(index);
              }}
            >
              <img
                src={item.imageSrc}
                alt={item.name}
                onClick={() => handleCabinetClick(item)}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                  display: "block",
                  transform: `rotate(${item.rotation}deg)`,
                  transition: "transform 0.3s ease-in-out",
                }}
              />

              {/* Show buttons only when selected */}
              {(currentStep === "Base Layout" && selectedItemIndex === index )&& (
                <>
                  {/* Rotate Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRotate(index);
                    }}
                    style={{
                      position: "absolute",
                      bottom: "5px",
                      left: "5px",
                      background: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "50%",
                      width: "25px",
                      height: "25px",
                      cursor: "pointer",
                    }}
                  >
                    ↻
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(index);
                    }}
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
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          </Draggable>
        ))}
      </div>
    </div>
  );
};



// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();