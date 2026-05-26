import React, { useState, useEffect } from 'react';
import Hero from '../../components/hero';
import { getPets } from '../../api/petfinder';
import Pet from '../../components/pet';
// Import useSearchParams
import { useSearchParams } from 'react-router-dom';

const SearchPage = () => {
  // Get searchParams object from useSearchParams
  const [searchParams] = useSearchParams();

  const petNameToFind = (searchParams.get('name') || '').trim();
  const heroText = petNameToFind ? `Results for ${petNameToFind}` : 'Search Pets';

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function getPetsData() {
      setLoading(true);

      try {
        const petsData = await getPets('', petNameToFind);
        setPets(petsData);
        setError(false);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    getPetsData();
  }, [petNameToFind]);

  return (
    <div className="page">
      <Hero displayText={heroText} />

      <h3>Pets available for adoption near you</h3>

      <main>
        {loading ? (
          <p className="prompt">Loading pets...</p>
        ) : error ? (
          <p className="prompt">Unable to load pets right now. Please try again.</p>
        ) : (
          <div className="grid">
            { pets.length !== 0 ? pets.map((pet) => (
              <Pet animal={pet} key={pet.id} />
            )) : 'No pets available'}
          </div>
        )}
        {!loading && !error && pets.length === 0 && (
          <div className='pet-image-container' style={{margin: 'auto', marginTop: 50}}>
            <img
              className='pet-image'
              src='https://images.unsplash.com/photo-1768495124403-f427513f4c61?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' alt='' />
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
