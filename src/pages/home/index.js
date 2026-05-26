import React, { useEffect, useState } from 'react';
import { getPets } from '../../api/petfinder';
import Hero from '../../components/hero';

// import useParams
import { useParams } from 'react-router-dom';
// import Link
import { Link, Navigate } from 'react-router-dom';

const HomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { type } = useParams(); 
  const normalizedType = type?.toLowerCase() || '';
  const isSupportedType = !normalizedType || normalizedType === 'dog' || normalizedType === 'cat';

  useEffect(() => {
    async function getPetsData() {
      setLoading(true);

      try {
        const petsData = await getPets(normalizedType);
        setData(petsData);
        setError(false);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (isSupportedType) {
      getPetsData();
    }
  }, [normalizedType, isSupportedType]);

  if (!isSupportedType) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (error) {
    return (
      <div className="page">
        <Hero />
        <p className="prompt">Unable to load pets right now. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <Hero />
      <h3>
        <span className="pet-type-label">{normalizedType ? `${normalizedType}s` : 'Pets'}</span>{' '}
        available for adoption near you
      </h3>

      {data.length ? (
        <div className="grid">
          {data.map((animal) => (
            <Link // Change me to a Link!
              key={animal.id}
              to={`/${animal.type.toLowerCase()}/${animal.id}`}
              className="pet"
            >
              <article>
                <div className="pet-image-container">
                  {
                    <img
                      className="pet-image"
                      src={
                        animal.photos[0]?.medium ||
                        '/missing-animal.png'
                      }
                      alt=""
                    />
                  }
                </div>
                <h3>{animal.name}</h3>
                <p>Breed: {animal.breeds.primary}</p>
                <p>Color: {animal.colors.primary}</p>
                <p>Date of Birth: {animal.date_of_birth}</p>
              </article>
            </Link> // Don't forget to change me!
          ))}
        </div>
      ) : (
        <p className="prompt">No {normalizedType}s available for adoption now.</p>
      )}
    </div>
  );
};

export default HomePage;
