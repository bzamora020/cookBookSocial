import express from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
// import { VerifyToken } from "./middleware/VerifyToken.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import recipeRouter from "./routes/recipe.js";
import userRouter from "./routes/user.js";
import bodyParser from "body-parser";
import commentsRouter from "./routes/comment.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATIC_FILES_PATH = path.resolve(__dirname, "..", "frontend", "build");

dotenv.config(); // Configure dotenv to access the env variables

// Every time frontend tries to serve this (backend), it will automatically be stored in public folder.
// app.use(express.static(path.join(__dirname + "/public")));
app.use(express.static(path.join(STATIC_FILES_PATH)));

// For later setting environment variables, else we use 3001 as default port.
const port = process.env.PORT || 3001;

const jsonParser = bodyParser.json();
app.use(jsonParser);

var corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Set up Swagger UI
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "Serves Up API",
      version: "1.0.0",
    },
  },
  apis: ["index.js", "./routes/recipe.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api/recipe", recipeRouter);
app.use("/api/user", userRouter);
app.use("/api/comments", commentsRouter);

app.listen(port, () => {
  console.log(`Example Express app listening at http://localhost:${port}`);
});

//Anything that does not match the above api routes will be rerouted to the static pages (frontend)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/../frontend/build/index.html"));
});
