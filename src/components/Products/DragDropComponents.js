import React, { useState, useEffect } from "react";
import { useDrag, useDrop, useDragLayer } from "react-dnd";
import "./ProductList.css";
import Draggable from "react-draggable";

export const ItemTypes = {
  CABINET: "CABINET",
};

const saveNotesToLocalStorage = (notes) => {
  sessionStorage.setItem("cabinetNotes", JSON.stringify(notes));
};

const getNotesFromLocalStorage = () => {
  const storedNotes = sessionStorage.getItem("cabinetNotes");
  return storedNotes ? JSON.parse(storedNotes) : {};
};

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

export const DraggableCabinet = ({
  name,
  imageSrc,
  id,
  cabinateFrontImage,
  minWidth,
  maxWidth,
  minDepth,
  maxDepth,
}) => {
  const cabinetWidth = 100;
  const cabinetHeight = 100;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: "CABINET",
      item: {
        id,
        name,
        imageSrc,
        frontImageSrc: cabinateFrontImage,
        minWidth: minWidth || cabinetWidth,
        maxWidth: maxWidth || cabinetWidth,
        minDepth: minDepth || cabinetHeight,
        maxDepth: maxDepth || cabinetHeight,
        width: cabinetWidth,
        height: cabinetHeight,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id, name, imageSrc]
  );

  return (
    <>
      <div
        ref={drag}
        style={{
          opacity: isDragging ? 0.5 : 1,
          margin: "10px",
          cursor: "grab",
          width: `${cabinetWidth}px`,
          height: `${cabinetHeight}px`,
        }}
      >
        <img
          src={imageSrc}
          alt={name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            border: "1px solid #ccc",
            pointerEvents: "none", // Prevent grab on image itself
          }}
        />
      </div>
    </>
  );
};

