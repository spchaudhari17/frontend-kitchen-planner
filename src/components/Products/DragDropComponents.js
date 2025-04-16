import React, { useState, useEffect } from "react";
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
export const DraggableCabinet = ({  name, 
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
      frontImageSrc:cabinateFrontImage,
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



//height and width showing for testing
// export const DropZone = ({ onDrop, droppedItems, setDroppedItems, roomSize }) => {
//   console.log("roomSize", roomSize)
//   const roomWidth = roomSize.width || 3000;  // mm
//   const roomHeight = roomSize.depth || 2500; // mm

//   const [{ isOver }, drop] = useDrop(() => ({
//     accept: "CABINET",
//     drop: (item, monitor) => {
//       const offset = monitor.getSourceClientOffset();
//       if (offset) {
//         const x = Math.max(0, Math.min(offset.x, roomWidth - item.width));
//         const y = Math.max(0, Math.min(offset.y, roomHeight - item.height));
//         onDrop({ ...item, x, y, rotation: 0 });
//       }
//     },
//     collect: (monitor) => ({
//       isOver: !!monitor.isOver(),
//     }),
//   }));

//   const handlePositionChange = (index, position) => {
//     const cabinetWidth = droppedItems[index].width || 300;
//     const cabinetHeight = droppedItems[index].height || 600;

//     const clampedX = Math.max(0, Math.min(position.x, roomWidth - cabinetWidth));
//     const clampedY = Math.max(0, Math.min(position.y, roomHeight - cabinetHeight));

//     setDroppedItems((prev) => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: clampedX,
//         y: clampedY,
//       };
//       return updated;
//     });
//   };

//   return (
//     <div style={{ fontFamily: "sans-serif", padding: "10px" }}>
//       <div
//         style={{
//           marginBottom: "15px",
//           fontWeight: "bold",
//           fontSize: "16px",
//           color: "#7c9153",
//         }}
//       >
//         Room Size: {roomWidth}mm (W) × {roomHeight}mm (H)
//       </div>

//       <div
//         ref={drop}
//         style={{
//           width: "100%",
//           height: `${roomHeight}px`,
//           border: isOver ? "2px dashed #8fcf89" : "2px dashed #ccc",
//           backgroundColor: "#f8f8f8",
//           position: "relative",
//           overflow: "hidden",
//         }}
//       >
//         {droppedItems.map((item, index) => {
//           const left = Math.round(Number(item.x) || 0);
//           const top = Math.round(Number(item.y) || 0);
//           const width = Number(item.width) || 300;
//           const height = Number(item.height) || 600;

//           const rightEdge = left + width;
//           const bottomEdge = top + height;

//           const remainingRight = Math.max(0, roomWidth - rightEdge);
//           const remainingBottom = Math.max(0, roomHeight - bottomEdge);

//           return (
//             <Draggable
//               key={item.id || index}
//               position={{ x: left, y: top }}
//               bounds={{
//                 left: 0,
//                 right: roomWidth - width,
//                 top: 0,
//                 bottom: roomHeight - height,
//               }}
//               onStop={(e, data) => handlePositionChange(index, data)}
//             >
//               <div
//                 style={{
//                   position: "absolute",
//                   width: `${width}px`,
//                   height: `${height}px`,
//                   backgroundColor: "#fff",
//                   border: "1px solid #ccc",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   textAlign: "center",
//                   fontSize: "12px",
//                   color: "#7c9153",
//                   padding: "6px",
//                 }}
//               >
//                 <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
//                   {item.name}
//                 </div>
//                 <div>Left: {left}mm</div>
//                 <div>Top: {top}mm</div>
//                 <div>Width: {width}mm</div>
//                 <div>Height: {height}mm</div>
//                 <div>Right Edge: {rightEdge}mm</div>
//                 <div>Bottom Edge: {bottomEdge}mm</div>
//                 <div>Remaining Right: {remainingRight}mm</div>
//                 <div>Remaining Bottom: {remainingBottom}mm</div>
//               </div>
//             </Draggable>
//           );
//         })}
//       </div>
//     </div>
//   );
// };



// export const DropZone = ({
//   onDrop,
//   droppedItems,
//   onRemove,
//   onRotate,
//   currentStep,
//   setDroppedItems,
//   roomSize,
// }) => {
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
//     setDroppedItems((prev) => {
//       const updated = [...prev];
//       updated[index] = {
//         ...updated[index],
//         x: position.x,
//         y: position.y,
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

//   // ✅ Measurement for selected cabinet
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

//   if (selectedDroppedItem) {
//     const x = parseInt(selectedDroppedItem.x || 0);
//     const y = parseInt(selectedDroppedItem.y || 0);
//     const width = parseInt(selectedDroppedItem.width || 0);
//     const height = parseInt(selectedDroppedItem.height || 0);

//     measurement = {
//       left: x,
//       width,
//       right: Math.max(0, roomWidth - (x + width)),
//       top: y,
//       height,
//       bottom: Math.max(0, roomHeight - (y + height)),
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

//       {/* Vertical Measurement */}
//       <div
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
//       </div>

//       <div style={{ width: "100%" }}>
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
//                 width: "100%",
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
//             <Draggable
//               key={item.id || index}
//               position={{ x: item.x || 50, y: item.y || 50 }}
//               bounds="parent"
//               onStop={(e, data) => handlePositionChange(index, data)}
//             >
//               <div
//                 className="cabinet-item"
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

//                 {currentStep === "Base Layout" &&
//                   selectedItemIndex === index && (
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
//               </div>
//             </Draggable>
//           ))}
//         </div>
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
  roomSize,
}) => {
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

  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [notesMap, setNotesMap] = useState(getNotesFromLocalStorage());

  useEffect(() => {
    saveNotesToLocalStorage(notesMap);
  }, [notesMap]);

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
      saveNotesToLocalStorage(updatedNotes);
      window.dispatchEvent(new Event("storage"));
      return updatedNotes;
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
    setDroppedItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        x: position.x,
        y: position.y,
      };
      return updated;
    });
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setNotesMap(getNotesFromLocalStorage());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const selectedDroppedItem = droppedItems[selectedItemIndex];
  const roomWidth = roomSize?.width || 3000;
  const roomHeight = roomSize?.depth || 2500;

  let measurement = {
    left: 0,
    width: 0,
    right: 0,
    top: 0,
    height: 0,
    bottom: 0,
  };

  if (selectedDroppedItem) {
    const x = parseInt(selectedDroppedItem.x || 0);
    const y = parseInt(selectedDroppedItem.y || 0);
    const width = parseInt(selectedDroppedItem.width || 0);
    const height = parseInt(selectedDroppedItem.height || 0);

    measurement = {
      left: x,
      width,
      right: Math.max(0, roomWidth - (x + width)),
      top: y,
      height,
      bottom: Math.max(0, roomHeight - (y + height)),
    };
  }

  return (
    <div style={{ display: "flex" }}>
      <AddNotesModal
        isOpen={isModalOpen && currentStep === "Add Notes"}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNotes}
        item={selectedItem}
      />

      {/* Vertical Text Labels */}
      {/* <div
        style={{
          position: "relative",
          width: "40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 0,
            left: "5px",
            fontSize: "12px",
            backgroundColor: "#f5f5f5",
            padding: "0 5px",
          }}
        >
          {measurement.height}mm
        </span>
        <span
          style={{
            position: "absolute",
            bottom: 0,
            left: "5px",
            fontSize: "12px",
            backgroundColor: "#f5f5f5",
            padding: "0 5px",
          }}
        >
          {measurement.bottom}mm
        </span>
        <div
          style={{
            borderLeft: "1px solid #ccc",
            height: "100%",
          }}
        />
      </div> */}

      <div style={{ width: "100%", position: "relative" }}>
        {/* Horizontal Measurement Line */}
        {selectedDroppedItem && (
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

        {/* Vertical Measurement Line */}
        {selectedDroppedItem && (
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

        {/* Drop Area */}
        <div
          ref={drop}
          style={{
            width: "100%",
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
            <Draggable
              key={item.id || index}
              position={{ x: item.x || 50, y: item.y || 50 }}
              bounds="parent"
              onStop={(e, data) => handlePositionChange(index, data)}
            >
              <div
                className="cabinet-item"
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
                  src={item?.frontImageSrc || item?.imageSrc}
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
                {currentStep === "Base Layout" &&
                  selectedItemIndex === index && (
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
        </div>
      </div>
    </div>
  );
};












// Function to retrieve notes from any file
export const getNotes = () => getNotesFromLocalStorage();