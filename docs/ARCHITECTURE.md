# Arquitectura del proyecto Megabyte

Este proyecto mantiene URLs publicas simples en la raiz (`index.html`, `tienda.html`, etc.) para no romper enlaces existentes ni despliegues actuales. La organizacion se documenta por dominios funcionales para que sea facil encontrar y modificar cada parte.

## Mapa rapido

```text
/
├── index.html                  Pagina publica principal
├── servicios.html              Pagina publica de servicios
├── seguimiento.html            Pagina publica de seguimiento
├── nosotros.html               Pagina publica corporativa
├── contacto.html               Pagina publica de contacto
├── tienda.html                 Home de tienda
├── producto.html               Detalle de producto
├── carrito.html                Carrito
├── checkout.html               Checkout por WhatsApp
├── admin/                      Panel administrativo y API privada
├── api/                        API publica
├── assets/                     Imagenes, logos, iconos y recursos
├── components/                 Referencia de componentes compartidos
├── config/                     Configuracion del proyecto
├── css/                        Estilos globales
├── data/                       JSON fallback de productos
├── database/                   Esquema SQL
├── docs/                       Documentacion tecnica
├── includes/                   Funciones PHP compartidas
├── js/                         JavaScript vanilla
├── pages/                      Mapa documental de paginas
└── partials/                   Componentes HTML cargados por JS
```

## Paginas publicas

Los archivos publicos siguen en la raiz para conservar URLs:

- `index.html`
- `servicios.html`
- `seguimiento.html`
- `nosotros.html`
- `contacto.html`

Referencia documental: `pages/public/README.md`.

## Paginas de tienda

La tienda tambien conserva URLs de raiz:

- `tienda.html`
- `producto.html`
- `carrito.html`
- `checkout.html`

Referencia documental: `pages/store/README.md`.

## Panel administrativo

El panel privado vive en:

- `admin/index.php`: interfaz del administrador.
- `admin/api.php`: endpoints privados para login, productos y subida de imagenes.
- `admin/.htaccess`: configuracion de ruta `/admin`.

## API

- `api/products.php`: endpoint publico que entrega el catalogo.
- `admin/api.php`: endpoint privado para administracion.

## JavaScript

- `js/layout.js`: inyecta header/footer globales en paginas publicas.
- `js/store.js`: logica de tienda, carrito, checkout y admin.
- `js/main.js`: interacciones generales de la landing.
- `js/swup-init.js`: transiciones entre paginas.

## CSS

- `css/styles.css`: hoja principal del sitio completo.

Se mantiene un solo CSS para no romper el diseño actual. Si crece demasiado, el siguiente paso natural seria dividirlo en archivos por dominio y compilar o importar desde un entrypoint.

## Recursos

- `assets/`: logos, favicon, imagenes hero, marca Andev y recursos publicos.
- `assets/productos/`: imagenes subidas desde el panel administrativo.
- `Recursos_cliente/`: material original entregado por cliente.

## Configuracion y base de datos

- `config/database.php`: credenciales y DSN de MySQL.
- `includes/store-config.php`: funciones PHP compartidas de productos, sesiones y persistencia.
- `database/schema.sql`: esquema de referencia.
- `data/products.json`: respaldo local cuando no hay MySQL.
- `data/default-products.json`: catalogo inicial/restaurable.

## Componentes compartidos

- `partials/footer.html`: footer global cargado por `js/layout.js`.
- `partials/header.html`: referencia HTML del header.
- `components/shared/`: carpeta documental para ubicar componentes compartidos y futuras extracciones.

## Regla importante

No mover los archivos HTML de raiz sin crear redirecciones o actualizar enlaces internos, sitemap y despliegue. La estructura actual prioriza compatibilidad de URLs y mantenimiento visual.
