class NSTildeSDetector:
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

    def _score(self, positive, negative=None, negative_weight=0.8):
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

    def _two_fingers_only_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _index_only_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _all_closed_score(self, f):
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    # -------------------------
    # Shape helpers
    # -------------------------
    def _crossed_like_score(self, f):
        dx = abs(f["landmarks"][8].x - f["landmarks"][12].x)
        return self._soft_range(dx, 0.00, 0.04, 0.00, 0.08)

    def _v_spread_score(self, f):
        dx = abs(f["landmarks"][8].x - f["landmarks"][12].x)
        return self._soft_range(dx, 0.08, 0.30, 0.05, 0.38)

    def _downward_index_score(self, f):
        # Higher score when index tip is below its PIP joint in image coordinates
        tip_y = f["landmarks"][8].y
        pip_y = f["landmarks"][6].y
        diff = tip_y - pip_y
        return self._soft_range(diff, 0.03, 0.40, 0.00, 0.50)

    def _thumb_tucked_inside_score(self, f):
        return self._avg([
            self._yes(not f["thumb_open"]),
            self._soft_range(f["pinch_index_thumb"], 0.30, 0.90, 0.20, 1.10),
            self._yes(f["compact_fist"]),
        ])

    # -------------------------
    # Ñ, O, P, Q, R, S
    # -------------------------
    def score_enye(self, f):
        """
        Placeholder until you define a real static distinction for Ñ.
        """
        return 0.0

    def score_o(self, f):
        """
        O:
        fingers curled toward the thumb, making a closed round shape
        """
        positive = [
            self._yes(not f["thumb_open"]),
            self._yes(self._count_curled(f) >= 3),
            self._soft_range(f["pinch_index_thumb"], 0.00, 0.20, 0.00, 0.30),
            self._soft_range(f["pinch_middle_thumb"], 0.00, 0.32, 0.00, 0.45),
            self._yes(not f["c_shape"]),
            self._yes(self._count_extended(f) <= 1),
        ]

        negative = [
            self._yes(f["c_shape"], 1.0),          # more like C
            self._yes(f["thumb_open"], 0.9),
            self._yes(f["pinch_index_thumb"] > 0.34, 1.0),
            self._yes(self._count_extended(f) >= 2, 0.8),
            self._yes(not f["compact_fist"], 0.4),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_p(self, f):
        """
        P:
        like V, index and middle extended widely, rest closed
        """
        positive = [
            self._two_fingers_only_score(f),
            self._v_spread_score(f),
            self._yes(self._count_extended(f) == 2),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(abs(f["landmarks"][8].x - f["landmarks"][12].x) < 0.05, 0.9),  # too close, more like R
            self._yes(f["compact_fist"], 0.3),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_q(self, f):
        """
        Q:
        palm not showing, index pointing downward, other fingers closed
        """
        positive = [
            self._index_only_score(f),
            self._downward_index_score(f),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
            self._yes(self._count_extended(f) == 1),
        ]

        negative = [
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(f["thumb_open"] and f["pinch_index_thumb"] > 0.45, 0.8),  # can drift to G/L-like
            self._yes((f["landmarks"][8].y - f["landmarks"][6].y) < 0.01, 1.0),  # not downward enough
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_r(self, f):
        """
        R:
        index and middle extended together and crossed, other fingers down
        """
        positive = [
            self._two_fingers_only_score(f),
            self._crossed_like_score(f),
            self._yes(self._count_extended(f) == 2),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(abs(f["landmarks"][8].x - f["landmarks"][12].x) > 0.09, 1.0),  # too wide, more like P
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_s(self, f):
        """
        S:
        all fingers closed, thumb tucked inside the middle
        """
        positive = [
            self._all_closed_score(f),
            self._yes(self._count_extended(f) == 0),
            self._yes(self._count_curled(f) >= 3),
            self._thumb_tucked_inside_score(f),
            self._soft_range(f["pinch_index_thumb"], 0.45, 1.10, 0.30, 1.30),
        ]

        negative = [
            self._yes(not f["compact_fist"]),
            self._yes(f["thumb_open"], 1.0),
            self._yes(f["pinch_index_thumb"] < 0.25, 0.9),
            self._yes(self._count_extended(f) >= 1, 1.0),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def get_scores(self, f):
        return {
            "Ñ": self.score_enye(f),
            "O": self.score_o(f),
            "P": self.score_p(f),
            "Q": self.score_q(f),
            "R": self.score_r(f),
            "S": self.score_s(f),
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