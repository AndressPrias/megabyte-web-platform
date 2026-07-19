<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

function mb_public_image_exists(string $url): bool
{
    if ($url === '' || preg_match('#^https?://#i', $url) === 1) {
        return $url !== '';
    }

    $filename = mb_product_image_filename_from_url($url);
    if ($filename === '') {
        return false;
    }

    return is_file(MB_PRODUCT_UPLOAD_DIR . '/' . $filename)
        || is_file(__DIR__ . '/../assets/productos/' . $filename);
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
