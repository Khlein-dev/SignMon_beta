class HNDetector:
    # -------------------------
    # Basic helpers
    # -------------------------
    def _avg(self, values):
        return sum(values) / len(values) if values else 0.0

    def _yes(self, cond, weight=1.0):
        return weight if cond else 0.0

    def _clamp(self, x, lo=0.0, hi=1.0):
        return max(lo, min(hi, x))

    def _soft_range(self, value, good_min, good_max, soft_min=None, soft_max=None):
        """
        Full score in [good_min, good_max].
        Partial score inside soft range.
        """
        if soft_min is None:
            soft_min = good_min
        if soft_max is None:
            soft_max = good_max

        if good_min <= value <= good_max:
            return 1.0

        if value < soft_min or value > soft_max:
            return 0.0

        if value < good_min:
            return (value - soft_min) / (good_min - soft_min + 1e-9)

        return (soft_max - value) / (soft_max - good_max + 1e-9)

    def _score(self, positive, negative=None, negative_weight=0.85):
        pos = self._avg(positive)
        neg = self._avg(negative) if negative else 0.0
        return self._clamp(pos - negative_weight * neg)

    # -------------------------
    # Finger helpers
    # -------------------------
    def _is_extended(self, f, finger):
        return f["finger_states"][finger]["extended"]

    def _is_curled(self, f, finger):
        return f["finger_states"][finger]["curled"]

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

    def _two_fingers_only(self, f):
        fs = f["finger_states"]
        return (
            fs["index"]["extended"]
            and fs["middle"]["extended"]
            and not fs["ring"]["extended"]
            and not fs["pinky"]["extended"]
        )

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
            self._yes(f["compact_fist"]),
            self._yes(not f["thumb_open"]),
        ])

    # -------------------------
    # Letter scores
    # -------------------------
    def score_h(self, f):
        # H: index + middle extended, thumb open, not close to middle finger
        positive = [
            self._two_fingers_only_score(f),
            self._yes(f["thumb_open"]),
            self._soft_range(f["pinch_middle_thumb"], 0.68, 1.40, 0.58, 1.60),
            self._soft_range(f["pinch_index_thumb"], 0.30, 1.20, 0.18, 1.40),
        ]

        negative = [
            self._yes(not f["thumb_open"]),
            self._yes(f["pinch_middle_thumb"] < 0.60),
            self._yes(self._count_extended(f) < 2),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_i(self, f):
        # I: only pinky up
        positive = [
            self._only_pinky_up_score(f),
            self._yes(self._is_curled(f, "index")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(not f["thumb_open"], 0.7),
        ]

        negative = [
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_k(self, f):
        # K: index + middle extended, thumb open, thumb nearer middle
        positive = [
            self._two_fingers_only_score(f),
            self._yes(f["thumb_open"]),
            self._soft_range(f["pinch_middle_thumb"], 0.00, 0.58, 0.00, 0.70),
            self._soft_range(f["pinch_index_thumb"], 0.42, 1.20, 0.28, 1.35),
        ]

        negative = [
            self._yes(not f["thumb_open"]),
            self._yes(f["pinch_middle_thumb"] > 0.68),
            self._yes(self._count_extended(f) < 2),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_l(self, f):
        # L: index extended + thumb open with wide separation
        positive = [
            self._only_index_up_score(f),
            self._yes(f["thumb_open"]),
            self._soft_range(f["pinch_index_thumb"], 0.90, 2.00, 0.72, 2.30),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(not f["thumb_open"]),
            self._yes(not self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(f["pinch_index_thumb"] < 0.70),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_m(self, f):
        # M: thumb tucked deeper, usually tighter closed hand
        positive = [
            self._closed_hand_score(f),
            self._yes(self._is_curled(f, "index")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
            self._soft_range(f["pinch_pinky_thumb"], 0.00, 0.72, 0.00, 0.82),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(not f["compact_fist"]),
            self._yes(self._count_extended(f) >= 1),
            self._yes(f["pinch_pinky_thumb"] > 0.82),
        ]

        return self._score(positive, negative, negative_weight=0.92)

    def score_n(self, f):
        # N: also closed, but thumb position slightly less tucked than M
        positive = [
            self._closed_hand_score(f),
            self._soft_range(f["pinch_pinky_thumb"], 0.72, 1.15, 0.62, 1.30),
            self._yes(self._count_curled(f) >= 3),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(self._count_extended(f) >= 1),
            self._yes(f["pinch_pinky_thumb"] < 0.62),
        ]

        return self._score(positive, negative, negative_weight=0.88)

    # -------------------------
    # Public API
    # -------------------------
    def get_scores(self, f):
        return {
            "H": self.score_h(f),
            "I": self.score_i(f),
            "K": self.score_k(f),
            "L": self.score_l(f),
            "M": self.score_m(f),
            "N": self.score_n(f),
        }

    def predict(self, f, min_score=0.45, min_margin=0.10):
        scores = self.get_scores(f)
        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)

        best_label, best_score = ranked[0]
        second_label, second_score = ranked[1]

        if best_score < min_score:
            return None, best_score, scores

        if best_score - second_score < min_margin:
            return None, best_score, scores

        return best_label, best_score, scores