<?php
declare(strict_types=1);

const MB_ADMIN_USER = 'admin';
const MB_ADMIN_PASSWORD = 'MegabyteAdmin2026!';
const MB_PRODUCTS_FILE = __DIR__ . '/../data/products.json';
const MB_DEFAULT_PRODUCTS_FILE = __DIR__ . '/../data/default-products.json';

function mb_start_admin_session(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_name('megabyte_admin');
        session_start();
    }
}

function mb_is_admin(): bool
{
    mb_start_admin_session();
    return !empty($_SESSION['mb_admin']);
}

function mb_require_admin(): void
{
    if (!mb_is_admin()) {
        mb_json(['error' => 'No autorizado'], 401);
    }
}

function mb_login(string $username, string $password): bool
{
    mb_start_admin_session();
    $validUser = hash_equals(MB_ADMIN_USER, trim($username));
    $validPassword = hash_equals(MB_ADMIN_PASSWORD, $password);

    if ($validUser && $validPassword) {
        session_regenerate_id(true);
        $_SESSION['mb_admin'] = true;
        $_SESSION['mb_admin_user'] = MB_ADMIN_USER;
        return true;
    }

    return false;
}

function mb_logout(): void
{
    mb_start_admin_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool) $params['secure'], (bool) $params['httponly']);
    }
    session_destroy();
}

function mb_json(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function mb_read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        mb_json(['error' => 'JSON invalido'], 400);
    }

    return $data;
}

function mb_slugify(string $value): string
{
    $value = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) ?: $value;
    $value = strtolower($value);
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?: '';
    $value = trim($value, '-');
    return $value !== '' ? $value : 'producto-' . time();
}

function mb_normalize_product(array $product): array
{
    $categories = ['computadores', 'accesorios', 'componentes', 'redes', 'seguridad', 'software'];
    $imageTypes = ['laptop', 'desktop', 'audio', 'camera', 'drive', 'router'];
    $price = max(0, (int) ($product['price'] ?? 0));
    $oldPrice = max($price, (int) ($product['oldPrice'] ?? $price));
    $discount = $oldPrice > $price ? (int) round((($oldPrice - $price) / $oldPrice) * 100) : max(0, (int) ($product['discount'] ?? 0));
    $specs = $product['specs'] ?? [];

    if (!is_array($specs)) {
        $specs = array_filter(array_map('trim', preg_split('/\R/', (string) $specs) ?: []));
    }

    $name = trim((string) ($product['name'] ?? 'Producto sin nombre'));
    $category = (string) ($product['category'] ?? 'computadores');
    $imageType = (string) ($product['imageType'] ?? 'laptop');

    return [
        'id' => (string) ($product['id'] ?? mb_slugify($name)),
        'name' => $name,
        'brand' => trim((string) ($product['brand'] ?? 'Megabyte')),
        'category' => in_array($category, $categories, true) ? $category : 'computadores',
        'price' => $price,
        'oldPrice' => $oldPrice,
        'discount' => $discount,
        'stock' => max(0, (int) ($product['stock'] ?? 0)),
        'rating' => min(5, max(0, (float) ($product['rating'] ?? 4.8))),
        'badge' => trim((string) ($product['badge'] ?? 'Disponible')),
        'imageType' => in_array($imageType, $imageTypes, true) ? $imageType : 'laptop',
        'shortDescription' => trim((string) ($product['shortDescription'] ?? 'Producto disponible en Megabyte Store.')),
        'description' => trim((string) ($product['description'] ?? ($product['shortDescription'] ?? 'Producto disponible en Megabyte Store.'))),
        'specs' => array_values(array_map('strval', $specs)),
        'warranty' => trim((string) ($product['warranty'] ?? 'Garantia segun disponibilidad y condiciones del producto.')),
        'availability' => trim((string) ($product['availability'] ?? (((int) ($product['stock'] ?? 0)) > 0 ? 'Disponible' : 'Agotado'))),
    ];
}

function mb_ensure_products_file(): void
{
    $dir = dirname(MB_PRODUCTS_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    if (!file_exists(MB_PRODUCTS_FILE) && file_exists(MB_DEFAULT_PRODUCTS_FILE)) {
        copy(MB_DEFAULT_PRODUCTS_FILE, MB_PRODUCTS_FILE);
    }
}

function mb_get_products(): array
{
    mb_ensure_products_file();
    $json = file_get_contents(MB_PRODUCTS_FILE);
    $products = json_decode($json ?: '[]', true);
    if (!is_array($products)) {
        return [];
    }
    return array_map('mb_normalize_product', $products);
}

function mb_save_products(array $products): void
{
    mb_ensure_products_file();
    $normalized = array_map('mb_normalize_product', $products);
    file_put_contents(MB_PRODUCTS_FILE, json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL, LOCK_EX);
}
