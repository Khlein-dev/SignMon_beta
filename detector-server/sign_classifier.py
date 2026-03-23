import importlib.util
import os
import numpy as np


def load_detector_class(filename, class_name):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, filename)

    spec = importlib.util.spec_from_file_location(class_name, file_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, class_name)


AGDetector = load_detector_class("A-G.py", "AGDetector")
HNDetector = load_detector_class("H-N.py", "HNDetector")
NSTildeSDetector = load_detector_class("Ñ-S.py", "NSTildeSDetector")
TZDetector = load_detector_class("T-Z.py", "TZDetector")


class SignClassifier:
    def __init__(self):
        self.ag_detector = AGDetector()
        self.hn_detector = HNDetector()
        self.ns_detector = NSTildeSDetector()
        self.tz_detector = TZDetector()

    def classify(self, landmarks, handedness="Unknown"):
        features = self.extract_features(landmarks, handedness)
        label, meta = self.classify_sign(features)
        return label, features, meta

    @staticmethod
    def distance_2d(p1, p2):
        return float(np.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2))

    @staticmethod
    def vec(a, b):
        return np.array([b.x - a.x, b.y - a.y], dtype=np.float32)

    def angle_3pts(self, a, b, c):
        ba = self.vec(b, a)
        bc = self.vec(b, c)

        nba = np.linalg.norm(ba)
        nbc = np.linalg.norm(bc)
        if nba == 0 or nbc == 0:
            return 180.0

        cosang = np.dot(ba, bc) / (nba * nbc)
        cosang = np.clip(cosang, -1.0, 1.0)
        return float(np.degrees(np.arccos(cosang)))

    @staticmethod
    def safe_ratio(a, b):
        return a / b if b > 1e-6 else 0.0

    def extract_features(self, landmarks, handedness):
        wrist = landmarks[0]
        index_mcp = landmarks[5]
        middle_mcp = landmarks[9]
        pinky_mcp = landmarks[17]

        palm_size = (
            self.distance_2d(wrist, middle_mcp)
            + self.distance_2d(index_mcp, pinky_mcp)
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

            straightness = self.angle_3pts(pip, dip, tip)
            curl_angle = self.angle_3pts(mcp, pip, dip)
            tip_to_mcp = self.safe_ratio(self.distance_2d(tip, mcp), palm_size)
            tip_to_palm = self.safe_ratio(self.distance_2d(tip, middle_mcp), palm_size)

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

        thumb_open = self.is_thumb_open_robust(landmarks, handedness, palm_size)

        return {
            "landmarks": landmarks,
            "handedness": handedness,
            "palm_size": palm_size,
            "thumb_open": thumb_open,
            "finger_states": finger_states,
            "fingers_up": [1 if thumb_open else 0] + finger_up,
            "compact_fist": self.is_compact_fist(landmarks, palm_size),
            "flat_palm": self.is_flat_palm(landmarks),
            "c_shape": self.is_c_shape_robust(landmarks, palm_size),
            "pinch_index_thumb": self.pinch_ratio(landmarks[4], landmarks[8], palm_size),
            "pinch_middle_thumb": self.pinch_ratio(landmarks[4], landmarks[12], palm_size),
            "pinch_ring_thumb": self.pinch_ratio(landmarks[4], landmarks[16], palm_size),
            "pinch_pinky_thumb": self.pinch_ratio(landmarks[4], landmarks[20], palm_size),
        }

    def pinch_ratio(self, p1, p2, palm_size):
        return self.safe_ratio(self.distance_2d(p1, p2), palm_size)

    def is_thumb_open_robust(self, landmarks, handedness, palm_size):
        thumb_mcp = landmarks[2]
        thumb_ip = landmarks[3]
        thumb_tip = landmarks[4]
        index_mcp = landmarks[5]
        palm_center = landmarks[9]

        thumb_reach = self.safe_ratio(self.distance_2d(thumb_tip, palm_center), palm_size)
        thumb_span = self.safe_ratio(self.distance_2d(thumb_tip, index_mcp), palm_size)
        thumb_angle = self.angle_3pts(thumb_mcp, thumb_ip, thumb_tip)

        return thumb_reach > 0.65 and thumb_span > 0.45 and thumb_angle > 145

    def is_compact_fist(self, landmarks, palm_size):
        palm_center = landmarks[9]
        fingertip_ids = [8, 12, 16, 20]
        dists = [
            self.safe_ratio(self.distance_2d(landmarks[i], palm_center), palm_size)
            for i in fingertip_ids
        ]
        return max(dists) < 0.72

    @staticmethod
    def is_flat_palm(landmarks):
        ys = [landmarks[8].y, landmarks[12].y, landmarks[16].y, landmarks[20].y]
        return (max(ys) - min(ys)) < 0.10

    def is_c_shape_robust(self, landmarks, palm_size):
        thumb_tip = landmarks[4]
        index_tip = landmarks[8]
        middle_tip = landmarks[12]
        pinky_tip = landmarks[20]

        di = self.safe_ratio(self.distance_2d(thumb_tip, index_tip), palm_size)
        dm = self.safe_ratio(self.distance_2d(thumb_tip, middle_tip), palm_size)
        dp = self.safe_ratio(self.distance_2d(thumb_tip, pinky_tip), palm_size)

        index_curved = self.angle_3pts(landmarks[6], landmarks[7], landmarks[8]) < 165
        middle_curved = self.angle_3pts(landmarks[10], landmarks[11], landmarks[12]) < 165

        return (
            0.45 < di < 1.25
            and 0.55 < dm < 1.45
            and 0.85 < dp < 2.0
            and index_curved
            and middle_curved
        )

    def classify_sign(self, f):
        scores = {}
        scores.update(self.ag_detector.get_scores(f))
        scores.update(self.hn_detector.get_scores(f))
        scores.update(self.ns_detector.get_scores(f))
        scores.update(self.tz_detector.get_scores(f))

        best_label = max(scores, key=scores.get)
        best_score = scores[best_label]

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        second_label, second_score = ranked[1]

        if best_score < 0.72:
            return None, {
                "scores": scores,
                "note": "Low confidence heuristic match. J and Z need motion.",
            }

        if (best_score - second_score) < 0.08:
            return None, {
                "scores": scores,
                "note": f"Ambiguous between {best_label} and {second_label}.",
            }

        return best_label, {"scores": scores, "note": None}