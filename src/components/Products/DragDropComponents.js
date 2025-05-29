import React, { useState, useEffect, useRef, Fragment, forwardRef } from "react";
import { useDrag, useDrop, useDragLayer } from "react-dnd";
import "./ProductList.css";
import Draggable from "react-draggable";
import { createRoutesFromElements } from "react-router-dom";

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

  useEffect(() => {
    if (isOpen) {
      
      setNote(item?.note || "");
    }
  }, [isOpen, item]);

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
        width: "300px",
        borderRadius: "8px",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>
        Add Notes for {item?.name}
      </h3>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="4"
        cols="30"
        style={{ width: "100%", resize: "none", padding: "8px" }}
      />
      <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          onClick={() => {
            onSave(item, note);  
            setNote("");
          }}
        >
          Save
        </button>
        <button onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// Draggable Cabinet Component
export const DraggableCabinet = ({
  name,
  imageSrc,
  id,
  cabinateFrontImage,
  minWidth, // Add these props
  maxWidth,
  minDepth,
  maxDepth,
  basePrice,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CABINET",
    item: {
      id,
      name,
      imageSrc,
      minWidth, 
      maxWidth,
      minDepth,
      basePrice,
      maxDepth,
      frontImageSrc: cabinateFrontImage,
    },
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

 
export const DropZone = forwardRef((props, ref) => {
  const {
    onDrop,
    droppedItems,
    onRemove,
    onRotate,
    currentStep,
    setDroppedItems,
    roomSize = { width: 3000, depth: 2000 },
  } = props;

 

 {
  const dropRef = useRef(null);
  const [roomSizePixels, setRoomSizePixels] = useState({ width: 1, height: 1 });
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());
  const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
  const [verticalMeasurements, setVerticalMeasurements] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const {
    item: draggingItem,
    isDragging: isDragLayerDragging,
    clientOffset: dragLayerOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset(),
  }));

  // Load and save notes to localStorage
  useEffect(() => {
    saveNotesToLocalStorage(notesMap);
  }, [notesMap]);

  // Handle click outside cabinets
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".cabinet-item") &&
        !event.target.closest(".measurement-label")
      ) {
        setSelectedItemIndex(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Update room size in pixels when ref changes
  useEffect(() => {
    if (dropRef.current) {
      setRoomSizePixels({
        width: dropRef.current.offsetWidth,
        height: dropRef.current.offsetHeight,
      });
    }
  }, [dropRef]);

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

  const calculateMeasurements = (items, index) => {
    if (!dropRef.current || !items || !items.length || index == null || index >= items.length) {
      setHorizontalMeasurements([]);
      setVerticalMeasurements([]);
      return;
    }

    const item = items[index];
    if (!item) {
      setHorizontalMeasurements([]);
      setVerticalMeasurements([]);
      return;
    }

    const safeItem = {
      x: item.x || 0,
      y: item.y || 0,
      width: item.width || 300,
      height: item.height || 600,
      rotation: item.rotation || 0
    };


    let { x, y, width, height } = item;

    const roomWidth = roomSize.width;
    const roomHeight = roomSize.depth;

    // Constrain x/y to room bounds
    const cappedX = Math.max(0, Math.min(x, roomWidth - width));
    const cappedY = Math.max(0, Math.min(y, roomHeight - height));
    const cappedRight = cappedX + Math.min(width, roomWidth - cappedX);
    const cappedBottom = cappedY + Math.min(height, roomHeight - cappedY);

    const leftGap = Math.round(cappedX);
    const cabinetWidth = Math.round(cappedRight - cappedX);
    const rightGap = Math.round(roomWidth - cappedRight);

    const topGap = Math.round(cappedY);
    const cabinetHeight = Math.round(cappedBottom - cappedY);
    const bottomGap = Math.round(roomHeight - cappedBottom);

    setHorizontalMeasurements([
      {
        type: "left-gap",
        value: leftGap,
        position: cappedX / 2,
        from: 0,
        to: cappedX,
      },
      {
        type: "cabinet",
        value: cabinetWidth,
        position: cappedX + cabinetWidth / 2,
        from: cappedX,
        to: cappedRight,
      },
      {
        type: "right-gap",
        value: rightGap,
        position: cappedRight + rightGap / 2,
        from: cappedRight,
        to: roomWidth,
      },
    ]);

    setVerticalMeasurements([
      {
        type: "top-gap",
        value: topGap,
        position: cappedY / 2,
        from: 0,
        to: cappedY,
        vertical: true,
      },
      {
        type: "cabinet-height",
        value: cabinetHeight,
        position: cappedY + cabinetHeight / 2,
        from: cappedY,
        to: cappedBottom,
        vertical: true,
      },
      {
        type: "bottom-gap",
        value: bottomGap,
        position: cappedBottom + bottomGap / 2,
        from: cappedBottom,
        to: roomHeight,
        vertical: true,
      },
    ]);
  };

  useEffect(() => {
    if (selectedItemIndex !== null) {
      calculateMeasurements(droppedItems, selectedItemIndex);
    }
  }, [droppedItems, roomSize, selectedItemIndex]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CABINET",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const dropZoneNode = dropRef.current;
      if (!clientOffset || !dropZoneNode) return;

      const rect = dropZoneNode.getBoundingClientRect();
      const mmPerPixelX = roomSize.width / rect.width;
      const mmPerPixelY = roomSize.depth / rect.height;
      let x = (clientOffset.x - rect.left) * mmPerPixelX;
      let y = (clientOffset.y - rect.top) * mmPerPixelY;

      const SNAP_THRESHOLD = 20;
      let snappedX = x;
      let snappedY = y;

      // Snap to other cabinets or walls
      droppedItems.forEach((cabinet) => {
        if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
          snappedX = cabinet.x;
        }
        if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
          snappedX = cabinet.x + cabinet.width;
        }
        if (Math.abs(y - cabinet.y) < SNAP_THRESHOLD) {
          snappedY = cabinet.y;
        }
        if (Math.abs(y - (cabinet.y + cabinet.height)) < SNAP_THRESHOLD) {
          snappedY = cabinet.y + cabinet.height;
        }
      });

      // Snap to walls
      if (x < SNAP_THRESHOLD) snappedX = 0;
      if (x > roomSize.width - SNAP_THRESHOLD) {
        snappedX = roomSize.width - (item.width || 300);
      }
      if (y < SNAP_THRESHOLD) snappedY = 0;
      if (y > roomSize.depth - SNAP_THRESHOLD) {
        snappedY = roomSize.depth - (item.height || 600);
      }

      const itemWidth = item.minWidth || item.width || 300;
      const itemHeight = item.minDepth || item.height || 600;

      // Prevent overlapping with other cabinets
      let finalX = snappedX;
      let finalY = snappedY;
      for (const cabinet of droppedItems) {
        if (
          finalX < cabinet.x + cabinet.width &&
          finalX + itemWidth > cabinet.x &&
          finalY < cabinet.y + cabinet.height &&
          finalY + itemHeight > cabinet.y
        ) {
          // Collision detected, move to the right of the existing cabinet
          finalX = cabinet.x + cabinet.width;
          finalY = cabinet.y;
        }
      }

      // Ensure we stay within bounds
      finalX = Math.max(0, Math.min(finalX, roomSize.width - itemWidth));
      finalY = Math.max(0, Math.min(finalY, roomSize.depth - itemHeight));

      const newItem = {
        ...item,
        x: Math.round(finalX),
        y: Math.round(finalY),
        rotation: 0,
        width: itemWidth,
        height: itemHeight,
        id: Date.now(),
         frontImageSrc: item.frontImageSrc, // Explicitly include this
  imageSrc: item.imageSrc   
      };

      if (!isOverlapping(newItem, droppedItems)) {
        onDrop(newItem);
        setSelectedItemIndex(droppedItems.length); // Select the newly added item
      } else {
        console.warn("Drop ignored due to overlap");
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const handleDrag = (index, data) => {
    const mmPerPixelX = roomSize.width / roomSizePixels.width;
    const mmPerPixelY = roomSize.depth / roomSizePixels.height;

    let x = data.x * mmPerPixelX;
    let y = data.y * mmPerPixelY;

    const item = droppedItems[index];
    x = Math.max(0, Math.min(x, roomSize.width - item.width));
    y = Math.max(0, Math.min(y, roomSize.depth - item.height));

    const updated = [...droppedItems];
    updated[index] = { ...item, x: Math.round(x), y: Math.round(y) };
    setDroppedItems(updated);
    setSelectedItemIndex(index);
    calculateMeasurements(updated, index);
  };

  const handlePositionChange = (index, position) => {
    const mmPerPixelX = roomSize.width / roomSizePixels.width;
    const mmPerPixelY = roomSize.depth / roomSizePixels.height;

    let x = position.x * mmPerPixelX;
    let y = position.y * mmPerPixelY;

    const item = droppedItems[index];
    x = Math.max(0, Math.min(x, roomSize.width - item.width));
    y = Math.max(0, Math.min(y, roomSize.depth - item.height));

    const updated = [...droppedItems];
    updated[index] = { ...item, x: Math.round(x), y: Math.round(y) };
    setDroppedItems(updated);
    setSelectedItemIndex(index);
    calculateMeasurements(updated, index);
  };

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

const handleCabinetClick = (item, index) => {
  if (currentStep === "Add Notes") {
    const savedNote = notesMap[item.name]?.slice(-1)[0] || ""; // get last saved note
    setSelectedItem({ ...item, note: savedNote }); // inject note into item
    setModalOpen(true);
  } else {
    setSelectedItemIndex(index);
  }
};


  // Function to ensure measurements stay within bounds
  const constrainPosition = (position, total) => {
    return Math.min(Math.max(position, 2), total - 2);
  };

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "100%",
        padding: "10px 10px 10px 50px", // Added left padding for vertical measurements
      }}
    >
      <AddNotesModal
        isOpen={isModalOpen && currentStep === "Add Notes"}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNotes}
        item={selectedItem}
      />

      {/* Horizontal measurements at the top */}
      <div
            
        style={{
          height: "40px",
          position: "relative",
          marginBottom: "10px",
          borderBottom: "1px solid #ddd",
          marginLeft: "40px", // Align with the drop zone
        }}
      >
        {horizontalMeasurements.map((m, i) => (
          <Fragment key={`h-${i}`}>
            <div
              style={{
                position: "absolute",
                left: `${(m.from / roomSize.width) * 100}%`,
                width: `${((m.to - m.from) / roomSize.width) * 100}%`,
                height: "20px",
                top: "10px",
                borderTop: "1px solid #666",
                borderLeft: m.type.includes("wall") ? "1px solid #666" : "none",
                borderRight: m.type.includes("wall")
                  ? "1px solid #666"
                  : "none",
                borderColor: "#007bff",
                borderWidth: "2px",
              }}
            />
            {typeof m.value === "number" && (
              <div
                className="measurement-label"
                style={{
                  position: "absolute",
                  left: `${constrainPosition(
                    (m.position / roomSize.width) * 100,
                    100
                  )}%`,
                  top: "0",
                  transform: "translateX(-50%)",
                  backgroundColor: "#e0f7fa",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  border: "1px solid #00bcd4",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
                {m.value}mm
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Vertical measurements container (outside the drop zone) */}
      <div
            
        style={{
          position: "absolute",
          left: "10px",
          top: "50px",
          bottom: "10px",
          width: "40px",
          borderRight: "1px solid #ddd",
          zIndex: 0,
        }}
      >
        {verticalMeasurements.map((m, i) => (
          <Fragment key={`v-${i}`}>
            <div
              style={{
                position: "absolute",
                top: `${(m.from / roomSize.depth) * 100}%`,
                height: `${((m.to - m.from) / roomSize.depth) * 100}%`,
                width: "20px",
                left: "10px",
                borderLeft: "1px solid #666",
                borderTop: m.type.includes("floor") ? "1px solid #666" : "none",
                borderBottom: m.type.includes("ceiling")
                  ? "1px solid #666"
                  : "none",
                borderColor: "#007bff",
                borderWidth: "2px",
              }}
            />
            {typeof m.value === "number" && (
              <div
                className="measurement-label"
                style={{
                  position: "absolute",
                  top: `${constrainPosition(
                    (m.position / roomSize.depth) * 100,
                    100
                  )}%`,
                  left: "25px",
                  transform: "translateY(-50%) rotate(-90deg)",
                  transformOrigin: "left center",
                  backgroundColor: "#e0f7fa",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  border: "1px solid #00bcd4",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  whiteSpace: "nowrap",
                  fontWeight: "bold",
                }}
              >
                {m.value}mm
              </div>
            )}
          </Fragment>
        ))}
      </div>  

      {/* Drop zone */}
      <div
           
        ref={(node) => {
          drop(node);
          dropRef.current = node;
        }}
        onClick={(e) => {
          if (e.target === dropRef.current) setSelectedItemIndex(null);
        }}
        style={{
          width: "calc(100% - 40px)", // Make room for vertical measurements
          height: "500px",
          border: isOver ? "2px dashed #00bfff" : "2px dashed #adb5bd",
          backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden",
          cursor: "default",
          marginLeft: "40px", // Push to the right to make space for vertical measurements
        }}
      >
      
        {droppedItems.map((item, index) => (
          
          <Fragment key={item.id || index}>
            <Draggable
              position={{
                x: (item.x / roomSize.width) * roomSizePixels.width,
                y: (item.y / roomSize.depth) * roomSizePixels.height,
              }}
              bounds="parent"
              onStart={() => {
                setIsDragging(true);
                setDraggingIndex(index);
              }}
              onDrag={(e, data) => handleDrag(index, data)}
              onStop={(e, data) => {
                setIsDragging(false);
                setDraggingIndex(null);
                handlePositionChange(index, data);
              }}
            >
           <div
  className="cabinet-item"
  style={{
    position: "absolute",
    cursor: "move",
    borderRadius: "3px",
    padding: "0",
    border: "2px solid #007bff",
    boxShadow:
      selectedItemIndex === index
        ? "0 0 0 2px rgba(0, 123, 255, 0.3)"
        : "0 2px 4px rgba(0,0,0,0.1)",
    transform: `rotate(${item.rotation}deg)`,
    zIndex: selectedItemIndex === index ? 10 : 1,
    backgroundColor: "rgba(0, 123, 255, 0.07)",
    width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
    height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
  }}
  onClick={(e) => {
    e.stopPropagation();
    handleCabinetClick(item, index);
  }}
>
  <div style={{ width: "100%", height: "100%", backgroundColor: "#e6f7ff" }}>
    <img
      src={item.frontImageSrc}
      alt={item.name}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
        transform: `rotate(${item.rotation}deg)`,
        transformOrigin: "center center",
        transition: "transform 0.3s ease",
      }}
    />
  </div>

  {selectedItemIndex === index && currentStep !== "Add Notes" && (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        style={{
          position: "absolute",
          top: "5px",
          right: "5px",
          background: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          zIndex: 20,
        }}
        title="Remove cabinet"
      >
        ×
      </button>

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
          width: "20px",
          height: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          zIndex: 20,
        }}
        title="Rotate 90°"
      >
        ↻
      </button>
    </>
  )}
</div>

            </Draggable>
          </Fragment>
        ))}

        {/* Floating preview while dragging */}
        {isDragLayerDragging && draggingItem && dragLayerOffset && (
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
              backgroundImage: `url(${draggingItem.frontImageSrc || draggingItem.imageSrc
                })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
      </div>
    </div>
  );
};
});

// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();
