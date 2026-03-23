class TZDetector:
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

    def _three_fingers_up_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _all_closed_score(self, f):
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _pinky_only_score(self, f):
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ])

    # -------------------------
    # Shape helpers
    # -------------------------
    def _index_middle_dx(self, f):
        return abs(f["landmarks"][8].x - f["landmarks"][12].x)

    def _close_pair_score(self, f):
        dx = self._index_middle_dx(f)
        return self._soft_range(dx, 0.00, 0.06, 0.00, 0.10)

    def _spread_pair_score(self, f):
        dx = self._index_middle_dx(f)
        return self._soft_range(dx, 0.08, 0.28, 0.05, 0.35)

    def _hooked_index_score(self, f):
        fs = f["finger_states"]
        straightness = fs["index"]["straightness"]
        tip_to_mcp = fs["index"]["tip_to_mcp"]

        return self._avg([
            self._soft_range(straightness, 70, 140, 55, 155),
            self._soft_range(tip_to_mcp, 0.58, 1.20, 0.45, 1.35),
            self._yes(not fs["index"]["extended"], 0.6),
        ])

    def _thumb_inside_t_score(self, f):
        return self._avg([
            self._yes(not f["thumb_open"]),
            self._yes(f["compact_fist"]),
            self._soft_range(f["pinch_index_thumb"], 0.00, 0.48, 0.00, 0.60),
        ])

    # -------------------------
    # T, U, V, W, X, Y, Z
    # -------------------------
    def score_t(self, f):
        """
        T:
        closed fist, thumb tucked tighter than S
        """
        positive = [
            self._all_closed_score(f),
            self._yes(f["compact_fist"]),
            self._thumb_inside_t_score(f),
            self._yes(self._count_extended(f) == 0),
            self._yes(self._count_curled(f) >= 3),
        ]

        negative = [
            self._yes(not f["compact_fist"]),
            self._yes(f["thumb_open"]),
            self._yes(f["pinch_index_thumb"] > 0.60, 1.0),  # drifts toward S
            self._yes(self._count_extended(f) >= 1),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_u(self, f):
        """
        U:
        index + middle extended and close together,
        ring + pinky down, thumb not open
        """
        positive = [
            self._two_fingers_only_score(f),
            self._close_pair_score(f),
            self._yes(not f["thumb_open"]),
            self._yes(self._count_extended(f) == 2),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(self._index_middle_dx(f) > 0.10, 1.0),  # more like V
        ]

        return self._score(positive, negative, negative_weight=0.98)

    def score_v(self, f):
        """
        V:
        index + middle extended and spread apart,
        ring + pinky down, thumb not open
        """
        positive = [
            self._two_fingers_only_score(f),
            self._spread_pair_score(f),
            self._yes(not f["thumb_open"]),
            self._yes(self._count_extended(f) == 2),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(self._index_middle_dx(f) < 0.06, 1.0),  # more like U
        ]

        return self._score(positive, negative, negative_weight=0.98)

    def score_w(self, f):
        """
        W:
        index + middle + ring extended, pinky down, thumb in
        """
        positive = [
            self._three_fingers_up_score(f),
            self._yes(not f["thumb_open"]),
            self._yes(self._count_extended(f) == 3),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "pinky")),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_x(self, f):
        """
        X:
        index hooked, middle/ring/pinky curled, thumb not open
        """
        positive = [
            self._hooked_index_score(f),
            self._yes(not f["thumb_open"]),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(f["finger_states"]["index"]["straightness"] > 160, 1.0),  # too straight
            self._yes(f["finger_states"]["index"]["tip_to_mcp"] < 0.45, 0.8),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_y(self, f):
        """
        Y:
        thumb open + pinky extended, other fingers closed
        """
        positive = [
            self._pinky_only_score(f),
            self._yes(f["thumb_open"]),
            self._yes(self._count_extended(f) == 1),
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
        ]

        negative = [
            self._yes(not f["thumb_open"]),
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_z(self, f):
        """
        Z:
        static image placeholder.
        Usually needs motion.
        """
        return 0.0

    def get_scores(self, f):
        return {
            "T": self.score_t(f),
            "U": self.score_u(f),
            "V": self.score_v(f),
            "W": self.score_w(f),
            "X": self.score_x(f),
            "Y": self.score_y(f),
            "Z": self.score_z(f),
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