import os
import sys

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

BASE_DIR = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE_DIR, "models")


def combined_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    smooth = 1e-7
    intersection = tf.reduce_sum(y_true * y_pred)
    dice = (2. * intersection + smooth) / (
        tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) + smooth
    )
    return bce + (1 - dice) * 2

clf_model = load_model(os.path.join(MODELS_DIR, "classification_model.keras"))
seg_model = load_model(
    os.path.join(MODELS_DIR, "segmentation_model.keras"),
    custom_objects={"combined_loss": combined_loss}
)

if len(sys.argv) < 2:
    raise SystemExit("Usage: python predict.py <image_path>")

img_path = sys.argv[1]
mask_path = sys.argv[2] if len(sys.argv) > 2 else "output_mask.png"

img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
if img is None:
    raise ValueError(f"Could not read image file: {img_path}")

img = cv2.resize(img, (128,128))
img = img / 255.0

input_img = img.reshape(1,128,128,1)

clf_pred = clf_model.predict(input_img, verbose=0)[0][0]
label = "Stroke" if clf_pred > 0.5 else "Normal"

seg_pred = seg_model.predict(input_img, verbose=0)[0]
seg_mask = (seg_pred > 0.2).astype(np.uint8) * 255

mask_dir = os.path.dirname(mask_path)
if mask_dir:
    os.makedirs(mask_dir, exist_ok=True)

cv2.imwrite(mask_path, seg_mask)

print(label)
