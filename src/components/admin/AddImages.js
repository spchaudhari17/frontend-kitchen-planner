import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { Button, FormControl, InputGroup, Modal } from "react-bootstrap";

const AddImages = () => {
    const [title, setTitle] = useState("");
    const [cabinetType, setCabinetType] = useState("");
    const [cabinetImage, setCabinetImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");

    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCabinetId, setSelectedCabinetId] = useState(null);

    const handleCloseAdd = () => setShowAddModal(false);
    const handleShowAdd = () => setShowAddModal(true);

    const handleCloseDelete = () => setShowDeleteModal(false);
    const handleShowDelete = (id) => {
        setSelectedCabinetId(id);
        setShowDeleteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("cabinateName", title);
        formData.append("cabinateType", cabinetType);
        if (cabinetImage) {
            formData.append("cabinateImage", cabinetImage);
        }

        try {
            const response = await axios.post("http://localhost:3001/api/product/products",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status === 201) {
                setMessage("Product added successfully!");
                setTitle("");
                setCabinetType("");
                setCabinetImage(null);
                fetchProducts();
                handleCloseAdd(); // Close modal after submission
            } else {
                setMessage(`Error: ${response.data.message}`);
            }
        } catch (error) {
            console.log("Add error", error);
            setMessage("Error adding product");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get("http://localhost:3001/api/product/products");
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
            await axios.delete(`http://localhost:3001/api/product/products/${selectedCabinetId}`);
            setProducts(products.filter(product => product._id !== selectedCabinetId));
            setMessage("Cabinet deleted successfully!");
        } catch (error) {
            console.error("Error deleting cabinet:", error);
            setMessage("Error deleting cabinet");
        } finally {
            handleCloseDelete();
        }
    };

    const filteredCabinates = products.filter((product) =>
        product.cabinateName?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.cabinateType?.toLowerCase().includes(searchText.toLowerCase())
    );

    const customStyles = {
        rows: { style: { fontSize: "14px" } },
        headCells: {
            style: {
                fontSize: "14px",
                fontWeight: '700',
                padding: "12px",
                color: "#fff",
                backgroundColor: 'var(--bs-primary)',
            },
        },
        cells: { style: { color: '#31373d', fontSize: "14px", padding: "5px 12px" } },
    };

    const columns = [
        { name: 'Sr.No', selector: (row, index) => index + 1, sortable: true, width: '100px' },
        { name: 'Title', selector: (row) => row.cabinateName || 'N/A', sortable: true, minWidth: '150px' },
        { name: 'Type', selector: (row) => row.cabinateType || 'N/A', sortable: true, minWidth: '150px' },
        {
            name: 'Image',
            selector: (row) => row.cabinateImage ? <img src={row.cabinateImage} alt="Cabinet" width="50" /> : 'N/A',
            sortable: false,
            minWidth: '100px'
        },
        {
            name: 'Actions',
            minWidth: '150px',
            cell: (row) => (
                <div className='d-flex gap-2'>
                    <Button variant='outline-danger' title='Delete' onClick={() => handleShowDelete(row._id)}>
                        <i className='bi bi-trash3-fill'></i>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="container-fluid">
            <div className="WallList-wrapper bg-white rounded-3 p-3">
                <div className="heading-wrapper d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                    <h5 className="fw-bold m-0">All Cabinets</h5>
                    <Button variant="success" className='px-3' onClick={handleShowAdd}>
                        <i className="bi bi-person-add fs-18 lh-sm"></i> Add Cabinet
                    </Button>
                    <InputGroup className="search-bar">
                        <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                        <FormControl
                            type="text"
                            placeholder="Search cabinets..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </InputGroup>
                </div>

                <div className="table-responsive table-custom-wrapper product-table mt-3">
                    {error && <div className="alert alert-danger">{error}</div>}
                    <DataTable
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

            {/* Add Cabinet Modal */}
            <Modal show={showAddModal} centered onHide={handleCloseAdd}>
                <Modal.Body className="text-center px-md-5 py-5">
                    <h2 className="text-center mb-4">Add Cabinet</h2>
                    {message && <div className="alert alert-info">{message}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">Cabinet Name</label>
                            <input type="text" id="title" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="cabinetType" className="form-label">Cabinet Type</label>
                            <select id="cabinetType" className="form-control" required value={cabinetType} onChange={(e) => setCabinetType(e.target.value)}>
                                <option value="">Select Cabinet Type</option>
                                <option value="base">Base Cabinets</option>
                                <option value="tall">Tall Cabinets</option>
                                <option value="finishing">Finishing Panels</option>
                                <option value="wall">Wall Cabinets</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="cabinetImage" className="form-label">Upload Cabinet Image</label>
                            <input type="file" id="cabinetImage" required className="form-control" accept="image/*" onChange={(e) => setCabinetImage(e.target.files[0])} />
                        </div>
                        <Button type="submit" variant="success" className="w-100" disabled={loading}>{loading ? "Submitting..." : "Submit"}</Button>
                    </form>
                </Modal.Body>
            </Modal>



            {/* Delete Cabinet Modal (FIXED) */}
            <Modal show={showDeleteModal} centered onHide={handleCloseDelete}>
                <Modal.Body className="text-center px-md-5 py-5">
                    <h4>Are you sure you want to delete this cabinet?</h4>
                    <div className="mt-4">
                        <Button variant="secondary" onClick={handleCloseDelete}>Cancel</Button>
                        <Button variant="danger" onClick={deleteCabinetHandler} className="ms-3">Delete</Button>
                    </div>
                </Modal.Body>
            </Modal>

        </div>
    );
};

export default AddImages;
