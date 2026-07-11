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

mb_json(['error' => 'Ruta no encontrada'], 404);
