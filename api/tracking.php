<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/tracking-config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET' && $method !== 'POST') {
    mb_json(['error' => 'Metodo no permitido'], 405);
}

$data = $method === 'POST' ? mb_read_json_body() : $_GET;
$ticketId = (string) ($data['ticket'] ?? $data['ticketId'] ?? '');
$phone = (string) ($data['phone'] ?? $data['telefono'] ?? '');

if (trim($ticketId) === '' && mb_normalize_phone($phone) === '') {
    mb_json(['error' => 'Ingresa tu ticket o celular registrado'], 400);
}

$ticket = mb_find_ticket($ticketId, $phone);
if (!$ticket) {
    mb_json(['error' => 'Servicio no encontrado'], 404);
}

mb_json(['ticket' => $ticket]);
