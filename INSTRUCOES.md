# 🚀 Instruções Rápidas

## Primeira Execução

1. **Instalar dependências do backend:**
   ```bash
   npm install
   ```

2. **Instalar dependências do frontend:**
   ```bash
   cd client
   npm install
   cd ..
   ```

3. **Executar em desenvolvimento:**
   ```bash
   # Terminal 1 - Backend
   npm run dev
   
   # Terminal 2 - Frontend
   npm run client
   ```
   
   Ou execute ambos de uma vez:
   ```bash
   npm run dev:all
   ```

4. **Acessar a aplicação:**
   - Frontend React: http://localhost:3001
   - Backend API: http://localhost:3000

## ⚠️ Importante

- Certifique-se de que o caminho das gravações está correto no arquivo `server.js`:
  ```javascript
  const BASE_PATH = 'D:\\Intelbras\\LocalRecording';
  ```

- O frontend React usa um proxy configurado para se conectar ao backend na porta 3000.

## 🏗️ Build para Produção

```bash
# 1. Construir o frontend
npm run client:build

# 2. Configurar ambiente de produção
export NODE_ENV=production  # Linux/Mac
# ou
set NODE_ENV=production     # Windows

# 3. Iniciar servidor
npm start
```

Agora tudo estará disponível em http://localhost:3000
