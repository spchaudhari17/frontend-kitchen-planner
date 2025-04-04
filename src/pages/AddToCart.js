import React, { useState, useEffect } from "react";
import "./AddToCart.css";

const AddToCart = () => {

  const [cartData, setCartData] = useState(null);
  const [handleQty, setHandleQty] = useState(1);
  const [hingeQty, setHingeQty] = useState(2);
  const [cabinetQty, setCabinetQty] = useState(1);
  const [showHandle, setShowHandle] = useState(true);
  const [showHinge, setShowHinge] = useState(true);
  const [showCabinet, setShowCabinet] = useState(true);

  useEffect(() => {
    const storedCartData = localStorage.getItem("cartData");
    if (storedCartData) {
      setCartData(JSON.parse(storedCartData));
    }
  }, []);


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

        {/* Cabinate */}
        {
          showCabinet && (
            <div className="cart-item d-flex mt-5" id="item-1">
              <div className="">
                <img
                  className="product-image"
                  src="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
                  alt="Cabinet"
                />
              </div>
              <div className="cart-details">
                <h2>{cartData ? cartData.description : "1 Door Base Cabinet"}</h2>
                <p>
                  <strong>Width:</strong>{" "}
                  <span id="width">{cartData ? cartData.width + "mm" : "150mm"}</span>
                </p>
                <p>
                  <strong>Depth:</strong>{" "}
                  <span id="depth">{cartData ? cartData.depth + "mm" : "585mm"}</span>
                </p>
                <p>
                  <strong>Feet Option:</strong>{" "}
                  <span id="feet-option">Adjustable Feet</span>
                </p>
                <p>
                  <strong>Handle Side:</strong> <span id="handle-side">Left</span>
                </p>
                <p>
                  <strong>Hinge Type:</strong> <span id="hinge-type">Soft Close</span>
                </p>

                <button className="rembutton" id="remove-item" onClick={() => setShowCabinet(false)}>Remove</button>
                <div className="d-flex">
                  <div className="quantity">
                    <button onClick={() => setCabinetQty(Math.max(1, cabinetQty - 1))}>-</button>
                    <span>{cabinetQty}</span>
                    <button onClick={() => setCabinetQty(cabinetQty + 1)}>+</button>
                  </div>
                  <p className="product-price">
                    <strong>Price:</strong> <span id="price">$186</span>
                  </p>
                </div>
              </div>
            </div>
          )
        }

        <hr />

        {/* check out  */}
        <div className="checkout-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <p>Sub Total: $186</p>
          <button className="checkout-button" style={{ backgroundColor: "black", color: "white", marginTop: "10px", padding: "10px 20px" }}>Checkout</button>
        </div>



      </div>

    </>
  );
};

export default AddToCart;