<?php
declare(strict_types=1);

require_once __DIR__ . '/store-config.php';

const MB_TICKETS_FILE = __DIR__ . '/../data/tickets.json';
const MB_DEFAULT_TICKETS_FILE = __DIR__ . '/../data/default-tickets.json';

function mb_normalize_phone(string $phone): string
{
    return preg_replace('/\D+/', '', $phone) ?: '';
}

function mb_phone_matches(string $storedPhone, string $queryPhone): bool
{
    $stored = mb_normalize_phone($storedPhone);
    $query = mb_normalize_phone($queryPhone);

    if ($stored === '' || $query === '') {
        return false;
    }

    if ($stored === $query) {
        return true;
    }

    $storedLocal = strlen($stored) > 10 ? substr($stored, -10) : $stored;
    $queryLocal = strlen($query) > 10 ? substr($query, -10) : $query;

    if (strlen($storedLocal) >= 7 && strlen($queryLocal) >= 7 && $storedLocal === $queryLocal) {
        return true;
    }

    return strlen($query) >= 7 && str_ends_with($stored, $query);
}

function mb_tracking_statuses(): array
{
    return [
        'Recibido',
        'En diagnostico',
        'Esperando repuesto',
        'En reparacion',
        'En pruebas',
        'Listo para entrega',
        'Entregado',
    ];
}

function mb_normalize_ticket(array $ticket): array
{
    $status = trim((string) ($ticket['estado'] ?? 'Recibido'));
    if (!in_array($status, mb_tracking_statuses(), true)) {
        $status = 'Recibido';
    }

    $history = $ticket['historial'] ?? [];
    if (!is_array($history)) {
        $history = [];
    }

    $normalizedHistory = [];
    foreach ($history as $item) {
        if (!is_array($item)) {
            continue;
        }

        $text = trim((string) ($item['texto'] ?? ''));
        if ($text === '') {
            continue;
        }

        $normalizedHistory[] = [
            'fecha' => mb_normalize_date((string) ($item['fecha'] ?? date('Y-m-d'))),
            'texto' => $text,
        ];
    }

    $ticketId = strtoupper(trim((string) ($ticket['ticket'] ?? '')));
    if ($ticketId === '') {
        $ticketId = mb_next_ticket_id();
    }

    return [
        'ticket' => $ticketId,
        'cliente' => trim((string) ($ticket['cliente'] ?? 'Cliente')),
        'telefono' => mb_normalize_phone((string) ($ticket['telefono'] ?? '')),
        'servicio' => trim((string) ($ticket['servicio'] ?? 'Servicio tecnico')),
        'estado' => $status,
        'fechaIngreso' => mb_normalize_date((string) ($ticket['fechaIngreso'] ?? date('Y-m-d'))),
        'tecnico' => trim((string) ($ticket['tecnico'] ?? 'Equipo Megabyte')),
        'observaciones' => trim((string) ($ticket['observaciones'] ?? 'Servicio registrado en Megabyte.')),
        'fechaEstimada' => mb_normalize_date((string) ($ticket['fechaEstimada'] ?? date('Y-m-d'))),
        'historial' => $normalizedHistory,
    ];
}

function mb_normalize_date(string $date): string
{
    $value = trim($date);
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1) {
        return $value;
    }

    return date('Y-m-d');
}

function mb_next_ticket_id(): string
{
    return 'MB-' . date('Y') . '-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT);
}

function mb_ensure_tickets_file(): void
{
    $dir = dirname(MB_TICKETS_FILE);
    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    if (!file_exists(MB_TICKETS_FILE) && file_exists(MB_DEFAULT_TICKETS_FILE)) {
        copy(MB_DEFAULT_TICKETS_FILE, MB_TICKETS_FILE);
    }
}

function mb_ensure_tracking_tables(PDO $pdo): void
{
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS service_tickets (
            ticket VARCHAR(60) PRIMARY KEY,
            cliente VARCHAR(180) NOT NULL,
            telefono VARCHAR(40) NOT NULL,
            servicio VARCHAR(180) NOT NULL DEFAULT 'Servicio tecnico',
            estado VARCHAR(80) NOT NULL DEFAULT 'Recibido',
            fechaIngreso DATE NOT NULL,
            tecnico VARCHAR(160) NOT NULL,
            observaciones TEXT,
            fechaEstimada DATE NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_service_tickets_phone (telefono),
            INDEX idx_service_tickets_status (estado)
        )"
    );

    mb_ensure_tracking_column($pdo, 'service_tickets', 'servicio', "VARCHAR(180) NOT NULL DEFAULT 'Servicio tecnico'");

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS service_ticket_history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket VARCHAR(60) NOT NULL,
            fecha DATE NOT NULL,
            texto TEXT NOT NULL,
            sortOrder INT NOT NULL DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_service_history_ticket (ticket),
            CONSTRAINT fk_service_history_ticket
                FOREIGN KEY (ticket) REFERENCES service_tickets(ticket)
                ON DELETE CASCADE
        )"
    );
}

function mb_ensure_tracking_column(PDO $pdo, string $table, string $column, string $definition): void
{
    $statement = $pdo->prepare(
        'SELECT COUNT(*)
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = :table
           AND COLUMN_NAME = :column'
    );
    $statement->execute([
        ':table' => $table,
        ':column' => $column,
    ]);

    if ((int) $statement->fetchColumn() === 0) {
        $pdo->exec("ALTER TABLE {$table} ADD {$column} {$definition}");
    }
}

