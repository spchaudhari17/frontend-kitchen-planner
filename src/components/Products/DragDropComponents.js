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
  minWidth,
  maxWidth,
  minDepth,
  maxDepth,
  basePrice,
  hinges,
  handles,
  cabinateType,
  overlap,
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
      maxDepth,
      frontImageSrc: cabinateFrontImage,
      basePrice,
      hinges,
      handles,
      cabinateType,
      overlap
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Determine border color based on overlap type
  const getBorderColor = () => {
    switch (overlap) {
      case 1: return '#ff0000'; // Red for no overlap (tall cabinets)
      case 2: return '#00ff00'; // Green for base cabinets
      case 3: return '#0000ff'; // Blue for wall cabinets
      case 4: return '#ffff00'; // Yellow for panels
      default: return '#ccc';
    }
  };

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        margin: "10px",
        cursor: "grab",
        border: `2px solid ${getBorderColor()}`,
        borderRadius: "4px",
        padding: "4px",
        backgroundColor: "#f8f8f8"
      }}
    >
      <img
        src={imageSrc}
        alt={name}
        style={{
          width: "100px",
          height: "100px",
          objectFit: "cover",
        }}
      />
      <div style={{
        fontSize: "10px",
        textAlign: "center",
        marginTop: "4px",
        fontWeight: "bold",
        color: getBorderColor()
      }}>
        {name}
      </div>
    </div>
  );
};

// latest working 
// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize = { width: 3000, depth: 2000 },
// }) => {
//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const dropRef = useRef(null);
//   const [roomSizePixels, setRoomSizePixels] = useState({ width: 1, height: 1 });
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

//   // --- Helper to get rotated bounding box ---
//   const getRotatedBoundingBox = (item) => {
//     const { x, y, width, height, rotation } = item;
//     const angleRad = (rotation * Math.PI) / 180;

//     const corners = [
//       { dx: 0, dy: 0 },
//       { dx: width, dy: 0 },
//       { dx: 0, dy: height },
//       { dx: width, dy: height },
//     ].map(({ dx, dy }) => {
//       // Rotate around the item's center
//       const centerX = width / 2;
//       const centerY = height / 2;
//       const rotatedX = (dx - centerX) * Math.cos(angleRad) - (dy - centerY) * Math.sin(angleRad) + centerX;
//       const rotatedY = (dx - centerX) * Math.sin(angleRad) + (dy - centerY) * Math.cos(angleRad) + centerY;
//       return { x: rotatedX, y: rotatedY };
//     });

//     const minX = Math.min(...corners.map(c => c.x));
//     const maxX = Math.max(...corners.map(c => c.x));
//     const minY = Math.min(...corners.map(c => c.y));
//     const maxY = Math.max(...corners.map(c => c.y));

//     return {
//       x: x + minX,
//       y: y + minY,
//       width: maxX - minX,
//       height: maxY - minY,
//     };
//   };

//   // --- Updated isOverlapping with rotated bounding box ---
//   const isOverlapping = (newItem, existingItems) => {
//     const newBox = getRotatedBoundingBox(newItem);

//     return existingItems.some((item) => {
//       // Exclude self from overlap check during drag
//       if (newItem.id === item.id) return false;

//       const existingBox = getRotatedBoundingBox(item);
//       const buffer = 1; // Minimal buffer for 'sticking' without overlap

//       return (
//         newBox.x < existingBox.x + existingBox.width - buffer &&
//         newBox.x + newBox.width > existingBox.x + buffer &&
//         newBox.y < existingBox.y + existingBox.height - buffer &&
//         newBox.y + newBox.height > existingBox.y + buffer
//       );
//     });
//   };

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
//         // setSelectedAItemIndex(null);
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

//   const calculateMeasurements = (items, index) => {
//     if (!dropRef.current || !items || !items.length || index == null || index >= items.length) {
//       setHorizontalMeasurements([]);
//       setVerticalMeasurements([]);
//       return;
//     }

