<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

$products = array_values(array_filter(
    mb_get_products(),
    static fn (array $product): bool => ($product['isPublished'] ?? true) !== false
));

mb_json(['products' => $products]);
