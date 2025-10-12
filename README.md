# 💇‍♀️ Salon Booking - Sistema de Agendamento

Sistema completo de agendamento desenvolvido como **microserviço** usando Docker, Node.js, PostgreSQL e Nginx.

**Desenvolvido por:** Michel Ferreira - SRE/DevOps Engineer  
**Email:** mi.apferreira@gmail.com  
**GitHub:** [@miapferreira](https://github.com/miapferreira)  
**LinkedIn:** [Michel Ferreira](https://www.linkedin.com/in/michelapferreira/)

## 🏗️ **Arquitetura do Sistema**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Nginx)       │───▶│   (Node.js)     │───▶│   (PostgreSQL)  │
│   Porta 80      │    │   Porta 3000    │    │   Porta 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **Estrutura do Projeto**

```
salon-booking/
├── frontend/              # Interface do usuário
│   ├── index.html        # Página principal
│   ├── style.css         # Estilos CSS
│   └── script.js         # JavaScript (cliente)
├── backend/              # API REST
│   ├── server.js         # Servidor Node.js
│   └── package.json      # Dependências Node.js
├── database/             # Scripts de banco
│   └── init.sql          # Inicialização PostgreSQL
├── Dockerfile            # Imagem do backend
├── docker-compose.yml    # Orquestração de containers
├── nginx.conf           # Configuração Nginx
└── README.md            # Este arquivo
```

## 🚀 **Como Executar**

### **Pré-requisitos:**
- Docker instalado
- Docker Compose instalado

### **Comandos:**

1. **Construir e executar todos os serviços:**
```bash
docker-compose up --build
```

2. **Executar em background:**
```bash
docker-compose up -d --build
```

3. **Parar todos os serviços:**
```bash
docker-compose down
```

4. **Ver logs:**
```bash
docker-compose logs -f
```

### **Acessar o Sistema:**
- **Frontend:** http://localhost:80
- **API:** http://localhost:3000/api
- **Banco de dados:** localhost:5432

## 🔧 **Serviços do Sistema**

### **1. Frontend (Nginx)**
- **Função:** Serve arquivos estáticos (HTML, CSS, JS)
- **Porta:** 80
- **Container:** salon-frontend

### **2. Backend (Node.js)**
- **Função:** API REST para gerenciar agendamentos
- **Porta:** 3000
- **Container:** salon-backend
- **Endpoints:**
  - `GET /api/health` - Status do servidor
  - `GET /api/agendamentos` - Lista todos os agendamentos
  - `POST /api/agendamentos` - Cria novo agendamento
  - `GET /api/agendamentos/:data` - Agendamentos por data
  - `DELETE /api/agendamentos/:id` - Remove agendamento

### **3. Database (PostgreSQL)**
- **Função:** Armazena dados dos agendamentos
- **Porta:** 5432
- **Container:** salon-database
- **Credenciais:**
  - Database: salon_booking
  - User: postgres
  - Password: password123

## 📊 **Tabela do Banco**

```sql
CREATE TABLE agendamentos (
    id SERIAL PRIMARY KEY,
    nome_cliente VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    servico VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ **Desenvolvimento**

### **Modo Desenvolvimento:**
```bash
# Backend com hot reload
cd backend
npm install
npm run dev

# Frontend (servir arquivos estáticos)
cd frontend
# Abrir index.html no navegador
```

### **Variáveis de Ambiente:**
Crie um arquivo `.env` na raiz:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=salon_booking
DB_USER=postgres
DB_PASSWORD=password123
NODE_ENV=development
```

## 🐳 **Comandos Docker Úteis**

```bash
# Ver containers rodando
docker ps

# Entrar no container do backend
docker exec -it salon-backend sh

# Ver logs de um serviço específico
docker-compose logs backend

# Reconstruir apenas um serviço
docker-compose up --build backend

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v
```

## 📈 **Próximos Passos**

- [ ] Adicionar autenticação
- [ ] Implementar cache Redis
- [ ] Adicionar testes automatizados
- [ ] Configurar CI/CD
- [ ] Adicionar monitoramento
- [ ] Implementar backup automático

## 🆘 **Solução de Problemas**

### **Erro: Porta já em uso**
```bash
# Verificar o que está usando a porta
lsof -i :80
lsof -i :3000
lsof -i :5432

# Parar serviços conflitantes
docker-compose down
```

### **Erro: Banco não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose logs database

# Reiniciar apenas o banco
docker-compose restart database
```

### **Erro: Frontend não carrega**
```bash
# Verificar se Nginx está servindo arquivos
docker-compose logs frontend

# Verificar arquivos do frontend
docker exec -it salon-frontend ls -la /usr/share/nginx/html
```

## 📝 **Logs e Debug**

```bash
# Ver todos os logs
docker-compose logs

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f database
docker-compose logs -f frontend
```

---

**Desenvolvido como exemplo de microserviço com Docker** 🐳

