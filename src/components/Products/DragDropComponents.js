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







// sahi hai magar isme live numbers nhi hai 
// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize,
// }) => {

//   const dropRef = useRef(null);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: "CABINET",
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset(); // page-level offset
//       const dropZoneNode = dropRef.current;

//       if (clientOffset && dropZoneNode) {
//         const dropZoneRect = dropZoneNode.getBoundingClientRect();

//         // Difference from drop zone's top-left corner
//         const x = clientOffset.x - dropZoneRect.left;
//         const y = clientOffset.y - dropZoneRect.top;

//         // Size fallback
//         const itemWidth = item.minWidth || item.width || 300;
//         const itemHeight = item.minDepth || item.height || 600;

//         const dropZoneWidth = dropZoneNode.offsetWidth;
//         const dropZoneHeight = dropZoneNode.offsetHeight;

//         const boundedX = Math.max(0, Math.min(x, dropZoneWidth - itemWidth));
//         const boundedY = Math.max(0, Math.min(y, dropZoneHeight - itemHeight));





//         onDrop({ ...item, x: boundedX, y: boundedY, rotation: 0 });
//       }
//     },


//     collect: (monitor) => ({
//       isOver: !!monitor.isOver(),
//     }),
//   }));

//   const [selectedItemIndex, setSelectedItemIndex] = useState(null);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

//   useEffect(() => {
//     saveNotesToLocalStorage(notesMap);
//   }, [notesMap]);

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
//       saveNotesToLocalStorage(updatedNotes);
//       window.dispatchEvent(new Event("storage"));
//       return updatedNotes;
//     });
//     setModalOpen(false);
//   };

//   const handleCabinetClick = (item) => {
//     if (currentStep === "Add Notes") {
//       setSelectedItem(item);
//       setModalOpen(true);
//     }
//   };

//   const handlePositionChange = (index, position) => {
//     const item = droppedItems[index];
//     const width = parseInt(item.width || item.minWidth || 100);
//     const height = parseInt(item.height || item.minDepth || 100);

//     // Calculate bounded position
//     const boundedX = Math.max(0, Math.min(position.x, roomSize.width - width));
//     const boundedY = Math.max(0, Math.min(position.y, roomSize.depth - height));

//     setDroppedItems((prev) => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: boundedX,
//         y: boundedY,
//       };
//       return updated;
//     });
//   };

//   useEffect(() => {
//     const handleStorageChange = () => {
//       setNotesMap(getNotesFromLocalStorage());
//     };
//     window.addEventListener("storage", handleStorageChange);
//     return () => window.removeEventListener("storage", handleStorageChange);
//   }, []);


//   const selectedDroppedItem = droppedItems[selectedItemIndex];
//   const roomWidth = roomSize?.width || 3000;
//   const roomHeight = roomSize?.depth || 2500;

//   let measurement = {
//     left: 0,
//     width: 0,
//     right: 0,
//     top: 0,
//     height: 0,
//     bottom: 0,
//   };

//   if (selectedDroppedItem && dropRef.current) {
//     const dropZoneWidth = dropRef.current.offsetWidth;
//     const dropZoneHeight = dropRef.current.offsetHeight;

//     const x = parseInt(selectedDroppedItem.x || 0);
//     const y = parseInt(selectedDroppedItem.y || 0);
//     const width = parseInt(selectedDroppedItem.width || selectedDroppedItem.minWidth || 0);
//     const height = parseInt(selectedDroppedItem.height || selectedDroppedItem.minDepth || 0);

//     // Calculate mm per pixel
//     const mmPerPixelX = roomWidth / dropZoneWidth;
//     const mmPerPixelY = roomHeight / dropZoneHeight;

//     measurement = {
//       left: Math.round(x * mmPerPixelX),
//       // width: Math.round(width * mmPerPixelX),
//       width: width,
//       right: Math.max(0, Math.round((dropZoneWidth - (x + width)) * mmPerPixelX)),
//       top: Math.round(y * mmPerPixelY),
//       // height: Math.round(height * mmPerPixelY),
//       height:height,
//       bottom: Math.max(0, Math.round((dropZoneHeight - (y + height)) * mmPerPixelY)),
//     };
//   }


//   return (
//     <div style={{ display: "flex" }}>
//       <AddNotesModal
//         isOpen={isModalOpen && currentStep === "Add Notes"}
//         onClose={() => setModalOpen(false)}
//         onSave={handleSaveNotes}
//         item={selectedItem}
//       />

//       {/* Vertical Text Labels */}
//       {/* <div
//         style={{
//           position: "relative",
//           width: "40px",
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "space-between",
//         }}
//       >
//         <span
//           style={{
//             position: "absolute",
//             top: 0,
//             left: "5px",
//             fontSize: "12px",
//             backgroundColor: "#f5f5f5",
//             padding: "0 5px",
//           }}
//         >
//           {measurement.height}mm
//         </span>
//         <span
//           style={{
//             position: "absolute",
//             bottom: 0,
//             left: "5px",
//             fontSize: "12px",
//             backgroundColor: "#f5f5f5",
//             padding: "0 5px",
//           }}
//         >
//           {measurement.bottom}mm
//         </span>
//         <div
//           style={{
//             borderLeft: "1px solid #ccc",
//             height: "100%",
//           }}
//         />
//       </div> */}

//       <div style={{ width: "100%", position: "relative" }}>
//         {/* Horizontal Measurement Line */}
//         {selectedDroppedItem && (
//           <div
//             style={{
//               position: "relative",
//               height: "30px",
//               width: "75%",
//               marginBottom: "15px",
//             }}
//           >
//             <hr
//               style={{
//                 position: "absolute",
//                 width: "133%",
//                 top: "50%",
//                 borderTop: "2px solid #555",
//               }}
//             />
//             <div
//               style={{
//                 position: "absolute",
//                 top: "0",
//                 width: "100%",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 padding: "0 20px",
//               }}
//             >
//               <span
//                 style={{
//                   fontSize: "12px",
//                   backgroundColor: "#f5f5f5",
//                   padding: "0 5px",
//                 }}
//               >
//                 {measurement.left}mm
//               </span>
//               <span
//                 style={{
//                   fontSize: "12px",
//                   backgroundColor: "#f5f5f5",
//                   padding: "0 5px",
//                 }}
//               >
//                 {measurement.width}mm
//               </span>
//               <span
//                 style={{
//                   fontSize: "12px",
//                   backgroundColor: "#f5f5f5",
//                   padding: "0 5px",
//                 }}
//               >
//                 {measurement.right}mm
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Vertical Measurement Line */}
//         {selectedDroppedItem && (
//           <div
//             style={{
//               position: "absolute",
//               top: "30px",
//               left: "-31px",
//               height: "400px",
//               width: "30px",
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "space-between",
//               zIndex: 2,
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 top: "0",
//                 left: "0",
//                 fontSize: "12px",
//                 backgroundColor: "#f5f5f5",
//                 padding: "0 5px",
//               }}
//             >
//               {measurement.top}mm
//             </div>
//             <div
//               style={{
//                 position: "absolute",
//                 top: "50%",
//                 left: "0",
//                 transform: "translateY(-50%)",
//                 fontSize: "12px",
//                 backgroundColor: "#f5f5f5",
//                 padding: "0 5px",
//               }}
//             >
//               {measurement.height}mm
//             </div>
//             <div
//               style={{
//                 position: "absolute",
//                 bottom: "0",
//                 left: "0",
//                 fontSize: "12px",
//                 backgroundColor: "#f5f5f5",
//                 padding: "0 5px",
//               }}
//             >
//               {measurement.bottom}mm
//             </div>
//             <div
//               style={{
//                 position: "absolute",
//                 top: "0",
//                 left: "14px",
//                 width: "1px",
//                 height: "100%",
//                 backgroundColor: "#ccc",
//               }}
//             />
//           </div>
//         )}

