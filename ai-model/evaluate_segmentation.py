import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from load_segmentation_data import images, masks


def combined_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)

    smooth = 1e-7
    intersection = tf.reduce_sum(y_true * y_pred)
    dice = (2. * intersection + smooth) / (
        tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) + smooth
    )

    return bce + (1 - dice) * 2


model = load_model(
    "models/segmentation_model.keras",
    custom_objects={"combined_loss": combined_loss}
)

X = images.reshape(-1, 128, 128, 1)
y_true = masks.reshape(-1, 128, 128, 1)

print("Evaluating on:", X.shape)

y_pred = model.predict(X)

print("Prediction min:", y_pred.min())
print("Prediction max:", y_pred.max())
print("Mask unique values:", np.unique(y_true))

y_pred = (y_pred > 0.05).astype(np.float32)


def dice_score(y_true, y_pred):
    intersection = np.sum(y_true * y_pred)
    return (2. * intersection) / (np.sum(y_true) + np.sum(y_pred) + 1e-7)


def iou_score(y_true, y_pred):
    intersection = np.sum(y_true * y_pred)
    union = np.sum(y_true) + np.sum(y_pred) - intersection
    return intersection / (union + 1e-7)


dice = dice_score(y_true, y_pred)
iou = iou_score(y_true, y_pred)

print("\n===== SEGMENTATION METRICS =====")
print("Dice Score:", round(dice, 4))
print("IoU Score:", round(iou, 4))
