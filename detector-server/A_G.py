from typing import Any, Dict, List, Optional, Tuple


class AGDetector:
    # -------------------------
    # Safe access helpers
    # -------------------------
    def _get(self, obj: Any, key: Any, default: Any = None) -> Any:
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    def _finger_state(self, f: Dict[str, Any], finger: str) -> Dict[str, Any]:
        finger_states = self._get(f, "finger_states", {}) or {}
        return finger_states.get(finger, {}) if isinstance(finger_states, dict) else {}

    def _landmark_y(self, f: Dict[str, Any], index: int, default: float = 0.0) -> float:
        landmarks = self._get(f, "landmarks", []) or []
        if not isinstance(landmarks, list) or index >= len(landmarks):
            return default
        lm = landmarks[index]
        y = self._get(lm, "y", default)
        try:
            return float(y)
        except (TypeError, ValueError):
            return default

    def _num(self, value: Any, default: float = 0.0) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    # -------------------------
    # Basic helpers
    # -------------------------
    def _avg(self, values: List[float]) -> float:
        valid = [self._num(v) for v in values]
        return sum(valid) / len(valid) if valid else 0.0

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
        """
        Full score in [good_min, good_max].
        Partial score inside soft range.
        """
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
            denom = (good_min - soft_min) + 1e-9
            return self._clamp((value - soft_min) / denom)

        denom = (soft_max - good_max) + 1e-9
        return self._clamp((soft_max - value) / denom)

    def _score(
        self,
        positive: List[float],
        negative: Optional[List[float]] = None,
        negative_weight: float = 0.8,
    ) -> float:
        pos = self._avg(positive)
        neg = self._avg(negative) if negative else 0.0
        return self._clamp(pos - negative_weight * neg)

    # -------------------------
    # Finger state helpers
    # -------------------------
    def _is_extended(self, f: Dict[str, Any], finger: str) -> bool:
        return bool(self._finger_state(f, finger).get("extended", False))

    def _is_curled(self, f: Dict[str, Any], finger: str) -> bool:
        return bool(self._finger_state(f, finger).get("curled", False))

    def _count_extended(self, f: Dict[str, Any]) -> int:
        return sum(
            int(self._is_extended(f, finger))
            for finger in ("index", "middle", "ring", "pinky")
        )

    def _count_curled(self, f: Dict[str, Any]) -> int:
        return sum(
            int(self._is_curled(f, finger))
            for finger in ("index", "middle", "ring", "pinky")
        )

    def _all_four_closed(self, f: Dict[str, Any]) -> bool:
        return (
            not self._is_extended(f, "index")
            and not self._is_extended(f, "middle")
            and not self._is_extended(f, "ring")
            and not self._is_extended(f, "pinky")
        )

    def _all_four_up(self, f: Dict[str, Any]) -> bool:
        return (
            self._is_extended(f, "index")
            and self._is_extended(f, "middle")
            and self._is_extended(f, "ring")
            and self._is_extended(f, "pinky")
        )

    def _only_index_up(self, f: Dict[str, Any]) -> bool:
        return (
            self._is_extended(f, "index")
            and not self._is_extended(f, "middle")
            and not self._is_extended(f, "ring")
            and not self._is_extended(f, "pinky")
        )

    def _none_extended_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _only_index_up_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _three_folded_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ])

    # -------------------------
    # Distance helpers
    # -------------------------
    def _thumb_index_gap(self, f: Dict[str, Any]) -> float:
        return self._num(self._get(f, "pinch_index_thumb", 0.0))

    def _thumb_middle_gap(self, f: Dict[str, Any]) -> float:
        return self._num(self._get(f, "pinch_middle_thumb", 0.0))

    def _tip_y_spread(self, f: Dict[str, Any]) -> float:
        ys = [
            self._landmark_y(f, 8),
            self._landmark_y(f, 12),
            self._landmark_y(f, 16),
            self._landmark_y(f, 20),
        ]
        return max(ys) - min(ys)

    # -------------------------
    # Shape helpers
    # -------------------------
    def _four_fingers_closed_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._count_curled(f) >= 2),
        ])

    def _four_fingers_up_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ])

    def _curled_hand_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(self._count_curled(f) >= 3),
            self._yes(not self._all_four_up(f)),
            self._yes(not bool(self._get(f, "compact_fist", False)), 0.7),
        ])

    def _rounded_c_shape_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(bool(self._get(f, "c_shape", False))),
            self._soft_range(self._thumb_index_gap(f), 0.35, 0.90, 0.25, 1.10),
            self._yes(not bool(self._get(f, "compact_fist", False))),
            self._yes(not self._all_four_up(f)),
        ])

    def _compact_inward_score(self, f: Dict[str, Any]) -> float:
        return self._avg([
            self._yes(self._count_curled(f) >= 3),
            self._yes(not bool(self._get(f, "thumb_open", False))),
            self._soft_range(self._thumb_index_gap(f), 0.00, 0.12, 0.00, 0.18),
            self._yes(self._count_extended(f) == 0),
            self._yes(bool(self._get(f, "compact_fist", False)), 0.9),
        ])

    def _deep_curl_score(self, f: Dict[str, Any]) -> float:
        """
        Strong curl check for E:
        all four fingers should be curled inward.
        """
        return self._avg([
            self._yes(self._is_curled(f, "index"), 1.25),
            self._yes(self._is_curled(f, "middle"), 1.2),
            self._yes(self._is_curled(f, "ring"), 1.2),
            self._yes(self._is_curled(f, "pinky"), 1.2),
            self._yes(self._count_curled(f) == 4, 1.35),
        ])

    def _a_thumb_exposed_score(self, f: Dict[str, Any]) -> float:
        """
        A = thumb clearly exposed/open.
        """
        gap = self._thumb_index_gap(f)
        return self._avg([
            self._yes(bool(self._get(f, "thumb_open", False)), 1.7),
            self._soft_range(gap, 0.20, 0.95, 0.14, 1.10),
        ])

    def _a_fist_shape_score(self, f: Dict[str, Any]) -> float:
        """
        A = closed fist, but not deep E-like curl.
        """
        curled = self._count_curled(f)
        return self._avg([
            self._yes(self._count_extended(f) == 0, 1.3),
            self._yes(not self._is_extended(f, "index"), 1.0),
            self._yes(not self._is_extended(f, "middle"), 1.0),
            self._yes(not self._is_extended(f, "ring"), 1.0),
            self._yes(not self._is_extended(f, "pinky"), 1.0),
            self._yes(curled >= 1, 0.7),
            self._yes(curled <= 3, 1.1),
            self._yes(bool(self._get(f, "compact_fist", False)), 1.25),
        ])

    def _e_thumb_tucked_score(self, f: Dict[str, Any]) -> float:
        """
        E = thumb tucked, not exposed.
        """
        gap = self._thumb_index_gap(f)
        return self._avg([
            self._yes(not bool(self._get(f, "thumb_open", False)), 1.55),
            self._soft_range(gap, 0.00, 0.10, 0.00, 0.16),
        ])

    # -------------------------
    # Letter scores
    # -------------------------
    def score_a(self, f: Dict[str, Any]) -> float:
        """
        A = fingers closed, thumb exposed/open
        """
        gap = self._thumb_index_gap(f)
        thumb_open = bool(self._get(f, "thumb_open", False))
        compact_fist = bool(self._get(f, "compact_fist", False))
        c_shape = bool(self._get(f, "c_shape", False))
        curled = self._count_curled(f)

        positive = [
            self._a_fist_shape_score(f),
            self._a_thumb_exposed_score(f),
            self._four_fingers_closed_score(f),
            self._yes(self._all_four_closed(f), 1.25),
            self._yes(compact_fist, 1.2),
            self._yes(thumb_open, 1.7),
            self._soft_range(gap, 0.20, 0.95, 0.14, 1.10),
            self._yes(curled <= 3, 1.0),
            self._yes(not self._is_curled(f, "index"), 0.9),
        ]

        negative = [
            self._yes(self._all_four_up(f), 1.5),
            self._yes(self._count_extended(f) >= 1, 1.35),
            self._yes(not thumb_open, 2.0),
            self._yes(gap < 0.14, 1.95),
            self._yes(gap < 0.10, 2.1),
            self._yes(c_shape, 0.95),
            self._yes(curled == 4, 1.7),
            self._yes(self._is_curled(f, "index"), 1.35),
            self._yes(not compact_fist, 0.9),
        ]

        return self._score(positive, negative, negative_weight=1.05)

    def score_b(self, f: Dict[str, Any]) -> float:
        """
        B = four fingers up, thumb in
        """
        positive = [
            self._four_fingers_up_score(f),
            self._yes(not bool(self._get(f, "thumb_open", False))),
            self._soft_range(self._tip_y_spread(f), 0.0, 0.12, 0.0, 0.20),
        ]

        negative = [
            self._yes(bool(self._get(f, "thumb_open", False))),
            self._yes(self._count_curled(f) >= 2),
            self._yes(self._count_extended(f) < 3),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_c(self, f: Dict[str, Any]) -> float:
        """
        C = fingers curled
        """
        positive = [
            self._rounded_c_shape_score(f),
            self._curled_hand_score(f),
            self._yes(self._thumb_index_gap(f) > 0.30),
        ]

        negative = [
            self._yes(bool(self._get(f, "compact_fist", False))),
            self._yes(self._thumb_index_gap(f) < 0.22),
            self._yes(self._all_four_up(f)),
            self._yes(
                bool(self._get(f, "thumb_open", False))
                and self._count_curled(f) >= 3
                and self._thumb_index_gap(f) < 0.28,
                0.9,
            ),
        ]

        return self._score(positive, negative, negative_weight=0.90)

    def score_d(self, f: Dict[str, Any]) -> float:
        """
        D = index up, the rest closed
        """
        positive = [
            self._only_index_up_score(f),
            self._three_folded_score(f),
            self._yes(self._count_extended(f) == 1),
            self._yes(not self._is_curled(f, "index"), 0.7),
        ]

        negative = [
            self._yes(self._count_extended(f) == 0),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "index"), 0.8),
            self._yes(not self._is_extended(f, "index")),
        ]

        return self._score(positive, negative, negative_weight=1.05)

    def score_e(self, f: Dict[str, Any]) -> float:
        """
        E = all fingers curled inward, thumb tucked/not exposed
        """
        gap = self._thumb_index_gap(f)
        thumb_open = bool(self._get(f, "thumb_open", False))
        curled = self._count_curled(f)
        compact_fist = bool(self._get(f, "compact_fist", False))

        positive = [
            self._compact_inward_score(f),
            self._none_extended_score(f),
            self._deep_curl_score(f),
            self._e_thumb_tucked_score(f),
            self._yes(curled == 4, 1.45),
            self._yes(curled >= 3, 1.1),
            self._soft_range(gap, 0.00, 0.10, 0.00, 0.16),
            self._yes(not thumb_open, 1.55),
            self._yes(self._is_curled(f, "index"), 1.3),
            self._yes(compact_fist, 1.0),
        ]

        negative = [
            self._yes(self._is_extended(f, "index"), 1.25),
            self._yes(self._count_extended(f) >= 1, 1.2),
            self._yes(thumb_open, 2.0),
            self._yes(gap > 0.16, 1.5),
            self._yes(gap > 0.22, 1.7),
            self._yes(bool(self._get(f, "c_shape", False)), 0.75),
            self._yes(not self._is_curled(f, "index"), 1.35),
            self._yes(curled < 4, 1.2),
        ]

        return self._score(positive, negative, negative_weight=1.15)

    def score_f(self, f: Dict[str, Any]) -> float:
        """
        F = index and thumb closed, middle/ring/pinky open
        """
        positive = [
            self._soft_range(self._thumb_index_gap(f), 0.00, 0.18, 0.00, 0.28),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(not self._is_extended(f, "index") or self._is_curled(f, "index")),
            self._yes(not bool(self._get(f, "thumb_open", False)), 0.7),
        ]

        negative = [
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_extended(f, "index"), 0.8),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_g(self, f: Dict[str, Any]) -> float:
        """
        G = thumb open, index open, rest closed, and no palm
        """
        gap = self._thumb_index_gap(f)

        positive = [
            self._yes(bool(self._get(f, "thumb_open", False)), 1.35),
            self._yes(self._is_extended(f, "index"), 1.35),
            self._yes(not self._is_extended(f, "middle"), 1.0),
            self._yes(not self._is_extended(f, "ring"), 1.0),
            self._yes(not self._is_extended(f, "pinky"), 1.0),
            self._yes(self._is_curled(f, "middle"), 1.0),
            self._yes(self._is_curled(f, "ring"), 1.0),
            self._yes(self._is_curled(f, "pinky"), 1.0),
            self._yes(self._count_extended(f) == 1, 1.15),
            self._soft_range(gap, 0.30, 0.95, 0.22, 1.15),
            self._yes(not bool(self._get(f, "palm_visible", False)), 1.35),
        ]

        negative = [
            self._yes(not bool(self._get(f, "thumb_open", False)), 1.45),
            self._yes(not self._is_extended(f, "index"), 1.40),
            self._yes(self._is_extended(f, "middle"), 1.10),
            self._yes(self._is_extended(f, "ring"), 1.10),
            self._yes(self._is_extended(f, "pinky"), 1.10),
            self._yes(self._count_extended(f) != 1, 1.20),
            self._yes(gap < 0.22, 1.15),
            self._yes(bool(self._get(f, "palm_visible", False)), 1.45),
        ]

        return self._score(positive, negative, negative_weight=1.05)

    # -------------------------
    # Public API
    # -------------------------
    def get_scores(self, f: Dict[str, Any]) -> Dict[str, float]:
        return {
            "A": self.score_a(f),
            "B": self.score_b(f),
            "C": self.score_c(f),
            "D": self.score_d(f),
            "E": self.score_e(f),
            "F": self.score_f(f),
            "G": self.score_g(f),
        }

    def predict(
        self,
        f: Dict[str, Any],
        min_score: float = 0.50,
        min_margin: float = 0.12,
    ) -> Tuple[Optional[str], float, Dict[str, float]]:
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