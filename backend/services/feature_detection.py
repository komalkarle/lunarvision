import cv2
import numpy as np


def detect_features(image: np.ndarray):
    # SIFT is the replaceable baseline detector for future LoFTR/SuperPoint adapters.
    detector = cv2.SIFT_create(nfeatures=5000, contrastThreshold=0.02)
    keypoints, descriptors = detector.detectAndCompute(image, None)
    return keypoints, descriptors