//     const item = items[index];
//     if (!item) {
//       setHorizontalMeasurements([]);
//       setVerticalMeasurements([]);
//       return;
//     }

//     // Use the potentially rotated bounding box for measurements
//     const itemBox = getRotatedBoundingBox(item);
//     let { x, y, width, height } = itemBox; // Use width/height from the rotated box

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
//         type: "left-gap",
//         value: leftGap,
//         position: cappedX / 2,
//         from: 0,
//         to: cappedX,
//       },
//       {
//         type: "cabinet",
//         value: cabinetWidth,
//         position: cappedX + cabinetWidth / 2,
//         from: cappedX,
//         to: cappedRight,
//       },
//       {
//         type: "right-gap",
//         value: rightGap,
//         position: cappedRight + rightGap / 2,
//         from: cappedRight,
//         to: roomWidth,
//       },
//     ]);

//     setVerticalMeasurements([
//       {
//         type: "top-gap",
//         value: topGap,
//         position: cappedY / 2,
//         from: 0,
//         to: cappedY,
//         vertical: true,
//       },
//       {
//         type: "cabinet-height",
//         value: cabinetHeight,
//         position: cappedY + cabinetHeight / 2,
//         from: cappedY,
//         to: cappedBottom,
//         vertical: true,
//       },
//       {
//         type: "bottom-gap",
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
//     accept: "CABINET",
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset();
//       const dropZoneNode = dropRef.current;
//       if (!clientOffset || !dropZoneNode) return;

//       const rect = dropZoneNode.getBoundingClientRect();
//       const mmPerPixelX = roomSize.width / rect.width;
//       const mmPerPixelY = roomSize.depth / rect.height;

//       let x = (clientOffset.x - rect.left) * mmPerPixelX;
//       let y = (clientOffset.y - rect.top) * mmPerPixelY;

//       // Initial placement for the new item
//       const newItemBase = {
//         ...item,
//         x: Math.round(x),
//         y: Math.round(y),
//         rotation: 0, // New items usually start unrotated
//         width: item.minWidth || item.width || 300,
//         height: item.minDepth || item.height || 600,
//         id: Date.now(),
//         frontImageSrc: item.frontImageSrc,
//         imageSrc: item.imageSrc
//       };

//       // Get the rotated bounding box for the new item
//       const newItemBox = getRotatedBoundingBox(newItemBase);

//       const SNAP_THRESHOLD = 20; // in mm

//       let finalX = newItemBox.x;
//       let finalY = newItemBox.y;

//       // Snap to walls
//       if (finalX < SNAP_THRESHOLD) finalX = 0;
//       if (finalX > roomSize.width - SNAP_THRESHOLD - newItemBox.width) {
//         finalX = roomSize.width - newItemBox.width;
//       }
//       if (finalY < SNAP_THRESHOLD) finalY = 0;
//       if (finalY > roomSize.depth - SNAP_THRESHOLD - newItemBox.height) {
//         finalY = roomSize.depth - newItemBox.height;
//       }

//       // Snap to existing cabinets (edges)
//       let snapped = false;
//       for (const cabinet of droppedItems) {
//         const existingBox = getRotatedBoundingBox(cabinet);

//         // Snap to left edge of existing cabinet
//         if (Math.abs(finalX + newItemBox.width - existingBox.x) < SNAP_THRESHOLD) {
//           finalX = existingBox.x - newItemBox.width;
//           snapped = true;
//         }
//         // Snap to right edge of existing cabinet
//         if (Math.abs(finalX - (existingBox.x + existingBox.width)) < SNAP_THRESHOLD) {
//           finalX = existingBox.x + existingBox.width;
//           snapped = true;
//         }
//         // Snap to top edge of existing cabinet
//         if (Math.abs(finalY + newItemBox.height - existingBox.y) < SNAP_THRESHOLD) {
//           finalY = existingBox.y - newItemBox.height;
//           snapped = true;
//         }
//         // Snap to bottom edge of existing cabinet
//         if (Math.abs(finalY - (existingBox.y + existingBox.height)) < SNAP_THRESHOLD) {
//           finalY = existingBox.y + existingBox.height;
//           snapped = true;
//         }
//       }

