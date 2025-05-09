import React, { useState, useEffect, useRef, Fragment } from "react";
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
export const DraggableCabinet = ({
  name,
  imageSrc,
  id,
  cabinateFrontImage,
  minWidth, // Add these props
  maxWidth,
  minDepth,
  maxDepth,
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CABINET",
    item: {
      id,
      name,
      imageSrc,
      minWidth, // Include in drag item
      maxWidth,
      minDepth,
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

//pushing this code, but problem is 2000mm tolerence
// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize = { width: 3000, depth: 2000 },
// }) => {
//   const dropRef = useRef(null);
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());
//   const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
//   const [verticalMeasurements, setVerticalMeasurements] = useState([]);
//   const [totalWidth, setTotalWidth] = useState(0);
//   const [totalDepth, setTotalDepth] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggingIndex, setDraggingIndex] = useState(null);

//   const {
//     item: draggingItem,
//     isDragging: isDragLayerDragging,
//     clientOffset: dragLayerOffset,
//   } = useDragLayer((monitor) => ({
//     item: monitor.getItem(),
//     isDragging: monitor.isDragging(),
//     clientOffset: monitor.getClientOffset(),
//   }));

//   // Load and save notes to localStorage
//   useEffect(() => {
//     saveNotesToLocalStorage(notesMap);
//   }, [notesMap]);

//   // Handle click outside cabinets
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         !event.target.closest(".cabinet-item") &&
//         !event.target.closest(".measurement-label")
//       ) {
//         setSelectedItemIndex(null);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   const isOverlapping = (newItem, existingItems) => {
//     return existingItems.some((item) => {
//       const buffer = 5; // Optional buffer for spacing
//       return (
//         newItem.x < item.x + item.width + buffer &&
//         newItem.x + newItem.width > item.x - buffer &&
//         newItem.y < item.y + item.height + buffer &&
//         newItem.y + newItem.height > item.y - buffer
//       );
//     });
//   };

//   const calculateMeasurements = (items) => {
//     if (dropRef.current && items.length > 0) {
//       const dropZoneWidth = dropRef.current.offsetWidth;
//       const dropZoneHeight = dropRef.current.offsetHeight;
//       const mmPerPixelWidth = roomSize.width / dropZoneWidth;
//       const mmPerPixelHeight = roomSize.depth / dropZoneHeight;

//       // Calculate measurements only for the selected cabinet if one is selected
//       if (selectedItemIndex !== null && selectedItemIndex < items.length) {
//         const selectedItem = items[selectedItemIndex];
//         const newHorizontalMeasurements = [];
//         const newVerticalMeasurements = [];

//         // Horizontal measurements for selected cabinet
//         // Left wall to cabinet
//         const leftWallMeasurement = Math.round(
//           selectedItem.x * mmPerPixelWidth
//         );
//         if (leftWallMeasurement > 0) {
//           newHorizontalMeasurements.push({
//             type: "wall-to-cabinet",
//             value: leftWallMeasurement,
//             position: selectedItem.x / 2,
//             from: 0,
//             to: selectedItem.x,
//             itemIndex: selectedItemIndex,
//           });
//         }

//         // Cabinet width
//         // Corrected Cabinet width measurement
//         const cabinetStartX = selectedItem.x;
//         const cabinetWidthMM = Math.round(selectedItem.width * mmPerPixelWidth);
//         const cabinetEndX =
//           selectedItem.x + selectedItem.width / mmPerPixelWidth;

//         newHorizontalMeasurements.push({
//           type: "cabinet-width",
//           value: cabinetWidthMM,
//           position: cabinetStartX + selectedItem.width / mmPerPixelWidth / 2,
//           from: cabinetStartX,
//           to: cabinetEndX,
//           itemIndex: selectedItemIndex,
//         });

//         // Corrected Right wall gap
//         const rightWallGapMM =
//           roomSize.width -
//           Math.round(cabinetStartX * mmPerPixelWidth + cabinetWidthMM);
//         if (rightWallGapMM > 0) {
//           newHorizontalMeasurements.push({
//             type: "cabinet-to-wall",
//             value: rightWallGapMM,
//             position: cabinetEndX + (dropZoneWidth - cabinetEndX) / 2,
//             from: cabinetEndX,
//             to: dropZoneWidth,
//             itemIndex: selectedItemIndex,
//           });
//         }

//         setHorizontalMeasurements(newHorizontalMeasurements);
//         setTotalWidth(leftWallMeasurement + cabinetWidthMM + rightWallGapMM);


//         // Vertical measurements for selected cabinet
//         // Floor to cabinet
//         const floorToCabinet = Math.round(selectedItem.y * mmPerPixelHeight);
//         if (floorToCabinet > 0) {
//           newVerticalMeasurements.push({
//             type: "floor-to-cabinet",
//             value: floorToCabinet,
//             position: selectedItem.y / 2,
//             from: 0,
//             to: selectedItem.y,
//             itemIndex: selectedItemIndex,
//             vertical: true,
//           });
//         }

//         // Cabinet height
//         newVerticalMeasurements.push({
//           type: "cabinet-height",
//           value: selectedItem.height,
//           position: selectedItem.y + selectedItem.height / mmPerPixelHeight / 2,
//           from: selectedItem.y,
//           to: selectedItem.y + selectedItem.height / mmPerPixelHeight,
//           itemIndex: selectedItemIndex,
//           vertical: true,
//         });

//         // Ceiling space
//         const ceilingSpace =
//           roomSize.depth -
//           Math.round(selectedItem.y * mmPerPixelHeight + selectedItem.height);
//         if (ceilingSpace > 0) {
//           newVerticalMeasurements.push({
//             type: "cabinet-to-ceiling",
//             value: ceilingSpace,
//             position:
//               selectedItem.y +
//               selectedItem.height / mmPerPixelHeight +
//               (dropZoneHeight -
//                 (selectedItem.y + selectedItem.height / mmPerPixelHeight)) /
//                 2,
//             from: selectedItem.y + selectedItem.height / mmPerPixelHeight,
//             to: dropZoneHeight,
//             itemIndex: selectedItemIndex,
//             vertical: true,
//           });
//         }

//         setVerticalMeasurements(newVerticalMeasurements);
//         setTotalDepth(floorToCabinet + selectedItem.height + ceilingSpace);
//       } else {
//         // No cabinet selected, show no measurements
//         setHorizontalMeasurements([]);
//         setVerticalMeasurements([]);
//         setTotalWidth(0);
//         setTotalDepth(0);
//       }
//     } else {
//       setHorizontalMeasurements([]);
//       setVerticalMeasurements([]);
//       setTotalWidth(0);
//       setTotalDepth(0);
//     }
//   };

//   useEffect(() => {
//     calculateMeasurements(droppedItems);
//   }, [droppedItems, roomSize.width, roomSize.depth, selectedItemIndex]);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: "CABINET",
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset();
//       const dropZoneNode = dropRef.current;
//       if (clientOffset && dropZoneNode) {
//         const dropZoneRect = dropZoneNode.getBoundingClientRect();
//         const x = clientOffset.x - dropZoneRect.left;
//         const y = clientOffset.y - dropZoneRect.top;

//         const SNAP_THRESHOLD = 20;
//         let snappedX = x;
//         let snappedY = y;

//         // Snap to other cabinets or walls
//         droppedItems.forEach((cabinet) => {
//           if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x;
//           }
//           if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x + cabinet.width;
//           }
//           if (Math.abs(y - cabinet.y) < SNAP_THRESHOLD) {
//             snappedY = cabinet.y;
//           }
//           if (Math.abs(y - (cabinet.y + cabinet.height)) < SNAP_THRESHOLD) {
//             snappedY = cabinet.y + cabinet.height;
//           }
//         });

//         // Snap to walls
//         if (x < SNAP_THRESHOLD) snappedX = 0;
//         if (x > dropZoneRect.width - SNAP_THRESHOLD) {
//           snappedX = dropZoneRect.width - (item.width || 300);
//         }
//         if (y < SNAP_THRESHOLD) snappedY = 0;
//         if (y > dropZoneRect.height - SNAP_THRESHOLD) {
//           snappedY = dropZoneRect.height - (item.height || 600);
//         }

//         const itemWidth = item.minWidth || item.width || 300;
//         const itemHeight = item.minDepth || item.height || 600;

//         // Prevent overlapping with other cabinets
//         let finalX = snappedX;
//         let finalY = snappedY;
//         for (const cabinet of droppedItems) {
//           if (
//             finalX < cabinet.x + cabinet.width &&
//             finalX + itemWidth > cabinet.x &&
//             finalY < cabinet.y + cabinet.height &&
//             finalY + itemHeight > cabinet.y
//           ) {
//             // Collision detected, move to the right of the existing cabinet
//             finalX = cabinet.x + cabinet.width;
//             finalY = cabinet.y;
//           }
//         }

//         // Ensure we stay within bounds
//         finalX = Math.max(0, Math.min(finalX, dropZoneRect.width - itemWidth));
//         finalY = Math.max(
//           0,
//           Math.min(finalY, dropZoneRect.height - itemHeight)
//         );

//         const newItem = {
//           ...item,
//           x: finalX,
//           y: finalY,
//           rotation: 0,
//           width: itemWidth,
//           height: itemHeight,
//           id: Date.now(),
//         };

//         if (!isOverlapping(newItem, droppedItems)) {
//           onDrop(newItem);
//         } else {
//           console.warn("Drop ignored due to overlap");
//         }
//       }
//     },
//     collect: (monitor) => ({ isOver: !!monitor.isOver() }),
//   }));

//   const handlePositionChange = (index, position) => {
//     const item = droppedItems[index];
//     const itemWidth = item.width;
//     const itemHeight = item.height;
//     const dropZoneNode = dropRef.current;
//     if (!dropZoneNode) return;

//     let newX = position.x;
//     let newY = position.y;
//     const SNAP_THRESHOLD = 15;

//     // Check for collisions with other cabinets
//     for (let i = 0; i < droppedItems.length; i++) {
//       if (i === index) continue;

//       const otherItem = droppedItems[i];
//       const otherItemWidth = otherItem.width;
//       const otherItemHeight = otherItem.height;

//       // Collision check
//       if (
//         newX < otherItem.x + otherItemWidth &&
//         newX + itemWidth > otherItem.x &&
//         newY < otherItem.y + otherItemHeight &&
//         newY + itemHeight > otherItem.y
//       ) {
//         // Collision detected, adjust position
//         if (newX < otherItem.x) {
//           newX = otherItem.x - itemWidth - SNAP_THRESHOLD / 2;
//         } else {
//           newX = otherItem.x + otherItemWidth + SNAP_THRESHOLD / 2;
//         }
//         if (newY < otherItem.y) {
//           newY = otherItem.y - itemHeight - SNAP_THRESHOLD / 2;
//         } else {
//           newY = otherItem.y + otherItemHeight + SNAP_THRESHOLD / 2;
//         }
//         break;
//       }
//     }

//     // Keep within dropzone boundaries
//     if (newX < SNAP_THRESHOLD) newX = 0;
//     if (newX > dropZoneNode.offsetWidth - itemWidth - SNAP_THRESHOLD) {
//       newX = dropZoneNode.offsetWidth - itemWidth;
//     }
//     if (newY < SNAP_THRESHOLD) newY = 0;
//     if (newY > dropZoneNode.offsetHeight - itemHeight - SNAP_THRESHOLD) {
//       newY = dropZoneNode.offsetHeight - itemHeight;
//     }

//     setDroppedItems((prev) => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: newX,
//         y: newY,
//       };
//       return updated;
//     });
//   };

//   const handleDrag = (index, data) => {
//     const tempItems = [...droppedItems];
//     tempItems[index] = { ...tempItems[index], x: data.x, y: data.y };
//     // Don't recalculate measurements during drag to improve performance
//     calculateMeasurements(tempItems);
//   };

//   const handleSaveNotes = (item, note) => {
//     setNotesMap((prev) => {
//       const updated = {
//         ...prev,
//         [item.name]: [...(prev[item.name] || []), note],
//       };
//       saveNotesToLocalStorage(updated);
//       window.dispatchEvent(new Event("storage"));
//       return updated;
//     });
//     setModalOpen(false);
//   };

//   const handleCabinetClick = (item, index) => {
//     if (currentStep === "Add Notes") {
//       setSelectedItem(item);
//       setModalOpen(true);
//     } else {
//       setSelectedItemIndex(index);
//     }
//   };

//   return (
//     <div style={{ position: "relative", width: "100%", padding: "10px" }}>
//       <AddNotesModal
//         isOpen={isModalOpen && currentStep === "Add Notes"}
//         onClose={() => setModalOpen(false)}
//         onSave={handleSaveNotes}
//         item={selectedItem}
//       />

//       {/* Horizontal measurements at the top */}
//       <div
//         style={{
//           height: "40px",
//           position: "relative",
//           marginBottom: "10px",
//           borderBottom: "1px solid #ddd",
//         }}
//       >
//         {horizontalMeasurements.map((m, i) => (
//           <Fragment key={`h-${i}`}>
//             <div
//               style={{
//                 position: "absolute",
//                 left: `${m.from}px`,
//                 width: `${m.to - m.from}px`,
//                 height: "20px",
//                 top: "10px",
//                 borderTop: "1px solid #666",
//                 borderLeft: m.type.includes("wall") ? "1px solid #666" : "none",
//                 borderRight: m.type.includes("wall")
//                   ? "1px solid #666"
//                   : "none",
//                 borderColor: "#007bff",
//                 borderWidth: "2px",
//               }}
//             />
//             <div
//               className="measurement-label"
//               style={{
//                 position: "absolute",
//                 left: `${m.position}px`,
//                 top: "0",
//                 transform: "translateX(-50%)",
//                 backgroundColor: "#e0f7fa",
//                 padding: "2px 6px",
//                 borderRadius: "4px",
//                 fontSize: "12px",
//                 border: "1px solid #00bcd4",
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                 whiteSpace: "nowrap",
//                 fontWeight: "bold",
//               }}
//             >
//               {m.value}mm
//             </div>
//           </Fragment>
//         ))}
//       </div>

//       <div
//         ref={(node) => {
//           drop(node);
//           dropRef.current = node;
//         }}
//         style={{
//           width: "100%",
//           height: "500px",
//           border: isOver ? "2px dashed #00bfff" : "2px dashed #adb5bd",
//           backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
//           position: "relative",
//           borderRadius: "4px",
//           overflow: "hidden",
//           cursor: "default",
//         }}
//       >
//         {/* Vertical measurements on the left side */}
//         <div
//           style={{
//             position: "absolute",
//             left: "0",
//             top: "0",
//             bottom: "0",
//             width: "40px",
//             borderRight: "1px solid #ddd",
//             zIndex: 0,
//           }}
//         >
//           {verticalMeasurements.map((m, i) => (
//             <Fragment key={`v-${i}`}>
//               <div
//                 style={{
//                   position: "absolute",
//                   top: `${m.from}px`,
//                   height: `${m.to - m.from}px`,
//                   width: "20px",
//                   left: "10px",
//                   borderLeft: "1px solid #666",
//                   borderTop: m.type.includes("floor")
//                     ? "1px solid #666"
//                     : "none",
//                   borderBottom: m.type.includes("ceiling")
//                     ? "1px solid #666"
//                     : "none",
//                   borderColor: "#007bff",
//                   borderWidth: "2px",
//                 }}
//               />
//               <div
//                 className="measurement-label"
//                 style={{
//                   position: "absolute",
//                   top: `${m.position}px`,
//                   left: "25px",
//                   transform: "translateY(-50%) rotate(-90deg)",
//                   transformOrigin: "left center",
//                   backgroundColor: "#e0f7fa",
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   fontSize: "12px",
//                   border: "1px solid #00bcd4",
//                   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                   whiteSpace: "nowrap",
//                   fontWeight: "bold",
//                 }}
//               >
//                 {m.value}mm
//               </div>
//             </Fragment>
//           ))}
//         </div>

//         {/* Rest of the drop zone content */}
//         {droppedItems.map((item, index) => (
//           <Fragment key={item.id || index}>
//             <Draggable
//               position={{ x: item.x || 0, y: item.y || 0 }}
//               bounds="parent"
//               onStart={() => {
//                 setIsDragging(true);
//                 setDraggingIndex(index);
//               }}
//               onDrag={(e, data) => handleDrag(index, data)}
//               onStop={(e, data) => {
//                 setIsDragging(false);
//                 setDraggingIndex(null);
//                 handlePositionChange(index, data);
//               }}
//             >
//               <div
//                 className="cabinet-item"
//                 style={{
//                   position: "absolute",
//                   cursor: "move",
//                   borderRadius: "3px",
//                   padding: "2px",
//                   boxShadow:
//                     selectedItemIndex === index
//                       ? "0 0 0 2px #007bff, 0 2px 4px rgba(0,0,0,0.1)"
//                       : "0 2px 4px rgba(0,0,0,0.1)",
//                   transform: `rotate(${item.rotation}deg)`,
//                   zIndex: selectedItemIndex === index ? 10 : 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   backgroundColor:
//                     selectedItemIndex === index
//                       ? "rgba(0, 123, 255, 0.1)"
//                       : "transparent",
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCabinetClick(item, index);
//                 }}
//               >
//                 {/* Cabinet image and controls */}
//                 <img
//                   src={item.imageSrc || item.frontImageSrc}
//                   alt={item.name}
//                   style={{
//                     width: `${item.width}px`,
//                     height: `${item.height}px`,
//                     objectFit: "contain",
//                     display: "block",
//                     transform: `rotate(${item.rotation}deg)`, // <== IMAGE pe rotate
//                     transformOrigin: "center center", // Rotate around center
//                     transition: "transform 0.3s ease", // Smooth rotation
//                   }}
//                 />

//                 {selectedItemIndex === index && currentStep !== "Add Notes" && (
//                   <>
//                     {/* Remove button at top right */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRemove(index);
//                       }}
//                       style={{
//                         position: "absolute",
//                         top: "5px",
//                         right: "5px",
//                         background: "#dc3545",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "20px",
//                         height: "20px",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: "12px",
//                         zIndex: 20,
//                       }}
//                       title="Remove cabinet"
//                     >
//                       ×
//                     </button>

//                     {/* Rotate button at bottom left */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRotate(index);
//                       }}
//                       style={{
//                         position: "absolute",
//                         bottom: "5px",
//                         left: "5px",
//                         background: "#28a745",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "20px",
//                         height: "20px",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: "12px",
//                         zIndex: 20,
//                       }}
//                       title="Rotate 90°"
//                     >
//                       ↻
//                     </button>
//                   </>
//                 )}
//               </div>
//             </Draggable>
//           </Fragment>
//         ))}

//         {/* Floating preview while dragging */}
//         {isDragLayerDragging && draggingItem && dragLayerOffset && (
//           <div
//             style={{
//               position: "absolute",
//               pointerEvents: "none",
//               left: `${dragLayerOffset.x - 50}px`,
//               top: `${dragLayerOffset.y - 50}px`,
//               zIndex: 9999,
//               width: draggingItem.width || 100,
//               height: draggingItem.height || 100,
//               transform: `rotate(${draggingItem.rotation || 0}deg)`,
//               opacity: 0.5,
//               border: "1px dashed #007bff",
//               backgroundImage: `url(${
//                 draggingItem.frontImageSrc || draggingItem.imageSrc
//               })`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// ---------------------------------------------------------------------------------

// everything is perfect calculation, but only cabinate size is small

// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize = { width: 3000, depth: 2000 }, // Room size in mm
// }) => {
//   const dropRef = useRef(null);
//   const [roomSizePixels, setRoomSizePixels] = useState({ width: 1, height: 1 });
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
//   const [verticalMeasurements, setVerticalMeasurements] = useState([]);

//   useEffect(() => {
//     if (dropRef.current) {
//       setRoomSizePixels({
//         width: dropRef.current.offsetWidth,
//         height: dropRef.current.offsetHeight,
//       });
//     }
//   }, [dropRef]);

//   const calculateMeasurements = (items, index) => {
//     if (!dropRef.current || items.length === 0) {
//       setHorizontalMeasurements([]);
//       setVerticalMeasurements([]);
//       return;
//     }

//     const selectedItem = items[index];
//     if (!selectedItem) return;

//     const tolerance = 20; // mm snap
//     let { x, y, width, height } = selectedItem;

//     // Snap corrections
//     if (Math.abs(x) <= tolerance) x = 0;
//     if (Math.abs((x + width) - roomSize.width) <= tolerance) x = roomSize.width - width;
//     if (Math.abs(y) <= tolerance) y = 0;
//     if (Math.abs((y + height) - roomSize.depth) <= tolerance) y = roomSize.depth - height;

//     const newHorizontalMeasurements = [
//       {
//         type: 'wall-to-cabinet',
//         value: Math.round(x),
//         position: x / 2,
//         from: 0,
//         to: x,
//         itemIndex: index,
//       },
//       {
//         type: 'cabinet-width',
//         value: Math.round(width),
//         position: x + width / 2,
//         from: x,
//         to: x + width,
//         itemIndex: index,
//       },
//       {
//         type: 'cabinet-to-wall',
//         value: Math.round(Math.max(0, roomSize.width - (x + width))),
//         position: (x + width) + ((Math.max(0, roomSize.width - (x + width))) / 2),
//         from: x + width,
//         to: roomSize.width,
//         itemIndex: index,
//       },
//     ];

//     const newVerticalMeasurements = [
//       {
//         type: 'floor-to-cabinet',
//         value: Math.round(y),
//         position: y / 2,
//         from: 0,
//         to: y,
//         itemIndex: index,
//         vertical: true,
//       },
//       {
//         type: 'cabinet-height',
//         value: Math.round(height),
//         position: y + height / 2,
//         from: y,
//         to: y + height,
//         itemIndex: index,
//         vertical: true,
//       },
//       {
//         type: 'cabinet-to-ceiling',
//         value: Math.round(Math.max(0, roomSize.depth - (y + height))),
//         position: (y + height) + ((Math.max(0, roomSize.depth - (y + height))) / 2),
//         from: y + height,
//         to: roomSize.depth,
//         itemIndex: index,
//         vertical: true,
//       },
//     ];

//     setHorizontalMeasurements(newHorizontalMeasurements);
//     setVerticalMeasurements(newVerticalMeasurements);

//     const updatedItems = [...items];
//     updatedItems[index] = { ...selectedItem, x: Math.round(x), y: Math.round(y) };
//     setDroppedItems(updatedItems);
//   };

//   useEffect(() => {
//     if (selectedItemIndex !== null) {
//       calculateMeasurements(droppedItems, selectedItemIndex);
//     }
//   }, [droppedItems, roomSize, selectedItemIndex]);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: 'CABINET',
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset();
//       const dropZoneNode = dropRef.current;
//       if (clientOffset && dropZoneNode) {
//         const dropZoneRect = dropZoneNode.getBoundingClientRect();
//         const mmPerPixelX = roomSize.width / dropZoneRect.width;
//         const mmPerPixelY = roomSize.depth / dropZoneRect.height;
//         const x = (clientOffset.x - dropZoneRect.left) * mmPerPixelX;
//         const y = (clientOffset.y - dropZoneRect.top) * mmPerPixelY;

//         onDrop({
//           ...item,
//           x: Math.round(x),
//           y: Math.round(y),
//           rotation: 0,
//           width: item.width || 300,
//           height: item.height || 600,
//         });
//       }
//     },
//     collect: (monitor) => ({
//       isOver: !!monitor.isOver(),
//     }),
//   }));

//   const handleDrag = (index, data) => {
//     if (!dropRef.current) return;

//     const mmPerPixelX = roomSize.width / roomSizePixels.width;
//     const mmPerPixelY = roomSize.depth / roomSizePixels.height;
//     const xInMM = data.x * mmPerPixelX;
//     const yInMM = data.y * mmPerPixelY;

//     const updatedItems = [...droppedItems];
//     updatedItems[index] = { ...updatedItems[index], x: Math.round(xInMM), y: Math.round(yInMM) };

//     setDroppedItems(updatedItems);
//     calculateMeasurements(updatedItems, index);
//   };

//   return (
//     <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
//       <div
//         ref={(node) => {
//           drop(node);
//           dropRef.current = node;
//         }}
//         onClick={(e) => {
//           if (e.target === dropRef.current) setSelectedItemIndex(null);
//         }}
//         style={{
//           width: '100%',
//           height: '500px',
//           border: isOver ? '2px dashed #00bfff' : '2px dashed #adb5bd',
//           backgroundColor: isOver ? '#e6f7ff' : '#f9f9f9',
//           position: 'relative',
//           borderRadius: '4px',
//           cursor: 'default',
//           overflow: 'hidden',
//         }}
//       >

//         {/* Horizontal Measurements */}
//         {horizontalMeasurements.map((m, i) => (
//           <Fragment key={`h-${i}`}>
//             <div
//               style={{
//                 position: 'absolute',
//                 left: `${Math.max(0, (m.from / roomSize.width) * 100)}%`,
//                 width: `${Math.max(0, ((m.to - m.from) / roomSize.width) * 100)}%`,
//                 height: '2px',
//                 top: '10px',
//                 backgroundColor: '#007bff',
//               }}
//             />
//             <div
//               style={{
//                 position: 'absolute',
//                 left: `${Math.max(0, (m.position / roomSize.width) * 100)}%`,
//                 top: '0',
//                 transform: 'translateX(-50%)',
//                 backgroundColor: '#e0f7fa',
//                 padding: '2px 6px',
//                 borderRadius: '4px',
//                 fontSize: '12px',
//                 border: '1px solid #00bcd4',
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               {m.value} mm
//             </div>
//           </Fragment>
//         ))}

//         {/* Vertical Measurements */}
//         {verticalMeasurements.map((m, i) => (
//           <Fragment key={`v-${i}`}>
//             <div
//               style={{
//                 position: 'absolute',
//                 top: `${Math.max(0, (m.from / roomSize.depth) * 100)}%`,
//                 height: `${Math.max(0, ((m.to - m.from) / roomSize.depth) * 100)}%`,
//                 width: '2px',
//                 left: '10px',
//                 backgroundColor: '#007bff',
//               }}
//             />
//             <div
//               style={{
//                 position: 'absolute',
//                 top: `${Math.max(0, (m.position / roomSize.depth) * 100)}%`,
//                 left: '20px',
//                 transform: 'translateY(-50%) rotate(-90deg)',
//                 backgroundColor: '#e0f7fa',
//                 padding: '2px 6px',
//                 borderRadius: '4px',
//                 fontSize: '12px',
//                 border: '1px solid #00bcd4',
//                 whiteSpace: 'nowrap',
//               }}
//             >
//               {m.value} mm
//             </div>
//           </Fragment>
//         ))}

//         {/* Draggable Cabinets */}
//         {droppedItems.map((item, index) => (
//           <Draggable
//             key={index}
//             position={{
//               x: (item.x / roomSize.width) * roomSizePixels.width,
//               y: (item.y / roomSize.depth) * roomSizePixels.height,
//             }}
//             onDrag={(e, data) => handleDrag(index, data)}
//             // No bounds => freely moveable
//             bounds="parent"
//           >
//             <div
//               style={{
//                 width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
//                 height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
//                 position: 'absolute',
//                 transform: `rotate(${item.rotation}deg)`,
//                 backgroundColor: selectedItemIndex === index ? '#cce5ff' : '#fff',
//                 border: '1px solid #007bff',
//                 cursor: 'move',
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedItemIndex(index);
//               }}
//             >
//               <img
//                 src={item.imageSrc}
//                 alt={item.name}
//                 style={{ width: '100%', height: '100%', objectFit: 'contain' }}
//               />
//             </div>
//           </Draggable>
//         ))}
//       </div>
//     </div>
//   );
// };


//deeps
// ------------------------------------
// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize = { width: 3000, depth: 2000 },
// }) => {
//   const dropRef = useRef(null);
//   const [roomSizePixels, setRoomSizePixels] = useState({ width: 1, height: 1 });
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
//   const [verticalMeasurements, setVerticalMeasurements] = useState([]);

//   useEffect(() => {
//     if (dropRef.current) {
//       setRoomSizePixels({
//         width: dropRef.current.offsetWidth,
//         height: dropRef.current.offsetHeight,
//       });
//     }
//   }, [dropRef]);

//   const calculateMeasurements = (items, index) => {
//     if (!dropRef.current || items.length === 0 || index == null) return;
  
//     const item = items[index];
//     let { x, y, width, height } = item;
  
//     const roomWidth = roomSize.width;
//     const roomHeight = roomSize.depth;
  
//     // Constrain x/y to room bounds
//     const cappedX = Math.max(0, Math.min(x, roomWidth - width));
//     const cappedY = Math.max(0, Math.min(y, roomHeight - height));
//     const cappedRight = cappedX + Math.min(width, roomWidth - cappedX);
//     const cappedBottom = cappedY + Math.min(height, roomHeight - cappedY);
  
//     const leftGap = Math.round(cappedX);
//     const cabinetWidth = Math.round(cappedRight - cappedX);  // 👈 This is crucial
//     const rightGap = Math.round(roomWidth - cappedRight);
  
//     const topGap = Math.round(cappedY);
//     const cabinetHeight = Math.round(cappedBottom - cappedY);
//     const bottomGap = Math.round(roomHeight - cappedBottom);
  
//     console.log({ leftGap, cabinetWidth, rightGap }); // Debug
  
//     setHorizontalMeasurements([
//       {
//         type: 'left-gap',
//         value: leftGap,
//         position: cappedX / 2,
//         from: 0,
//         to: cappedX,
//       },
//       {
//         type: 'cabinet',
//         value: cabinetWidth,
//         position: cappedX + cabinetWidth / 2,
//         from: cappedX,
//         to: cappedRight,
//       },
//       {
//         type: 'right-gap',
//         value: rightGap,
//         position: cappedRight + rightGap / 2,
//         from: cappedRight,
//         to: roomWidth,
//       },
//     ]);
  
//     setVerticalMeasurements([
//       {
//         type: 'top-gap',
//         value: topGap,
//         position: cappedY / 2,
//         from: 0,
//         to: cappedY,
//         vertical: true,
//       },
//       {
//         type: 'cabinet-height',
//         value: cabinetHeight,
//         position: cappedY + cabinetHeight / 2,
//         from: cappedY,
//         to: cappedBottom,
//         vertical: true,
//       },
//       {
//         type: 'bottom-gap',
//         value: bottomGap,
//         position: cappedBottom + bottomGap / 2,
//         from: cappedBottom,
//         to: roomHeight,
//         vertical: true,
//       },
//     ]);
//   };
  
  


//   useEffect(() => {
//     if (selectedItemIndex !== null) {
//       calculateMeasurements(droppedItems, selectedItemIndex);
//     }
//   }, [droppedItems, roomSize, selectedItemIndex]);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: 'CABINET',
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset();
//       const dropZoneNode = dropRef.current;
//       if (!clientOffset || !dropZoneNode) return;

//       const rect = dropZoneNode.getBoundingClientRect();
//       const mmPerPixelX = roomSize.width / rect.width;
//       const mmPerPixelY = roomSize.depth / rect.height;
//       let x = (clientOffset.x - rect.left) * mmPerPixelX;
//       let y = (clientOffset.y - rect.top) * mmPerPixelY;

//       const width = item.width || 300;
//       const height = item.height || 600;

//       x = Math.max(0, Math.min(x, roomSize.width - width));
//       y = Math.max(0, Math.min(y, roomSize.depth - height));

//       onDrop({ ...item, x: Math.round(x), y: Math.round(y), width, height, rotation: 0 });
//     },
//     collect: (monitor) => ({ isOver: !!monitor.isOver() }),
//   }));

//   const handleDrag = (index, data) => {
//     const mmPerPixelX = roomSize.width / roomSizePixels.width;
//     const mmPerPixelY = roomSize.depth / roomSizePixels.height;
  
//     let x = data.x * mmPerPixelX;
//     let y = data.y * mmPerPixelY;
  
//     const item = droppedItems[index];
//     x = Math.max(0, Math.min(x, roomSize.width - item.width));
//     y = Math.max(0, Math.min(y, roomSize.depth - item.height));
  
//     const updated = [...droppedItems];
//     updated[index] = { ...item, x: Math.round(x), y: Math.round(y) };
//     setDroppedItems(updated);
//     setSelectedItemIndex(index); // 👈 This line fixes the issue
//     calculateMeasurements(updated, index);
//   };
  

//   // Function to ensure measurements stay within bounds
//   const constrainPosition = (position, total) => {
//     return Math.min(Math.max(position, 2), total - 2);
//   };

//   return (
//     <div style={{ overflow: 'auto', width: '100%', height: '100%' }}>
//       <div
//         ref={(node) => {
//           drop(node);
//           dropRef.current = node;
//         }}
//         onClick={(e) => {
//           if (e.target === dropRef.current) setSelectedItemIndex(null);
//         }}
//         style={{
//           width: '100%',
//           height: '500px',
//           border: isOver ? '2px dashed #00bfff' : '2px dashed #adb5bd',
//           backgroundColor: isOver ? '#e6f7ff' : '#f9f9f9',
//           position: 'relative',
//           borderRadius: '4px',
//           cursor: 'default',
//         }}
//       >
//         {horizontalMeasurements.map((m, i) => (
//           <Fragment key={`h-${i}`}>
//             <div
//               style={{
//                 position: 'absolute',
//                 left: `${(m.from / roomSize.width) * 100}%`,
//                 width: `${((m.to - m.from) / roomSize.width) * 100}%`,
//                 height: '2px',
//                 top: '10px',
//                 backgroundColor: '#00bcd4',
//               }}
//             />
//            {typeof m.value === 'number' && (

//               <div
//                 style={{
//                   position: 'absolute',
//                   left: `${constrainPosition((m.position / roomSize.width) * 100, 100)}%`,
//                   top: '0px',
//                   transform: 'translateX(-50%)',
//                   backgroundColor: '#e0f7fa',
//                   padding: '2px 6px',
//                   borderRadius: '4px',
//                   fontSize: '12px',
//                   border: '1px solid #00bcd4',
//                   fontWeight: 500,
//                   maxWidth: '70px',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   whiteSpace: 'nowrap',
//                 }}
//               >
//                 {m.value} mm
//               </div>
//             )}
//           </Fragment>
//         ))}

//         {verticalMeasurements.map((m, i) => (
//           <Fragment key={`v-${i}`}>
//             <div
//               style={{
//                 position: 'absolute',
//                 top: `${(m.from / roomSize.depth) * 100}%`,
//                 height: `${((m.to - m.from) / roomSize.depth) * 100}%`,
//                 width: '2px',
//                 left: '10px',
//                 backgroundColor: '#00bcd4',
//               }}
//             />
//            {typeof m.value === 'number' && (

//               <div
//                 style={{
//                   position: 'absolute',
//                   top: `${constrainPosition((m.position / roomSize.depth) * 100, 100)}%`,
//                   left: '20px',
//                   transform: 'translateY(-50%) rotate(-90deg)',
//                   backgroundColor: '#e0f7fa',
//                   padding: '2px 6px',
//                   borderRadius: '4px',
//                   fontSize: '12px',
//                   border: '1px solid #00bcd4',
//                   fontWeight: 500,
//                   maxWidth: '70px',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   whiteSpace: 'nowrap',
//                 }}
//               >
//                 {m.value} mm
//               </div>
//             )}
//           </Fragment>
//         ))}

//         {droppedItems.map((item, index) => (
//           <Draggable
//             key={index}
//             position={{
//               x: (item.x / roomSize.width) * roomSizePixels.width,
//               y: (item.y / roomSize.depth) * roomSizePixels.height,
//             }}
//             onDrag={(e, data) => handleDrag(index, data)}
//             bounds="parent"
//           >
//             <div
//               style={{
//                 width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
//                 height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
//                 position: 'absolute',
//                 transform: `rotate(${item.rotation}deg)`,
//                 backgroundColor: selectedItemIndex === index ? '#cce5ff' : '#fff',
//                 border: selectedItemIndex === index ? '2px solid #00bcd4' : '1px solid #007bff',
//                 cursor: 'move',
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedItemIndex(index);
//               }}
//             >
//               <img
//                 src={item.imageSrc}
//                 alt={item.name}
//                 style={{ width: '100%', height: '100%', objectFit: 'contain' }}
//               />
//             </div>
//           </Draggable>
//         ))}
//       </div>
//     </div>
//   );
// };

// -------------------------------------------------------------



// shubham
// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize = { width: 3000, depth: 2000 },
// }) => {
//   const dropRef = useRef(null);
//   const [roomSizePixels, setRoomSizePixels] = useState({ width: 1, height: 1 });
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());
//   const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
//   const [verticalMeasurements, setVerticalMeasurements] = useState([]);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggingIndex, setDraggingIndex] = useState(null);

//   const {
//     item: draggingItem,
//     isDragging: isDragLayerDragging,
//     clientOffset: dragLayerOffset,
//   } = useDragLayer((monitor) => ({
//     item: monitor.getItem(),
//     isDragging: monitor.isDragging(),
//     clientOffset: monitor.getClientOffset(),
//   }));

//   // Load and save notes to localStorage
//   useEffect(() => {
//     saveNotesToLocalStorage(notesMap);
//   }, [notesMap]);

//   // Handle click outside cabinets
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         !event.target.closest(".cabinet-item") &&
//         !event.target.closest(".measurement-label")
//       ) {
//         setSelectedItemIndex(null);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // Update room size in pixels when ref changes
//   useEffect(() => {
//     if (dropRef.current) {
//       setRoomSizePixels({
//         width: dropRef.current.offsetWidth,
//         height: dropRef.current.offsetHeight,
//       });
//     }
//   }, [dropRef]);

//   const isOverlapping = (newItem, existingItems) => {
//     return existingItems.some((item) => {
//       const buffer = 5; // Optional buffer for spacing
//       return (
//         newItem.x < item.x + item.width + buffer &&
//         newItem.x + newItem.width > item.x - buffer &&
//         newItem.y < item.y + item.height + buffer &&
//         newItem.y + newItem.height > item.y - buffer
//       );
//     });
//   };

//   const calculateMeasurements = (items, index) => {
//     if (!dropRef.current || items.length === 0 || index == null) {
//       setHorizontalMeasurements([]);
//       setVerticalMeasurements([]);
//       return;
//     };

//     const item = items[index];
//     let { x, y, width, height } = item;

//     const roomWidth = roomSize.width;
//     const roomHeight = roomSize.depth;

//     // Constrain x/y to room bounds
//     const cappedX = Math.max(0, Math.min(x, roomWidth - width));
//     const cappedY = Math.max(0, Math.min(y, roomHeight - height));
//     const cappedRight = cappedX + Math.min(width, roomWidth - cappedX);
//     const cappedBottom = cappedY + Math.min(height, roomHeight - cappedY);

//     const leftGap = Math.round(cappedX);
//     const cabinetWidth = Math.round(cappedRight - cappedX);
//     const rightGap = Math.round(roomWidth - cappedRight);

//     const topGap = Math.round(cappedY);
//     const cabinetHeight = Math.round(cappedBottom - cappedY);
//     const bottomGap = Math.round(roomHeight - cappedBottom);

//     setHorizontalMeasurements([
//       {
//         type: 'left-gap',
//         value: leftGap,
//         position: cappedX / 2,
//         from: 0,
//         to: cappedX,
//       },
//       {
//         type: 'cabinet',
//         value: cabinetWidth,
//         position: cappedX + cabinetWidth / 2,
//         from: cappedX,
//         to: cappedRight,
//       },
//       {
//         type: 'right-gap',
//         value: rightGap,
//         position: cappedRight + rightGap / 2,
//         from: cappedRight,
//         to: roomWidth,
//       },
//     ]);

//     setVerticalMeasurements([
//       {
//         type: 'top-gap',
//         value: topGap,
//         position: cappedY / 2,
//         from: 0,
//         to: cappedY,
//         vertical: true,
//       },
//       {
//         type: 'cabinet-height',
//         value: cabinetHeight,
//         position: cappedY + cabinetHeight / 2,
//         from: cappedY,
//         to: cappedBottom,
//         vertical: true,
//       },
//       {
//         type: 'bottom-gap',
//         value: bottomGap,
//         position: cappedBottom + bottomGap / 2,
//         from: cappedBottom,
//         to: roomHeight,
//         vertical: true,
//       },
//     ]);
//   };

//   useEffect(() => {
//     if (selectedItemIndex !== null) {
//       calculateMeasurements(droppedItems, selectedItemIndex);
//     }
//   }, [droppedItems, roomSize, selectedItemIndex]);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: 'CABINET',
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset();
//       const dropZoneNode = dropRef.current;
//       if (!clientOffset || !dropZoneNode) return;

//       const rect = dropZoneNode.getBoundingClientRect();
//       const mmPerPixelX = roomSize.width / rect.width;
//       const mmPerPixelY = roomSize.depth / rect.height;
//       let x = (clientOffset.x - rect.left) * mmPerPixelX;
//       let y = (clientOffset.y - rect.top) * mmPerPixelY;

//       const SNAP_THRESHOLD = 20;
//       let snappedX = x;
//       let snappedY = y;

//       // Snap to other cabinets or walls
//       droppedItems.forEach((cabinet) => {
//         if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
//           snappedX = cabinet.x;
//         }
//         if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//           snappedX = cabinet.x + cabinet.width;
//         }
//         if (Math.abs(y - cabinet.y) < SNAP_THRESHOLD) {
//           snappedY = cabinet.y;
//         }
//         if (Math.abs(y - (cabinet.y + cabinet.height)) < SNAP_THRESHOLD) {
//           snappedY = cabinet.y + cabinet.height;
//         }
//       });

//       // Snap to walls
//       if (x < SNAP_THRESHOLD) snappedX = 0;
//       if (x > roomSize.width - SNAP_THRESHOLD) {
//         snappedX = roomSize.width - (item.width || 300);
//       }
//       if (y < SNAP_THRESHOLD) snappedY = 0;
//       if (y > roomSize.depth - SNAP_THRESHOLD) {
//         snappedY = roomSize.depth - (item.height || 600);
//       }

//       const itemWidth = item.minWidth || item.width || 300;
//       const itemHeight = item.minDepth || item.height || 600;

//       // Prevent overlapping with other cabinets
//       let finalX = snappedX;
//       let finalY = snappedY;
//       for (const cabinet of droppedItems) {
//         if (
//           finalX < cabinet.x + cabinet.width &&
//           finalX + itemWidth > cabinet.x &&
//           finalY < cabinet.y + cabinet.height &&
//           finalY + itemHeight > cabinet.y
//         ) {
//           // Collision detected, move to the right of the existing cabinet
//           finalX = cabinet.x + cabinet.width;
//           finalY = cabinet.y;
//         }
//       }

//       // Ensure we stay within bounds
//       finalX = Math.max(0, Math.min(finalX, roomSize.width - itemWidth));
//       finalY = Math.max(0, Math.min(finalY, roomSize.depth - itemHeight));

//       const newItem = {
//         ...item,
//         x: Math.round(finalX),
//         y: Math.round(finalY),
//         rotation: 0,
//         width: itemWidth,
//         height: itemHeight,
//         id: Date.now(),
//       };

//       if (!isOverlapping(newItem, droppedItems)) {
//         onDrop(newItem);
//         setSelectedItemIndex(droppedItems.length); // Select the newly added item
//       } else {
//         console.warn("Drop ignored due to overlap");
//       }
//     },
//     collect: (monitor) => ({ isOver: !!monitor.isOver() }),
//   }));

//   const handleDrag = (index, data) => {
//     const mmPerPixelX = roomSize.width / roomSizePixels.width;
//     const mmPerPixelY = roomSize.depth / roomSizePixels.height;
  
//     let x = data.x * mmPerPixelX;
//     let y = data.y * mmPerPixelY;
  
//     const item = droppedItems[index];
//     x = Math.max(0, Math.min(x, roomSize.width - item.width));
//     y = Math.max(0, Math.min(y, roomSize.depth - item.height));
  
//     const updated = [...droppedItems];
//     updated[index] = { ...item, x: Math.round(x), y: Math.round(y) };
//     setDroppedItems(updated);
//     setSelectedItemIndex(index);
//     calculateMeasurements(updated, index);
//   };

//   const handlePositionChange = (index, position) => {
//     const mmPerPixelX = roomSize.width / roomSizePixels.width;
//     const mmPerPixelY = roomSize.depth / roomSizePixels.height;
  
//     let x = position.x * mmPerPixelX;
//     let y = position.y * mmPerPixelY;
  
//     const item = droppedItems[index];
//     x = Math.max(0, Math.min(x, roomSize.width - item.width));
//     y = Math.max(0, Math.min(y, roomSize.depth - item.height));
  
//     const updated = [...droppedItems];
//     updated[index] = { ...item, x: Math.round(x), y: Math.round(y) };
//     setDroppedItems(updated);
//     setSelectedItemIndex(index);
//     calculateMeasurements(updated, index);
//   };

//   const handleSaveNotes = (item, note) => {
//     setNotesMap((prev) => {
//       const updated = {
//         ...prev,
//         [item.name]: [...(prev[item.name] || []), note],
//       };
//       saveNotesToLocalStorage(updated);
//       window.dispatchEvent(new Event("storage"));
//       return updated;
//     });
//     setModalOpen(false);
//   };

//   const handleCabinetClick = (item, index) => {
//     if (currentStep === "Add Notes") {
//       setSelectedItem(item);
//       setModalOpen(true);
//     } else {
//       setSelectedItemIndex(index);
//     }
//   };

//   // Function to ensure measurements stay within bounds
//   const constrainPosition = (position, total) => {
//     return Math.min(Math.max(position, 2), total - 2);
//   };

//   return (
//     <div style={{ position: "relative", width: "100%", padding: "10px" }}>
//       <AddNotesModal
//         isOpen={isModalOpen && currentStep === "Add Notes"}
//         onClose={() => setModalOpen(false)}
//         onSave={handleSaveNotes}
//         item={selectedItem}
//       />

//       {/* Horizontal measurements at the top */}
//       <div
//         style={{
//           height: "40px",
//           position: "relative",
//           marginBottom: "10px",
//           borderBottom: "1px solid #ddd",
//         }}
//       >
//         {horizontalMeasurements.map((m, i) => (
//           <Fragment key={`h-${i}`}>
//             <div
//               style={{
//                 position: "absolute",
//                 left: `${(m.from / roomSize.width) * 100}%`,
//                 width: `${((m.to - m.from) / roomSize.width) * 100}%`,
//                 height: "20px",
//                 top: "10px",
//                 borderTop: "1px solid #666",
//                 borderLeft: m.type.includes("wall") ? "1px solid #666" : "none",
//                 borderRight: m.type.includes("wall")
//                   ? "1px solid #666"
//                   : "none",
//                 borderColor: "#007bff",
//                 borderWidth: "2px",
//               }}
//             />
//             {typeof m.value === 'number' && (
//               <div
//                 className="measurement-label"
//                 style={{
//                   position: "absolute",
//                   left: `${constrainPosition((m.position / roomSize.width) * 100, 100)}%`,
//                   top: "0",
//                   transform: "translateX(-50%)",
//                   backgroundColor: "#e0f7fa",
//                   padding: "2px 6px",
//                   borderRadius: "4px",
//                   fontSize: "12px",
//                   border: "1px solid #00bcd4",
//                   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                   whiteSpace: "nowrap",
//                   fontWeight: "bold",
//                 }}
//               >
//                 {m.value}mm
//               </div>
//             )}
//           </Fragment>
//         ))}
//       </div>

//       <div
//         ref={(node) => {
//           drop(node);
//           dropRef.current = node;
//         }}
//         onClick={(e) => {
//           if (e.target === dropRef.current) setSelectedItemIndex(null);
//         }}
//         style={{
//           width: "100%",
//           height: "500px",
//           border: isOver ? "2px dashed #00bfff" : "2px dashed #adb5bd",
//           backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
//           position: "relative",
//           borderRadius: "4px",
//           overflow: "hidden",
//           cursor: "default",
//         }}
//       >
//         {/* Vertical measurements on the left side */}
//         <div
//           style={{
//             position: "absolute",
//             left: "0",
//             top: "0",
//             bottom: "0",
//             width: "40px",
//             borderRight: "1px solid #ddd",
//             zIndex: 0,
//           }}
//         >
//           {verticalMeasurements.map((m, i) => (
//             <Fragment key={`v-${i}`}>
//               <div
//                 style={{
//                   position: "absolute",
//                   top: `${(m.from / roomSize.depth) * 100}%`,
//                   height: `${((m.to - m.from) / roomSize.depth) * 100}%`,
//                   width: "20px",
//                   left: "10px",
//                   borderLeft: "1px solid #666",
//                   borderTop: m.type.includes("floor")
//                     ? "1px solid #666"
//                     : "none",
//                   borderBottom: m.type.includes("ceiling")
//                     ? "1px solid #666"
//                     : "none",
//                   borderColor: "#007bff",
//                   borderWidth: "2px",
//                 }}
//               />
//               {typeof m.value === 'number' && (
//                 <div
//                   className="measurement-label"
//                   style={{
//                     position: "absolute",
//                     top: `${constrainPosition((m.position / roomSize.depth) * 100, 100)}%`,
//                     left: "25px",
//                     transform: "translateY(-50%) rotate(-90deg)",
//                     transformOrigin: "left center",
//                     backgroundColor: "#e0f7fa",
//                     padding: "2px 6px",
//                     borderRadius: "4px",
//                     fontSize: "12px",
//                     border: "1px solid #00bcd4",
//                     boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                     whiteSpace: "nowrap",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   {m.value}mm
//                 </div>
//               )}
//             </Fragment>
//           ))}
//         </div>

//         {/* Rest of the drop zone content */}
//         {droppedItems.map((item, index) => (
//           <Fragment key={item.id || index}>
//             <Draggable
//               position={{ 
//                 x: (item.x / roomSize.width) * roomSizePixels.width,
//                 y: (item.y / roomSize.depth) * roomSizePixels.height,
//               }}
//               bounds="parent"
//               onStart={() => {
//                 setIsDragging(true);
//                 setDraggingIndex(index);
//               }}
//               onDrag={(e, data) => handleDrag(index, data)}
//               onStop={(e, data) => {
//                 setIsDragging(false);
//                 setDraggingIndex(null);
//                 handlePositionChange(index, data);
//               }}
//             >
//               <div
//                 className="cabinet-item"
//                 style={{
//                   position: "absolute",
//                   cursor: "move",
//                   borderRadius: "3px",
//                   padding: "2px",
//                   boxShadow:
//                     selectedItemIndex === index
//                       ? "0 0 0 2px #007bff, 0 2px 4px rgba(0,0,0,0.1)"
//                       : "0 2px 4px rgba(0,0,0,0.1)",
//                   transform: `rotate(${item.rotation}deg)`,
//                   zIndex: selectedItemIndex === index ? 10 : 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   backgroundColor:
//                     selectedItemIndex === index
//                       ? "rgba(0, 123, 255, 0.1)"
//                       : "transparent",
//                   width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
//                   height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCabinetClick(item, index);
//                 }}
//               >
//                 {/* Cabinet image and controls */}
//                 <img
//                   src={item.imageSrc || item.frontImageSrc}
//                   alt={item.name}
//                   style={{
//                     width: "100%",
//                     height: "100%",
//                     objectFit: "contain",
//                     display: "block",
//                     transform: `rotate(${item.rotation}deg)`,
//                     transformOrigin: "center center",
//                     transition: "transform 0.3s ease",
//                   }}
//                 />

//                 {selectedItemIndex === index && currentStep !== "Add Notes" && (
//                   <>
//                     {/* Remove button at top right */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRemove(index);
//                       }}
//                       style={{
//                         position: "absolute",
//                         top: "5px",
//                         right: "5px",
//                         background: "#dc3545",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "20px",
//                         height: "20px",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: "12px",
//                         zIndex: 20,
//                       }}
//                       title="Remove cabinet"
//                     >
//                       ×
//                     </button>

//                     {/* Rotate button at bottom left */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRotate(index);
//                       }}
//                       style={{
//                         position: "absolute",
//                         bottom: "5px",
//                         left: "5px",
//                         background: "#28a745",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "20px",
//                         height: "20px",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         fontSize: "12px",
//                         zIndex: 20,
//                       }}
//                       title="Rotate 90°"
//                     >
//                       ↻
//                     </button>
//                   </>
//                 )}
//               </div>
//             </Draggable>
//           </Fragment>
//         ))}

//         {/* Floating preview while dragging */}
//         {isDragLayerDragging && draggingItem && dragLayerOffset && (
//           <div
//             style={{
//               position: "absolute",
//               pointerEvents: "none",
//               left: `${dragLayerOffset.x - 50}px`,
//               top: `${dragLayerOffset.y - 50}px`,
//               zIndex: 9999,
//               width: draggingItem.width || 100,
//               height: draggingItem.height || 100,
//               transform: `rotate(${draggingItem.rotation || 0}deg)`,
//               opacity: 0.5,
//               border: "1px dashed #007bff",
//               backgroundImage: `url(${
//                 draggingItem.frontImageSrc || draggingItem.imageSrc
//               })`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//             }}
//           />
//         )}
//       </div>
//     </div>
//   );
// };
export const DropZone = ({
  onDrop,
  droppedItems,
  onRemove,
  onRotate,
  currentStep,
  setDroppedItems,
  roomSize = { width: 3000, depth: 2000 },
}) => {
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
    if (!dropRef.current || items.length === 0 || index == null) {
      setHorizontalMeasurements([]);
      setVerticalMeasurements([]);
      return;
    };
 
    const item = items[index];
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
        type: 'left-gap',
        value: leftGap,
        position: cappedX / 2,
        from: 0,
        to: cappedX,
      },
      {
        type: 'cabinet',
        value: cabinetWidth,
        position: cappedX + cabinetWidth / 2,
        from: cappedX,
        to: cappedRight,
      },
      {
        type: 'right-gap',
        value: rightGap,
        position: cappedRight + rightGap / 2,
        from: cappedRight,
        to: roomWidth,
      },
    ]);
 
    setVerticalMeasurements([
      {
        type: 'top-gap',
        value: topGap,
        position: cappedY / 2,
        from: 0,
        to: cappedY,
        vertical: true,
      },
      {
        type: 'cabinet-height',
        value: cabinetHeight,
        position: cappedY + cabinetHeight / 2,
        from: cappedY,
        to: cappedBottom,
        vertical: true,
      },
      {
        type: 'bottom-gap',
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
    accept: 'CABINET',
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
      setSelectedItem(item);
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
    <div style={{
      position: "relative",
      width: "100%",
      padding: "10px 10px 10px 50px" // Added left padding for vertical measurements
    }}>
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
          marginLeft: "40px" // Align with the drop zone
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
            {typeof m.value === 'number' && (
              <div
                className="measurement-label"
                style={{
                  position: "absolute",
                  left: `${constrainPosition((m.position / roomSize.width) * 100, 100)}%`,
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
                borderTop: m.type.includes("floor")
                  ? "1px solid #666"
                  : "none",
                borderBottom: m.type.includes("ceiling")
                  ? "1px solid #666"
                  : "none",
                borderColor: "#007bff",
                borderWidth: "2px",
              }}
            />
            {typeof m.value === 'number' && (
              <div
                className="measurement-label"
                style={{
                  position: "absolute",
                  top: `${constrainPosition((m.position / roomSize.depth) * 100, 100)}%`,
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
          marginLeft: "40px" // Push to the right to make space for vertical measurements
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
                  padding: "2px",
                  boxShadow:
                    selectedItemIndex === index
                      ? "0 0 0 2px #007bff, 0 2px 4px rgba(0,0,0,0.1)"
                      : "0 2px 4px rgba(0,0,0,0.1)",
                  transform: `rotate(${item.rotation}deg)`,
                  zIndex: selectedItemIndex === index ? 10 : 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor:
                    selectedItemIndex === index
                      ? "rgba(0, 123, 255, 0.1)"
                      : "transparent",
                  width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
                  height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCabinetClick(item, index);
                }}
              >
                <img
                  src={item.imageSrc || item.frontImageSrc}
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
  );
};



// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();
