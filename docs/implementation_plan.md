# Microservice Architecture & Implementation Plan: Prayer Times API

This document outlines the architectural design and step-by-step development plan for a modern microservice project that meets the standards of low resource consumption, high performance, SOLID principles, geographic location/administrative division search support, Docker integration, and Scalar API documentation.

---

## 1. Technology Stack Selection & Rationale

Below is the comparison and rationale for the selected technologies that provide minimum resource overhead, ultra-fast cold starts, and are ideal for microservice architectures:

*   **Runtime & Language:** **Node.js (TypeScript) + Fastify** (run using **Bun** in production).
    *   *Rationale:* If **Scribe** (Knuckles Scribe) is used to generate documentation automatically from code comments, the **Node.js (TypeScript)** ecosystem is the most native match. Using **Bun** as the runtime minimizes memory consumption and maximizes requests per second (RPS). By choosing **Fastify** as the web framework instead of Express, memory usage is reduced by 2-3 times.
*   **API Documentation:** **Scalar** + **Scribe** (`@knucklesfof/scribe`).
    *   *Rationale:* Scribe scans code route definitions and JSDoc blocks to generate an OpenAPI 3.0 specification (`openapi.json`) automatically. This schema is then served using the modern, clean, interactive **Scalar** interface.
*   **Calculation Engine:** `adhan` (the industry-standard astronomical calculation core for JS/TS).
*   **Database / Search Index:** An embedded **SQLite (or in-memory spatial index)** will be used to resolve the hierarchy of Country -> City -> District and match coordinates. SQLite runs inside the microservice process, requiring zero extra daemon memory or CPU overhead compared to separate database servers like PostgreSQL/MySQL.

---

## 2. SOLID Architecture & Directory Structure

The project will be built with a layered architecture fully adhering to **Clean Architecture** and **SOLID** principles:

```
ezan-vakti-service/
├── src/
│   ├── Core/                  # SOLID - Entities & Value Objects (Domain Layer)
│   │   ├── Entities/
│   │   │   └── Location.ts
│   │   └── ValueObjects/
│   │       └── PrayerTimes.ts
│   ├── UseCases/              # SOLID - Business Logic & Interface Definitions (Application Layer)
│   │   ├── Interfaces/
│   │   │   ├── IPrayerCalculator.ts
│   │   │   └── ILocationRepository.ts
│   │   └── CalculatePrayerTimesUseCase.ts
│   ├── Infrastructure/        # SOLID - External Services, Libraries, & DB (Infrastructure Layer)
│   │   ├── Calculators/
│   │   │   └── AdhanPrayerCalculator.ts  # ISP & DIP compliant calculator adapter
│   │   ├── Persistence/
│   │   │   └── SQLiteLocationRepository.ts
│   │   └── Services/
│   │       └── GeocodingService.ts
│   ├── Presentation/          # SOLID - HTTP Handlers & Controllers (Interface Adapters)
│   │   ├── Controllers/
│   │   │   └── PrayerTimesController.ts
│   │   └── Routes/
│   │       └── api.ts
│   └── app.ts                 # Application Bootstrap Entrypoint
├── docs/
│   └── implementation_plan.md
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

### Applying SOLID Principles
1.  **Single Responsibility (SRP):** `AdhanPrayerCalculator` only performs astronomical calculations and does not deal with geographic database queries or HTTP payload handling.
2.  **Open/Closed (OCP):** If we need to support a new calculation algorithm in the future, we can implement `IPrayerCalculator` in a new class without modifying existing service logic.
3.  **Liskov Substitution (LSP):** Any implementation of `ILocationRepository` (such as `SQLiteLocationRepository` or an in-memory test database) can be swapped seamlessly.
4.  **Interface Segregation (ISP):** Core computation interfaces (`IPrayerCalculator`) and storage retrieval interfaces (`ILocationRepository`) are kept thin and completely decoupled.
5.  **Dependency Inversion (DIP):** The high-level use case (`CalculatePrayerTimesUseCase`) depends on abstractions (`IPrayerCalculator`, `ILocationRepository`) rather than concrete library details.

---

## 3. Geographic & Administrative Search Algorithm

The system accepts two distinct input types to resolve and compute prayer times:
1.  **Coordinate-Based (Lat/Lng):** Direct mathematical calculations using latitude, longitude, and timezone.
2.  **Administrative Division-Based (Country/City/District):**
    *   The system searches the SQLite database containing predefined geographic polygons/points.
    *   *Example Flow:* A request for `Turkey / Istanbul / Kadikoy` queries the local SQLite DB to retrieve the centroid coordinates and timezone of Kadikoy, passing these values directly to the astronomical calculation engine.

---

## 4. API Endpoints

### 1. Calculate Prayer Times (by Coordinates)
*   **Method:** `GET`
*   **Path:** `/api/v1/prayer-times/coordinates`
*   **Query Params:** `lat` (float, required), `lng` (float, required), `date` (YYYY-MM-DD, optional)

### 2. Calculate Prayer Times (by Location Name)
*   **Method:** `GET`
*   **Path:** `/api/v1/prayer-times/search`
*   **Query Params:** `country` (string, required), `city` (string, required), `district` (string, optional), `date` (YYYY-MM-DD, optional)

### 3. Location Search & Autocomplete
*   **Method:** `GET`
*   **Path:** `/api/v1/locations/search`
*   **Query Params:** `q` (string, required) -> Searches country, city, or district name.

---

## 5. API Documentation (Scalar & Scribe)

*   **Scribe Integration:** JSDoc blocks and route annotations in TypeScript are parsed automatically to build the OpenAPI 3.0 specification (`openapi.json`).
*   **Scalar UI:** The generated OpenAPI schema is served at `/docs` using Scalar UI, providing a modern, fast, responsive developer playground with built-in dark/light mode toggle.

---

## 6. Dockerization Plan (Dockerfile)

A **Multi-stage Build** is utilized to ensure a minimal production image footprint and runtime environment:

```dockerfile
# Stage 1: Build
FROM oven/bun:1.1-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun build ./src/app.ts --outdir ./dist --target node

