import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { Spinner, Card, Row, Col, Container, Alert } from "react-bootstrap";

const OrderProductDetails = () => {
  const { transactionId } = useParams();
  const location = useLocation();
  const selectedAddressId = location.state?.shippingAddressId;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [cartData, setCartData] = useState([]);
  const [orderDate, setOrderDate] = useState(null);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
  };

  // const fetchOrderProducts = async () => {
  //   try {
  //     setLoading(true);

  //     const response = await axios.get(
  //       `${process.env.REACT_APP_SERVER_URL}/api/payment/order-products/${transactionId}`
  //     );
  //     setProducts(response.data.data || []);
  //     setUserInfo(response.data.user || null);

  //     const shippingRes = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/shipping`);
  //     const allAddresses = shippingRes.data || [];

  //     if (selectedAddressId) {
  //       const matched = allAddresses.find(addr => addr._id === selectedAddressId);
  //       setShipping(matched || null);
  //     } else {
  //       // fallback: show latest address
  //       setShipping(allAddresses[allAddresses.length - 1] || null);
  //     }

  //   } catch (err) {
  //     console.error("Error loading ordered products:", err);
  //     setError("Failed to load ordered products.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchOrderProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/payment/order-products/${transactionId}`
      );
      setProducts(response.data.data || []);
      setUserInfo(response.data.user || null);
      setOrderDate(response.data.created_at || null);
 
      const shippingRes = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/shipping`
      );
      const allAddresses = shippingRes.data || [];
      if (selectedAddressId) {
        const matched = allAddresses.find(
          (addr) => addr._id === selectedAddressId
        );
        setShipping(matched || null);
      } else {
        setShipping(allAddresses[allAddresses.length - 1] || null);
      }

      if (response.data.user?._id) {
        const cartRes = await axios.get(
          `${process.env.REACT_APP_SERVER_URL}/api/cart/user/${response.data.user._id}`
        );
        console.log("Cart API response:", cartRes.data);
        setCartData(cartRes.data.data); // ✅ Correct
      }
    } catch (err) {
      console.error("Error loading ordered products:", err);
      setError("Failed to load ordered products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderProducts();
  }, [transactionId]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (products.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">No products found for this transaction.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Ordered Products</h3>
      <Row>
        {products.map((product, index) => (
          <Col md={4} sm={6} xs={12} key={product._id} className="mb-4">
            <Card className="shadow-sm">
              {product.image && (
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.name}
                  style={{ height: "200px", width: "100%", objectFit: "cover" }}
                />
              )}
              <Card.Body style={{ minHeight: "150px" }}>
                <Card.Title>Product Name: {product.name}</Card.Title>

                {orderDate && (
                  <p className="text-muted" style={{ marginTop: "-5px" }}>
                    <strong>Order Date:</strong> {formatDate(orderDate)}
                  </p>
                )}

                <Card.Text>
                  <strong>Price:</strong> ${product.priceAtPurchase?.toFixed(2)}
                  <br />
                  <strong>Quantity:</strong> {product.quantity}
                  <br />
                  <strong>Width:</strong> {product.width ?? "-"} mm
                  <br />
                  <strong>Depth:</strong> {product.depth ?? "-"} mm
                  <br />
                  {/* ✅ Inline Cart Details */}
                  {Array.isArray(cartData) && cartData[index] && (
                    <>
                      <strong>Description:</strong>{" "}
                      {cartData[index].description || "-"}
                      <br />
                      <strong>Subdescription:</strong>{" "}
                      {cartData[index].subdescription || "-"}
                      <br />
                      <strong>Notes:</strong>
                      <ul>
                        {cartData[index].notes ? (
                          Object.entries(cartData[index].notes).map(
                            ([key, val]) => (
                              <li key={key}>
                                <strong>{key}</strong>:{" "}
                                {Array.isArray(val)
                                  ? val.join(", ")
                                  : String(val)}
                              </li>
                            )
                          )
                        ) : (
                          <li>None</li>
                        )}
                      </ul>
                    </>
                  )}
                </Card.Text>

                {userInfo && (
                  <div className="mb-3">
                    <h5>User Information</h5>
                    <p>
                      <strong>Name:</strong> {userInfo.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {userInfo.email}
                    </p>
                  </div>
                )}

                {shipping && (
                  <div className="mb-3">
                    <h5>Delivery Address</h5>
                    <p>
                      {shipping.firstName} {shipping.lastName}
                    </p>
                    <p>
                      {shipping.addressLine1}, {shipping.addressLine2}
                    </p>
                    <p>
                      {shipping.city}, {shipping.region}, {shipping.postalCode}
                    </p>
                    <p>
                      <strong>Phone:</strong> {shipping.phone}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default OrderProductDetails;
