from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.feature_detection import detect_features
from services.matching import match_descriptors
from services.metrics import calculate_metrics
from services.preprocessing import decode_and_preprocess
from services.registration import estimate_registration, warp_source
from services.visualization import draw_matches, encode_png

MAX_BYTES = 25 * 1024 * 1024
app = FastAPI(title="LunaMatch Registration API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "baseline": "SIFT + BFMatcher + RANSAC homography"}


@app.post("/register")
async def register(source_image: UploadFile = File(...), reference_image: UploadFile = File(...)):
    try:
        source_bytes = await source_image.read()
        reference_bytes = await reference_image.read()
        if not source_bytes or not reference_bytes:
            return JSONResponse(status_code=400, content={"success": False, "error": "Both image files must contain data."})
        if len(source_bytes) > MAX_BYTES or len(reference_bytes) > MAX_BYTES:
            return JSONResponse(status_code=413, content={"success": False, "error": "Each image must be smaller than 25 MB."})

        source = decode_and_preprocess(source_bytes)
        reference = decode_and_preprocess(reference_bytes)
        source_keypoints, source_descriptors = detect_features(source)
        reference_keypoints, reference_descriptors = detect_features(reference)
        _, good_matches = match_descriptors(source_descriptors, reference_descriptors)
        homography, mask = estimate_registration(source_keypoints, reference_keypoints, good_matches)
        if homography is None or int(mask.sum()) < 4:
            return JSONResponse(status_code=422, content={
                "success": False,
                "error": "Not enough reliable feature correspondences were found. Try images with more visible surface features.",
            })

        registered = warp_source(source, homography, reference.shape)
        metrics = calculate_metrics(source_keypoints, reference_keypoints, good_matches, homography, mask, source.shape)
        matches = []
        source_height, source_width = source.shape[:2]
        reference_height, reference_width = reference.shape[:2]
        for index, match in enumerate(good_matches):
            sx, sy = source_keypoints[match.queryIdx].pt
            rx, ry = reference_keypoints[match.trainIdx].pt
            matches.append({
                "sx": sx / source_width, "sy": sy / source_height,
                "rx": rx / reference_width, "ry": ry / reference_height,
                "inlier": bool(mask[index]),
            })
        match_image = draw_matches(source, source_keypoints, reference, reference_keypoints, good_matches, mask)
        return {
            "success": True,
            "metrics": {
                **metrics,
                "source_keypoints": len(source_keypoints),
                "reference_keypoints": len(reference_keypoints),
            },
            "matches": matches,
            "homography": homography.tolist(),
            "registered_image": encode_png(registered),
            "match_visualization": encode_png(match_image),
        }
    except ValueError as error:
        return JSONResponse(status_code=400, content={"success": False, "error": str(error)})
    except Exception:
        return JSONResponse(status_code=500, content={"success": False, "error": "Registration could not be completed. Please verify both images and try again."})