# Stage 2: Production Run
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "dist/app.js"]
```

---

## 7. Verification & Test Plan

To ensure the accuracy of the computed prayer times and protect the service from regression, we will implement three tiers of testing:

### 1. Accuracy & Baseline Comparison Tests (Unit/Integration Tests)
We will run automated unit tests comparing the microservice outputs against official baseline data (e.g., Diyanet or astronomical almanacs) for selected reference cities across different seasons (equinoxes and solstices):
*   **Reference Cities:** Istanbul (standard latitude), Oslo (high latitude/edge cases), Mecca (equator-close).
*   **Assertion Tolerance:** Because different platforms handle rounding or "temkin" (offset minutes) differently, tests will assert that computed times match the official baseline within a tolerance of **$\le 1$ minute**.
*   **Example Test Structure (Bun Test):**
    ```typescript
    import { expect, test } from "bun:test";
    import { CalculatePrayerTimesUseCase } from "./UseCases/CalculatePrayerTimesUseCase";
    import { AdhanPrayerCalculator } from "./Infrastructure/Calculators/AdhanPrayerCalculator";

    test("Verify Istanbul Prayer Times on Summer Solstice (2026-06-21)", async () => {
      const calculator = new AdhanPrayerCalculator();
      const useCase = new CalculatePrayerTimesUseCase(calculator);
      
      // Istanbul Coordinates
      const result = await useCase.execute({
        lat: 41.0082,
        lng: 28.9784,
        date: new Date("2026-06-21")
      });

      // Expected times from official baseline (Diyanet)
      expect(result.fajr).toBeWithinMinutesOf("03:22", 1);
      expect(result.dhuhr).toBeWithinMinutesOf("13:08", 1);
      expect(result.asr).toBeWithinMinutesOf("17:05", 1);
      expect(result.maghrib).toBeWithinMinutesOf("20:43", 1);
      expect(result.isha).toBeWithinMinutesOf("22:31", 1);
    });
    ```

### 2. Edge Case & High Latitude Validation
*   Tests will verify that calculations for extreme latitudes (above $55^\circ$ North/South, e.g., Tromsø, Norway) do not throw `NaN` errors but instead fall back smoothly to the selected safety rule (e.g., *Seventh of the Night* or *Angle-Based* method).

### 3. Load/Benchmark Tests (Autocannon)
*   Benchmark execution times and resource/memory footprint under high concurrency using `autocannon` to verify that the microservice keeps memory usage below 50MB under load.
