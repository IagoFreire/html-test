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
  // Exemplos reais de arquivos DAV da Intelbras:
  // - Portao - Direita-Ch.0-Portao - Direita-2025-11-19-12-29-56.dav
  // - Portao - Esquerda-Ch.0-Portao - Esquerda-2025-11-19-12-29-56.dav
  // - Casa - Quintal-Ch.0-Casa - Quintal-2025-11-19-12-29-56.dav
  
  // Para arquivos DAV com formato: NomeCamara-Ch.X-NomeCamara-Data.dav
  // O nome da câmera aparece antes de "-Ch."
  if (filename.includes('-Ch.')) {
    const beforeChannel = filename.split('-Ch.')[0];
    // Retornar o nome completo antes de "-Ch."
    if (beforeChannel && beforeChannel.length > 0) {
      return beforeChannel;
    }
  }
  
  // Para outros formatos, tentar padrões com hífen e espaço
  const patternWithSpace = /^([A-Za-zÀ-ÿ\s]+\s*-\s*[A-Za-zÀ-ÿ\s]+?)(?:-Ch\.|_|\d)/;
  const matchWithSpace = filename.match(patternWithSpace);
  if (matchWithSpace) {
    return matchWithSpace[1].trim();
  }
  
  // Padrões comuns de nomenclatura
  const patterns = [
    /^([A-Z]+[0-9]+)_/,           // CAM01_, CH01_
    /^([A-Za-z]+-[0-9]+)_/,       // Camera-01_
    /^([^_]+)_/,                  // Qualquer coisa antes do primeiro _
    /^([^-]+)-/,                  // Qualquer coisa antes do primeiro -
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match && match[1]) {
      let cameraName = match[1];
      if (!/^\d{4}/.test(cameraName)) {
        return cameraName;
      }
    }
  }
  
  // Último recurso
  const parts = filename.split(/[_-]/);
  return parts[0] || 'Desconhecida';
}

// Endpoint para listar todas as câmeras disponíveis
app.get('/api/cameras', async (req, res) => {
  try {
    const cameras = new Set();
    
    // Função recursiva para percorrer diretórios
    async function scanDirectory(dirPath) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          
          if (entry.isDirectory()) {
            // Se for um diretório, verificar se é ano (4 dígitos)
            if (/^\d{4}$/.test(entry.name)) {
              await scanDirectory(fullPath);
            }
          } else if (entry.isFile() && (entry.name.endsWith('.mp4') || entry.name.endsWith('.dav'))) {
            const cameraName = extractCameraName(entry.name);
            cameras.add(cameraName);
          }
        }
      } catch (error) {
        console.error(`Erro ao escanear diretório ${dirPath}:`, error);
      }
    }
    
    // Começar a varredura do diretório base
    await scanDirectory(BASE_PATH);
    
    res.json({
      success: true,
      totalCameras: cameras.size,
      cameras: Array.from(cameras).sort()
    });
    
  } catch (error) {
    console.error('Erro ao listar câmeras:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar câmeras',
      error: error.message
    });
  }
});

// Endpoint de teste para verificar extração de nomes de câmeras
app.get('/api/test/camera-names', (req, res) => {
  const testFiles = [
    // Formato real dos arquivos DAV
    'Portao - Direita-Ch.0-Portao - Direita-2025-11-19-12-29-56.dav',
    'Portao - Esquerda-Ch.0-Portao - Esquerda-2025-11-19-12-29-56.dav',
    'Casa - Quintal-Ch.0-Casa - Quintal-2025-11-19-12-29-56.dav',
    // Outros formatos possíveis
    'Portao - Esquerda_20251119_143022.mp4',
    'Portao - Direita_20251119_143022.mp4',
    'Casa - Quintal_20251119_143022.mp4',
    'Portao-Esquerda_20251119_143022.mp4',
    'Portao-Direita_20251119_143022.mp4',
    'Casa-Quintal_20251119_143022.mp4',
    'CAM01_20251119_143022.mp4',
    'Camera-01_2025-11-19_14-30-22.mp4',
    'CH01_20251119_143022.mp4'
  ];

  const results = testFiles.map(filename => ({
    filename,
    extractedName: extractCameraName(filename)
  }));

  res.json({
    success: true,
    results
  });
});

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
      
      // Extrair hora e minuto para a timeline
      const dateTimePattern = /(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/;
      const timeMatch = file.name.match(dateTimePattern);
      let hour = 0;
      let minute = 0;
      
      if (timeMatch) {
        hour = parseInt(timeMatch[4], 10);
        minute = parseInt(timeMatch[5], 10);
      }
      
      recordingsByCamera[cameraName].push({
        name: file.name,
        displayName: formatDisplayName(file.name, cameraName),
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        modified: file.modified.toISOString(),
        path: file.path,
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        timeInMinutes: hour * 60 + minute // Para facilitar posicionamento na timeline
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

// Função para formatar nome do arquivo para exibição
function formatDisplayName(filename, cameraName) {
  // Extrair data e hora do nome do arquivo
  // Padrão: 2025-11-19-12-29-56
  const dateTimePattern = /(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})-(\d{2})/;
  const match = filename.match(dateTimePattern);
  
  if (match) {
    const [_, year, month, day, hour, minute, second] = match;
    // Retornar apenas hora:minuto
    return `${hour}:${minute}`;
  }
  
  // Se não encontrar o padrão, retornar nome simplificado
  return filename
    .replace(/\.(mp4|dav)$/i, '')
    .replace(new RegExp(`${cameraName}-Ch\\.\\d+-${cameraName}-`, 'g'), '')
    .replace(/-/g, ' ');
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
}

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Buscando gravações em: ${BASE_PATH}`);
  console.log(`Modo: ${process.env.NODE_ENV || 'desenvolvimento'}`);
});
