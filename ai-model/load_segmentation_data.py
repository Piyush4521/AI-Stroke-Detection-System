import os
import cv2
import numpy as np

image_root = "dataset/segmentation/train/images"
mask_root = "dataset/segmentation/train/masks"

IMG_SIZE = 128

images = []
masks = []

for folder in os.listdir(image_root):
    image_folder = os.path.join(image_root, folder)
    mask_folder = os.path.join(mask_root, folder)

    for file in os.listdir(image_folder):
        img_path = os.path.join(image_folder, file)
        mask_path = os.path.join(mask_folder, file)

        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        img = img / 255.0

        mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
        mask = cv2.resize(mask, (IMG_SIZE, IMG_SIZE))
        mask = mask / 255.0

        images.append(img)
        masks.append(mask)

images = np.array(images)
masks = np.array(masks)