import sys
import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model

# =========================
# 🔹 CUSTOM LOSS (REQUIRED)
# =========================
def combined_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    smooth = 1e-7
    intersection = tf.reduce_sum(y_true * y_pred)
    dice = (2. * intersection + smooth) / (
        tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) + smooth
    )
    return bce + (1 - dice) * 2

# =========================
# 🔹 LOAD MODELS
# =========================
clf_model = load_model("models/classification_model.keras")
seg_model = load_model(
    "models/segmentation_model.keras",
    custom_objects={"combined_loss": combined_loss}
)

# =========================
# 🔹 LOAD IMAGE
# =========================
img_path = sys.argv[1]

img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
img = cv2.resize(img, (128,128))
img = img / 255.0

input_img = img.reshape(1,128,128,1)

# =========================
# 🔹 CLASSIFICATION
# =========================
clf_pred = clf_model.predict(input_img)[0][0]
label = "Stroke" if clf_pred > 0.5 else "Normal"

# =========================
# 🔹 SEGMENTATION
# =========================
seg_pred = seg_model.predict(input_img)[0]
seg_mask = (seg_pred > 0.2).astype(np.uint8) * 255

# Save mask
mask_path = "output_mask.png"
cv2.imwrite(mask_path, seg_mask)

# =========================
# 🔹 OUTPUT RESULT
# =========================
print(label)