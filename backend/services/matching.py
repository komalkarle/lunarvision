import cv2
import numpy as np


def match_descriptors(source_descriptors, reference_descriptors, ratio: float = 0.75):
    if source_descriptors is None or reference_descriptors is None:
        return [], []
    matcher = cv2.BFMatcher(cv2.NORM_L2)
    pairs = matcher.knnMatch(source_descriptors, reference_descriptors, k=2)
    candidates = [pair[0] for pair in pairs if len(pair) == 2]
    good = [pair[0] for pair in pairs if len(pair) == 2 and pair[0].distance < ratio * pair[1].distance]
    return candidates, good
