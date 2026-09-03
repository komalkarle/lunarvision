import cv2
import numpy as np


def calculate_metrics(source_keypoints, reference_keypoints, matches, homography, mask, source_shape):
    inlier_count = int(mask.sum())
    total = len(matches)
    inlier_ratio = (inlier_count / total * 100) if total else 0.0
    coverage = 0.0
    rmse = None
    if inlier_count and homography is not None:
        source_points = np.float32([source_keypoints[m.queryIdx].pt for i, m in enumerate(matches) if mask[i]])
        reference_points = np.float32([reference_keypoints[m.trainIdx].pt for i, m in enumerate(matches) if mask[i]])
        projected = cv2.perspectiveTransform(source_points.reshape(-1, 1, 2), homography).reshape(-1, 2)
        errors = np.linalg.norm(projected - reference_points, axis=1)
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        grid = set()
        height, width = source_shape[:2]
        for x, y in source_points:
            grid.add((min(7, int(x / max(width, 1) * 8)), min(5, int(y / max(height, 1) * 6))))
        coverage = len(grid) / 48 * 100

    scale = float(np.sqrt(homography[0, 0] ** 2 + homography[1, 0] ** 2)) if homography is not None else 0.0
    rotation = float(np.degrees(np.arctan2(homography[1, 0], homography[0, 0]))) if homography is not None else 0.0
    translation = [float(homography[0, 2]), float(homography[1, 2])] if homography is not None else [0.0, 0.0]
    return {
        "inlier_matches": inlier_count,
        "total_matches": total,
        "inlier_ratio": inlier_ratio,
        "rmse": rmse,
        "spatial_coverage": coverage,
        "scale_ratio": scale,
        "rotation_deg": rotation,
        "translation": translation,
    }
