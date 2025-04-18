import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useColorContext } from "../../context/colorcontext";
import { Spinner } from "react-bootstrap";

const PendingTransactions = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);
  const { componentColors } = useColorContext();
   

  const defaultBg = componentColors?.["Pending Transactions"]?.background || "#fff";
  const defaultText = componentColors?.["Pending Transactions"]?.text || "#000";

  const fetchPendingData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3001/api/payment/pending-transactions");
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

  const columns = [
    { name: "Sr.No", selector: (row, index) => index + 1, width: "80px" },
    { name: "User ID", selector: (row) => row.user_id },
    { name: "Transaction ID", selector: (row) => row.transaction_id },
    { name: "Amount", selector: (row) => `$${row.amount}` },
    { name: "Method", selector: (row) => row.payment_method },
    {
        name: "Date",
        selector: (row) => {
          console.log("Row object:", row);  
          const d = new Date(row.created_at); 
          return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
        }
      }
      
      
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
      <h3 className="mb-4">Pending Transactions</h3>
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

export default PendingTransactions;
