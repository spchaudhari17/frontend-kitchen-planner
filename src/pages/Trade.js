import React, { useState } from 'react';

const TradeForm = ({ onSubmit, user = {} }) => {
    const [businessName, setBusinessName] = useState(user.businessName || '');
    const [companyNumber, setCompanyNumber] = useState(user.companyNumber || '');
    const [tradeDiscount, setTradeDiscount] = useState(user.tradeDiscount || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ businessName, companyNumber, tradeDiscount });
    };

    return (
        // <form onSubmit={handleSubmit}>
        //     <div>
        //         <label>Business Name:</label>
        //         <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        //     </div>
        //     <div>
        //         <label>Company Number:</label>
        //         <input type="text" value={companyNumber} onChange={(e) => setCompanyNumber(e.target.value)} />
        //     </div>
        //     <div>
        //         <label>Trade Discount (%):</label>
        //         <input type="number" value={tradeDiscount} onChange={(e) => setTradeDiscount(e.target.value)} />
        //     </div>
        //     <button type="submit">Submit</button>
        // </form>
        <>
            <h1>Welcome To the Trade Role</h1>
        </>
    );
};

export default TradeForm;
