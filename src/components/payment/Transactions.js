import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useColorContext } from "../../context/colorcontext";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Transactions = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const { componentColors } = useColorContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setStatusMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewProducts = (transactionId) => {
    navigate(`/order-products/${transactionId}`);
  };

 

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payment/All-transactions`);
      setPendingList(response.data.data);
    } catch (err) {
      console.error("Error loading pending transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  const defaultBg = componentColors?.["Pending Transactions"]?.background || "#fff";
  const defaultText = componentColors?.["Pending Transactions"]?.text || "#000";

  const columns = [
    { name: "Sr.No", selector: (row, index) => index + 1, width: "80px" },
    { name: "User Email", selector: (row) => row.user_id?.email || "N/A" },
    { name: "Transaction ID", selector: (row) => row.transaction_id },
    { name: "Amount", selector: (row) => `$${row.amount}` },
    { name: "Method", selector: (row) => row.payment_method },
    {
      name: "Date",
      selector: (row) => {
        const d = new Date(row.created_at);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
      }
    },
    {
      name: "Status",
      cell: (row) => (
        <div style={{ position: "relative" }}>
          <span
            style={{ cursor: "pointer", fontSize: "18px" }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
              });
              setStatusMenuOpenId(statusMenuOpenId === row._id ? null : row._id);
            }}
          >
            ⋮
          </span>

          {statusMenuOpenId === row._id && (
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                boxShadow: "0px 2px 8px rgba(0,0,0,0.2)",
                zIndex: 9999,
              }}
            >
              {["Pending", "Progress", "Out for Delivery"].map((status) => (
                <div
                  key={status}
                  
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    backgroundColor: row.transaction_status === status ? "#f1f1f1" : "#fff",
                  }}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
    {
      name: "Actions",
      cell: (row) =>
        row.transaction_status === "success" ? (
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleViewProducts(row._id)}
          >
            View Products
          </button>
        ) : (
          <span className="text-muted">Pending</span>
        ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  const customStyles = {
    rows: {
      style: {
        backgroundColor: defaultBg,
        color: defaultText,
      },
    },
    headCells: {
      style: {
        backgroundColor: defaultBg,
        color: defaultText,
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        backgroundColor: defaultBg,
        color: defaultText,
      },
    },
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4">Transactions</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <DataTable
          columns={columns}
          data={pendingList}
          pagination
          highlightOnHover
          customStyles={customStyles}
          noDataComponent="No pending transactions found."
        />
      )}
    </div>
  );
};

export default Transactions;
