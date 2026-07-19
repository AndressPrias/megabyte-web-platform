<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

$filename = mb_product_image_filename_from_url(MB_PRODUCT_IMAGE_API_URL . '?file=' . (string) ($_GET['file'] ?? ''));

if ($filename === '') {
    http_response_code(404);
    exit;
}

$paths = [
    MB_PRODUCT_UPLOAD_DIR . '/' . $filename,
    __DIR__ . '/../assets/productos/' . $filename,
];

$filePath = '';
foreach ($paths as $path) {
    if (is_file($path)) {
        $filePath = $path;
        break;
    }
}

if ($filePath === '') {
    http_response_code(404);
    exit;
}

$extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mimeTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'webp' => 'image/webp',
    'gif' => 'image/gif',
];

header('Content-Type: ' . ($mimeTypes[$extension] ?? 'application/octet-stream'));
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: public, max-age=31536000, immutable');
readfile($filePath);
