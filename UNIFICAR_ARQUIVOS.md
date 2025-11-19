# 🔧 Unificar Tipos de Arquivos (.js → .jsx)

Todos os arquivos React devem usar extensão `.jsx`, não `.js`.

## ✅ Estrutura Correta

```
client/src/
├── main.jsx    ← Ponto de entrada
├── App.jsx     ← Componente principal
└── index.css
```

## 🗑️ Remover Arquivos .js Antigos

No seu sistema local, execute:

### Windows PowerShell:
```powershell
cd client\src

# Verificar se há arquivos .js
Get-ChildItem *.js

# Remover App.js se existir
Remove-Item App.js -ErrorAction SilentlyContinue

# Remover index.js se existir
Remove-Item index.js -ErrorAction SilentlyContinue
```

### Windows CMD:
```cmd
cd client\src
dir *.js
del App.js
del index.js
```

### Linux/Mac:
```bash
cd client/src
rm -f App.js index.js
```

## ✅ Verificar Arquivos Corretos

Certifique-se de que existem apenas:
- ✅ `main.jsx` (não main.js)
- ✅ `App.jsx` (não App.js)

## 🔄 Limpar Cache e Reiniciar

Após remover os arquivos .js:

```bash
cd client
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Linux/Mac:
rm -rf node_modules/.vite

# Reiniciar
npm run dev
```

## 📝 Nota

O `vite.config.js` foi atualizado para usar **apenas arquivos .jsx**. Arquivos .js não serão mais processados pelo Vite.
