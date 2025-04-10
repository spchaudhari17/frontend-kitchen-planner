import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  FormCheck
} from "react-bootstrap";
import AlertMessage from "../ui/AlertMessage";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ShippingAddressForm = () => {
  const [useSavedAddress, setUseSavedAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSavedId, setSelectedSavedId] = useState(null);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const navigate = useNavigate();

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
    receiveUpdates: false
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchSavedAddresses = async () => {
      try {
        const response = await axios.get("http://localhost:3001/api/shipping");
        setSavedAddresses(response.data);
      } catch (err) {
        console.error("Error fetching saved addresses:", err);
        setAlert({
          open: true,
          message: "Failed to load addresses.",
          severity: "error"
        });
      }
    };

    fetchSavedAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/shipping", address);
      setAlert({
        open: true,
        message: "Address saved successfully!",
        severity: "success"
      });

      // Add to saved list and switch view
      setSavedAddresses((prev) => [...prev, response.data.address]);
      setUseSavedAddress(true);
    } catch (err) {
      console.error("Error saving address:", err);
      setAlert({
        open: true,
        message: "Failed to save address.",
        severity: "error"
      });
    }
  };

  const handleContinueToPayment = () => {
    if (!selectedSavedId) {
      setAlert({
        open: true,
        message: "Please select an address before proceeding.",
        severity: "warning"
      });
      return;
    }

    // Optional: Pass selected address ID to payment page
    navigate("/payment", {
      state: { shippingAddressId: selectedSavedId }
    });
  };

  return (
    <Container className="my-5">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Shipping Address</Card.Title>

          {/* Alert Message */}
          <AlertMessage
            open={alert.open}
            onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
            message={alert.message}
            severity={alert.severity}
          />

          {/* Address type toggle */}
          <ListGroup className="mb-4">
            <ListGroup.Item
              active={useSavedAddress}
              onClick={() => setUseSavedAddress(true)}
              style={{ cursor: "pointer" }}
            >
              Saved Addresses
            </ListGroup.Item>
            <ListGroup.Item
              active={!useSavedAddress}
              onClick={() => setUseSavedAddress(false)}
              style={{ cursor: "pointer" }}
            >
              Use a new address
            </ListGroup.Item>
          </ListGroup>

          {/* Saved Address List */}
          {useSavedAddress ? (
            <div className="mb-4">
              <h5>Select a saved address</h5>
              <Form>
                {savedAddresses.map((addr) => (
                  <FormCheck
                    key={addr._id}
                    type="radio"
                    name="savedAddress"
                    id={`address-${addr._id}`}
                    checked={selectedSavedId === addr._id}
                    onChange={() => setSelectedSavedId(addr._id)}
                    label={
                      <div>
                        <strong>{addr.firstName} {addr.lastName}</strong>
                        <br />
                        {addr.addressLine1}, {addr.city}, {addr.postalCode}
                      </div>
                    }
                  />
                ))}
              </Form>
            </div>
          ) : (
            <Form>
              <h5 className="mb-3">Country/Region</h5>
              <Form.Group className="mb-3">
                <Form.Control as="select" value="New Zealand" disabled>
                  <option>New Zealand</option>
                </Form.Control>
              </Form.Group>

              <Row className="mb-3">
                <Col>
                  <Form.Label>First name</Form.Label>
                  <Form.Control
                    name="firstName"
                    value={address.firstName}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col>
                  <Form.Label>Last name</Form.Label>
                  <Form.Control
                    name="lastName"
                    value={address.lastName}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Company</Form.Label>
                <Form.Control
                  name="company"
                  value={address.company}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="addressLine1"
                  value={address.addressLine1}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Apartment, suite, etc.</Form.Label>
                <Form.Control
                  name="addressLine2"
                  value={address.addressLine2}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    name="city"
                    value={address.city}
                    onChange={handleChange}
                    required
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Region</Form.Label>
                  <Form.Control
                    name="region"
                    value={address.region}
                    onChange={handleChange}
                  />
                </Col>
                <Col md={3}>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Mobile Phone</Form.Label>
                <Form.Control
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Check
                type="checkbox"
                id="receiveUpdates"
                label="Receive shipping updates via text"
                name="receiveUpdates"
                checked={address.receiveUpdates}
                onChange={handleChange}
                className="mb-4"
              />
            </Form>
          )}

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={() => navigate("/cart")}>
              Return to Cart
            </Button>

            {useSavedAddress ? (
              <Button
                variant="primary"
                disabled={!selectedSavedId}
                onClick={handleContinueToPayment}
              >
                Continue to Payment
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit}>
                Save Address
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShippingAddressForm;
