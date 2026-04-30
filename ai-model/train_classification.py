import os
import cv2
import numpy as np

IMG_SIZE = 128

# =========================
# 🔹 LOAD TRAIN DATA
# =========================
train_data = []
train_labels = []

train_path = "dataset/classification/train"

for category in ["Normal", "Stroke"]:
    path = os.path.join(train_path, category)
    label = 0 if category == "Normal" else 1

    for img_name in os.listdir(path):
        img_path = os.path.join(path, img_name)

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img / 255.0

        train_data.append(img)
        train_labels.append(label)

X_train = np.array(train_data)
y_train = np.array(train_labels)

# Add channel dimension
X_train = X_train.reshape(-1, IMG_SIZE, IMG_SIZE, 1)

print("Train shape:", X_train.shape)


# =========================
# 🔹 LOAD VALIDATION DATA
# =========================
val_data = []
val_labels = []

val_path = "dataset/classification/val"

for category in ["Normal", "Stroke"]:
    path = os.path.join(val_path, category)
    label = 0 if category == "Normal" else 1

    for img_name in os.listdir(path):
        img_path = os.path.join(path, img_name)

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img / 255.0

        val_data.append(img)
        val_labels.append(label)

X_val = np.array(val_data)
y_val = np.array(val_labels)

X_val = X_val.reshape(-1, IMG_SIZE, IMG_SIZE, 1)

print("Validation shape:", X_val.shape)


# =========================
# 🔹 BUILD MODEL (CNN)
# =========================
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense

model = Sequential([
    Conv2D(32, (3,3), activation='relu', input_shape=(128,128,1)),
    MaxPooling2D(2,2),

    Conv2D(64, (3,3), activation='relu'),
    MaxPooling2D(2,2),

    Flatten(),
    Dense(128, activation='relu'),
    Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam',
              loss='binary_crossentropy',
              metrics=['accuracy'])

model.summary()


# =========================
# 🔹 TRAIN MODEL
# =========================
history = model.fit(
    X_train, y_train,
    epochs=5,
    batch_size=32,
    validation_data=(X_val, y_val)
)


os.makedirs("models", exist_ok=True)
model.save("models/classification_model.keras")

print("✅ Model saved successfully!")