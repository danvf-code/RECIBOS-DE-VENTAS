// Capa de datos: IndexedDB (fuente de verdad) + sincronización opcional con el back.
let db;
const wrap = r => new Promise((ok, err) => { r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error); });
const store = mode => db.transaction("ventas", mode).objectStore("ventas");

export async function abrir() {
  db = await new Promise((ok, err) => {
    const r = indexedDB.open("recibos-venta", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("ventas", { keyPath: "id", autoIncrement: true });
    r.onsuccess = () => ok(r.result); r.onerror = () => err(r.error);
  });
}
export async function guardar(filas) {
  const t = db.transaction("ventas", "readwrite");
  filas.forEach(f => t.objectStore("ventas").add(f));
  await new Promise(ok => (t.oncomplete = ok));
  sync("POST", filas);
}
export const todas = () => wrap(store("readonly").getAll());
export async function borrarTodo() { await wrap(store("readwrite").clear()); sync("DELETE"); }

// Sincronización best-effort: si no hay back disponible, la app sigue funcionando.
function sync(method, body) {
  fetch("/api/ventas", { method, headers: { "Content-Type": "application/json" }, body: body && JSON.stringify(body) }).catch(() => {});
}
