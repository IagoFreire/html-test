import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  AppBar,
  Toolbar,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Videocam as VideocamIcon,
  Folder as FolderIcon,
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
  Storage as StorageIcon,
  FilterList as FilterIcon,
  Timeline as TimelineIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Tema verde
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Verde principal
      light: '#81c784',
      dark: '#388e3c',
      contrastText: '#fff',
    },
    secondary: {
      main: '#66bb6a', // Verde secundário
      light: '#a5d6a7',
      dark: '#43a047',
    },
    background: {
      default: '#f1f8f4', // Verde muito claro
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Componente Timeline para visualizar gravações
// Componente de Lista tradicional
function ListView({ recordings, onPlayClick, formatDateTime }) {
  return (
    <List>
      {recordings.map((recording, recIndex) => (
        <React.Fragment key={recIndex}>
          <ListItem>
            <ListItemText
              primary={
                <Typography variant="body1" fontWeight={500}>
                  {recording.displayName || recording.name}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<StorageIcon />}
                    label={recording.sizeFormatted}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                  />
                  <Chip
                    icon={<TimeIcon />}
                    label={formatDateTime(recording.modified)}
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                  />
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                color="primary"
                onClick={() => onPlayClick(recording)}
                aria-label="abrir"
              >
                <PlayIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          {recIndex < recordings.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
}

// Componente Timeline para visualizar gravações
function TimelineView({ recordings, onPlayClick }) {
  // Criar array de 24 horas
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Agrupar gravações por hora
  const recordingsByHour = {};
  recordings.forEach(rec => {
    const hour = rec.hour !== undefined ? rec.hour : 0;
    if (!recordingsByHour[hour]) {
      recordingsByHour[hour] = [];
    }
    recordingsByHour[hour].push(rec);
  });
  
  // Calcular estatísticas
  const totalRecordings = recordings.length;
  const sortedRecordings = [...recordings].sort((a, b) => 
    ((a.hour || 0) * 60 + (a.minute || 0)) - ((b.hour || 0) * 60 + (b.minute || 0))
  );
  const firstRecording = sortedRecordings.length > 0 ? 
    `${(sortedRecordings[0].hour || 0).toString().padStart(2, '0')}:${(sortedRecordings[0].minute || 0).toString().padStart(2, '0')}` : '';
  const lastRecording = sortedRecordings.length > 0 ? 
    `${(sortedRecordings[sortedRecordings.length - 1].hour || 0).toString().padStart(2, '0')}:${(sortedRecordings[sortedRecordings.length - 1].minute || 0).toString().padStart(2, '0')}` : '';
  
  return (
    <Box sx={{ p: 2 }}>
      {/* Resumo */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Chip label={`${totalRecordings} gravações`} color="primary" size="small" />
        {firstRecording && <Chip label={`Primeira: ${firstRecording}`} size="small" />}
        {lastRecording && <Chip label={`Última: ${lastRecording}`} size="small" />}
      </Box>
      
      {/* Cabeçalho com horas */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(24, 1fr)', 
        gap: 0.5,
        mb: 2,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1,
        pb: 1
      }}>
        {hours.map(hour => (
          <Box 
            key={hour} 
            sx={{ 
              textAlign: 'center', 
              fontSize: '0.75rem',
              color: recordingsByHour[hour] ? 'primary.main' : 'text.secondary',
              fontWeight: recordingsByHour[hour] ? 'bold' : 'normal'
            }}
          >
            {hour.toString().padStart(2, '0')}h
          </Box>
        ))}
      </Box>
      
      {/* Linha do tempo */}
      <Box sx={{ position: 'relative', height: 80 }}>
        {/* Linha de base */}
        <Box sx={{ 
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 2,
          bgcolor: 'divider',
          transform: 'translateY(-50%)'
        }} />
        
        {/* Marcadores de hora */}
        {hours.map(hour => {
          const position = (hour / 24) * 100;
          const hasRecordings = recordingsByHour[hour];
          
          return (
            <Box
              key={`marker-${hour}`}
              sx={{
                position: 'absolute',
                left: `${position}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: hasRecordings ? 6 : 2,
                height: hasRecordings ? 20 : 10,
                bgcolor: hasRecordings ? 'primary.light' : 'divider',
                borderRadius: 1,
              }}
            />
          );
        })}
        
        {/* Marcadores de gravação */}
        {recordings.map((recording, index) => {
          const hour = recording.hour || 0;
          const minute = recording.minute || 0;
          const position = ((hour * 60 + minute) / (24 * 60)) * 100;
          
          return (
            <Tooltip 
              key={index}
              title={
                <Box>
                  <Typography variant="body2">{recording.displayName}</Typography>
                  <Typography variant="caption">{recording.sizeFormatted}</Typography>
                </Box>
              }
              arrow
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: `${position}%`,
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  zIndex: 5,
                  '&:hover': {
                    width: 20,
                    height: 20,
                    bgcolor: 'primary.dark',
                    zIndex: 10
                  }
                }}
                onClick={() => onPlayClick(recording)}
              />
            </Tooltip>
          );
        })}
      </Box>
      
      {/* Lista detalhada das gravações */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
          Detalhes das gravações
        </Typography>
        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {recordings
            .sort((a, b) => ((a.hour || 0) * 60 + (a.minute || 0)) - ((b.hour || 0) * 60 + (b.minute || 0)))
            .map((recording, index) => (
              <Paper 
                key={index} 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'primary.light',
                    transform: 'translateX(8px)'
                  }
                }}
                onClick={() => onPlayClick(recording)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={recording.displayName} 
                    color="primary" 
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {recording.sizeFormatted}
                  </Typography>
                </Box>
                <IconButton size="small" color="primary">
                  <PlayIcon />
                </IconButton>
              </Paper>
            ))}
        </Box>
      </Box>
    </Box>
  );
}

function App() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedCamera, setSelectedCamera] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' ou 'list'

  const handleSearch = async () => {
    if (!selectedDate) {
      setError('Por favor, selecione uma data');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setTabValue(0);

    try {
      const [year, month, day] = selectedDate.split('-');
      let url = `${API_BASE_URL}/recordings/${year}/${month}/${day}`;
      
      // Adicionar filtro de câmera se selecionado
      if (selectedCamera) {
        url += `?camera=${encodeURIComponent(selectedCamera)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setResults(data);
        // Resetar para a primeira aba quando os resultados mudarem
        setTabValue(0);
      } else {
        setError(data.message || 'Nenhuma gravação encontrada para esta data');
      }
    } catch (err) {
      console.error('Erro ao buscar gravações:', err);
      setError('Erro ao conectar com o servidor. Verifique se o servidor está rodando.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const openFile = (recording) => {
    const url = `${API_BASE_URL}/file/${recording.year}/${recording.month}/${recording.day}/${encodeURIComponent(recording.name)}`;
    window.open(url, '_blank');
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Obter lista de câmeras para o filtro (todas as câmeras disponíveis)
  // Se houver resultados, usar a lista de câmeras retornada pela API
  // Caso contrário, usar as câmeras dos resultados anteriores (se houver)
  const availableCameras = results?.cameras || [];

  // Obter câmeras dos resultados atuais (após filtro aplicado)
  const currentCameras = results ? Object.keys(results.recordings).sort() : [];

  // Para as abas, usar sempre as câmeras dos resultados atuais
  // Se houver filtro aplicado, mostrará apenas a câmera filtrada
  const camerasForTabs = currentCameras;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
          <Toolbar>
            <VideocamIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Buscar Gravações Intelbras
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3, color: 'primary.dark' }}>
              Buscar Gravações por Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <TextField
                label="Selecione a data"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                onKeyPress={handleKeyPress}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flexGrow: 1, minWidth: 200 }}
              />
              <FormControl sx={{ minWidth: 250 }} disabled={!availableCameras.length && !results}>
                <InputLabel id="camera-filter-label">Filtrar por Câmera (Opcional)</InputLabel>
                <Select
                  labelId="camera-filter-label"
                  id="camera-filter"
                  value={selectedCamera}
                  label="Filtrar por Câmera (Opcional)"
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  startAdornment={<FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="">
                    <em>Todas as câmeras</em>
                  </MenuItem>
                  {availableCameras.map((camera) => (
                    <MenuItem key={camera} value={camera}>
                      {camera}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
                sx={{ minWidth: 150, height: 56, bgcolor: 'primary.main' }}
              >
                Buscar
              </Button>
            </Box>
          </Paper>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Buscando gravações...
                </Typography>
              </Box>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {results && !loading && (
            <Box>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  mb: 3, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                }}
              >
                <Typography variant="h5" gutterBottom>
                  Gravações de {results.date}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<FolderIcon />}
                    label={`${results.totalFiles} arquivo(s)`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    icon={<VideocamIcon />}
                    label={`${results.totalCameras} câmera(s)`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </Paper>

              {Object.keys(results.recordings).length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.secondary">
                    Nenhuma gravação encontrada
                  </Typography>
                </Paper>
              ) : (
                <Paper elevation={3}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      '& .MuiTab-root': {
                        color: 'text.secondary',
                        '&.Mui-selected': {
                          color: 'primary.main',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        bgcolor: 'primary.main',
                      },
                    }}
                  >
                    {camerasForTabs.map((camera, index) => (
                      <Tab
                        key={camera}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VideocamIcon fontSize="small" />
                            <span>{camera}</span>
                            <Chip
                              label={results.recordings[camera]?.length || 0}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.75rem',
                                bgcolor: 'primary.light',
                                color: 'white',
                              }}
                            />
                          </Box>
                        }
                      />
                    ))}
                  </Tabs>

                  {camerasForTabs.map((camera, index) => (
                    <Box
                      key={camera}
                      role="tabpanel"
                      hidden={tabValue !== index}
                      sx={{ p: 3 }}
                    >
                      {tabValue === index && results.recordings[camera] && (
                        <Card elevation={2}>
                          <CardHeader
                            avatar={<VideocamIcon color="primary" />}
                            title={camera}
                            subheader={`${results.recordings[camera].length} gravação(ões)`}
                            sx={{ 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'
                            }}
                            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            subheaderTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                            action={
                              <Tooltip title={viewMode === 'timeline' ? 'Ver como lista' : 'Ver como linha do tempo'}>
                                <IconButton 
                                  onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
                                  sx={{ color: 'white' }}
                                >
                                  {viewMode === 'timeline' ? <ListIcon /> : <TimelineIcon />}
                                </IconButton>
                              </Tooltip>
                            }
                          />
                          <CardContent sx={{ p: 0 }}>
                            {viewMode === 'timeline' ? (
                              <TimelineView 
                                recordings={results.recordings[camera]} 
                                onPlayClick={openFile}
                              />
                            ) : (
                              <ListView
                                recordings={results.recordings[camera]}
                                onPlayClick={openFile}
                                formatDateTime={formatDateTime}
                              />
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          )}

          {!results && !loading && !error && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <VideocamIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Selecione uma data para buscar gravações
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
