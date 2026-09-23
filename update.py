import re

with open('c:\\Projetos\\API_PostgreSQL\\Minuta_Oficio_V7.html', 'r', encoding='utf-8') as f:
    v7_content = f.read()

with open('c:\\Projetos\\API_PostgreSQL\\Minuta_Oficio_V7.2.html', 'r', encoding='utf-8') as f:
    v72_content = f.read()

# Extract the entire Javascript block from V7
v7_js_match = re.search(r'<script>(.*?)</script>', v7_content, re.DOTALL)
if not v7_js_match:
    v7_js_match = re.search(r'<script>\s*const SUPABASE_URL(.*?)</script>', v7_content, re.DOTALL)
v7_js = v7_js_match.group(0)

# Extract config block from v7.2
config_v72 = re.search(r'(        // ==============================================================================.*?const COLUNAS = \[\n(?:.*?\n)*?        \];)', v72_content, re.DOTALL).group(1)

# Extract config block from v7 JS
config_v7 = re.search(r'(        const SUPABASE_URL.*?const COLUNAS = \[\n(?:.*?\n)*?        \];)', v7_js, re.DOTALL).group(1)

# Replace config
v7_js = v7_js.replace(config_v7, config_v72)

# Remove the sb instance creation
v7_js = re.sub(r'\s*const sb = window\.supabase\.createClient\(SUPABASE_URL, SUPABASE_KEY\);\s*', '\n', v7_js)

# Replace btnClear listener
btn_clear_v72 = re.search(r'(        btnClear\.addEventListener\(\'click\', \(\) => \{\n(?:.*?\n)*?        \}\);)', v72_content, re.DOTALL).group(1)
btn_clear_v7 = re.search(r'(        btnClear\.addEventListener\(\'click\', \(\) => \{\n(?:.*?\n)*?        \}\);)', v7_js, re.DOTALL).group(1)
v7_js = v7_js.replace(btn_clear_v7, btn_clear_v72)

# Extract buscarDados from V7.2
buscar_dados_v72 = re.search(r'(        // ==================================================================\n        // NOVA FUNÇÃO DE BUSCA CONECTADA COM API DO POSTGRES.*?\}\n)', v72_content, re.DOTALL)
if not buscar_dados_v72:
    buscar_dados_v72 = re.search(r'(        async function buscarDados\(\) \{\n(?:.*?\n)*?        \}\n)', v72_content, re.DOTALL)

# Extract buscarDados from V7 JS
buscar_dados_v7 = re.search(r'(        async function buscarDados\(\) \{\n(?:.*?\n)*?        \}\n)', v7_js, re.DOTALL)

# Replace buscarDados
v7_js = v7_js.replace(buscar_dados_v7.group(1), buscar_dados_v72.group(1))

# Now replace the JS in v7_content with the modified v7_js
new_v7_content = v7_content.replace(v7_js_match.group(0), v7_js)

# Also remove the supabase script tag
new_v7_content = re.sub(r'<script src=\"https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2\"></script>\s*', '', new_v7_content)

with open('c:\\Projetos\\API_PostgreSQL\\Minuta_Oficio_V7.2.html', 'w', encoding='utf-8') as f:
    f.write(new_v7_content)

print("Done!")
