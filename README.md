# 🔍 PNCF - Consulta de Processos com PostgreSQL e Supabase

Sistema de consulta de processos com suporte a **PostgreSQL** e **Supabase**, permitindo alternar entre as duas bases de dados com um clique.

## 📦 Arquivos

1. **Minuta_Oficio_V7_PostgreSQL.html** - Interface web com suporte a PostgreSQL e Supabase
2. **server.js** - API backend Node.js/Express para PostgreSQL
3. **README.md** - Este arquivo

---

## ⚙️ Configuração do PostgreSQL

### Passo 1: Instalar Dependências Node.js

```bash
# Crie uma pasta para o projeto
mkdir projeto-pncf
cd projeto-pncf

# Inicialize o Node.js
npm init -y

# Instale as dependências
npm install express cors pg
```

### Passo 2: Configurar Credenciais no server.js

Edite o arquivo `server.js` e atualize a seção de configuração (linhas 14-19):

```javascript
const pool = new Pool({
    user: 'seu_usuario_postgres',      // ← Mude isto
    host: 'localhost',
    database: 'seu_database_aqui',     // ← Mude isto
    password: 'sua_senha_aqui',        // ← Mude isto
    port: 5432,
});
```

### Passo 3: Iniciar o Servidor

```bash
node server.js
```

Você verá:
```
╔════════════════════════════════════════════════════════════╗
║        API PostgreSQL - PNCF Processos                     ║
╚════════════════════════════════════════════════════════════╝

✅ Servidor rodando em: http://localhost:3000
```

### Passo 4: Configurar o HTML

No arquivo `Minuta_Oficio_V7_PostgreSQL.html`, atualize as configurações:

```javascript
// Linhas 346-353
const PG_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'seu_database',         // ← Seu database
    user: 'seu_usuario',              // ← Seu usuário
    password: 'sua_senha',            // ← Sua senha
    table: 'sua_tabela',              // ← Sua tabela de dados
    coluna_filtro: 'id_processo'      // ← Coluna de filtro
};
```

---

## 🔌 Configuração do Supabase

No arquivo `Minuta_Oficio_V7_PostgreSQL.html`, configure a seção Supabase (linhas 355-362):

```javascript
const SUPABASE_CONFIG = {
    url: 'https://seu-projeto.supabase.co',  // ← URL do seu projeto
    apiKey: 'sua-api-key-publica',          // ← Chave pública
    table: 'sua_tabela',                    // ← Sua tabela
    coluna_filtro: 'id_processo'            // ← Coluna de filtro
};
```

**Como pegar suas credenciais Supabase:**

1. Acesse https://supabase.com/
2. Vá para seu projeto
3. Settings → API
4. Copie a URL e a Anon Key (chave pública)

---

## 🚀 Como Usar

### 1. Abrir a Aplicação

```bash
# Abra o arquivo HTML em um navegador
# Pode ser via VS Code (Live Server) ou clicando direto no arquivo
```

### 2. Selecionar a Base de Dados

Na parte superior da página, você verá dois botões:
- 🐘 **PostgreSQL** - Conecta à API local
- ⚡ **Supabase** - Conecta ao Supabase

Clique no que deseja usar.

### 3. Buscar Processos

- Digite números de processo no campo de entrada
- Podem ser separados por: **espaço, vírgula ou quebra de linha**
- Clique em **🔎 Buscar** ou pressione **Enter**

### 4. Opcões Disponíveis

Após encontrar dados:

| Botão | Função |
|-------|--------|
| Copiar (Colar SEI) | Copia tabela formatada para o SEI |
| 📊 Exportar Excel | Baixa dados em CSV |
| 🗑️ Limpar | Limpa a tabela |
| Ocultar zeros | Checkbox para ocultar linhas com tudo em zero |

---

## 📊 Exemplo de Dados no PostgreSQL

Criar uma tabela de exemplo no PostgreSQL:

