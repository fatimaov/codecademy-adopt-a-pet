import React, { useState, useEffect } from 'react';
import Hero from '../../components/hero';
import { getPets } from '../../api/petfinder';
import Pet from '../../components/pet';
// Import useSearchParams
import { useSearchParams } from 'react-router-dom';

const SearchPage = () => {

  // Get searchParams object from useSearchParams
  const [searchParams] = useSearchParams();

  const petNameToFind = searchParams.get('name');  // Get query parameter using searchParams object

  const [pets, setPets] = useState([]);

  useEffect(() => {
    async function getPetsData() {
      const petsData = await getPets('', petNameToFind);

      setPets(petsData);
    }

    getPetsData();
  }, [petNameToFind]);

  return (
    <div className="page">
      <Hero displayText={`Results for ${petNameToFind}`} />

      <h3>Pets available for adoption near you</h3>

      <main>
        <div className="grid">
          { pets.length !== 0 ? pets.map((pet) => (
            <Pet animal={pet} key={pet.id} />
          )) : 'No pets available'}
        </div>
        {pets.length === 0 && (
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
