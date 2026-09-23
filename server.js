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

// Rota que o seu HTML vai chamar
app.post('/api/consultar-processos', async (req, res) => {
    const { codigos } = req.body;

    try {
        // Consulta na tabela "minuta" filtrando pela coluna "PROCESSO"
        const query = `SELECT * FROM minuta WHERE "PROCESSO" = ANY($1)`;
        const result = await pool.query(query, [codigos]);

        // Retorna os dados para o HTML
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na consulta:', error);
        res.status(500).json({ error: 'Erro ao consultar o banco local' });
    }
});

// ============================================
// ROTA: Buscar dados da Planilha Segmentada
// Fonte: view vwsegmentada filtrada por grupo
// ============================================
app.post('/api/segmentada', async (req, res) => {
    const { idgrupo } = req.body;

    if (!idgrupo) {
        return res.status(400).json({ error: 'Campo idgrupo é obrigatório' });
    }

    try {
        const query = `SELECT * FROM vw_relatorio_imoveis WHERE grupo = $1 ORDER BY processo`;
        const result = await pool.query(query, [idgrupo]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/segmentada:', error);
        res.status(500).json({ error: 'Erro ao consultar a view vwsegmentada' });
    }
});

// ============================================
// ROTA: Atualizar registro da Segmentada
// ============================================
app.post('/api/atualizar-segmentada', async (req, res) => {
    const { id, statusProcesso, observacao, processo_sei, analista } = req.body;

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
                    s.id AS "idstatus",
                    a.nome AS "analista_nome"
                FROM principal p
                INNER JOIN grid_imoveis gi ON gi.processo = p.processo
                INNER JOIN estado e ON e.uf = gi.uf
                INNER JOIN grupo g ON g.id = e.idgrupo
                INNER JOIN analista_grupo ag ON ag.idgrupo = g.id
                INNER JOIN analista a ON a.id = ag.idanalista
                INNER JOIN analista_nucleo an ON an.idanalista = a.id
                INNER JOIN status s ON s.idnucleo = an.idnucleo
                WHERE p.processo = $1 AND s.id = $2
                GROUP BY 1, 2, 3, 4, 5;
            `;
            const resIds = await client.query(queryIds, [id, statusProcesso]);
            if (resIds.rows.length > 0) {
                idgrupo = resIds.rows[0].idgrupo;
                idstatus = resIds.rows[0].idstatus;
                if (analista !== undefined) {
                    const matched = resIds.rows.find(r => r.analista_nome === analista);
                    if (matched) {
                        idanalista = matched.idanalista;
                    } else {
                        const analistaRes = await client.query('SELECT id FROM analista WHERE nome = $1 LIMIT 1', [analista]);
                        if (analistaRes.rows.length > 0) idanalista = analistaRes.rows[0].id;
                        else idanalista = resIds.rows[0].idanalista;
                    }
                } else {
                    idanalista = resIds.rows[0].idanalista;
                }
            } else {
                // Se a consulta não retornar nada, usa apenas o status fornecido
                idstatus = statusProcesso;
            }
        }

        if (analista !== undefined && idanalista === null) {
            const analistaRes = await client.query('SELECT id FROM analista WHERE nome = $1 LIMIT 1', [analista]);
            if (analistaRes.rows.length > 0) {
                idanalista = analistaRes.rows[0].id;
            }
        }

        // 1. Atualizar tabela segmentada
        const campos = [];
        const valores = [];
        let idx = 1;

        if (idstatus !== null) {
            campos.push(`idstatus = $${idx++}`); valores.push(idstatus);
            campos.push(`datadevolucao = $${idx++}`); valores.push(Number(idstatus) === 5 ? new Date() : null);
        }
        // Atualização de idgrupo removida para não forçar a mudança baseada na UF do imóvel
        if (idanalista !== null) { campos.push(`idanalista = $${idx++}`); valores.push(idanalista); }
        if (observacao !== undefined) { campos.push(`obs = $${idx++}`); valores.push(observacao); }
        if (processo_sei !== undefined) { campos.push(`sei = $${idx++}`); valores.push(processo_sei); }

        let resultUpdate = null;
        if (campos.length > 0) {
            valores.push(id); // ID é o processo
            const queryUpdate = `UPDATE segmentada SET ${campos.join(', ')} WHERE processo = $${idx} RETURNING *`;
            resultUpdate = await client.query(queryUpdate, valores);
            if (resultUpdate.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Registro não encontrado para atualização na tabela segmentada' });
            }
        }

        // 2. Inserir/Atualizar na tabela processo_status
        if (idstatus !== null) {
            // Apenas faz a inserção para servir de histórico (log) das alterações
            const queryProcStatusInsert = `
                INSERT INTO processo_status (id, "IdProcesso", "IdStatus", "IdGrupo", "IdAnalista", created_at) 
                VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM processo_status), $1, $2, $3, $4, CURRENT_TIMESTAMP)
            `;
            const finalGrupo = resultUpdate ? resultUpdate.rows[0].idgrupo : idgrupo;
            const finalAnalista = resultUpdate ? resultUpdate.rows[0].idanalista : idanalista;
            await client.query(queryProcStatusInsert, [id, idstatus, finalGrupo, finalAnalista]);
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

// ============================================
// ROTA: Listar Grupos disponíveis
// ============================================
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

// ============================================
// ROTA: Listar Status disponíveis
// Fonte: tabela status
// ============================================
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

// ============================================
// ROTA: Buscar Analistas Disponíveis por Grupo e Status
// ============================================
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
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/analistas-disponiveis:', error);
        res.status(500).json({ error: 'Erro ao buscar analistas disponíveis' });
    }
});

// ============================================
// ROTA: Buscar dados da Planilha Segmentada Nova
// Fonte: view vwsegmentada filtrada por grupo
// ============================================
app.post('/api/segmentadanova', async (req, res) => {
    const { idgrupo } = req.body;

    if (!idgrupo) {
        return res.status(400).json({ error: 'Campo idgrupo é obrigatório' });
    }

    try {
        const query = `SELECT * FROM w_relatorio_imoveis WHERE grupo = $1 ORDER BY processo`;
        const result = await pool.query(query, [idgrupo]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/segmentadanova:', error);
        res.status(500).json({ error: 'Erro ao consultar a view w_relatorio_imoveis' });
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
// ROTA 2: Buscar Usuários
// ============================================
app.get('/api/usuarios', async (req, res) => {
    try {
        const query = `SELECT id, nome, email, id_perfil, ativo FROM usuarios`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro na rota /api/usuarios:', error);
        res.status(500).json({ error: 'Erro ao consultar usuários' });
    }
});



// ============================================
// ROTA 3: Autenticação Google
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
            
            // Verifica se está ativo (pode ser int 1, boolean true, ou string '1')
            if (user.ativo === 1 || user.ativo === true || user.ativo === '1') {
                return res.json({ success: true, message: 'Login autorizado', user });
            } else {
                return res.json({ success: false, reason: 'inactive', message: 'Sua conta está inativa. Entre em contato com o Administrador.' });
            }
        } else {
            // Usuário não existe, cria um novo
            const queryInsert = `INSERT INTO usuarios (nome, email, id_perfil, ativo) VALUES ($1, $2, 0, 0) RETURNING id`;
            await pool.query(queryInsert, [nome || 'Usuário Google', email]);
            
            return res.json({ success: false, reason: 'created', message: 'Conta criada e aguarda ativação pelo Administrador.' });
        }
    } catch (error) {
        console.error('Erro na rota /api/auth/google:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor ao autenticar.' });
    }
});


// Inicia o mini-servidor na porta 3000
app.listen(3000, () => {
    console.log('✅ Servidor local rodando! O HTML já pode se conectar em http://localhost:3000');
    console.log('   POST   /api/consultar-processos');
    console.log('   POST   /api/segmentada');
    console.log('   POST   /api/atualizar-segmentada');
    console.log('   GET    /api/grupos');
    console.log('   GET    /api/status');
    console.log('   POST   /api/segmentadanova');
    console.log('   GET    /api/processo-status');
    console.log('   GET    /api/usuarios');
    console.log('   POST   /api/auth/google');
});