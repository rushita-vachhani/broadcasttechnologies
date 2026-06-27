import dotenv from "dotenv";
import connectDB from "./db/db.js";
import { app } from "./app.js";

dotenv.config(
    {
        path: "./.env"
    }
);

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.error("Error starting the server:", err);
        throw err; // Rethrow the error to stop the server from starting
    });
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.error("Error starting the server:", error);
});