//         {/* Drop Area */}
//         <div
//           ref={(node) => {
//             drop(node);
//             dropRef.current = node;
//           }}
//           style={{
//             width: "100%",
//             height: "400px",
//             border: isOver ? "2px dashed #00bfff" : "2px dashed #ccc",
//             backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
//             position: "relative",
//             padding: "0px",
//           }}
//         >
//           {/* Add a wrapper for all draggable items */}
//           <div
//             style={{
//               position: "absolute",
//               top: 0,
//               left: 0,
//               width: "100%",
//               height: "100%",
//             }}
//           >
//             {droppedItems.map((item, index) => (
//               <Draggable
//                 key={item.id || index}
//                 position={{
//                   x: Math.max(0, Math.min(item.x || 0, roomSize.width - (item.width || item.minWidth || 100))),
//                   y: Math.max(0, Math.min(item.y || 0, roomSize.depth - (item.height || item.minDepth || 100))),
//                 }}
//                 bounds={{
//                   left: 0,
//                   top: 0,
//                   right: dropRef.current?.offsetWidth - (item.width || item.minWidth || 100),
//                   bottom: dropRef.current?.offsetHeight - (item.height || item.minDepth || 100),
//                 }}
//                 onStop={(e, data) => handlePositionChange(index, data)}
//               >
//                 <div
//                   className="cabinet-item"
//                   style={{
//                     position: "absolute",
//                     cursor: "move",
//                     transform: `rotate(${item.rotation}deg)`,
//                     transition: "transform 0.3s ease-in-out",
//                   }}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setSelectedItemIndex(index);
//                   }}
//                 >
//                   <img
//                     src={item?.frontImageSrc || item?.imageSrc}
//                     alt={item.name}
//                     onClick={() => handleCabinetClick(item)}
//                     style={{
//                       width: "100px",
//                       height: "100px",
//                       objectFit: "cover",
//                       border: "1px solid #ccc",
//                       display: "block",
//                       transform: `rotate(${item.rotation}deg)`,
//                       transition: "transform 0.3s ease-in-out",
//                     }}
//                   />
//                   {currentStep === "Top View" && selectedItemIndex === index && (
//                     <>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRotate(index);
//                         }}
//                         style={{
//                           position: "absolute",
//                           bottom: "5px",
//                           left: "5px",
//                           background: "#28a745",
//                           color: "#fff",
//                           border: "none",
//                           borderRadius: "50%",
//                           width: "25px",
//                           height: "25px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         ↻
//                       </button>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onRemove(index);
//                         }}
//                         style={{
//                           position: "absolute",
//                           top: "5px",
//                           right: "5px",
//                           background: "#0dcaf0",
//                           color: "#343a40",
//                           border: "none",
//                           borderRadius: "50%",
//                           width: "20px",
//                           height: "20px",
//                           cursor: "pointer",
//                         }}
//                       >
//                         ×
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </Draggable>
//             ))}
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };


// hai bi shai hai isme line sahi hai magar isme live numbers nhi hia 
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
//   const [measurements, setMeasurements] = useState([]);
//   const [totalWidth, setTotalWidth] = useState(0);

//   // Calculate measurements between cabinets and walls
//   useEffect(() => {
//     if (dropRef.current && droppedItems.length > 0) {
//       const dropZoneWidth = dropRef.current.offsetWidth;
//       const mmPerPixel = roomSize.width / dropZoneWidth;

//       const sortedItems = [...droppedItems].sort((a, b) => a.x - b.x);
//       const newMeasurements = [];
//       let calculatedTotal = 0;

//       // Left wall measurement
//       const leftWallMeasurement = Math.round(sortedItems[0].x * mmPerPixel);
//       if (leftWallMeasurement > 0) {
//         newMeasurements.push({
//           type: 'wall-to-cabinet',
//           value: leftWallMeasurement,
//           position: sortedItems[0].x / 2,
//           from: 0,
//           to: sortedItems[0].x
//         });
//       }
//       calculatedTotal += leftWallMeasurement;

//       // Cabinet measurements and gaps
//       sortedItems.forEach((item, index) => {
//         // Use the actual width from item, not scaled by mmPerPixel
//         const cabinetWidth = item.width; // Directly use the mm value
//         newMeasurements.push({
//           type: 'cabinet-width',
//           value: cabinetWidth,
//           position: item.x + (item.width / mmPerPixel / 2), // Convert back to pixels for positioning
//           from: item.x,
//           to: item.x + (item.width / mmPerPixel) // Convert mm to pixels
//         });
//         calculatedTotal += cabinetWidth;

//         // Gap to next cabinet (if exists)
//         if (index < sortedItems.length - 1) {
//           const nextItem = sortedItems[index + 1];
//           const gapPixels = nextItem.x - (item.x + (item.width / mmPerPixel));
//           const gap = Math.round(gapPixels * mmPerPixel);
//           if (gap > 0) {
//             newMeasurements.push({
//               type: 'cabinet-to-cabinet',
//               value: gap,
//               position: item.x + (item.width / mmPerPixel) + (gapPixels / 2),
//               from: item.x + (item.width / mmPerPixel),
//               to: nextItem.x
//             });
//             calculatedTotal += gap;
//           }
//         }
//       });

//       // Right wall measurement
//       const lastItem = sortedItems[sortedItems.length - 1];
//       const rightWallMeasurement = roomSize.width - Math.round((lastItem.x * mmPerPixel) + lastItem.width);
//       if (rightWallMeasurement > 0) {
//         newMeasurements.push({
//           type: 'cabinet-to-wall',
//           value: rightWallMeasurement,
//           position: lastItem.x + (lastItem.width / mmPerPixel) + ((dropZoneWidth - (lastItem.x + (lastItem.width / mmPerPixel))) / 2),
//           from: lastItem.x + (lastItem.width / mmPerPixel),
//           to: dropZoneWidth
//         });
//         calculatedTotal += rightWallMeasurement;
//       }

//       setMeasurements(newMeasurements);
//       setTotalWidth(calculatedTotal);
//     } else {
//       setMeasurements([]);
//       setTotalWidth(0);
//     }
//   }, [droppedItems, roomSize.width]);

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: "CABINET",
//     drop: (item, monitor) => {
//       const clientOffset = monitor.getClientOffset();
//       const dropZoneNode = dropRef.current;

//       if (clientOffset && dropZoneNode) {
//         const dropZoneRect = dropZoneNode.getBoundingClientRect();
//         const x = clientOffset.x - dropZoneRect.left;
//         const y = clientOffset.y - dropZoneRect.top;

