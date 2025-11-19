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
  CardActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Videocam as VideocamIcon,
  Folder as FolderIcon,
  PlayArrow as PlayIcon,
  AccessTime as TimeIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f5f5',
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!selectedDate) {
      setError('Por favor, selecione uma data');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const [year, month, day] = selectedDate.split('-');
      const response = await fetch(`${API_BASE_URL}/recordings/${year}/${month}/${day}`);
      const data = await response.json();

      if (data.success) {
        setResults(data);
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <VideocamIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Buscar Gravações Intelbras
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Buscar Gravações por Data
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
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
              <Button
                variant="contained"
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={loading}
                sx={{ minWidth: 150, height: 56 }}
              >
                Buscar
              </Button>
            </Box>
          </Paper>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Box sx={{ textAlign: 'center' }}>
                <CircularProgress size={60} />
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
              <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
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
                <Grid container spacing={3}>
                  {Object.keys(results.recordings)
                    .sort()
                    .map((cameraName) => (
                      <Grid item xs={12} key={cameraName}>
                        <Card elevation={3}>
                          <CardHeader
                            avatar={<VideocamIcon color="primary" />}
                            title={cameraName}
                            subheader={`${results.recordings[cameraName].length} gravação(ões)`}
                            sx={{ bgcolor: 'primary.main', color: 'white' }}
                            titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                            subheaderTypographyProps={{ color: 'rgba(255,255,255,0.8)' }}
                          />
                          <CardContent sx={{ p: 0 }}>
                            <List>
                              {results.recordings[cameraName].map((recording, index) => (
                                <React.Fragment key={index}>
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
                                          />
                                          <Chip
                                            icon={<TimeIcon />}
                                            label={formatDateTime(recording.modified)}
                                            size="small"
                                            variant="outlined"
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
                                  {index < results.recordings[cameraName].length - 1 && <Divider />}
                                </React.Fragment>
                              ))}
                            </List>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                </Grid>
              )}
            </Box>
          )}

          {!results && !loading && !error && (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <VideocamIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
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
