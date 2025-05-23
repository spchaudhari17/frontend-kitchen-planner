import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { FormControl, InputGroup, Modal } from "react-bootstrap";
import Button from "../ui/Button";
import { useColorContext } from "../../context/colorcontext";
 
const AddCabinet = () => {
  const [title, setTitle] = useState("");
  const [cabinetType, setCabinetType] = useState("");
  const [minWidth, setMinWidth] = useState("");
  const [maxWidth, setMaxWidth] = useState("");
  const [minDepth, setMinDepth] = useState("");
  const [maxDepth, setMaxDepth] = useState("");
  const [hinges, setHinges] = useState("");
  const [handles, setHandles] = useState("");
  const [drawers, setDrawers] = useState("");
  const [cabinetImage, setCabinetImage] = useState(null);
  const [cabinetFrontImage, setCabinetFrontImage] = useState(null);
  const [existingCabinetImage, setExistingCabinetImage] = useState("");
  const [existingCabinetFrontImage, setExistingCabinetFrontImage] = useState("");
 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [description, setDescription] = useState("");
  const [overlap, setOverlap] = useState("");
  const [basePrice, setBasePrice] = useState("");
 
  // State for modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCabinetId, setSelectedCabinetId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { componentColors } = useColorContext();
 
  const defaultButtonColors = {
    background: "#007bff",
    text: "#ffffff",
  };
 
  const globalButtonBg =
    componentColors?.["Button"]?.background || defaultButtonColors.background;
  const globalButtonText =
    componentColors?.["Button"]?.text || defaultButtonColors.text;
 
  const defaultCabinetColors = {
    background: "#ffffff",
    text: "#000000",
  };
 
  const cabinetBg =
    componentColors?.["Add Cabinet"]?.background ||
    defaultCabinetColors.background;
  const cabinetText =
    componentColors?.["Add Cabinet"]?.text || defaultCabinetColors.text;
 
  const handleCloseAdd = () => {
    setShowAddModal(false);
    setIsEditMode(false);
    resetForm();
  };
  const handleShowAdd = () => {
    setIsEditMode(false);
    resetForm();
    setShowAddModal(true);
  };
 
  const handleCloseDelete = () => setShowDeleteModal(false);
  const handleShowDelete = (id) => {
    setSelectedCabinetId(id);
    setShowDeleteModal(true);
  };
 
  const resetForm = () => {
    setTitle("");
    setCabinetType("");
    setMinWidth("");
    setMaxWidth("");
    setMinDepth("");
    setMaxDepth("");
    setHinges("");
    setHandles("");
    setDrawers("");
    setDescription("");
    setOverlap("");
    setBasePrice("");
    setCabinetImage(null);
    setCabinetFrontImage(null);
    setExistingCabinetImage("");
    setExistingCabinetFrontImage("");
  };
 
  const fetchProductById = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/product/products/${id}`
      );
      const product = response.data.product;
      setTitle(product.cabinateName || "");
      setCabinetType(product.cabinateType || "");
      setMinWidth(product.minWidth || "");
      setMaxWidth(product.maxWidth || "");
      setMinDepth(product.minDepth || "");
      setMaxDepth(product.maxDepth || "");
      setHinges(product.hinges || "");
      setHandles(product.handles || "");
      setDrawers(product.drawers || "");
      setDescription(product.description || "");
      setOverlap(product.overlap || "");
      setBasePrice(product.basePrice || "");
      setExistingCabinetImage(product.cabinateImage || "");
      setExistingCabinetFrontImage(product.cabinateFrontImage || "");
      setSelectedCabinetId(id);
      setIsEditMode(true);
      setShowAddModal(true);
    } catch (error) {
      console.error("Error fetching product:", error);
      setMessage("Error loading product details");
    }
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
 
    const formData = new FormData();
    formData.append("cabinateName", title);
    formData.append("cabinateType", cabinetType);
    formData.append("minWidth", minWidth);
    formData.append("maxWidth", maxWidth);
    formData.append("minDepth", minDepth);
    formData.append("maxDepth", maxDepth);
    formData.append("hinges", hinges);
    formData.append("handles", handles);
    formData.append("drawers", drawers);
    formData.append("description", description);
    formData.append("overlap", overlap);
    formData.append("basePrice", basePrice);
 
    if (cabinetImage) formData.append("cabinateImage", cabinetImage);
    if (cabinetFrontImage)
      formData.append("cabinateFrontImage", cabinetFrontImage);
 
    try {
      let response;
      if (isEditMode) {
        response = await axios.put(
          `${process.env.REACT_APP_SERVER_URL}/api/product/products/${selectedCabinetId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_SERVER_URL}/api/product/products`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }
 
      if (response.status === 200 || response.status === 201) {
        fetchProducts();
        handleCloseAdd();
      } else {
        setMessage(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.log("Add/Edit error", error);
      setMessage("Error processing request");
    } finally {
      setLoading(false);
    }
  };
 
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/product/products`
      );
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    }
  };
 
  useEffect(() => {
    fetchProducts();
  }, []);
 
  const deleteCabinetHandler = async () => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/api/product/products/${selectedCabinetId}`
      );
      setProducts(
        products.filter((product) => product._id !== selectedCabinetId)
      );
    } catch (error) {
      console.error("Error deleting cabinet:", error);
      setMessage("Error deleting cabinet");
    } finally {
      handleCloseDelete();
    }
  };
 
  const filteredCabinates = products.filter(
    (product) =>
      product.cabinateName?.toLowerCase().includes(searchText.toLowerCase()) ||
      product.cabinateType?.toLowerCase().includes(searchText.toLowerCase())
  );
 
  const customStyles = {
    table: {
      style: {
        backgroundColor: cabinetBg,
        color: cabinetText,
      },
    },
    rows: {
      style: {
        backgroundColor: cabinetBg,
        color: cabinetText,
        fontSize: "14px",
      },
    },
    headCells: {
      style: {
        fontSize: "14px",
        fontWeight: "700",
        padding: "12px",
        color: cabinetText,
        backgroundColor: cabinetBg,
      },
    },
    cells: {
      style: {
        fontSize: "14px",
        padding: "5px 12px",
        color: cabinetText,
        backgroundColor: cabinetBg,
      },
    },
  };
 
  const columns = [
    {
      name: "Sr.No",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "100px",
    },
    {
      name: "Name",
      selector: (row) => row.cabinateName || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Type",
      selector: (row) => row.cabinateType || "N/A",
      sortable: true,
      minWidth: "150px",
    },
    {
      name: "Description",
      selector: (row) => row.description || "N/A",
      sortable: false,
      minWidth: "200px",
    },
    {
      name: "Overlap",
      selector: (row) => row.overlap || "N/A",
      sortable: false,
      minWidth: "200px",
    },
    {
      name: "Base Price",
      selector: (row) => row.basePrice || "N/A",
      sortable: false,
      minWidth: "200px",
    },
    {
      name: "Cabinate Image",
      selector: (row) =>
        row.cabinateImage ? (
          <img src={row.cabinateImage} alt="Cabinet" width="50" />
        ) : (
          "N/A"
        ),
      sortable: false,
      minWidth: "100px",
    },
    {
      name: "Top Image",
      selector: (row) =>
        row.cabinateImage ? (
          <img src={row.cabinateFrontImage} alt="Cabinet" width="50" />
        ) : (
          "N/A"
        ),
      sortable: false,
      minWidth: "100px",
    },
    {
      name: "Actions",
      minWidth: "150px",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-danger"
            title="edit"
            onClick={() => fetchProductById(row._id)}
          >
            <i className="bi bi-pencil-fill"></i>
          </Button>
 
          <Button
            variant="outline-danger"
            title="Delete"
            onClick={() => handleShowDelete(row._id)}
          >
            <i className="bi bi-trash3-fill"></i>
          </Button>
        </div>
      ),
    },
  ];
 
  return (
    <div className="container-fluid">
      <div className="WallList-wrapper bg-white rounded-3 p-3">
        <div
          className="heading-wrapper d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3"
          style={{ backgroundColor: cabinetBg, color: cabinetText }}
        >
          <h5 className="fw-bold m-0">All Cabinets</h5>
          <Button
            className="px-3 mt-3 mx-3"
            onClick={handleShowAdd}
            style={{ backgroundColor: globalButtonBg, color: globalButtonText }}
          >
            <i className="bi bi-person-add fs-18 lh-sm "></i> Add Cabinet
          </Button>
 
          <InputGroup className="search-bar">
            <InputGroup.Text>
              <i className="bi bi-search"></i>
            </InputGroup.Text>
            <FormControl
              type="text"
              placeholder="Search cabinets..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </InputGroup>
        </div>
 
        <div
          className="table-responsive table-custom-wrapper product-table mt-3"
          style={{ backgroundColor: cabinetBg, color: cabinetText }}
        >
          {error && <div className="alert alert-danger">{error}</div>}
          <DataTable
            style={{ backgroundColor: cabinetBg, color: cabinetText }}
            columns={columns}
            data={filteredCabinates}
            dense
            pagination
            highlightOnHover
            responsive
            customStyles={customStyles}
            noDataComponent={<div>No Cabinets Available</div>}
          />
        </div>
      </div>
 
      {/* Add/Edit Cabinet Modal */}
      <Modal show={showAddModal} centered onHide={handleCloseAdd}>
        <Modal.Body className="text-center px-md-5 py-5">
          <div
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              margin: "10px",
              cursor: "pointer",
            }}
            onClick={handleCloseAdd}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="13"
              height="13"
              viewBox="0 0 13 13"
            >
              <g
                fill="none"
                fill-rule="evenodd"
                stroke-linecap="square"
                stroke-width="2"
              >
                <path
                  stroke="#B7B7B7"
                  d="M0 6.525L13 6.478"
                  transform="rotate(45 6.5 6.5)"
                ></path>
                <path
                  stroke="#4C4C4C"
                  d="M6.428 0L6.563 12.999"
                  transform="rotate(45 6.5 6.5)"
                ></path>
                <path
                  stroke="#B7B7B7"
                  d="M6.428 0L6.563 12.999"
                  transform="rotate(45 6.5 6.5)"
                ></path>
              </g>
            </svg>
          </div>
 
          <h2 className="text-center mb-4 mt-3">
            {isEditMode ? "Edit Cabinet" : "Add Cabinet"}
          </h2>
          {message && <div className="alert alert-info">{message}</div>}
 
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Cabinet Name"
                className="form-control"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
 
            <div className="mb-3">
              <select
                style={{
                  backgroundImage:
                    "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNSIgaGVpZ2h0PSIyNSIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9IiNiYmIiPjxwYXRoIGQ9Ik02IDlsNiA2IDYtNiIvPjwvc3ZnPg==)",
                  backgroundRepeat: "no-repeat",
                  position: "relative",
                  backgroundPosition: "right",
                }}
                placeholder="Cabinet Type"
                className="form-control"
                required
                value={cabinetType}
                onChange={(e) => setCabinetType(e.target.value)}
              >
                <option value="">Select Cabinet Type</option>
                <option value="base">Base Cabinets</option>
                <option value="tall">Tall Cabinets</option>
                <option value="finishing">Finishing Panels</option>
                <option value="wall">Wall Cabinets</option>
              </select>
            </div>
 
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  placeholder="Min Width (mm)"
                  className="form-control"
                  value={minWidth}
                  onChange={(e) => setMinWidth(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  placeholder="Max Width (mm)"
                  className="form-control"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                />
              </div>
            </div>
 
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  placeholder="Min Depth (mm)"
                  className="form-control"
                  value={minDepth}
                  onChange={(e) => setMinDepth(e.target.value)}
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  placeholder="Max Depth (mm)"
                  className="form-control"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(e.target.value)}
                />
              </div>
            </div>
 
            <div className="row">
              <div className="col-md-4 mb-3">
                <input
                  type="number"
                  placeholder="No of Hinges"
                  className="form-control"
                  value={hinges}
                  onChange={(e) => setHinges(e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <input
                  type="number"
                  placeholder="No of Handles"
                  className="form-control"
                  value={handles}
                  onChange={(e) => setHandles(e.target.value)}
                />
              </div>
              <div className="col-md-4 mb-3">
                <input
                  type="number"
                  placeholder="No of Drawers"
                  className="form-control"
                  value={drawers}
                  onChange={(e) => setDrawers(e.target.value)}
                />
              </div>
 
              <div className="col-md-4 mb-3">
                <input
                  type="number"
                  placeholder="Overlap number"
                  className="form-control"
                  value={overlap}
                  onChange={(e) => setOverlap(e.target.value)}
                />
              </div>
 
              <div className="col-md-4 mb-3">
                <input
                  type="number"
                  placeholder="BasePrice"
                  className="form-control"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
 
            </div>
            <div className="mb-3">
              <textarea
                placeholder="Description about the cabinet"
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
 
            <div className="mb-3">
              <label>Cabinate Image</label>
              {existingCabinetImage && (
                <div className="mb-2">
                  <img src={existingCabinetImage} alt="Current Cabinet" width="100" />
                  <p className="small text-muted">Current Image</p>
                </div>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setCabinetImage(e.target.files[0])}
              />
            </div>
 
            <div className="mb-3">
              <label>Top View Image</label>
              {existingCabinetFrontImage && (
                <div className="mb-2">
                  <img src={existingCabinetFrontImage} alt="Current Top View" width="100" />
                  <p className="small text-muted">Current Image</p>
                </div>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => setCabinetFrontImage(e.target.files[0])}
              />
            </div>
 
            <Button type="submit" className="w-100" disabled={loading}>
              {loading
                ? "Submitting..."
                : isEditMode
                  ? "Update Cabinet"
                  : "Add Cabinet"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
 
      {/* Delete Cabinet Modal */}
      <Modal show={showDeleteModal} centered onHide={handleCloseDelete}>
        <Modal.Body className="text-center px-md-5 py-5">
          <h4>Are you sure you want to delete this cabinet?</h4>
          <div className="mt-4">
            <Button
              onClick={handleCloseDelete}
              style={{
                backgroundColor: globalButtonBg,
                color: globalButtonText,
              }}
            >
              Cancel
            </Button>
 
            <Button
              onClick={deleteCabinetHandler}
              className="ms-3"
              style={{
                backgroundColor: globalButtonBg,
                color: globalButtonText,
              }}
            >
              Delete
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};
 
export default AddCabinet;
 