//         // Snap to grid or nearest cabinet
//         const SNAP_THRESHOLD = 20; // pixels
//         let snappedX = x;
//         let snapTarget = null;

//         // Check for snap points (existing cabinet edges)
//         droppedItems.forEach(cabinet => {
//           // Left edge
//           if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x;
//             snapTarget = { type: 'left', cabinet };
//           }
//           // Right edge
//           if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x + cabinet.width;
//             snapTarget = { type: 'right', cabinet };
//           }
//         });

//         // Snap to walls if close
//         if (x < SNAP_THRESHOLD) snappedX = 0;
//         if (x > dropZoneRect.width - SNAP_THRESHOLD) snappedX = dropZoneRect.width - (item.width || 300);

//         const itemWidth = item.minWidth || item.width || 300;
//         const itemHeight = item.minDepth || item.height || 600;

//         // Ensure cabinet doesn't go out of bounds or overlap
//         let boundedX = Math.max(0, Math.min(snappedX, dropZoneRect.width - itemWidth));

//         // Check for overlaps with other cabinets
//         const overlapping = droppedItems.some(cabinet => {
//           return (
//             boundedX < cabinet.x + cabinet.width &&
//             boundedX + itemWidth > cabinet.x
//           );
//         });

//         if (overlapping) {
//           // Find nearest non-overlapping position
//           if (snapTarget) {
//             if (snapTarget.type === 'left') {
//               boundedX = snapTarget.cabinet.x - itemWidth;
//             } else {
//               boundedX = snapTarget.cabinet.x + snapTarget.cabinet.width;
//             }
//           } else {
//             // Find first available spot
//             const sorted = [...droppedItems].sort((a, b) => a.x - b.x);
//             for (let i = 0; i < sorted.length; i++) {
//               const rightEdge = sorted[i].x + sorted[i].width;
//               const gap = (sorted[i + 1]?.x || dropZoneRect.width) - rightEdge;
//               if (gap >= itemWidth) {
//                 boundedX = rightEdge;
//                 break;
//               }
//             }
//           }
//         }

//         onDrop({
//           ...item,
//           x: Math.max(0, boundedX),
//           y: Math.max(0, Math.min(y, dropZoneRect.height - itemHeight)),
//           rotation: 0,
//           width: itemWidth,
//           height: itemHeight
//         });
//       }
//     },
//     collect: (monitor) => ({
//       isOver: !!monitor.isOver(),
//     }),
//   }));

//   const handleCabinetClick = (index) => {
//     setSelectedItemIndex(index);
//     // Calculate and display measurements for just this cabinet
//     const item = droppedItems[index];
//     const dropZoneWidth = dropRef.current.offsetWidth;
//     const mmPerPixel = roomSize.width / dropZoneWidth;

//     const cabinetWidth = Math.round(item.width * mmPerPixel);
//     // alert(`Selected Cabinet: ${cabinetWidth}mm wide`);
//   };

//   const handlePositionChange = (index, position) => {
//     const item = droppedItems[index];
//     const dropZoneNode = dropRef.current;

//     if (!dropZoneNode) return;

//     const itemWidth = item.width;
//     const itemHeight = item.height;

//     // Calculate new position with snapping
//     let newX = position.x;
//     let newY = position.y;

//     // Snap to other cabinets
//     const SNAP_THRESHOLD = 15;
//     droppedItems.forEach((cabinet, i) => {
//       if (i === index) return;

//       // Snap left to right
//       if (Math.abs(newX - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//         newX = cabinet.x + cabinet.width;
//       }
//       // Snap right to left
//       if (Math.abs((newX + itemWidth) - cabinet.x) < SNAP_THRESHOLD) {
//         newX = cabinet.x - itemWidth;
//       }
//     });

//     // Snap to walls
//     if (newX < SNAP_THRESHOLD) newX = 0;
//     if (newX > dropZoneNode.offsetWidth - itemWidth - SNAP_THRESHOLD) {
//       newX = dropZoneNode.offsetWidth - itemWidth;
//     }

//     // Prevent overlapping
//     const overlapping = droppedItems.some((cabinet, i) => {
//       if (i === index) return false;
//       return (
//         newX < cabinet.x + cabinet.width &&
//         newX + itemWidth > cabinet.x
//       );
//     });

//     if (!overlapping) {
//       setDroppedItems(prev => {
//         const updated = [...prev];
//         updated[index] = {
//           ...updated[index],
//           x: newX,
//           y: newY
//         };
//         return updated;
//       });
//     }
//   };

//   return (
//     <div style={{
//       position: "relative",
//       width: "100%",
//       padding: "10px",
//       backgroundColor: "#f8f9fa",
//       borderRadius: "8px"
//     }}>
//       {/* Measurement display */}
//       <div style={{
//         height: "40px",
//         position: "relative",
//         marginBottom: "10px",
//         borderBottom: "1px solid #ddd"
//       }}>
//         {measurements.map((m, i) => (
//           <React.Fragment key={i}>
//             <div style={{
//               position: "absolute",
//               left: `${m.from}px`,
//               width: `${m.to - m.from}px`,
//               height: m.type === 'cabinet-width' ? "30px" : "20px",
//               top: m.type === 'cabinet-width' ? "5px" : "10px",
//               borderTop: "1px solid #666",
//               borderLeft: m.type.includes('wall') ? "1px solid #666" : "none",
//               borderRight: m.type.includes('wall') ? "1px solid #666" : "none"
//             }} />

//             <div style={{
//               position: "absolute",
//               left: `${m.position}px`,
//               top: m.type === 'cabinet-width' ? "35px" : "0",
//               transform: 'translateX(-50%)',
//               backgroundColor: m.type === 'cabinet-width' ? '#007bff' : '#fff',
//               color: m.type === 'cabinet-width' ? '#fff' : '#000',
//               padding: '2px 6px',
//               borderRadius: '4px',
//               fontSize: '12px',
//               border: m.type === 'cabinet-width' ? 'none' : '1px solid #ddd',
//               boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//               whiteSpace: 'nowrap',
//               fontWeight: m.type === 'cabinet-width' ? 'bold' : 'normal'
//             }}>
//               {m.value}mm
//             </div>
//           </React.Fragment>
//         ))}
//       </div>



//       {/* Drop zone */}
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
//         {/* Room outline */}
//         <div style={{
//           position: "absolute",
//           top: "20px",
//           left: "20px",
//           right: "20px",
//           bottom: "20px",
//           border: "1px solid #333",
//           pointerEvents: "none"
//         }} />

//         {/* Render cabinets */}
//         {droppedItems.map((item, index) => (
//           <Draggable
//             key={item.id || index}
//             position={{ x: item.x || 0, y: item.y || 0 }}
//             bounds="parent"
//             onStop={(e, data) => handlePositionChange(index, data)}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 cursor: "move",
//                 border: selectedItemIndex === index ? "2px solid #007bff" : "1px solid #6c757d",
//                 backgroundColor: "#fff",
//                 borderRadius: "3px",
//                 padding: "2px",
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                 transform: `rotate(${item.rotation}deg)`,
//                 zIndex: selectedItemIndex === index ? 10 : 1
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedItemIndex(index);
//                 handleCabinetClick(index);
//               }}
//             >
//               <img
//                 src={item.imageSrc}
//                 alt={item.name}
//                 style={{
//                   width: `${item.width}px`,
//                   height: `${item.height}px`,
//                   objectFit: "contain",
//                   display: "block"
//                 }}
//               />

