<?php
declare(strict_types=1);

const MB_ADMIN_USER = 'admin';
const MB_ADMIN_PASSWORD = 'MegabyteAdmin2026!';
const MB_PRODUCTS_FILE = __DIR__ . '/../data/products.json';
const MB_DEFAULT_PRODUCTS_FILE = __DIR__ . '/../data/default-products.json';
const MB_PRODUCT_UPLOAD_DIR = __DIR__ . '/../assets/productos';
const MB_PRODUCT_UPLOAD_URL = '/assets/productos';
const MB_DB_DSN = 'mysql:host=localhost;dbname=u184620198_megastore;charset=utf8mb4';
const MB_DB_USER = 'u184620198_storeadmin';
const MB_DB_PASSWORD = 'MegaStore2026!';

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
    $imageUrl = trim((string) ($product['imageUrl'] ?? ''));

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
        'imageUrl' => mb_sanitize_product_image_url($imageUrl),
        'shortDescription' => trim((string) ($product['shortDescription'] ?? 'Producto disponible en Megabyte Store.')),
        'description' => trim((string) ($product['description'] ?? ($product['shortDescription'] ?? 'Producto disponible en Megabyte Store.'))),
        'specs' => array_values(array_map('strval', $specs)),
        'warranty' => trim((string) ($product['warranty'] ?? 'Garantia segun disponibilidad y condiciones del producto.')),
        'availability' => trim((string) ($product['availability'] ?? (((int) ($product['stock'] ?? 0)) > 0 ? 'Disponible' : 'Agotado'))),
    ];
}

function mb_sanitize_product_image_url(string $url): string
{
    if ($url === '') {
        return '';
    }

    if (preg_match('#^https?://#i', $url) === 1 || str_starts_with($url, MB_PRODUCT_UPLOAD_URL . '/')) {
        return $url;
    }

    return '';
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

function mb_db(): ?PDO
{
    static $pdo = null;
    static $checked = false;

    if ($checked) {
        return $pdo;
    }

    $checked = true;
    if (MB_DB_DSN === '' || !class_exists(PDO::class)) {
        return null;
    }

    try {
        $pdo = new PDO(MB_DB_DSN, MB_DB_USER, MB_DB_PASSWORD, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        mb_ensure_products_table($pdo);
    } catch (Throwable $error) {
        error_log('Megabyte DB unavailable: ' . $error->getMessage());
        $pdo = null;
    }

    return $pdo;
}

function mb_ensure_products_table(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS products (
            id VARCHAR(160) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            brand VARCHAR(160) NOT NULL,
            category VARCHAR(80) NOT NULL,
            price INT NOT NULL DEFAULT 0,
            oldPrice INT NOT NULL DEFAULT 0,
            discount INT NOT NULL DEFAULT 0,
            stock INT NOT NULL DEFAULT 0,
            rating DECIMAL(3,1) NOT NULL DEFAULT 4.8,
            badge VARCHAR(120) NOT NULL DEFAULT 'Disponible',
            imageType VARCHAR(80) NOT NULL DEFAULT 'laptop',
            imageUrl VARCHAR(500) NOT NULL DEFAULT '',
            shortDescription TEXT,
            description TEXT,
            specs TEXT,
            warranty TEXT,
            availability VARCHAR(160) NOT NULL DEFAULT 'Disponible',
            sortOrder INT NOT NULL DEFAULT 0,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    );
    mb_ensure_products_column($pdo, 'imageUrl', "VARCHAR(500) NOT NULL DEFAULT ''");
}

function mb_ensure_products_column(PDO $pdo, string $column, string $definition): void
{
    try {
        $statement = $pdo->prepare(
            'SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column'
        );
        $statement->execute([':table' => 'products', ':column' => $column]);
        if ((int) $statement->fetchColumn() === 0) {
            $pdo->exec("ALTER TABLE products ADD COLUMN {$column} {$definition}");
        }
    } catch (Throwable $error) {
        error_log('Megabyte DB column check failed: ' . $error->getMessage());
    }
}

function mb_products_from_db(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM products ORDER BY sortOrder ASC, name ASC')->fetchAll();
    return array_map(static function (array $row): array {
        $row['oldPrice'] = $row['oldPrice'] ?? $row['oldprice'] ?? $row['price'];
        $row['imageType'] = $row['imageType'] ?? $row['imagetype'] ?? 'laptop';
        $row['imageUrl'] = $row['imageUrl'] ?? $row['imageurl'] ?? '';
        $row['shortDescription'] = $row['shortDescription'] ?? $row['shortdescription'] ?? '';
        $row['specs'] = json_decode((string) ($row['specs'] ?? '[]'), true) ?: [];
        return mb_normalize_product($row);
    }, $rows);
}

function mb_save_products_to_db(PDO $pdo, array $products): void
{
    $normalized = array_map('mb_normalize_product', $products);
    $pdo->beginTransaction();
    try {
        $pdo->exec('DELETE FROM products');
        $statement = $pdo->prepare(
            'INSERT INTO products (
                id, name, brand, category, price, oldPrice, discount, stock, rating, badge,
                imageType, imageUrl, shortDescription, description, specs, warranty, availability, sortOrder
            ) VALUES (
                :id, :name, :brand, :category, :price, :oldPrice, :discount, :stock, :rating, :badge,
                :imageType, :imageUrl, :shortDescription, :description, :specs, :warranty, :availability, :sortOrder
            )'
        );

        foreach ($normalized as $index => $product) {
            $statement->execute([
                ':id' => $product['id'],
                ':name' => $product['name'],
                ':brand' => $product['brand'],
                ':category' => $product['category'],
                ':price' => $product['price'],
                ':oldPrice' => $product['oldPrice'],
                ':discount' => $product['discount'],
                ':stock' => $product['stock'],
                ':rating' => $product['rating'],
                ':badge' => $product['badge'],
                ':imageType' => $product['imageType'],
                ':imageUrl' => $product['imageUrl'],
                ':shortDescription' => $product['shortDescription'],
                ':description' => $product['description'],
                ':specs' => json_encode($product['specs'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                ':warranty' => $product['warranty'],
                ':availability' => $product['availability'],
                ':sortOrder' => $index,
            ]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}

function mb_get_products(): array
{
    $pdo = mb_db();
    if ($pdo instanceof PDO) {
        return mb_products_from_db($pdo);
    }

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
    $pdo = mb_db();
    if ($pdo instanceof PDO) {
        mb_save_products_to_db($pdo, $products);
        return;
    }

    mb_ensure_products_file();
    $normalized = array_map('mb_normalize_product', $products);
    file_put_contents(MB_PRODUCTS_FILE, json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL, LOCK_EX);
}
