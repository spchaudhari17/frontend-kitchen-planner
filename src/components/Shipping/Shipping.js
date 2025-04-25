import React, { useState, useEffect } from "react";
import "./Shipping.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Shipping = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });


  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    company: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    phone: "",
    receiveUpdates: false,
  });


  // Cart data from previous page
  const subtotal = location.state?.subtotal || "0.00";
  const cartItems = location.state?.cartItems || [];
  const extras = location.state?.extras || {};

  console.log("subtotal", subtotal)


  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/shipping");
        setSavedAddresses(response.data);
      } catch (err) {
        setAlert({ open: true, message: "Failed to load addresses.", severity: "error" });
      }
    };
    fetchSavedAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/shipping", address);
      setSavedAddresses((prev) => [...prev, response.data.address]);
      setUseSavedAddress(true);
    } catch (err) {
      setAlert({ open: true, message: "Failed to save address.", severity: "error" });
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedSavedId && useSavedAddress) {
      setAlert({ open: true, message: "Please select an address before proceeding.", severity: "warning" });
      return;
    }
    navigate("/payment", {
      state: {
        subtotal: subtotal // or calculateTotalWithGST() if needed
      }
    });


  };

  return (
    <div className="CheckoutMain">
      <div className="CheckoutHeader">
        <h2>Kitchen Planner</h2>
        <nav>
          <ul>
            <li className="active"><span>Cart</span></li>
            <li><span>Information</span></li>
            <li><span>Shipping</span></li>
            <li><span>Payment</span></li>
          </ul>
        </nav>

        <div className="ContactInformation">
          <h2>Contact</h2>
          <p>chatwithdummy@gmail.com</p>
          <a>Log out</a>
          <label>
            <input type="checkbox" />
            Email me with news and offers
          </label>
        </div>

        <div className="ShippingAddressForm">
          <form>
            <h2>Shipping address</h2>
            <p>Select the address that matches your card method.</p>
            <select onChange={(e) => setUseSavedAddress(e.target.value === "saved")}>
              <option value="saved">Same as Shipping Address</option>
              <option value="new">Use a new address</option>
            </select>

            {useSavedAddress ? (
              <div style={{ marginTop: "10px" }}>
                {savedAddresses.map((addr) => (
                  <label key={addr._id}>
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedSavedId === addr._id}
                      onChange={() => setSelectedSavedId(addr._id)}
                    />
                    <span>
                      {addr.firstName} {addr.lastName}, {addr.addressLine1}, {addr.city}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="country"
                  value="New Zealand"
                  disabled
                />
                <div className="name-container">
                  <input
                    type="text"
                    className="fname"
                    placeholder="First name"
                    name="firstName"
                    value={address.firstName}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    className="lname"
                    placeholder="Last name"
                    name="lastName"
                    value={address.lastName}
                    onChange={handleChange}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Company (optional)"
                  name="company"
                  value={address.company}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Address"
                  name="addressLine1"
                  value={address.addressLine1}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  name="addressLine2"
                  value={address.addressLine2}
                  onChange={handleChange}
                />
                <div className="city-region">
                  <input
                    type="text"
                    className="City"
                    placeholder="City"
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    className="Region"
                    placeholder="Region"
                    name="region"
                    value={address.region}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    className="Postal"
                    placeholder="Postal code"
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Mobile phone number"
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                />
                <label>
                  <input
                    type="checkbox"
                    name="receiveUpdates"
                    checked={address.receiveUpdates}
                    onChange={handleChange}
                  />
                  Receive updates on shipping details via text
                </label>
              </>
            )}
          </form>
        </div>

        <div className="NavigationButtons">
          <button onClick={() => navigate("/cart")}>Return to cart</button>
          {useSavedAddress ? (
            <button onClick={handleContinueToPayment}>Continue to shipping</button>
          ) : (
            <button onClick={handleSubmit}>Save Address</button>
          )}
        </div>
      </div>

      {/* Order Summary (kept from your new UI) */}
      <div className="OrderSummary">
        {/* <div className="item">
          <span className="ItemIndex">
            <img src="https://placehold.co/400" alt="" />
          </span>
          <div className="innerProduct">
            <span className="ItemName">Handle Upgrade</span>
            <span className="ItemDescription">Standard</span>
          </div>
          <span className="ItemCost">FREE</span>
        </div>
        <div className="item">
          <span className="ItemIndex">
            <img src="https://placehold.co/400" alt="" />
          </span>
          <span className="ItemName">Soft Close Hinge</span>
          <span className="ItemCost">$9.60</span>
        </div> */}
        {extras?.handle && (
          <div className="item">
            <span className="ItemIndex">
              <img src="https://placehold.co/400" alt="" />
            </span>
            <div className="innerProduct">
              <span className="ItemName">{extras.handle.name}</span>
              <span className="ItemDescription">Standard</span>
            </div>
            <span className="ItemCost">
              ${extras.handle.price * extras.handle.qty}
            </span>
          </div>
        )}

        {extras?.hinge && (
          <div className="item">
            <span className="ItemIndex">
              <img src="https://placehold.co/400" alt="" />
            </span>
            <span className="ItemName">{extras.hinge.name}</span>
            <span className="ItemCost">
              ${(extras.hinge.price * extras.hinge.qty).toFixed(2)}
            </span>
          </div>
        )}

        <div>
          {cartItems.map((cartItem, index) => {
            const item = cartItem.droppedItems?.[0];
            const width = parseFloat(item?.width) || 0;
            const qty = item?.qty || 1;
            const price = 100 + Math.max(0, width - 400) * 0.2;
            const totalPrice = price * qty;

            return (
              <div className="item itmbreak" key={index}>
                <span className="ItemIndex">
                  <img src={item?.imageSrc || "https://placehold.co/400"} alt="" />
                </span>
                <div className="innerProduct">
                  <span className="ItemName">
                    {cartItem.description || "Cabinet Item"}
                  </span>
                  <span className="ItemDescription">
                    {width}mm / {item?.height || "N/A"}mm / Adjustable Feet
                    <br />
                    Handle Side: Left<br />
                    Hinge Type: Soft Close
                  </span>
                </div>
                <span className="ItemCost">${totalPrice.toFixed(2)}</span>
              </div>
            );
          })}

        </div>

        <div className="DiscountCode">
          <input type="text" placeholder="Discount code" />
          <button>Apply</button>
        </div>

        <div className="total">
          <div className="totals">
            <div>Subtotal - 3 items</div>
            <div>$236.31</div>
          </div>
          <div className="shippings">
            <div>Shipping</div>
            <p>Calculated at next step</p>
          </div>
          <div className="FinalTotal">
            <div>
              Total &nbsp;
              <span style={{ fontWeight: "normal" }}>(incl. GST)</span>
            </div>
            <div>NZD ${subtotal}</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Shipping;
