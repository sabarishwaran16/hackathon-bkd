const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(cors({ origin: ["*"] }));
app.use(express.json());

const routes = [
  { path: "/api/auth", module: "./routes/users.js" },
  { path: "/api/test", module: "./routes/test.js" },
  { path: "/api/testdetails", module: "./routes/testDetail.js" },
  { path: "/api/disease", module: "./routes/disease.js" },
  { path: "/api/role", module: "./routes/role.js" },
  { path: "/api/dashboard", module: "./routes/dashboard.js" },
  { path: "/api/patient", module: "./routes/patient.js" },
]

routes.forEach((route) => {
  try {
    (async () => {
      const module = await import(route.module);
      app.use(route.path, module.default);
    })();
  } catch (error) {
    console.error(`Error loading route ${route.path}:`, error.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
