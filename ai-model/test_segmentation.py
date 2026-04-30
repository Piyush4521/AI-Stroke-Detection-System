import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from load_segmentation_data import images, masks

# Load model
model = load_model("models/segmentation_model.keras")

# Pick random image
idx = np.random.randint(0, len(images))

img = images[idx]
true_mask = masks[idx]

# Prepare input
input_img = img.reshape(1, 128, 128, 1)

# Predict
pred_mask = model.predict(input_img)[0]

# Plot
plt.figure(figsize=(12,4))

plt.subplot(1,4,1)
plt.imshow(img, cmap='gray')
plt.title("CT Image")
plt.axis('off')

plt.subplot(1,4,2)
plt.imshow(true_mask, cmap='gray')
plt.title("True Mask")
plt.axis('off')

plt.subplot(1,4,3)
plt.imshow(pred_mask, cmap='gray')
plt.title("Predicted Mask")
plt.axis('off')

plt.subplot(1,4,4)
plt.imshow(img, cmap='gray')
plt.imshow(pred_mask, cmap='jet', alpha=0.5)
plt.title("Overlay")
plt.axis('off')

plt.show()