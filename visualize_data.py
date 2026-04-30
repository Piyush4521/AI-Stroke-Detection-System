import matplotlib.pyplot as plt
import numpy as np

# Load arrays (reuse your previous script)
from load_segmentation_data import images, masks

# Pick random index
idx = np.random.randint(0, len(images))

img = images[idx]
mask = masks[idx]

# Plot
plt.figure(figsize=(10,5))

plt.subplot(1,3,1)
plt.imshow(img, cmap='gray')
plt.title("CT Image")
plt.axis('off')

plt.subplot(1,3,2)
plt.imshow(mask, cmap='gray')
plt.title("Mask")
plt.axis('off')

# Overlay
plt.subplot(1,3,3)
plt.imshow(img, cmap='gray')
plt.imshow(mask, cmap='jet', alpha=0.5)
plt.title("Overlay")
plt.axis('off')

plt.show()