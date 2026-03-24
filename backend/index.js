const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(
  "mongodb://appuser:fLT4USem1PDH98VK@ac-fdzwgpp-shard-00-00.2e0xmsx.mongodb.net:27017,ac-fdzwgpp-shard-00-01.2e0xmsx.mongodb.net:27017,ac-fdzwgpp-shard-00-02.2e0xmsx.mongodb.net:27017/mobileAppDB?ssl=true&replicaSet=atlas-owt04o-shard-0&authSource=admin&retryWrites=true&w=majority&appName=signmon-cluster"
)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));


const counterSchema = new mongoose.Schema({
  _id: String,
  sequence_value: Number,
});

const Counter = mongoose.model("Counter", counterSchema);

const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  );
  return counter.sequence_value;
};


const userSchema = new mongoose.Schema({
  userId: Number,
  name: String,
  age: String,
  gender: String,

  level: {
    type: Number,
    default: 1,
  },

  xp: {
    type: Number,
    default: 0,
  },

  completedLessons: {
    type: [String],
    default: [],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);



app.post("/users", async (req, res) => {
  try {
    const { name, age, gender } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const nextId = await getNextSequence("userId");

    const user = new User({
      userId: nextId,
      name,
      age,
      gender,
      level: 1,
      xp: 0,
      completedLessons: [],
    });

    await user.save();

    res.json({
      message: "User saved!",
      user,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



app.post("/complete-lesson", async (req, res) => {
  try {
    const { userId, lessonId } = req.body;

    if (!userId || !lessonId) {
      return res.status(400).json({
        message: "userId and lessonId are required",
      });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    if (user.completedLessons.includes(lessonId)) {
      return res.json({
        message: "Lesson already completed",
        user,
      });
    }


    user.completedLessons.push(lessonId);

    // Add XP
    user.xp += 100; // Each lesson gives 100 XP

    // 🔥 LEVEL SYSTEM (IMPROVED)
    while (user.xp >= 100) {
      user.level += 1;
      user.xp -= 100;
    }

    await user.save();

    res.json({
      message: "Lesson completed!",
      user,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOne({
      userId: req.params.userId,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/", (req, res) => {
  res.send("Backend is working!");
});


app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});