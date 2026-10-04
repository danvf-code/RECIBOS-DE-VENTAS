import { INVENTARIO } from "./data.js";
import * as DB from "./db.js";

const $ = id => document.getElementById(id);
const money = n => "S/ " + n.toFixed(2);
const fmt = d => d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
let carrito = [], fecha = null, timer;

function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(timer); timer = setTimeout(() => t.classList.remove("show"), 2200);
}
const linea = i => `<div class="l"><span>${i.num} ${esc(i.desc)}${i.cliente ? " · " + esc(i.cliente) : ""}</span><span>${money(i.precio)}</span></div>`;

function catalogo() {
  $("items").innerHTML = INVENTARIO.map(a => {
    const n = carrito.filter(i => i.num === a.num).length;
    return `<button class="item" data-n="${a.num}">${n ? `<span class="badge">${n}</span>` : ""}
      <span class="thumb" style="background:${a.color}" aria-hidden="true">${a.emoji}</span>
      <span class="n">Nº ${a.num}</span><span class="d">${a.desc}</span><span class="p">${money(a.precio)}</span></button>`;
  }).join("");
}
function pintar() {
  $("recTitulo").textContent = "Recibo";
  $("total").textContent = money(carrito.reduce((s, i) => s + i.precio, 0));
  $("recibo").innerHTML = carrito.length
    ? `<div class="l date">${fmt(fecha)}</div>` + carrito.map(linea).join("")
    : `<div class="empty">Sin artículos.<br>Toca un artículo para comprar.</div>`;
  $("recibo").scrollTop = $("recibo").scrollHeight;
  catalogo();
}
function limpiar() { carrito = []; $("cliente").value = ""; pintar(); }

$("items").addEventListener("click", e => {
  const b = e.target.closest(".item"); if (!b) return;
  const a = INVENTARIO.find(x => x.num == b.dataset.n);
  if (!carrito.length) fecha = new Date();
  carrito.push({ num: a.num, desc: a.desc, precio: a.precio, cliente: $("cliente").value.trim() });
  pintar();
});
$("borrarEntrada").onclick = () => { carrito.pop(); pintar(); };
$("cancelar").onclick = () => { limpiar(); toast("Compra cancelada"); };

$("finalizar").onclick = async () => {
  if (!carrito.length) return toast("Agrega artículos primero");
  const total = carrito.reduce((s, i) => s + i.precio, 0), venta = Date.now(), f = fecha.toISOString();
  await DB.guardar(carrito.map(i => ({ venta, fecha: f, ...i })));
  limpiar(); toast("Venta guardada · " + money(total));
};
$("diarias").onclick = async () => {
  const filas = await DB.todas();
  $("recTitulo").textContent = "Ventas diarias";
  $("total").textContent = money(filas.reduce((s, i) => s + i.precio, 0));
  $("recibo").innerHTML = filas.length
    ? `<div class="l date">${fmt(new Date())}</div>` + filas.map(linea).join("")
    : `<div class="empty">Sin ventas registradas.</div>`;
};
$("borrarTodo").onclick = async () => {
  if (!confirm("¿Borrar todas las ventas registradas?")) return;
  await DB.borrarTodo(); limpiar(); toast("Ventas eliminadas");
};

setInterval(() => ($("reloj").textContent = fmt(new Date())), 1000);
$("reloj").textContent = fmt(new Date());
DB.abrir().then(pintar).catch(() => toast("IndexedDB no disponible"));
