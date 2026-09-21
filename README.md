# MATILDA Boutique - Catálogo Digital

Catálogo digital de moda femenina desarrollado para **MATILDA**, diseñado como herramienta comercial para que las vendedoras atiendan clientas por WhatsApp y para consulta directa de clientes en web y celular.

---

## 📁 Estructura del Proyecto

```text
landig de catalogo/
│
├── index.html            # Interfaz principal (HTML5 semántico y responsive)
├── README.md             # Guía de uso y mantenimiento del proyecto
│
├── css/
│   └── styles.css        # Diseño visual boutique, variables, proporción 3:4 y animaciones
│
├── js/
│   ├── config.js         # Configuración central (WhatsApp, moneda COP, plantillas)
│   ├── products.js       # Base de datos con los productos, fotos, colores, tallas y detalles
│   └── app.js            # Lógica interactiva (categorías dinámicas, búsqueda, filtros, compartir)
│
└── [fotografías reales]  # Archivos de imagen originales de la colección (file-folio_*.jpg)
```

---

## 🛍️ 1. Cómo Agregar Más Productos

Para añadir nuevas prendas al catálogo, abre el archivo [`js/products.js`](js/products.js) y agrega un nuevo objeto al array `PRODUCTS`.

### Plantilla para copiar y pegar:

```javascript
{
  id: 21,                                                // Siguiente número correlativo
  slug: 'nombre-de-la-prenda',                           // Identificador amigable en minúsculas
  referencia: 'MAT-COR-010',                             // Referencia única de la prenda
  nombre: 'Nombre Elegante de la Prenda',                // Nombre comercial visible
  categoria: 'Corsets',                                  // Categoría (Corsets, Chalecos, Tops, Bodys, Blusas, etc.)
  precio: 159990,                                        // Precio numérico en COP (sin puntos)
  imagen: 'nombre-de-la-nueva-foto.jpg',                 // Nombre del archivo de imagen en la raíz
  color: 'Blanco',                                       // Nombre del color principal
  colorHex: '#FFFFFF',                                   // Código hexadecimal para la muestra de color
  tallas: ['S', 'M', 'L'],                               // Tallas disponibles (ver sección de tallas)
  disponibilidad: 'Disponible',                          // 'Disponible' o 'Últimas unidades' o 'Agotado'
  destacado: false,                                      // true o false
  badge: 'NUEVA COLECCIÓN',                              // Etiqueta visual opcional
  descripcion: 'Descripción comercial y natural de la prenda sin texto de relleno.',
  detalles: [
    'Característica 1 (tipo de escote o cuello)',
    'Característica 2 (tipo de tela o textura)',
    'Característica 3 (detalles de botones, lazos o cremallera)',
    'Característica 4 (tipo de ajuste o silueta)'
  ]
},
```

> **Nota sobre Categorías:** Al ingresar una nueva categoría (por ejemplo `"Vestidos"` o `"Pantalones"`), la barra de categorías del catálogo la creará automáticamente sin tener que modificar código adicional.

---

## 📏 2. Cómo Manejar las Tallas y Disponibilidad

### Si una prenda tiene tallas:
```javascript
tallas: ['XS', 'S', 'M', 'L', 'XL'],
```

### Si es Talla Única:
```javascript
tallas: ['ÚNICA'],
```

### Si una prenda no maneja tallas:
```javascript
tallas: [],
```

### Estados de Disponibilidad:
En la propiedad `disponibilidad` puedes colocar:
- `'Disponible'` (aparece con insignia verde)
- `'Últimas unidades'` (aparece con insignia amarilla de alerta)
- `'Agotado'`

---

## 📲 3. Conexión con el WhatsApp Oficial y APIs Futuras

### Método 1: Cambio directo en [`js/config.js`](js/config.js)
Busca la línea:
```javascript
whatsappPhone: localStorage.getItem('matilda_whatsapp_phone') || '573000000000',
```
Reemplaza `'573000000000'` por el número real con código de país (ejemplo: `'573101234567'` para Colombia).

### Método 2: Desde la interfaz web
En la esquina superior derecha del catálogo hay un botón con forma de engranaje (⚙️). Al presionarlo, cualquier empleada puede ingresar el número oficial y quedará guardado automáticamente en el navegador.

### Conexión con WhatsApp Business API / Cloud API (Fase Futura):
En [`js/config.js`](js/config.js) se preparó la estructura para integrar webhooks o llamadas a endpoints de la Meta WhatsApp Cloud API:
- Las funciones `generateWhatsAppMessage` y `generateCleanCopyText` entregan los datos limpios estructurados (nombre, referencia, talla elegida, color y precio) para poder enviarlos como payload JSON a cualquier CRM o bot de WhatsApp.

---

## 🚀 Cómo Visualizar el Catálogo

Simplemente haz doble clic sobre el archivo [`index.html`](index.html) en tu computador o súbelo a cualquier servicio de hosting (GitHub Pages, Vercel, Netlify o hosting tradicional).
