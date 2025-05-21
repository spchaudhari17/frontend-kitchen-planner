import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";

const MyAccount = () => {
  const [roomDetails, setRoomDetails] = useState([]);
  const navigate = useNavigate();

  const userInfoString = localStorage.getItem("user");
  const userInfo = JSON.parse(userInfoString);

  console.log("userInfo", userInfo._id)

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

  console.log("room", roomDetails)

  const deleteRoomPlan = async (roomId) => {
    try {
      console.log(roomId)
      await axios.delete(
        `${process.env.REACT_APP_SERVER_URL}/api/room-details/delete-room-details/${roomId}`
      );

      //  Filter out deleted room from UI
      setRoomDetails((prevRooms) => prevRooms.filter((room) => room._id !== roomId));

      console.log(`Room ${roomId} deleted successfully`);
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  };

  const handleOpenPlan = (room) => {
    navigate("/", {
      state: {
        roomDetails: room, // Passing full room details
        fromSavedPlans: true
      }
    });
  };

  
  return (
    <div className="container mt-4">
      <h1>My Account</h1>
      <hr />

      {/* Order History & Account Details */}
      <div className="row">
        <div className="col-md-8">
          <h4>Order History</h4>
          <p>You haven't placed any orders yet.</p>
        </div>
        <div className="col-md-4">
          <h4>Account Details</h4>
          <h5>{userInfo?.name || "User Name"}</h5>
          <p>
            <a href="/account/addresses" className="text-primary">
              View Addresses (0)
            </a>
          </p>
        </div>
      </div>

      {/* Saved Carts */}
      <div className="mt-4">
        <h4>Your Saved Carts</h4>
        <a
          href="/apps/savedcart"
          className="btn btn-info text-white"
          style={{ borderRadius: "0" }}
        >
          VIEW SAVED CARTS
        </a>
      </div>

      {/* Saved Plans */}
      <div className="mt-4">
        <h5>Your Saved Plans</h5>
        <hr
          className="mb-2"
          style={{ width: "70px", borderTop: "2px solid #009cde", fontWeight: "700" }}
        />


        {roomDetails.length > 0 ? (
          <div className="row">
            {roomDetails.map((room, index) => (
              <div key={index} className="col-md-3 mb-3">
                <div className="card" style={{ borderRadius: "0" }}>
                  <img
                    src="https://cdn.shopify.com/s/files/1/0383/0669/files/Cabjaks_place_holder.png?v=1593401742"
                    className="card-img-top bg-dark p-3"
                    style={{ borderRadius: "0", height: "150px", objectFit: "cover" }}
                  />
                  <div className="card-body text-center">
                    <h6 className="card-title fw-bold">{room.description || "No Name"}</h6>
                    <div className="d-flex justify-content-between border-top pt-2">
                      <button className="btn btn-sm btn-light rounded-0"
                        onClick={() => handleOpenPlan(room)}
                      >
                        <i className="bi bi-folder2-open"></i> Open
                      </button>
                      <button className="btn btn-sm btn-light rounded-0">
                        <i className="bi bi-pencil"></i> Rename
                      </button>
                      <button className="btn btn-sm btn-light text-danger rounded-0"
                        onClick={() => deleteRoomPlan(room._id)}>
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No saved plans found.</p>
        )}


      </div>
    </div>
  );
};

export default MyAccount;
