// import React, { useState, useEffect } from "react";
// import "./AddToCart.css";
// import { useNavigate } from "react-router-dom";

// const AddToCart = () => {

//   const navigate = useNavigate()

//   const [cartData, setCartData] = useState([]);
//   const [handleQty, setHandleQty] = useState(1);
//   const [hingeQty, setHingeQty] = useState(2);
//   const [showHandle, setShowHandle] = useState(true);
//   const [showHinge, setShowHinge] = useState(true);  


//   useEffect(() => {
//     const storedCartData = localStorage.getItem("cartData");
//     if (storedCartData) {
//       console.log("Stored cartData:", storedCartData);
//       try {
//         const parsedData = JSON.parse(storedCartData);
//         if (Array.isArray(parsedData)) {
//           setCartData(parsedData);

//         } else {
//           console.warn("cartData is not an array:", parsedData);
//           setCartData([]); // fallback to empty array
//         }
//       } catch (error) {
//         console.error("Error parsing cartData from localStorage:", error);
//         setCartData([]);
//       }
//     }
//   }, []);


//   const removeItem = (index) => {
//     const updatedCart = [...cartData];
//     updatedCart.splice(index, 1);
//     setCartData(updatedCart);
//     localStorage.setItem("cartData", JSON.stringify(updatedCart));
//   };

//   const updateQty = (cartIndex, droppedIndex, change) => {
//     const updatedCart = [...cartData];
//     const item = updatedCart[cartIndex].droppedItems[droppedIndex];

//     item.qty = Math.max(1, (item.qty || 1) + change);
//     setCartData(updatedCart);
//     localStorage.setItem("cartData", JSON.stringify(updatedCart));
//   };


//   const calculateDynamicPrice = (width) => {
//     const minWidth = 400;
//     const basePrice = 100;
//     const extraPrice = 0.2;
//     const extra = Math.max(0, width - minWidth);
//     return basePrice + (extra * extraPrice);
//   };

//   // Calculate total price
//   const calculateSubtotal = () => {
//     let total = 0;
//     cartData.forEach(cartItem => {
//       cartItem.droppedItems.forEach(item => {
//         const width = parseFloat(item?.width) || 0;
//         const qty = item?.qty || 1;
//         total += calculateDynamicPrice(width) * qty;
//       });
//     });
//     return total;
//   };

//   //gst 3 %
//   const calculateTotalWithGST = () => {
//     const subtotal = calculateSubtotal();
//     const gst = subtotal * 0.03; // 3% GST
//     return subtotal + gst;
//   };


//   console.log("Subtotal with GST:", calculateTotalWithGST().toFixed(2));

//   return (
//     <>
//       <h1>Shopping Cart</h1>
//       <div>
//         {cartData.length === 0 ? (
//           <p>Your cart is empty.</p>
//         ) : (
//           <>

//             {/* Handle  */}
//             {
//               showHandle && (
//                 <div className="cart-item d-flex mt-5" id="item-1">
//                   <div className="">
//                     <img
//                       className="product-image"
//                       src="//cabjaks.co.nz/cdn/shop/files/Standard_07592792-9316-4e64-ae70-f8bd3f5b803a_medium.webp?v=1721276017"
//                       alt="Cabinet"
//                     />
//                   </div>
//                   <div className="cart-details">
//                     <h2>Handle Upgrade</h2>
//                     <p>
//                       <strong>Style:</strong>{" "}
//                       <span id="depth">Standard</span>
//                     </p>

//                     {/* <button className="rembutton" onClick={() => setShowHandle(false)}>Remove</button> */}
//                     <div className="d-flex">
//                       <div className="quantity">
//                         <button onClick={() => setHandleQty(Math.max(1, handleQty - 1))}>-</button>
//                         <span>{handleQty}</span>
//                         <button onClick={() => setHandleQty(handleQty + 1)}>+</button>
//                       </div>
//                       <p className="product-price">
//                         <strong>Price:</strong> <span id="price">$0</span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )
//             }

