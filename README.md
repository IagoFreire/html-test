# Buscar Gravações - Intelbras

Aplicativo web para buscar e visualizar gravações organizadas por data e agrupadas por câmera.

## Estrutura de Pastas

O aplicativo busca gravações na seguinte estrutura:
```
D:\Intelbras\LocalRecording\ano\mês\dia
```

Exemplo: `D:\Intelbras\LocalRecording\2025\11\19`

## Instalação

1. Instale as dependências:
```bash
npm install
```

## Como Usar

1. Inicie o servidor:
```bash
npm start
```

2. Abra o navegador e acesse:
```
http://localhost:3000
```

3. Selecione uma data no calendário e clique em "Buscar"

4. As gravações serão exibidas agrupadas por câmera

## Funcionalidades

- ✅ Busca de gravações por data
- ✅ Agrupamento automático por câmera
- ✅ Exibição de informações dos arquivos (nome, tamanho, data de modificação)
- ✅ Interface moderna e responsiva
- ✅ Estatísticas de total de arquivos e câmeras

## Configuração

Se o caminho das gravações for diferente, edite a variável `BASE_PATH` no arquivo `server.js`:

```javascript
const BASE_PATH = 'D:\\Intelbras\\LocalRecording';
```
