from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import numpy as np
import tempfile
import os

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
    min_hand_detection_confidence=0.5,
    min_hand_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)

landmarker = HandLandmarker.create_from_options(options)


@app.get("/")
def root():
    return {"message": "Detector server is running"}


@app.post("/detect-sign")
async def detect_sign(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename)[1] or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        image = cv2.imread(tmp_path)
        if image is None:
            return {"letter": None, "error": "Could not read image"}

        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

        result = landmarker.detect(mp_image)

        if not result.hand_landmarks:
            return {"letter": None, "error": "No hand detected"}

        landmarks = result.hand_landmarks[0]
        handedness = get_handedness(result)

        letter = classify_letter(landmarks, handedness)
        fingers_up = get_fingers_up(landmarks, handedness)

        return {
            "letter": letter,
            "debug": {
                "handedness": handedness,
                "fingers_up": fingers_up,
                "thumb_open": is_thumb_open(landmarks, handedness),
                "c_shape": is_c_shape(landmarks),
            },
        }

    except Exception as e:
        return {"letter": None, "error": str(e)}

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


def classify_letter(landmarks, handedness):
    fingers_up = get_fingers_up(landmarks, handedness)

    print("handedness:", handedness, "fingers_up:", fingers_up)

    if is_a_shape(landmarks, handedness, fingers_up):
        return "A"

    if is_b_shape(landmarks, handedness, fingers_up):
        return "B"

    if is_c_shape(landmarks):
        return "C"

    if is_d_shape(landmarks, handedness, fingers_up):
        return "D"

    if is_e_shape(landmarks, handedness, fingers_up):
        return "E"

    return None


def get_fingers_up(landmarks, handedness):
    return [
        1 if is_thumb_open(landmarks, handedness) else 0,
        1 if is_finger_extended(landmarks, 8, 6) else 0,
        1 if is_finger_extended(landmarks, 12, 10) else 0,
        1 if is_finger_extended(landmarks, 16, 14) else 0,
        1 if is_finger_extended(landmarks, 20, 18) else 0,
    ]


def is_finger_extended(landmarks, tip_id, pip_id):
    tip = landmarks[tip_id]
    pip = landmarks[pip_id]
    return tip.y < pip.y


def is_thumb_open(landmarks, handedness):
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    index_mcp = landmarks[5]
    palm_center = landmarks[9]

    thumb_spread = abs(thumb_tip.x - index_mcp.x)
    joint_spread = abs(thumb_ip.x - index_mcp.x)
    thumb_tip_to_palm = distance_2d(thumb_tip, palm_center)

    return thumb_spread > joint_spread and thumb_tip_to_palm > 0.12


def is_a_shape(landmarks, handedness, fingers_up):
    return fingers_up == [1, 0, 0, 0, 0] and is_compact_fist(landmarks)


def is_b_shape(landmarks, handedness, fingers_up):
    if fingers_up != [0, 1, 1, 1, 1]:
        return False

    thumb_tip = landmarks[4]
    index_mcp = landmarks[5]
    palm_center = landmarks[9]

    thumb_to_index_base = distance_2d(thumb_tip, index_mcp)
    thumb_to_palm = distance_2d(thumb_tip, palm_center)

    fingertip_ys = [
        landmarks[8].y,
        landmarks[12].y,
        landmarks[16].y,
        landmarks[20].y,
    ]
    aligned = (max(fingertip_ys) - min(fingertip_ys)) < 0.12

    return thumb_to_index_base < 0.18 and thumb_to_palm < 0.22 and aligned


def is_c_shape(landmarks):
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    pinky_tip = landmarks[20]

    thumb_index_dist = distance_2d(thumb_tip, index_tip)
    thumb_middle_dist = distance_2d(thumb_tip, middle_tip)
    thumb_pinky_dist = distance_2d(thumb_tip, pinky_tip)

    index_curved = landmarks[8].y > landmarks[6].y - 0.02
    middle_curved = landmarks[12].y > landmarks[10].y - 0.02

    return (
        0.10 < thumb_index_dist < 0.30
        and 0.12 < thumb_middle_dist < 0.32
        and 0.18 < thumb_pinky_dist < 0.45
        and index_curved
        and middle_curved
    )


def is_d_shape(landmarks, handedness, fingers_up):
    if fingers_up != [0, 1, 0, 0, 0]:
        return False

    thumb_tip = landmarks[4]
    middle_mcp = landmarks[9]

    return distance_2d(thumb_tip, middle_mcp) < 0.20


def is_e_shape(landmarks, handedness, fingers_up):
    if fingers_up != [0, 0, 0, 0, 0]:
        return False

    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    palm_center = landmarks[9]

    curled = (
        distance_2d(index_tip, palm_center) < 0.20
        and distance_2d(middle_tip, palm_center) < 0.20
    )
    thumb_tucked = distance_2d(thumb_tip, palm_center) < 0.18

    return curled and thumb_tucked


def is_compact_fist(landmarks):
    palm_center = landmarks[9]
    fingertip_ids = [8, 12, 16, 20]

    dists = [distance_2d(landmarks[i], palm_center) for i in fingertip_ids]
    return max(dists) < 0.24


def distance_2d(p1, p2):
    return float(np.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2))