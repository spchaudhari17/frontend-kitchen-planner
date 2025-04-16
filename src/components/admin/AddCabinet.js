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

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [searchText, setSearchText] = useState("");

    // State for modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCabinetId, setSelectedCabinetId] = useState(null);
    const { componentColors } = useColorContext();

    const defaultButtonColors = {
        background: '#007bff',
        text: '#ffffff'
    };

    const globalButtonBg = componentColors?.['Button']?.background || defaultButtonColors.background;
    const globalButtonText = componentColors?.['Button']?.text || defaultButtonColors.text;


    const defaultCabinetColors = {
        background: "#ffffff",
        text: "#000000"
    };

    const cabinetBg = componentColors?.["Add Cabinet"]?.background || defaultCabinetColors.background;
    const cabinetText = componentColors?.["Add Cabinet"]?.text || defaultCabinetColors.text;


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
        formData.append("minWidth", minWidth);
        formData.append("maxWidth", maxWidth);
        formData.append("minDepth", minDepth);
        formData.append("maxDepth", maxDepth);
        formData.append("hinges", hinges);
        formData.append("handles", handles);
        formData.append("drawers", drawers);


        if (cabinetImage) formData.append("cabinateImage", cabinetImage);
        if (cabinetFrontImage) formData.append("cabinateFrontImage", cabinetFrontImage);

        try {
            const response = await axios.post("http://localhost:3001/api/product/products",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status === 201) {
                // setMessage("Product added successfully!");
                setTitle("");
                setCabinetType("");
                setCabinetImage(null);
                setCabinetFrontImage(null);


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
            // setMessage("Cabinet deleted successfully!");
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
                backgroundColor: cabinetBg, // or set another for contrast
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
        { name: 'Sr.No', selector: (row, index) => index + 1, sortable: true, width: '100px' },
        { name: 'Name', selector: (row) => row.cabinateName || 'N/A', sortable: true, minWidth: '150px' },
        { name: 'Type', selector: (row) => row.cabinateType || 'N/A', sortable: true, minWidth: '150px' },
        {
            name: 'Cabinate Image',
            selector: (row) => row.cabinateImage ? <img src={row.cabinateImage} alt="Cabinet" width="50" /> : 'N/A',
            sortable: false,
            minWidth: '100px'
        },
        {
            name: 'Front Image',
            selector: (row) => row.cabinateImage ? <img src={row.cabinateFrontImage} alt="Cabinet" width="50" /> : 'N/A',
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
        <div className="container-fluid"  >
            <div className="WallList-wrapper bg-white rounded-3 p-3" >
                <div className="heading-wrapper d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3" style={{ backgroundColor: cabinetBg, color: cabinetText }}>
                    <h5 className="fw-bold m-0">All Cabinets</h5>
                    <Button
                        className="px-3 mt-3 mx-3"
                        onClick={handleShowAdd}
                        style={{ backgroundColor: globalButtonBg, color: globalButtonText }}
                    >
                        <i className="bi bi-person-add fs-18 lh-sm "></i> Add Cabinet
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

                <div className="table-responsive table-custom-wrapper product-table mt-3" style={{ backgroundColor: cabinetBg, color: cabinetText }}>
                    {error && <div className="alert alert-danger"  >{error}</div>}
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


            {/* Add Cabinet Modal */}
            <Modal show={showAddModal} centered onHide={handleCloseAdd}>
                <Modal.Body className="text-center px-md-5 py-5">
                    <h2 className="text-center mb-4 mt-3">Add Cabinet</h2>
                    {message && <div className="alert alert-info">{message}</div>}
                    {/* <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet Name" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <select id="cabinetType" placeholder="Cabinet Type" className="form-control" required value={cabinetType} onChange={(e) => setCabinetType(e.target.value)}>
                                <option value="">Select Cabinet Type</option>
                                <option value="base">Base Cabinets</option>
                                <option value="tall">Tall Cabinets</option>
                                <option value="finishing">Finishing Panels</option>
                                <option value="wall">Wall Cabinets</option>
                            </select>
                        </div>


                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet Min Width" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet Max Width" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet Min depth" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet Max depth" className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet No Of Hinges " className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet No Of Handles  " className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="text" id="title" placeholder="Cabinet No Of Drawers   " className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <input type="file" id="cabinetImage" required className="form-control" accept="image/*" onChange={(e) => setCabinetImage(e.target.files[0])} />
                        </div>

                        <div className="mb-3">
                            <input type="file" id="cabinetFrontImage" required className="form-control" accept="image/*" onChange={(e) => setCabinetImage(e.target.files[0])} />
                        </div>

                        <Button
                            type="submit"
                            className="w-100"
                            disabled={loading}
                            style={{ backgroundColor: globalButtonBg, color: globalButtonText }}
                        >
                            {loading ? "Submitting..." : "Submit"}
                        </Button>

                    </form> */}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <input type="text" placeholder="Cabinet Name" className="form-control" required
                                value={title} onChange={(e) => setTitle(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <select placeholder="Cabinet Type" className="form-control" required
                                value={cabinetType} onChange={(e) => setCabinetType(e.target.value)}>
                                <option value="">Select Cabinet Type</option>
                                <option value="base">Base Cabinets</option>
                                <option value="tall">Tall Cabinets</option>
                                <option value="finishing">Finishing Panels</option>
                                <option value="wall">Wall Cabinets</option>
                            </select>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <input type="number" placeholder="Min Width (mm)" className="form-control"
                                    value={minWidth} onChange={(e) => setMinWidth(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <input type="number" placeholder="Max Width (mm)" className="form-control"
                                    value={maxWidth} onChange={(e) => setMaxWidth(e.target.value)} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <input type="number" placeholder="Min Depth (mm)" className="form-control"
                                    value={minDepth} onChange={(e) => setMinDepth(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <input type="number" placeholder="Max Depth (mm)" className="form-control"
                                    value={maxDepth} onChange={(e) => setMaxDepth(e.target.value)} />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <input type="number" placeholder="No of Hinges" className="form-control"
                                    value={hinges} onChange={(e) => setHinges(e.target.value)} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <input type="number" placeholder="No of Handles" className="form-control"
                                    value={handles} onChange={(e) => setHandles(e.target.value)} />
                            </div>
                            <div className="col-md-4 mb-3">
                                <input type="number" placeholder="No of Drawers" className="form-control"
                                    value={drawers} onChange={(e) => setDrawers(e.target.value)} />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label>Top View Image</label>
                            <input type="file" className="form-control" required
                                accept="image/*" onChange={(e) => setCabinetImage(e.target.files[0])} />
                        </div>

                        <div className="mb-3">
                            <label>Front View Image</label>
                            <input type="file" className="form-control" required
                                accept="image/*" onChange={(e) => setCabinetFrontImage(e.target.files[0])} />
                        </div>

                        <Button type="submit" className="w-100" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                        </Button>
                    </form>


                </Modal.Body>
            </Modal>



            {/* Delete Cabinet Modal (FIXED) */}
            <Modal show={showDeleteModal} centered onHide={handleCloseDelete}>
                <Modal.Body className="text-center px-md-5 py-5">
                    <h4>Are you sure you want to delete this cabinet?</h4>
                    <div className="mt-4">
                        <Button
                            onClick={handleCloseDelete}
                            style={{ backgroundColor: globalButtonBg, color: globalButtonText }}
                        >
                            Cancel
                        </Button>

                        <Button
                            onClick={deleteCabinetHandler}
                            className="ms-3"
                            style={{ backgroundColor: globalButtonBg, color: globalButtonText }}
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
