import React, { useState, useEffect, useRef, Fragment } from "react";
import { useDrag, useDrop } from "react-dnd";
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
export const DraggableCabinet = ({ name,
  imageSrc,
  id,
  cabinateFrontImage,
  minWidth,    // Add these props
  maxWidth,
  minDepth,
  maxDepth }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CABINET",
    item: {
      id,
      name,
      imageSrc,
      minWidth,  // Include in drag item
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


//sahi hai 
// export const DropZone = ({ onDrop, droppedItems, onRemove, onRotate, currentStep, setDroppedItems, roomSize }) => {
//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: "CABINET",
//     drop: (item, monitor) => {
//       const offset = monitor.getSourceClientOffset();
//       if (offset) {
//         const x = offset.x;
//         const y = offset.y;
//         onDrop({ ...item, x, y, rotation: 0 });
//       }
//     },
//     collect: (monitor) => ({
//       isOver: !!monitor.isOver(),
//     }),
//   }));


//   //  Modal State for Notes
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

//   useEffect(() => {
//     saveNotesToLocalStorage(notesMap);
//   }, [notesMap]);

//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);

//   // ✅ Global click event listener
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest(".cabinet-item")) {
//         setSelectedItemIndex(null);
//       }
//     };

//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);


//   const handleSaveNotes = (item, note) => {
//     setNotesMap((prevNotesMap) => {
//       const existingNotes = prevNotesMap[item.name] || [];
//       const updatedNotes = {
//         ...prevNotesMap,
//         [item.name]: [...existingNotes, note],
//       };

//       // Save to localStorage
//       saveNotesToLocalStorage(updatedNotes);

//       // Fire a storage event
//       window.dispatchEvent(new Event("storage"));

//       return updatedNotes;
//     });
//     setModalOpen(false);
//   };


//   const handleCabinetClick = (item) => {
//     // Only show notes modal in "Add Notes" step
//     if (currentStep === "Add Notes") {
//       setSelectedItem(item);
//       setModalOpen(true);
//     }
//   };


//   const handlePositionChange = (index, position) => {
//     setDroppedItems(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: position.x,
//         y: position.y
//       };
//       return updated;
//     });
//   };


//   // Add this useEffect to sync with localStorage changes
//   useEffect(() => {
//     const handleStorageChange = () => {
//       setNotesMap(getNotesFromLocalStorage());
//     };

//     window.addEventListener('storage', handleStorageChange);

//     return () => {
//       window.removeEventListener('storage', handleStorageChange);
//     };
//   }, []);


//   // ✅ Select only clicked cabinet for measurement
//   const selectedDroppedItem = droppedItems[selectedItemIndex] || {};

//   // ✅ Width & Depth based on selected cabinet only
//   const totalCabinetsWidth = parseInt(selectedDroppedItem.width || 0);
//   const totalCabinetsdeapth = parseInt(selectedDroppedItem.height || 0);

//   const remainingSpace = roomSize.width - totalCabinetsWidth;
//   const remainingSpacedeapth = roomSize.depth - totalCabinetsdeapth;

//   console.log("remainingSpacedeapth", remainingSpacedeapth);


//   return (
//     <div style={{ display: "flex" }}>


//       <AddNotesModal
//         isOpen={isModalOpen && currentStep === "Add Notes"}
//         onClose={() => setModalOpen(false)}
//         onSave={handleSaveNotes}
//         item={selectedItem}
//       />


//       {/* vertical */}
//       <div style={{
//         position: "relative",
//         width: "40px", // adjust as needed
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between"
//       }}>
//         <span style={{
//           position: "absolute",
//           top: 0,
//           left: "5px",
//           fontSize: "12px",
//           backgroundColor: "#f5f5f5",
//           padding: "0 5px"
//         }}>{totalCabinetsdeapth}mm</span>
//         <span style={{
//           position: "absolute",
//           bottom: 0,
//           left: "5px",
//           fontSize: "12px",
//           backgroundColor: "#f5f5f5",
//           padding: "0 5px"
//         }}>{remainingSpacedeapth}mm</span>
//         <div style={{
//           borderLeft: '1px solid #ccc',
//           height: '100%'
//         }} />
//       </div>


//       {/* horizontal */}
//       <div style={{ width: "100%" }}>
//         {/* Horizontal measurement line */}
//         <div style={{
//           position: 'relative',
//           height: "30px",
//           width: "75%",
//           marginBottom: "15px"
//         }}>
//           <hr style={{
//             border: 'none',
//             // borderTop: '1px solid #ccc',
//             position: 'absolute',
//             width: '100%',
//             top: '50%',
//             borderTop: '2px solid #555'
//           }} />
//           <div style={{
//             position: 'absolute',
//             top: '0',
//             width: '100%',
//             display: 'flex',
//             justifyContent: 'space-between',
//             padding: '0 20px'
//           }}>
//             <span style={{ fontSize: "12px", backgroundColor: '#f5f5f5', padding: '0 5px' }}>
//               {totalCabinetsWidth}mm
//             </span>
//             <span style={{ fontSize: "12px", backgroundColor: '#f5f5f5', padding: '0 5px' }}>
//               {remainingSpace}mm
//             </span>
//           </div>
//         </div>




//         {/* Drop Area */}
//         <div
//           ref={drop}
//           style={{
//             width: "75%",
//             height: "400px",
//             border: isOver ? "2px dashed #00bfff" : "2px dashed #ccc",
//             backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
//             position: "relative",
//             padding: "10px",
//             textAlign: "center",
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "9px",
//             alignContent: "flex-start",
//           }}
//         >
//           {droppedItems.map((item, index) => (
//             <Draggable key={item.id || index} position={{ x: item.x || 50, y: item.y || 50 }}
//               bounds="parent"
//               onStop={(e, data) => handlePositionChange(index, data)}>

//               <div
//                 className="cabinet-item" // ✅ Added class for easy detection
//                 style={{
//                   position: "absolute",
//                   cursor: "move",
//                   transform: `rotate(${item.rotation}deg)`,
//                   transition: "transform 0.3s ease-in-out",
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSelectedItemIndex(index);
//                 }}
//               >



//                 <img
//                   src={item.imageSrc}
//                   alt={item.name}
//                   onClick={() => handleCabinetClick(item)}
//                   style={{
//                     width: "100px",
//                     height: "100px",
//                     objectFit: "cover",
//                     border: "1px solid #ccc",
//                     display: "block",
//                     transform: `rotate(${item.rotation}deg)`,
//                     transition: "transform 0.3s ease-in-out",
//                   }}
//                 />





//                 {/* Show buttons only when selected */}
//                 {(currentStep === "Base Layout" && selectedItemIndex === index) && (
//                   <>
//                     {/* Rotate Button */}
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
//                         width: "25px",
//                         height: "25px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       ↻
//                     </button>

//                     {/* Remove Button */}
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRemove(index);
//                       }}
//                       style={{
//                         position: "absolute",
//                         top: "5px",
//                         right: "5px",
//                         background: "#0dcaf0",
//                         color: "#343a40",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "20px",
//                         height: "20px",
//                         cursor: "pointer",
//                       }}
//                     >
//                       ×
//                     </button>
//                   </>
//                 )}
//               </div>
//             </Draggable>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };




// showing height and width ******
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
//   const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
//   const [verticalMeasurements, setVerticalMeasurements] = useState([]);
//   const [totalWidth, setTotalWidth] = useState(0);
//   const [totalDepth, setTotalDepth] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggingIndex, setDraggingIndex] = useState(null);

//   const calculateMeasurements = (items) => {
//     if (dropRef.current && items.length > 0) {
//       const dropZoneWidth = dropRef.current.offsetWidth;
//       const dropZoneHeight = dropRef.current.offsetHeight;
//       const mmPerPixelWidth = roomSize.width / dropZoneWidth;
//       const mmPerPixelHeight = roomSize.depth / dropZoneHeight;

//       // Sort items by x position for horizontal measurements
//       const sortedItems = [...items].sort((a, b) => a.x - b.x);

//       // Calculate horizontal measurements (width)
//       const newHorizontalMeasurements = [];
//       let calculatedTotalWidth = 0;

//       // Left wall to first cabinet
//       if (sortedItems.length > 0) {
//         const leftWallMeasurement = Math.round(sortedItems[0].x * mmPerPixelWidth);
//         if (leftWallMeasurement > 0) {
//           newHorizontalMeasurements.push({
//             type: 'wall-to-cabinet',
//             value: leftWallMeasurement,
//             position: sortedItems[0].x / 2,
//             from: 0,
//             to: sortedItems[0].x,
//             itemIndex: 0,
//           });
//           calculatedTotalWidth += leftWallMeasurement;
//         }
//       }

//       // Cabinet widths and gaps
//       sortedItems.forEach((item, index) => {
//         const cabinetWidth = item.width;
//         newHorizontalMeasurements.push({
//           type: 'cabinet-width',
//           value: cabinetWidth,
//           position: item.x + (item.width / mmPerPixelWidth / 2),
//           from: item.x,
//           to: item.x + (item.width / mmPerPixelWidth),
//           itemIndex: index,
//         });
//         calculatedTotalWidth += cabinetWidth;

//         if (index < sortedItems.length - 1) {
//           const nextItem = sortedItems[index + 1];
//           const gapPixels = nextItem.x - (item.x + (item.width / mmPerPixelWidth));
//           const gap = Math.round(gapPixels * mmPerPixelWidth);
//           if (gap > 0) {
//             newHorizontalMeasurements.push({
//               type: 'cabinet-to-cabinet',
//               value: gap,
//               position: item.x + (item.width / mmPerPixelWidth) + (gapPixels / 2),
//               from: item.x + (item.width / mmPerPixelWidth),
//               to: nextItem.x,
//               itemIndex: index,
//             });
//             calculatedTotalWidth += gap;
//           }
//         }
//       });

//       // Right wall
//       if (sortedItems.length > 0) {
//         const lastIndex = sortedItems.length - 1;
//         const lastItem = sortedItems[lastIndex];
//         const rightWallMeasurement = roomSize.width - Math.round((lastItem.x * mmPerPixelWidth) + lastItem.width);
//         if (rightWallMeasurement > 0) {
//           newHorizontalMeasurements.push({
//             type: 'cabinet-to-wall',
//             value: rightWallMeasurement,
//             position: lastItem.x + (lastItem.width / mmPerPixelWidth) + ((dropZoneWidth - (lastItem.x + (lastItem.width / mmPerPixelWidth))) / 2),
//             from: lastItem.x + (lastItem.width / mmPerPixelWidth),
//             to: dropZoneWidth,
//             itemIndex: lastIndex,
//           });
//           calculatedTotalWidth += rightWallMeasurement;
//         }
//       }

//       setHorizontalMeasurements(newHorizontalMeasurements);
//       setTotalWidth(calculatedTotalWidth);

//       // Calculate vertical measurements (depth/height)
//       const newVerticalMeasurements = [];
//       let calculatedTotalDepth = 0;

//       // For each cabinet, calculate floor-to-cabinet and cabinet height measurements
//       items.forEach((item, index) => {
//         const cabinetHeight = item.height;

//         // Floor to bottom of cabinet
//         const floorToCabinet = Math.round(item.y * mmPerPixelHeight);
//         if (floorToCabinet > 0) {
//           newVerticalMeasurements.push({
//             type: 'floor-to-cabinet',
//             value: floorToCabinet,
//             position: item.y / 2,
//             from: 0,
//             to: item.y,
//             itemIndex: index,
//             vertical: true
//           });
//           calculatedTotalDepth += floorToCabinet;
//         }

//         // Cabinet height
//         newVerticalMeasurements.push({
//           type: 'cabinet-height',
//           value: cabinetHeight,
//           position: item.y + (cabinetHeight / mmPerPixelHeight / 2),
//           from: item.y,
//           to: item.y + (cabinetHeight / mmPerPixelHeight),
//           itemIndex: index,
//           vertical: true
//         });
//         calculatedTotalDepth += cabinetHeight;

//         // Ceiling space (top of cabinet to ceiling)
//         const ceilingSpace = roomSize.depth - Math.round((item.y * mmPerPixelHeight) + cabinetHeight);
//         if (ceilingSpace > 0) {
//           newVerticalMeasurements.push({
//             type: 'cabinet-to-ceiling',
//             value: ceilingSpace,
//             position: item.y + (cabinetHeight / mmPerPixelHeight) + ((dropZoneHeight - (item.y + (cabinetHeight / mmPerPixelHeight))) / 2),
//             from: item.y + (cabinetHeight / mmPerPixelHeight),
//             to: dropZoneHeight,
//             itemIndex: index,
//             vertical: true
//           });
//           calculatedTotalDepth += ceilingSpace;
//         }
//       });

//       setVerticalMeasurements(newVerticalMeasurements);
//       setTotalDepth(calculatedTotalDepth);
//     } else {
//       setHorizontalMeasurements([]);
//       setVerticalMeasurements([]);
//       setTotalWidth(0);
//       setTotalDepth(0);
//     }
//   };

//   useEffect(() => {
//     calculateMeasurements(droppedItems);
//   }, [droppedItems, roomSize.width, roomSize.depth]);

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
//         droppedItems.forEach(cabinet => {
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
//         finalY = Math.max(0, Math.min(finalY, dropZoneRect.height - itemHeight));

//         onDrop({
//           ...item,
//           x: finalX,
//           y: finalY,
//           rotation: 0,
//           width: itemWidth,
//           height: itemHeight,
//         });
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

//     setDroppedItems(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: newX,
//         y: newY
//       };
//       return updated;
//     });

//     calculateMeasurements(droppedItems);
//   };

//   const handleDrag = (index, data) => {
//     const tempItems = [...droppedItems];
//     tempItems[index] = { ...tempItems[index], x: data.x, y: data.y };
//     calculateMeasurements(tempItems);
//   };

//   return (
//     <div style={{ position: "relative", width: "100%", padding: "10px" }}>
//       {/* Horizontal measurements at the top */}
//       <div style={{ height: "40px", position: "relative", marginBottom: "10px", borderBottom: "1px solid #ddd" }}>
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
//                 borderLeft: m.type.includes('wall') ? "1px solid #666" : "none",
//                 borderRight: m.type.includes('wall') ? "1px solid #666" : "none",
//                 borderColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#007bff" : "#666",
//                 borderWidth: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "2px" : "1px",
//                 zIndex: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? 1 : 0,
//               }}
//             />
//             <div
//               style={{
//                 position: "absolute",
//                 left: `${m.position}px`,
//                 top: "0",
//                 transform: 'translateX(-50%)',
//                 backgroundColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#e0f7fa" : "#fff",
//                 padding: '2px 6px',
//                 borderRadius: '4px',
//                 fontSize: '12px',
//                 border: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "1px solid #00bcd4" : "1px solid #ddd",
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                 whiteSpace: 'nowrap',
//                 fontWeight: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "bold" : "normal",
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
//           overflow: "hidden"
//         }}
//       >
//         {/* Vertical measurements on the left side */}
//         <div style={{
//           position: "absolute",
//           left: "50",
//           top: "0",
//           bottom: "0",
//           width: "40px",
//           borderRight: "1px solid #ddd",
//           zIndex: 0
//         }}>
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
//                   borderTop: m.type.includes('floor') ? "1px solid #666" : "none",
//                   borderBottom: m.type.includes('ceiling') ? "1px solid #666" : "none",
//                   borderColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#007bff" : "#666",
//                   borderWidth: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "2px" : "1px",
//                   zIndex: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? 1 : 0,
//                 }}
//               />
//               <div
//                 style={{
//                   position: "absolute",
//                   top: `${m.position}px`,
//                   left: "25px",
//                   transform: 'translateY(-50%) rotate(-90deg)',
//                   transformOrigin: 'left center',
//                   backgroundColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#e0f7fa" : "#fff",
//                   padding: '2px 6px',
//                   borderRadius: '4px',
//                   fontSize: '12px',
//                   border: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "1px solid #00bcd4" : "1px solid #ddd",
//                   boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                   whiteSpace: 'nowrap',
//                   fontWeight: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "bold" : "normal",
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
//                 style={{
//                   position: "absolute",
//                   cursor: "move",
//                   borderRadius: "3px",
//                   padding: "2px",
//                   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                   transform: `rotate(${item.rotation}deg)`,
//                   zIndex: selectedItemIndex === index ? 10 : 1,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center"
//                 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSelectedItemIndex(index);
//                 }}
//               >
//                 {/* Cabinet image and controls */}
//                 <img
//                   src={item.imageSrc}
//                   alt={item.name}
//                   style={{
//                     width: `${item.width}px`,
//                     height: `${item.height}px`,
//                     objectFit: "contain",
//                     display: "block"
//                   }}
//                 />

//                 {selectedItemIndex === index && (
//                   <div style={{
//                     position: "absolute",
//                     top: "-30px",
//                     width: "100%",
//                     display: "flex",
//                     justifyContent: "center",
//                     gap: "10px"
//                   }}>
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRotate(index);
//                       }}
//                       style={{
//                         background: "#28a745",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "25px",
//                         height: "25px",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center"
//                       }}
//                       title="Rotate 90°"
//                     >↻</button>

//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         onRemove(index);
//                       }}
//                       style={{
//                         background: "#dc3545",
//                         color: "#fff",
//                         border: "none",
//                         borderRadius: "50%",
//                         width: "25px",
//                         height: "25px",
//                         cursor: "pointer",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center"
//                       }}
//                       title="Remove cabinet"
//                     >×</button>
//                   </div>
//                 )}
//               </div>
//             </Draggable>
//           </Fragment>
//         ))}
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
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [horizontalMeasurements, setHorizontalMeasurements] = useState([]);
  const [verticalMeasurements, setVerticalMeasurements] = useState([]);
  const [totalWidth, setTotalWidth] = useState(0);
  const [totalDepth, setTotalDepth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState(null);

  const calculateMeasurements = (items) => {
    if (dropRef.current && items.length > 0) {
      const dropZoneWidth = dropRef.current.offsetWidth;
      const dropZoneHeight = dropRef.current.offsetHeight;
      const mmPerPixelWidth = roomSize.width / dropZoneWidth;
      const mmPerPixelHeight = roomSize.depth / dropZoneHeight;

      // Calculate measurements only for the selected cabinet if one is selected
      if (selectedItemIndex !== null && selectedItemIndex < items.length) {
        const selectedItem = items[selectedItemIndex];
        const newHorizontalMeasurements = [];
        const newVerticalMeasurements = [];

        // Horizontal measurements for selected cabinet
        // Left wall to cabinet
        const leftWallMeasurement = Math.round(selectedItem.x * mmPerPixelWidth);
        if (leftWallMeasurement > 0) {
          newHorizontalMeasurements.push({
            type: 'wall-to-cabinet',
            value: leftWallMeasurement,
            position: selectedItem.x / 2,
            from: 0,
            to: selectedItem.x,
            itemIndex: selectedItemIndex,
          });
        }

        // Cabinet width
        newHorizontalMeasurements.push({
          type: 'cabinet-width',
          value: selectedItem.width,
          position: selectedItem.x + (selectedItem.width / mmPerPixelWidth / 2),
          from: selectedItem.x,
          to: selectedItem.x + (selectedItem.width / mmPerPixelWidth),
          itemIndex: selectedItemIndex,
        });

        // Right wall
        const rightWallMeasurement = roomSize.width - Math.round((selectedItem.x * mmPerPixelWidth) + selectedItem.width);
        if (rightWallMeasurement > 0) {
          newHorizontalMeasurements.push({
            type: 'cabinet-to-wall',
            value: rightWallMeasurement,
            position: selectedItem.x + (selectedItem.width / mmPerPixelWidth) + ((dropZoneWidth - (selectedItem.x + (selectedItem.width / mmPerPixelWidth)))) / 2,
            from: selectedItem.x + (selectedItem.width / mmPerPixelWidth),
            to: dropZoneWidth,
            itemIndex: selectedItemIndex,
          });
        }

        setHorizontalMeasurements(newHorizontalMeasurements);
        setTotalWidth(leftWallMeasurement + selectedItem.width + rightWallMeasurement);

        // Vertical measurements for selected cabinet
        // Floor to cabinet
        const floorToCabinet = Math.round(selectedItem.y * mmPerPixelHeight);
        if (floorToCabinet > 0) {
          newVerticalMeasurements.push({
            type: 'floor-to-cabinet',
            value: floorToCabinet,
            position: selectedItem.y / 2,
            from: 0,
            to: selectedItem.y,
            itemIndex: selectedItemIndex,
            vertical: true
          });
        }

        // Cabinet height
        newVerticalMeasurements.push({
          type: 'cabinet-height',
          value: selectedItem.height,
          position: selectedItem.y + (selectedItem.height / mmPerPixelHeight / 2),
          from: selectedItem.y,
          to: selectedItem.y + (selectedItem.height / mmPerPixelHeight),
          itemIndex: selectedItemIndex,
          vertical: true
        });

        // Ceiling space
        const ceilingSpace = roomSize.depth - Math.round((selectedItem.y * mmPerPixelHeight) + selectedItem.height);
        if (ceilingSpace > 0) {
          newVerticalMeasurements.push({
            type: 'cabinet-to-ceiling',
            value: ceilingSpace,
            position: selectedItem.y + (selectedItem.height / mmPerPixelHeight) + ((dropZoneHeight - (selectedItem.y + (selectedItem.height / mmPerPixelHeight))) / 2),
            from: selectedItem.y + (selectedItem.height / mmPerPixelHeight),
            to: dropZoneHeight,
            itemIndex: selectedItemIndex,
            vertical: true
          });
        }

        setVerticalMeasurements(newVerticalMeasurements);
        setTotalDepth(floorToCabinet + selectedItem.height + ceilingSpace);
      } else {
        // No cabinet selected, show no measurements
        setHorizontalMeasurements([]);
        setVerticalMeasurements([]);
        setTotalWidth(0);
        setTotalDepth(0);
      }
    } else {
      setHorizontalMeasurements([]);
      setVerticalMeasurements([]);
      setTotalWidth(0);
      setTotalDepth(0);
    }
  };

  useEffect(() => {
    calculateMeasurements(droppedItems);
  }, [droppedItems, roomSize.width, roomSize.depth, selectedItemIndex]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CABINET",
    drop: (item, monitor) => {
      const clientOffset = monitor.getClientOffset();
      const dropZoneNode = dropRef.current;
      if (clientOffset && dropZoneNode) {
        const dropZoneRect = dropZoneNode.getBoundingClientRect();
        const x = clientOffset.x - dropZoneRect.left;
        const y = clientOffset.y - dropZoneRect.top;

        const SNAP_THRESHOLD = 20;
        let snappedX = x;
        let snappedY = y;

        // Snap to other cabinets or walls
        droppedItems.forEach(cabinet => {
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
        if (x > dropZoneRect.width - SNAP_THRESHOLD) {
          snappedX = dropZoneRect.width - (item.width || 300);
        }
        if (y < SNAP_THRESHOLD) snappedY = 0;
        if (y > dropZoneRect.height - SNAP_THRESHOLD) {
          snappedY = dropZoneRect.height - (item.height || 600);
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
        finalX = Math.max(0, Math.min(finalX, dropZoneRect.width - itemWidth));
        finalY = Math.max(0, Math.min(finalY, dropZoneRect.height - itemHeight));

        onDrop({
          ...item,
          x: finalX,
          y: finalY,
          rotation: 0,
          width: itemWidth,
          height: itemHeight,
        });
      }
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  const handlePositionChange = (index, position) => {
    const item = droppedItems[index];
    const itemWidth = item.width;
    const itemHeight = item.height;
    const dropZoneNode = dropRef.current;
    if (!dropZoneNode) return;

    let newX = position.x;
    let newY = position.y;
    const SNAP_THRESHOLD = 15;

    // Check for collisions with other cabinets
    for (let i = 0; i < droppedItems.length; i++) {
      if (i === index) continue;

      const otherItem = droppedItems[i];
      const otherItemWidth = otherItem.width;
      const otherItemHeight = otherItem.height;

      // Collision check
      if (
        newX < otherItem.x + otherItemWidth &&
        newX + itemWidth > otherItem.x &&
        newY < otherItem.y + otherItemHeight &&
        newY + itemHeight > otherItem.y
      ) {
        // Collision detected, adjust position
        if (newX < otherItem.x) {
          newX = otherItem.x - itemWidth - SNAP_THRESHOLD / 2;
        } else {
          newX = otherItem.x + otherItemWidth + SNAP_THRESHOLD / 2;
        }
        if (newY < otherItem.y) {
          newY = otherItem.y - itemHeight - SNAP_THRESHOLD / 2;
        } else {
          newY = otherItem.y + otherItemHeight + SNAP_THRESHOLD / 2;
        }
        break;
      }
    }

    // Keep within dropzone boundaries
    if (newX < SNAP_THRESHOLD) newX = 0;
    if (newX > dropZoneNode.offsetWidth - itemWidth - SNAP_THRESHOLD) {
      newX = dropZoneNode.offsetWidth - itemWidth;
    }
    if (newY < SNAP_THRESHOLD) newY = 0;
    if (newY > dropZoneNode.offsetHeight - itemHeight - SNAP_THRESHOLD) {
      newY = dropZoneNode.offsetHeight - itemHeight;
    }

    setDroppedItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        x: newX,
        y: newY
      };
      return updated;
    });
  };

  const handleDrag = (index, data) => {
    const tempItems = [...droppedItems];
    tempItems[index] = { ...tempItems[index], x: data.x, y: data.y };
    // Don't recalculate measurements during drag to improve performance
  };

  // Handle click outside cabinets
  const handleDropZoneClick = (e) => {
    if (e.target === dropRef.current) {
      setSelectedItemIndex(null);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", padding: "10px" }}>
      {/* Horizontal measurements at the top */}
      <div style={{ height: "40px", position: "relative", marginBottom: "10px", borderBottom: "1px solid #ddd" }}>
        {horizontalMeasurements.map((m, i) => (
          <Fragment key={`h-${i}`}>
            <div
              style={{
                position: "absolute",
                left: `${m.from}px`,
                width: `${m.to - m.from}px`,
                height: "20px",
                top: "10px",
                borderTop: "1px solid #666",
                borderLeft: m.type.includes('wall') ? "1px solid #666" : "none",
                borderRight: m.type.includes('wall') ? "1px solid #666" : "none",
                borderColor: "#007bff",
                borderWidth: "2px",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${m.position}px`,
                top: "0",
                transform: 'translateX(-50%)',
                backgroundColor: "#e0f7fa",
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                border: "1px solid #00bcd4",
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                fontWeight: "bold",
              }}
            >
              {m.value}mm
            </div>
          </Fragment>
        ))}
      </div>

      <div
        ref={(node) => {
          drop(node);
          dropRef.current = node;
        }}
        onClick={handleDropZoneClick}
        style={{
          width: "100%",
          height: "500px",
          border: isOver ? "2px dashed #00bfff" : "2px dashed #adb5bd",
          backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden",
          cursor: "default",
        }}
      >
        {/* Vertical measurements on the left side */}
        <div style={{
          position: "absolute",
          left: "0",
          top: "0",
          bottom: "0",
          width: "40px",
          borderRight: "1px solid #ddd",
          zIndex: 0
        }}>
          {verticalMeasurements.map((m, i) => (
            <Fragment key={`v-${i}`}>
              <div
                style={{
                  position: "absolute",
                  top: `${m.from}px`,
                  height: `${m.to - m.from}px`,
                  width: "20px",
                  left: "10px",
                  borderLeft: "1px solid #666",
                  borderTop: m.type.includes('floor') ? "1px solid #666" : "none",
                  borderBottom: m.type.includes('ceiling') ? "1px solid #666" : "none",
                  borderColor: "#007bff",
                  borderWidth: "2px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: `${m.position}px`,
                  left: "25px",
                  transform: 'translateY(-50%) rotate(-90deg)',
                  transformOrigin: 'left center',
                  backgroundColor: "#e0f7fa",
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: "1px solid #00bcd4",
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap',
                  fontWeight: "bold",
                }}
              >
                {m.value}mm
              </div>
            </Fragment>
          ))}
        </div>

        {/* Rest of the drop zone content */}
        {droppedItems.map((item, index) => (
          <Fragment key={item.id || index}>
            <Draggable
              position={{ x: item.x || 0, y: item.y || 0 }}
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
                style={{
                  position: "absolute",
                  cursor: "move",
                  borderRadius: "3px",
                  padding: "2px",
                  boxShadow: selectedItemIndex === index
                    ? "0 0 0 2px #007bff, 0 2px 4px rgba(0,0,0,0.1)"
                    : "0 2px 4px rgba(0,0,0,0.1)",
                  transform: `rotate(${item.rotation}deg)`,
                  zIndex: selectedItemIndex === index ? 10 : 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: selectedItemIndex === index ? "rgba(0, 123, 255, 0.1)" : "transparent",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemIndex(index);
                }}
              >
                {/* Cabinet image and controls */}
                <img
                  src={item.imageSrc}
                  alt={item.name}
                  style={{
                    width: `${item.width}px`,
                    height: `${item.height}px`,
                    objectFit: "contain",
                    display: "block"
                  }}
                />

                {selectedItemIndex === index && (
                  <div style={{
                    position: "absolute",
                    top: "-30px",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px"
                  }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotate(index);
                      }}
                      style={{
                        background: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Rotate 90°"
                    >↻</button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(index);
                      }}
                      style={{
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      title="Remove cabinet"
                    >×</button>
                  </div>
                )}
              </div>
            </Draggable>
          </Fragment>
        ))}
      </div>
    </div>
  );
};


// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();