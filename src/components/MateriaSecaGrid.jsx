import React, { useState } from 'react';
import { Box, Typography, Grid, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MATERIA_SECA } from '../constants/index_v3';

const MateriaSecaGrid = ({ onOpenArticle, onBack, darkMode, isSetupComplete }) => {
    const [subView, setSubView] = useState('main'); // 'main', 'TAPS', 'AMPOLLES', 'CAPSULES', 'ETIQUETES'
    const [selectedLabelWine, setSelectedLabelWine] = useState(null); // For labels sub-selection

    const categories = [
        { id: 'TAPS', label: 'TAPS' },
        { id: 'AMPOLLES', label: 'AMPOLLES' },
        { id: 'CAPSULES', label: 'CÀPSULES' },
        { id: 'CAIXES', label: 'CAIXES' },
        { id: 'ETIQUETES', label: 'ETIQUETES' }
    ];

    const renderButtons = (items, prefix = '') => {
        return items.map((item) => (
            <Grid item xs={6} sm={4} md={3} key={prefix + item}>
                <Button
                    variant="outlined"
                    fullWidth
                    disabled={!isSetupComplete}
                    onClick={() => onOpenArticle(`${prefix}${item}`)}
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
                        {item}
                    </Typography>
                </Button>
            </Grid>
        ));
    };

    const renderWineLabels = () => {
        if (selectedLabelWine) {
            return (
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => setSelectedLabelWine(null)}
                            sx={{ mb: 2, fontWeight: 800 }}
                        >
                            Tornar a vins
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => onOpenArticle(`ETIQUETA ${selectedLabelWine}`)}
                            sx={{ height: '90px', borderRadius: '16px', borderWidth: '2px', fontWeight: 900 }}
                        >
                            ETIQUETA
                        </Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => onOpenArticle(`CONTRAETIQUETA ${selectedLabelWine}`)}
                            sx={{ height: '90px', borderRadius: '16px', borderWidth: '2px', fontWeight: 900 }}
                        >
                            CONTRA
                        </Button>
                    </Grid>
                </Grid>
            );
        }

        return (
            <Grid container spacing={2}>
                {MATERIA_SECA.ETIQUETES.map((wine) => (
                    <Grid item xs={6} sm={4} md={3} key={wine}>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setSelectedLabelWine(wine)}
                            sx={{
                                height: '90px',
                                borderWidth: '2px',
                                borderRadius: '16px',
                                borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                                color: 'text.primary',
                                fontWeight: 900,
                                textAlign: 'center'
                            }}
                        >
                            {wine}
                        </Button>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{
            bgcolor: 'background.paper',
            borderRadius: '32px',
            p: { xs: 2.5, sm: 4 },
            boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.05)',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={subView === 'main' ? onBack : () => { setSubView('main'); setSelectedLabelWine(null); }} sx={{ mr: 1 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                    {subView === 'main' ? 'MATERIA SECA' : subView}
                </Typography>
            </Box>

            {!isSetupComplete && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'error.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        ⚠️ Selecciona Responsable i Ubicació per començar
                    </Typography>
                </Box>
            )}

            <Grid container spacing={2}>
                {subView === 'main' && categories.map((cat) => (
                    <Grid item xs={6} sm={4} md={3} key={cat.id}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => setSubView(cat.id)}
                            sx={{
                                height: '120px',
                                borderRadius: '24px',
                                bgcolor: 'primary.main',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>{cat.label}</Typography>
                        </Button>
                    </Grid>
                ))}

                {subView === 'TAPS' && renderButtons(MATERIA_SECA.TAPS, 'TAP ')}
                {subView === 'AMPOLLES' && renderButtons(MATERIA_SECA.AMPOLLES, 'AMPOLLES ')}
                {subView === 'CAPSULES' && renderButtons(MATERIA_SECA.CAPSULES, 'CÀPSULES ')}
                {subView === 'CAIXES' && renderButtons(MATERIA_SECA.CAIXES, 'CAIXES ')}
                {subView === 'ETIQUETES' && renderWineLabels()}
            </Grid>
        </Box>
    );
};

export default MateriaSecaGrid;
