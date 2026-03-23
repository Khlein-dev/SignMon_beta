class NumbersDetector:
    def score_1(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            f["fingers_up"] == [0, 1, 0, 0, 0]
            and fs["index"]["extended"]
            and fs["middle"]["curled"]
            and fs["ring"]["curled"]
            and fs["pinky"]["curled"]
            and f["pinch_middle_thumb"] < 0.85
            and not f["thumb_open"]
        ) else 0.0

    def score_2(self, f):
        fs = f["finger_states"]
        spread_pair = abs(f["landmarks"][8].x - f["landmarks"][12].x) >= 0.07
        return 1.0 if (
            not f["thumb_open"]
            and fs["index"]["extended"]
            and fs["middle"]["extended"]
            and not fs["ring"]["extended"]
            and not fs["pinky"]["extended"]
            and spread_pair
        ) else 0.0

    def score_3(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            f["thumb_open"]
            and fs["index"]["extended"]
            and fs["middle"]["extended"]
            and not fs["ring"]["extended"]
            and not fs["pinky"]["extended"]
        ) else 0.0

    def score_4(self, f):
        return 1.0 if f["fingers_up"] == [0, 1, 1, 1, 1] else 0.0

    def score_5(self, f):
        return 1.0 if f["fingers_up"] == [1, 1, 1, 1, 1] else 0.0

    def score_6(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            fs["index"]["extended"]
            and fs["middle"]["extended"]
            and fs["ring"]["extended"]
            and not fs["pinky"]["extended"]
            and f["pinch_pinky_thumb"] < 0.45
        ) else 0.0

    def score_7(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            fs["index"]["extended"]
            and fs["middle"]["extended"]
            and not fs["ring"]["extended"]
            and fs["pinky"]["extended"]
            and f["pinch_ring_thumb"] < 0.45
        ) else 0.0

    def score_8(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            fs["index"]["extended"]
            and not fs["middle"]["extended"]
            and fs["ring"]["extended"]
            and fs["pinky"]["extended"]
            and f["pinch_middle_thumb"] < 0.45
        ) else 0.0

    def score_9(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            not fs["index"]["extended"]
            and fs["middle"]["extended"]
            and fs["ring"]["extended"]
            and fs["pinky"]["extended"]
            and f["pinch_index_thumb"] < 0.40
        ) else 0.0

    def score_10(self, f):
        fs = f["finger_states"]
        return 1.0 if (
            f["thumb_open"]
            and not fs["index"]["extended"]
            and not fs["middle"]["extended"]
            and not fs["ring"]["extended"]
            and not fs["pinky"]["extended"]
        ) else 0.0

    def get_scores(self, f):
        return {
            "1": self.score_1(f),
            "2": self.score_2(f),
            "3": self.score_3(f),
            "4": self.score_4(f),
            "5": self.score_5(f),
            "6": self.score_6(f),
            "7": self.score_7(f),
            "8": self.score_8(f),
            "9": self.score_9(f),
            "10": self.score_10(f),
        }