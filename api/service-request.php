<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/tracking-config.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method !== 'POST') {
    mb_json(['error' => 'Metodo no permitido'], 405);
}

$data = mb_read_json_body();
$honeypot = trim((string) ($data['website'] ?? ''));
if ($honeypot !== '') {
    mb_json(['error' => 'Solicitud no valida'], 400);
}

$name = trim((string) ($data['nombre'] ?? $data['name'] ?? ''));
$email = trim((string) ($data['email'] ?? $data['correo'] ?? ''));
$phone = mb_normalize_phone((string) ($data['telefono'] ?? $data['phone'] ?? ''));
$service = trim((string) ($data['servicio'] ?? $data['service'] ?? 'Servicio tecnico'));
$message = trim((string) ($data['mensaje'] ?? $data['message'] ?? ''));

if ($name === '' || $phone === '' || $service === '') {
    mb_json(['error' => 'Completa nombre, telefono y servicio'], 400);
}

$ticketId = mb_next_ticket_id();
while (mb_find_ticket($ticketId, null) !== null) {
    $ticketId = mb_next_ticket_id();
}

$today = date('Y-m-d');
$estimatedDate = date('Y-m-d', strtotime('+3 weekdays') ?: time());
$details = array_filter([
    "Servicio solicitado: {$service}",
    $email !== '' ? "Correo: {$email}" : '',
    $message !== '' ? "Mensaje del cliente: {$message}" : '',
]);

$ticket = mb_upsert_ticket([
    'ticket' => $ticketId,
    'cliente' => $name,
    'telefono' => $phone,
    'servicio' => $service,
    'estado' => 'Recibido',
    'fechaIngreso' => $today,
    'tecnico' => 'Equipo Megabyte',
    'observaciones' => implode("\n", $details) ?: 'Solicitud recibida desde la web.',
    'fechaEstimada' => $estimatedDate,
    'historial' => [
        [
            'fecha' => $today,
            'texto' => 'Solicitud creada desde el formulario web.',
        ],
        [
            'fecha' => $today,
            'texto' => "Servicio solicitado: {$service}.",
        ],
    ],
]);

mb_json(['ticket' => $ticket], 201);
