/**
 * Servidor Node.js para Salon Booking
 * Este é o backend que vai rodar como microserviço
 * Desenvolvido por: Michel Ferreira - SRE/DevOps Engineer
 * Email: mi.apferreira@gmail.com
 * GitHub: https://github.com/miapferreira
 * LinkedIn: https://www.linkedin.com/in/michelapferreira/
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
require('dotenv').config();

// Cria a aplicação Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - são funções que executam antes das rotas
app.use(cors()); // Permite requisições de outros domínios
app.use(bodyParser.json()); // Converte JSON para objeto JavaScript
app.use(express.static('./public')); // Serve arquivos estáticos do frontend

// Configuração da base de dados PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'salon_booking',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Rota para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota para criar um novo agendamento
app.post('/api/agendamentos', async (req, res) => {
    try {
        const { nomeCliente, telefone, data, horario, servico } = req.body;
        
        // Validação básica
        if (!nomeCliente || !telefone || !data || !horario || !servico) {
            return res.status(400).json({ 
                error: 'Todos os campos são obrigatórios' 
            });
        }
        
        // Verifica se já existe agendamento no mesmo horário
        const conflitoQuery = `
            SELECT id FROM agendamentos 
            WHERE data = $1 AND horario = $2
        `;
        const conflitoResult = await pool.query(conflitoQuery, [data, horario]);
        
        if (conflitoResult.rows.length > 0) {
            return res.status(409).json({ 
                error: 'Já existe um agendamento neste horário' 
            });
        }
        
        // Insere o novo agendamento
        const insertQuery = `
            INSERT INTO agendamentos (nome_cliente, telefone, data, horario, servico)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        
        const result = await pool.query(insertQuery, [
            nomeCliente, telefone, data, horario, servico
        ]);
        
        res.status(201).json({
            message: 'Agendamento criado com sucesso',
            agendamento: result.rows[0]
        });
        
    } catch (error) {
        console.error('Erro ao criar agendamento:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor' 
        });
    }
});

// Rota para listar todos os agendamentos
app.get('/api/agendamentos', async (req, res) => {
    try {
        const query = `
            SELECT id, nome_cliente, telefone, data, horario, servico, 
                   created_at
            FROM agendamentos 
            ORDER BY data ASC, horario ASC
        `;
        
        const result = await pool.query(query);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor' 
        });
    }
});

// Rota para buscar agendamentos por data
app.get('/api/agendamentos/:data', async (req, res) => {
    try {
        const { data } = req.params;
        
        const query = `
            SELECT id, nome_cliente, telefone, data, horario, servico
            FROM agendamentos 
            WHERE data = $1
            ORDER BY horario ASC
        `;
        
        const result = await pool.query(query, [data]);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Erro ao buscar agendamentos por data:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor' 
        });
    }
});

// Rota para remover um agendamento
app.delete('/api/agendamentos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'DELETE FROM agendamentos WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({ 
                error: 'Agendamento não encontrado' 
            });
        }
        
        res.json({ 
            message: 'Agendamento removido com sucesso' 
        });
        
    } catch (error) {
        console.error('Erro ao remover agendamento:', error);
        res.status(500).json({ 
            error: 'Erro interno do servidor' 
        });
    }
});

// Inicia o servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('Erro não tratado:', err);
    process.exit(1);
});

