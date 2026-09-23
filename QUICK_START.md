# 🚀 Quick Start - Setup em 5 Minutos

## 📋 Pré-requisitos

- **Node.js** instalado (download: https://nodejs.org)
- **PostgreSQL** instalado e rodando (ou Supabase)

---

## ⚡ Setup Rápido PostgreSQL

### 1️⃣ Clonar/Baixar arquivos

Coloque todos os arquivos em uma pasta:
```
projeto-pncf/
├── Minuta_Oficio_V7_PostgreSQL.html
├── server.js
├── package.json
└── README.md
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Configurar credenciais

**Edite o arquivo `server.js`** (procure por esta parte):

```javascript
const pool = new Pool({
    user: 'seu_usuario_postgres',      // ← SEU USUÁRIO
    host: 'localhost',
    database: 'seu_database_aqui',     // ← SEU DATABASE
    password: 'sua_senha_aqui',        // ← SUA SENHA
    port: 5432,
});
```

Encontre seus dados com:
```bash
# Listar usuários PostgreSQL
psql -U postgres -c "\du"

# Criar um database de teste
createdb seu_database

# Conectar ao database
psql -U seu_usuario -d seu_database
```

### 4️⃣ Iniciar servidor

```bash
npm start
```

Você verá:
```
✅ Servidor rodando em: http://localhost:3000
```

### 5️⃣ Abrir o HTML

- Clique no arquivo `Minuta_Oficio_V7_PostgreSQL.html`
- Ou use **VS Code + Live Server**
- Clique em "🐘 PostgreSQL" no topo
- Está pronto! 🎉

---

## 🔌 Setup Rápido Supabase

Se preferir Supabase, é ainda mais fácil:

### 1️⃣ Criar conta Supabase

- Acesse: https://supabase.com
- Crie uma conta e um projeto

### 2️⃣ Pegar credenciais

- Settings → API
- Copie a **URL** e a **Anon Key**

### 3️⃣ Editar HTML

No `Minuta_Oficio_V7_PostgreSQL.html`, encontre:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',    // ← COLAR URL
    apiKey: 'sua-chave-anonima-aqui',          // ← COLAR CHAVE
    table: 'sua_tabela',
    coluna_filtro: 'id_processo'
};
```

### 4️⃣ Abrir HTML e usar

- Clique em "⚡ Supabase"
- Pronto! 🎉

---

## 🧪 Testar Conexão

### PostgreSQL

```bash
# Verificar se está conectado
curl http://localhost:3000/api/health

# Deve retornar algo como:
# {"status":"ok","timestamp":"2024-01-15T10:30:00Z","postgresql":true}
```

### Banco com dados

```bash
# Conecte ao PostgreSQL
psql -U seu_usuario -d seu_database

# Crie uma tabela de exemplo
CREATE TABLE processos (
    id_processo VARCHAR(50) PRIMARY KEY,
    beneficiario VARCHAR(255),
    total DECIMAL(10,2)
);

# Insira alguns dados
INSERT INTO processos VALUES 
('PROC001', 'João Silva', 500.00),
('PROC002', 'Maria Santos', 750.00);
```

---

## 🎯 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "Cannot find module 'express'" | Execute `npm install` |
| "Erro: ECONNREFUSED 127.0.0.1:5432" | PostgreSQL não está rodando. Inicie com `sudo systemctl start postgresql` |
| "Erro: autenticação falhada" | Credenciais erradas no server.js |
| "Erro 404 na API" | Servidor Node não está rodando. Execute `npm start` |
| "HTML não conecta à API" | Verifique se http://localhost:3000 está acessível |

---

## 📱 Usar em Produção

Para deixar o servidor rodando mesmo após fechar o terminal:

```bash
# Instale pm2 globalmente
npm install pm2 -g

# Inicie o servidor com pm2
pm2 start server.js --name "pncf-api"

# Faça auto-iniciar ao reiniciar o servidor
pm2 startup
pm2 save
```

---

## 📞 Próximos Passos

1. ✅ Leia o **README.md** para detalhes completos
2. 📊 Configure seus dados no PostgreSQL/Supabase
3. 🔒 Para produção, use variáveis de ambiente (.env)
4. 🚀 Deploy em um servidor (Heroku, DigitalOcean, etc)

---

## 🎉 Pronto!

Você já pode:
- ✅ Buscar dados por código de processo
- ✅ Copiar tabela formatada para SEI
- ✅ Exportar para Excel
- ✅ Alternar entre PostgreSQL e Supabase

**Bom uso! 🚀**
