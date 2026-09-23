// Arquivo: server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// =================================================================
// DADOS DE CONEXÃO DO SEU POSTGRESQL LOCAL (Hardcoded para testes)
// =================================================================
const pool = new Pool({
    user: 'postgres',           // Seu usuário do postgres
    host: 'database-1.c164mie8iq7b.us-east-2.rds.amazonaws.com',          // Geralmente é localhost
    database: 'postgres',  // Nome do seu banco de dados
    password: '0sbT3vpCrQX6mn7hEIhq', // Sua senha
    port: 5432,                 // Porta padrão do Postgres
    ssl: {
        rejectUnauthorized: false   // <-- ADICIONE ESTA PARTE PARA ATIVAR O SSL
    }
});



// ============================================
// ROTA 1: Minuta de Oficio
// ============================================
app.post('/api/minuta', async (req, res) => {
    const { codigos } = req.body;
    try {
        if (!codigos || !Array.isArray(codigos) || codigos.length === 0) {
            return res.status(400).json({ error: 'Array de códigos é obrigatório' });
        }

        const query = `SELECT * FROM vwminuta WHERE "PROCESSO" = ANY($1)`;
        const result = await pool.query(query, [codigos]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/minuta:', error);
        res.status(500).json({ error: 'Erro ao consultar processos' });
    }
});

// ============================================
// ROTA 2: Buscar Usuários
// ============================================
app.get('/api/usuarios', async (req, res) => {
    try {
        const query = `SELECT id, nome, email FROM usuarios`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/usuarios:', error);
        res.status(500).json({ error: 'Erro ao consultar usuários' });
    }
});

// ============================================
// ROTA 3: Inserir Novo Registro
// ============================================
app.post('/api/novo-registro', async (req, res) => {
    const { nome, valor } = req.body;

    // Validação de entrada
    if (!nome || valor === undefined || valor === null) {
        return res.status(400).json({ error: 'Nome e valor são obrigatórios' });
    }

    // Validação de tipo
    if (typeof valor !== 'number') {
        return res.status(400).json({ error: 'Valor deve ser um número' });
    }

    try {
        const query = `INSERT INTO relatorios (nome, valor) VALUES ($1, $2) RETURNING *`;
        const result = await pool.query(query, [nome, valor]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro na rota /api/novo-registro:', error);
        res.status(500).json({ error: 'Erro ao salvar dados' });
    }
});

// ============================================
// ROTA 4: Processos Principais
// ============================================
app.post('/api/principal', async (req, res) => {
    try {
        const { atividades } = req.body;

        // Validação
        if (!atividades || !Array.isArray(atividades) || atividades.length === 0) {
            return res.status(400).json({ erro: 'Array de atividades é obrigatório' });
        }

        const query = `
            SELECT * FROM principal 
            WHERE status_do_processo IN ('Em andamento', 'Atrasado') 
            AND atividade_atual = ANY($1::text[])
        `;

        const { rows } = await pool.query(query, [atividades]);
        res.json(rows);
    } catch (error) {
        console.error('Erro na rota /api/principal:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// ============================================
// ROTA 5: Buscar Grid de Imóveis
// ============================================
// ORRIGIDO: db.query() → pool.query()
app.post('/api/imoveis', async (req, res) => {
    try {
        const { processosIds } = req.body;

        // Validação
        if (!processosIds || !Array.isArray(processosIds) || processosIds.length === 0) {
            return res.status(400).json({ erro: 'Array de IDs é obrigatório' });
        }

        const query = `
            SELECT * FROM grid_imoveis 
            WHERE processo = ANY($1::text[])
        `;
        // CORRIGIDO AQUI
        const { rows } = await pool.query(query, [processosIds]);

        res.json(rows);
    } catch (error) {
        console.error('Erro na rota /api/imoveis:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// ============================================
// ROTA 6: Buscar Processos SEI
// ============================================
// CORRIGIDO: db.query() → pool.query()
app.post('/api/sei', async (req, res) => {
    try {
        const { processosIds } = req.body;

        // Validação
        if (!processosIds || !Array.isArray(processosIds) || processosIds.length === 0) {
            return res.status(400).json({ erro: 'Array de IDs é obrigatório' });
        }

        const query = `
            SELECT "Processo", processoSEI 
            FROM "SEI" 
            WHERE "Processo" = ANY($1::text[])
        `;
        // CORRIGIDO AQUI
        const { rows } = await pool.query(query, [processosIds]);

        res.json(rows);
    } catch (error) {
        console.error('Erro na rota /api/sei:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// ============================================
// ROTA 7: Buscar Contratações
// ============================================
// CORRIGIDO: db.query() → pool.query()
app.get('/api/contratacoes', async (req, res) => {
    try {
        const queryGeral = 'SELECT * FROM vwcontratado';
        // CORRIGIDO AQUI
        const { rows } = await pool.query(queryGeral);

        res.json(rows);
    } catch (error) {
        console.error('Erro na rota /api/contratacoes:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// ============================================
// ROTA 8: Buscar Processos no Banco
// ============================================
// CORRIGIDO: db.query() → pool.query()
app.get('/api/processos-banco', async (req, res) => {
    try {
        const query = `SELECT * FROM ProcessosNoBanco`;
        // CORRIGIDO AQUI
        const { rows } = await pool.query(query);

        res.json(rows);
    } catch (error) {
        console.error('Erro na rota /api/processos-banco:', error);
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

// ============================================
// ROTAS DA PLANILHA SEGMENTADA
// ============================================

app.post('/api/consultar-processos', async (req, res) => {
    const { codigos } = req.body;

    try {
        const query = `SELECT * FROM minuta WHERE "PROCESSO" = ANY($1)`;
        const result = await pool.query(query, [codigos]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ error: 'Erro ao consultar o banco local' });
    }
});

app.post('/api/segmentada', async (req, res) => {
    const { idgrupo } = req.body;

    if (!idgrupo) {
        return res.status(400).json({ error: 'Campo idgrupo é obrigatório' });
    }

    try {
        const query = `SELECT * FROM vwsegmentada WHERE grupo = $1 ORDER BY processo`;
        const result = await pool.query(query, [idgrupo]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/segmentada:', error);
        res.status(500).json({ error: 'Erro ao consultar a view vwsegmentada' });
    }
});

app.post('/api/atualizar-segmentada', async (req, res) => {
    const { id, statusProcesso, observacao, processo_sei } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Campo id é obrigatório' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        let idgrupo = null, idanalista = null, idstatus = null;

        if (statusProcesso !== undefined) {
            const queryIds = `
                SELECT 
                    p.processo,
                    g.id AS "idgrupo",
                    a.id AS "idanalista",
                    s.id AS "idstatus"
                FROM principal p
                INNER JOIN grid_imoveis gi ON gi.processo = p.processo
                INNER JOIN estado e ON e.uf = gi.uf
                INNER JOIN grupo g ON g.id = e.idgrupo
                INNER JOIN analista_grupo ag ON ag.idgrupo = g.id
                INNER JOIN analista a ON a.id = ag.idanalista
                INNER JOIN analista_nucleo an ON an.idanalista = a.id
                INNER JOIN status s ON s.idnucleo = an.idnucleo
                WHERE p.processo = $1 AND s.id = $2
                GROUP BY 1, 2, 3, 4;
            `;
            const resIds = await client.query(queryIds, [id, statusProcesso]);
            if (resIds.rows.length > 0) {
                idgrupo = resIds.rows[0].idgrupo;
                idanalista = resIds.rows[0].idanalista;
                idstatus = resIds.rows[0].idstatus;
            } else {
                idstatus = statusProcesso;
            }
        }

        const campos = [];
        const valores = [];
        let idx = 1;

        if (idstatus !== null) {
            campos.push(`idstatus = $${idx++}`); valores.push(idstatus);
            campos.push(`datadevolucao = $${idx++}`); valores.push(Number(idstatus) === 5 ? new Date() : null);
        }
        if (idgrupo !== null) { campos.push(`idgrupo = $${idx++}`); valores.push(idgrupo); }
        if (idanalista !== null) { campos.push(`idanalista = $${idx++}`); valores.push(idanalista); }
        if (observacao !== undefined) { campos.push(`obs = $${idx++}`); valores.push(observacao); }
        if (processo_sei !== undefined) { campos.push(`sei = $${idx++}`); valores.push(processo_sei); }

        let resultUpdate = null;
        if (campos.length > 0) {
            valores.push(id);
            const queryUpdate = `UPDATE segmentada SET ${campos.join(', ')} WHERE processo = $${idx} RETURNING *`;
            resultUpdate = await client.query(queryUpdate, valores);
            if (resultUpdate.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Registro não encontrado para atualização na tabela segmentada' });
            }
        }

        if (idstatus !== null) {
            const queryProcStatusInsert = `
                INSERT INTO processo_status (id, "IdProcesso", "IdStatus", "IdGrupo", "IdAnalista", created_at) 
                VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM processo_status), $1, $2, $3, $4, CURRENT_TIMESTAMP)
            `;
            await client.query(queryProcStatusInsert, [id, idstatus, idgrupo, idanalista]);
        }

        await client.query('COMMIT');
        res.json({ success: true, updated: resultUpdate ? resultUpdate.rows[0] : null });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro na rota /api/atualizar-segmentada:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro na tabela segmentada' });
    } finally {
        client.release();
    }
});

app.get('/api/grupos', async (req, res) => {
    try {
        const query = `SELECT DISTINCT grupo AS id, grupo AS nome FROM vwsegmentada WHERE grupo IS NOT NULL ORDER BY grupo`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/grupos:', error);
        res.status(500).json({ error: 'Erro ao buscar grupos' });
    }
});

app.get('/api/status', async (req, res) => {
    try {
        const query = `SELECT id, nome FROM status ORDER BY nome`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/status:', error);
        res.status(500).json({ error: 'Erro ao buscar status' });
    }
});

app.get('/api/analistas-disponiveis', async (req, res) => {
    try {
        const query = `
            SELECT 
                g.nome AS grupo,
                s.nome AS status,
                a.nome AS analista
            FROM analista_grupo ag
            INNER JOIN grupo g ON g.id = ag.idgrupo
            INNER JOIN analista a ON a.id = ag.idanalista
            INNER JOIN analista_nucleo an ON an.idanalista = a.id
            INNER JOIN status s ON s.idnucleo = an.idnucleo
            WHERE a.ativo = 1
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/analistas-disponiveis:', error);
        res.status(500).json({ error: 'Erro ao buscar analistas disponíveis' });
    }
});

// ============================================
// ROTA: Buscar dados da view vwprocesso_status
// ============================================
app.get('/api/processo-status', async (req, res) => {
    try {
        const query = `SELECT * FROM vwprocesso_status`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/processo-status:', error);
        res.status(500).json({ error: 'Erro ao consultar a view vwprocesso_status' });
    }
});

// ============================================
// ROTA: Autenticação Google
// ============================================
app.post('/api/auth/google', async (req, res) => {
    const { nome, email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email é obrigatório.' });
    }

    try {
        const queryCheck = `SELECT id, nome, email, id_perfil, ativo FROM usuarios WHERE email = $1`;
        const resultCheck = await pool.query(queryCheck, [email]);

        if (resultCheck.rows.length > 0) {
            const user = resultCheck.rows[0];
            
            if (user.ativo === 1 || user.ativo === true || user.ativo === '1') {
                return res.json({ success: true, message: 'Login autorizado', user });
            } else {
                return res.json({ success: false, reason: 'inactive', message: 'Sua conta está inativa. Entre em contato com o Administrador.' });
            }
        } else {
            const queryInsert = `INSERT INTO usuarios (nome, email, id_perfil, ativo) VALUES ($1, $2, 0, 0) RETURNING id`;
            await pool.query(queryInsert, [nome || 'Usuário Google', email]);
            
            return res.json({ success: false, reason: 'created', message: 'Sua conta foi criada e aguarda ativação pelo Administrador.' });
        }
    } catch (error) {
        console.error('Erro na rota /api/auth/google:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor ao autenticar.' });
    }
});

// ============================================
// Iniciar Servidor
// ============================================
app.listen(3000, () => {
    console.log('   API rodando na porta 3000');
    console.log('   Endpoints disponíveis:');
    console.log('   POST   /api/minuta');
    console.log('   GET    /api/usuarios');
    console.log('   POST   /api/novo-registro');
    console.log('   POST   /api/principal');
    console.log('   POST   /api/imoveis');
    console.log('   POST   /api/sei');
    console.log('   GET    /api/contratacoes');
    console.log('   GET    /api/processos-banco');
    console.log('   POST   /api/consultar-processos');
    console.log('   POST   /api/segmentada');
    console.log('   POST   /api/atualizar-segmentada');
    console.log('   GET    /api/grupos');
    console.log('   GET    /api/status');
    console.log('   GET    /api/processo-status');
    console.log('   POST   /api/auth/google');
});
