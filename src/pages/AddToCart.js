import React, { useState, useEffect } from "react";
import "./AddToCart.css";

const AddToCart = () => {

  const [cartData, setCartData] = useState(null);

  useEffect(() => {
    const storedCartData = localStorage.getItem("cartData");
    if (storedCartData) {
      setCartData(JSON.parse(storedCartData));
    }
  }, []);


  return (
    <>
      <h1>Shopping Cart</h1>
      <div className="cart-item d-flex mt-5" id="item-1">
        <div className="">
          <img
            className="product-image"
            src="https://cabjaks.co.nz/cdn/shop/products/1-door-base-cabinet_large.jpg?v=1430364177"
            alt="Cabinet Image"
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
          <button className="rembutton" id="remove-item">
            Remove
          </button>
          <div className="d-flex">
            <div className="quantity">
              <button id="decrease-qty">-</button>
              <span id="qty">1</span>
              <button id="increase-qty">+</button>
            </div>
            <p className="product-price">
              <strong>Price:</strong> <span id="price">$167.00</span>
            </p>
          </div>
        </div>
      </div>
      <hr></hr>
    </>
  );
};

export default AddToCart;