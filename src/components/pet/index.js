import React from 'react';

const Pet = ({ animal }) => {
  return (
    <a
      key={animal.id}
      href={`/${animal.type.toLowerCase()}/${animal.id}`}
      className="pet"
    >
      <article>
        <div className="pet-image-container">
          {
            <img
              className="pet-image"
              src={
                animal.photos[0]?.medium || '/missing-animal.png'
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
    </a>
  );
};

export default Pet;
