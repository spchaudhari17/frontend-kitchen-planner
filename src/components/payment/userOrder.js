import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useColorContext } from "../../context/colorcontext";
import { Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/auth";

const UserOrders = () => {
  const [orderList, setOrderList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { componentColors } = useColorContext();
  const { auth } = useAuthContext();
  const navigate = useNavigate();
const fetchUserOrders = async () => {
  try {
    setLoading(true);
    const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/payment/All-transactions`);
    const allTransactions = response.data.data;

    // Filter only current user's transactions
    const userOrders = allTransactions.filter(
      (tx) => tx.user_id?._id === auth._id
    );

    setOrderList(userOrders); // ✅ use correct state updater
  } catch (err) {
    console.error("Error loading transactions:", err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (auth?._id) fetchUserOrders();
  }, [auth]);

  const handleViewProducts = (transactionId) => {
    navigate(`/order-products/${transactionId}`);
  };

  const defaultBg = componentColors?.["User Orders"]?.background || "#fff";
  const defaultText = componentColors?.["User Orders"]?.text || "#000";

  const columns = [
    { name: "Sr.No", selector: (row, index) => index + 1, width: "80px" },
    { name: "Transaction ID", selector: (row) => row.transaction_id },
    { name: "Amount", selector: (row) => `$${row.amount}` },
    { name: "Method", selector: (row) => row.payment_method },
    {
      name: "Date",
      selector: (row) => {
        const d = new Date(row.created_at);
        return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
      },
    },
    {
      name: "Status",
      selector: (row) => row.transaction_status,
      cell: (row) => (
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "12px",
            backgroundColor:
              row.transaction_status === "delivered"
                ? "#d4edda"
                : row.transaction_status === "Out of Delivery"
                ? "#ffeeba"
                : row.transaction_status === "Progress"
                ? "#d1ecf1"
                : "#f8d7da",
            color:
              row.transaction_status === "delivered"
                ? "#155724"
                : row.transaction_status === "Out of Delivery"
                ? "#856404"
                : row.transaction_status === "Progress"
                ? "#0c5460"
                : "#721c24",
            fontWeight: "500",
            fontSize: "0.85rem",
          }}
        >
          {row.transaction_status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) =>
        row.transaction_status !== "Pending" ? (
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
      <h3 className="mb-4">My Orders</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <DataTable
          columns={columns}
          data={orderList}
          pagination
          highlightOnHover
          customStyles={customStyles}
          noDataComponent="No orders found."
        />
      )}
    </div>
  );
};

export default UserOrders;