//             <hr />



//             {/* Hinges */}
//             {
//               showHinge && (
//                 <div className="cart-item d-flex mt-5" id="item-1">
//                   <div className="">
//                     <img
//                       className="product-image"
//                       src="https://cabjaks.co.nz/cdn/shop/products/hinge-and-mount_grande_58c8ca02-48af-4225-a244-accbe2774414_large.jpg?v=1602707463"
//                       alt="Cabinet"
//                     />
//                   </div>
//                   <div className="cart-details">
//                     <h2>Soft Close Hinge</h2>
//                     {/* <button className="rembutton" id="remove-item" onClick={() => setShowHinge(false)}>Remove</button> */}

//                     <div className="d-flex">
//                       <div className="quantity">
//                         <button onClick={() => setHingeQty(Math.max(1, hingeQty - 1))}>-</button>
//                         <span>{hingeQty}</span>
//                         <button onClick={() => setHingeQty(hingeQty + 1)}>+</button>
//                       </div>
//                       <p className="product-price">
//                         <strong>Price:</strong> <span id="price">$0</span>
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )
//             }

//             <hr />


//             <div>
//               {cartData.length === 0 ? (
//                 <p>Your cart is empty.</p>
//               ) : (
//                 cartData.map((item, index) => {
//                   const droppedItem = item.droppedItems?.[0];
//                   const width = parseFloat(droppedItem?.width) || 0;
//                   const qty = droppedItem?.qty || 1;
//                   const pricePerItem = calculateDynamicPrice(width);
//                   const totalPrice = pricePerItem * qty;

//                   return (
//                     <div className="cart-item d-flex mt-5" id="item-3" key={index}>
//                       <div>
//                         <img
//                           src={droppedItem?.imageSrc || "https://via.placeholder.com/120"}
//                           alt="Cabinet"
//                           className="product-image"
//                         />
//                       </div>
//                       <div className="cart-details">
//                         <h2>{item.description || "Cabinet Item"}</h2>
//                         <p><strong>Width:</strong> {width}mm</p>
//                         <p><strong>Depth:</strong> {droppedItem?.height || "N/A"}mm</p>
//                         <p><strong>Feet Option:</strong> Adjustable Feet</p>
//                         <p><strong>Handle Side:</strong> Left</p>
//                         <p><strong>Hinge Type:</strong> Soft Close</p>
//                         <button className="rembutton" onClick={() => removeItem(index)}>Remove</button>
//                         <div className="d-flex">
//                           <div className="quantity">
//                             <button onClick={() => updateQty(index, 0, -1)}>-</button>
//                             <span>{qty}</span>
//                             <button onClick={() => updateQty(index, 0, 1)}>+</button>
//                           </div>
//                           <p className="product-price">${totalPrice.toFixed(2)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </div>

//             <hr />


//             {/* Checkout Section */}
//             <div className="checkout-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
//               {/* <p><strong>Sub Total:</strong> ${calculateSubtotal().toFixed(2)}</p> */}
//               <p><strong>Sub Total (incl. GST):</strong> ${calculateTotalWithGST().toFixed(2)}</p>

//               <button
//                 className="checkout-button"
//                 // onClick={() => navigate("/shipping-address")}
//                 onClick={() =>
//                   navigate("/shipping-address", {

//                     state: {

//                       subtotal: calculateTotalWithGST().toFixed(2),
//                       cartItems: cartData,
//                       extras: {
//                         handle: showHandle ? { name: "Handle Upgrade", price: 0, qty: handleQty } : null,
//                         hinge: showHinge ? { name: "Soft Close Hinge", price: 4.8, qty: hingeQty } : null,
//                       }
//                     }

//                   })
//                 }

//                 style={{
//                   backgroundColor: "black",
//                   color: "white",
//                   marginTop: "10px",
//                   padding: "10px 20px"
//                 }}
//               >
//                 Checkout
//               </button>
//             </div>

