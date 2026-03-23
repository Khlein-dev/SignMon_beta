class AGDetector:
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
    # Finger state helpers
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

    def _all_four_closed(self, f):
        return (
            not self._is_extended(f, "index")
            and not self._is_extended(f, "middle")
            and not self._is_extended(f, "ring")
            and not self._is_extended(f, "pinky")
        )

    def _all_four_up(self, f):
        return (
            self._is_extended(f, "index")
            and self._is_extended(f, "middle")
            and self._is_extended(f, "ring")
            and self._is_extended(f, "pinky")
        )

    def _only_index_up(self, f):
        return (
            self._is_extended(f, "index")
            and not self._is_extended(f, "middle")
            and not self._is_extended(f, "ring")
            and not self._is_extended(f, "pinky")
        )

    def _none_extended_score(self, f):
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _only_index_up_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
        ])

    def _three_folded_score(self, f):
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
    def _thumb_index_gap(self, f):
        return f["pinch_index_thumb"]

    def _thumb_middle_gap(self, f):
        return f["pinch_middle_thumb"]

    def _tip_y_spread(self, f):
        ys = [
            f["landmarks"][8].y,
            f["landmarks"][12].y,
            f["landmarks"][16].y,
            f["landmarks"][20].y,
        ]
        return max(ys) - min(ys)

    # -------------------------
    # Shape helpers
    # -------------------------
    def _four_fingers_closed_score(self, f):
        return self._avg([
            self._yes(not self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._count_curled(f) >= 3),
        ])

    def _four_fingers_up_score(self, f):
        return self._avg([
            self._yes(self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ])

    def _curled_hand_score(self, f):
        return self._avg([
            self._yes(self._count_curled(f) >= 3),
            self._yes(not self._all_four_up(f)),
            self._yes(not f["compact_fist"], 0.7),
        ])

    def _rounded_c_shape_score(self, f):
        return self._avg([
            self._yes(f.get("c_shape", False)),
            self._soft_range(self._thumb_index_gap(f), 0.35, 0.90, 0.25, 1.10),
            self._yes(not f["compact_fist"]),
            self._yes(not self._all_four_up(f)),
        ])

    def _compact_inward_score(self, f):
        return self._avg([
            self._yes(self._count_curled(f) >= 3),
            self._yes(not f["thumb_open"]),
            self._soft_range(self._thumb_index_gap(f), 0.00, 0.28, 0.00, 0.36),
            self._yes(self._count_extended(f) == 0),
        ])

    # -------------------------
    # Letter scores based on your definitions
    # -------------------------
    def score_a(self, f):
        """
        A = four fingers closed, thumb open
        """
        positive = [
            self._four_fingers_closed_score(f),
            self._yes(f["thumb_open"]),
            self._soft_range(self._thumb_index_gap(f), 0.20, 0.85, 0.12, 1.00),
            self._yes(self._count_extended(f) == 0),
        ]

        negative = [
            self._yes(self._all_four_up(f)),
            self._yes(not f["thumb_open"]),
            self._yes(f.get("c_shape", False), 0.8),
            self._yes(not f["compact_fist"], 0.5),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_b(self, f):
        """
        B = four fingers up, thumb in
        """
        positive = [
            self._four_fingers_up_score(f),
            self._yes(not f["thumb_open"]),
            self._soft_range(self._tip_y_spread(f), 0.0, 0.12, 0.0, 0.20),
        ]

        negative = [
            self._yes(f["thumb_open"]),
            self._yes(self._count_curled(f) >= 2),
            self._yes(self._count_extended(f) < 3),
        ]

        return self._score(positive, negative, negative_weight=0.95)

    def score_c(self, f):
        """
        C = fingers curled
        """
        positive = [
            self._rounded_c_shape_score(f),
            self._curled_hand_score(f),
            self._yes(self._thumb_index_gap(f) > 0.30),
        ]

        negative = [
            self._yes(f["compact_fist"]),
            self._yes(self._thumb_index_gap(f) < 0.22),
            self._yes(self._all_four_up(f)),
            self._yes(f["thumb_open"] and self._count_curled(f) >= 3 and self._thumb_index_gap(f) < 0.28, 0.9),
        ]

        return self._score(positive, negative, negative_weight=0.90)

    def score_d(self, f):
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

    def score_e(self, f):
        """
        E = all fingers curled slightly and in
        """
        positive = [
            self._compact_inward_score(f),
            self._none_extended_score(f),
            self._yes(not f["thumb_open"]),
            self._yes(not f["compact_fist"]),
            self._soft_range(self._thumb_index_gap(f), 0.00, 0.22, 0.00, 0.32),
        ]

        negative = [
            self._yes(self._is_extended(f, "index"), 1.0),
            self._yes(self._count_extended(f) >= 1, 1.0),
            self._yes(f["thumb_open"]),
            self._yes(self._thumb_index_gap(f) > 0.35, 0.8),
            self._yes(f.get("c_shape", False), 0.7),
        ]

        return self._score(positive, negative, negative_weight=1.05)

    def score_f(self, f):
        """
        F = index and thumb closed, middle/ring/pinky open
        """
        positive = [
            self._soft_range(self._thumb_index_gap(f), 0.00, 0.18, 0.00, 0.28),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
            self._yes(not self._is_extended(f, "index") or self._is_curled(f, "index")),
            self._yes(not f["thumb_open"], 0.7),
        ]

        negative = [
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_extended(f, "index"), 0.8),
        ]

        return self._score(positive, negative, negative_weight=1.0)

    def score_g(self, f):
        """
        G = thumb and index open, rest closed
        """
        positive = [
            self._yes(f["thumb_open"]),
            self._yes(self._is_extended(f, "index")),
            self._yes(not self._is_extended(f, "middle")),
            self._yes(not self._is_extended(f, "ring")),
            self._yes(not self._is_extended(f, "pinky")),
            self._yes(self._is_curled(f, "middle")),
            self._yes(self._is_curled(f, "ring")),
            self._yes(self._is_curled(f, "pinky")),
            self._soft_range(self._thumb_index_gap(f), 0.30, 0.95, 0.20, 1.15),
        ]

        negative = [
            self._yes(not f["thumb_open"]),
            self._yes(not self._is_extended(f, "index")),
            self._yes(self._is_extended(f, "middle")),
            self._yes(self._is_extended(f, "ring")),
            self._yes(self._is_extended(f, "pinky")),
        ]

        return self._score(positive, negative, negative_weight=0.98)

    # -------------------------
    # Public API
    # -------------------------
    def get_scores(self, f):
        return {
            "A": self.score_a(f),
            "B": self.score_b(f),
            "C": self.score_c(f),
            "D": self.score_d(f),
            "E": self.score_e(f),
            "F": self.score_f(f),
            "G": self.score_g(f),
        }

    def predict(self, f, min_score=0.50, min_margin=0.12):
        scores = self.get_scores(f)
        ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)

        best_label, best_score = ranked[0]
        second_label, second_score = ranked[1]

        if best_score < min_score:
            return None, best_score, scores

        if best_score - second_score < min_margin:
            return None, best_score, scores

        return best_label, best_score, scores