//       const itemToDrop = {
//         ...newItemBase,
//         x: Math.round(finalX),
//         y: Math.round(finalY),
//       };

//       // Final overlap check before dropping
//       if (!isOverlapping(itemToDrop, droppedItems)) {
//         onDrop(itemToDrop);
//         setSelectedItemIndex(droppedItems.length); // Select the newly added item
//       } else {
//         console.warn("Drop ignored due to overlap or unable to find non-overlapping spot.");
//       }
//     },
//     collect: (monitor) => ({ isOver: !!monitor.isOver() }),
//   }));

//   const handleDrag = (index, data) => {
//     const mmPerPixelX = roomSize.width / roomSizePixels.width;
//     const mmPerPixelY = roomSize.depth / roomSizePixels.height;

//     let newX = data.x * mmPerPixelX;
//     let newY = data.y * mmPerPixelY;

//     const item = droppedItems[index];
//     const originalItemX = item.x;
//     const originalItemY = item.y;

//     // Temporarily update the item's position for overlap check
//     const tempUpdatedItem = { ...item, x: newX, y: newY };
//     const tempUpdatedItemBox = getRotatedBoundingBox(tempUpdatedItem);

//     // Keep track of the best non-overlapping position
//     let bestX = newX;
//     let bestY = newY;
//     let foundNonOverlapping = false;

//     // Check for overlap with other items
//     const otherItems = droppedItems.filter((_, i) => i !== index);

//     // Prioritize snapping to edges if not overlapping
//     const SNAP_THRESHOLD = 20; // in mm

//     // Attempt to snap while dragging
//     let snappedX = newX;
//     let snappedY = newY;

//     // Snap to walls
//     if (newX < SNAP_THRESHOLD) snappedX = 0;
//     if (newX > roomSize.width - SNAP_THRESHOLD - tempUpdatedItemBox.width) {
//       snappedX = roomSize.width - tempUpdatedItemBox.width;
//     }
//     if (newY < SNAP_THRESHOLD) snappedY = 0;
//     if (newY > roomSize.depth - SNAP_THRESHOLD - tempUpdatedItemBox.height) {
//       snappedY = roomSize.depth - tempUpdatedItemBox.height;
//     }

//     // Snap to other cabinets (edges)
//     for (const cabinet of otherItems) {
//       const existingBox = getRotatedBoundingBox(cabinet);

//       // Snap to left edge of existing cabinet
//       if (Math.abs(newX + tempUpdatedItemBox.width - existingBox.x) < SNAP_THRESHOLD) {
//         snappedX = existingBox.x - tempUpdatedItemBox.width;
//       }
//       // Snap to right edge of existing cabinet
//       if (Math.abs(newX - (existingBox.x + existingBox.width)) < SNAP_THRESHOLD) {
//         snappedX = existingBox.x + existingBox.width;
//       }
//       // Snap to top edge of existing cabinet
//       if (Math.abs(newY + tempUpdatedItemBox.height - existingBox.y) < SNAP_THRESHOLD) {
//         snappedY = existingBox.y - tempUpdatedItemBox.height;
//       }
//       // Snap to bottom edge of existing cabinet
//       if (Math.abs(newY - (existingBox.y + existingBox.height)) < SNAP_THRESHOLD) {
//         snappedY = existingBox.y + existingBox.height;
//       }
//     }

