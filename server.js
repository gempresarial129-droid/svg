const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Ruta para servir cualquier archivo dentro de la carpeta "svg"
app.get("/svg/:file", (req, res) => {
  const { file } = req.params;
  const filePath = path.join(__dirname, "svg", file);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) return res.status(404).send("SVG no encontrado");

    let svgContent = data;

    // Sustituir variables {VAR} por valores de query
    Object.keys(req.query).forEach(key => {
      const value = req.query[key];
      const regex = new RegExp(`\\{${key}\\}`, "g"); // <- nota el escape \
      svgContent = svgContent.replace(regex, value);
    });

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svgContent);
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
