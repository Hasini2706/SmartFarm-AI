# SmartFarm AI 🌾

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0-emerald.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5.0-orange?style=flat&logo=scikit-learn)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.4-cyan?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-enabled-blue?style=flat&logo=docker)](https://www.docker.com)

**SmartFarm AI** is a production-ready, startup-level Precision Agriculture Platform. It utilizes Artificial Intelligence, Machine Learning, and Computer Vision to help farmers, agricultural consultants, and co-ops make data-driven decisions to optimize crop health and yield outputs.

---

## 🚀 Key Modules & Features

1. **Crop Disease Detection**: Upload leaf photographs to analyze visual features using OpenCV and a Scikit-Learn classifier. Detects 14 diseases with treatment maps, causes, prevention advice, and downloadable PDF audits.
2. **Yield Prediction Modeling**: Simulates production rates (t/ha) using Scikit-Learn regression pipelines. Generates sensitivity charts based on rainfall variations.
3. **Crop Suitability Recommendation**: Formulates NPK soil concentrations and local weather telemetry to suggest the top 5 matching crops.
4. **Smart Irrigation Scheduling**: Calibrates soil moisture, temperature, crop growth stage, and weather condition variables to output daily water volumes (L/m²) and stress warnings.
5. **Weather Intelligence & Advice**: Caches geographical forecast models and converts them into real-time agronomic insights (e.g., notifying farmers to postpone sprays before rain).
6. **Fertilizer Recommendation**: Decision tree algorithm recommending customized chemical/organic soil feeds (Urea, DAP, NPK, SSP, compost) with explanations.
7. **Pest Detection**: Image scanner identifying crop insects (e.g. Bollworms, Aphids) with urgency metrics and pesticide/organic control treatments.
8. **Farmer AI Assistant Chatbot**: Natural language bot with speech-to-text input (speechRecognition) and text-to-speech outputs (speechSynthesis) for accessibility.
9. **SaaS Dashboard**: Renders micro-KPI stats, multi-line timeseries yield trends, recent activities log, and quick diagnostic links.
10. **Advanced Analytics**: Multi-dimensional scatter plots of pH-to-yield thresholds and comparative carbon footprint footprint models.

---

## 📁 Repository Structure

```text
smartfarm-ai/
├── .github/workflows/
│   └── ci.yml               # GitHub actions automation CI configuration
├── backend/
│   ├── app/
│   │   ├── ml/              # Custom ML pipeline prediction classes
│   │   │   ├── disease_classifier.py
│   │   │   ├── crop_recommender.py
│   │   │   ├── yield_predictor.py
│   │   │   ├── irrigation_predictor.py
│   │   │   ├── fertilizer_recommender.py
│   │   │   ├── pest_detector.py
│   │   │   └── insights_generator.py
│   │   ├── routers/         # FastAPI modular API routers
│   │   ├── services/        # Weather caching and LLM integrations
│   │   ├── auth.py          # Bcrypt hashing and JWT authorization
│   │   ├── main.py          # FastAPI server entry point
│   │   ├── database.py      # SQLAlchemy SQLite sessions
│   │   ├── models.py        # Database schema definitions
│   │   └── schemas.py       # Pydantic request/response models
│   ├── requirements.txt     # Python requirements list
│   └── Dockerfile           # Backend container build layout
├── frontend/
│   ├── src/
│   │   ├── components/      # UI components (Layout, GlassCard, Loaders)
│   │   ├── context/         # AuthContext JWT state persistence
│   │   ├── pages/           # Pages (Dashboard, AI chatbot, vision cards)
│   │   ├── App.tsx          # Client-side routing and guard layout
│   │   ├── main.tsx         # React DOM render entry
│   │   └── index.css        # Tailwind glassmorphic styling sheet
│   ├── package.json         # Node configurations
│   ├── vite.config.ts       # Vite proxy configurations
│   ├── nginx.conf           # Static server reverse proxy rules
│   └── Dockerfile           # Multi-stage production build layout
├── datasets/                # Generated simulation CSV databases
├── models/                  # Serialized Scikit-learn binary pipelines
├── docs/metrics/            # Training evaluation validation charts
├── scripts/
│   └── train_models.py      # Synthetic data generator and ML training script
├── docker-compose.yml       # Docker orchestrator mapping
└── tests/                   # Pytest API integration tests suite
```

---

## 🛠️ Installation & Getting Started

### Method 1: Using Docker (Recommended)

To run the entire multi-service stack in containers immediately (serves frontend on port `80` and backend on port `8000` with automated reverse-proxies):

```bash
# Clone the repository
git clone https://github.com/your-username/smartfarm-ai.git
cd smartfarm-ai

# Boot up services
docker-compose up --build
```

---

### Method 2: Manual Local Development

#### 1. Setup Backend:
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Return to root and train the models
cd ..
python scripts/train_models.py

# Launch FastAPI server
cd backend
uvicorn app.main:app --reload
```
API docs are interactive and accessible under: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

#### 2. Setup Frontend:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```
Open your browser and navigate to: [http://localhost:5173](http://localhost:5173).

---

## 🩺 API Endpoints Reference

### 1. Authentication
- `POST /api/v1/auth/register` - Create user account
- `POST /api/v1/auth/login` - Authenticate credentials, get token
- `GET /api/v1/auth/me` - Profile context

### 2. Predictions & Suitability
- `POST /api/v1/predictions/yield` - Simulate yield tonnes and production graph
- `POST /api/v1/predictions/irrigation` - Smart watering liters calculation
- `POST /api/v1/crop/recommendation` - Predict matching crops from NPK
- `POST /api/v1/crop/fertilizer` - Suggest optimal fertilizer

### 3. Vision & Diagnostics
- `POST /api/v1/crop/disease` - Classifies leaf image, returns prevention, saves PDF
- `GET /api/v1/crop/report/{history_id}/download` - Download diagnostic audit PDF
- `POST /api/v1/crop/pest` - Detects insect pests with urgency and treatments

### 4. Interactive Services
- `GET /api/v1/weather` - Caches forecasts, triggers agronomic advice
- `POST /api/v1/chat/message` - Transmit query to LLM farming chatbot
- `GET /api/v1/analytics` - Fetch dashboard KPIs and yield trends charts array

---

## 🧪 Testing Suite

We use **Pytest** to run API tests and validation scopes.
```bash
# Activate backend venv and run
pytest -v
```

---

## 🗺️ Product Roadmap

- [ ] **Phase 1: Multispectral Satellite Mapping**: Integrate Sentinel-2 / Landsat-8 API calls to compute NDVI indexes and crop vegetative growth curves.
- [ ] **Phase 2: IoT Soil Sensor Telemetries**: Provide hardware schematic guides and ESP32 firmware endpoints to upload real-time soil NPK, moisture, and temperature.
- [ ] **Phase 3: Hyperlocal Weather Alarms**: Integrate push notifications (SMS/WhatsApp) notifying farmers when high humidity and temperature signal high blight risk.
- [ ] **Phase 4: Multi-Lingual Support**: Add localization files (Hindi, Spanish, Punjabi) for local regions.

---

## 🙋 Frequently Asked Questions (FAQ)

#### Q: How does the leaf disease vision classifier operate without TensorFlow?
**A**: To ensure compatibility with modern environments (like Python 3.13 on Windows) where legacy TensorFlow wheel builds often fail to compile, we extract visual colors and textures from images (flattened 32x32 grids) using OpenCV and feed them to a Scikit-Learn `RandomForestClassifier`. This fits in seconds, runs locally in 1ms on CPU, and is extremely performant.

#### Q: Can I run this offline?
**A**: Yes! If you don't provide an OpenWeatherMap API key or Gemini API key, the platform automatically falls back to local mathematical meteorological models and a comprehensive keyword-rich agricultural knowledge engine. It also backs up queries into a local JSON cache (`data/weather_backup_cache.json`).

#### Q: How do I change the default GPS coordinates?
**A**: Sign in to your account, head over to **Platform Settings** (or click your profile avatar in the sidebar footer), and update the default Latitude/Longitude coordinates.

---

## 🤝 Contribution Guidelines

We welcome contributions from agronomists, software developers, and AI researchers:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
