import base64
import cv2
import numpy as np


def encode_png(image: np.ndarray) -> str:
    ok, encoded = cv2.imencode(".png", image)
    if not ok:
        raise ValueError("Could not encode the generated image.")
    return base64.b64encode(encoded.tobytes()).decode("ascii")


def draw_matches(source, source_keypoints, reference, reference_keypoints, matches, mask):
    flags = cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    return cv2.drawMatches(source, source_keypoints, reference, reference_keypoints, matches, None,
                           matchColor=(80, 210, 255), singlePointColor=(160, 160, 160),
                           matchesMask=mask.tolist(), flags=flags)
