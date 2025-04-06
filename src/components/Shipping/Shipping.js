import React, { useState } from "react";
import { Form, Button, Container, Row, Col, Card, ListGroup, FormCheck } from "react-bootstrap";

const ShippingAddressForm = () => {
  const [useSavedAddress, setUseSavedAddress] = useState(true);
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

  const savedAddresses = [
    {
      id: 1,
      name: "Home Address",
      address: "123 Main St, Auckland, 1010"
    },
    {
      id: 2,
      name: "Work Address",
      address: "456 Office Rd, Wellington, 6011"
    }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Container className="my-5">
      <Card>
        <Card.Body>
          <Card.Title className="mb-4">Shipping Address</Card.Title>
          
          <ListGroup className="mb-4">
            <ListGroup.Item 
              active={useSavedAddress}
              onClick={() => setUseSavedAddress(true)}
              style={{cursor: "pointer"}}
            >
              Saved Addresses
            </ListGroup.Item>
            <ListGroup.Item 
              active={!useSavedAddress}
              onClick={() => setUseSavedAddress(false)}
              style={{cursor: "pointer"}}
            >
              Use a new address
            </ListGroup.Item>
          </ListGroup>

          <hr className="mb-4" />

          {useSavedAddress ? (
            <div className="mb-4">
              <h5>Select a saved address</h5>
              <Form>
                {savedAddresses.map(addr => (
                  <FormCheck
                    key={addr.id}
                    type="radio"
                    id={`address-${addr.id}`}
                    name="savedAddress"
                    label={
                      <div>
                        <strong>{addr.name}</strong><br />
                        {addr.address}
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
                <Form.Label>Company (optional)</Form.Label>
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
                <Form.Label>Apartment, suite, etc. (optional)</Form.Label>
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
                  <Form.Label>Postal code</Form.Label>
                  <Form.Control 
                    name="postalCode"
                    value={address.postalCode}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Mobile phone number</Form.Label>
                <Form.Control 
                  name="phone"
                  value={address.phone}
                  onChange={handleChange}
                  type="tel"
                  required
                />
              </Form.Group>

              <Form.Check
                type="checkbox"
                id="receiveUpdates"
                label="Receive updates on shipping details via text"
                name="receiveUpdates"
                checked={address.receiveUpdates}
                onChange={handleChange}
                className="mb-4"
              />
            </Form>
          )}

          <div className="d-flex justify-content-between">
            <Button variant="outline-secondary">Return to cart</Button>
            <Button variant="primary">Continue to shipping</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ShippingAddressForm;