//               {/* Cabinet dimensions label */}
//               <div style={{
//                 position: "absolute",
//                 bottom: "-25px",
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 backgroundColor: "rgba(0,0,0,0.7)",
//                 color: "#fff",
//                 padding: "2px 6px",
//                 borderRadius: "3px",
//                 fontSize: "12px",
//                 whiteSpace: "nowrap"
//               }}>
//                 {item.width}mm × {item.height}mm
//               </div>

//               {/* Action buttons */}
//               {selectedItemIndex === index && (
//                 <>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRotate(index);
//                     }}
//                     style={{
//                       position: "absolute",
//                       top: "-15px",
//                       left: "50%",
//                       transform: "translateX(-50%)",
//                       background: "#28a745",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "50%",
//                       width: "25px",
//                       height: "25px",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
//                     }}
//                     title="Rotate 90°"
//                   >
//                     ↻
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRemove(index);
//                     }}
//                     style={{
//                       position: "absolute",
//                       top: "-15px",
//                       right: "-15px",
//                       background: "#dc3545",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "50%",
//                       width: "25px",
//                       height: "25px",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
//                     }}
//                     title="Remove cabinet"
//                   >
//                     ×
//                   </button>
//                 </>
//               )}
//             </div>
//           </Draggable>
//         ))}
//       </div>
//     </div>
//   );
// };





// hai bi sahi hai magar maine isme on cick par lagya hai magar isme line cut ho rahi hai 
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
//   const [measurements, setMeasurements] = useState([]);
//   const [totalWidth, setTotalWidth] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggingIndex, setDraggingIndex] = useState(null);

//   const calculateMeasurements = (items) => {
//     if (dropRef.current && items.length > 0) {
//       const dropZoneWidth = dropRef.current.offsetWidth;
//       const mmPerPixel = roomSize.width / dropZoneWidth;

//       const sortedItems = [...items].sort((a, b) => a.x - b.x);
//       const newMeasurements = [];
//       let calculatedTotal = 0;

//       // Left wall to first cabinet
//       const leftWallMeasurement = Math.round(sortedItems[0].x * mmPerPixel);
//       if (leftWallMeasurement > 0) {
//         newMeasurements.push({
//           type: 'wall-to-cabinet',
//           value: leftWallMeasurement,
//           position: sortedItems[0].x / 2,
//           from: 0,
//           to: sortedItems[0].x,
//           itemIndex: 0,
//         });
//         calculatedTotal += leftWallMeasurement;
//       }

//       // Cabinet widths and gaps
//       sortedItems.forEach((item, index) => {
//         const cabinetWidth = item.width;
//         newMeasurements.push({
//           type: 'cabinet-width',
//           value: cabinetWidth,
//           position: item.x + (item.width / mmPerPixel / 2),
//           from: item.x,
//           to: item.x + (item.width / mmPerPixel),
//           itemIndex: index,
//         });
//         calculatedTotal += cabinetWidth;

//         if (index < sortedItems.length - 1) {
//           const nextItem = sortedItems[index + 1];
//           const gapPixels = nextItem.x - (item.x + (item.width / mmPerPixel));
//           const gap = Math.round(gapPixels * mmPerPixel);
//           if (gap > 0) {
//             newMeasurements.push({
//               type: 'cabinet-to-cabinet',
//               value: gap,
//               position: item.x + (item.width / mmPerPixel) + (gapPixels / 2),
//               from: item.x + (item.width / mmPerPixel),
//               to: nextItem.x,
//               itemIndex: index,
//             });
//             calculatedTotal += gap;
//           }
//         }
//       });

//       // Right wall
//       const lastIndex = sortedItems.length - 1;
//       const lastItem = sortedItems[lastIndex];
//       const rightWallMeasurement = roomSize.width - Math.round((lastItem.x * mmPerPixel) + lastItem.width);
//       if (rightWallMeasurement > 0) {
//         newMeasurements.push({
//           type: 'cabinet-to-wall',
//           value: rightWallMeasurement,
//           position: lastItem.x + (lastItem.width / mmPerPixel) + ((dropZoneWidth - (lastItem.x + (lastItem.width / mmPerPixel))) / 2),
//           from: lastItem.x + (lastItem.width / mmPerPixel),
//           to: dropZoneWidth,
//           itemIndex: lastIndex,
//         });
//         calculatedTotal += rightWallMeasurement;
//       }

//       setMeasurements(newMeasurements);
//       setTotalWidth(calculatedTotal);
//     } else {
//       setMeasurements([]);
//       setTotalWidth(0);
//     }
//   };

//   useEffect(() => {
//     calculateMeasurements(droppedItems);
//   }, [droppedItems, roomSize.width]);

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

//         droppedItems.forEach(cabinet => {
//           if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x;
//           }
//           if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x + cabinet.width;
//           }
//         });

//         if (x < SNAP_THRESHOLD) snappedX = 0;
//         if (x > dropZoneRect.width - SNAP_THRESHOLD) {
//           snappedX = dropZoneRect.width - (item.width || 300);
//         }

//         const itemWidth = item.minWidth || item.width || 300;
//         const itemHeight = item.minDepth || item.height || 600;

//         const boundedX = Math.max(0, Math.min(snappedX, dropZoneRect.width - itemWidth));
//         const boundedY = Math.max(0, Math.min(y, dropZoneRect.height - itemHeight));

//         onDrop({
//           ...item,
//           x: boundedX,
//           y: boundedY,
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
//     const dropZoneNode = dropRef.current;
//     if (!dropZoneNode) return;

//     let newX = position.x;
//     const SNAP_THRESHOLD = 15;

//     droppedItems.forEach((cabinet, i) => {
//       if (i === index) return;
//       if (Math.abs(newX - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//         newX = cabinet.x + cabinet.width;
//       }
//       if (Math.abs((newX + itemWidth) - cabinet.x) < SNAP_THRESHOLD) {
//         newX = cabinet.x - itemWidth;
//       }
//     });

//     if (newX < SNAP_THRESHOLD) newX = 0;
//     if (newX > dropZoneNode.offsetWidth - itemWidth - SNAP_THRESHOLD) {
//       newX = dropZoneNode.offsetWidth - itemWidth;
//     }

//     setDroppedItems(prev => {
//       const updated = [...prev];
//       updated[index] = { ...updated[index], x: newX, y: position.y };
//       return updated;
//     });
//   };

//   const handleDrag = (index, data) => {
//     const tempItems = [...droppedItems];
//     tempItems[index] = { ...tempItems[index], x: data.x };
//     calculateMeasurements(tempItems);
//   };

