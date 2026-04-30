# AI Stroke Detection System

This project is now structured as a full-stack stroke analysis platform:

- `React` frontend for login, upload, result viewing, and scan history
- `Express + Node.js` backend for auth, uploads, database access, and model execution
- `MongoDB` for users and saved scan results
- `Python` ML pipeline for CT classification and lesion mask generation

The existing trained model files remain in `ai-model/models/`.

## Features

- User registration and login
- Authenticated CT scan uploads
- Stroke classification output: `Normal` or `Stroke`
- Generated mask image per scan
- Per-user scan history stored in MongoDB
- React dashboard UI

## Project Structure

```text
AI-Stroke-Project/
|-- ai-model/
|   |-- dataset/
|   |-- models/
|   |-- predict.py
|   |-- train_classification.py
|   |-- train_segmentation.py
|   |-- evaluate_segmentation.py
|   `-- test_segmentation.py
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- utils/
|   |-- .env.example
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- src/
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- docker-compose.yml
|-- requirements.txt
`-- README.md
```

## Dataset Summary

- Classification train set: `1085` Normal, `665` Stroke
- Classification validation set: `232` Normal, `142` Stroke
- Segmentation train set: `208` image/mask pairs
- Segmentation validation set: `42` image/mask pairs

## Requirements

- Python 3
- Node.js
- npm
- MongoDB

Install Python dependencies from the project root:

```bash
pip install -r requirements.txt
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Backend Environment

Backend environment variables live in `backend/.env`.

Copy from the example file:

```bash
cd backend
copy .env.example .env
```

Important backend variables:

- `MONGODB_URI`
- `PORT`
- `PYTHON_COMMAND`
- `PUBLIC_BASE_URL`
- `MAX_UPLOAD_SIZE_MB`
- `PREDICTION_TIMEOUT_MS`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## Frontend Environment

Frontend environment variables live in `frontend/.env`.

Copy from the example file:

```bash
cd frontend
copy .env.example .env
```

Important frontend variable:

- `VITE_API_BASE_URL`

## Starting MongoDB

If you want the fastest local setup, use Docker Desktop.

From the project root:

```bash
docker compose up -d mongodb
```

This starts MongoDB on `mongodb://127.0.0.1:27017/ai-stroke-detection-system`.

## Running The Project

Start the backend:

```bash
cd backend
npm start
```

Start the React frontend in a second terminal:

```bash
cd frontend
npm start
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

If you build the frontend, the backend can serve it from `/app`:

```bash
cd frontend
npm run build
```

Then the backend can serve the built app at:

- `http://localhost:5000/app`

## Main API Routes

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Scans:

- `GET /api/scans`
- `GET /api/scans/:scanId`
- `POST /api/scans`

System:

- `GET /`
- `GET /health`

## Upload Flow

1. User logs in or registers
2. React sends the CT image to `POST /api/scans`
3. Express stores the upload
4. Backend runs `ai-model/predict.py`
5. Python creates a unique mask image
6. Backend stores metadata in MongoDB
7. Frontend shows the prediction and updated history

## Model Script

Run the inference script manually from inside the `ai-model` folder:

```bash
cd ai-model
python predict.py path/to/image.jpg
```

Or with a custom output path:

```bash
cd ai-model
python predict.py path/to/image.jpg path/to/output-mask.png
```

## Notes

- Accepted upload types: `jpg`, `jpeg`, `png`
- Default max upload size: `10 MB`
- Uploaded images and generated masks are stored locally under `backend/storage/`
- `visualize_data.py`, `check_dataset.py`, and `test.py` are still present as helper scripts
