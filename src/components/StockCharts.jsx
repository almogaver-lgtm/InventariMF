import React from 'react';
import { Box, Typography, Card, Grid, LinearProgress } from '@mui/material';

const StockCharts = ({
    stockLevels,
    activePie,
    setActivePie,
    chartColors,
    darkMode,
    onArticleClick
}) => {
    const sortedLevels = Object.entries(stockLevels).sort((a, b) => b[1].total - a[1].total);
    if (sortedLevels.length === 0) return null;

    const grandTotal = sortedLevels.reduce((acc, l) => acc + l[1].total, 0);
    const maxTotal = Math.max(...sortedLevels.map(l => l[1].total), 1);

    let currentAngle = 0;
    const slices = sortedLevels.map(([name, data], i) => {
        const percent = data.total / grandTotal;
        const sliceAngle = percent * 360;
        const x1 = 100 + 85 * Math.cos((Math.PI * (currentAngle - 90)) / 180);
        const y1 = 100 + 85 * Math.sin((Math.PI * (currentAngle - 90)) / 180);
        currentAngle += sliceAngle;
        const x2 = 100 + 85 * Math.cos((Math.PI * (currentAngle - 90)) / 180);
        const y2 = 100 + 85 * Math.sin((Math.PI * (currentAngle - 90)) / 180);
        const largeArcFlag = sliceAngle > 180 ? 1 : 0;
        const pathData = `M 100 100 L ${x1} ${y1} A 85 85 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
        return { name, total: data.total, path: pathData, color: chartColors[i % chartColors.length] };
    });

    const activeData = activePie;

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                    <Card variant="outlined" sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 6 }}>
                        <Typography variant="overline" sx={{ mb: 2, display: 'block', fontWeight: 900, letterSpacing: 1.5 }}>DISTRIBUCIÓ D'ESTOC</Typography>

                        <Box sx={{ position: 'relative', width: 220, height: 220, margin: '0 auto' }}>
                            <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-2deg)', cursor: 'pointer' }}>
                                {slices.map((slice) => (
                                    <path
                                        key={slice.name}
                                        d={slice.path}
                                        fill={slice.color}
                                        stroke={darkMode ? '#1e1e1e' : '#fff'}
                                        strokeWidth="2"
                                        onClick={() => setActivePie(activePie?.name === slice.name ? null : slice)}
                                        style={{
                                            opacity: activePie && activePie.name !== slice.name ? 0.3 : 1,
                                            transform: activePie && activePie.name === slice.name ? 'scale(1.05)' : 'scale(1)',
                                            transformOrigin: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                    />
                                ))}
                            </svg>

                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 140,
                                height: 140,
                                bgcolor: 'background.paper',
                                borderRadius: '50%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
                                pointerEvents: 'none'
                            }}>
                                {!activeData ? (
                                    <>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem' }}>
                                            TOTAL ABSOLUT
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                            {grandTotal}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                            ampolles
                                        </Typography>
                                    </>
                                ) : (
                                    <>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', textAlign: 'center', px: 1 }}>
                                            {activeData.name}
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: activeData.color }}>
                                            {activeData.total}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                                            {((activeData.total / grandTotal) * 100).toFixed(1)}%
                                        </Typography>
                                    </>
                                )}
                            </Box>
                        </Box>
                        <Typography variant="caption" sx={{ mt: 3, opacity: 0.6, fontWeight: 700 }}>
                            {!activeData ? "Prem un color per veure detall" : "Prem el centre per tornar al total"}
                        </Typography>
                    </Card>
                </Grid>

                <Grid item xs={12} md={7}>
                    <Card variant="outlined" sx={{ p: 4, borderRadius: 6 }}>
                        <Typography variant="overline" sx={{ mb: 3, display: 'block', fontWeight: 900, letterSpacing: 1.5 }}>RECOMPTE TOTAL PER ARTICLE</Typography>
                        {sortedLevels.map(([name, data], i) => (
                            <Box
                                key={name}
                                sx={{ mb: 2.5, cursor: 'pointer' }}
                                onClick={() => onArticleClick(name)}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{name}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.2rem' }}>{data.total}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>u.</Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(data.total / maxTotal) * 100}
                                    sx={{
                                        height: 14,
                                        borderRadius: 7,
                                        bgcolor: 'rgba(0,0,0,0.05)',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: chartColors[i % chartColors.length],
                                            borderRadius: 7
                                        }
                                    }}
                                />
                            </Box>
                        ))}
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default StockCharts;