//   return (
//     <div style={{ position: "relative", width: "100%", padding: "10px" }}>
//       <div style={{ height: "40px", position: "relative", marginBottom: "10px", borderBottom: "1px solid #ddd" }}>
//         {measurements
//           .filter((m) => selectedItemIndex !== null && m.itemIndex === selectedItemIndex)
//           .map((m, i) => (
//             <React.Fragment key={i}>
//               <div style={{
//                 position: "absolute",
//                 left: `${m.from}px`,
//                 width: `${m.to - m.from}px`,
//                 height: "20px",
//                 top: "10px",
//                 borderTop: "1px solid #666",
//                 borderLeft: m.type.includes('wall') ? "1px solid #666" : "none",
//                 borderRight: m.type.includes('wall') ? "1px solid #666" : "none"
//               }} />
//               <div style={{
//                 position: "absolute",
//                 left: `${m.position}px`,
//                 top: "0",
//                 transform: 'translateX(-50%)',
//                 backgroundColor: '#fff',
//                 padding: '2px 6px',
//                 borderRadius: '4px',
//                 fontSize: '12px',
//                 border: '1px solid #ddd',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                 whiteSpace: 'nowrap'
//               }}>
//                 {m.value}mm
//               </div>
//             </React.Fragment>
//           ))}
//       </div>

//       <div style={{
//         textAlign: "center",
//         marginBottom: "10px",
//         fontWeight: "bold",
//         color: Math.abs(totalWidth - roomSize.width) > 1 ? "#dc3545" : "#28a745"
//       }}>
//         Total Width: {totalWidth}mm / {roomSize.width}mm
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
//         <div style={{
//           position: "absolute",
//           top: "20px",
//           left: "20px",
//           right: "20px",
//           bottom: "20px",
//           border: "1px solid #333",
//           pointerEvents: "none"
//         }} />

//         {droppedItems.map((item, index) => (
//           <Draggable
//             key={item.id || index}
//             position={{ x: item.x || 0, y: item.y || 0 }}
//             bounds="parent"
//             onStart={() => {
//               setIsDragging(true);
//               setDraggingIndex(index);
//             }}
//             onDrag={(e, data) => handleDrag(index, data)}
//             onStop={(e, data) => {
//               setIsDragging(false);
//               setDraggingIndex(null);
//               handlePositionChange(index, data);
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 cursor: "move",
//                 border: selectedItemIndex === index ? "2px solid #007bff" : "1px solid #6c757d",
//                 backgroundColor: "#fff",
//                 borderRadius: "3px",
//                 padding: "2px",
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                 transform: `rotate(${item.rotation}deg)`,
//                 zIndex: selectedItemIndex === index ? 10 : 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center"
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedItemIndex(index);
//               }}
//             >
//               <img
//                 src={item.imageSrc}
//                 alt={item.name}
//                 style={{
//                   width: `${item.width}px`,
//                   height: `${item.height}px`,
//                   objectFit: "contain",
//                   display: "block"
//                 }}
//               />

//               {selectedItemIndex === index && (
//                 <div style={{
//                   position: "absolute",
//                   top: "-30px",
//                   width: "100%",
//                   display: "flex",
//                   justifyContent: "center",
//                   gap: "10px"
//                 }}>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRotate(index);
//                     }}
//                     style={{
//                       background: "#28a745",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "50%",
//                       width: "25px",
//                       height: "25px",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center"
//                     }}
//                     title="Rotate 90°"
//                   >↻</button>

//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRemove(index);
//                     }}
//                     style={{
//                       background: "#dc3545",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "50%",
//                       width: "25px",
//                       height: "25px",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center"
//                     }}
//                     title="Remove cabinet"
//                   >×</button>
//                 </div>
//               )}
//             </div>
//           </Draggable>
//         ))}
//       </div>
//     </div>
//   );
// };


// isme sari calculation sahi hai magar ek hi line mein sari calculations hai 
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
//   const [measurements, setMeasurements] = useState([]);
//   const [totalWidth, setTotalWidth] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggingIndex, setDraggingIndex] = useState(null);
//   const [tempPosition, setTempPosition] = useState(null);

//   // Calculate measurements between cabinets and walls
//   const calculateMeasurements = (items) => {
//     if (dropRef.current && items.length > 0) {
//       const dropZoneWidth = dropRef.current.offsetWidth;
//       const mmPerPixel = roomSize.width / dropZoneWidth;

//       const sortedItems = [...items].sort((a, b) => a.x - b.x);
//       const newMeasurements = [];
//       let calculatedTotal = 0;

//       // Left wall measurement
//       const leftWallMeasurement = Math.round(sortedItems[0].x * mmPerPixel);
//       if (leftWallMeasurement > 0) {
//         newMeasurements.push({
//           type: 'wall-to-cabinet',
//           value: leftWallMeasurement,
//           position: sortedItems[0].x / 2,
//           from: 0,
//           to: sortedItems[0].x
//         });
//       }
//       calculatedTotal += leftWallMeasurement;

//       // Cabinet measurements and gaps
//       sortedItems.forEach((item, index) => {
//         // Cabinet width measurement
//         const cabinetWidth = item.width;
//         newMeasurements.push({
//           type: 'cabinet-width',
//           value: cabinetWidth,
//           position: item.x + (item.width / mmPerPixel / 2),
//           from: item.x,
//           to: item.x + (item.width / mmPerPixel)
//         });
//         calculatedTotal += cabinetWidth;

//         // Gap to next cabinet (if exists)
//         if (index < sortedItems.length - 1) {
//           const nextItem = sortedItems[index + 1];
//           const gapPixels = nextItem.x - (item.x + (item.width / mmPerPixel));
//           const gap = Math.round(gapPixels * mmPerPixel);
//           if (gap > 0) {
//             newMeasurements.push({
//               type: 'cabinet-to-cabinet',
//               value: gap,
//               position: item.x + (item.width / mmPerPixel) + (gapPixels / 2),
//               from: item.x + (item.width / mmPerPixel),
//               to: nextItem.x
//             });
//             calculatedTotal += gap;
//           }
//         }
//       });

//       // Right wall measurement
//       const lastItem = sortedItems[sortedItems.length - 1];
//       const rightWallMeasurement = roomSize.width - Math.round((lastItem.x * mmPerPixel) + lastItem.width);
//       if (rightWallMeasurement > 0) {
//         newMeasurements.push({
//           type: 'cabinet-to-wall',
//           value: rightWallMeasurement,
//           position: lastItem.x + (lastItem.width / mmPerPixel) + ((dropZoneWidth - (lastItem.x + (lastItem.width / mmPerPixel))) / 2),
//           from: lastItem.x + (lastItem.width / mmPerPixel),
//           to: dropZoneWidth
//         });
//         calculatedTotal += rightWallMeasurement;
//       }

//       setMeasurements(newMeasurements);
//       setTotalWidth(calculatedTotal);
//     } else {
//       setMeasurements([]);
//       setTotalWidth(0);
//     }
//   };

//   useEffect(() => {
//     calculateMeasurements(droppedItems);
//   }, [droppedItems, roomSize.width]);

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
//         let snapTarget = null;

//         // Snap logic
//         droppedItems.forEach(cabinet => {
//           if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x;
//             snapTarget = { type: 'left', cabinet };
//           }
//           if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x + cabinet.width;
//             snapTarget = { type: 'right', cabinet };
//           }
//         });

//         if (x < SNAP_THRESHOLD) snappedX = 0;
//         if (x > dropZoneRect.width - SNAP_THRESHOLD) snappedX = dropZoneRect.width - (item.width || 300);

