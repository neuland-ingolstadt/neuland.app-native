import express from "express";
import path from "path";

const app = express();

app.use(
  express.static(path.resolve(__dirname, ".vitepress", "dist"), {
    extensions: ["html"],
  }),
);

const PORT = 8080;
app.listen(PORT, () => {
  console.log("listening on port ", PORT);
});
