const express = require("express");
     const fs = require("fs");
     const path = require("path");
     const axios = require("axios");

     const app = express();
     const PORT = process.env.PORT || 3000;

     // Habilitar CORS
     app.use((req, res, next) => {
       res.header("Access-Control-Allow-Origin", "*");
       res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
       next();
     });

     app.get("/svg/:file", async (req, res) => {
       const { file } = req.params;
       const filePath = path.join(__dirname, "svg", file);

       fs.readFile(filePath, "utf8", async (err, data) => {
         if (err) return res.status(404).send("SVG no encontrado");

         let svgContent = data;

         // Sustituir variables {VAR} por valores de query
         Object.keys(req.query).forEach(key => {
           const value = req.query[key];
           const regex = new RegExp(`\\{${key}\\}`, "g");
           svgContent = svgContent.replace(regex, value);
         });

         // Manejar la imagen del logo
         const logoUrl = req.query.LOGO || "https://lh3.googleusercontent.com/d/1BBlKYG55WW3S-pavRkMsmyf_kTJXUshS=w150-h150";
         try {
           const response = await axios.get(logoUrl, { responseType: "arraybuffer" });
           const logoBase64 = Buffer.from(response.data).toString("base64");
           const mimeType = response.headers["content-type"] || "image/jpeg";
           const logoDataUri = `data:${mimeType};base64,${logoBase64}`;
           svgContent = svgContent.replace(/\{LOGO\}/g, logoDataUri);

           // Enviar SVG con tipo MIME correcto
           res.setHeader("Content-Type", "image/svg+xml");
           res.send(svgContent);
         } catch (error) {
           console.error("Error generando SVG:", error);
           res.status(500).send("Error generando SVG");
         }
       });
     });

     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