//         const itemWidth = item.minWidth || item.width || 300;
//         const itemHeight = item.minDepth || item.height || 600;

//         let boundedX = Math.max(0, Math.min(snappedX, dropZoneRect.width - itemWidth));
//         let boundedY = Math.max(0, Math.min(y, dropZoneRect.height - itemHeight));

//         onDrop({
//           ...item,
//           x: boundedX,
//           y: boundedY,
//           rotation: 0,
//           width: itemWidth,
//           height: itemHeight
//         });
//       }
//     },
//     collect: (monitor) => ({
//       isOver: !!monitor.isOver(),
//     }),
//   }));

//   const handlePositionChange = (index, position) => {
//     const item = droppedItems[index];
//     const dropZoneNode = dropRef.current;

//     if (!dropZoneNode) return;

//     const itemWidth = item.width;
//     const itemHeight = item.height;

//     let newX = position.x;
//     let newY = position.y;

//     // Snap logic during drag
//     const SNAP_THRESHOLD = 15;
//     droppedItems.forEach((cabinet, i) => {
//       if (i === index) return;
//       if (Math.abs(newX - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//         newX = cabinet.x + cabinet.width;
//       }
//       if (Math.abs((newX + itemWidth) - cabinet.x) < SNAP_THRESHOLD) {
//         newX = cabinet.x - itemWidth;
//       }
//     });

//     if (newX < SNAP_THRESHOLD) newX = 0;
//     if (newX > dropZoneNode.offsetWidth - itemWidth - SNAP_THRESHOLD) {
//       newX = dropZoneNode.offsetWidth - itemWidth;
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
//   };

//   const handleDrag = (index, data) => {
//     const tempItems = [...droppedItems];
//     tempItems[index] = { ...tempItems[index], x: data.x };
//     calculateMeasurements(tempItems);
//   };

//   return (
//     <div style={{ 
//       position: "relative", 
//       width: "100%",
//       padding: "10px",
//       backgroundColor: "#f8f9fa",
//       borderRadius: "8px"
//     }}>
//       {/* Measurement display - Horizontal only */}
//       <div style={{ 
//         height: "40px", 
//         position: "relative", 
//         marginBottom: "10px",
//         borderBottom: "1px solid #ddd"
//       }}>
//         {measurements.map((m, i) => (
//           <React.Fragment key={i}>
//             {/* Measurement line */}
//             <div style={{
//               position: "absolute",
//               left: `${m.from}px`,
//               width: `${m.to - m.from}px`,
//               height: "20px",
//               top: "10px",
//               borderTop: "1px solid #666",
//               borderLeft: m.type.includes('wall') ? "1px solid #666" : "none",
//               borderRight: m.type.includes('wall') ? "1px solid #666" : "none"
//             }} />

//             {/* Measurement label */}
//             <div 
//               style={{
//                 position: "absolute",
//                 left: `${m.position}px`,
//                 top: "0",
//                 transform: 'translateX(-50%)',
//                 backgroundColor: '#fff',
//                 padding: '2px 6px',
//                 borderRadius: '4px',
//                 fontSize: '12px',
//                 border: '1px solid #ddd',
//                 boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                 whiteSpace: 'nowrap'
//               }}
//             >
//               {m.value}mm
//             </div>
//           </React.Fragment>
//         ))}
//       </div>

//       {/* Total width display */}
//       <div style={{ 
//         textAlign: "center", 
//         marginBottom: "10px",
//         fontWeight: "bold",
//         color: Math.abs(totalWidth - roomSize.width) > 1 ? "#dc3545" : "#28a745"
//       }}>
//         Total Width: {totalWidth}mm / {roomSize.width}mm
//         {Math.abs(totalWidth - roomSize.width) > 1 && (
//           <span style={{ color: "#dc3545", marginLeft: "10px" }}>
//             ({totalWidth > roomSize.width ? "Exceeds" : "Under"} by {Math.abs(totalWidth - roomSize.width)}mm)
//           </span>
//         )}
//       </div>

//       {/* Drop zone */}
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
//         {/* Room outline */}
//         <div style={{
//           position: "absolute",
//           top: "20px",
//           left: "20px",
//           right: "20px",
//           bottom: "20px",
//           border: "1px solid #333",
//           pointerEvents: "none"
//         }} />

//         {/* Render cabinets */}
//         {droppedItems.map((item, index) => (
//           <Draggable
//             key={item.id || index}
//             position={{ x: item.x || 0, y: item.y || 0 }}
//             bounds="parent"
//             onStart={() => {
//               setIsDragging(true);
//               setDraggingIndex(index);
//             }}
//             onDrag={(e, data) => handleDrag(index, data)}
//             onStop={(e, data) => {
//               setIsDragging(false);
//               setDraggingIndex(null);
//               handlePositionChange(index, data);
//             }}
//           >
//             <div
//               style={{
//                 position: "absolute",
//                 cursor: "move",
//                 border: selectedItemIndex === index ? "2px solid #007bff" : "1px solid #6c757d",
//                 backgroundColor: "#fff",
//                 borderRadius: "3px",
//                 padding: "2px",
//                 boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
//                 transform: `rotate(${item.rotation}deg)`,
//                 zIndex: selectedItemIndex === index ? 10 : 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center"
//               }}
//               onClick={(e) => {
//                 e.stopPropagation();
//                 setSelectedItemIndex(index);
//               }}
//             >
//               <img
//                 src={item.imageSrc}
//                 alt={item.name}
//                 style={{
//                   width: `${item.width}px`,
//                   height: `${item.height}px`,
//                   objectFit: "contain",
//                   display: "block"
//                 }}
//               />

//               {/* Action buttons */}
//               {selectedItemIndex === index && (
//                 <div style={{
//                   position: "absolute",
//                   top: "-30px",
//                   width: "100%",
//                   display: "flex",
//                   justifyContent: "center",
//                   gap: "10px"
//                 }}>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRotate(index);
//                     }}
//                     style={{
//                       background: "#28a745",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "50%",
//                       width: "25px",
//                       height: "25px",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
//                     }}
//                     title="Rotate 90°"
//                   >
//                     ↻
//                   </button>
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onRemove(index);
//                     }}
//                     style={{
//                       background: "#dc3545",
//                       color: "#fff",
//                       border: "none",
//                       borderRadius: "50%",
//                       width: "25px",
//                       height: "25px",
//                       cursor: "pointer",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
//                     }}
//                     title="Remove cabinet"
//                   >
//                     ×
//                   </button>
//                 </div>
//               )}
//             </div>
//           </Draggable>
//         ))}
//       </div>
//     </div>
//   );
// };





//gemini testing only width line showing
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
//   const [measurements, setMeasurements] = useState([]);
//   const [totalWidth, setTotalWidth] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [draggingIndex, setDraggingIndex] = useState(null);

//   const calculateMeasurements = (items) => {
//     if (dropRef.current && items.length > 0) {
//       const dropZoneWidth = dropRef.current.offsetWidth;
//       const mmPerPixel = roomSize.width / dropZoneWidth;
//       const sortedItems = [...items].sort((a, b) => a.x - b.x);
//       const newMeasurements = [];
//       let calculatedTotal = 0;

