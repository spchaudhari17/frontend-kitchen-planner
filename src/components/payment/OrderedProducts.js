import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Spinner, Card, Row, Col, Container, Alert } from "react-bootstrap";

const OrderProductDetails = () => {
  const { transactionId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrderProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_SERVER_URL}/api/payment/order-products/${transactionId}`
      );      
      setProducts(response.data.data || []);  
      console.log("Ordered products:", response.data.data);
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
        {products.map((product) => (
          <Col md={4} sm={6} xs={12} key={product._id} className="mb-4">
            <Card className="shadow-sm">
              {product.image && (
                <Card.Img
                  variant="top"
                  src={product.image}
                  alt={product.productName}
                  style={{ height: "200px", width: "100%", objectFit: "cover" }}
                />
              )}
              <Card.Body style={{ minHeight: "150px" }}>
                <Card.Title>{product.productName}</Card.Title>
                <Card.Text>
                  <strong>Price:</strong> ${product.priceAtPurchase?.toFixed(2)}
                  <br />
                  <strong>Quantity:</strong> {product.quantity}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default OrderProductDetails;