```sql
CREATE TABLE processos (
    id SERIAL PRIMARY KEY,
    id_processo VARCHAR(50) UNIQUE NOT NULL,
    beneficiario VARCHAR(255),
    cpf VARCHAR(14),
    estado_civil VARCHAR(50),
    nome_conjuge VARCHAR(255),
    cpf_conjuge VARCHAR(14),
    linha_financiamento VARCHAR(255),
    sat DECIMAL(10,2),
    sib DECIMAL(10,2),
    elab_projeto DECIMAL(10,2),
    serv_ater DECIMAL(10,2),
    itbi DECIMAL(10,2),
    geo DECIMAL(10,2),
    cartorio DECIMAL(10,2),
    capac_inicial DECIMAL(10,2),
    laudo_avaliacao DECIMAL(10,2),
    producao DECIMAL(10,2),
    paa_ou_pnae DECIMAL(10,2),
    pronaf_a DECIMAL(10,2),
    total DECIMAL(10,2)
);

-- Inserir dados de exemplo
INSERT INTO processos (id_processo, beneficiario, cpf, sat, total) 
VALUES 
('PROCESSO001', 'João Silva', '123.456.789-00', 100.00, 500.00),
('PROCESSO002', 'Maria Santos', '987.654.321-00', 150.00, 750.00);
```

---

## 🔒 Segurança

⚠️ **IMPORTANTE**: Como você mencionou que é uso pessoal, as credenciais estão no código.

Para **produção**, recomendamos:

1. **Usar variáveis de ambiente** (.env):
```bash
npm install dotenv
```

```javascript
// No início do server.js
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
});
```

2. **Criar arquivo .env**:
```
DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=seu_database
DB_PASSWORD=sua_senha
```

3. **Adicionar .env ao .gitignore**

---

## 🐛 Resolução de Problemas

### "Erro ao conectar PostgreSQL"

Verifique:
- [ ] PostgreSQL está rodando? (`sudo systemctl status postgresql`)
- [ ] Credenciais estão corretas?
- [ ] Banco de dados existe? (`createdb seu_database`)
- [ ] Tabela existe? (`\dt` no psql)

### "Erro 404 - Não encontrou servidor"

Verifique:
- [ ] Node.js está rodando? (`node server.js`)
- [ ] Servidor está em http://localhost:3000?
- [ ] Porta 3000 está disponível?

### "Supabase não conecta"

Verifique:
- [ ] URL do Supabase está correta?
- [ ] API Key está correta?
- [ ] Tabela existe no Supabase?
- [ ] Permissões RLS estão configuradas?

---

## 📱 Usar em Produção

Para usar em um servidor remoto:

1. Fazer upload dos arquivos
2. Instalar Node.js no servidor
3. Configurar credenciais
4. Usar **PM2** para manter o servidor rodando:

```bash
npm install pm2 -g
pm2 start server.js --name "pncf-api"
pm2 startup
pm2 save
```

---

## 📚 Endpoints da API

### POST /api/processos
Busca processos por código

**Request:**
```json
{
  "codigos": ["PROCESSO001", "PROCESSO002"],
  "coluna_filtro": "id_processo"
}
```

**Response:**
```json
{
  "success": true,
  "records": [...],
  "count": 2
}
```

### GET /api/health
Verifica se API está viva

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "postgresql": true
}
```

### GET /api/tables
Lista todas as tabelas

**Response:**
```json
{
  "tables": ["processos", "usuarios", ...]
}
```

### GET /api/tabela/:nome/columns
Lista colunas de uma tabela

**Response:**
```json
{
  "tabela": "processos",
  "colunas": [
    { "column_name": "id", "data_type": "integer" },
    { "column_name": "id_processo", "data_type": "character varying" }
  ]
}
```

---

## ✨ Recursos

- ✅ Suporte PostgreSQL direto
- ✅ Suporte Supabase
- ✅ Alternar entre bases com 1 clique
- ✅ Copiar tabela formatada para SEI
- ✅ Exportar para Excel (CSV)
- ✅ Busca por múltiplos processos
- ✅ Filtro de zeros
- ✅ Toast notifications
- ✅ Responsivo

---

## 📝 Licença

Uso pessoal - Sem restrições

---

## 🤝 Suporte

Dúvidas ou problemas? Verifique:
- Console do navegador (F12 → Console)
- Logs do Node.js
- Conexão PostgreSQL: `psql -U seu_usuario -d seu_database -c "SELECT 1"`

---

**Versão: 1.0.0** | **Última atualização: 2024**
