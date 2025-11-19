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
} from '@mui/material';
import {
  Search as SearchIcon,
  Videocam as VideocamIcon,
  Folder as FolderIcon,
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
  Storage as StorageIcon,
  FilterList as FilterIcon,
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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
                          />
                          <CardContent sx={{ p: 0 }}>
                            <List>
                              {results.recordings[camera].map((recording, recIndex) => (
                                <React.Fragment key={recIndex}>
                                  <ListItem>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body1" fontWeight={500}>
                                          {recording.name}
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
                                        onClick={() => openFile(recording)}
                                        aria-label="abrir"
                                      >
                                        <PlayIcon />
                                      </IconButton>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                  {recIndex < results.recordings[camera].length - 1 && <Divider />}
                                </React.Fragment>
                              ))}
                            </List>
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
