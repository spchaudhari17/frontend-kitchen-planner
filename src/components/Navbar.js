import { useState, useEffect } from "react";
import { axiosPrivate } from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";
import { useAuthContext } from "../context/auth";
import { useColorContext } from "../context/colorcontext";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import componentsConfig from "../config/componentsconfig.json";
import AlertMessage from "../components/ui/AlertMessage";
import ConfirmationDialog from "./ui/ConfirmationDialog";
import ColorPicker from "./colorpicker";
import { ROLES } from "../config/roles";
import Button from "./ui/Button";
import Modal from "./ui/Modal";
import { FaUser } from "react-icons/fa";
import { AiOutlineShoppingCart } from "react-icons/ai"; 

const Navbars = () => {
  const { logout } = useLogout();
  const { auth } = useAuthContext();
  const { componentColors, updateColor } = useColorContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [unsavedColors, setUnsavedColors] = useState({});
  const isAdmin = auth?.roles?.includes(ROLES.Admin);

  const fetchColors = async () => {
    try {
      const response = await axiosPrivate.get("/api/colors/get-colors");
      const colors = response.data;

      componentsConfig.forEach((component) => {
        if (colors[component.name]) {
          updateColor(
            component.name,
            typeof colors[component.name] === "string"
              ? JSON.parse(colors[component.name])
              : colors[component.name]
          );
        }
      });
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const handleSaveColorForComponent = (component, property, value) => {
    setUnsavedColors((prev) => ({
      ...prev,
      [component]: {
        ...prev[component],
        [property]: value,
      },
    }));

    updateColor(component, {
      ...componentColors[component],
      [property]: value,
    });

    setAlert({
      open: true,
      message: `${property.charAt(0).toUpperCase() + property.slice(1)} color for ${component} saved!`,
      severity: "success",
    });
  };

  const handleSaveColors = async () => {
    if (!Object.keys(unsavedColors).length) {
      setAlert({ open: true, message: "No changes to save!", severity: "info" });
      return;
    }

    try {
      const payload = Object.keys(unsavedColors).reduce((acc, key) => {
        acc[key] = unsavedColors[key];
        return acc;
      }, {});

      const response = await axiosPrivate.post("/api/colors/save-colors", payload);
      if (response.status === 200 || response.status === 201) {
        setAlert({ open: true, message: "Colors saved successfully!", severity: "success" });
        setUnsavedColors({});
      } else {
        setAlert({ open: true, message: "Failed to save colors.", severity: "error" });
      }
    } catch (error) {
      console.error("Error saving colors:", error);
      setAlert({ open: true, message: "An error occurred while saving colors.", severity: "error" });
    } finally {
      setConfirmDialogOpen(false);
      setShowModal(false);
    }
  };


  const myAccountFunction =() =>{
    alert("jg")
  }

  return (
    <>
      <Navbar
        collapseOnSelect
        expand="lg"
        style={{
          backgroundColor: componentColors.Navbars?.background || "#343a40",
          color: componentColors.Navbars?.text || "#ffffff",
        }}
        variant="dark"
      >
        <div className="container-fluid">
          <Navbar.Brand>
            <h3 style={{ color: componentColors.Navbars?.text || "#ffffff" }}>
              <Link to="/" style={{ color: componentColors.Navbars?.text || "#ffffff" }}>
                <FaHome />
              </Link>
              &ensp;Welcome
            </h3>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Navbar.Collapse className="justify-content-end">
              <Nav>
                {isAdmin && !["/login", "/signup", "/"].includes(location.pathname) && (
                  <Button
                    className="mx-3"
                    onClick={() => setShowModal(true)}
                    style={{
                      backgroundColor: componentColors.Button?.background || "transparent",
                      color: componentColors.Button?.text || "#ffffff",
                    }}
                  >
                    Color Picker
                  </Button>
                )}

                {auth && (
                  <Button
                    className="mx-3"
                    onClick={() => logout(auth._id)}
                    style={{
                      backgroundColor: componentColors.Button?.background || "transparent",
                      color: componentColors.Button?.text || "#ffffff",
                    }}
                  >
                    Log Out
                  </Button>
                )}

                {auth && (
                  <Button
                    className="mx-3"
                    onClick={() => navigate("/admin-add-cabinates")}
                    style={{
                      backgroundColor: componentColors.Button?.background || "transparent",
                      color: componentColors.Button?.text || "#ffffff",
                    }}
                  >
                    Add Cabinates
                  </Button>
                )}

                {/*profile icons */}
                {auth && (
                  <Button
                    className="mx-3"
                    onClick={() => navigate("/account")}
                    style={{
                      backgroundColor: componentColors.Button?.background || "transparent",
                      color: componentColors.Button?.text || "#ffffff",
                    }}
                  >
                  <FaUser />
                
                  </Button>
                )}

                {/* cart icon */}
                {auth && (
                  <Button
                    className="mx-3"
                    onClick={() => navigate("/cart")}
                    style={{
                      backgroundColor: componentColors.Button?.background || "transparent",
                      color: componentColors.Button?.text || "#ffffff",
                    }}
                  >
                  {/* <FaUser /> */}
                  <AiOutlineShoppingCart />
                
                  </Button>
                )}

                {!auth && (
            <>
              <Button
                variant="outline-primary"
                className="mx-2"
                onClick={() => (window.location.href = "/login")}
                style={{
                  backgroundColor: componentColors.Button?.background || "transparent",
                  color: componentColors.Button?.text || "#ffffff",
                }}
              >
                Login
              </Button>
              <Button
                variant="outline-success"
                className="mx-2"
                onClick={() => (window.location.href = "/signup")}
                style={{
                  backgroundColor: componentColors.Button?.background || "transparent",
                  color: componentColors.Button?.text || "#ffffff",
                }}
              >
                Signup
              </Button>
            </>
          )}
              </Nav>
            </Navbar.Collapse>
          </Navbar.Collapse>
        </div>
      </Navbar>

      <Modal show={showModal} onHide={() => setShowModal(false)} title="Change Component Colors">
        {componentsConfig.map((component) => (
          <div key={component.name} className="mb-4">
            <h5>{component.name}</h5>
            {component.properties.map((property) => (
              <ColorPicker
                key={property}
                component={component.name}
                property={property}
                color={componentColors[component.name]?.[property]}
                onSave={handleSaveColorForComponent}
              />
            ))}
          </div>
        ))}

        <div className="d-flex justify-content-end">
          <Button variant="primary" onClick={() => setConfirmDialogOpen(true)}>
            Save All
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="mx-3">
            Close
          </Button>
        </div>
      </Modal>

      <AlertMessage
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        message={alert.message}
        severity={alert.severity}
      />

      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleSaveColors}
        title="Save All Colors"
        description="Are you sure you want to save all the changes?"
      />
    </>
  );
};

export default Navbars;
