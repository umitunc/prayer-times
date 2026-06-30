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

## Calculation Algorithm & Mathematics

The microservice computes prayer times based on spherical trigonometry problems derived from the Earth's movement around the Sun.

### 1. Astronomical Formulas

The key to finding when the sun reaches a specific altitude angle $a$ relative to the horizon is calculating the **Hour Angle ($H$)**:

$$\cos(H) = \frac{\sin(a) - \sin(L)\sin(D)}{\cos(L)\cos(D)}$$

Where:
- **$a$**: Solar altitude angle relative to the horizon.
- **$L$**: Latitude of the location.
- **$D$**: Solar declination angle on the given day.

The computed angle $H$ (in degrees) is converted to hours by dividing by $15$ ($15^\circ = 1 \text{ hour}$), representing the time offset before or after midday (transit time).

#### Angle Parameters ($a$) by Prayer:
- **Fajr (Dawn):** $a = -18^\circ$ (Diyanet standard).
- **Sunrise:** $a = -0.833^\circ$ (to account for atmospheric refraction and the sun's radius).
- **Dhuhr (Midday):** Peak point of the sun ($H = 0$).
- **Asr (Afternoon):** Based on the shadow length of a vertical object: $a = \text{arccot}(1 + \tan(|L - D|))$.
- **Maghrib (Sunset):** $a = -0.833^\circ$.
- **Isha (Night):** $a = -17^\circ$ (Diyanet standard).

### 2. Software Calculation Lifecycle

When the calculation is initiated, it executes the following steps:

1. **Julian Day Conversion:** Convert the Gregorian date to Julian Date (JD) for continuous astronomical tracking.
2. **Solar Position ($D$ and $EqT$):** Compute the Solar Declination ($D$) and the Equation of Time ($EqT$). The Equation of Time corrects for the eliptical orbit of the earth, resolving the difference (-14 to +16 minutes) between apparent solar time and mean time.
3. **Midday Transit Time ($Z$):** Compute the exact local time the sun reaches its zenith:
   $$Z = 12 + \text{Timezone} - \left(\frac{\lambda}{15}\right) - \left(\frac{EqT}{60}\right)$$
   Where $\lambda$ represents longitude.
4. **Hour Angle Loop:** Compute $H$ for Fajr, Sunrise, Sunset, and Isha.
   - For morning events (Fajr, Sunrise): $Time = Z - \frac{H}{15}$
   - For afternoon/evening events (Sunset, Isha): $Time = Z + \frac{H}{15}$
5. **Extreme Latitudes (Edge Cases):** At extreme latitudes (near the poles), the sun may not rise or set depending on the season, causing $\cos(H)$ to exceed $[-1, 1]$ and throw `NaN` errors. The code detects this and falls back to safety rules (e.g., *Seventh of the Night* rule).
6. **Offsets & Formatting:** Apply custom safety minutes (temkin) and format the fractional hours into standard `HH:MM` format.

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
