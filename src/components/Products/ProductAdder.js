import React from "react";
import { useParams } from "react-router-dom";

const ProductAdder = () => {
  const { category, subcategory } = useParams();

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Add Product to {category} - {subcategory}
      </h2>
      {/* Add   product form or functionality here */}
    </div>
  );
};

export default ProductAdder;
