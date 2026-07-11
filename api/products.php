<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/store-config.php';

mb_json(['products' => mb_get_products()]);