//     const potentialItem = { ...item, x: snappedX, y: snappedY };
//     if (!isOverlapping(potentialItem, otherItems)) {
//       bestX = snappedX;
//       bestY = snappedY;
//       foundNonOverlapping = true;
//     } else {
//       // If snapping leads to overlap, try the original unsnapped position
//       const unsnappedPotentialItem = { ...item, x: newX, y: newY };
//       if (!isOverlapping(unsnappedPotentialItem, otherItems)) {
//         bestX = newX;
//         bestY = newY;
//         foundNonOverlapping = true;
//       } else {
//         // If both snapped and unsnapped positions overlap,
//         // try to nudge it to a non-overlapping position
//         // This is a simple nudging strategy, more complex might be needed for dense layouts
//         let nudgedX = newX;
//         let nudgedY = newY;
//         let overlapResolved = false;
//         for (let i = 0; i < otherItems.length; i++) {
//           const otherItem = otherItems[i];
//           const otherBox = getRotatedBoundingBox(otherItem);
//           const currentBox = getRotatedBoundingBox({ ...item, x: nudgedX, y: nudgedY });

//           if (
//             currentBox.x < otherBox.x + otherBox.width &&
//             currentBox.x + currentBox.width > otherBox.x &&
//             currentBox.y < otherBox.y + otherBox.height &&
//             currentBox.y + currentBox.height > otherBox.y
//           ) {
//             // Overlap detected, try to move right
//             nudgedX = otherBox.x + otherBox.width;
//             const nudgedItemCheck = { ...item, x: nudgedX, y: nudgedY };
//             if (!isOverlapping(nudgedItemCheck, otherItems)) {
//               overlapResolved = true;
//               break;
//             }
//             // If moving right still overlaps, try moving down
//             nudgedX = newX; // Reset X
//             nudgedY = otherBox.y + otherBox.height;
//             const nudgedItemCheck2 = { ...item, x: nudgedX, y: nudgedY };
//             if (!isOverlapping(nudgedItemCheck2, otherItems)) {
//               overlapResolved = true;
//               break;
//             }
//             // For more complex cases, you'd need a more advanced collision response
//           }
//         }
//         if (overlapResolved) {
//           bestX = nudgedX;
//           bestY = nudgedY;
//           foundNonOverlapping = true;
//         } else {
//           // If all attempts to find a non-overlapping spot fail, revert to original position
//           bestX = originalItemX;
//           bestY = originalItemY;
//         }
//       }
//     }


//     // Ensure we stay within room bounds after snapping/nudging
//     bestX = Math.max(0, Math.min(bestX, roomSize.width - tempUpdatedItemBox.width));
//     bestY = Math.max(0, Math.min(bestY, roomSize.depth - tempUpdatedItemBox.height));

//     const updated = [...droppedItems];
//     updated[index] = { ...item, x: Math.round(bestX), y: Math.round(bestY) };
//     setDroppedItems(updated);
//     setSelectedItemIndex(index);
//     calculateMeasurements(updated, index);
//   };

//   const handlePositionChange = (index, position) => {
//     // This is essentially the `onStop` for Draggable, which also calls handleDrag.
//     // So, the logic for collision resolution is already handled in handleDrag.
//     // We just need to update the state here based on the final position after drag.
//     const mmPerPixelX = roomSize.width / roomSizePixels.width;
//     const mmPerPixelY = roomSize.depth / roomSizePixels.height;

//     let x = position.x * mmPerPixelX;
//     let y = position.y * mmPerPixelY;

//     const item = droppedItems[index];
//     const itemBox = getRotatedBoundingBox(item); // Use rotated box for boundary check

//     x = Math.max(0, Math.min(x, roomSize.width - itemBox.width));
//     y = Math.max(0, Math.min(y, roomSize.depth - itemBox.height));

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
//     <div
//       style={{
//         position: "relative",
//         width: "100%",
//         padding: "10px 10px 10px 50px", // Added left padding for vertical measurements
//       }}
//     >
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
//           marginLeft: "40px", // Align with the drop zone
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
//             {typeof m.value === "number" && (
//               <div
//                 className="measurement-label"
//                 style={{
//                   position: "absolute",
//                   left: `${constrainPosition(
//                     (m.position / roomSize.width) * 100,
//                     100
//                   )}%`,
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

