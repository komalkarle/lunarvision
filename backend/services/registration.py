import cv2
import numpy as np


def estimate_registration(source_keypoints, reference_keypoints, matches):
    if len(matches) < 4:
        return None, np.zeros(0, dtype=np.uint8)
    source_points = np.float32([source_keypoints[m.queryIdx].pt for m in matches])
    reference_points = np.float32([reference_keypoints[m.trainIdx].pt for m in matches])
    homography, mask = cv2.findHomography(source_points, reference_points, cv2.RANSAC, 5.0)
    if homography is None or mask is None:
        return None, np.zeros(0, dtype=np.uint8)
    return homography, mask.ravel().astype(np.uint8)


def warp_source(source, homography, reference_shape):
    height, width = reference_shape[:2]
    return cv2.warpPerspective(source, homography, (width, height))
