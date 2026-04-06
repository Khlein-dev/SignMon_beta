from collections import deque
from typing import Deque, Dict, Any, List, Optional, Tuple


class HNDetector:
    def __init__(self, history_len: int = 12):
        self.pinky_history: Deque[Tuple[float, float]] = deque(maxlen=history_len)

    # -------------------------
    # Safe helpers
    # -------------------------
    def _get(self, obj: Any, key: Any, default: Any = None) -> Any:
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    def _num(self, value: Any, default: float = 0.0) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    def _landmark(self, f: Dict[str, Any], index: int):
        landmarks = self._get(f, "landmarks", []) or []
        if not isinstance(landmarks, list) or index >= len(landmarks):
            return None
        return landmarks[index]

    def _landmark_x(self, f: Dict[str, Any], index: int, default: float = 0.0) -> float:
        lm = self._landmark(f, index)
        if lm is None:
            return default
        return self._num(self._get(lm, "x", default), default)

    def _landmark_y(self, f: Dict[str, Any], index: int, default: float = 0.0) -> float:
        lm = self._landmark(f, index)
        if lm is None:
            return default
        return self._num(self._get(lm, "y", default), default)

    def _finger_state(self, f: Dict[str, Any], finger: str) -> Dict[str, Any]:
        finger_states = self._get(f, "finger_states", {}) or {}
        return finger_states.get(finger, {}) if isinstance(finger_states, dict) else {}

    # -------------------------
    # Basic helpers
    # -------------------------
    def _avg(self, values: List[float]) -> float:
        vals = [self._num(v) for v in values]
        return sum(vals) / len(vals) if vals else 0.0

    def _yes(self, cond: bool, weight: float = 1.0) -> float:
        return float(weight) if cond else 0.0

    def _clamp(self, x: float, lo: float = 0.0, hi: float = 1.0) -> float:
        return max(lo, min(hi, self._num(x)))

    def _soft_range(
        self,
        value: float,
        good_min: float,
        good_max: float,
        soft_min: Optional[float] = None,
        soft_max: Optional[float] = None,
    ) -> float:
        value = self._num(value)

        if soft_min is None:
            soft_min = good_min
        if soft_max is None:
            soft_max = good_max

        if good_min <= value <= good_max:
            return 1.0

        if value < soft_min or value > soft_max:
            return 0.0

        if value < good_min:
            return self._clamp((value - soft_min) / ((good_min - soft_min) + 1e-9))

        return self._clamp((soft_max - value) / ((soft_max - good_max) + 1e-9))

    def _score(self, positive, negative=None, negative_weight=0.85):
        pos = self._avg(positive)
        neg = self._avg(negative) if negative else 0.0
        return self._clamp(pos - negative_weight * neg)

    # -------------------------
    # Finger helpers
    # -------------------------
    def _is_extended(self, f, finger):
        return bool(self._finger_state(f, finger).get("extended", False))

    def _is_curled(self, f, finger):
        return bool(self._finger_state(f, finger).get("curled", False))

    def _count_extended(self, f):
        return sum(
            int(self._is_extended(f, finger))
            for finger in ("index", "middle", "ring", "pinky")
        )

    def _count_curled(self, f):
        return sum(
            int(self._is_curled(f, finger))
            for finger in ("index", "middle", "ring", "pinky")
        )

    def _thumb_open(self, f) -> bool:
        return bool(self._get(f, "thumb_open", False))

    def _compact_fist(self, f) -> bool:
        return bool(self._get(f, "compact_fist", False))

    def _two_fingers_only_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ])

    def _only_index_up_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _only_pinky_up_score(self, f):
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ])

    def _closed_hand_score(self, f):
        return self._avg([
            self._yes(self._count_curled(f) >= 3),
            self._yes(self._count_extended(f) == 0),
            self._yes(self._compact_fist(f)),
            self._yes(not self._thumb_open(f)),
        ])

    # -------------------------
    # Distance / shape helpers
    # -------------------------
    def _pinch_index_thumb(self, f) -> float:
        return self._num(self._get(f, "pinch_index_thumb", 0.0))

    def _pinch_middle_thumb(self, f) -> float:
        return self._num(self._get(f, "pinch_middle_thumb", 0.0))

    def _pinch_pinky_thumb(self, f) -> float:
        return self._num(self._get(f, "pinch_pinky_thumb", 0.0))

    def _index_middle_tip_gap_x(self, f) -> float:
        # tip landmarks: 8=index tip, 12=middle tip
        return abs(self._landmark_x(f, 8) - self._landmark_x(f, 12))

    def _index_middle_tip_gap_y(self, f) -> float:
        return abs(self._landmark_y(f, 8) - self._landmark_y(f, 12))

    def _index_middle_v_shape_score(self, f) -> float:
        gap_x = self._index_middle_tip_gap_x(f)
        gap_y = self._index_middle_tip_gap_y(f)

        return self._avg([
            self._soft_range(gap_x, 0.04, 0.18, 0.02, 0.24),
            self._soft_range(gap_y, 0.00, 0.10, 0.00, 0.16),
        ])

    def _thumb_closer_to_middle_than_index_score(self, f) -> float:
        d_middle = self._pinch_middle_thumb(f)
        d_index = self._pinch_index_thumb(f)

        return self._avg([
            self._yes(d_middle < d_index, 1.2),
            self._soft_range(d_middle, 0.00, 0.52, 0.00, 0.65),
            self._soft_range(d_index, 0.28, 1.20, 0.18, 1.35),
        ])

    # -------------------------
    # Motion helpers for J
    # -------------------------
    def update_motion(self, f):
        pinky_tip = self._landmark(f, 20)
        if pinky_tip is None:
            return

        x = self._num(self._get(pinky_tip, "x", 0.0))
        y = self._num(self._get(pinky_tip, "y", 0.0))
        self.pinky_history.append((x, y))

    def reset_motion(self):
        self.pinky_history.clear()

    def _j_motion_score(self):
        pts = list(self.pinky_history)
        if len(pts) < 6:
            return 0.0

        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]

        dx = xs[-1] - xs[0]
        dy = ys[-1] - ys[0]

        width = max(xs) - min(xs)
        height = max(ys) - min(ys)

        mid = len(pts) // 2
        first_half_dy = ys[mid] - ys[0]
        second_half_dx = xs[-1] - xs[mid]

        downward_first = first_half_dy > 0.03
        curve_side = abs(second_half_dx) > 0.03
        enough_height = height > 0.05
        enough_width = width > 0.03

        shape_score = self._avg([
            self._yes(downward_first, 1.2),
            self._yes(curve_side, 1.2),
            self._yes(enough_height, 1.0),
            self._yes(enough_width, 0.9),
            self._soft_range(abs(dy), 0.05, 0.30, 0.03, 0.40),
            self._soft_range(abs(dx), 0.03, 0.22, 0.02, 0.30),
        ])
        return self._clamp(shape_score)

    # -------------------------
    # Letter scores
    # -------------------------
    def score_h(self, f):
        positive = [
            self._two_fingers_only_score(f),
            self._yes(self._thumb_open(f)),
            self._soft_range(self._pinch_middle_thumb(f), 0.68, 1.40, 0.58, 1.60),
            self._soft_range(self._pinch_index_thumb(f), 0.30, 1.20, 0.18, 1.40),
            self._soft_range(self._index_middle_tip_gap_x(f), 0.00, 0.08, 0.00, 0.12),
        ]

        negative = [
            self._yes(not self._thumb_open(f)),
            self._yes(self._pinch_middle_thumb(f) < 0.60),
            self._yes(self._count_extended(f) < 2),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(self._index_middle_tip_gap_x(f) > 0.12, 0.9),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_i(self, f):
        positive = [
            self._only_pinky_up_score(f),
            self._yes(self._is_curled(f, "index")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(not self._thumb_open(f), 0.7),
        ]

        negative = [
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_j(self, f):
        """
        J = I handshape + motion path of the pinky tip.
        """
        i_shape = self._only_pinky_up_score(f)
        motion = self._j_motion_score()

        positive = [
            i_shape,
            self._yes(self._is_curled(f, "index")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(not self._thumb_open(f), 0.6),
            motion,
        ]

        negative = [
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(motion < 0.35, 1.2),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_k(self, f):
        """
        K should look like:
        - index up
        - middle up
        - ring/pinky closed
        - thumb open
        - thumb near middle finger
        - index and middle slightly split (not too flat together like H)
        """
        thumb_open = self._thumb_open(f)
        pinch_middle = self._pinch_middle_thumb(f)
        pinch_index = self._pinch_index_thumb(f)
        gap_x = self._index_middle_tip_gap_x(f)

        positive = [
            self._two_fingers_only_score(f),
            self._yes(thumb_open, 1.35),
            self._thumb_closer_to_middle_than_index_score(f),
            self._index_middle_v_shape_score(f),
            self._soft_range(pinch_middle, 0.00, 0.52, 0.00, 0.65),
            self._soft_range(pinch_index, 0.30, 1.20, 0.18, 1.35),
            self._yes(self._is_extended(f, "index"), 1.1),
            self._yes(self._is_extended(f, "middle"), 1.1),
            self._yes(not self._is_extended(f, "ring"), 1.0),
            self._yes(not self._is_extended(f, "pinky"), 1.0),
            self._yes(self._is_curled(f, "ring"), 1.0),
            self._yes(self._is_curled(f, "pinky"), 1.0),
            self._yes(gap_x > 0.04, 0.95),
        ]

        negative = [
            self._yes(not thumb_open, 1.5),
            self._yes(pinch_middle > 0.62, 1.35),   # too far from middle -> more like H
            self._yes(pinch_index < 0.22, 0.95),
            self._yes(self._count_extended(f) < 2, 1.25),
            self._yes(self._count_extended(f) > 2, 1.15),
            self._yes(self._is_extended(f, "ring"), 1.15),
            self._yes(self._is_extended(f, "pinky"), 1.15),
            self._yes(gap_x < 0.03, 1.05),          # too close together -> more like H
            self._yes(pinch_middle >= pinch_index, 1.2),  # thumb should be closer to middle
        ]

        return self._score(positive, negative, negative_weight=1.02)

    def score_l(self, f):
        positive = [
            self._only_index_up_score(f),
            self._yes(self._thumb_open(f)),
            self._soft_range(self._pinch_index_thumb(f), 0.90, 2.00, 0.72, 2.30),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(not self._thumb_open(f)),
            self._yes(not self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(self._pinch_index_thumb(f) < 0.70),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_m(self, f):
        positive = [
            self._closed_hand_score(f),
            self._yes(self._is_curled(f, "index")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
            self._soft_range(self._pinch_pinky_thumb(f), 0.00, 0.72, 0.00, 0.82),
        ]

        negative = [
            self._yes(self._thumb_open(f)),
            self._yes(not self._compact_fist(f)),
            self._yes(self._count_extended(f) >= 1),
            self._yes(self._pinch_pinky_thumb(f) > 0.82),
        ]

        return self._score(positive, negative, negative_weight=0.92)

    def score_n(self, f):
        positive = [
            self._closed_hand_score(f),
            self._soft_range(self._pinch_pinky_thumb(f), 0.72, 1.15, 0.62, 1.30),
            self._yes(self._count_curled(f) >= 3),
        ]

        negative = [
            self._yes(self._thumb_open(f)),
            self._yes(self._count_extended(f) >= 1),
            self._yes(self._pinch_pinky_thumb(f) < 0.62),
        ]

        return self._score(positive, negative, negative_weight=0.88)

    # -------------------------
    # Public API
    # -------------------------
    def get_scores(self, f):
        return {
            "H": self.score_h(f),
            "I": self.score_i(f),
            "J": self.score_j(f),
            "K": self.score_k(f),
            "L": self.score_l(f),
            "M": self.score_m(f),
            "N": self.score_n(f),
        }

    def predict(self, f, min_score=0.45, min_margin=0.10):
        self.update_motion(f)

        scores = self.get_scores(f)
        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)

        if not ranked:
            return None, 0.0, scores

        best_label, best_score = ranked[0]
        second_score = ranked[1][1] if len(ranked) > 1 else 0.0

        if best_score < min_score:
            return None, best_score, scores

        if best_score - second_score < min_margin:
            return None, best_score, scores

        return best_label, best_score, scores