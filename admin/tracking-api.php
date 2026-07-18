<?php
declare(strict_types=1);

require_once __DIR__ . '/../includes/tracking-config.php';

$action = $_GET['action'] ?? 'tickets';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

mb_require_admin();

if ($action === 'tickets' && $method === 'GET') {
    mb_json(['tickets' => mb_get_tickets()]);
}

if ($action === 'ticket' && $method === 'GET') {
    $ticketId = (string) ($_GET['id'] ?? '');
    $ticket = mb_find_ticket($ticketId, null);
    if (!$ticket) {
        mb_json(['error' => 'Ticket no encontrado'], 404);
    }

    mb_json(['ticket' => $ticket]);
}

if (($action === 'tickets' || $action === 'ticket') && ($method === 'POST' || $method === 'PUT')) {
    $ticket = mb_upsert_ticket(mb_read_json_body());
    mb_json(['ticket' => $ticket, 'tickets' => mb_get_tickets()], $method === 'POST' ? 201 : 200);
}

if ($action === 'ticket' && $method === 'DELETE') {
    $ticketId = (string) ($_GET['id'] ?? '');
    if (trim($ticketId) === '') {
        mb_json(['error' => 'Ticket requerido'], 400);
    }

    mb_json(['tickets' => mb_delete_ticket($ticketId)]);
}

mb_json(['error' => 'Ruta no encontrada'], 404);
