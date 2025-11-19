# 🔧 Instruções para Corrigir o Erro

O erro ocorre porque há um arquivo `App.js` (não `.jsx`) no seu sistema local. Siga estes passos:

## Passo 1: Verificar e renomear App.js

No seu sistema local, verifique se existe `client/src/App.js`:

```bash
cd client/src
ls -la App.*
```

Se existir `App.js`, renomeie para `App.jsx`:

```bash
mv App.js App.jsx
```

## Passo 2: Remover index.html duplicado

Remova o `index.html` da pasta `public/` se existir:

```bash
cd client
rm -f public/index.html
```

Ou no Windows:
```cmd
cd client
del public\index.html
```

## Passo 3: Limpar cache e reinstalar

```bash
cd client
rm -rf node_modules/.vite
npm install
npm run dev
```

## Passo 4: Verificar estrutura de arquivos

A estrutura correta deve ser:

```
client/
├── index.html          (na raiz)
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx        (não main.js)
    ├── App.jsx         (não App.js)
    └── index.css
```

**IMPORTANTE**: Todos os arquivos React devem ter extensão `.jsx`, não `.js`!
