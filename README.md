# megabyte-web-platform

Desarrollo de una plataforma web responsive para Megabyte MB con sistema de seguimiento de servicios tecnicos, gestion de clientes, catalogo tecnologico e integracion con herramientas digitales.

## Backend PHP de tienda

La tienda publica lee productos desde:

```text
/api/products.php
```

El panel administrador esta en:

```text
https://www.megabytemb.com.co/admin/
```

En local o staging:

```text
http://localhost/admin/
```

Credenciales por defecto:

```text
Usuario: admin
Contrasena: MegabyteAdmin2026!
```

Para cambiar las credenciales edita:

```text
includes/store-config.php
```

Por defecto, si no configuras base de datos, los productos se guardan en:

```text
data/products.json
```

El archivo `data/default-products.json` se usa para restaurar el catalogo de ejemplo.

Para conectar MySQL, activa `pdo_mysql` en PHP y edita estos valores en `includes/store-config.php`:

```php
const MB_DB_DSN = 'mysql:host=localhost;dbname=megabyte_store;charset=utf8mb4';
const MB_DB_USER = 'usuario_mysql';
const MB_DB_PASSWORD = 'clave_mysql';
```

La tabla de productos esta documentada en:

```text
database/schema.sql
```
