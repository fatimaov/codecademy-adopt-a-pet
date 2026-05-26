const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL, URLSearchParams } = require('node:url');

const loadEnvFile = () => {
  const envFile = path.resolve(process.cwd(), '.env');

  if (!fs.existsSync(envFile)) {
    return;
  }

  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

loadEnvFile();

const PORT = Number(process.env.API_PORT || 3002);
const THEDOG_API_BASE = 'https://api.thedogapi.com/v1';
const THECAT_API_BASE = 'https://api.thecatapi.com/v1';
const THEDOG_API_KEY = process.env.THEDOG_API_KEY;
const THECAT_API_KEY = process.env.THECAT_API_KEY;

if (!THEDOG_API_KEY || !THECAT_API_KEY) {
  console.error('Missing THEDOG_API_KEY or THECAT_API_KEY. Set them in a local .env file.');
  process.exit(1);
}

const sendJson = (response, statusCode, data) => {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  });
  response.end(JSON.stringify(data));
};

const requestApi = async (baseUrl, apiKey, endpoint, searchParams = new URLSearchParams()) => {
  const qs = searchParams.toString();
  const url = `${baseUrl}${endpoint}${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    headers: { 'x-api-key': apiKey }
  });

  const text = await response.text();
  let payload = null;
  let hasParseError = false;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (_error) {
      hasParseError = true;
      payload = { raw: text };
    }
  }

  if (!response.ok) {
    const errorMessage = (
      payload &&
      typeof payload === 'object' &&
      'message' in payload &&
      typeof payload.message === 'string' &&
      payload.message
    ) || response.statusText || 'API request failed.';
    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }

  if (hasParseError) {
    const error = new Error('API returned invalid JSON.');
    error.statusCode = 502;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const requestDogApi = (endpoint, searchParams) =>
  requestApi(THEDOG_API_BASE, THEDOG_API_KEY, endpoint, searchParams);

const requestCatApi = (endpoint, searchParams) =>
  requestApi(THECAT_API_BASE, THECAT_API_KEY, endpoint, searchParams);

const getDob = (id) => {
  const seed = typeof id === 'number'
    ? id
    : [...String(id)].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const year = 2018 + (seed % 6);
  const month = String((seed % 12) + 1).padStart(2, '0');
  const day = String((seed % 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapBreed = (breed, type) => ({
  id: breed.id,
  type,
  name: breed.name,
  photos: breed.image?.url ? [{ medium: breed.image.url, full: breed.image.url }] : [],
  breeds: { primary: breed.name },
  colors: { primary: breed.breed_group || breed.origin || null },
  date_of_birth: getDob(breed.id),
  description: breed.temperament || breed.bred_for || null,
});

const addDogImage = async (breed) => {
  if (breed.image?.url) {
    return breed;
  }

  try {
    if (breed.reference_image_id) {
      const image = await requestDogApi(`/images/${breed.reference_image_id}`);
      if (image?.url) {
        return { ...breed, image };
      }
    }

    const images = await requestDogApi(
      '/images/search',
      new URLSearchParams({ breed_ids: String(breed.id), limit: '1' })
    );
    const [image] = images || [];
    return image?.url ? { ...breed, image } : breed;
  } catch (_error) {
    return breed;
  }
};

const fetchBreeds = async (type, query) => {
  if (type === 'cat') {
    const breeds = query
      ? await requestCatApi('/breeds/search', new URLSearchParams({ q: query }))
      : await requestCatApi('/breeds', new URLSearchParams({ limit: '24' }));
    return (breeds || []).map((b) => mapBreed(b, 'Cat'));
  }

  if (type === 'dog') {
    const breeds = query
      ? await requestDogApi('/breeds/search', new URLSearchParams({ q: query }))
      : await requestDogApi('/breeds', new URLSearchParams({ limit: '24' }));
    const breedsWithImages = await Promise.all((breeds || []).map(addDogImage));
    return breedsWithImages.map((b) => mapBreed(b, 'Dog'));
  }

  throw new Error('Unsupported pet type.');
};

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (request.method === 'GET' && requestUrl.pathname === '/api/thedogapi/types') {
      sendJson(response, 200, {
        types: [{ name: 'Dog', _links: { self: { href: '/v2/types/dog' } } }]
      });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/thecatapi/types') {
      sendJson(response, 200, {
        types: [{ name: 'Cat', _links: { self: { href: '/v2/types/cat' } } }]
      });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/thedogapi/animals') {
      const query = requestUrl.searchParams.get('query') || '';
      const breeds = await fetchBreeds('dog', query);
      sendJson(response, 200, breeds);
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/thecatapi/animals') {
      const query = requestUrl.searchParams.get('query') || '';
      const breeds = await fetchBreeds('cat', query);
      sendJson(response, 200, breeds);
      return;
    }

    const catAnimalMatch = requestUrl.pathname.match(/^\/api\/thecatapi\/animals\/([^/]+)$/);
    if (request.method === 'GET' && catAnimalMatch) {
      const id = catAnimalMatch[1];
      const breed = await requestCatApi(`/breeds/${id}`);
      if (!breed.image && breed.reference_image_id) {
        const img = await requestCatApi(`/images/${breed.reference_image_id}`);
        breed.image = img;
      }
      sendJson(response, 200, mapBreed(breed, 'Cat'));
      return;
    }

    const animalMatch = requestUrl.pathname.match(/^\/api\/thedogapi\/animals\/([^/]+)$/);
    if (request.method === 'GET' && animalMatch) {
      const id = animalMatch[1];
      const breed = await addDogImage(await requestDogApi(`/breeds/${id}`));
      sendJson(response, 200, mapBreed(breed, 'Dog'));
      return;
    }

    const dobMatch = requestUrl.pathname.match(/^\/api\/thedogapi\/dob\/([^/]+)$/);
    if (request.method === 'GET' && dobMatch) {
      const id = /^\d+$/.test(dobMatch[1]) ? Number(dobMatch[1]) : dobMatch[1];
      sendJson(response, 200, { id, date_of_birth: getDob(id) });
      return;
    }

    if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
      sendJson(response, 200, { ok: true });
      return;
    }

    sendJson(response, 404, { message: 'Not found.' });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      message: error.message,
      details: error.payload || null
    });
  }
});

server.listen(PORT, () => {
  console.log(`Pet API proxy listening on http://localhost:${PORT}`);
});
