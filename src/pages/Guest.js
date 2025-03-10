import React, { useEffect, useState } from 'react';
import { axiosPublic } from '../api/axios';

const Guest = () => {
    const [publicData, setPublicData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
              const response = await axiosPublic.get('api/users/guest');
              setPublicData(response.data.data);
              setLoading(false);
            } catch (err) {
              setError(err.response?.data?.message || 'Something went wrong');
              setLoading(false);
            }
          };

        fetchPublicData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h1>Welcome to Kitchen Planner Website</h1>
            {/* {publicData.length > 0 ? (
                <ul>
                    {publicData.map((item) => (
                        <li key={item.id}>
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                            <p><strong>Price:</strong> {item.price}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No public content available at the moment.</p>
            )} */}
        </div>
    );
};

export default Guest;