//           </>
//         )}

//       </div>

//     </>
//   );
// };

// export default AddToCart;



import React, { useState, useEffect } from "react";
import "./AddToCart.css";
import { useNavigate } from "react-router-dom";

const AddToCart = () => {

  const navigate = useNavigate()

  const [cartData, setCartData] = useState([]);
  const [handleQty, setHandleQty] = useState(1);
  const [hingeQty, setHingeQty] = useState(2);
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
          setCartData(result.data); // Replace localStorage with DB data
        } else {
          console.error("Failed to fetch cart:", result.error);
        }
      } catch (err) {
        console.error("API call failed:", err);
      }
    };
  
    fetchCartData();
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


  const calculateDynamicPrice = (width) => {
    const minWidth = 400;
    const basePrice = 100;
    const extraPrice = 0.2;
    const extra = Math.max(0, width - minWidth);
    return basePrice + (extra * extraPrice);
  };

  // Calculate total price
  const calculateSubtotal = () => {
    let total = 0;
    cartData.forEach(cartItem => {
      cartItem.droppedItems.forEach(item => {
        const width = parseFloat(item?.width) || 0;
        const qty = item?.qty || 1;
        total += calculateDynamicPrice(width) * qty;
      });
    });
    return total;
  };

  //gst 3 %
  const calculateTotalWithGST = () => {
    const subtotal = calculateSubtotal();
    const gst = subtotal * 0.03; // 3% GST
    return subtotal + gst;
  };


  console.log("Subtotal with GST:", calculateTotalWithGST().toFixed(2));

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


        <div>
          {cartData.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartData.map((item, index) => {
              const droppedItem = item.droppedItems?.[0];
              const width = parseFloat(droppedItem?.width) || 0;
              const qty = droppedItem?.qty || 1;
              const pricePerItem = calculateDynamicPrice(width);
              const totalPrice = pricePerItem * qty;

              return (
                <div className="cart-item d-flex mt-5" id="item-3" key={index}>
                  <div>
                    <img
                      src={droppedItem?.imageSrc || "https://via.placeholder.com/120"}
                      alt="Cabinet"
                      className="product-image"
                    />
                  </div>
                  <div className="cart-details">
                    <h2>{item.description || "Cabinet Item"}</h2>
                    <p><strong>Width:</strong> {width}mm</p>
                    <p><strong>Depth:</strong> {droppedItem?.height || "N/A"}mm</p>
                    <p><strong>Feet Option:</strong> Adjustable Feet</p>
                    <p><strong>Handle Side:</strong> Left</p>
                    <p><strong>Hinge Type:</strong> Soft Close</p>
                    <button className="rembutton" onClick={() => removeItem(index)}>Remove</button>
                    <div className="d-flex">
                      <div className="quantity">
                        <button onClick={() => updateQty(index, 0, -1)}>-</button>
                        <span>{qty}</span>
                        <button onClick={() => updateQty(index, 0, 1)}>+</button>
                      </div>
                      <p className="product-price">${totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <hr />


        {/* Checkout Section */}
        <div className="checkout-container" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          {/* <p><strong>Sub Total:</strong> ${calculateSubtotal().toFixed(2)}</p> */}
          <p><strong>Sub Total (incl. GST):</strong> ${calculateTotalWithGST().toFixed(2)}</p>

          <button
            className="checkout-button"
            // onClick={() => navigate("/shipping-address")}
            onClick={() =>
              navigate("/shipping-address", {
  
                state: {

                  subtotal: calculateTotalWithGST().toFixed(2),
                  cartItems: cartData,
                  extras: {
                    handle: showHandle ? { name: "Handle Upgrade", price: 0, qty: handleQty } : null,
                    hinge: showHinge ? { name: "Soft Close Hinge", price: 4.8, qty: hingeQty } : null,
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



      </div>

    </>
  );
};

export default AddToCart;