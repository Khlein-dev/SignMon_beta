from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import tempfile
import os
import math

from A_G import AGDetector
from H_N import HNDetector
from NS import NSTildeSDetector
from T_Z import TZDetector
from number_detector import NumbersDetector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "hand_landmarker.task"

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=VisionRunningMode.IMAGE,
    num_hands=1,
    min_hand_detection_confidence=0.6,
    min_hand_presence_confidence=0.6,
    min_tracking_confidence=0.6,
)

landmarker = HandLandmarker.create_from_options(options)

quiz_classifiers = {
    "quiz1": AGDetector(),         # A-G
    "quiz2": HNDetector(),         # H-N
    "quiz3": NSTildeSDetector(),   # Ñ-S
    "quiz4": TZDetector(),         # T-Z
    "quiz5": NumbersDetector(),    # 1-10
}


@app.get("/")
def root():
    return {
        "message": "Detector server is running",
        "supported_quizzes": list(quiz_classifiers.keys()),
    }


@app.get("/quizzes")
def get_quizzes():
    return {
        "quizzes": {
            "quiz1": "A-G",
            "quiz2": "H-N",
            "quiz3": "Ñ-S",
            "quiz4": "T-Z",
            "quiz5": "1-10",
        }
    }


@app.post("/detect-sign")
async def detect_sign_default(file: UploadFile = File(...)):
    return await detect_sign("quiz1", file)


@app.post("/detect-sign/{quiz_name}")
async def detect_sign(quiz_name: str, file: UploadFile = File(...)):
    classifier = quiz_classifiers.get(quiz_name)

    if classifier is None:
        return {
            "label": None,
            "error": f"Unsupported quiz '{quiz_name}'. Use quiz1, quiz2, quiz3, quiz4, or quiz5.",
        }

    suffix = os.path.splitext(file.filename or "")[1] or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        image = cv2.imread(tmp_path)
        if image is None:
            return {"label": None, "error": "Could not read image"}

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        result = landmarker.detect(mp_image)

        if not result.hand_landmarks:
            return {"label": None, "error": "No hand detected"}

        landmarks = result.hand_landmarks[0]
        handedness = get_handedness(result)

        features = extract_features(landmarks, handedness)
        scores = classifier.get_scores(features)

        if not scores:
            return {"label": None, "error": "No scores returned by classifier"}

        best_label = max(scores, key=scores.get)
        best_score = scores[best_label]

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        second_label, second_score = ranked[1] if len(ranked) > 1 else (None, 0.0)

        note = None
        label = best_label

        if best_score < 0.72:
            label = None
            note = "Low confidence match."
        elif second_label is not None and (best_score - second_score) < 0.08:
            label = None
            note = f"Ambiguous between {best_label} and {second_label}."

        return {
            "quiz": quiz_name,
            "label": label,
            "letter": label if label and not label.isdigit() else None,
            "number": int(label) if label and label.isdigit() else None,
            "debug": {
                "handedness": handedness,
                "fingers_up": features["fingers_up"],
                "thumb_open": features["thumb_open"],
                "palm_size": round(features["palm_size"], 4),
                "candidate_scores": scores,
                "best_score": round(best_score, 4),
                "second_best": second_label,
                "second_best_score": round(second_score, 4) if second_label else 0.0,
                "note": note,
            },
        }

    except Exception as e:
        return {"label": None, "error": str(e)}

    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def get_handedness(result):
    try:
        if result.handedness and len(result.handedness) > 0:
            first = result.handedness[0]
            if first and len(first) > 0:
                return first[0].category_name
    except Exception:
        pass
    return "Unknown"


