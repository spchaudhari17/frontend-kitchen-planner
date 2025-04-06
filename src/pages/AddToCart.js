import React, { useState, useEffect } from "react";
import "./AddToCart.css";
import { useNavigate } from "react-router-dom";

const AddToCart = () => {

  const navigate = useNavigate()

  const [cartData, setCartData] = useState([]);
  const [handleQty, setHandleQty] = useState(1);
  const [hingeQty, setHingeQty] = useState(2);
  const [cabinetQty, setCabinetQty] = useState(1);
  const [showHandle, setShowHandle] = useState(true);
  const [showHinge, setShowHinge] = useState(true);
  const [showCabinet, setShowCabinet] = useState(true);

  // useEffect(() => {
  //   const storedCartData = localStorage.getItem("cartData");
  //   if (storedCartData) {
  //     setCartData(JSON.parse(storedCartData));
  //   }
  // }, []);

  useEffect(() => {
    const storedCartData = localStorage.getItem("cartData");
    if (storedCartData) {
      try {
        const parsedData = JSON.parse(storedCartData);
        if (Array.isArray(parsedData)) {
          setCartData(parsedData);
        } else {
          console.warn("cartData is not an array:", parsedData);
          setCartData([]); // fallback to empty array
        }
      } catch (error) {
        console.error("Error parsing cartData from localStorage:", error);
        setCartData([]);
      }
    }
  }, []);
  

  const removeItem = (index) => {
    const updatedCart = [...cartData];
    updatedCart.splice(index, 1);
    setCartData(updatedCart);
    localStorage.setItem("cartData", JSON.stringify(updatedCart));
  };

  const updateQty = (cartIndex, droppedIndex, change) => {
    const updatedCart = [...cartData];
    const item = updatedCart[cartIndex].droppedItems[droppedIndex];

    item.qty = Math.max(1, (item.qty || 1) + change);
    setCartData(updatedCart);
    localStorage.setItem("cartData", JSON.stringify(updatedCart));
  };


  // Calculate total price
  const calculateSubtotal = () => {
    let total = 0;
    cartData.forEach(cartItem => {
      cartItem.droppedItems.forEach(item => {
        total += (item.price || 0) * (item.qty || 1);
      });
    });
    console.log(total)
    return total;
  };



  return (
    <>
      <h1>Shopping Cart</h1>
      <div>

        {/* Handle  */}
        {
          showHandle && (
            <div className="cart-item d-flex mt-5" id="item-1">
              <div className="">
                <img
                  className="product-image"
                  src="//cabjaks.co.nz/cdn/shop/files/Standard_07592792-9316-4e64-ae70-f8bd3f5b803a_medium.webp?v=1721276017"
                  alt="Cabinet"
                />
              </div>
              <div className="cart-details">
                <h2>Handle Upgrade</h2>
                <p>
                  <strong>Style:</strong>{" "}
                  <span id="depth">Standard</span>
                </p>

                {/* <button className="rembutton" id="remove-item">
              Remove
            </button> */}

                <button className="rembutton" onClick={() => setShowHandle(false)}>Remove</button>
                <div className="d-flex">
                  <div className="quantity">
                    <button onClick={() => setHandleQty(Math.max(1, handleQty - 1))}>-</button>
                    <span>{handleQty}</span>
                    <button onClick={() => setHandleQty(handleQty + 1)}>+</button>
                  </div>
                  <p className="product-price">
                    <strong>Price:</strong> <span id="price">$0</span>
                  </p>
                </div>
              </div>
            </div>
          )
        }

        <hr />



        {/* Hinges */}
        {
          showHinge && (
            <div className="cart-item d-flex mt-5" id="item-1">
              <div className="">
                <img
                  className="product-image"
                  src="https://cabjaks.co.nz/cdn/shop/products/hinge-and-mount_grande_58c8ca02-48af-4225-a244-accbe2774414_large.jpg?v=1602707463"
                  alt="Cabinet"
                />
              </div>
              <div className="cart-details">
                <h2>Soft Close Hinge</h2>

                {/* <button className="rembutton" id="remove-item">
                  Remove
                </button> */}
                <button className="rembutton" id="remove-item" onClick={() => setShowHinge(false)}>Remove</button>

                <div className="d-flex">
                  <div className="quantity">
                    <button onClick={() => setHingeQty(Math.max(1, hingeQty - 1))}>-</button>
                    <span>{hingeQty}</span>
                    <button onClick={() => setHingeQty(hingeQty + 1)}>+</button>
                  </div>
                  <p className="product-price">
                    <strong>Price:</strong> <span id="price">$0</span>
                  </p>
                </div>
              </div>
            </div>
          )
        }

        <hr />


        <div className="">
          {cartData?.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartData.map((item, index) => (
              <div className="cart-item d-flex mt-5" id="item-1" key={index}>
                <div>
                  <img src={item?.droppedItems?.[0]?.imageSrc || "https://via.placeholder.com/120"} alt="Product" className="product-image" />
                </div>

                <div className="cart-details">
                  <h2>{item.description}</h2>
                  <p>
                    <strong>Width:</strong>
                    <span id="width">{item.width}mm</span>
                  </p>
                  <p>
                    <strong>Depth:</strong>
                    <span id="depth">{item.depth}mm</span>
                  </p>
                  <p>
                    <strong>Feet Option:</strong>
                    <span id="feet-option">Adjustable Feet</span>
                  </p>

                  <p>
                    <strong>Handle Side:</strong> <span id="handle-side">Left</span>
                  </p>
                  <p>
                    <strong>Hinge Type:</strong> <span id="hinge-type">Soft Close</span>
                  </p>

                  <button className="rembutton" id="remove-item" onClick={() => removeItem(index)}>Remove</button>

                  <div className="d-flex">

                    {/* <div className="quantity">
                      <button onClick={() => updateQty(index, -1)}>-</button>
                      <span>{item.qty || 1}</span>
                      <button onClick={() => updateQty(index, 1)}>+</button>
                    </div> */}

                    <div className="quantity">
                      <button onClick={() => updateQty(index, 0, -1)}>-</button>
                      <span>{item.droppedItems?.[0]?.qty || 1}</span>
                      <button onClick={() => updateQty(index, 0, 1)}>+</button>
                    </div>

                    {/* <p className="product-price">${(item?.droppedItems?.[0]?.price || 167).toFixed(2)}</p> */}
                    <p className="product-price">
                      ${(item.droppedItems?.[0]?.price || 167) * (item.droppedItems?.[0]?.qty || 1)}
                    </p>
                  </div>

                </div>



              </div>
            ))
          )}
        </div>

        <hr />

        {/* check out  */}
        {/* <div className="checkout-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <p>Sub Total: $186</p>
          <button className="checkout-button" style={{ backgroundColor: "black", color: "white", marginTop: "10px", padding: "10px 20px" }}>Checkout</button>
        </div> */}

        <div className="checkout-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <p>Sub Total: ${calculateSubtotal().toFixed(2)}</p>
          <button className="checkout-button"
            onClick={() => navigate("/shipping-address")}
           style={{ backgroundColor: "black", color: "white", marginTop: "10px", padding: "10px 20px" }}>Checkout</button>
        </div>



      </div>

    </>
  );
};

export default AddToCart;