import React, { useState } from 'react';
import { Box, Typography, Grid, Button, Card, CardContent, Divider, Alert } from '@mui/material';
import StockCharts from './StockCharts';

const StockDashboard = ({
    stockLevels,
    chartColors,
    darkMode,
    onArticleClick
}) => {
    const [dashMode, setDashMode] = useState('cards'); // 'cards' or 'charts'
    const [activePie, setActivePie] = useState(null);

    return (
        <Box sx={{ p: { xs: 0, sm: 2 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>Estat de l'Estoc</Typography>
                <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '12px', p: 0.5 }}>
                    <Button
                        size="small"
                        onClick={() => setDashMode('cards')}
                        variant={dashMode === 'cards' ? 'contained' : 'text'}
                        sx={{ borderRadius: '10px' }}
                    >Llista</Button>
                    <Button
                        size="small"
                        onClick={() => setDashMode('charts')}
                        variant={dashMode === 'charts' ? 'contained' : 'text'}
                        sx={{ borderRadius: '10px' }}
                    >Gràfics</Button>
                </Box>
            </Box>

            {Object.keys(stockLevels).length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 4 }}>Sincronitza primer per veure dades del Drive.</Alert>
            ) : (
                dashMode === 'cards' ? (
                    <Grid container spacing={2}>
                        {Object.entries(stockLevels).map(([name, data]) => (
                            <Grid item xs={12} sm={6} md={4} key={name}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        borderRadius: 5,
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => onArticleClick(name)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', mb: 1, fontSize: '1.2rem' }}>
                                            {name}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>
                                            {data.total} <small style={{ fontSize: '0.9rem', opacity: 0.7 }}>u.</small>
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', gap: 3 }}>
                                            <Box>
                                                <Typography variant="caption" display="block" sx={{ fontWeight: 800, opacity: 0.6 }}>CELLER</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 900 }}>{data.celler}</Typography>
                                            </Box>
                                            <Box>
                                                <Typography variant="caption" display="block" sx={{ fontWeight: 800, opacity: 0.6 }}>EL PLA</Typography>
                                                <Typography variant="body1" sx={{ fontWeight: 900 }}>{data.pla}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <StockCharts
                        stockLevels={stockLevels}
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
