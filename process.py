# preprocess.py
import cv2
import numpy as np

def clean_image(thresholded_path, min_area=200):
    thresholded = cv2.imread(thresholded_path, cv2.IMREAD_GRAYSCALE)
    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(thresholded, connectivity=8)

    cleaned = np.zeros_like(thresholded)
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            cleaned[labels == i] = 255

    return cleaned









