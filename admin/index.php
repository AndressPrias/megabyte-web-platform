<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

mb_start_admin_session();

$error = '';

if (isset($_GET['logout'])) {
    mb_logout();
    header('Location: /admin/');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = (string) ($_POST['username'] ?? '');
    $password = (string) ($_POST['password'] ?? '');
    if (mb_login($username, $password)) {
        header('Location: /admin/');
        exit;
    }
    $error = 'Usuario o contraseña incorrectos.';
}

$isAdmin = mb_is_admin();
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
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="store-body store-admin-page" data-store-page="admin" data-admin-authenticated="<?= $isAdmin ? 'true' : 'false' ?>">
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
          <?php if ($isAdmin): ?>
            <a class="btn btn--outline btn--sm" href="/admin/?logout=1">Cerrar sesion</a>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </header>

  <main class="store-main">
    <section class="store-section store-section--compact store-admin <?= $isAdmin ? 'is-authenticated' : '' ?>" id="admin-productos">
      <div class="container">
        <div class="store-admin__shell">
          <div class="store-admin__head">
            <div>
              <span class="section__tag">Panel privado</span>
              <h1>Administracion de productos</h1>
              <p id="adminAccessState"><?= $isAdmin ? 'Sesion de administrador activa.' : 'Ingresa usuario y contraseña para modificar el catalogo.' ?></p>
            </div>
            <?php if ($isAdmin): ?>
              <div class="store-admin__status">
                <strong id="adminProductTotal">0 productos</strong>
                <button class="btn btn--outline btn--sm" type="button" data-admin-restore>Restaurar ejemplo</button>
                <a class="btn btn--outline btn--sm" href="/admin/?logout=1">Cerrar sesion</a>
              </div>
            <?php endif; ?>
          </div>

          <?php if (!$isAdmin): ?>
            <div class="store-admin__login">
              <div class="admin-login__visual" aria-hidden="true">
                <div class="admin-login__visual-glow"></div>
                <img class="admin-login__visual-logo" src="/assets/logo-menu-megabyte.png" alt="">
                <div class="admin-login__device">
                  <span class="admin-login__device-screen">MB</span>
                </div>
                <div class="admin-login__badge-card">
                  <span>
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M6 8h12l-1 11H7L6 8Z"></path>
                      <path d="M9 8a3 3 0 0 1 6 0"></path>
                    </svg>
                  </span>
                  <strong>MEGABYTE</strong>
                  <small>Panel privado</small>
                </div>
              </div>

              <div class="admin-login__panel">
                <div class="admin-login__hero">
                  <span class="admin-login__shield">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M12 3 5 6v5c0 4.6 2.9 8.5 7 10 4.1-1.5 7-5.4 7-10V6l-7-3Z"></path>
                      <path d="M9.5 11V9.5a2.5 2.5 0 0 1 5 0V11"></path>
                      <path d="M9 11h6v5H9z"></path>
                    </svg>
                  </span>
                  <div>
                    <span class="admin-login__eyebrow">Panel privado</span>
                    <h2>Administracion<br><span>de productos</span></h2>
                    <p>Accede al panel privado para gestionar tu catalogo, productos, precios, stock y disponibilidad.</p>
                  </div>
                </div>

                <form method="post" action="/admin/" class="admin-login__card">
                  <div class="admin-login__form-title">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path>
                    </svg>
                    <span>Acceso administrador</span>
                  </div>
                  <?php if ($error): ?>
                    <p class="store-admin__error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p>
                  <?php endif; ?>
                  <label>
                    <span>Usuario</span>
                    <input name="username" type="text" autocomplete="username" placeholder="admin" required>
                  </label>
                  <label>
                    <span>Contrasena</span>
                    <input name="password" type="password" autocomplete="current-password" placeholder="Ingresa tu contrasena" required>
                  </label>
                  <label class="admin-login__remember">
                    <input type="checkbox" checked>
                    <span>Recordarme en este dispositivo</span>
                  </label>
                  <button class="btn btn--primary" type="submit">Iniciar sesion</button>
                  <div class="admin-login__secure">
                    <svg viewBox="0 0 24 24" role="img" aria-hidden="true">
                      <path d="M12 3 5 6v5c0 4.6 2.9 8.5 7 10 4.1-1.5 7-5.4 7-10V6l-7-3Z"></path>
                      <path d="m9 12 2 2 4-5"></path>
                    </svg>
                    <div>
                      <strong>Sesion segura y privada</strong>
                      <small>Acceso exclusivo para administradores autorizados.</small>
                    </div>
                  </div>
                </form>
              </div>

              <div class="admin-login__features" aria-label="Beneficios del panel">
                <span>
                  <strong>Catalogo centralizado</strong>
                  <small>Gestiona tus productos desde un solo lugar.</small>
                </span>
                <span>
                  <strong>Datos en tiempo real</strong>
                  <small>Actualiza stock, precios y disponibilidad.</small>
                </span>
                <span>
                  <strong>Seguridad avanzada</strong>
                  <small>Proteccion de datos y acceso restringido.</small>
                </span>
              </div>
            </div>
          <?php else: ?>
            <div class="store-admin__grid" id="adminWorkspace">
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
          <?php endif; ?>
        </div>
      </div>
    </section>
  </main>

  <?php if ($isAdmin): ?>
    <script src="/js/store.js"></script>
  <?php endif; ?>
</body>
</html>
