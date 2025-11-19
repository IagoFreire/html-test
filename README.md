# Buscar Gravações - Intelbras

Aplicativo web moderno desenvolvido com React e Material UI para buscar e visualizar gravações organizadas por data e agrupadas por câmera.

## 🚀 Tecnologias

- **Frontend**: React 18 + Vite + Material UI 5 (Tema Verde)
- **Backend**: Node.js + Express
- **Estrutura**: Monorepo com cliente e servidor separados

## 📁 Estrutura de Pastas

O aplicativo busca gravações na seguinte estrutura:
```
D:\Intelbras\LocalRecording\ano\mês\dia
```

Exemplo: `D:\Intelbras\LocalRecording\2025\11\19`

## ✨ Funcionalidades

- ✅ Interface moderna com Material UI (Tema Verde)
- ✅ Busca de gravações por data
- ✅ **Filtro por câmera** na busca
- ✅ **Agrupamento por abas (Tabs)** - cada câmera em uma aba
- ✅ Reconhecimento de câmeras com nomes compostos (ex: "Portão - Esquerda", "Casa - Quintal")
- ✅ Exibição de informações dos arquivos (nome, tamanho, data de modificação)
- ✅ Design responsivo
- ✅ Estatísticas de total de arquivos e câmeras
- ✅ Botão para abrir/visualizar cada gravação

## 📦 Instalação

### 1. Instalar dependências do backend
```bash
npm install
```

### 2. Instalar dependências do frontend
```bash
cd client
npm install
cd ..
```

## 🎯 Como Usar

### Desenvolvimento (Frontend e Backend separados)

1. Inicie o servidor backend:
```bash
npm run dev
```

2. Em outro terminal, inicie o frontend React:
```bash
npm run client
```

Ou execute ambos simultaneamente:
```bash
npm run dev:all
```

3. Acesse no navegador:
```
http://localhost:3001 (frontend React com Vite)
http://localhost:3000 (backend API)
```

**Nota**: O Vite é muito mais rápido que o Create React App para desenvolvimento!

### Produção

1. Construa o frontend:
```bash
npm run client:build
```

2. Configure a variável de ambiente:
```bash
export NODE_ENV=production
```

3. Inicie o servidor:
```bash
npm start
```

4. Acesse:
```
http://localhost:3000
```

## 🎨 Recursos do Material UI

- Tema verde personalizado
- Componentes modernos e acessíveis
- Design responsivo
- Ícones Material Design
- Cards e Listas estilizadas
- **Tabs (Abas) para agrupar por câmera**
- **Filtro de câmera no formulário de busca**

## ⚙️ Configuração

Se o caminho das gravações for diferente, edite a variável `BASE_PATH` no arquivo `server.js`:

```javascript
const BASE_PATH = 'D:\\Intelbras\\LocalRecording';
```

## 📝 Scripts Disponíveis

- `npm start` - Inicia o servidor em produção
- `npm run dev` - Inicia o servidor em modo desenvolvimento (com nodemon)
- `npm run client` - Inicia o frontend React em desenvolvimento
- `npm run client:build` - Constrói o frontend para produção
- `npm run dev:all` - Inicia backend e frontend simultaneamente

## 🔍 Reconhecimento de Câmeras

O sistema reconhece automaticamente câmeras com nomes compostos:
- "Portão - Esquerda"
- "Portão - Direita"
- "Casa - Quintal"
- E outros padrões similares

Cada câmera aparece em uma aba separada para fácil navegação.