export const DropZone = ({
  onDrop,
  droppedItems,
  onRemove,
  onRotate,
  currentStep,
  setDroppedItems,
  roomSize,
}) => {
  const {
    item: draggingItem,
    isDragging,
    clientOffset: dragLayerOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  const isOverlapping = (newItem, existingItems) => {
    return existingItems.some((item) => {
      const buffer = 5; // Optional buffer for spacing
      return (
        newItem.x < item.x + item.width + buffer &&
        newItem.x + newItem.width > item.x - buffer &&
        newItem.y < item.y + item.height + buffer &&
        newItem.y + newItem.height > item.y - buffer
      );
    });
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CABINET,
    drop: (item, monitor) => {
      const dropTarget = document.getElementById("drop-area");
      const dropTargetRect = dropTarget.getBoundingClientRect();
      const clientOffset = monitor.getClientOffset();
      if (!dropTargetRect || !clientOffset) return;

      const x = clientOffset.x - dropTargetRect.left;
      const y = clientOffset.y - dropTargetRect.top;
      const cabinetWidth = item.minWidth || 100;
      const cabinetHeight = item.minDepth || 100;

      const newItem = {
        ...item,
        id: Date.now(),
        x,
        y,
        width: cabinetWidth,
        height: cabinetHeight,
        rotation: 0,
      };

      if (!isOverlapping(newItem, droppedItems)) {
        onDrop(newItem);
      } else {
        console.warn("Drop ignored due to overlap");
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

  useEffect(() => {
    saveNotesToLocalStorage(notesMap);
  }, [notesMap]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".cabinet-item")) setSelectedItemIndex(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSaveNotes = (item, note) => {
    setNotesMap((prev) => {
      const updated = {
        ...prev,
        [item.name]: [...(prev[item.name] || []), note],
      };
      saveNotesToLocalStorage(updated);
      window.dispatchEvent(new Event("storage"));
      return updated;
    });
    setModalOpen(false);
  };

  const handleCabinetClick = (item) => {
    if (currentStep === "Add Notes") {
      setSelectedItem(item);
      setModalOpen(true);
    }
  };

  const handlePositionChange = (index, position) => {
    const SNAP_THRESHOLD = 10; // 10 pixels snapping
    const item = droppedItems[index];
    const itemWidth = item.width || 100;
    const itemHeight = item.height || 100;
    const dropTarget = document.getElementById("drop-area");
    if (!dropTarget) return;
  
    let newX = position.x;
    let newY = position.y;
  
    const dropWidth = dropTarget.offsetWidth;
    const dropHeight = dropTarget.offsetHeight;
  
    // ⭐ SNAP TO RIGHT WALL
    if (dropWidth - (newX + itemWidth) <= SNAP_THRESHOLD) {
      newX = dropWidth - itemWidth;
    }
  
    // ⭐ SNAP TO LEFT WALL
    if (newX <= SNAP_THRESHOLD) {
      newX = 0;
    }
  
    // ⭐ SNAP TO BOTTOM WALL
    if (dropHeight - (newY + itemHeight) <= SNAP_THRESHOLD) {
      newY = dropHeight - itemHeight;
    }
  
    // ⭐ SNAP TO TOP WALL
    if (newY <= SNAP_THRESHOLD) {
      newY = 0;
    }
  
    setDroppedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], x: newX, y: newY };
      return updated;
    });
  };
  
  

  useEffect(() => {
    const handleStorageChange = () => setNotesMap(getNotesFromLocalStorage());
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const itemToMeasure =
    isDragging && draggingItem && dragLayerOffset
      ? {
          ...draggingItem,
          x: dragLayerOffset.x - 50,
          y: dragLayerOffset.y - 50,
        }
      : droppedItems[selectedItemIndex];

  const roomWidth = roomSize?.width || 3000;
  const roomHeight = roomSize?.depth || 2500;

  const measurement = itemToMeasure ? (() => {
    const dropArea = document.getElementById("drop-area");
    const pixelToMmX = roomWidth / dropArea.offsetWidth;
    const pixelToMmY = roomHeight / dropArea.offsetHeight;
  
    const leftMm = Math.round((itemToMeasure.x || 0) * pixelToMmX);
    const topMm = Math.round((itemToMeasure.y || 0) * pixelToMmY);
    const widthMm = Math.round((itemToMeasure.width || 100) * pixelToMmX);
    const heightMm = Math.round((itemToMeasure.height || 100) * pixelToMmY);
    const rightMm = Math.max(0, roomWidth - (leftMm + widthMm));
    const bottomMm = Math.max(0, roomHeight - (topMm + heightMm));
  
    return {
      left: leftMm,
      width: widthMm,
      right: rightMm,
      top: topMm,
      height: heightMm,
      bottom: bottomMm,
    };
  })() : null;
  
  

  return (
    <div style={{ display: "flex" }}>
      <AddNotesModal
        isOpen={isModalOpen && currentStep === "Add Notes"}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNotes}
        item={selectedItem}
      />
      <div style={{ width: "100%", position: "relative" }}>
        {/* Measurement display logic */}
        {measurement && (
          <div
            style={{
              position: "relative",
              height: "30px",
              width: "75%",
              marginBottom: "15px",
            }}
          >
            <hr
              style={{
                position: "absolute",
                width: "100%",
                top: "50%",
                borderTop: "2px solid #555",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "0",
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0 20px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  backgroundColor: "#f5f5f5",
                  padding: "0 5px",
                }}
              >
                {measurement.left}mm
              </span>
              <span
                style={{
                  fontSize: "12px",
                  backgroundColor: "#f5f5f5",
                  padding: "0 5px",
                }}
              >
                {measurement.width}mm
              </span>
              <span
                style={{
                  fontSize: "12px",
                  backgroundColor: "#f5f5f5",
                  padding: "0 5px",
                }}
              >
                {measurement.right}mm
              </span>
            </div>
          </div>
        )}
        {measurement && (
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "-31px",
              height: "400px",
              width: "30px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              zIndex: 2,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                fontSize: "12px",
                backgroundColor: "#f5f5f5",
                padding: "0 5px",
              }}
            >
              {measurement.top}mm
            </div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "0",
                transform: "translateY(-50%)",
                fontSize: "12px",
                backgroundColor: "#f5f5f5",
                padding: "0 5px",
              }}
            >
              {measurement.height}mm
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                fontSize: "12px",
                backgroundColor: "#f5f5f5",
                padding: "0 5px",
              }}
            >
              {measurement.bottom}mm
            </div>
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "14px",
                width: "1px",
                height: "100%",
                backgroundColor: "#ccc",
              }}
            />
          </div>
        )}

        {/* Drop area */}
        <div
          id="drop-area"
          ref={drop}
          style={{
            width: "80%",
            height: "400px",
            border: isOver ? "2px dashed #00bfff" : "2px dashed #ccc",
            backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
            position: "relative",
            padding: "0px",
            textAlign: "center",
            display: "flex",
            flexWrap: "wrap",
            gap: "9px",
            alignContent: "flex-start",
          }}
        >
          {droppedItems.map((item, index) => (
            <Draggable
              key={item.id || index}
              position={{ x: item.x || 0, y: item.y || 0 }}
              bounds="parent"
              onDrag={(e, data) => handlePositionChange(index, data)} // 🔥 Add this line
              onStop={(e, data) => handlePositionChange(index, data)} // 🔥 Keep this also
            >
              <div
                className="cabinet-item"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  cursor: "move",
                  width: `${item.width || 100}px`, // 🔥 Dynamic width
                  height: `${item.height || 100}px`, // 🔥 Dynamic height
                  transform: `rotate(${item.rotation}deg)`,
                  transition: "transform 0.3s ease-in-out",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemIndex(index);
                }}
              >
                <img
                  src={item?.frontImageSrc || item?.imageSrc}
                  alt={item.name}
                  onClick={() => handleCabinetClick(item)}
                  style={{
                    width: "100%", // 🔥 Fill parent div
                    height: "100%", // 🔥 Fill parent div
                    objectFit: "cover",
                    border: "1px solid #ccc",
                    display: "block",
                    transform: `rotate(${item.rotation}deg)`,
                    pointerEvents: "none",
                  }}
                />

                {currentStep === "Top View" && selectedItemIndex === index && (
                  <>
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

          {/* Floating preview while dragging */}
          {isDragging && draggingItem && dragLayerOffset && (
            <div
              style={{
                position: "absolute",
                pointerEvents: "none",
                left: `${dragLayerOffset.x - 50}px`,
                top: `${dragLayerOffset.y - 50}px`,
                zIndex: 9999,
                width: draggingItem.width || 100,
                height: draggingItem.height || 100,
                transform: `rotate(${draggingItem.rotation || 0}deg)`,
                opacity: 0.5,
                border: "1px dashed #007bff",
                backgroundImage: `url(${
                  draggingItem.frontImageSrc || draggingItem.imageSrc
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const getNotes = () => getNotesFromLocalStorage();
