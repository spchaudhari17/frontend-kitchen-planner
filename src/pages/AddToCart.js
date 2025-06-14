import React, { useState, useEffect } from "react";
import "./AddToCart.css";
import { useNavigate } from "react-router-dom";

const AddToCart = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState([]);
  const [handleQty, setHandleQty] = useState(1);
  const [hingeQty, setHingeQty] = useState(0);

  const [showHandle, setShowHandle] = useState(true);
  const [showHinge, setShowHinge] = useState(true);

  useEffect(() => {
    const fetchCartData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) return;

      try {
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/cart/user/${user._id}`);
        const result = await response.json();
        if (result.success) {
          setCartData(result.data);
        } else {
          console.error("Failed to fetch cart:", result.error);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }
    };

    fetchCartData();
  }, []);

  //for hinges
  useEffect(() => {
  if (cartData.length === 0) return;

  let totalHinges = 0;

  cartData.forEach(cartItem => {
    cartItem.droppedItems.forEach(item => {
      const itemHinges = parseInt(item.hinges) || 0;
      const qty = item?.qty || 1;
      totalHinges += itemHinges * qty;
    });
  });

  setHingeQty(totalHinges);
}, [cartData]);


// for handles
useEffect(() => {
  if (cartData.length === 0) return;

  let totalHandles = 0;

  cartData.forEach(cartItem => {
    cartItem.droppedItems.forEach(item => {
      const itemHandles = parseInt(item.handles) || 0;
      const qty = item?.qty || 1;
      totalHandles += itemHandles * qty;
    });
  });

  setHandleQty(totalHandles);
}, [cartData]);



  const removeItem = async (itemIdToDelete) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?._id || !itemIdToDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/api/cart/${user._id}/${itemIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      const result = await response.json();
      if (result.success) {
        const updatedCart = cartData.map(cart => ({
          ...cart,
          droppedItems: cart.droppedItems.filter(item => item.id !== itemIdToDelete)
        })).filter(cart => cart.droppedItems.length > 0);

        setCartData(updatedCart);
      } else {
        console.error("Failed to delete item:", result.error);
      }
    } catch (error) {
      console.error("Delete API failed:", error);
    }
  };

  const updateQty = (cartIndex, droppedIndex, change) => {
    const updatedCart = [...cartData];
    const item = updatedCart[cartIndex].droppedItems[droppedIndex];

    item.qty = Math.max(1, (item.qty || 1) + change);
    setCartData(updatedCart);
    localStorage.setItem("cartData", JSON.stringify(updatedCart));
  };

  // Dynamic price calculation based on width, minWidth, basePrice
  const calculateDynamicPrice = (item) => {
    const width = parseFloat(item?.width) || 0;
    const minWidth = parseFloat(item?.minWidth) || 400; // Default minWidth if not provided
    const basePrice = parseFloat(item?.basePrice) || 100; // Default basePrice if not provided
    const extraPrice = 0.2; // Fixed extra price per mm

    // Calculate extra width beyond minWidth
    const extraWidth = Math.max(0, width - minWidth);
    return basePrice + (extraWidth * extraPrice);
  };

  // Calculate subtotal for all cabinet items only
  const calculateSubtotal = () => {
    let total = 0;
    cartData.forEach(cartItem => {
      cartItem.droppedItems.forEach(item => {
        const price = calculateDynamicPrice(item);
        const qty = item?.qty || 1;
        total += price * qty;
      });
    });
    return total;
  };

  // Calculate total with GST (3%) for cabinet items only
  const calculateTotalWithGST = () => {
    const subtotal = calculateSubtotal();
    const gst = subtotal * 0.03;
    return subtotal + gst;
  };

  return (
    <>
      <h1>Shopping Cart</h1>

      <div>
        {cartData.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            {/* Handle Upgrade Section - Display only */}
            {showHandle && (
              <div className="cart-item d-flex mt-5" id="item-1">
                <div>
                  <img
                    className="product-image"
                    src="//cabjaks.co.nz/cdn/shop/files/Standard_07592792-9316-4e64-ae70-f8bd3f5b803a_medium.webp?v=1721276017"
                    alt="Cabinet"
                  />
                </div>
                <div className="cart-details">
                  <h2>Handle Upgrade</h2>
                  <p><strong>Style:</strong> Standard</p>
                  <div className="d-flex">
                    <div className="quantity">
                      <button onClick={() => setHandleQty(Math.max(1, handleQty - 1))}>-</button>
                      <span>{handleQty}</span>
                      <button onClick={() => setHandleQty(handleQty + 1)}>+</button>
                    </div>
                    <p className="product-price">
                      <strong>Price:</strong> $0
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hinges Section - Display only */}
            {showHinge && (
              <div className="cart-item d-flex mt-5" id="item-1">
                <div>
                  <img
                    className="product-image"
                    src="https://cabjaks.co.nz/cdn/shop/products/hinge-and-mount_grande_58c8ca02-48af-4225-a244-accbe2774414_large.jpg?v=1602707463"
                    alt="Cabinet"
                  />
                </div>
                <div className="cart-details">
                  <h2>Soft Close Hinge</h2>
                  <div className="d-flex">
                    <div className="quantity">
                      <button onClick={() => setHingeQty(Math.max(1, hingeQty - 1))}>-</button>
                      <span>{hingeQty}</span>
                      <button onClick={() => setHingeQty(hingeQty + 1)}>+</button>
                    </div>
                    <p className="product-price">
                      <strong>Price:</strong> $0 (included)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <hr />

            {/* Main Cart Items */}
            <div>
              {cartData.map((cart, cartIndex) => (
                cart.droppedItems.map((item, itemIndex) => {
                  const price = calculateDynamicPrice(item);
                  const qty = item?.qty || 1;
                  const totalPrice = price * qty;

                  return (
                    <div className="cart-item d-flex mt-5" key={`${cartIndex}-${itemIndex}`}>
                      <div>
                        <img
                          src={item?.imageSrc || "https://via.placeholder.com/120"}
                          alt="Cabinet"
                          className="product-image"
                        />
                      </div>
                      <div className="cart-details">
                        <h2>{item?.name || "Cabinet Item"}</h2>
                        <p><strong>Width:</strong> {item?.width}mm (Min: {item?.minWidth}mm, Max: {item?.maxWidth}mm)</p>
                        <p><strong>Depth:</strong> {item?.height}mm</p>
                        <p><strong>Base Price:</strong> ${item?.basePrice || 100}</p>
                        <p><strong>Price Calculation:</strong>
                          ${item?.basePrice} (base) +
                          (${item?.width - item?.minWidth}mm × $0.20) =
                          ${price.toFixed(2)}
                        </p>

                        <p>hinges ${item.hinges} </p>
                        <p>handles ${item.handles} </p>
                        <button className="rembutton" onClick={() => removeItem(item?.id)}>Remove</button>
                        <div className="d-flex">
                          <div className="quantity">
                            <button onClick={() => updateQty(cartIndex, itemIndex, -1)}>-</button>
                            <span>{qty}</span>
                            <button onClick={() => updateQty(cartIndex, itemIndex, 1)}>+</button>
                          </div>
                          <p className="product-price">${totalPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ))}
            </div>

            <hr />

            {/* Checkout Section - Only cabinet totals */}
            <div className="checkout-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <p><strong>Subtotal:</strong> ${calculateSubtotal().toFixed(2)}</p>
              <p><strong>GST (3%):</strong> ${(calculateSubtotal() * 0.03).toFixed(2)}</p>
              <p><strong>Total:</strong> ${calculateTotalWithGST().toFixed(2)}</p>

              <button
                className="checkout-button"
                onClick={() =>
                  navigate("/shipping-address", {
                    state: {
                      subtotal: calculateTotalWithGST().toFixed(2),
                      cartItems: cartData,
                      // Still passing extras data but not including in calculation
                      extras: {
                        handle: showHandle ? { name: "Handle Upgrade", price: 0, qty: handleQty } : null,
                        hinge: showHinge ? { name: "Soft Close Hinge", price: 0, qty: hingeQty } : null,
                      }
                    }
                  })
                }
                style={{
                  backgroundColor: "black",
                  color: "white",
                  marginTop: "10px",
                  padding: "10px 20px"
                }}
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddToCart;