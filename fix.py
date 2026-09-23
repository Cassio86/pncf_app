import re

with open('c:\\Projetos\\API_PostgreSQL\\Minuta_Oficio_V7.2.html', 'r', encoding='utf-8') as f:
    content = f.read()

correct_buscar_dados = """        // ==================================================================
        // NOVA FUNÇÃO DE BUSCA CONECTADA COM API DO POSTGRES
        // ==================================================================
        async function buscarDados() {
            const texto = searchInput.value;
            const codigos = extrairCodigos(texto);

            if (codigos.length === 0) {
                showToast('Digite ao menos um código para buscar.', 'error');
                return;
            }

            renderTags(codigos);
            setStatus('Consultando a base de dados...', '');
            setPill('PostgreSQL', true);
            btnBuscar.disabled = true;

            try {
                // Envia os dados para a sua própria API
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tabela: TABELA,
                        coluna: COLUNA_FILTRO,
                        codigos: codigos
                    })
                });

                if (!response.ok) {
                    throw new Error(`Erro de rede ou do servidor (Status: ${response.status})`);
                }

                const data = await response.json(); // A resposta do seu backend

                window.ultimosDados = data;
                renderTable(data);

                if (data && data.length > 0) {
                    setStatus(`${data.length} registro(s) encontrado(s).`, 'ok');
                    showToast(`${data.length} registro(s) encontrado(s)!`, 'success');
                } else {
                    setStatus('Nenhum registro encontrado.', 'err');
                    showToast('Nenhum resultado encontrado.', 'error');
                }
                setPill('PostgreSQL');

            } catch (err) {
                console.error('Fetch error:', err);
                setStatus('Erro de conexão: ' + err.message, 'err');
                setPill('Erro');
                showToast('Falha na comunicação com a API. Verifique a conexão.', 'error');
            } finally {
                btnBuscar.disabled = false;
                updateUI();
            }
        }"""

# Remove the broken part
content = re.sub(r'        // ==================================================================\n        // NOVA FUNÇÃO DE BUSCA CONECTADA COM API DO POSTGRES\n        // ==================================================================\n        async function buscarDados\(\) \{\n(?:.*?\n)*?            \}\n', correct_buscar_dados + '\n', content)

with open('c:\\Projetos\\API_PostgreSQL\\Minuta_Oficio_V7.2.html', 'w', encoding='utf-8') as f:
    f.write(content)
