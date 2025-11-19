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
   - Frontend React (Vite): http://localhost:3001
   - Backend API: http://localhost:3000

**Nota**: O Vite oferece hot-reload muito mais rápido que o Create React App!

## ✨ Funcionalidades Principais

### 🎯 Busca por Data
- Selecione uma data no calendário
- Clique em "Buscar" para ver todas as gravações do dia

### 📹 Filtro por Câmera
- Após a primeira busca, o filtro de câmera será habilitado
- Selecione uma câmera específica para filtrar os resultados
- Selecione "Todas as câmeras" para remover o filtro

### 📑 Abas por Câmera
- Cada câmera aparece em uma aba separada
- Navegue entre as abas para ver as gravações de cada câmera
- O número de gravações aparece em cada aba

### 🎨 Tema Verde
- Interface com tema verde padrão
- Design moderno e responsivo

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

## 🔍 Reconhecimento de Câmeras

O sistema reconhece automaticamente câmeras com nomes compostos:
- ✅ "Portão - Esquerda"
- ✅ "Portão - Direita"  
- ✅ "Casa - Quintal"
- ✅ E outros padrões similares

Cada câmera aparece em uma aba separada para fácil navegação.
