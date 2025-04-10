import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  Form,
  Button,
  Container,
  Alert,
  Row,
  Col,
  Card,
  Spinner,
} from "react-bootstrap";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY );

const PaymentForm = () => {
  const axiosPrivate = useAxiosPrivate();
  const stripe = useStripe();
  const elements = useElements();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [amount, setAmount] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
  });

  const resetForm = () => {
    setAmount("");
    setBankDetails({ accountNumber: "", ifscCode: "" });
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
  
    setLoading(true);
    try {
      const { data } = await axiosPrivate.post(
        "http://localhost:3001/api/payment/create-payment-intent",
        {
          userId: user._id,
          amount: parseFloat(amount) * 100,
        }
      );
  
      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        setAlert({ type: "danger", message: "Card number is required" });
        setLoading(false);
        return;
      }
  
      const result = await stripe.confirmCardPayment(data.data, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: user.name || "Customer",
          },
        },
      });
  
      if (result.error) {
        // Stripe-specific error handling
        setAlert({ type: "danger", message: result.error.message });
      
      } else if (result.paymentIntent) {
        const status = result.paymentIntent.status;
      
        switch (status) {
          case "succeeded":
            await axiosPrivate.post("http://localhost:3001/api/payment/update-transaction", {
              transaction_id: result.paymentIntent.id,
              userId: user._id,
            });
            setAlert({ type: "success", message: "Card payment successful!" });
            resetForm();
            break;
      
          case "processing":
            setAlert({
              type: "info",
              message: "Payment is processing. We'll notify you when it's complete.",
            });
            break;
      
          case "requires_action":
            setAlert({
              type: "warning",
              message: "Payment requires additional verification. Please complete the authentication.",
            });
            break;
      
          case "requires_payment_method":
            setAlert({
              type: "danger",
              message: "Payment failed. Please check your card details and try again.",
            });
            break;
      
          default:
            setAlert({
              type: "danger",
              message: "Unexpected payment status: " + status,
            });
            break;
        }
      }
      
    } catch (err) {
      console.error("Card Payment Error:", err);
      setAlert({
        type: "danger",
        message: "Payment failed. Please try again.",
      });
    }
    setLoading(false);
  };
  

  const handleBankTransfer = async (e) => {
    e.preventDefault();
  
    if (!/^\d{9,18}$/.test(bankDetails.accountNumber)) {
      return setAlert({ type: "danger", message: "Invalid account number" });
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
      return setAlert({ type: "danger", message: "Invalid IFSC code" });
    }
  
    setLoading(true);
    try {
      const res = await axiosPrivate.post(
        "http://localhost:3001/api/payment/bank-transfer",
        {
          userId: user._id,
          amount: parseFloat(amount),
          accountNumber: bankDetails.accountNumber,
          ifscCode: bankDetails.ifscCode,
        }
      );
  
      if (res.data.success) {
        setAlert({
          type: "success",
          message: "Bank transfer submitted. Awaiting approval.",
        });
        resetForm();
      }
    } catch (err) {
      console.error("Bank Transfer Error:", err);
      setAlert({
        type: "danger",
        message: "Failed to submit bank transfer.",
      });
    }
    setLoading(false);
  };
  

  return (
    <Container className="my-5">
      <h3 className="mb-4 text-center">Secure Payment</h3>

      {alert.message && (
        <Alert
          variant={alert.type}
          onClose={() => setAlert({ message: "" })}
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      <Row>
        {/* Card Payment Section */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Pay with Card</Card.Title>
              <Form onSubmit={handleCardPayment}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Card Number</Form.Label>
                  <div className="p-2 border rounded">
                    <CardNumberElement options={{ style: { base: { fontSize: "16px" } } }} />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <div className="p-2 border rounded">
                    <CardExpiryElement options={{ style: { base: { fontSize: "16px" } } }} />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>CVC</Form.Label>
                  <div className="p-2 border rounded">
                    <CardCvcElement options={{ style: { base: { fontSize: "16px" } } }} />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={!stripe || loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Pay Now"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Bank Transfer Section */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title>Pay via Bank Transfer</Card.Title>
              <Form onSubmit={handleBankTransfer}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (USD)</Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      setBankDetails((prev) => ({
                        ...prev,
                        accountNumber: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>IFSC Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={bankDetails.ifscCode}
                    onChange={(e) =>
                      setBankDetails((prev) => ({
                        ...prev,
                        ifscCode: e.target.value,
                      }))
                    }
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="success"
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Submit Bank Transfer"
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const PaymentPage = () => (
  <Elements stripe={stripePromise}>
    <PaymentForm />
  </Elements>
);

export default PaymentPage;