def distance_2d(p1, p2):
    return float(((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5)


def vec(a, b):
    return [b.x - a.x, b.y - a.y]


def angle_3pts(a, b, c):
    ba = vec(b, a)
    bc = vec(b, c)

    nba = (ba[0] ** 2 + ba[1] ** 2) ** 0.5
    nbc = (bc[0] ** 2 + bc[1] ** 2) ** 0.5
    if nba == 0 or nbc == 0:
        return 180.0

    cosang = (ba[0] * bc[0] + ba[1] * bc[1]) / (nba * nbc)
    cosang = max(-1.0, min(1.0, cosang))
    return float(math.degrees(math.acos(cosang)))


def safe_ratio(a, b):
    return a / b if b > 1e-6 else 0.0


def pinch_ratio(p1, p2, palm_size):
    return safe_ratio(distance_2d(p1, p2), palm_size)


def is_thumb_open_robust(landmarks, handedness, palm_size):
    thumb_mcp = landmarks[2]
    thumb_ip = landmarks[3]
    thumb_tip = landmarks[4]
    index_mcp = landmarks[5]
    palm_center = landmarks[9]

    thumb_reach = safe_ratio(distance_2d(thumb_tip, palm_center), palm_size)
    thumb_span = safe_ratio(distance_2d(thumb_tip, index_mcp), palm_size)
    thumb_angle = angle_3pts(thumb_mcp, thumb_ip, thumb_tip)

    return thumb_reach > 0.65 and thumb_span > 0.45 and thumb_angle > 145


def is_compact_fist(landmarks, palm_size):
    palm_center = landmarks[9]
    fingertip_ids = [8, 12, 16, 20]
    dists = [
        safe_ratio(distance_2d(landmarks[i], palm_center), palm_size)
        for i in fingertip_ids
    ]
    return max(dists) < 0.72


def is_flat_palm(landmarks):
    ys = [landmarks[8].y, landmarks[12].y, landmarks[16].y, landmarks[20].y]
    return (max(ys) - min(ys)) < 0.10


def is_c_shape_robust(landmarks, palm_size):
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    pinky_tip = landmarks[20]

    di = safe_ratio(distance_2d(thumb_tip, index_tip), palm_size)
    dm = safe_ratio(distance_2d(thumb_tip, middle_tip), palm_size)
    dp = safe_ratio(distance_2d(thumb_tip, pinky_tip), palm_size)

    index_curved = angle_3pts(landmarks[6], landmarks[7], landmarks[8]) < 165
    middle_curved = angle_3pts(landmarks[10], landmarks[11], landmarks[12]) < 165

    return (
        0.45 < di < 1.25
        and 0.55 < dm < 1.45
        and 0.85 < dp < 2.0
        and index_curved
        and middle_curved
    )


def extract_features(landmarks, handedness):
    wrist = landmarks[0]
    index_mcp = landmarks[5]
    middle_mcp = landmarks[9]
    pinky_mcp = landmarks[17]

    palm_size = (
        distance_2d(wrist, middle_mcp)
        + distance_2d(index_mcp, pinky_mcp)
    ) / 2.0

    finger_defs = {
        "index": (5, 6, 7, 8),
        "middle": (9, 10, 11, 12),
        "ring": (13, 14, 15, 16),
        "pinky": (17, 18, 19, 20),
    }

    finger_states = {}
    finger_up = []

    for name, (mcp_i, pip_i, dip_i, tip_i) in finger_defs.items():
        mcp = landmarks[mcp_i]
        pip = landmarks[pip_i]
        dip = landmarks[dip_i]
        tip = landmarks[tip_i]

        straightness = angle_3pts(pip, dip, tip)
        curl_angle = angle_3pts(mcp, pip, dip)
        tip_to_mcp = safe_ratio(distance_2d(tip, mcp), palm_size)
        tip_to_palm = safe_ratio(distance_2d(tip, middle_mcp), palm_size)

        extended = (
            tip.y < pip.y < mcp.y
            and straightness > 150
            and tip_to_mcp > 0.75
            and tip_to_palm > 0.55
        )

        curled = (
            tip.y > pip.y - 0.02
            or straightness < 135
            or tip_to_mcp < 0.68
            or tip_to_palm < 0.52
        )

        finger_states[name] = {
            "extended": extended,
            "curled": curled,
            "straightness": straightness,
            "curl_angle": curl_angle,
            "tip_to_mcp": tip_to_mcp,
            "tip_to_palm": tip_to_palm,
        }
        finger_up.append(1 if extended else 0)

    thumb_open = is_thumb_open_robust(landmarks, handedness, palm_size)

    return {
        "landmarks": landmarks,
        "handedness": handedness,
        "palm_size": palm_size,
        "thumb_open": thumb_open,
        "finger_states": finger_states,
        "fingers_up": [1 if thumb_open else 0] + finger_up,
        "compact_fist": is_compact_fist(landmarks, palm_size),
        "flat_palm": is_flat_palm(landmarks),
        "c_shape": is_c_shape_robust(landmarks, palm_size),
        "pinch_index_thumb": pinch_ratio(landmarks[4], landmarks[8], palm_size),
        "pinch_middle_thumb": pinch_ratio(landmarks[4], landmarks[12], palm_size),
        "pinch_ring_thumb": pinch_ratio(landmarks[4], landmarks[16], palm_size),
        "pinch_pinky_thumb": pinch_ratio(landmarks[4], landmarks[20], palm_size),
    }