//       {/* Vertical measurements container (outside the drop zone) */}
//       <div
//         style={{
//           position: "absolute",
//           left: "10px",
//           top: "50px",
//           bottom: "10px",
//           width: "40px",
//           borderRight: "1px solid #ddd",
//           zIndex: 0,
//         }}
//       >
//         {verticalMeasurements.map((m, i) => (
//           <Fragment key={`v-${i}`}>
//             <div
//               style={{
//                 position: "absolute",
//                 top: `${(m.from / roomSize.depth) * 100}%`,
//                 height: `${((m.to - m.from) / roomSize.depth) * 100}%`,
//                 width: "20px",
//                 left: "10px",
//                 borderLeft: "1px solid #666",
//                 borderTop: m.type.includes("floor") ? "1px solid #666" : "none",
//                 borderBottom: m.type.includes("ceiling")
//                   ? "1px solid #666"
//                   : "none",
//                 borderColor: "#007bff",
//                 borderWidth: "2px",
//               }}
//             />
//             {typeof m.value === "number" && (
//               <div
//                 className="measurement-label"
//                 style={{
//                   position: "absolute",
//                   top: `${constrainPosition(
//                     (m.position / roomSize.depth) * 100,
//                     100
//                   )}%`,
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
//             )}
//           </Fragment>
//         ))}
//       </div>

