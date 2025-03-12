import React, { useState, useEffect } from "react";
import { Row, Col, Form, Modal } from "react-bootstrap";
import Button from "../ui/Button";
import { axiosPrivate } from "../../api/axios";
import AlertMessage from "../ui/AlertMessage";
import CustomTooltip from "../ui/ToolTip";
import { DraggableCabinet, DropZone, getNotes } from "./DragDropComponents";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";

import { useAuthContext } from "../../context/auth";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";

const ProductList = () => {
  const { auth } = useAuthContext();
  const navigate = useNavigate();

  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  // const handleOpenSavedPlan = () => {
  //   if (auth) {
  //     setCurrentStep("Room Layout");
  //   } else {
  //     navigate("/login");
  //   }
  // };

  const [roomDetails, setRoomDetails] = useState([]);

  const userInfoString = localStorage.getItem("user");
  const userInfo = JSON.parse(userInfoString);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/api/room-details/get-save-user-roomdetails",
        { userId: userInfo._id }
      );

      console.log("Full API Response:", response);
      console.log("Response Data:", response.data);

      if (Array.isArray(response.data.data)) {
        setRoomDetails(response.data.data);
      } else {
        console.error("Unexpected API response format", response.data);
        setRoomDetails([]); // Default empty array if format is wrong
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
      setRoomDetails([]);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, []);

  const handleOpenSavedPlan = () => {
    if (!auth) {
      navigate("/login"); // User not logged in, redirect to login
      return;
    }

    if (roomDetails && roomDetails.length > 0) {
      navigate("/account"); //  Plans exist → Go to Account page
    } else {
      setCurrentStep("Room Layout"); //  No plans → Go to Create Plan
    }
  };

  const [currentStep, setCurrentStep] = useState("Start"); // Tracks the active step
  const [roomSize, setRoomSize] = useState({ width: 3000, depth: 2000 });
  const [description, setDescription] = useState("");
  const [subdescription, setSubdescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [droppedItems, setDroppedItems] = useState([]); // Tracks dropped items
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemDimensions, setItemDimensions] = useState({
    height: "",
    width: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showFrontView, setShowFrontView] = useState(false); // State for front view toggle
  const [showView, setShowView] = useState(false); // New state for showing the div

  const [notes, setNotes] = useState({});

  console.log("droppedItems --- ", droppedItems);

  useEffect(() => {
    setNotes(getNotes());

    //  Listen for storage updates
    const handleStorageChange = () => {
      setNotes(getNotes());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleFrontViewToggle = () => {
    setShowFrontView(!showFrontView);
    setShowView(!showView); // Toggle visibility of the div
  };

  // Function to delete all notes from localStorage
  const handleDeleteAllNotes = () => {
    //  LocalStorage se Notes Delete karega
    localStorage.removeItem("cabinetNotes");
    localStorage.removeItem("droppedCabinets"); // Cabinets bhi delete karne ke liye

    //  Storage Event Trigger karega
    window.dispatchEvent(new Event("storage"));

    //  State ko update karega
    setNotes({});
  };

  const steps = [
    { name: "Start", tooltip: "Start planning your kitchen." },
    { name: "Room Layout", tooltip: "Enter room dimensions and details." },
    { name: "Base Layout", tooltip: "Design the base layout of your kitchen." },
    // {
    //   name: "Wall Layout",
    //   tooltip: "Configure wall layouts for your kitchen.",
    // },
    { name: "Add Notes", tooltip: "Add notes or special instructions." },
    { name: "Review", tooltip: "Review your plan before finalizing." },
  ];

  const handleRoomSizeChange = (name, value) => {
    setRoomSize((prev) => ({ ...prev, [name]: value }));
  };

  // const handleDrop = (item) => {
  //   setDroppedItems((prev) => [...prev, item]);
  // };

  const handleDrop = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleAddToDesign = () => {
    if (!itemDimensions.width || !itemDimensions.height) {
      setAlert({
        open: true,
        message: "Please enter height and width.",
        severity: "error",
      });
      return;
    }
    setDroppedItems((prev) => [
      ...prev,
      { ...selectedItem, ...itemDimensions },
    ]);
    setShowModal(false);
    setItemDimensions({ height: "", width: "" });
  };

  //save room details 
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!roomSize.width || !roomSize.depth || !description || !subdescription) {
      setAlert({
        open: true,
        message: "Please fill out all fields before proceeding.",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("itemDimensions -- ", itemDimensions);

      const response = await axiosPrivate.post(
        "/api/room-details/save-room-details",
        {
          user_id: userInfo._id,
          width: roomSize.width,
          depth: roomSize.depth,
          description,
          subdescription,
          notes,
          droppedItems,
        }
      );

      console.log("response -- ", response);

      if (response.status === 201) {
        setAlert({
          open: true,
          message: "Room details saved successfully!",
          severity: "success",
        });
        setRoomSize({ width: 3000, depth: 2000 });
        setDescription("");
        setSubdescription("");
        setNotes({});
        setDroppedItems([]);
        setCurrentStep("Start"); // Automatically navigate to Base Layout after submission
      }
    } catch (error) {
      setAlert({
        open: true,
        message: "Failed to save room details. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };


  // add to card
  const handleAddToCart = (event) => {
    event.preventDefault();
  
    if (!roomSize.width || !roomSize.depth || !description || !subdescription) {
      setAlert({
        open: true,
        message: "Please fill out all fields before adding to cart.",
        severity: "error",
      });
      return;
    }
  
    // Cart ka data localStorage mein save karna
    const cartData = {
      user_id: userInfo._id,
      width: roomSize.width,
      depth: roomSize.depth,
      description,
      subdescription,
      notes,
      droppedItems,
    };
  
    localStorage.setItem("cartData", JSON.stringify(cartData));
  
    setAlert({
      open: true,
      message: "Room details added to cart successfully!",
      severity: "success",
    });
  };

  const handleRemove = (indexToRemove) => {
    setDroppedItems((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAlertClose = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const renderStepContent = () => {
    // if (currentStep === "Start") {
    //   return (
    //     <div style={{ textAlign: "center", padding: "20px" }}>
    //       <h4>Would You Like to Create a  Plan?</h4>
    //       <p>
    //         Need help visualizing your dream kitchen? Our kitchen planner puts the design power in your hands,
    //         with an incredibly easy-to-use drag-and-drop builder.
    //       </p>
    //       <Row className="justify-content-center">
    //         <Col xs={12} sm={6} md={4} onClick={() => setCurrentStep("Room Layout")} style={{ cursor: "pointer" }}>
    //           <div
    //             style={{
    //               border: "1px solid #ccc",
    //               borderRadius: "5px",
    //               textAlign: "center",
    //               padding: "20px",
    //               margin: "10px",
    //             }}
    //           >
    //             <div
    //               style={{
    //                 backgroundColor: "#000",
    //                 width: "100%",
    //                 height: "150px",
    //                 marginBottom: "10px",
    //                 position: "relative",
    //               }}
    //             >
    //               <div
    //                 style={{
    //                   width: "50px",
    //                   height: "50px",
    //                   backgroundColor: "#fff",
    //                   position: "absolute",
    //                   top: "50%",
    //                   left: "50%",
    //                   transform: "translate(-50%, -50%)",
    //                 }}
    //               ></div>
    //             </div>
    //             <h5>CREATE NEW PLAN</h5>
    //           </div>
    //         </Col>
    //       </Row>
    //     </div>
    //   );
    // }

    // if (currentStep === "Start") {
    //   return (
    //     <div style={{ textAlign: "center", padding: "20px" }}>
    //       <h4>Would You Like to Create a Plan?</h4>
    //       <p>
    //         Need help visualizing your dream kitchen? Our kitchen planner puts the design power in your hands,
    //         with an incredibly easy-to-use drag-and-drop builder.
    //       </p>
    //       <Row className="justify-content-center">
    //         {/* Create New Plan */}
    //         <Col xs={12} sm={6} md={4} onClick={() => setCurrentStep("Room Layout")} style={{ cursor: "pointer" }}>
    //           <div
    //             style={{
    //               border: "1px solid #ccc",
    //               borderRadius: "5px",
    //               textAlign: "center",
    //               padding: "20px",
    //               margin: "10px",
    //             }}
    //           >
    //             <div
    //               style={{
    //                 backgroundColor: "#000",
    //                 width: "100%",
    //                 height: "150px",
    //                 marginBottom: "10px",
    //                 position: "relative",
    //               }}
    //             >
    //               <div
    //                 style={{
    //                   width: "50px",
    //                   height: "50px",
    //                   backgroundColor: "#fff",
    //                   position: "absolute",
    //                   top: "50%",
    //                   left: "50%",
    //                   transform: "translate(-50%, -50%)",
    //                 }}
    //               ></div>
    //             </div>
    //             <h5>CREATE NEW PLAN</h5>
    //           </div>
    //         </Col>

    //         {/* Open Saved Plan */}
    //         <Col xs={12} sm={6} md={4} onClick={() => setCurrentStep("Open Saved Plan")} style={{ cursor: "pointer" }}>
    //           <div
    //             style={{
    //               border: "1px solid #ccc",
    //               borderRadius: "5px",
    //               textAlign: "center",
    //               padding: "20px",
    //               margin: "10px",
    //             }}
    //           >
    //             <div
    //               style={{
    //                 backgroundColor: "#000",
    //                 width: "100%",
    //                 height: "150px",
    //                 marginBottom: "10px",
    //                 position: "relative",
    //               }}
    //             >
    //               <div
    //                 style={{
    //                   width: "50px",
    //                   height: "50px",
    //                   backgroundColor: "#fff",
    //                   borderTop: "10px solid black",
    //                   borderRight: "10px solid black",
    //                   position: "absolute",
    //                   top: "50%",
    //                   left: "50%",
    //                   transform: "translate(-50%, -50%)",
    //                 }}
    //               ></div>
    //             </div>
    //             <h5>OPEN SAVED PLAN</h5>
    //           </div>
    //         </Col>
    //       </Row>
    //     </div>
    //   );
    // }

    if (currentStep === "Start") {
      return (
        <div
          className="maincont"
          style={{ textAlign: "center", padding: "20px", display: "flex" }}
        >
          <div className="toptxt">
            <h4 className="h4head">Would You Like to Create a Plan?</h4>
            <p className="paratext">
              Need help visualizing your dream kitchen? Our kitchen planner puts
              the design power in your hands, with an incredibly easy-to-use
              drag-and-drop builder.
            </p>
          </div>
          <Row className="justify-content-center">
            {/* Create New Plan */}
            <Col
              xs={12}
              sm={6}
              md={4}
              onClick={() => setCurrentStep("Room Layout")}
              style={{ cursor: "pointer", width: "max-content" }}
              className="nopad"
            >
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  textAlign: "center",
                  padding: "20px",
                  margin: "10px",
                }}
                className="p10"
              >
                <div
                  style={{
                    backgroundColor: "#000",
                    width: "100%",
                    height: "150px",
                    marginBottom: "10px",
                    backgroundImage:
                      "url('https://cabjaks.co.nz/cdn/shop/files/kp-new-design.png?v=13018637419162784668')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                  className="crdimg"
                ></div>
                <h5 className="cardtxt">CREATE NEW PLAN</h5>
              </div>
            </Col>

            {/* Open Saved Plan */}
            {/* <Col xs={12} sm={6} md={4} onClick={() => setCurrentStep("Room Layout")} style={{ cursor: "pointer" }}> */}
            <Col
              xs={12}
              sm={6}
              md={4}
              onClick={handleOpenSavedPlan}
              style={{ cursor: "pointer", width: "max-content" }}
              className="nopad"
            >
              <div
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  textAlign: "center",
                  padding: "20px",
                  margin: "10px",
                }}
                className="p10"
              >
                <div
                  style={{
                    backgroundColor: "#000",
                    width: "100%",
                    height: "150px",
                    marginBottom: "10px",
                    backgroundImage:
                      "url('https://cabjaks.co.nz/cdn/shop/files/kp-saved-design.png?v=16715018253249670376')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                  className="crdimg"
                ></div>
                <h5 className="cardtxt">OPEN SAVED PLAN</h5>
              </div>
            </Col>
          </Row>
        </div>
      );
    }

    const handleNextStep = () => {
      // navigate("/base-layout"); // Navigate to Base Layout page
      setCurrentStep("Base Layout");
    };

    if (currentStep === "Room Layout") {
      return (
        <div
          className="roomlayout"
          style={{
            width: "80%",
            backgroundColor: "white",
            padding: "20px",
            margin: "auto",
          }}
        >
          {/* <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Kitchen Planner
          </h2> */}

          {/* Snackbar AlertMessage */}
          <AlertMessage
            open={alert.open}
            onClose={handleAlertClose}
            message={alert.message}
            severity={alert.severity}
          />

          <Row className="mb-4 step2itm">
            <Col
              xs={12}
              sm={4}
              style={{ textAlign: "center", width: "max-content" }}
              className="w70"
            >
              <div
                className="mbtm"
                style={{
                  border: "1px solid #ccc",
                  padding: "20px",
                  borderRadius: "5px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#000",
                    width: "100%",
                    height: "150px",
                    marginBottom: "10px",
                    backgroundImage:
                      "url('https://cabjaks.co.nz/cdn/shop/files/kp-new-design.png?v=13018637419162784668')",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  {/* <div
                    style={{
                      width: "50px",
                      height: "50px",
                      backgroundColor: "#fff",
                      margin: "auto",
                      transform: "translateY(50%)",
                    }}
                  ></div> */}
                </div>
                <h5 className="cardtxt">Create New Plan</h5>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Form>
                <h5>Please Enter Your Room Size</h5>
                <p className="paratext" style={{ textAlign: "left" }}>
                  You can use the default measurements below if you’re not sure
                  of your room size yet.
                </p>

                {/* Width Input and Slider */}
                <Form.Group controlId="roomWidth" className="mb-3">
                  <Row>
                    <Col xs={4}>
                      <Form.Label style={{ color: "grey" }}>Width:</Form.Label>
                      <Form.Control
                        type="number"
                        value={roomSize.width}
                        onChange={(e) =>
                          handleRoomSizeChange("width", e.target.value)
                        }
                        placeholder="Enter width in mm"
                      />
                    </Col>
                    <Col
                      xs={3}
                      style={{ display: "flex", alignItems: "center" }}
                      className="w66"
                    >
                      <Form.Range
                        min={0}
                        max={3000}
                        value={roomSize.width}
                        onChange={(e) =>
                          handleRoomSizeChange("width", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                {/* Depth Input and Slider */}
                <Form.Group controlId="roomDepth" className="mb-3">
                  <Row>
                    <Col xs={4}>
                      <Form.Label style={{ color: "grey" }}>Depth:</Form.Label>
                      <Form.Control
                        type="number"
                        value={roomSize.depth}
                        onChange={(e) =>
                          handleRoomSizeChange("depth", e.target.value)
                        }
                        placeholder="Enter depth in mm"
                      />
                    </Col>
                    <Col
                      xs={3}
                      style={{ display: "flex", alignItems: "center" }}
                      className="w66"
                    >
                      <Form.Range
                        min={0}
                        max={3000}
                        value={roomSize.depth}
                        onChange={(e) =>
                          handleRoomSizeChange("depth", e.target.value)
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <p
                  style={{
                    fontSize: "12px",
                    marginTop: "10px",
                    color: "grey",
                    fontWeight: "bold",
                  }}
                >
                  1000mm = 1 metre
                </p>

                {/* Description Field */}
                <Form.Group controlId="description" className="mb-3">
                  <Form.Label>Description:</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter a description for the room"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                {/* Subdescription Field */}
                <Form.Group controlId="subdescription" className="mb-4">
                  <Form.Label>SubDescription:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Enter additional details about the room"
                    value={subdescription}
                    onChange={(e) => setSubdescription(e.target.value)}
                  />
                </Form.Group>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <Button
                    variant="primary"
                    type="button"
                    disabled={isLoading}
                    onClick={handleNextStep}
                  >
                    {isLoading ? "Saving..." : "Next Step"}
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </div>
      );
    }

    if (currentStep === "Base Layout") {
      return (
        // <DndProvider backend={HTML5Backend}>
        //   <h5>Plan Top View</h5>
        //   <DropZone onDrop={handleDrop} droppedItems={droppedItems}  onRemove={handleRemove}/>
        // </DndProvider>

        <DndProvider backend={HTML5Backend}>
          <div style={{}}>
            <div
              style={{
                flex: 3,
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "5px",
                marginRight: "20px",
              }}
              className="remmar"
            >
              {/* <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Kitchen Planner</h2> */}
              <h5>Plan Top View</h5>
              <DropZone
                onDrop={handleDrop}
                droppedItems={droppedItems}
                onRemove={handleRemove}
              />
            </div>
          </div>

          {/* Modal for Item Dimensions */}
          {/* <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Set Cabinet Dimensions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Width (mm)</Form.Label>
                  <Form.Control
                    type="number"
                    value={itemDimensions.width}
                    onChange={(e) => setItemDimensions({ ...itemDimensions, width: e.target.value })}
                    placeholder="Enter width"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Height (mm)</Form.Label>
                  <Form.Control
                    type="number"
                    value={itemDimensions.height}
                    onChange={(e) => setItemDimensions({ ...itemDimensions, height: e.target.value })}
                    placeholder="Enter height"
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddToDesign}>
                Add to Design
              </Button>
            </Modal.Footer>
          </Modal> */}

          {/* Modal for Item Dimensions */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Set Cabinet Dimensions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {/* Width Input and Slider */}
                <Form.Group className="mb-3">
                  <Form.Label>Width (mm)</Form.Label>
                  <Form.Control
                    type="number"
                    value={itemDimensions.width}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        width: e.target.value,
                      })
                    }
                    placeholder="Enter width"
                  />
                  <Form.Range
                    min={100}
                    max={3000}
                    value={itemDimensions.width}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        width: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* Height Input and Slider */}
                <Form.Group className="mb-3">
                  <Form.Label>Height (mm)</Form.Label>
                  <Form.Control
                    type="number"
                    value={itemDimensions.height}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        height: e.target.value,
                      })
                    }
                    placeholder="Enter height"
                  />
                  <Form.Range
                    min={100}
                    max={3000}
                    value={itemDimensions.height}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        height: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddToDesign}>
                Add to Design
              </Button>
            </Modal.Footer>
          </Modal>
        </DndProvider>
      );
    }

    // if (currentStep === "Wall Layout") {
    //   return (
    //     <DndProvider backend={HTML5Backend}>
    //       <div style={{}}>
    //         <div
    //           style={{
    //             flex: 3,
    //             backgroundColor: "#fff",
    //             padding: "20px",
    //             borderRadius: "5px",
    //             marginRight: "20px",
    //           }}
    //           className="remmar"
    //         >
    //           <h5>Plan Top View</h5>
    //           <DropZone
    //             onDrop={handleDrop}
    //             droppedItems={droppedItems}
    //             onRemove={handleRemove}
    //           />
    //         </div>
    //       </div>

    //       {/* Modal for Item Dimensions */}
    //       <Modal show={showModal} onHide={() => setShowModal(false)}>
    //         <Modal.Header closeButton>
    //           <Modal.Title>Set Cabinet Dimensions</Modal.Title>
    //         </Modal.Header>
    //         <Modal.Body>
    //           <Form>
    //             {/* Width Input and Slider */}
    //             <Form.Group className="mb-3">
    //               <Form.Label>Width (mm)</Form.Label>
    //               <Form.Control
    //                 type="number"
    //                 value={itemDimensions.width}
    //                 onChange={(e) =>
    //                   setItemDimensions({
    //                     ...itemDimensions,
    //                     width: e.target.value,
    //                   })
    //                 }
    //                 placeholder="Enter width"
    //               />
    //               <Form.Range
    //                 min={100}
    //                 max={3000}
    //                 value={itemDimensions.width}
    //                 onChange={(e) =>
    //                   setItemDimensions({
    //                     ...itemDimensions,
    //                     width: e.target.value,
    //                   })
    //                 }
    //               />
    //             </Form.Group>

    //             {/* Height Input and Slider */}
    //             <Form.Group className="mb-3">
    //               <Form.Label>Height (mm)</Form.Label>
    //               <Form.Control
    //                 type="number"
    //                 value={itemDimensions.height}
    //                 onChange={(e) =>
    //                   setItemDimensions({
    //                     ...itemDimensions,
    //                     height: e.target.value,
    //                   })
    //                 }
    //                 placeholder="Enter height"
    //               />
    //               <Form.Range
    //                 min={100}
    //                 max={3000}
    //                 value={itemDimensions.height}
    //                 onChange={(e) =>
    //                   setItemDimensions({
    //                     ...itemDimensions,
    //                     height: e.target.value,
    //                   })
    //                 }
    //               />
    //             </Form.Group>
    //           </Form>
    //         </Modal.Body>
    //         <Modal.Footer>
    //           <Button variant="secondary" onClick={() => setShowModal(false)}>
    //             Cancel
    //           </Button>
    //           <Button variant="primary" onClick={handleAddToDesign}>
    //             Add to Design
    //           </Button>
    //         </Modal.Footer>
    //       </Modal>
    //     </DndProvider>
    //   );
    // }

    if (currentStep === "Add Notes") {
      return (
        <div
          style={{ display: "flex", alignItems: "flex-start", height: "100%" }}
          className="fldc"
        >
          <DndProvider backend={HTML5Backend}>
            <div
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "5px",
              }}
              className="sidemenu"
            >
              <h5>Plan Top View</h5>
              <DropZone
                onDrop={handleDrop}
                droppedItems={droppedItems}
                onRemove={handleRemove}
              />
            </div>
          </DndProvider>

          {/* Notes Section */}
          <div
            style={{
              width: "50%", // Fixed width for Notes
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "5px",
              // marginLeft: "20px",
              // border:"2px solid black"
            }}
            className="sidemenu ml5"
          >
            <h5>Notes</h5>
            <ul style={{ listStyleType: "decimal", paddingLeft: "20px" }}>
              {Object.entries(notes).length > 0 ? (
                Object.entries(notes).map(([cabinet, noteList]) => (
                  <li key={cabinet}>
                    {/* <strong>{cabinet}:</strong> */}
                    <ul>
                      {noteList.map((note, index) => (
                        <li key={index}>{note}</li>
                      ))}
                    </ul>
                  </li>
                ))
              ) : (
                <li>No notes available</li>
              )}
            </ul>

            {/* Delete All Notes Button */}
            {Object.keys(notes).length > 0 && (
              <button
                onClick={handleDeleteAllNotes}
                style={{
                  // marginTop: "10px",
                  // padding: "8px 12px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      );
    }

    if (currentStep === "Review") {
      return (
        <DndProvider backend={HTML5Backend}>
          <div style={{}}>
            <div
              style={{
                flex: 3,
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "5px",
                // marginRight: "20px",
              }}
              className="sidemenu remmar"
            >
              {/* <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Kitchen Planner</h2> */}
              <h5>Plan Top View</h5>
              <DropZone
                onDrop={handleDrop}
                droppedItems={droppedItems}
                onRemove={handleRemove}
              />
            </div>

            <button
              className="rbtn1"
              style={{
                padding: "10px 20px",
                backgroundColor: "#3db4f2",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={handleFrontViewToggle}
            >
              {showView ? "HIDE FRONT VIEW" : "SHOW FRONT VIEW"}
            </button>

            {/* Conditionally render this div only when showView is true */}
            {showView && (
              <div
                style={{
                  position: "relative",
                  height: "400px",
                  backgroundColor: "#333",
                  borderRadius: "5px",
                  margin: "20px",
                  // marginTop: "20px",
                  // marginBottom: "20px",
                }}
              >
                {droppedItems.map((item, index) => (
                  <div
                    key={index}
                    style={{ position: "absolute", top: 50, left: 50 }}
                  >
                    <img
                      src={item.imageSrc}
                      alt={showFrontView ? "Front View" : "Top View"}
                      style={{ width: "100px" }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* </div> */}

            {/* New "Review & Submit" button */}
            <button
              className="rbtn2"
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginLeft: "20px",
              }}
              onClick={handleSubmit}
            >
              REVIEW AND SUBMIT
            </button>

            <button
              className="rbtn2"
              style={{
                padding: "10px 20px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginLeft: "20px",
              }}
              onClick={handleAddToCart}
            >
              Add To Card
            </button>
          </div>
        </DndProvider>
      );
    }
  };

  return (
    <div
      className="rempad fldc"
      style={{
        display: "flex",
        backgroundColor: "#f5f5f5", 
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Main Content */}
      <div
        className="rempad remmar"
        style={{
          flex: 3,
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "5px",
          marginRight: "20px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Kitchen Planner
        </h2>

        {/* Progress Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          {steps.map((step, index) => (
            <CustomTooltip key={index} message={step.tooltip}>
              <div
                style={{
                  textAlign: "center",
                  flex: 1,
                  cursor: "pointer",
                }}
                onClick={() => setCurrentStep(step.name)}
              >
                <div
                  className="progitems"
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    backgroundColor:
                      currentStep === step.name ? "#00bfff" : "#ccc",
                    margin: "0 auto",
                    lineHeight: "25px",
                    color: "#fff",
                  }}
                >
                  {index + 1}
                </div>
                <p
                  className="progtxt"
                  style={{ fontSize: "12px", marginTop: "5px" }}
                >
                  {step.name}
                </p>
              </div>
            </CustomTooltip>
          ))}
        </div>

        {/* Dynamic Content */}
        {renderStepContent()}
      </div>

      {/* Sidebar for Kitchen Options */}
      {/* Sidebar for Kitchen Options */}
      {/* <div
        style={{
          width: "20%",
          padding: "10px",
          // backgroundColor: currentStep === "Base Layout" ? "#fff" : "lightgray", // Adjust background color for inactive steps
          backgroundColor: ["Base Layout", "Wall Layout", "Add Notes"].includes(currentStep) ? "#fff" : "lightgray",
          borderRadius: "5px",
          // opacity: currentStep === "Base Layout" ? 1 : 0.5, // Reduce opacity for inactive steps
          opacity: ["Base Layout", "Wall Layout", "Add Notes"].includes(currentStep) ? 1 : 0.5,
          // pointerEvents: currentStep === "Base Layout" ? "auto" : "none", // Disable interaction for inactive steps
          pointerEvents: ["Base Layout", "Wall Layout", "Add Notes"].includes(currentStep) ? "auto" : "none",
        }}
      >
        <h5 style={{ textAlign: "center", marginBottom: "20px" }}>Base Cabinets</h5>
        <DndProvider backend={HTML5Backend}>
          <DraggableCabinet
            name="1 Door Base"
            imageSrc="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
          />
          <DraggableCabinet
            name="2 Door Base"
            imageSrc="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
          />
          <DraggableCabinet
            name="Sink Base"
            imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
          />
        </DndProvider>
      </div> */}

      {/* /// */}

      <div className="w-25 p-4 bg-gray-100 rounded-lg sidemenu">
        <h4 className="text-lg font-bold">Kitchen Options</h4>
        <p
          className="text-sm text-gray-500 paratext"
          style={{ textAlign: "left" }}
        >
          Drag and drop your items into our planner.
        </p>

        <DndProvider backend={HTML5Backend}>
          {/* Base Cabinets */}
          <div className="mt-4">
            <button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("base")}
            >
              <span className="text-left">Base Cabinets</span>
              <span className="text-right">
                {openSection === "base" ? "-" : "+"}
              </span>
            </button>
            {openSection === "base" && (
              <div className="mt-2 c-flex drgbl">
                <DraggableCabinet
                  name="1 Door Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
                />
                <DraggableCabinet
                  name="2 Door Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
                <DraggableCabinet
                  name="Sink Base"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
              </div>
            )}
          </div>

          {/* Tall Cabinets */}
          <div className="mt-4">
            <button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("tall")}
            >
              <span className="text-left">Tall Cabinets</span>
              <span className="text-right">
                {openSection === "tall" ? "-" : "+"}
              </span>
            </button>
            {openSection === "tall" && (
              <div className="mt-2 c-flex">
                <DraggableCabinet
                  name="Tall Cabinet 1"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/1-door-tall-pantry_medium.jpg?v=1431900700"
                />
                <DraggableCabinet
                  name="Tall Cabinet 2"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-tall-pantry_medium.jpg?v=1431553410"
                />
              </div>
            )}
          </div>

          {/* Finishing Panels */}
          <div className="mt-4">
            <button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("panels")}
            >
              <span className="text-left">Finishing Panels</span>
              <span className="text-right">
                {openSection === "panels" ? "-" : "+"}
              </span>
            </button>
            {openSection === "panels" && (
              <div className="mt-2 c-flex">
                <DraggableCabinet
                  name="Panel 1"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
                />
              </div>
            )}
          </div>

          {/* Wall Cabinets */}
          <div className="mt-4">
            <button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("wall")}
            >
              <span className="text-left">Wall Cabinets</span>
              <span className="text-right">
                {openSection === "wall" ? "-" : "+"}
              </span>
            </button>
            {openSection === "wall" && (
              <div className="mt-2 c-flex">
                <DraggableCabinet
                  name="Wall Cabinet 1"
                  imageSrc="https://cabjaks.co.nz/cdn/shop/products/2-door-base-cabinet_large.jpg?v=1430456846"
                />
              </div>
            )}
          </div>
        </DndProvider>
      </div>

      {/* // */}

      {/* Snackbar AlertMessage */}
      <AlertMessage
        open={alert.open}
        onClose={handleAlertClose}
        message={alert.message}
        severity={alert.severity}
      />
    </div>
  );
};

export default ProductList;
