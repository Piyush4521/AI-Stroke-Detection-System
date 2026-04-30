# AI Stroke Detection System

This project combines a Python-based AI pipeline with a small Node.js backend to detect stroke from CT scan images.

The repository contains two model workflows:

- Classification: predicts whether a scan is `Normal` or `Stroke`
- Segmentation: generates a lesion mask for the same image

Pretrained model files are already included in `ai-model/models/`.

## Project Structure

```text
AI-Stroke-Project/
|-- ai-model/
|   |-- dataset/
|   |-- models/
|   |-- train_classification.py
|   |-- train_segmentation.py
|   |-- evaluate_segmentation.py
|   |-- test_segmentation.py
|   |-- predict.py
|   `-- load_segmentation_data.py
|-- backend/
|   |-- server.js
|   |-- package.json
|   `-- package-lock.json
|-- check_dataset.py
|-- test.py
|-- visualize_data.py
`-- frontend/
```

## Dataset Summary

- Classification train set: `1085` Normal, `665` Stroke
- Classification validation set: `232` Normal, `142` Stroke
- Segmentation train set: `208` image/mask pairs
- Segmentation validation set: `42` image/mask pairs

## Requirements

- Python 3
- Node.js
- pip
- npm

Install Python dependencies from the project root:

```bash
pip install -r requirements.txt
```

Install backend dependencies from the `backend` folder:

```bash
cd backend
npm install
```

## Run the Backend

Start the backend from inside the `backend` folder:

```bash
cd backend
node server.js
```

The backend runs on `http://localhost:5000`.

Available routes:

- `GET /` returns a simple health message
- `POST /predict` accepts a file upload with the field name `file`

The prediction response returns:

- `prediction`: `Normal` or `Stroke`
- `mask_url`: URL for the generated segmentation mask

## Model Scripts

Run the model scripts from inside the `ai-model` folder because the current code uses relative dataset and model paths.

```bash
cd ai-model
python train_classification.py
python train_segmentation.py
python evaluate_segmentation.py
python test_segmentation.py
```

You can also run single-image inference from the same folder:

```bash
cd ai-model
python predict.py path/to/image.jpg
```

## Notes

- `check_dataset.py` prints folder and file counts
- `test.py` is a small environment check for NumPy and OpenCV
- `visualize_data.py` is a quick visualization helper kept as-is
- The `frontend/` folder is present in the repository but currently empty