//       {/* Drop zone */}
//       <div
//         ref={(node) => {
//           drop(node);
//           dropRef.current = node;
//         }}
//         onClick={(e) => {
//           if (e.target === dropRef.current) setSelectedItemIndex(null);
//         }}
//         style={{
//           width: "calc(100% - 40px)", // Make room for vertical measurements
//           height: "500px",
//           border: isOver ? "2px dashed #00bfff" : "2px dashed #adb5bd",
//           backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
//           position: "relative",
//           borderRadius: "4px",
//           overflow: "hidden",
//           cursor: "default",
//           marginLeft: "40px", // Push to the right to make space for vertical measurements
//         }}
//       >
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
//                   // Rotation is now applied directly to the image inside, not the draggable container
//                   zIndex: selectedItemIndex === index ? 10 : 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   backgroundColor:
//                     selectedItemIndex === index
//                       ? "rgba(0, 123, 255, 0.1)"
//                       : "transparent",
//                   // Set width/height based on the original item's dimensions for the draggable container
//                   width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
//                   height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   handleCabinetClick(item, index);
//                 }}
//               >
//                 <img
//                   src={item.frontImageSrc}
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
//               backgroundImage: `url(${draggingItem.frontImageSrc || draggingItem.imageSrc
//                 })`,
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
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const dropRef = useRef(null);
  const [roomSizePixels, setRoomSizePixels] = useState({ width: 1, height: 1 });
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

  const isEditingAllowed = () => {
    return currentStep === "Top View"; // Only allow editing in Top View step
  };

  // --- Helper to get rotated bounding box ---
  const getRotatedBoundingBox = (item) => {
    const { x, y, width, height, rotation } = item;
    const angleRad = (rotation * Math.PI) / 180;

    const corners = [
      { dx: 0, dy: 0 },
      { dx: width, dy: 0 },
      { dx: 0, dy: height },
      { dx: width, dy: height },
    ].map(({ dx, dy }) => {
      // Rotate around the item's center
      const centerX = width / 2;
      const centerY = height / 2;
      const rotatedX = (dx - centerX) * Math.cos(angleRad) - (dy - centerY) * Math.sin(angleRad) + centerX;
      const rotatedY = (dx - centerX) * Math.sin(angleRad) + (dy - centerY) * Math.cos(angleRad) + centerY;
      return { x: rotatedX, y: rotatedY };
    });

    const minX = Math.min(...corners.map(c => c.x));
    const maxX = Math.max(...corners.map(c => c.x));
    const minY = Math.min(...corners.map(c => c.y));
    const maxY = Math.max(...corners.map(c => c.y));

    return {
      x: x + minX,
      y: y + minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // --- Updated isOverlapping with rotated bounding box ---
  const isOverlapping = (newItem, existingItems) => {
    const newBox = getRotatedBoundingBox(newItem);

    return existingItems.some((item) => {
      // Exclude self from overlap check during drag
      if (newItem.id === item.id) return false;

      const existingBox = getRotatedBoundingBox(item);
      const buffer = 1; // Minimal buffer for 'sticking' without overlap

      // Check if boxes physically overlap
      const physicalOverlap = (
        newBox.x < existingBox.x + existingBox.width - buffer &&
        newBox.x + newBox.width > existingBox.x + buffer &&
        newBox.y < existingBox.y + existingBox.height - buffer &&
        newBox.y + newBox.height > existingBox.y + buffer
      );

      if (!physicalOverlap) return false;

      // Now check overlap rules based on overlap property
      const newOverlap = newItem.overlap || 1;
      const existingOverlap = item.overlap || 1;

      // Overlap rules:
      // 1 cannot overlap with anything (default)
      if (newOverlap === 1 || existingOverlap === 1) return true;

      // 2 can only overlap with 3 and 4
      if (newOverlap === 2 && (existingOverlap !== 3 && existingOverlap !== 4)) return true;
      if (existingOverlap === 2 && (newOverlap !== 3 && newOverlap !== 4)) return true;

      // 3 can only overlap with 2 and 4
      if (newOverlap === 3 && (existingOverlap !== 2 && existingOverlap !== 4)) return true;
      if (existingOverlap === 3 && (newOverlap !== 2 && newOverlap !== 4)) return true;

      // 4 can overlap with anything except 1 (already handled above)
      return false;
    });
  };

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
        // setSelectedAItemIndex(null);
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

    // Use the potentially rotated bounding box for measurements
    const itemBox = getRotatedBoundingBox(item);
    let { x, y, width, height } = itemBox; // Use width/height from the rotated box

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

      // Initial placement for the new item
      const newItemBase = {
        ...item,
        x: Math.round(x),
        y: Math.round(y),
        rotation: 0, // New items usually start unrotated
        width: item.minWidth || item.width || 300,
        height: item.minDepth || item.height || 600,
        id: Date.now(),
        frontImageSrc: item.frontImageSrc,
        imageSrc: item.imageSrc
      };

      // Get the rotated bounding box for the new item
      const newItemBox = getRotatedBoundingBox(newItemBase);

      const SNAP_THRESHOLD = 20; // in mm

      let finalX = newItemBox.x;
      let finalY = newItemBox.y;

      // Snap to walls
      if (finalX < SNAP_THRESHOLD) finalX = 0;
      if (finalX > roomSize.width - SNAP_THRESHOLD - newItemBox.width) {
        finalX = roomSize.width - newItemBox.width;
      }
      if (finalY < SNAP_THRESHOLD) finalY = 0;
      if (finalY > roomSize.depth - SNAP_THRESHOLD - newItemBox.height) {
        finalY = roomSize.depth - newItemBox.height;
      }

      // Snap to existing cabinets (edges)
      let snapped = false;
      for (const cabinet of droppedItems) {
        const existingBox = getRotatedBoundingBox(cabinet);

        // Snap to left edge of existing cabinet
        if (Math.abs(finalX + newItemBox.width - existingBox.x) < SNAP_THRESHOLD) {
          finalX = existingBox.x - newItemBox.width;
          snapped = true;
        }
        // Snap to right edge of existing cabinet
        if (Math.abs(finalX - (existingBox.x + existingBox.width)) < SNAP_THRESHOLD) {
          finalX = existingBox.x + existingBox.width;
          snapped = true;
        }
        // Snap to top edge of existing cabinet
        if (Math.abs(finalY + newItemBox.height - existingBox.y) < SNAP_THRESHOLD) {
          finalY = existingBox.y - newItemBox.height;
          snapped = true;
        }
        // Snap to bottom edge of existing cabinet
        if (Math.abs(finalY - (existingBox.y + existingBox.height)) < SNAP_THRESHOLD) {
          finalY = existingBox.y + existingBox.height;
          snapped = true;
        }
      }

      const itemToDrop = {
        ...newItemBase,
        x: Math.round(finalX),
        y: Math.round(finalY),
      };

      // Final overlap check before dropping
      if (!isOverlapping(itemToDrop, droppedItems)) {
        onDrop(itemToDrop);
        setSelectedItemIndex(droppedItems.length); // Select the newly added item
      } else {
        console.warn("Drop ignored due to overlap or unable to find non-overlapping spot.");
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const handleDrag = (index, data) => {
    const mmPerPixelX = roomSize.width / roomSizePixels.width;
    const mmPerPixelY = roomSize.depth / roomSizePixels.height;

    let newX = data.x * mmPerPixelX;
    let newY = data.y * mmPerPixelY;

    const item = droppedItems[index];
    const originalItemX = item.x;
    const originalItemY = item.y;

    // Temporarily update the item's position for overlap check
    const tempUpdatedItem = { ...item, x: newX, y: newY };
    const tempUpdatedItemBox = getRotatedBoundingBox(tempUpdatedItem);

    // Keep track of the best non-overlapping position
    let bestX = newX;
    let bestY = newY;
    let foundNonOverlapping = false;

    // Check for overlap with other items
    const otherItems = droppedItems.filter((_, i) => i !== index);

    // Prioritize snapping to edges if not overlapping
    const SNAP_THRESHOLD = 20; // in mm

    // Attempt to snap while dragging
    let snappedX = newX;
    let snappedY = newY;

    // Snap to walls
    if (newX < SNAP_THRESHOLD) snappedX = 0;
    if (newX > roomSize.width - SNAP_THRESHOLD - tempUpdatedItemBox.width) {
      snappedX = roomSize.width - tempUpdatedItemBox.width;
    }
    if (newY < SNAP_THRESHOLD) snappedY = 0;
    if (newY > roomSize.depth - SNAP_THRESHOLD - tempUpdatedItemBox.height) {
      snappedY = roomSize.depth - tempUpdatedItemBox.height;
    }

    // Snap to other cabinets (edges)
    for (const cabinet of otherItems) {
      const existingBox = getRotatedBoundingBox(cabinet);

      // Snap to left edge of existing cabinet
      if (Math.abs(newX + tempUpdatedItemBox.width - existingBox.x) < SNAP_THRESHOLD) {
        snappedX = existingBox.x - tempUpdatedItemBox.width;
      }
      // Snap to right edge of existing cabinet
      if (Math.abs(newX - (existingBox.x + existingBox.width)) < SNAP_THRESHOLD) {
        snappedX = existingBox.x + existingBox.width;
      }
      // Snap to top edge of existing cabinet
      if (Math.abs(newY + tempUpdatedItemBox.height - existingBox.y) < SNAP_THRESHOLD) {
        snappedY = existingBox.y - tempUpdatedItemBox.height;
      }
      // Snap to bottom edge of existing cabinet
      if (Math.abs(newY - (existingBox.y + existingBox.height)) < SNAP_THRESHOLD) {
        snappedY = existingBox.y + existingBox.height;
      }
    }

    const potentialItem = { ...item, x: snappedX, y: snappedY };
    if (!isOverlapping(potentialItem, otherItems)) {
      bestX = snappedX;
      bestY = snappedY;
      foundNonOverlapping = true;
    } else {
      // If snapping leads to overlap, try the original unsnapped position
      const unsnappedPotentialItem = { ...item, x: newX, y: newY };
      if (!isOverlapping(unsnappedPotentialItem, otherItems)) {
        bestX = newX;
        bestY = newY;
        foundNonOverlapping = true;
      } else {
        // If both snapped and unsnapped positions overlap,
        // try to nudge it to a non-overlapping position
        // This is a simple nudging strategy, more complex might be needed for dense layouts
        let nudgedX = newX;
        let nudgedY = newY;
        let overlapResolved = false;
        for (let i = 0; i < otherItems.length; i++) {
          const otherItem = otherItems[i];
          const otherBox = getRotatedBoundingBox(otherItem);
          const currentBox = getRotatedBoundingBox({ ...item, x: nudgedX, y: nudgedY });

          if (
            currentBox.x < otherBox.x + otherBox.width &&
            currentBox.x + currentBox.width > otherBox.x &&
            currentBox.y < otherBox.y + otherBox.height &&
            currentBox.y + currentBox.height > otherBox.y
          ) {
            // Overlap detected, try to move right
            nudgedX = otherBox.x + otherBox.width;
            const nudgedItemCheck = { ...item, x: nudgedX, y: nudgedY };
            if (!isOverlapping(nudgedItemCheck, otherItems)) {
              overlapResolved = true;
              break;
            }
            // If moving right still overlaps, try moving down
            nudgedX = newX; // Reset X
            nudgedY = otherBox.y + otherBox.height;
            const nudgedItemCheck2 = { ...item, x: nudgedX, y: nudgedY };
            if (!isOverlapping(nudgedItemCheck2, otherItems)) {
              overlapResolved = true;
              break;
            }
            // For more complex cases, you'd need a more advanced collision response
          }
        }
        if (overlapResolved) {
          bestX = nudgedX;
          bestY = nudgedY;
          foundNonOverlapping = true;
        } else {
          // If all attempts to find a non-overlapping spot fail, revert to original position
          bestX = originalItemX;
          bestY = originalItemY;
        }
      }
    }


    // Ensure we stay within room bounds after snapping/nudging
    bestX = Math.max(0, Math.min(bestX, roomSize.width - tempUpdatedItemBox.width));
    bestY = Math.max(0, Math.min(bestY, roomSize.depth - tempUpdatedItemBox.height));

    const updated = [...droppedItems];
    updated[index] = { ...item, x: Math.round(bestX), y: Math.round(bestY) };
    setDroppedItems(updated);
    setSelectedItemIndex(index);
    calculateMeasurements(updated, index);
  };

  const handlePositionChange = (index, position) => {
    // This is essentially the `onStop` for Draggable, which also calls handleDrag.
    // So, the logic for collision resolution is already handled in handleDrag.
    // We just need to update the state here based on the final position after drag.
    const mmPerPixelX = roomSize.width / roomSizePixels.width;
    const mmPerPixelY = roomSize.depth / roomSizePixels.height;

    let x = position.x * mmPerPixelX;
    let y = position.y * mmPerPixelY;

    const item = droppedItems[index];
    const itemBox = getRotatedBoundingBox(item); // Use rotated box for boundary check

    x = Math.max(0, Math.min(x, roomSize.width - itemBox.width));
    y = Math.max(0, Math.min(y, roomSize.depth - itemBox.height));

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
    <div
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
                if (isEditingAllowed) {
                  setIsDragging(true);
                  setDraggingIndex(index);
                }
              }}
              onDrag={(e, data) => {
                if (isEditingAllowed) handleDrag(index, data);
              }}
              onStop={(e, data) => {
                if (isEditingAllowed) {
                  setIsDragging(false);
                  setDraggingIndex(null);
                  handlePositionChange(index, data);
                }
              }}
              disabled={!isEditingAllowed} 
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
                  // Rotation is now applied directly to the image inside, not the draggable container
                  zIndex: selectedItemIndex === index ? 10 : 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor:
                    selectedItemIndex === index
                      ? "rgba(0, 123, 255, 0.1)"
                      : "transparent",
                  // Set width/height based on the original item's dimensions for the draggable container
                  width: `${(item.width / roomSize.width) * roomSizePixels.width}px`,
                  height: `${(item.height / roomSize.depth) * roomSizePixels.height}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCabinetClick(item, index);
                }}
              >
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

                {selectedItemIndex === index && isEditingAllowed &&  (
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

// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();
