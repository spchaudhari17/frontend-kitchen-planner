import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  Elements,
  AuBankAccountElement,
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
import { useLocation } from "react-router-dom";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = () => {
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const stripe = useStripe();
  const elements = useElements();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initialAmount = parseFloat(location.state?.subtotal || 0).toFixed(2);
  const selectedProducts = location.state?.cartItems || [];

  const [amount, setAmount] = useState(initialAmount.toString());
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    ifscCode: "",
  });
  const calculateDynamicPrice = (width) => {
    const minWidth = 400;
    const basePrice = 100;
    const extraPrice = 0.2;
    const extra = Math.max(0, width - minWidth);
    return basePrice + extra * extraPrice;
  };

  const formattedProducts = selectedProducts.map((item) => {
    const droppedItem = item.droppedItems?.[0];
    return {
      productId: droppedItem?._id || null,
      name: item.description || "Cabinet Item",
      priceAtPurchase: calculateDynamicPrice(droppedItem?.width || 0),
      quantity: droppedItem?.qty || 1,
      image: droppedItem?.imageSrc || "",
    };
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
        `${process.env.REACT_APP_SERVER_URL}/api/payment/create-payment-intent`,
        {
          userId: user._id,
          email: user.email,
          amount: parseFloat(amount) * 100,
          products: formattedProducts,
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
            email: user.email,
          },
        },
      });

      if (result.error) {
        setAlert({ type: "danger", message: result.error.message });
      } else if (result.paymentIntent) {
        const status = result.paymentIntent.status;

        switch (status) {
          case "succeeded":
            await axiosPrivate.post(
              `${process.env.REACT_APP_SERVER_URL}/api/payment/update-transaction`,
              {
                transaction_id: result.paymentIntent.id,
                userId: user._id,
                email: user.email,
                products: formattedProducts,
              }
            );

            setAlert({ type: "success", message: "Card payment successful!" });
            resetForm();
            break;

          case "processing":
            setAlert({
              type: "info",
              message:
                "Payment is processing. We'll notify you when it's complete.",
            });
            break;

          case "requires_action":
            setAlert({
              type: "warning",
              message:
                "Payment requires additional verification. Please complete the authentication.",
            });
            break;

          case "requires_payment_method":
            setAlert({
              type: "danger",
              message:
                "Payment failed. Please check your card details and try again.",
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

  const handleBankPayment = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setAlert({ type: "danger", message: "Stripe is not loaded yet." });
      return;
    }

    setLoading(true);
    setAlert({ type: "", message: "" }); // Clear previous alerts

    try {
      // 1. Create payment intent from backend
      const { data } = await axiosPrivate.post(
        `${process.env.REACT_APP_SERVER_URL}/api/payment/bank-transfer`,
        {
          userId: user._id,
          amount,
          email: user.email,
          name: user.name,
        }
      );

      // 2. Get the Stripe bank account element
      const bankAccountElement = elements.getElement(AuBankAccountElement);
      if (!bankAccountElement) {
        setAlert({ type: "danger", message: "Bank account element not found" });
        setLoading(false);
        return;
      }

      // 3. Confirm the BECS debit payment
      const result = await stripe.confirmAuBecsDebitPayment(data.clientSecret, {
        payment_method: {
          au_becs_debit: bankAccountElement,
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });

      // 4. Handle the result
      if (result.error) {
        console.error("Stripe BECS Error:", result.error);
        setAlert({ type: "danger", message: result.error.message });
      } else if (result.paymentIntent?.status === "succeeded") {
        setAlert({ type: "success", message: "Bank payment successful!" });
        resetForm();
      } else {
        setAlert({
          type: "warning",
          message:
            "Payment submitted but status: " + result.paymentIntent?.status,
        });
      }
    } catch (error) {
      console.error("Bank Transfer Error:", error);
      setAlert({
        type: "danger",
        message: "Failed to submit bank transfer. Please try again.",
      });
    } finally {
      setLoading(false);
    }
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
                  <Form.Label>Amount (NZD)</Form.Label>
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
                    <CardNumberElement
                      options={{ style: { base: { fontSize: "16px" } } }}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <div className="p-2 border rounded">
                    <CardExpiryElement
                      options={{ style: { base: { fontSize: "16px" } } }}
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>CVC</Form.Label>
                  <div className="p-2 border rounded">
                    <CardCvcElement
                      options={{ style: { base: { fontSize: "16px" } } }}
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={!stripe || loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Pay Now"
                  )}
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
              <Form onSubmit={handleBankPayment}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount (NZD)</Form.Label>
                  <Form.Control
                    type="number"
                    value={amount}
                    readOnly
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Bank Account</Form.Label>
                  <div className="p-2 border rounded">
                    <AuBankAccountElement
                      options={{ style: { base: { fontSize: "16px" } } }}
                      onReady={() => console.log("Ready")}
                      onChange={(e) => console.log("Change", e)}
                    />
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  variant="success"
                  disabled={!stripe || loading}
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Pay with Bank Account"
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
