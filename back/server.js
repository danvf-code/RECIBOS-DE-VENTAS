// Servidor sin dependencias: sirve /front y expone una API REST con persistencia en JSON.
const http = require("http"), fs = require("fs"), path = require("path");
const PORT = process.env.PORT || 3000;
const FRONT = path.join(__dirname, "..", "front");
const DATA = path.join(__dirname, "data", "ventas.json");
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json" };

const leer = () => { try { return JSON.parse(fs.readFileSync(DATA, "utf8")); } catch { return []; } };
const escribir = v => { fs.mkdirSync(path.dirname(DATA), { recursive: true }); fs.writeFileSync(DATA, JSON.stringify(v, null, 2)); };
const json = (res, code, obj) => { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api/ventas") {
    if (req.method === "GET") return json(res, 200, leer());
    if (req.method === "DELETE") { escribir([]); return json(res, 200, { ok: true }); }
    if (req.method === "POST") {
      let body = "";
      req.on("data", c => { body += c; if (body.length > 1e6) req.destroy(); });
      req.on("end", () => {
        try {
          const filas = JSON.parse(body);
          if (!Array.isArray(filas)) throw new Error();
          escribir(leer().concat(filas)); json(res, 201, { ok: true, guardadas: filas.length });
        } catch { json(res, 400, { error: "Cuerpo inválido" }); }
      });
      return;
    }
    return json(res, 405, { error: "Método no permitido" });
  }
  const rel = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(FRONT, rel));
  if (!file.startsWith(FRONT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("No encontrado"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" }); res.end(buf);
  });
}).listen(PORT, () => console.log(`Recibos de venta → http://localhost:${PORT}`));
