import React from 'react';
import { Box, Typography, Grid, Button, TextField, Tooltip } from '@mui/material';

const ProductGrid = ({
    articles,
    onOpenArticle,
    usuari,
    setUsuari,
    usuaris,
    ubicacio,
    setUbicacio,
    ubicacions,
    darkMode
}) => {
    const isSetupComplete = usuari && ubicacio;

    return (
        <Box sx={{
            bgcolor: 'background.paper',
            borderRadius: '32px',
            p: { xs: 2.5, sm: 4 },
            boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.05)',
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>Productes</Typography>
                <Button variant="outlined" size="small" onClick={() => {
                    const name = window.prompt("Nom article:")?.toUpperCase();
                    if (name) {
                        // This logic will be handled in App.jsx via a callback if needed
                        // for now just a placeholder for the refactor
                    }
                }}>+ Nou</Button>
            </Box>

            {!isSetupComplete && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'error.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        ⚠️ Selecciona Responsable i Ubicació per començar
                    </Typography>
                </Box>
            )}

            <Grid container spacing={2}>
                {articles.map((article) => (
                    <Grid item xs={6} sm={4} md={3} key={article}>
                        <Tooltip title={!isSetupComplete ? "Selecciona responsable i ubicació" : ""} arrow>
                            <span>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    disabled={!isSetupComplete}
                                    onClick={() => onOpenArticle(article)}
                                    sx={{
                                        height: '90px',
                                        borderWidth: '2px',
                                        borderRadius: '16px',
                                        borderColor: !isSetupComplete
                                            ? 'divider'
                                            : (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'),
                                        bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'transparent',
                                        flexDirection: 'column',
                                        color: 'text.primary',
                                        '&:hover': {
                                            borderWidth: '2px',
                                            borderColor: 'primary.main',
                                            bgcolor: darkMode ? 'rgba(114, 47, 55, 0.1)' : 'rgba(114, 47, 55, 0.04)',
                                        },
                                        transition: 'all 0.2s ease',
                                        opacity: !isSetupComplete ? 0.5 : 1
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 900, textAlign: 'center', lineHeight: 1.2 }}>
                                        {article}
                                    </Typography>
                                </Button>
                            </span>
                        </Tooltip>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{
                            fontWeight: 900,
                            color: !usuari ? 'error.main' : 'text.secondary',
                            display: 'block',
                            mb: 1
                        }}>
                            RESPONSABLE {!usuari && '*'}
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={usuari}
                            onChange={(e) => setUsuari(e.target.value)}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            error={!usuari}
                            sx={{ '& select': { fontWeight: 800, py: 1.5 } }}
                        >
                            <option value="">-- Tria responsable --</option>
                            {usuaris.map(u => <option key={u} value={u}>{u}</option>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" sx={{
                            fontWeight: 900,
                            color: !ubicacio ? 'error.main' : 'text.secondary',
                            display: 'block',
                            mb: 1
                        }}>
                            UBICACIÓ {!ubicacio && '*'}
                        </Typography>
                        <TextField
                            select
                            fullWidth
                            value={ubicacio}
                            onChange={(e) => setUbicacio(e.target.value)}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            error={!ubicacio}
                            sx={{ '& select': { fontWeight: 800, py: 1.5 } }}
                        >
                            <option value="">-- Tria ubicació --</option>
                            {ubicacions.map(u => <option key={u} value={u}>{u}</option>)}
                        </TextField>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default ProductGrid;
