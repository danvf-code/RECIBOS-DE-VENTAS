# Recibos de venta

Punto de venta web para comercios pequeños. Registra cada venta en **IndexedDB** (navegador) y, de forma opcional, la replica en un **back Node.js** con API REST.

## Características

- Panel de compra con botones por artículo: miniatura, número, descripción y precio.
- Recibo en vivo con fecha, hora y líneas de compra; total acumulado.
- Contador de unidades por artículo.
- Campo de cliente, aplicado a cada línea comprada.
- **Borrar entrada** (quita el último artículo) y **Cancelar todo**.
- **Finalizar compra**: guarda en la base de datos y limpia el recibo.
- **Ventas diarias**: lista todas las ventas registradas y su total.
- **Borrar todo**: elimina el historial.
- Modo claro/oscuro automático, responsive y accesible por teclado.

## Estructura

```
recibos-de-venta/
├── front/                 # Aplicación cliente (HTML + CSS + JS modular)
│   ├── index.html
│   ├── css/styles.css
│   └── js/
│       ├── data.js        # Inventario de artículos
│       ├── db.js          # Capa IndexedDB + sincronización opcional
│       └── app.js         # Lógica de interfaz
├── back/                  # Servidor opcional (Node.js, sin dependencias)
│   ├── server.js          # Archivos estáticos + API REST
│   ├── package.json
│   └── data/ventas.json   # Se genera al guardar ventas
└── README.md
```

## Requisitos

- Navegador moderno con soporte de IndexedDB y módulos ES.
- Node.js 18 o superior (solo para el back).

## Ejecución

**Con back (recomendado):**

```bash
cd back
npm start
```

Abrir <http://localhost:3000>.

**Solo front:** los módulos ES requieren HTTP, no `file://`. Sirve la carpeta `front/` con cualquier servidor estático:

```bash
cd front
python3 -m http.server 8080
```

Abrir <http://localhost:8080>. Sin back, la app funciona igual con IndexedDB.

## API REST (back)

| Método | Ruta          | Descripción                           |
|--------|---------------|---------------------------------------|
| GET    | `/api/ventas` | Lista todas las filas de venta        |
| POST   | `/api/ventas` | Agrega un arreglo de filas            |
| DELETE | `/api/ventas` | Elimina todas las ventas              |

Fila de venta:

```json
{ "venta": 1735689600000, "fecha": "2026-10-04T15:00:00.000Z", "num": 101, "desc": "Café americano", "precio": 6.5, "cliente": "Ana" }
```

## Personalización

Edita `front/js/data.js` para cambiar el inventario. Cada artículo requiere `num` (único), `desc` y `precio`; `emoji` y `color` definen la miniatura.

## Privacidad

El navegador del cliente no es un entorno seguro. No almacenes datos sensibles ni información personal identificable (PII). El nombre del cliente es opcional; usa alias si es necesario.

## Licencia

MIT
