export const getPetTypes = async () => {
  const [dogResponse, catResponse] = await Promise.all([
    fetch(`/api/thedogapi/types`),
    fetch(`/api/thecatapi/types`),
  ]);

  if (!dogResponse.ok || !catResponse.ok) {
    throw new Error('Failed to fetch pet types.');
  }

  const [dogJson, catJson] = await Promise.all([
    dogResponse.json(),
    catResponse.json(),
  ]);

  return { types: [...dogJson.types, ...catJson.types] };
};

export const getPets = async (type = '', query = '') => {
  const normalizedType = String(type).toLowerCase();
  const normalizedQuery = String(query ?? '').trim();

  if (!normalizedType) {
    const searchParams = new URLSearchParams({ query: normalizedQuery });

    const [dogResponse, catResponse] = await Promise.all([
      fetch(`/api/thedogapi/animals?${searchParams.toString()}`),
      fetch(`/api/thecatapi/animals?${searchParams.toString()}`),
    ]);

    if (!dogResponse.ok || !catResponse.ok) {
      throw new Error('Failed to fetch pets.');
    }

    const [dogJson, catJson] = await Promise.all([
      dogResponse.json(),
      catResponse.json(),
    ]);

    return [...dogJson, ...catJson];
  }

  if (normalizedType !== 'dog' && normalizedType !== 'cat') {
    throw new Error('Unsupported pet type.');
  }

  const searchParams = new URLSearchParams({ query: normalizedQuery });

  const requestUrl = normalizedType === 'cat'
    ? `/api/thecatapi/animals?${searchParams.toString()}`
    : `/api/thedogapi/animals?${searchParams.toString()}`;

  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error('Failed to fetch pets.');
  }

  return response.json();
};

export const getPetDetails = async (type, id) => {
  const normalizedType = String(type).toLowerCase();

  if (normalizedType !== 'dog' && normalizedType !== 'cat') {
    throw new Error('Unsupported pet type.');
  }

  const requestUrl = normalizedType === 'cat'
    ? `/api/thecatapi/animals/${id}`
    : `/api/thedogapi/animals/${id}`;

  const response = await fetch(requestUrl);

  if (!response.ok) {
    throw new Error('Failed to fetch pet details.');
  }

  return response.json();
};
