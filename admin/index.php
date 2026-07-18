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
  <title>Admin tienda | Megabyte</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700&family=Poppins:wght@300;400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/styles.css?v=site-20260718-8">
  <style>
    .store-admin__login[hidden],
    .store-admin__login[data-rendered='true'][hidden],
    .store-admin.is-authenticated .store-admin__login {
      display: none !important;
    }
  </style>
</head>
<body class="store-body store-admin-page" data-store-page="admin" data-admin-authenticated="false">
  <header class="store-header">
    <div class="container store-header__inner">
      <div class="store-header__top">
        <a href="/" class="store-logo" aria-label="Volver a la landing">
          <img src="/assets/logo-menu-mark.png" alt="Megabyte" width="92" height="62">
        </a>
        <nav class="store-nav store-nav--compact" aria-label="Navegacion administracion">
          <a href="/tienda">Ver tienda</a>
          <a href="/carrito">Carrito</a>
          <a href="/">Salir</a>
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

          <div class="store-admin__workspace" id="adminWorkspace" hidden>
            <nav class="store-admin__tabs" aria-label="Secciones del administrador">
              <button class="is-active" type="button" data-admin-screen-target="create">Crear producto</button>
              <button type="button" data-admin-screen-target="edit">Editar productos</button>
              <button type="button" data-admin-screen-target="tickets">Gestionar tickets</button>
            </nav>

            <section class="store-admin__screen is-active" id="adminCreateScreen" data-admin-screen="create">
              <form class="store-admin__form" id="adminProductForm">
                <input type="hidden" name="productId">
                <input type="hidden" name="imageUrl">
                <input type="hidden" name="imageUrls">
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
                  <label class="store-admin__wide store-admin__image-field">
                    <span>Foto del producto</span>
                    <div class="store-admin__image-upload">
                      <div class="store-admin__image-preview" data-product-image-preview>
                        <span>Sin imagen</span>
                      </div>
                      <div>
                        <input name="productImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple>
                        <small>Arrastra las fotos para ordenar. La primera imagen queda como portada.</small>
                        <button class="btn btn--outline btn--sm" type="button" data-remove-product-image>Quitar fotos</button>
                      </div>
                    </div>
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
                  <label>
                    <span>Publicacion</span>
                    <select name="isPublished" required>
                      <option value="1">Publicado en tienda</option>
                      <option value="0">Pausado / oculto</option>
                    </select>
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
            </section>

            <section class="store-admin__screen" id="adminEditScreen" data-admin-screen="edit" hidden>
              <div class="store-admin__list-panel">
                <div class="store-admin__list-head">
                  <h2>Editar productos</h2>
                  <small>Selecciona un producto para abrirlo en modo edicion.</small>
                </div>
                <div class="store-admin__list" id="adminProductList"></div>
              </div>
            </section>
          </div>

          <section class="store-admin__tracking store-admin__screen" id="adminTrackingWorkspace" data-admin-screen="tickets" hidden>
            <div class="store-admin__head store-admin__head--sub">
              <div>
                <span class="section__tag">Seguimiento</span>
                <h2>Gestion de tickets</h2>
                <p>Actualiza estados, asigna tecnico y deja historial visible para el cliente.</p>
              </div>
              <div class="store-admin__status">
                <strong id="adminTicketTotal">0 tickets</strong>
                <button class="btn btn--outline btn--sm" type="button" data-ticket-restore>Restaurar ejemplo</button>
              </div>
            </div>

            <div class="store-admin__grid store-admin__grid--tickets">
              <form class="store-admin__form" id="adminTicketForm">
                <input type="hidden" name="currentTicket">
                <h2 id="adminTicketFormTitle">Nuevo ticket</h2>

                <div class="store-admin__fields">
                  <label>
                    <span>Ticket</span>
                    <input name="ticket" type="text" placeholder="Se genera automatico">
                  </label>
                  <label>
                    <span>Estado</span>
                    <select name="estado" required>
                      <option value="Recibido">Recibido</option>
                      <option value="En diagnostico">En diagnostico</option>
                      <option value="Esperando repuesto">Esperando repuesto</option>
                      <option value="En reparacion">En reparacion</option>
                      <option value="En pruebas">En pruebas</option>
                      <option value="Listo para entrega">Listo para entrega</option>
                      <option value="Entregado">Entregado</option>
                    </select>
                  </label>
                  <label>
                    <span>Cliente</span>
                    <input name="cliente" type="text" required placeholder="Nombre del cliente">
                  </label>
                  <label>
                    <span>Telefono</span>
                    <input name="telefono" type="tel" required placeholder="320 000 0000">
                  </label>
                  <label>
                    <span>Servicio</span>
                    <input name="servicio" type="text" required placeholder="Reparacion de computadores">
                  </label>
                  <label>
                    <span>Tecnico asignado</span>
                    <input name="tecnico" type="text" required placeholder="Equipo Megabyte">
                  </label>
                  <label>
                    <span>Fecha ingreso</span>
                    <input name="fechaIngreso" type="date" required>
                  </label>
                  <label>
                    <span>Fecha estimada</span>
                    <input name="fechaEstimada" type="date" required>
                  </label>
                  <label class="store-admin__wide">
                    <span>Observaciones</span>
                    <textarea name="observaciones" rows="3" placeholder="Detalle visible para el cliente"></textarea>
                  </label>
                  <label class="store-admin__wide">
                    <span>Historial</span>
                    <textarea name="historial" rows="5" placeholder="2026-07-12 | Ticket creado&#10;2026-07-13 | En diagnostico"></textarea>
                  </label>
                </div>

                <div class="store-admin__actions">
                  <button class="btn btn--primary" type="submit" data-ticket-submit>Guardar ticket</button>
                  <button class="btn btn--outline" type="button" data-ticket-reset>Limpiar</button>
                </div>
              </form>

              <div class="store-admin__list-panel">
                <div class="store-admin__list-head">
                  <h2>Tickets de servicio</h2>
                  <small>Edita el estado para que el cliente pueda consultarlo en seguimiento.</small>
                </div>
                <div class="store-admin__list" id="adminTicketList"></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>

  <script src="/js/store.js?v=tracking-admin-20260718-7"></script>
  <script>
    (() => {
      const polishAdminLogin = () => {
        const loginPanel = document.getElementById('adminLoginPanel');
        const workspace = document.getElementById('adminWorkspace');
        const title = loginPanel?.querySelector('.admin-login__hero h2');

        if (title) {
          title.innerHTML = 'Administracion <span>de productos</span>';
        }

        if (loginPanel && workspace && !workspace.hidden) {
          loginPanel.hidden = true;
          loginPanel.style.setProperty('display', 'none', 'important');
          loginPanel.closest('.store-admin')?.classList.add('is-authenticated');
        }
      };

      document.addEventListener('DOMContentLoaded', () => {
        polishAdminLogin();
        window.setTimeout(polishAdminLogin, 250);
        window.setTimeout(polishAdminLogin, 900);
      });
    })();
  </script>
</body>
</html>
