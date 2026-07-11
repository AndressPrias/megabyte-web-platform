<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

mb_start_admin_session();
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Admin tienda | Megabyte MB</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700&family=Poppins:wght@300;400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css?v=admin-20260711-5">
</head>
<body class="store-body store-admin-page" data-store-page="admin" data-admin-authenticated="false">
  <header class="store-header">
    <div class="container store-header__inner">
      <div class="store-header__top">
        <a href="/index.html" class="store-logo" aria-label="Volver a la landing">
          <img src="/assets/logo-menu-mark.png" alt="Megabyte MB" width="92" height="62">
        </a>
        <nav class="store-nav store-nav--compact" aria-label="Navegacion administracion">
          <a href="/tienda.html">Ver tienda</a>
          <a href="/carrito.html">Carrito</a>
          <a href="/index.html">Salir</a>
        </nav>
        <div class="store-header__actions">
          <button class="btn btn--outline btn--sm" type="button" data-admin-logout hidden>Cerrar sesion</button>
        </div>
      </div>
    </div>
  </header>

  <main class="store-main">
    <section class="store-section store-section--compact store-admin" id="admin-productos">
      <div class="container">
        <div class="store-admin__shell">
          <div class="store-admin__head">
            <div>
              <span class="section__tag">Panel privado</span>
              <h1>Administracion de productos</h1>
              <p id="adminAccessState">Verificando sesion de administrador.</p>
            </div>
            <div class="store-admin__status">
              <strong id="adminProductTotal">0 productos</strong>
              <button class="btn btn--outline btn--sm" type="button" data-admin-restore>Restaurar ejemplo</button>
              <button class="btn btn--outline btn--sm" type="button" data-admin-logout>Cerrar sesion</button>
            </div>
          </div>

          <div class="store-admin__login" id="adminLoginPanel" data-admin-login-root></div>

          <div class="store-admin__grid" id="adminWorkspace" hidden>
            <form class="store-admin__form" id="adminProductForm">
              <input type="hidden" name="productId">
              <h2 id="adminFormTitle">Nuevo producto</h2>

              <div class="store-admin__fields">
                <label>
                  <span>Nombre</span>
                  <input name="name" type="text" placeholder="Ej: Laptop Lenovo i5" required>
                </label>
                <label>
                  <span>Marca</span>
                  <input name="brand" type="text" placeholder="Ej: Lenovo" required>
                </label>
                <label>
                  <span>Categoria</span>
                  <select name="category" required>
                    <option value="computadores">Computadores</option>
                    <option value="accesorios">Accesorios</option>
                    <option value="componentes">Componentes</option>
                    <option value="redes">Redes</option>
                    <option value="seguridad">Seguridad</option>
                    <option value="software">Software</option>
                  </select>
                </label>
                <label>
                  <span>Imagen / icono</span>
                  <select name="imageType" required>
                    <option value="laptop">Laptop</option>
                    <option value="desktop">PC escritorio</option>
                    <option value="audio">Accesorios</option>
                    <option value="camera">Camara</option>
                    <option value="drive">Disco / SSD</option>
                    <option value="router">Router</option>
                  </select>
                </label>
                <label>
                  <span>Precio actual</span>
                  <input name="price" type="number" min="0" step="1000" placeholder="1450000" required>
                </label>
                <label>
                  <span>Precio anterior</span>
                  <input name="oldPrice" type="number" min="0" step="1000" placeholder="1690000">
                </label>
                <label>
                  <span>Stock</span>
                  <input name="stock" type="number" min="0" value="1" required>
                </label>
                <label>
                  <span>Rating</span>
                  <input name="rating" type="number" min="0" max="5" step="0.1" value="4.8">
                </label>
                <label>
                  <span>Etiqueta</span>
                  <input name="badge" type="text" placeholder="Nuevo">
                </label>
                <label>
                  <span>Disponibilidad</span>
                  <input name="availability" type="text" placeholder="Disponible">
                </label>
                <label class="store-admin__wide">
                  <span>Descripcion corta</span>
                  <textarea name="shortDescription" rows="2" placeholder="Texto breve para la tarjeta del producto"></textarea>
                </label>
                <label class="store-admin__wide">
                  <span>Descripcion completa</span>
                  <textarea name="description" rows="3" placeholder="Informacion detallada del producto"></textarea>
                </label>
                <label class="store-admin__wide">
                  <span>Especificaciones</span>
                  <textarea name="specs" rows="4" placeholder="Una especificacion por linea"></textarea>
                </label>
                <label class="store-admin__wide">
                  <span>Garantia</span>
                  <input name="warranty" type="text" placeholder="Garantia de 90 dias">
                </label>
              </div>

              <div class="store-admin__actions">
                <button class="btn btn--primary" type="submit" data-admin-submit>Agregar producto</button>
                <button class="btn btn--outline" type="button" data-admin-reset>Limpiar</button>
              </div>
            </form>

            <div class="store-admin__list-panel">
              <div class="store-admin__list-head">
                <h2>Productos del catalogo</h2>
                <small>Usa editar para cargar los datos en el formulario.</small>
              </div>
              <div class="store-admin__list" id="adminProductList"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>

  <script src="/js/store.js?v=admin-20260711-2"></script>
</body>
</html>
