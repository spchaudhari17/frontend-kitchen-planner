import { useState } from "react";
import { useAuthContext } from "../context/auth";
import { useColorContext } from "../context/colorcontext";
import { BsFillPersonFill, BsPlusCircle } from "react-icons/bs";
import { FaAddressCard } from "react-icons/fa";
import { ListGroup, Nav } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Modal from "./ui/Modal";

const Status = () => {
  const { auth } = useAuthContext();
  const { componentColors } = useColorContext(); // Access component colors from context
  const navigate = useNavigate(); // For navigation
  const display = auth?.name && auth?.roles;
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Kitchen"); // Track active category in modal
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const defaultColors = {
    Staff: { background: "#dc3545", text: "#ffffff" },
    Admin: { background: "#ffc107", text: "#000000" },
    User: { background: "#007bff", text: "#ffffff" },
  };

  const backgroundColor =
    componentColors.Status?.background || defaultColors[auth?.roles]?.background || "#343a40";
  const textColor =
    componentColors.Status?.text || defaultColors[auth?.roles]?.text || "#ffffff";

  // Categories and their subcategories
  const categories = {
    Kitchen: ["Base", "Wall", "Tall", "Panels"],
    Wardrobes: ["Floor", "Wall-hung", "Panels", "Accessories"],
  };

  const handleSubcategoryClick = (category, subcategory) => {
    // Navigate to ProductList page with category and subcategory
    navigate(`/product-list/${category}/${subcategory}`);
    setShowModal(false);
  };

  const handleAddProduct = (category, subcategory) => {
    // Redirect to the ProductAdder page with category and subcategory
    navigate(`/add-product/${category}/${subcategory}`);
    setShowModal(false);
  };

  return (
    <>
      {display && (
        <div
          style={{
            backgroundColor,
            color: textColor,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          {/* User Info */}
          <div>
            <span className="mx-3 d-inline-flex align-items-center">
              <FaAddressCard className="fs-4" />
              &ensp;{auth.name}
            </span>
            <span className="d-inline-flex align-items-center">
              <BsFillPersonFill className="fs-4" />
              &ensp;{auth.roles}
            </span>
            <span>
              {/* Kitchen Planner Button */}
              {/* <Button onClick={() => setShowModal(true)} className="kitchen-planner-btn mx-4">
                Kitchen Planner
              </Button> */}

              
            </span>
          </div>


        </div>
      )}

      {/* Modal for Categories and Subcategories */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Products"
      >
        <>
          {/* Category Navigation Tabs */}
          <Nav
            variant="tabs"
            activeKey={activeCategory}
            onSelect={(selectedKey) => setActiveCategory(selectedKey)}
          >
            {Object.keys(categories).map((category, index) => (
              <Nav.Item key={index}>
                <Nav.Link eventKey={category}>{category}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Subcategories List with + Icon */}
          <ListGroup className="mt-3">
            {categories[activeCategory].map((subcategory, index) => (
              <ListGroup.Item
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <span onClick={() => handleSubcategoryClick(activeCategory, subcategory)}>
                  {subcategory}
                </span>
                <div
                  style={{ position: "relative" }}
                  onMouseEnter={() => setHoveredIcon(index)}
                  onMouseLeave={() => setHoveredIcon(null)}
                >
                  <BsPlusCircle
                    size={20}
                    style={{ cursor: "pointer", color: "#007bff" }}
                    onClick={() => handleAddProduct(activeCategory, subcategory)}
                  />
                  {hoveredIcon === index && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        backgroundColor: "black",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Add Product
                    </span>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      </Modal>
    </>
  );
};

export default Status;
