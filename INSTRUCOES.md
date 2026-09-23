# 🔐 Autenticação com Google - Instruções de Configuração

## 📋 O que foi criado

✅ **index.html** - Página de login com autenticação Google  
✅ **menu.html** - Página de menu após autenticação bem-sucedida  
✅ **Este arquivo** - Instruções completas de configuração

---

## 🚀 Passo 1: Configurar Google Cloud Console

### 1.1 Criar um projeto no Google Cloud
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto (clique no seletor de projeto > Novo Projeto)
3. Nomeie seu projeto (ex: "Meu App de Login")
4. Aguarde a criação do projeto

### 1.2 Habilitar Google Identity API
1. No menu lateral, vá para **APIs e Serviços** > **Biblioteca**
2. Busque por **"Google Identity Services"** ou **"Identity and Access Management"**
3. Clique em **Habilitar**

### 1.3 Criar Credenciais OAuth 2.0
1. Vá para **APIs e Serviços** > **Credenciais**
2. Clique em **+ Criar Credenciais** > **ID do cliente OAuth**
3. Se solicitado, primeiro configure a **Tela de consentimento OAuth**:
   - Selecione **Externo** como tipo de usuário
   - Preencha as informações básicas (Nome do app, email de suporte, etc.)
   - Salve e continue
4. Voltando para criar o ID do cliente:
   - Tipo: **Aplicativo da Web**
   - Nome: "Meu App"
5. Em **URIs autorizados de JavaScript**:
   - Se usar **localhost**: Adicione `http://localhost:8000`
   - Se fazer **upload para servidor**: Adicione `https://seu-dominio.com`
6. Em **URIs autorizados de redirecionamento**:
   - Se usar **localhost**: Adicione `http://localhost:8000/index.html`
   - Se fazer **upload para servidor**: Adicione `https://seu-dominio.com/index.html`
7. Clique em **Criar**
8. **Copie o Client ID** fornecido

---

## 🔑 Passo 2: Configurar o Código

1. Abra o arquivo **index.html**
2. Localize a linha que começa com:
   ```javascript
   const GOOGLE_CLIENT_ID = 'SEU_GOOGLE_CLIENT_ID_AQUI.apps.googleusercontent.com';
   ```
3. Substitua `SEU_GOOGLE_CLIENT_ID_AQUI` pelo Client ID copiado do Google Cloud Console
   - Exemplo: `const GOOGLE_CLIENT_ID = '123456789-abc.apps.googleusercontent.com';`
4. Salve o arquivo

---

## 🧪 Passo 3: Testar Localmente

### Opção A: Usando Python (Recomendado)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Opção B: Usando Node.js
```bash
npm install -g http-server
http-server -p 8000
```

### Opção C: Usando PHP
```bash
php -S localhost:8000
```

Após iniciar o servidor:
1. Abra seu navegador em `http://localhost:8000`
2. Você deverá ver a página de login
3. Clique em **"Sign in with Google"**
4. Após autenticar com sua conta Google, você será redirecionado para **menu.html**

---

## 🌐 Passo 4: Fazer Upload para Servidor (Produção)

### 4.1 Via FTP
1. Conecte ao seu servidor via FTP (use FileZilla, WinSCP, etc.)
2. Faça upload de:
   - `index.html`
   - `menu.html`
   - Qualquer outra pasta/arquivo necessário

### 4.2 Via Git (se usar GitHub Pages ou similar)
```bash
git add index.html menu.html
git commit -m "Adiciona autenticação Google"
git push origin main
```

### 4.3 Atualizar Credenciais Google
1. Retorne ao Google Cloud Console
2. Vá para **Credenciais** e edite seu ID OAuth
3. Atualize os URIs autorizados com seu domínio final:
   - JavaScript: `https://seu-dominio.com`
   - Redirecionamento: `https://seu-dominio.com/index.html`

---

## 📁 Estrutura de Pastas Recomendada

```
seu-projeto/
├── index.html          (Login)
├── menu.html           (Menu após autenticação)
├── css/
│   └── styles.css      (Estilos adicionais opcionais)
├── js/
│   └── auth.js         (Lógica de autenticação adicional)
└── img/                (Suas imagens)
```

---

## 🔒 Segurança

### ⚠️ Importante para Produção

1. **Nunca compartilhe seu Client Secret** - O código atual usa apenas Client ID (seguro)
2. **Valide no servidor** - Este exemplo decodifica o JWT no cliente. Em produção:
   ```javascript
   // Envie o token para seu servidor
   fetch('/api/verify-token', {
       method: 'POST',
       body: JSON.stringify({ token: response.credential })
   })
   ```

3. **Use HTTPS** - Sempre use HTTPS em produção, nunca HTTP
4. **Proteja dados sensíveis** - Não armazene tokens privados em `localStorage` em apps reais

---

## 🆘 Troubleshooting

### Erro: "Client ID não configurado"
- ❌ Verificar se substituiu o placeholder no código
- ✅ Colar o Client ID correto do Google Cloud Console

### Erro: "Origem não autorizada"
- ❌ Você está acessando de um domínio não autorizado
- ✅ Adicionar o domínio na seção "URIs autorizados de JavaScript" no Google Cloud Console

### Login não funciona em localhost
- ❌ Tentar acessar via `127.0.0.1`
- ✅ Usar exatamente `localhost:8000`

### Página menu.html não aparece após login
- ❌ Arquivo `menu.html` não está no mesmo diretório que `index.html`
- ✅ Verificar se ambos os arquivos estão juntos

---

## 💡 Dicas Úteis

1. **Personalizar a página**: Edite o CSS em `index.html` para mudar cores, fontes, etc.

2. **Adicionar logo**: No `menu.html`, adicione sua logo no header

3. **Proteger múltiplas páginas**: Copie o código de verificação do `menu.html` para suas outras páginas:
   ```javascript
   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
   if (!isAuthenticated) {
       window.location.href = 'index.html';
   }
   ```

4. **Fazer logout**: Clique no botão "Sair" no menu

---

## 📞 Suporte Adicional

- [Documentação Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Referência OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)

---

**Pronto para começar!** 🎉  
Siga os passos acima e você terá um sistema de autenticação Google funcionando em poucos minutos!
