# Prayer Times API Microservice

A high-performance, low-resource Dockerized prayer times microservice written in TypeScript using Bun and Fastify, strictly following SOLID principles. It supports calculations via coordinates or country/city queries and features beautiful API documentation powered by Scalar.

---

## Features

- **High Performance & Low Resource:** Powered by Bun runtime and Fastify web framework.
- **SOLID Design Principles:** Clean separation of concerns with decoupled Domain, Use Case, Presentation, and Infrastructure layers.
- **Dual Query Input:** Compute times using direct coordinates (`lat`/`lng`) or search through location names (Country/City/District).
- **Interactive Documentation:** Beautiful API documentation using Scalar UI at `/docs`.
- **Dockerized:** Ready to deploy via Docker and Docker Compose.
- **Comprehensive Tests:** Includes baseline validation for key global reference cities and seasonal dates (solstices & equinoxes).

---

## Installation & Setup

Make sure you have [Bun](https://bun.sh/) installed locally.

### 1. Install Dependencies
```bash
bun install
```

### 2. Run Locally in Development Mode
```bash
bun run dev
```

### 3. Build for Production
```bash
bun run build
```

### 4. Run Tests
```bash
bun run test
```

---

## Docker Integration

To build and run the containerized API microservice:

```bash
docker compose up -d --build
```
The server will be exposed on port `3000`.

---

## API Endpoints

### 1. Calculate by Coordinates
`GET /api/v1/prayer-times/coordinates?lat=41.0082&lng=28.9784&timezone=Europe/Istanbul`

### 2. Calculate by Search Name
`GET /api/v1/prayer-times/search?country=Turkey&city=Istanbul`

### 3. Autocomplete Location Search
`GET /api/v1/locations/search?q=Ista`

### 4. Swagger/Scalar API Documentation
Open your browser and navigate to `http://localhost:3000/docs`.
