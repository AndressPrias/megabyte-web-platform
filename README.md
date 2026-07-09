# megabyte-web-platform

## Backend de tienda

La tienda usa un backend Node.js sin frameworks para proteger la administracion de productos.

```bash
npm start
```

URL local:

```text
http://127.0.0.1:8130
```

Panel administrador:

```text
http://127.0.0.1:8130/tienda-admin.html
```

La contrasena por defecto del panel administrador es:

```text
MegabyteAdmin2026!
```

En produccion se debe cambiar con una variable de entorno:

```bash
ADMIN_PASSWORD="una-contrasena-segura" npm start
```

Los productos se guardan en:

```text
data/products.json
```
Desarrollo de una plataforma web responsive para Megabyte MB con sistema de seguimiento de servicios técnicos, gestión de clientes, catálogo tecnológico e integración con herramientas digitales.
