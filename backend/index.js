const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(
  "mongodb://appuser:fLT4USem1PDH98VK@ac-fdzwgpp-shard-00-00.2e0xmsx.mongodb.net:27017,ac-fdzwgpp-shard-00-01.2e0xmsx.mongodb.net:27017,ac-fdzwgpp-shard-00-02.2e0xmsx.mongodb.net:27017/mobileAppDB?ssl=true&replicaSet=atlas-owt04o-shard-0&authSource=admin&retryWrites=true&w=majority&appName=signmon-cluster"
)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB error:", err));


const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Admin = mongoose.model("Admin", adminSchema);


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

  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },

  completedLessons: {
    type: [String],
    default: [],
  },


  lessonStats: {
    type: Map,
    of: Number,
    default: {},
  },


  totalTimeSpent: {
    type: Number,
    default: 0, 
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);



app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      admin: {
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


app.post("/admin/create", async (req, res) => {
  try {
    const admin = new Admin({
      email: "admin@signmon.com",
      password: "admin123",
    });

    await admin.save();

    res.json({ message: "Admin created!" });
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.delete("/admin/user/:id", async (req, res) => {
  try {
    await User.deleteOne({ userId: req.params.id });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});


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

  
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
    }


    user.lessonStats.set(
      lessonId,
      (user.lessonStats.get(lessonId) || 0) + 1
    );


    user.xp += 100;

while (user.xp >= user.level * 100) {
  user.xp -= user.level * 100;
  user.level += 1;
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


app.post("/track-time", async (req, res) => {
  try {
    const { userId, seconds } = req.body;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.totalTimeSpent += seconds;

    await user.save();

    res.json({
      message: "Time updated",
      totalTimeSpent: user.totalTimeSpent,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});



// 🧠 MOST COMPLETED LESSONS
app.get("/admin/analytics/lessons", async (req, res) => {
  try {
    const users = await User.find();

    const lessonMap = {};

    users.forEach((user) => {
      if (user.lessonStats) {
        user.lessonStats.forEach((count, lesson) => {
          lessonMap[lesson] = (lessonMap[lesson] || 0) + count;
        });
      }
    });

    res.json(lessonMap);
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/admin/analytics/time", async (req, res) => {
  try {
    const users = await User.find();

    const result = users.map((u) => ({
      name: u.name,
      time: u.totalTimeSpent || 0,
    }));

    res.json(result);
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