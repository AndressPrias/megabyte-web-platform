CREATE TABLE IF NOT EXISTS products (
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
  shortDescription TEXT,
  description TEXT,
  specs TEXT,
  warranty TEXT,
  availability VARCHAR(160) NOT NULL DEFAULT 'Disponible',
  sortOrder INT NOT NULL DEFAULT 0,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS service_tickets (
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
);

CREATE TABLE IF NOT EXISTS service_ticket_history (
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
);
