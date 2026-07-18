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

if ($action === 'products' && $method === 'GET') {
    mb_json(['products' => mb_get_products()]);
}

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
    $files = [];
    $inputFiles = $_FILES['images'] ?? $_FILES['image'] ?? null;

    if (empty($inputFiles) || !is_array($inputFiles)) {
        mb_json(['error' => 'Selecciona una imagen para subir'], 400);
    }

    if (is_array($inputFiles['name'] ?? null)) {
        foreach ($inputFiles['name'] as $index => $name) {
            $files[] = [
                'name' => $name,
                'type' => $inputFiles['type'][$index] ?? '',
                'tmp_name' => $inputFiles['tmp_name'][$index] ?? '',
                'error' => $inputFiles['error'][$index] ?? UPLOAD_ERR_NO_FILE,
                'size' => $inputFiles['size'][$index] ?? 0,
            ];
        }
    } else {
        $files[] = $inputFiles;
    }

    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];

    if (!is_dir(MB_PRODUCT_UPLOAD_DIR) && !mkdir(MB_PRODUCT_UPLOAD_DIR, 0775, true)) {
        mb_json(['error' => 'No se pudo preparar la carpeta de imagenes'], 500);
    }

    $detectMime = static function (string $path): string {
        if (class_exists('finfo')) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            return $finfo->file($path) ?: '';
        }

        if (function_exists('mime_content_type')) {
            return mime_content_type($path) ?: '';
        }

        $imageInfo = @getimagesize($path);
        return is_array($imageInfo) ? (string) ($imageInfo['mime'] ?? '') : '';
    };

    $imageUrls = [];

    foreach ($files as $file) {
        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            mb_json(['error' => 'No se pudo subir una de las imagenes'], 400);
        }

        if (($file['size'] ?? 0) > 4 * 1024 * 1024) {
            mb_json(['error' => 'Cada imagen debe pesar maximo 4 MB'], 400);
        }

        $tmpName = (string) ($file['tmp_name'] ?? '');
        $mime = $detectMime($tmpName);
        $extension = $extensions[$mime] ?? strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));

        if (!in_array($extension, $extensions, true)) {
            mb_json(['error' => 'Usa imagenes JPG, PNG, WEBP o GIF'], 400);
        }

        $baseName = mb_slugify(pathinfo((string) ($file['name'] ?? 'producto'), PATHINFO_FILENAME));
        $filename = $baseName . '-' . date('YmdHis') . '-' . bin2hex(random_bytes(3)) . '.' . $extension;
        $target = MB_PRODUCT_UPLOAD_DIR . '/' . $filename;

        if (!move_uploaded_file($tmpName, $target)) {
            mb_json(['error' => 'No se pudo guardar una de las imagenes'], 500);
        }

        $imageUrls[] = MB_PRODUCT_UPLOAD_URL . '/' . $filename;
    }

    mb_json([
        'ok' => true,
        'imageUrl' => $imageUrls[0] ?? '',
        'imageUrls' => $imageUrls,
    ], 201);
}

mb_json(['error' => 'Ruta no encontrada'], 404);
