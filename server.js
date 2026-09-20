const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const users = [];
const students = [];
const sessions = new Map();

function id() {
  return crypto.randomUUID();
}

function token() {
  return crypto.randomBytes(32).toString("hex");
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "App Center Server",
    version: "4.0.0",
    status: "online"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "online",
    time: new Date().toISOString()
  });
});

// REGISTER
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Maqaa, email fi password guuti."
    });
  }

  const exists = users.find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

  if (exists) {
    return res.status(400).json({
      success: false,
      message: "Email kun duraan jira."
    });
  }

  const user = {
    id: id(),
    name,
    email,
    password,
    createdAt: new Date().toISOString()
  };

  users.push(user);

  res.json({
    success: true,
    message: "Account uumameera.",
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u =>
      u.email.toLowerCase() === String(email).toLowerCase() &&
      u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Email ykn password sirrii miti."
    });
  }

  const session = token();
  sessions.set(session, user.id);

  res.json({
    success: true,
    token: session,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// PROFILE
app.get("/api/profile", (req, res) => {
  const auth = req.headers.authorization || "";
  const session = auth.replace("Bearer ", "");

  const userId = sessions.get(session);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Login godhi."
    });
  }

  const user = users.find(u => u.id === userId);

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

// CREATE STUDENT
app.post("/api/students", (req, res) => {
  const {
    name,
    phone,
    email,
    gender,
    age,
    className,
    address,
    guardian,
    notes
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Maqaan barataa dirqama."
    });
  }

  const student = {
    id: id(),
    code: "STD-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    name,
    phone: phone || "",
    email: email || "",
    gender: gender || "",
    age: age || "",
    className: className || "",
    address: address || "",
    guardian: guardian || "",
    notes: notes || "",
    createdAt: new Date().toISOString()
  };

  students.push(student);

  res.json({
    success: true,
    student
  });
});

// GET ALL STUDENTS
app.get("/api/students", (req, res) => {
  res.json({
    success: true,
    students
  });
});

// GET ONE STUDENT
app.get("/api/students/:id", (req, res) => {
  const student =
    students.find(s => s.id === req.params.id) ||
    students.find(s => s.code === req.params.id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Barataan hin argamne."
    });
  }

  res.json({
    success: true,
    student
  });
});

// UPDATE STUDENT
app.put("/api/students/:id", (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Barataan hin argamne."
    });
  }

  students[index] = {
    ...students[index],
    ...req.body,
    id: students[index].id,
    code: students[index].code
  };

  res.json({
    success: true,
    student: students[index]
  });
});

// DELETE STUDENT
app.delete("/api/students/:id", (req, res) => {
  const index = students.findIndex(s => s.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Barataan hin argamne."
    });
  }

  students.splice(index, 1);

  res.json({
    success: true,
    message: "Barataan haqameera."
  });
});

app.listen(PORT, () => {
  console.log(`App Center Server running on port ${PORT}`);
});
