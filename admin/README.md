# Panel administrativo

Esta carpeta contiene el modulo privado de administracion de tienda.

- `index.php`: interfaz del administrador.
- `api.php`: login, logout, sesion, CRUD de productos, restauracion y subida de imagenes.
- `.htaccess`: configuracion para servir `/admin`.

Depende de:

- `includes/store-config.php`
- `config/database.php`
- `assets/productos/`
