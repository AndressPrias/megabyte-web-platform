<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($action === 'login' && $method === 'POST') {
    $data = mb_read_json_body();
    if (mb_login((string) ($data['username'] ?? ''), (string) ($data['password'] ?? ''))) {
        mb_json(['ok' => true, 'role' => 'admin', 'token' => 'session']);
    }
    mb_json(['error' => 'Usuario o contraseña incorrectos'], 401);
}

if ($action === 'logout' && $method === 'POST') {
    mb_logout();
    mb_json(['ok' => true]);
}

if ($action === 'me') {
    mb_require_admin();
    mb_json(['ok' => true, 'role' => 'admin']);
}

mb_require_admin();

if ($action === 'products' && $method === 'POST') {
    $product = mb_normalize_product(mb_read_json_body());
    $products = mb_get_products();
    $baseId = $product['id'];
    $id = $baseId;
    $suffix = 2;
    while (array_filter($products, fn ($item) => ($item['id'] ?? '') === $id)) {
        $id = $baseId . '-' . $suffix;
        $suffix++;
    }
    $product['id'] = $id;
    array_unshift($products, $product);
    mb_save_products($products);
    mb_json(['product' => $product, 'products' => $products], 201);
}

if ($action === 'product' && $method === 'PUT') {
    $id = (string) ($_GET['id'] ?? '');
    $products = mb_get_products();
    $index = array_search($id, array_column($products, 'id'), true);
    if ($index === false) {
        mb_json(['error' => 'Producto no encontrado'], 404);
    }
    $products[$index] = mb_normalize_product(array_merge(mb_read_json_body(), ['id' => $id]));
    mb_save_products($products);
    mb_json(['product' => $products[$index], 'products' => $products]);
}

if ($action === 'product' && $method === 'DELETE') {
    $id = (string) ($_GET['id'] ?? '');
    $products = array_values(array_filter(mb_get_products(), fn ($item) => ($item['id'] ?? '') !== $id));
    mb_save_products($products);
    mb_json(['products' => $products]);
}

if ($action === 'restore' && $method === 'POST') {
    $defaults = json_decode(file_get_contents(MB_DEFAULT_PRODUCTS_FILE) ?: '[]', true);
    mb_save_products(is_array($defaults) ? $defaults : []);
    mb_json(['products' => mb_get_products()]);
}

if ($action === 'upload-image' && $method === 'POST') {
    if (empty($_FILES['image']) || !is_array($_FILES['image'])) {
        mb_json(['error' => 'Selecciona una imagen para subir'], 400);
    }

    $file = $_FILES['image'];
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        mb_json(['error' => 'No se pudo subir la imagen'], 400);
    }

    if (($file['size'] ?? 0) > 4 * 1024 * 1024) {
        mb_json(['error' => 'La imagen no debe superar 4 MB'], 400);
    }

    $tmpName = (string) ($file['tmp_name'] ?? '');
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmpName) ?: '';
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    if (!isset($extensions[$mime])) {
        mb_json(['error' => 'Usa una imagen JPG, PNG, WEBP o GIF'], 400);
    }

    if (!is_dir(MB_PRODUCT_UPLOAD_DIR) && !mkdir(MB_PRODUCT_UPLOAD_DIR, 0775, true)) {
        mb_json(['error' => 'No se pudo preparar la carpeta de imagenes'], 500);
    }

    $baseName = mb_slugify(pathinfo((string) ($file['name'] ?? 'producto'), PATHINFO_FILENAME));
    $filename = $baseName . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(3)) . '.' . $extensions[$mime];
    $target = MB_PRODUCT_UPLOAD_DIR . '/' . $filename;

    if (!move_uploaded_file($tmpName, $target)) {
        mb_json(['error' => 'No se pudo guardar la imagen'], 500);
    }

    mb_json([
        'ok' => true,
        'imageUrl' => MB_PRODUCT_UPLOAD_URL . '/' . $filename,
    ], 201);
}

mb_json(['error' => 'Ruta no encontrada'], 404);
