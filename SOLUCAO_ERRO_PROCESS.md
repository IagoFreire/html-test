# 🔧 Solução para Erro "process is not defined"

O erro ocorre porque há um arquivo `App.js` antigo no seu sistema local que ainda usa `process.env` (padrão do Create React App). No Vite, usamos `import.meta.env`.

## ✅ Solução Rápida

### 1. Delete o arquivo App.js antigo

No seu sistema local, execute:

```bash
cd client/src
# No Windows PowerShell:
Remove-Item App.js -ErrorAction SilentlyContinue

# Ou no CMD:
del App.js
```

### 2. Verifique se App.jsx existe

```bash
cd client/src
dir App.jsx
```

Se não existir, você precisa ter o arquivo `App.jsx` (não `App.js`).

### 3. Limpe o cache e reinicie

```bash
cd client
# No Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
```

## 📝 Nota Importante

No Vite:
- ❌ **NÃO use**: `process.env.REACT_APP_API_URL`
- ✅ **USE**: `import.meta.env.VITE_API_URL`

O arquivo `App.jsx` no workspace já está correto usando `import.meta.env`. O problema é que você ainda tem um `App.js` antigo no seu sistema local.

## 🔍 Verificar Estrutura Correta

```
client/src/
├── main.jsx    ← Ponto de entrada
├── App.jsx     ← Componente principal (NÃO App.js!)
└── index.css
```

**IMPORTANTE**: Certifique-se de que não há `App.js` na pasta `src/`, apenas `App.jsx`!
