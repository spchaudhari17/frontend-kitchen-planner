import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Modal } from "react-bootstrap";
import Button from "../ui/Button";
import { axiosPrivate } from "../../api/axios";
import AlertMessage from "../ui/AlertMessage";
import CustomTooltip from "../ui/ToolTip";
import { DraggableCabinet, DropZone, getNotes } from "./DragDropComponents";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import html2canvas from "html2canvas";
import axios from "axios";

import { useAuthContext } from "../../context/auth";
import { useColorContext } from "../../context/colorcontext";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProductList.css";

const ProductList = () => {
  const { auth } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { componentColors } = useColorContext();
  const [completedSteps, setCompletedSteps] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  const isEditing = Boolean(location.state?.roomDetails);
  const dropZoneRef = useRef(null);
  const [snapshotImage, setSnapshotImage] = useState("");




  const defaultColors = {
    background: "#ffffff",
    text: "#000000",
  };

  // Main planner background and text
  const plannerBg =
    componentColors?.["Kitchen Planner"]?.background ||
    defaultColors.background;
  const plannerText =
    componentColors?.["Kitchen Planner"]?.text || defaultColors.text;

  const defaultButtonColors = {
    background: "#007bff", // fallback
    text: "#ffffff",
  };

  const globalButtonBg =
    componentColors?.["Button"]?.background || defaultButtonColors.background;
  const globalButtonText =
    componentColors?.["Button"]?.text || defaultButtonColors.text;

  const [roomDetails, setRoomDetails] = useState([]);

  const userInfoString = localStorage.getItem("user");
  const userInfo = JSON.parse(userInfoString);

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/room-details/get-save-user-roomdetails`,
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




  useEffect(() => {
    const stored = sessionStorage.getItem("resumeRoomData");
    if (stored) {
      const { roomData, pendingAction, currentStep } = JSON.parse(stored);
      sessionStorage.removeItem("resumeRoomData");

      if (roomData) {
        setRoomSize({ width: roomData.width, depth: roomData.depth });
        setDescription(roomData.description || "");        // ✅ MUST set this
        setSubdescription(roomData.subdescription || "");
        setNotes(roomData.notes || {});
        setDroppedItems(roomData.droppedItems || []);
        setCurrentStep(currentStep || "Room Layout");

        // 🕒 Delay running the pending action until state is hydrated
        setTimeout(() => {
          if (pendingAction === "addToCart") {
            handleAddToCart(new Event("resume"));
          } else if (pendingAction === "saveRoom") {
            handleSubmit(new Event("resume"));
          }
        }, 300); // Wait for hydration to finish
      }
    }
  }, []);




  const redirectToLoginWithData = (action) => {
    const pendingData = {
      pendingAction: action,
      currentStep,
      roomData: {
        width: roomSize.width,
        depth: roomSize.depth,
        description,
        subdescription,
        notes,
        droppedItems,
      },
    };

    sessionStorage.setItem("resumeRoomData", JSON.stringify(pendingData));
    navigate("/login");
  };



  const handleOpenSavedPlan = () => {
    if (!auth) {
      navigate("/login"); // User not logged in, redirect to login
      return;
    }

    if (roomDetails && roomDetails.length > 0) {
      navigate("/account"); //  Plans exist → Go to Account page
    } else {
      setCurrentStep("Room Layout"); //  No plans → Go to Create Plan
      // Reset all planner state when starting new plan
      setRoomSize({ width: 3000, depth: 2000 });
      setDescription("");
      setSubdescription("");
      setDroppedItems([]);
      setNotes({});
      // setCurrentStep("Room Layout");
      setHasSubmitted(false);
      setCompletedSteps([]);
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

  const handleFrontViewToggle = (event) => {
    event.preventDefault();
    if (!auth) {
      redirectToLoginWithData("frontView");
      return;
    }
    setShowFrontView(!showFrontView);
    setShowView(!showView); // Toggle visibility of the div
  };

  //location for open cabinates data
  useEffect(() => {
    if (location.state?.roomDetails) {
      const room = location.state.roomDetails;

      // Ensure droppedItems have all required properties
      const normalizedItems = (room.droppedItems || []).map((item) => ({
        ...item,
        x: item.x || 0,
        y: item.y || 0,
        rotation: item.rotation || 0,
        width: item.width || item.minWidth || 300,
        height: item.height || item.minDepth || 600,
        id: item.id || Date.now(),
        basePrice: item.basePrice || 0,
        hinges: item.hinges,
        handles: item.handles,
        cabinateType: item.cabinateType,
        minWidth: item.minWidth,
        maxWidth: item.maxWidth,
        minDepth: item.minDepth,
        maxDepth: item.maxDepth,
      }));

      setRoomSize({ width: room.width, depth: room.depth });
      setDescription(room.description);
      setSubdescription(room.subdescription);
      setNotes(room.notes || {});
      setDroppedItems(normalizedItems);
      setCurrentStep("Room Layout");
    }
  }, [location.state]);

  // Function to delete all notes from localStorage
  const handleDeleteAllNotes = () => {
    //  LocalStorage se Notes Delete karega
    sessionStorage.removeItem("cabinetNotes");
    // localStorage.removeItem("droppedCabinets"); // Cabinets bhi delete karne ke liye

    //  State ko update karega
    setNotes({});

    //  Storage Event Trigger karega
    window.dispatchEvent(new Event("storage"));
  };

  const steps = [
    {
      name: "Start",
      tooltip: "Start planning your kitchen.",
      canNavigate: true,
    },
    {
      name: "Room Layout",
      tooltip: "Enter room dimensions and details.",
      canNavigate: (currentIndex, targetIndex) =>
        // Can always go back, or forward if previous step completed
        targetIndex < currentIndex ||
        completedSteps.includes("Start") ||
        hasSubmitted,
    },
    {
      name: "Top View",
      tooltip: "Design the top view of your kitchen.",
      canNavigate: (currentIndex, targetIndex) =>
        targetIndex < currentIndex ||
        completedSteps.includes("Room Layout") ||
        hasSubmitted,
    },
    {
      name: "Add Notes",
      tooltip: "Add notes or special instructions.",
      canNavigate: (currentIndex, targetIndex) =>
        targetIndex < currentIndex ||
        completedSteps.includes("Top View") ||
        hasSubmitted,
    },
    {
      name: "Review",
      tooltip: "Review your plan before finalizing.",
      canNavigate: (currentIndex, targetIndex) =>
        targetIndex < currentIndex ||
        completedSteps.includes("Add Notes") ||
        hasSubmitted,
    },
  ];

  const handleRoomSizeChange = (name, value) => {
    setRoomSize((prev) => ({ ...prev, [name]: value }));
  };

  const handleDrop = (item) => {
    const CABINET_WIDTH = item.minWidth || 200;
    const CABINET_HEIGHT = item.minDepth || 200;
    const SPACING = 20;

    // Find a non-overlapping position (simple row layout for now)
    let newX = 50;
    let newY = 50;

    const occupiedPositions = droppedItems.map((i) => ({
      x: i.x,
      y: i.y,
      width: i.width,
      height: i.height,
    }));

    while (
      occupiedPositions.some(
        (pos) =>
          newX < pos.x + pos.width + SPACING &&
          newX + CABINET_WIDTH > pos.x &&
          newY < pos.y + pos.height + SPACING &&
          newY + CABINET_HEIGHT > pos.y
      )
    ) {
      newX += CABINET_WIDTH + SPACING;
      if (newX + CABINET_WIDTH > roomSize.width) {
        newX = 50;
        newY += CABINET_HEIGHT + SPACING;
      }
    }

    const newItem = {
      ...item,
      id: item.id || Date.now(),
      rotation: 0,
      height: item.minDepth || 0, // Initialize with min depth
      width: item.minWidth || 0, // Initialize with min width
      x: 50,
      y: 50,
      minWidth: item.minWidth, // Store min width from API
      maxWidth: item.maxWidth, // Store max width from API
      minDepth: item.minDepth, // Store min depth from API
      maxDepth: item.maxDepth, // Store max depth from API
      basePrice: item.basePrice, // Store base price from API
      hinges: item.hinges,
      handles: item.handles,
      cabinateType: item.cabinateType,
    };

    setSelectedItem(newItem);
    setShowModal(true);
  };
  const handleRotate = (index) => {
    setDroppedItems((prevItems) => {
      const updatedItems = prevItems.map((item, i) => {
        if (i !== index) return item;

        const newRotation = (item.rotation + 90) % 360;
        const isRotated = newRotation % 180 === 90;

        const newItem = {
          ...item,
          rotation: newRotation,
          width: isRotated ? item.height : item.width,
          height: isRotated ? item.width : item.height,
        };

        return newItem;
      });

      return updatedItems;
    });
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
      { ...selectedItem, ...itemDimensions, basePrice: selectedItem.basePrice, minWidth: selectedItem.minWidth, maxWidth: selectedItem.maxWidth },
    ]);
    setShowModal(false);
    setItemDimensions({ height: "", width: "" });
  };

  //save room details
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!auth) {
      redirectToLoginWithData("saveRoom");
      return;
    }

    if (!roomSize.width || !roomSize.depth) {
      setAlert({
        open: true,
        message: "Room width and depth are required.",
        severity: "error",
      });
      return;
    }

    if (!description.trim()) {
      setAlert({
        open: true,
        message: "Description is required.",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
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
          snapshotImage,
        },
        { withCredentials: true }
      );

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
        setCurrentStep("Start");
        setHasSubmitted(true);
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

  //update room details
  const handleUpdate = async (event) => {
    event?.preventDefault?.();

    if (!auth) {
      redirectToLoginWithData("updateRoom");
      return;
    }

    if (!roomSize.width || !roomSize.depth) {
      setAlert({
        open: true,
        message: "Room width and depth are required.",
        severity: "error",
      });
      return;
    }

    if (!description.trim()) {
      setAlert({
        open: true,
        message: "Description is required.",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_SERVER_URL}/api/room-details/update-room-details/${location.state.roomDetails._id}`,
        {
          width: roomSize.width,
          depth: roomSize.depth,
          description,
          subdescription,
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setAlert({
          open: true,
          message: "Room details updated successfully!",
          severity: "success",
        });

        navigate("/account");
      }
    } catch (error) {
      setAlert({
        open: true,
        message: "Failed to update room details. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (event) => {
    event.preventDefault();

    if (!auth) {
      redirectToLoginWithData("addToCart");
      return;
    }

    if (!roomSize.width || !roomSize.depth || !description.trim()) {
      setAlert({
        open: true,
        message:
          "Room width, depth, and description are required to add to cart.",
        severity: "error",
      });
      return;
    }

    const newCartItem = {
      user_id: userInfo._id,
      width: roomSize.width,
      depth: roomSize.depth,
      description,
      subdescription,
      notes,
      droppedItems: droppedItems.map((item) => ({
        id: item.id,
        name: item.name,
        imageSrc: item.imageSrc,
        minWidth: item.minWidth, // Add minWidth
        maxWidth: item.maxWidth, // Add maxWidth
        basePrice: item.basePrice,
        x: item.x,
        y: item.y,
        rotation: item.rotation,
        width: item.width,
        height: item.height,
        minWidth: item.minWidth, // Add minWidth
        maxWidth: item.maxWidth, // Add maxWidth
        minDepth: item.minDepth, // Add minDepth if needed
        maxDepth: item.maxDepth, // Add maxDepth if needed
        hinges: item.hinges,
        handles: item.handles,
        cabinateType: item.cabinateType,
      })),
    };

    try {
      let existingCart = [];
      const storedCart = JSON.parse(localStorage.getItem("cartData"));
      if (Array.isArray(storedCart)) {
        existingCart = storedCart;
      }
      existingCart.push(newCartItem);
      localStorage.setItem("cartData", JSON.stringify(existingCart));

      const response = await axios.post(
        `${process.env.REACT_APP_SERVER_URL}/api/cart/save`,
        newCartItem
      );
      if (response.data.success) {
        setAlert({
          open: true,
          message: "Cart saved successfully!",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("MongoDB Cart Save Error:", err);
      setAlert({
        open: true,
        message: "Saved locally, but failed to store in database.",
        severity: "warning",
      });
    }
  };

  const handleRemove = (indexToRemove) => {
    setDroppedItems((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const commonDropZoneProps = {
    onDrop: handleDrop,
    droppedItems: droppedItems, // Same state for all steps
    onRemove: handleRemove,
    onRotate: handleRotate,
    currentStep: currentStep,
    setDroppedItems: setDroppedItems,
    roomSize: roomSize,
  };

  const handleAlertClose = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const renderStepContent = () => {
    if (currentStep === "Start") {
      return (
        <div
          className="maincont"
          style={{
            textAlign: "center",
            padding: "20px",
            display: "flex",
            backgroundColor: plannerBg,
            color: plannerText,
          }}
        >
          <div
            className="toptxt"
            style={{
              textAlign: "center",
              padding: "20px",
              display: "flex",
            }}
          >
            <h4 className="h4head" style={{ color: plannerText }}>
              Would You Like to Create a Plan?
            </h4>
            <p
              className="paratext"
              style={{ color: plannerText, marginLeft: "10px" }}
            >
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
              onClick={() => {

                setRoomSize({ width: 3000, depth: 2000 });
                setDescription("");
                setSubdescription("");
                setDroppedItems([]);
                setNotes({});
                setCurrentStep("Room Layout");
                setHasSubmitted(false);
                setCompletedSteps([]);
              }}
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

    const handleNextStep = async () => {
      if (currentStep === "Room Layout") {
        if (!roomSize.width || !roomSize.depth) {
          setAlert({
            open: true,
            message: "Please enter room width and depth.",
            severity: "error",
          });
          return;
        }

        if (!description.trim()) {
          setAlert({
            open: true,
            message: "Description is required.",
            severity: "error",
          });
          return;
        }
      }

      //  Take snapshot on Top View step
      if (currentStep === "Top View" && dropZoneRef.current) {
        dropZoneRef.current.style.transform = "scale(0.75)";
        dropZoneRef.current.style.transformOrigin = "top left";
        await new Promise((resolve) => setTimeout(resolve, 300));

        const canvas = await html2canvas(dropZoneRef.current);

        // 🔽 Create smaller canvas
        const scale = 0.25;
        const resizedCanvas = document.createElement('canvas');
        resizedCanvas.width = canvas.width * scale;
        resizedCanvas.height = canvas.height * scale;

        const ctx = resizedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);


        const imageData = resizedCanvas.toDataURL("image/jpeg", 0.5);

        dropZoneRef.current.style.transform = "scale(1)";
        setSnapshotImage(imageData);
        localStorage.setItem("snapshotImage", imageData);
      }

      // Move to next step
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }

      let nextStep;
      switch (currentStep) {
        case "Start":
          nextStep = "Room Layout";
          break;
        case "Room Layout":
          nextStep = "Top View";
          break;
        case "Top View":
          nextStep = "Add Notes";
          break;
        case "Add Notes":
          nextStep = "Review";
          break;
        default:
          nextStep = currentStep;
      }

      setCurrentStep(nextStep);
    };


    if (currentStep === "Room Layout") {
      return (
        <div
          className="roomlayout"
          style={{
            width: "80%",
            backgroundColor: plannerBg,
            color: plannerText,
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
                ></div>
                <h5 className="cardtxt">Create New Plan</h5>
              </div>
            </Col>
            <Col xs={12} sm={8}>
              <Form>
                <h5>Please Enter Your Room Size</h5>
                <p
                  className="paratext"
                  style={{ textAlign: "left", color: plannerText }}
                >
                  You can use the default measurements below if you’re not sure
                  of your room size yet.
                </p>
                {/* Width Input and Slider */}
                <Form.Group controlId="roomWidth" className="mb-3">
                  <Row>
                    <Col xs={4}>
                      <Form.Label style={{ color: plannerText }}>
                        Width (3000 mm – 8000 mm):
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={3000}
                        max={8000}
                        value={roomSize.width}
                        onChange={(e) =>
                          handleRoomSizeChange("width", Number(e.target.value))
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
                        min={3000}
                        max={8000}
                        value={roomSize.width}
                        onChange={(e) =>
                          handleRoomSizeChange("width", Number(e.target.value))
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                {/* Depth Input and Slider */}
                <Form.Group controlId="roomDepth" className="mb-3">
                  <Row>
                    <Col xs={4}>
                      <Form.Label style={{ color: plannerText }}>
                        Depth (3000 mm – 8000 mm):
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min={3000}
                        max={8000}
                        value={roomSize.depth}
                        onChange={(e) =>
                          handleRoomSizeChange("depth", Number(e.target.value))
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
                        min={3000}
                        max={8000}
                        value={roomSize.depth}
                        onChange={(e) =>
                          handleRoomSizeChange("depth", Number(e.target.value))
                        }
                      />
                    </Col>
                  </Row>
                </Form.Group>

                <p
                  style={{
                    fontSize: "12px",
                    marginTop: "10px",
                    color: plannerText,
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
                    type="Button"
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

    if (currentStep === "Top View") {
      return (
        <DndProvider backend={HTML5Backend}>
          <div style={{}}>
            <div
              style={{
                flex: 3,
                // backgroundColor: plannerBg,
                color: plannerText,
                padding: "20px",
                borderRadius: "5px",
                marginRight: "20px",
              }}
              className="remmar"
            >
              <DropZone ref={dropZoneRef} {...commonDropZoneProps} roomSize={roomSize} />
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <Button
                variant="primary"
                type="Button"
                disabled={isLoading}
                onClick={handleNextStep}
              >
                {isLoading ? "Saving..." : "Next Step"}
              </Button>
            </div>
          </div>

          {/* Modal for Item Dimensions */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Set Cabinet Dimensions</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                {/* Width Input and Slider */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Width: {itemDimensions.width}mm (Range:{" "}
                    {selectedItem?.minWidth}mm - {selectedItem?.maxWidth}mm)
                  </Form.Label>

                  <Form.Control
                    type="number"
                    value={itemDimensions.width}
                    min={selectedItem?.minWidth || 100}
                    max={selectedItem?.maxWidth || 3000}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        width: e.target.value, // don't clamp yet
                      })
                    }
                    onBlur={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        width: Math.min(
                          Math.max(
                            Number(e.target.value),
                            selectedItem?.minWidth || 100
                          ),
                          selectedItem?.maxWidth || 3000
                        ),
                      })
                    }
                    placeholder="Enter width"
                  />

                  <Form.Range
                    min={selectedItem?.minWidth || 100}
                    max={selectedItem?.maxWidth || 3000}
                    value={itemDimensions.width}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        width: e.target.value,
                      })
                    }
                  />
                </Form.Group>

                {/* Depth Input and Slider */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Depth: {itemDimensions.height}mm (Range:{" "}
                    {selectedItem?.minDepth}mm - {selectedItem?.maxDepth}mm)
                  </Form.Label>

                  <Form.Control
                    type="number"
                    value={itemDimensions.height}
                    min={selectedItem?.minDepth || 100}
                    max={selectedItem?.maxDepth || 3000}
                    onChange={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        height: e.target.value, // raw value allow kar rahe hain
                      })
                    }
                    onBlur={(e) =>
                      setItemDimensions({
                        ...itemDimensions,
                        height: Math.min(
                          Math.max(
                            Number(e.target.value),
                            selectedItem?.minDepth || 100
                          ),
                          selectedItem?.maxDepth || 3000
                        ),
                      })
                    }
                    placeholder="Enter depth"
                  />

                  <Form.Range
                    min={selectedItem?.minDepth || 100}
                    max={selectedItem?.maxDepth || 3000}
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

    if (currentStep === "Add Notes") {
      return (
        <div className="notes-container" style={{ width: "100%" }}>
          <DndProvider backend={HTML5Backend}>
            <div
              style={{
                width: "100%",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "5px",
                marginBottom: "20px",
              }}
              className="sidemenu"
            >
              <DropZone {...commonDropZoneProps} />
            </div>
          </DndProvider>

          {/* Notes Section - if you want to add it back */}
          {/* <div style={{ width: '100%', marginBottom: '20px' }}>
            ... your notes content ...
          </div> */}

          <div
            style={{
              width: "100%",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            <Button
              variant="primary"
              type="Button"
              disabled={isLoading}
              onClick={handleNextStep}
            >
              {isLoading ? "Saving..." : "Next Step"}
            </Button>
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
                // backgroundColor: plannerBg,
                color: plannerText,

                padding: "20px",
                borderRadius: "5px",
                // marginRight: "20px",
              }}
              className="sidemenu remmar"
            >
              <DropZone {...commonDropZoneProps} />
            </div>
            <div className="mt-4">
              <Button
                className="rbtn1"
                style={{
                  padding: "10px 20px",
                  backgroundColor: globalButtonBg,
                  color: globalButtonText,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={handleFrontViewToggle}
              >
                {showView ? "HIDE FRONT VIEW" : "SHOW FRONT VIEW"}
              </Button>

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
                      <hr className="side-line"></hr>
                      <hr className="bottom-line"></hr>
                      {/* <div className="side-txt">200</div>
                    <div className="bottom-txt">300</div> */}
                      <div className="side-txt">{item.height}</div>
                      <div className="bottom-txt">{item.width}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* </div> */}


              {isEditing ? (
                <Button
                  className="rbtn2"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: globalButtonBg,
                    color: globalButtonText,
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                  onClick={handleUpdate}
                >
                  UPDATE DETAILS
                </Button>
              ) : (
                <Button
                  className="rbtn2"
                  style={{
                    padding: "10px 20px",
                    backgroundColor: globalButtonBg,
                    color: globalButtonText,
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                  onClick={handleSubmit}
                >
                  SAVE
                </Button>
              )}

              <Button
                className="rbtn2"
                style={{
                  padding: "10px 20px",
                  backgroundColor: globalButtonBg,
                  color: globalButtonText,
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  marginLeft: "20px",
                }}
                onClick={handleAddToCart}
              >
                Add To Cart
              </Button>

            </div>
          </div>
        </DndProvider>
      );
    }
  };

  const [openSection, setOpenSection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const convertToBase64 = async (url) => {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    const convertToBase64 = async (url) => {
      try {
        const response = await fetch(url, { mode: "cors" });
        const blob = await response.blob();
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Failed to convert image to base64:", url);
        return url; // fallback to original if failed
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/product/products`
        );

        const rawProducts = response.data;

        const processedProducts = await Promise.all(
          rawProducts.map(async (product) => {
            const base64FrontImage = await convertToBase64(product.cabinateFrontImage);
            return {
              ...product,
              cabinateFrontImage: base64FrontImage,
            };
          })
        );

        setProducts(processedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);


  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const renderCabinets = (type) => {
    return products
      .filter((product) => product.cabinateType === type)
      .map((cabinet) => {
        console.log("Cabinet Data:", cabinet);
        return (
          <DraggableCabinet
            key={cabinet._id}
            id={cabinet._id}
            name={cabinet.cabinateName}
            imageSrc={cabinet.cabinateImage}
            cabinateFrontImage={cabinet.cabinateFrontImage}
            minWidth={cabinet.minWidth}
            maxWidth={cabinet.maxWidth}
            minDepth={cabinet.minDepth}
            maxDepth={cabinet.maxDepth}
            basePrice={cabinet.basePrice}
            hinges={cabinet.hinges}
            handles={cabinet.handles}
            cabinateType={cabinet.cabinateType}
          />
        );
      });
  };

  const validateStepNavigation = (targetStep) => {
    const currentIndex = steps.findIndex((s) => s.name === currentStep);
    const targetIndex = steps.findIndex((s) => s.name === targetStep);

    if (typeof steps[targetIndex].canNavigate === "function") {
      return steps[targetIndex].canNavigate(currentIndex, targetIndex);
    }
    return steps[targetIndex].canNavigate;
  };

  // Use this when setting current step directly
  const setCurrentStepWithValidation = (stepName) => {
    if (validateStepNavigation(stepName)) {
      setCurrentStep(stepName);
    } else {
      setAlert({
        open: true,
        message: `Please complete previous steps before accessing ${stepName}`,
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (showModal && selectedItem) {
      setItemDimensions({
        width: selectedItem.minWidth || 100,
        height: selectedItem.minDepth || 100,
        minWidth: selectedItem.minWidth,
        maxWidth: selectedItem.maxWidth,
        minDepth: selectedItem.minDepth,
        maxDepth: selectedItem.maxDepth,
      });
    }
  }, [showModal, selectedItem]);

  return (
    <div
      className="rempad fldc"
      style={{
        display: "flex",
        backgroundColor: plannerBg,
        color: plannerText,
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
        {/* Progress Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          {steps.map((step, index) => {
            const canNavigate = validateStepNavigation(step.name);
            return (
              <CustomTooltip key={index} message={step.tooltip}>
                <div
                  style={{
                    textAlign: "center",
                    flex: 1,
                    cursor: step.canNavigate ? "pointer" : "not-allowed",
                    opacity: step.canNavigate ? 1 : 0.5,
                  }}
                  onClick={() => canNavigate && setCurrentStep(step.name)}
                >
                  <div
                    className="progitems"
                    style={{
                      width: "25px",
                      height: "25px",
                      borderRadius: "50%",
                      backgroundColor:
                        currentStep === step.name
                          ? "#00bfff"
                          : completedSteps.includes(step.name)
                            ? "#4CAF50" // Green for completed
                            : "#ccc", // Gray for incomplete
                      margin: "0 auto",
                      lineHeight: "25px",
                      color: "#fff",
                    }}
                  >
                    {index + 1}
                  </div>
                  <p
                    className="progtxt"
                    style={{
                      fontSize: "12px",
                      marginTop: "5px",
                      color: step.canNavigate ? plannerText : "#999",
                    }}
                  >
                    {step.name}
                  </p>
                </div>
              </CustomTooltip>
            );
          })}
        </div>

        {/* Dynamic Content */}
        {renderStepContent()}
      </div>

      {/* Sidebar for Kitchen Options */}

      <div className="w-25 p-4 bg-gray-100 rounded-lg sidemenu">
        <h4 className="text-lg font-bold">Kitchen Options</h4>
        <p
          className="text-sm text-gray-500 paratext"
          style={{ textAlign: "left" }}
        >
          Drag and drop your items into our planner.
        </p>

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : null}

        <DndProvider backend={HTML5Backend}>
          {/* Base Cabinets */}
          <div className="mt-4">
            <Button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("base")}
            >
              <span className="text-left">Base Cabinets</span>
              <span className="text-right">
                {openSection === "base" ? "-" : "+"}
              </span>
            </Button>
            {openSection === "base" && (
              <div className="mt-2 c-flex drgbl">{renderCabinets("base")}</div>
            )}
          </div>

          {/* Tall Cabinets */}
          <div className="mt-4">
            <Button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("tall")}
            >
              <span className="text-left">Tall Cabinets</span>
              <span className="text-right">
                {openSection === "tall" ? "-" : "+"}
              </span>
            </Button>
            {openSection === "tall" && (
              <div className="mt-2 c-flex">{renderCabinets("tall")}</div>
            )}
          </div>

          {/* Finishing Panels */}
          <div className="mt-4">
            <Button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("finishing")}
            >
              <span className="text-left">Finishing Panels</span>
              <span className="text-right">
                {openSection === "finishing" ? "-" : "+"}
              </span>
            </Button>
            {openSection === "finishing" && (
              <div className="mt-2 c-flex">{renderCabinets("finishing")}</div>
            )}
          </div>

          {/* Wall Cabinets */}
          <div className="mt-4">
            <Button
              className="w-full text-left font-semibold optbtn"
              onClick={() => toggleSection("wall")}
            >
              <span className="text-left">Wall Cabinets</span>
              <span className="text-right">
                {openSection === "wall" ? "-" : "+"}
              </span>
            </Button>
            {openSection === "wall" && (
              <div className="mt-2 c-flex">{renderCabinets("wall")}</div>
            )}
          </div>
        </DndProvider>
      </div>

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
