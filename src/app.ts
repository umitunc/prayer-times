import Fastify from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifyApiReference from '@scalar/fastify-api-reference';
import { AdhanPrayerCalculator } from './Infrastructure/Calculators/AdhanPrayerCalculator.js';
import { InMemoryLocationRepository } from './Infrastructure/Persistence/InMemoryLocationRepository.js';
import { CalculatePrayerTimesUseCase } from './UseCases/CalculatePrayerTimesUseCase.js';

const fastify = Fastify({
  logger: {
    level: 'info'
  }
});

// Configure Swagger for OpenAPI Generation
await fastify.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Prayer Times API',
      description: 'Ultra-low resource, SOLID-compliant microservice for computing prayer times globally using coordinates or location names.',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server'
      }
    ]
  },
});

// Register Scalar API Reference
await fastify.register(fastifyApiReference, {
  routePrefix: '/docs',
  configuration: {
    theme: 'purple',
    spec: {
      content: () => fastify.swagger(),
    },
  },
});

// Initialize Domain Dependencies (SOLID)
const calculator = new AdhanPrayerCalculator();
const locationRepo = new InMemoryLocationRepository();
const useCase = new CalculatePrayerTimesUseCase(calculator, locationRepo);

// API Endpoints
fastify.get('/api/v1/prayer-times/coordinates', {
  schema: {
    description: 'Calculate prayer times using coordinates',
    tags: ['Prayer Times'],
    querystring: {
      type: 'object',
      required: ['lat', 'lng'],
      properties: {
        lat: { type: 'number', description: 'Latitude of the location' },
        lng: { type: 'number', description: 'Longitude of the location' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to current date)' },
        method: { type: 'string', enum: ['Turkey', 'MWL', 'ISNA', 'Mecca'], description: 'Calculation method' },
        timezone: { type: 'string', description: 'IANA Timezone (e.g. Europe/Istanbul, UTC)' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          fajr: { type: 'string' },
          sunrise: { type: 'string' },
          dhuhr: { type: 'string' },
          asr: { type: 'string' },
          maghrib: { type: 'string' },
          isha: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { lat, lng, date, method, timezone } = request.query as any;
  const parsedDate = date ? new Date(date) : new Date();
  
  try {
    const times = await useCase.executeWithCoordinates({
      latitude: lat,
      longitude: lng,
      date: parsedDate,
      method,
      timezone
    });
    return times;
  } catch (error: any) {
    reply.status(400).send({ error: error.message });
  }
});

fastify.get('/api/v1/prayer-times/search', {
  schema: {
    description: 'Calculate prayer times by searching location name',
    tags: ['Prayer Times'],
    querystring: {
      type: 'object',
      required: ['country', 'city'],
      properties: {
        country: { type: 'string', description: 'Country name' },
        city: { type: 'string', description: 'City name' },
        district: { type: 'string', description: 'District name (optional)' },
        date: { type: 'string', description: 'Date in YYYY-MM-DD format (defaults to current date)' },
        method: { type: 'string', enum: ['Turkey', 'MWL', 'ISNA', 'Mecca'], description: 'Calculation method' }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          fajr: { type: 'string' },
          sunrise: { type: 'string' },
          dhuhr: { type: 'string' },
          asr: { type: 'string' },
          maghrib: { type: 'string' },
          isha: { type: 'string' }
        }
      }
    }
  }
}, async (request, reply) => {
  const { country, city, district, date, method } = request.query as any;
  const parsedDate = date ? new Date(date) : new Date();

  try {
    const times = await useCase.executeWithSearch({
      country,
      city,
      district,
      date: parsedDate,
      method
    });
    return times;
  } catch (error: any) {
    reply.status(404).send({ error: error.message });
  }
});

fastify.get('/api/v1/locations/search', {
  schema: {
    description: 'Search and autocomplete location names from index',
    tags: ['Locations'],
    querystring: {
      type: 'object',
      required: ['q'],
      properties: {
        q: { type: 'string', description: 'Query text' }
      }
    },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            country: { type: 'string' },
            city: { type: 'string' },
            district: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timezone: { type: 'string' }
          }
        }
      }
    }
  }
}, async (request, reply) => {
  const { q } = request.query as any;
  return locationRepo.search(q);
});

// Health check endpoint
fastify.get('/health', async () => {
  return { status: 'healthy', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:3000');
    console.log('Scalar API docs available at http://localhost:3000/docs');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
