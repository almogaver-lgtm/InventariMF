import React, { useState } from 'react';
import { Box, Typography, Grid, Button, Card, CardContent, Divider, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import StockCharts from './StockCharts';

const StockDashboard = ({
    stockLevels,
    materialStock,
    chartColors,
    darkMode,
    onArticleClick
}) => {
    const [dashMode, setDashMode] = useState('cards'); // 'cards' or 'charts'
    const [section, setSection] = useState('vins'); // 'vins' or 'material'
    const [activePie, setActivePie] = useState(null);

    // Determines which data to show
    const currentData = section === 'vins' ? stockLevels : (materialStock || {});
    const hasData = Object.keys(currentData).length > 0;

    return (
        <Box sx={{ p: { xs: 0, sm: 2 } }}>
            {/* Main Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Estat de l'Estoc</Typography>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}>
                    {/* Switch between VINE and MATERIAL */}
                    <ToggleButtonGroup
                        value={section}
                        exclusive
                        onChange={(e, val) => val && setSection(val)}
                        size="medium"
                        sx={{ bgcolor: 'background.paper', borderRadius: '14px', '& .MuiToggleButton-root': { fontWeight: 900, px: 3, borderRadius: '12px !important' } }}
                    >
                        <ToggleButton value="vins" sx={{ gap: 1 }}>🍷 Vins</ToggleButton>
                        <ToggleButton value="material" sx={{ gap: 1 }}>📦 Material</ToggleButton>
                    </ToggleButtonGroup>

                    {/* View mode: List or Charts */}
                    <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '12px', p: 0.5, alignSelf: 'center' }}>
                        <Button
                            size="small"
                            onClick={() => setDashMode('cards')}
                            variant={dashMode === 'cards' ? 'contained' : 'text'}
                            sx={{ borderRadius: '10px', px: 2, fontWeight: 800 }}
                        >Llista</Button>
                        <Button
                            size="small"
                            onClick={() => setDashMode('charts')}
                            variant={dashMode === 'charts' ? 'contained' : 'text'}
                            sx={{ borderRadius: '10px', px: 2, fontWeight: 800 }}
                        >Gràfics</Button>
                    </Box>
                </Box>
            </Box>

            {/* List vs Charts View */}
            {!hasData ? (
                <Alert severity="info" sx={{ borderRadius: 6, py: 2 }}>
                    <Typography sx={{ fontWeight: 800 }}>Encara no hi ha dades per a {section === 'vins' ? 'vins' : 'material'}.</Typography>
                    Sincronitza o afegeix registres per començar a veure l'estoc.
                </Alert>
            ) : (
                dashMode === 'cards' ? (
                    <Grid container spacing={2.5}>
                        {Object.entries(currentData).map(([name, data]) => (
                            <Grid item xs={12} sm={6} md={4} key={name}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover', transform: 'translateY(-4px)' },
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                        borderWidth: '2px'
                                    }}
                                    onClick={() => section === 'vins' && onArticleClick(name)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, textTransform: 'uppercase', opacity: 0.5, letterSpacing: 1 }}>
                                            {section === 'material' ? 'Materia Seca' : 'Vi / Cervesa'}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, height: '3.6rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {name}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                                            {data.total} <small style={{ fontSize: '1.2rem', opacity: 0.7 }}>{section === 'material' ? 'u.' : 'u.'}</small>
                                        </Typography>

                                        {section === 'vins' && (
                                            <>
                                                <Divider sx={{ mb: 2 }} />
                                                <Box sx={{ display: 'flex', gap: 3 }}>
                                                    <Box>
                                                        <Typography variant="caption" display="block" sx={{ fontWeight: 800, opacity: 0.6 }}>CELLER</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 900 }}>{data.celler || 0}</Typography>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" display="block" sx={{ fontWeight: 800, opacity: 0.6 }}>EL PLA</Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 900 }}>{data.pla || 0}</Typography>
                                                    </Box>
                                                </Box>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <StockCharts
                        stockLevels={currentData}
                        section={section} // NOU
                        activePie={activePie}
                        setActivePie={setActivePie}
                        chartColors={chartColors}
                        darkMode={darkMode}
                        onArticleClick={onArticleClick}
                    />
                )
            )}
        </Box>
    );
};

export default StockDashboard;