//       // Left wall to first cabinet
//       if (sortedItems.length > 0) {
//         const leftWallMeasurement = Math.round(sortedItems[0].x * mmPerPixel);
//         if (leftWallMeasurement > 0) {
//           newMeasurements.push({
//             type: 'wall-to-cabinet',
//             value: leftWallMeasurement,
//             position: sortedItems[0].x / 2,
//             from: 0,
//             to: sortedItems[0].x,
//             itemIndex: 0,
//           });
//           calculatedTotal += leftWallMeasurement;
//         }
//       }

//       // Cabinet widths and gaps
//       sortedItems.forEach((item, index) => {
//         const cabinetWidth = item.width;
//         newMeasurements.push({
//           type: 'cabinet-width',
//           value: cabinetWidth,
//           position: item.x + (item.width / mmPerPixel / 2),
//           from: item.x,
//           to: item.x + (item.width / mmPerPixel),
//           itemIndex: index,
//         });
//         calculatedTotal += cabinetWidth;

//         if (index < sortedItems.length - 1) {
//           const nextItem = sortedItems[index + 1];
//           const gapPixels = nextItem.x - (item.x + (item.width / mmPerPixel));
//           const gap = Math.round(gapPixels * mmPerPixel);
//           if (gap > 0) {
//             newMeasurements.push({
//               type: 'cabinet-to-cabinet',
//               value: gap,
//               position: item.x + (item.width / mmPerPixel) + (gapPixels / 2),
//               from: item.x + (item.width / mmPerPixel),
//               to: nextItem.x,
//               itemIndex: index,
//             });
//             calculatedTotal += gap;
//           }
//         }
//       });

//       // Right wall
//       if (sortedItems.length > 0) {
//         const lastIndex = sortedItems.length - 1;
//         const lastItem = sortedItems[lastIndex];
//         const rightWallMeasurement = roomSize.width - Math.round((lastItem.x * mmPerPixel) + lastItem.width);
//         if (rightWallMeasurement > 0) {
//           newMeasurements.push({
//             type: 'cabinet-to-wall',
//             value: rightWallMeasurement,
//             position: lastItem.x + (lastItem.width / mmPerPixel) + ((dropZoneWidth - (lastItem.x + (lastItem.width / mmPerPixel))) / 2),
//             from: lastItem.x + (lastItem.width / mmPerPixel),
//             to: dropZoneWidth,
//             itemIndex: lastIndex,
//           });
//           calculatedTotal += rightWallMeasurement;
//         }
//       }

//       setMeasurements(newMeasurements);
//       setTotalWidth(calculatedTotal);
//     } else {
//       setMeasurements([]);
//       setTotalWidth(0);
//     }
//   };

//   useEffect(() => {
//     calculateMeasurements(droppedItems);
//   }, [droppedItems, roomSize.width]);

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
//         let snappedY = 0; // Force Y position to top (no vertical stacking)

//         // Snap to other cabinets or walls
//         droppedItems.forEach(cabinet => {
//           if (Math.abs(x - cabinet.x) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x;
//           }
//           if (Math.abs(x - (cabinet.x + cabinet.width)) < SNAP_THRESHOLD) {
//             snappedX = cabinet.x + cabinet.width;
//           }
//         });

//         // Snap to walls
//         if (x < SNAP_THRESHOLD) snappedX = 0;
//         if (x > dropZoneRect.width - SNAP_THRESHOLD) {
//           snappedX = dropZoneRect.width - (item.width || 300);
//         }

//         const itemWidth = item.minWidth || item.width || 300;
//         const itemHeight = item.minDepth || item.height || 600;

//         // Prevent overlapping with other cabinets
//         let finalX = snappedX;
//         for (const cabinet of droppedItems) {
//           if (
//             finalX < cabinet.x + cabinet.width &&
//             finalX + itemWidth > cabinet.x
//           ) {
//             // Collision detected, move to the right of the existing cabinet
//             finalX = cabinet.x + cabinet.width;
//           }
//         }

//         // Ensure we stay within bounds
//         finalX = Math.max(0, Math.min(finalX, dropZoneRect.width - itemWidth));

//         onDrop({
//           ...item,
//           x: finalX,
//           y: snappedY, // Always place at top (y=0)
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
//     const dropZoneNode = dropRef.current;
//     if (!dropZoneNode) return;

//     let newX = position.x;
//     const SNAP_THRESHOLD = 15;

//     // Check for collisions with other cabinets
//     for (let i = 0; i < droppedItems.length; i++) {
//       if (i === index) continue;

//       const otherItem = droppedItems[i];
//       const otherItemWidth = otherItem.width;

//       // Horizontal collision check
//       if (
//         newX < otherItem.x + otherItemWidth &&
//         newX + itemWidth > otherItem.x
//       ) {
//         // Collision detected, adjust position
//         if (newX < otherItem.x) {
//           newX = otherItem.x - itemWidth - SNAP_THRESHOLD / 2;
//         } else {
//           newX = otherItem.x + otherItemWidth + SNAP_THRESHOLD / 2;
//         }
//         break;
//       }
//     }

//     // Keep within dropzone boundaries
//     if (newX < SNAP_THRESHOLD) newX = 0;
//     if (newX > dropZoneNode.offsetWidth - itemWidth - SNAP_THRESHOLD) {
//       newX = dropZoneNode.offsetWidth - itemWidth;
//     }

//     setDroppedItems(prev => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: newX,
//         y: 0 // Force Y position to 0 (no vertical stacking)
//       };
//       return updated;
//     });

//     calculateMeasurements(droppedItems);
//   };

//   const handleDrag = (index, data) => {
//     const tempItems = [...droppedItems];
//     tempItems[index] = { ...tempItems[index], x: data.x, y: 0 };
//     calculateMeasurements(tempItems);
//   };

//   return (
//     <div style={{ position: "relative", width: "100%", padding: "10px" }}>
//       <div style={{ height: "40px", position: "relative", marginBottom: "10px", borderBottom: "1px solid #ddd" }}>
//         {measurements.map((m, i) => (
//           <Fragment key={i}>
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

//       {/* <div
//         style={{
//           textAlign: "center",
//           marginBottom: "10px",
//           fontWeight: "bold",
//           color: Math.abs(totalWidth - roomSize.width) > 1 ? "#dc3545" : "#28a745"
//         }}
//       >
//         Total Width: {totalWidth}mm / {roomSize.width}mm
//       </div> */}

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
//         <div style={{
//           position: "absolute",
//           top: "20px",
//           left: "20px",
//           right: "20px",
//           bottom: "20px",
//           // border: "1px solid #333",
//           pointerEvents: "none"
//         }} />

//         {droppedItems.map((item, index) => (
//           <Fragment key={item.id || index}>
//             {/* Vertical lines showing cabinet boundaries */}
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 bottom: 0,
//                 left: `${item.x}px`,
//                 width: "1px",
//                 backgroundColor: "rgba(0, 0, 0, 0.2)",
//                 zIndex: 0,
//               }}
//             />
//             <div
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 bottom: 0,
//                 left: `${item.x + item.width}px`,
//                 width: "1px",
//                 backgroundColor: "rgba(0, 0, 0, 0.2)",
//                 zIndex: 0,
//               }}
//             />

