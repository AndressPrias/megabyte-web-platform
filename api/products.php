<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

function mb_public_image_exists(string $url): bool
{
    if ($url === '' || preg_match('#^https?://#i', $url) === 1) {
        return $url !== '';
    }

    $path = parse_url($url, PHP_URL_PATH);
    if (!is_string($path) || !str_starts_with($path, MB_PRODUCT_UPLOAD_URL . '/')) {
        return false;
    }

    $relative = rawurldecode(substr($path, strlen(MB_PRODUCT_UPLOAD_URL . '/')));
    if ($relative === '' || str_contains($relative, '..') || str_contains($relative, '/') || str_contains($relative, '\\')) {
        return false;
    }

    return is_file(MB_PRODUCT_UPLOAD_DIR . '/' . $relative);
}

function mb_prepare_public_product(array $product): array
{
    $imageUrls = array_values(array_filter(
        $product['imageUrls'] ?? [],
        static fn ($url): bool => mb_public_image_exists((string) $url)
    ));

    $product['imageUrls'] = $imageUrls;
    $product['imageUrl'] = $imageUrls[0] ?? '';

    return $product;
}

$products = array_values(array_filter(
    mb_get_products(),
    static fn (array $product): bool => ($product['isPublished'] ?? true) !== false
));

$products = array_map('mb_prepare_public_product', $products);

mb_json(['products' => $products]);
