import React, { useEffect, useState } from 'react';
import { getPetDetails } from '../../api/petfinder';
import Hero from '../../components/hero';

// Import useParams
import { useParams } from 'react-router-dom';
// Import Navigate
import { Navigate } from 'react-router-dom';

const PetDetailsPage = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { type, id } = useParams();

  useEffect(() => {
    async function getPetsData() {
      try {
        const petsData = await getPetDetails(type, id);
        setData(petsData);
        setError(false);
      } catch (e) {
        setError(true);
      }
      setLoading(false);
    }

    getPetsData();
  }, [type, id]);

  return (
    <div>
      {loading ? (
        <h3>Loading...</h3>
      ) : error ? (
        <div>
          {/* Redirect to /pet-details-not-found if there was an error! */}
          <Navigate to='/pet-details-not-found' />
        </div>
      ) : (
        <main>
          <Hero
            image={data.photos[0]?.full || 'missing-animal.png'}
            displayText={`Meet ${data.name}`}
          />
          <div className="pet-detail">
            <div className="pet-image-container">
              <img
                className="pet-image"
                src={
                  data.photos[0]?.medium || 'missing-animal.png'
                }
                alt=""
              />
            </div>
            <div>
              <h1>{data.name}</h1>
              <h3>Breed: {data.breeds.primary}</h3>
              <p>Color: {data.colors.primary || 'Unknown'}</p>
              <p>Date of Birth: {data.date_of_birth}</p>
              <h3>Description</h3>
              <p>{data.description}</p>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default PetDetailsPage;
