# Megabyte MB Web Platform

Landing, tienda tecnologica, carrito, checkout por WhatsApp y panel administrativo para Megabyte MB.

## Arquitectura

La arquitectura completa esta documentada en:

```text
docs/ARCHITECTURE.md
```

Resumen rapido:

```text
admin/       Panel administrativo y API privada
api/         API publica
assets/      Imagenes, logos, iconos y recursos
components/  Referencia de componentes compartidos
config/      Configuracion de base de datos
css/         Estilos globales
data/        Catalogo JSON de respaldo
database/    Esquema SQL
docs/        Documentacion tecnica
includes/    Funciones PHP compartidas
js/          JavaScript vanilla
pages/       Mapa documental de paginas
partials/    Header/footer compartidos actuales
```

Los HTML publicos se mantienen en la raiz para conservar URLs existentes:

- `index.html`
- `servicios.html`
- `seguimiento.html`
- `nosotros.html`
- `contacto.html`
- `tienda.html`
- `producto.html`
- `carrito.html`
- `checkout.html`

## Backend PHP de tienda

Catalogo publico:

```text
/api/products.php
```

Panel administrador:

```text
/admin/
```

Credenciales por defecto:

```text
Usuario: admin
Contrasena: MegabyteAdmin2026!
```

## Configuracion de base de datos

La conexion MySQL vive en:

```text
config/database.php
```

Si MySQL no esta disponible, el sistema usa:

```text
data/products.json
```

El catalogo base para restaurar ejemplos esta en:

```text
data/default-products.json
```

## Imagenes de productos

Las imagenes subidas desde el panel admin se guardan en:

```text
assets/productos/
```

## Reglas del proyecto

- Mantener HTML, CSS, JavaScript vanilla y PHP.
- No mover paginas de raiz sin actualizar enlaces, sitemap y hosting.
- No eliminar funcionalidades existentes.
- Mantener componentes compartidos documentados.