function mb_tracking_db(): ?PDO
{
    $pdo = mb_db();
    if (!$pdo instanceof PDO) {
        return null;
    }

    mb_ensure_tracking_tables($pdo);
    return $pdo;
}

function mb_tickets_from_db(PDO $pdo): array
{
    $tickets = $pdo->query('SELECT * FROM service_tickets ORDER BY createdAt DESC, ticket DESC')->fetchAll();
    if (!$tickets) {
        return [];
    }

    $historyStatement = $pdo->prepare('SELECT fecha, texto FROM service_ticket_history WHERE ticket = :ticket ORDER BY sortOrder ASC, id ASC');
    return array_map(static function (array $ticket) use ($historyStatement): array {
        $historyStatement->execute([':ticket' => $ticket['ticket']]);
        $ticket['historial'] = $historyStatement->fetchAll();
        $ticket['fechaIngreso'] = (string) ($ticket['fechaIngreso'] ?? $ticket['fechaingreso'] ?? date('Y-m-d'));
        $ticket['fechaEstimada'] = (string) ($ticket['fechaEstimada'] ?? $ticket['fechaestimada'] ?? date('Y-m-d'));
        return mb_normalize_ticket($ticket);
    }, $tickets);
}

function mb_get_tickets(): array
{
    $pdo = mb_tracking_db();
    if ($pdo instanceof PDO) {
        $tickets = mb_tickets_from_db($pdo);
        if ($tickets) {
            return $tickets;
        }
    }

    mb_ensure_tickets_file();
    $json = file_get_contents(MB_TICKETS_FILE);
    $tickets = json_decode($json ?: '[]', true);
    if (!is_array($tickets)) {
        return [];
    }

    return array_map('mb_normalize_ticket', $tickets);
}

function mb_save_tickets(array $tickets): void
{
    $normalized = array_map('mb_normalize_ticket', $tickets);
    $pdo = mb_tracking_db();
    if ($pdo instanceof PDO) {
        mb_save_tickets_to_db($pdo, $normalized);
        return;
    }

    mb_ensure_tickets_file();
    file_put_contents(MB_TICKETS_FILE, json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL, LOCK_EX);
}

function mb_save_tickets_to_db(PDO $pdo, array $tickets): void
{
    $pdo->beginTransaction();
    try {
        $pdo->exec('DELETE FROM service_ticket_history');
        $pdo->exec('DELETE FROM service_tickets');

        $ticketStatement = $pdo->prepare(
            'INSERT INTO service_tickets (
                ticket, cliente, telefono, servicio, estado, fechaIngreso, tecnico, observaciones, fechaEstimada
            ) VALUES (
                :ticket, :cliente, :telefono, :servicio, :estado, :fechaIngreso, :tecnico, :observaciones, :fechaEstimada
            )'
        );
        $historyStatement = $pdo->prepare(
            'INSERT INTO service_ticket_history (ticket, fecha, texto, sortOrder)
             VALUES (:ticket, :fecha, :texto, :sortOrder)'
        );

        foreach ($tickets as $ticket) {
            $ticketStatement->execute([
                ':ticket' => $ticket['ticket'],
                ':cliente' => $ticket['cliente'],
                ':telefono' => $ticket['telefono'],
                ':servicio' => $ticket['servicio'],
                ':estado' => $ticket['estado'],
                ':fechaIngreso' => $ticket['fechaIngreso'],
                ':tecnico' => $ticket['tecnico'],
                ':observaciones' => $ticket['observaciones'],
                ':fechaEstimada' => $ticket['fechaEstimada'],
            ]);

            foreach ($ticket['historial'] as $index => $history) {
                $historyStatement->execute([
                    ':ticket' => $ticket['ticket'],
                    ':fecha' => $history['fecha'],
                    ':texto' => $history['texto'],
                    ':sortOrder' => $index,
                ]);
            }
        }

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}

function mb_find_ticket(?string $ticketId, ?string $phone): ?array
{
    $ticketId = strtoupper(preg_replace('/\s+/', '', trim((string) $ticketId)) ?: '');
    $phone = mb_normalize_phone((string) $phone);
    if ($ticketId === '' && $phone === '') {
        return null;
    }

    foreach (mb_get_tickets() as $ticket) {
        $storedTicket = strtoupper(preg_replace('/\s+/', '', (string) $ticket['ticket']) ?: '');
        if ($ticketId !== '' && $storedTicket === $ticketId) {
            return $ticket;
        }

        if ($phone !== '' && mb_phone_matches((string) $ticket['telefono'], $phone)) {
            return $ticket;
        }
    }

    return null;
}

function mb_upsert_ticket(array $incoming): array
{
    $ticket = mb_normalize_ticket($incoming);
    $tickets = mb_get_tickets();
    $index = array_search($ticket['ticket'], array_column($tickets, 'ticket'), true);

    if ($index === false) {
        array_unshift($tickets, $ticket);
    } else {
        $tickets[$index] = $ticket;
    }

    mb_save_tickets($tickets);
    return $ticket;
}

function mb_delete_ticket(string $ticketId): array
{
    $ticketId = strtoupper(trim($ticketId));
    $tickets = array_values(array_filter(
        mb_get_tickets(),
        static fn (array $ticket): bool => strtoupper($ticket['ticket']) !== $ticketId
    ));
    mb_save_tickets($tickets);
    return $tickets;
}
