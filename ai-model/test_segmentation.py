import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from load_segmentation_data import images, masks

model = load_model("models/segmentation_model.keras")

idx = np.random.randint(0, len(images))

img = images[idx]
true_mask = masks[idx]

input_img = img.reshape(1, 128, 128, 1)

pred_mask = model.predict(input_img)[0]

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
