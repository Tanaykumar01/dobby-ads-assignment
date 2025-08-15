import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "50mb"
}));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import  userRouter  from "./routes/user.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import imageRoutes from "./routes/image.routes.js";

// use routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/folders", folderRoutes);
app.use("/api/v1/images", imageRoutes);



app.get("/api/v1/test", (req, res) => {
    res.json({ message: "Test route working" });
});
export {app};
