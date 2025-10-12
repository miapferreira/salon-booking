-- Script de inicialização do banco de dados PostgreSQL
-- Este arquivo cria as tabelas necessárias para o sistema

-- Cria a tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    servico VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_horario ON agendamentos(horario);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos(nome_cliente);

-- Insere alguns dados de exemplo
INSERT INTO agendamentos (nome_cliente, telefone, data, horario, servico) VALUES
('Maria Silva', '(11) 99999-9999', '2024-01-15', '09:00:00', 'Corte de cabelo'),
('João Santos', '(11) 88888-8888', '2024-01-15', '14:30:00', 'Escova'),
('Ana Costa', '(11) 77777-7777', '2024-01-16', '10:00:00', 'Coloração')
ON CONFLICT DO NOTHING;

-- Cria função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Cria trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_agendamentos_updated_at 
    BEFORE UPDATE ON agendamentos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