//             <Draggable
//               position={{ x: item.x || 0, y: 0 }}
//               bounds="parent"
//               axis="x"
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
//                   // border: selectedItemIndex === index ? "2px solid #007bff" : "1px solid #6c757d",
//                   // backgroundColor: "#fff",
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


// showing height and width ******

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

      // Sort items by x position for horizontal measurements
      const sortedItems = [...items].sort((a, b) => a.x - b.x);

      // Calculate horizontal measurements (width)
      const newHorizontalMeasurements = [];
      let calculatedTotalWidth = 0;

      // Left wall to first cabinet
      if (sortedItems.length > 0) {
        const leftWallMeasurement = Math.round(sortedItems[0].x * mmPerPixelWidth);
        if (leftWallMeasurement > 0) {
          newHorizontalMeasurements.push({
            type: 'wall-to-cabinet',
            value: leftWallMeasurement,
            position: sortedItems[0].x / 2,
            from: 0,
            to: sortedItems[0].x,
            itemIndex: 0,
          });
          calculatedTotalWidth += leftWallMeasurement;
        }
      }

      // Cabinet widths and gaps
      sortedItems.forEach((item, index) => {
        const cabinetWidth = item.width;
        newHorizontalMeasurements.push({
          type: 'cabinet-width',
          value: cabinetWidth,
          position: item.x + (item.width / mmPerPixelWidth / 2),
          from: item.x,
          to: item.x + (item.width / mmPerPixelWidth),
          itemIndex: index,
        });
        calculatedTotalWidth += cabinetWidth;

        if (index < sortedItems.length - 1) {
          const nextItem = sortedItems[index + 1];
          const gapPixels = nextItem.x - (item.x + (item.width / mmPerPixelWidth));
          const gap = Math.round(gapPixels * mmPerPixelWidth);
          if (gap > 0) {
            newHorizontalMeasurements.push({
              type: 'cabinet-to-cabinet',
              value: gap,
              position: item.x + (item.width / mmPerPixelWidth) + (gapPixels / 2),
              from: item.x + (item.width / mmPerPixelWidth),
              to: nextItem.x,
              itemIndex: index,
            });
            calculatedTotalWidth += gap;
          }
        }
      });

      // Right wall
      if (sortedItems.length > 0) {
        const lastIndex = sortedItems.length - 1;
        const lastItem = sortedItems[lastIndex];
        const rightWallMeasurement = roomSize.width - Math.round((lastItem.x * mmPerPixelWidth) + lastItem.width);
        if (rightWallMeasurement > 0) {
          newHorizontalMeasurements.push({
            type: 'cabinet-to-wall',
            value: rightWallMeasurement,
            position: lastItem.x + (lastItem.width / mmPerPixelWidth) + ((dropZoneWidth - (lastItem.x + (lastItem.width / mmPerPixelWidth))) / 2),
            from: lastItem.x + (lastItem.width / mmPerPixelWidth),
            to: dropZoneWidth,
            itemIndex: lastIndex,
          });
          calculatedTotalWidth += rightWallMeasurement;
        }
      }

      setHorizontalMeasurements(newHorizontalMeasurements);
      setTotalWidth(calculatedTotalWidth);

      // Calculate vertical measurements (depth/height)
      const newVerticalMeasurements = [];
      let calculatedTotalDepth = 0;

      // For each cabinet, calculate floor-to-cabinet and cabinet height measurements
      items.forEach((item, index) => {
        const cabinetHeight = item.height;

        // Floor to bottom of cabinet
        const floorToCabinet = Math.round(item.y * mmPerPixelHeight);
        if (floorToCabinet > 0) {
          newVerticalMeasurements.push({
            type: 'floor-to-cabinet',
            value: floorToCabinet,
            position: item.y / 2,
            from: 0,
            to: item.y,
            itemIndex: index,
            vertical: true
          });
          calculatedTotalDepth += floorToCabinet;
        }

        // Cabinet height
        newVerticalMeasurements.push({
          type: 'cabinet-height',
          value: cabinetHeight,
          position: item.y + (cabinetHeight / mmPerPixelHeight / 2),
          from: item.y,
          to: item.y + (cabinetHeight / mmPerPixelHeight),
          itemIndex: index,
          vertical: true
        });
        calculatedTotalDepth += cabinetHeight;

        // Ceiling space (top of cabinet to ceiling)
        const ceilingSpace = roomSize.depth - Math.round((item.y * mmPerPixelHeight) + cabinetHeight);
        if (ceilingSpace > 0) {
          newVerticalMeasurements.push({
            type: 'cabinet-to-ceiling',
            value: ceilingSpace,
            position: item.y + (cabinetHeight / mmPerPixelHeight) + ((dropZoneHeight - (item.y + (cabinetHeight / mmPerPixelHeight))) / 2),
            from: item.y + (cabinetHeight / mmPerPixelHeight),
            to: dropZoneHeight,
            itemIndex: index,
            vertical: true
          });
          calculatedTotalDepth += ceilingSpace;
        }
      });

      setVerticalMeasurements(newVerticalMeasurements);
      setTotalDepth(calculatedTotalDepth);
    } else {
      setHorizontalMeasurements([]);
      setVerticalMeasurements([]);
      setTotalWidth(0);
      setTotalDepth(0);
    }
  };

  useEffect(() => {
    calculateMeasurements(droppedItems);
  }, [droppedItems, roomSize.width, roomSize.depth]);

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

    calculateMeasurements(droppedItems);
  };

  const handleDrag = (index, data) => {
    const tempItems = [...droppedItems];
    tempItems[index] = { ...tempItems[index], x: data.x, y: data.y };
    calculateMeasurements(tempItems);
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
                borderColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#007bff" : "#666",
                borderWidth: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "2px" : "1px",
                zIndex: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? 1 : 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${m.position}px`,
                top: "0",
                transform: 'translateX(-50%)',
                backgroundColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#e0f7fa" : "#fff",
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                border: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "1px solid #00bcd4" : "1px solid #ddd",
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
                fontWeight: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "bold" : "normal",
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
        style={{
          width: "100%",
          height: "500px",
          border: isOver ? "2px dashed #00bfff" : "2px dashed #adb5bd",
          backgroundColor: isOver ? "#e6f7ff" : "#f9f9f9",
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden"
        }}
      >
        {/* Vertical measurements on the left side */}
        <div style={{
          position: "absolute",
          left: "50",
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
                  borderColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#007bff" : "#666",
                  borderWidth: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "2px" : "1px",
                  zIndex: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? 1 : 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: `${m.position}px`,
                  left: "25px",
                  transform: 'translateY(-50%) rotate(-90deg)',
                  transformOrigin: 'left center',
                  backgroundColor: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "#e0f7fa" : "#fff",
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  border: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "1px solid #00bcd4" : "1px solid #ddd",
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap',
                  fontWeight: selectedItemIndex !== null && m.itemIndex === selectedItemIndex ? "bold" : "normal",
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
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transform: `rotate(${item.rotation}deg)`,
                  zIndex: selectedItemIndex === index ? 10 : 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
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