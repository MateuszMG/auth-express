const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");

const accessTokenKey = "accessTokenKey";
const refreshTokenKey = "refreshTokenKey";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// app.use("/", (req, res) => {
//   res.json({ msg: ";D" });
// });

app.get("/api/users", auth, (req, res) => {
  const users = [{ id: 1, name: "User" }];

  res.send(users);
});

app.post("/api/auth/login", (req, res) => {
  //   const email = req.body.email;
  //   const password = req.body.password;

  //   const validPassword = await bcrypt.compare(password, user[0].password)

  const accessToken = generateAccessToken({ id: 1 });
  const refreshToken = generateRefreshToken({ id: 1 });
  // Save refresh Token in DB

  res.cookie("JWT", accessToken, {
    maxAge: 86400000,
    httpOnly: true,
  });

  res.send({ accessToken, refreshToken });
});

app.post("/api/auth/refresh", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(401);

  // TODO: Check if refreshToken exists in DB

  const validToken = jwt.verify(refreshToken, refreshTokenKey);

  if (!validToken) return res.status(403);

  const accessToken = generateAccessToken({ id: 1 });

  res.send({ accessToken });
});

app.listen(4002, () => {
  console.log(":D");
});

function auth(req, res, next) {
  //   const token = req.headers["authorization"]?.split(" ")[1];
  const token = req.cookies.JWT;
  console.log("token", token);

  if (token === null) return res.sendStatus(401);

  jwt.verify(token, accessTokenKey, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;
    next();
  });
}

function generateAccessToken(payload) {
  return jwt.sign(payload, accessTokenKey, { expiresIn: 10 });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, refreshTokenKey, { expiresIn: 60 * 60 });
}
