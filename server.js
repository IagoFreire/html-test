const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Habilitar CORS
app.use(cors());
app.use(express.json());

// Caminho base das gravações
const BASE_PATH = 'D:\\Intelbras\\LocalRecording';

// Função para listar arquivos em um diretório
async function listFiles(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const fileList = [];
    
    for (const file of files) {
      if (file.isFile()) {
        const filePath = path.join(dirPath, file.name);
        const stats = await fs.stat(filePath);
        fileList.push({
          name: file.name,
          path: filePath,
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
    
    return fileList;
  } catch (error) {
    return [];
  }
}

// Função para extrair o nome da câmera do nome do arquivo
function extractCameraName(filename) {
  // Padrões específicos: Portão - Esquerda, Portão - Direita, Casa - Quintal
  // Exemplos: 
  // - Portao - Esquerda_20251119_143022.mp4
  // - Casa - Quintal_20251119_143022.mp4
  // - Portao-Esquerda_20251119_143022.mp4
  
  // Primeiro, tentar padrões com hífen e espaço (ex: "Portão - Esquerda")
  // Procura por padrão: texto - texto seguido de underscore ou data
  const patternWithSpace = /^([A-Za-zÀ-ÿ\s]+?)\s*-\s*([A-Za-zÀ-ÿ\s]+?)(?:_|\d{4})/;
  const matchWithSpace = filename.match(patternWithSpace);
  if (matchWithSpace) {
    const part1 = matchWithSpace[1].trim();
    const part2 = matchWithSpace[2].trim();
    // Se tiver duas partes separadas por " - ", juntar
    if (part1 && part2 && !/^\d/.test(part2)) {
      return `${part1} - ${part2}`;
    }
  }
  
  // Tentar padrões com hífen sem espaço (ex: "Portao-Esquerda")
  const patternWithHyphen = /^([A-Za-zÀ-ÿ\s]+?)-([A-Za-zÀ-ÿ\s]+?)(?:_|\d{4})/;
  const matchWithHyphen = filename.match(patternWithHyphen);
  if (matchWithHyphen) {
    const part1 = matchWithHyphen[1].trim();
    const part2 = matchWithHyphen[2].trim();
    if (part1 && part2 && !/^\d/.test(part2)) {
      return `${part1} - ${part2}`;
    }
  }
  
  // Padrões comuns de nomenclatura de câmeras Intelbras:
  // CAM01_20251119_143022.mp4
  // Camera-01_2025-11-19_14-30-22.mp4
  // CH01_20251119_143022.mp4
  // Canal01_20251119_143022.mp4
  // IPC_01_20251119_143022.mp4
  
  const patterns = [
    /^([A-Z]+[0-9]+)_/,           // CAM01_, CH01_, IPC_01_
    /^([A-Za-z]+-[0-9]+)_/,        // Camera-01_, Canal-01_
    /^([A-Za-z]+_[0-9]+)_/,        // Camera_01_, Canal_01_
    /^([^_]+)_/,                   // Qualquer coisa antes do primeiro _
    /^([^-]+)-/,                   // Qualquer coisa antes do primeiro -
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      // Remover extensão se houver
      let cameraName = match[1];
      // Verificar se não é uma data (não começa com números)
      if (!/^\d{4}/.test(cameraName)) {
        return cameraName;
      }
    }
  }
  
  // Se não encontrar padrão, tenta pegar a primeira parte antes de números de data
  const datePattern = /(\d{4}[-_]\d{2}[-_]\d{2})/;
  const dateMatch = filename.match(datePattern);
  if (dateMatch) {
    const beforeDate = filename.substring(0, filename.indexOf(dateMatch[1]));
    if (beforeDate) {
      return beforeDate.replace(/[_-]+$/, '').trim() || 'Desconhecida';
    }
  }
  
  // Último recurso: pegar primeira parte separada por _ ou -
  const parts = filename.split(/[_-]/);
  return parts[0] || 'Desconhecida';
}

// Endpoint para buscar gravações por data
app.get('/api/recordings/:year/:month/:day', async (req, res) => {
  try {
    const { year, month, day } = req.params;
    const { camera } = req.query; // Filtro opcional por câmera
    
    // Construir o caminho: D:\Intelbras\LocalRecording\ano\mês\dia
    const recordingsPath = path.join(BASE_PATH, year, month, day);
    
    // Verificar se o diretório existe
    try {
      await fs.access(recordingsPath);
    } catch (error) {
      return res.json({
        success: false,
        message: 'Diretório não encontrado para esta data',
        recordings: {},
        cameras: []
      });
    }
    
    // Listar todos os arquivos
    const files = await listFiles(recordingsPath);
    
    // Agrupar por câmera
    const recordingsByCamera = {};
    const camerasSet = new Set();
    
    files.forEach(file => {
      const cameraName = extractCameraName(file.name);
      camerasSet.add(cameraName);
      
      // Se houver filtro de câmera, pular se não corresponder
      if (camera && cameraName !== camera) {
        return;
      }
      
      if (!recordingsByCamera[cameraName]) {
        recordingsByCamera[cameraName] = [];
      }
      
      recordingsByCamera[cameraName].push({
        name: file.name,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        modified: file.modified.toISOString(),
        path: file.path,
        year: year,
        month: month,
        day: day
      });
    });
    
    // Ordenar arquivos por data de modificação dentro de cada câmera
    Object.keys(recordingsByCamera).forEach(camera => {
      recordingsByCamera[camera].sort((a, b) => 
        new Date(a.modified) - new Date(b.modified)
      );
    });
    
    // Lista de todas as câmeras disponíveis (ordenada)
    const cameras = Array.from(camerasSet).sort();
    
    res.json({
      success: true,
      date: `${day}/${month}/${year}`,
      totalFiles: camera ? recordingsByCamera[camera]?.length || 0 : files.length,
      totalCameras: Object.keys(recordingsByCamera).length,
      recordings: recordingsByCamera,
      cameras: cameras // Lista de todas as câmeras disponíveis
    });
    
  } catch (error) {
    console.error('Erro ao buscar gravações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar gravações',
      error: error.message
    });
  }
});

// Função para formatar tamanho de arquivo
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Endpoint para servir arquivos de gravação
app.get('/api/file/:year/:month/:day/:filename', async (req, res) => {
  try {
    const { year, month, day, filename } = req.params;
    const filePath = path.join(BASE_PATH, year, month, day, filename);
    
    // Verificar se o arquivo existe
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    // Verificar se está dentro do diretório base (segurança)
    const resolvedPath = path.resolve(filePath);
    const resolvedBase = path.resolve(BASE_PATH);
    
    if (!resolvedPath.startsWith(resolvedBase)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }
    
    // Enviar arquivo
    res.sendFile(resolvedPath);
    
  } catch (error) {
    console.error('Erro ao servir arquivo:', error);
    res.status(500).json({ error: 'Erro ao servir arquivo' });
  }
});

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // Em desenvolvimento, servir pasta public antiga se necessário
  app.use(express.static('public'));
}

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Buscando gravações em: ${BASE_PATH}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'desenvolvimento'}`);
});
