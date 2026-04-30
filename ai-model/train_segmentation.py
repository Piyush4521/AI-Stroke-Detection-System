import numpy as np
import os
import tensorflow as tf
from tensorflow.keras import layers, models
from load_segmentation_data import images, masks

# =========================
# 🔹 PREPARE DATA
# =========================
X = images.reshape(-1, 128, 128, 1)
y = masks.reshape(-1, 128, 128, 1)

print("X shape:", X.shape)
print("y shape:", y.shape)

# =========================
# 🔹 STRONG COMBINED LOSS
# =========================
def combined_loss(y_true, y_pred):
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)

    smooth = 1e-7
    intersection = tf.reduce_sum(y_true * y_pred)
    dice = (2. * intersection + smooth) / (
        tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) + smooth
    )

    return bce + (1 - dice) * 2   # 🔥 stronger focus on lesion

# =========================
# 🔹 U-NET MODEL
# =========================
def conv_block(x, filters):
    x = layers.Conv2D(filters, (3,3), padding='same', activation='relu')(x)
    x = layers.BatchNormalization()(x)
    x = layers.Conv2D(filters, (3,3), padding='same', activation='relu')(x)
    x = layers.BatchNormalization()(x)
    return x

def build_unet(input_shape=(128,128,1)):
    inputs = layers.Input(input_shape)

    c1 = conv_block(inputs, 32)
    p1 = layers.MaxPooling2D()(c1)

    c2 = conv_block(p1, 64)
    p2 = layers.MaxPooling2D()(c2)

    c3 = conv_block(p2, 128)
    p3 = layers.MaxPooling2D()(c3)

    c4 = conv_block(p3, 256)

    u5 = layers.UpSampling2D()(c4)
    u5 = layers.concatenate([u5, c3])
    c5 = conv_block(u5, 128)

    u6 = layers.UpSampling2D()(c5)
    u6 = layers.concatenate([u6, c2])
    c6 = conv_block(u6, 64)

    u7 = layers.UpSampling2D()(c6)
    u7 = layers.concatenate([u7, c1])
    c7 = conv_block(u7, 32)

    outputs = layers.Conv2D(1, (1,1), activation='sigmoid')(c7)

    return models.Model(inputs, outputs)

model = build_unet()

model.compile(
    optimizer='adam',
    loss=combined_loss,
    metrics=['accuracy']
)

model.summary()

# =========================
# 🔹 TRAIN (IMPORTANT SETTINGS)
# =========================
model.fit(
    X, y,
    epochs=25,       # 🔥 more learning
    batch_size=4     # 🔥 better for small data
)

# =========================
# 🔹 SAVE MODEL
# =========================
os.makedirs("models", exist_ok=True)
model.save("models/segmentation_model.keras")

print("✅ Segmentation model saved!")