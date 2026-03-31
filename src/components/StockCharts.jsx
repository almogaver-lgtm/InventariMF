import React, { useState } from 'react';
import { Box, Typography, Card, Grid, LinearProgress, Paper, IconButton, Tooltip } from '@mui/material';
import { ArrowLeft } from 'lucide-react';

const StockCharts = ({
    stockLevels,
    section = 'vins',
    vinsSubView,
    activePie,
    setActivePie,
    chartColors,
    darkMode,
    onArticleClick
}) => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const sortedLevels = Object.entries(stockLevels).sort((a, b) => b[1].total - a[1].total);
    if (sortedLevels.length === 0) return null;

    const grandTotal = sortedLevels.reduce((acc, l) => acc + l[1].total, 0);
    const maxTotal = Math.max(...sortedLevels.map(l => l[1].total), 1);

    // --- MATERIA SECA LOGIC: GROUPING BY CATEGORY ---
    const getMaterialCategories = () => {
        const groups = {
            'TAPS': { total: 0, items: [] },
            'AMPOLLES': { total: 0, items: [] },
            'CÀPSULES': { total: 0, items: [] },
            'ETIQUETES': { total: 0, items: [] }
        };

        Object.entries(stockLevels).forEach(([name, data]) => {
            const upperName = name.toUpperCase();
            if (upperName.includes('TAP')) {
                groups['TAPS'].total += data.total;
                groups['TAPS'].items.push({ name, total: data.total });
            } else if (upperName.includes('AMPOLLE')) {
                groups['AMPOLLES'].total += data.total;
                groups['AMPOLLES'].items.push({ name, total: data.total });
            } else if (upperName.includes('CÀPSULE') || upperName.includes('CAPSULE')) {
                groups['CÀPSULES'].total += data.total;
                groups['CÀPSULES'].items.push({ name, total: data.total });
            } else if (upperName.includes('ETIQUETA') || upperName.includes('CONTRA')) {
                groups['ETIQUETES'].total += data.total;
                groups['ETIQUETES'].items.push({ name, total: data.total });
            }
        });

        return Object.entries(groups).map(([cat, data]) => ({
            name: cat,
            total: data.total,
            items: data.items.sort((a, b) => b.total - a.total)
        }));
    };

    const categories = getMaterialCategories();
    const maxCatTotal = Math.max(...categories.map(c => c.total), 1);

    // Normalize what we show in the list
    const getDisplayItems = () => {
        if (section === 'material' && selectedCategory) {
            const cat = categories.find(c => c.name === selectedCategory);
            return cat ? cat.items : [];
        }
        return sortedLevels.map(([name, data]) => ({ name, total: data.total }));
    };

    const displayItems = getDisplayItems();
    const currentMax = displayItems.length > 0 ? Math.max(...displayItems.map(it => it.total), 1) : 1;

    const getUnit = (itemName) => {
        if (section === 'material') return 'u.';
        if (itemName.includes('(A GRANEL)')) return 'L.';
        return 'amp.';
    };

    // --- DONUT CHART LOGIC (FOR VINE) ---
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

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
                {/* LEFT AREA: CHARTS */}
                <Grid item xs={12} md={5}>
                    <Card variant="outlined" sx={{ p: 4, height: '100%', borderRadius: 6, display: 'flex', flexDirection: 'column', minHeight: 450 }}>
                        <Typography variant="overline" sx={{ mb: 4, display: 'block', fontWeight: 900, letterSpacing: 1.5, textAlign: 'center' }}>
                            {section === 'material' ? 'COMPARATIVA CATEGORIES' : (vinsSubView === 'secundari' ? "DISTRIBUCIÓ ESTOC SECUNDARI" : "DISTRIBUCIÓ D'ESTOC")}
                        </Typography>

                        {section === 'material' ? (
                            /* VERTICAL BAR CHART FOR MATERIA SECA CATEGORIES */
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'flex-end',
                                justifyContent: 'space-around',
                                flexGrow: 1,
                                gap: 2,
                                px: 1,
                                height: 250
                            }}>
                                {categories.map((cat, i) => (
                                    <Box
                                        key={cat.name}
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 900, mb: 1, color: selectedCategory === cat.name ? 'primary.main' : 'text.secondary' }}>
                                            {cat.total}
                                        </Typography>
                                        <Tooltip title={cat.name} arrow>
                                            <Paper
                                                elevation={selectedCategory === cat.name ? 8 : 0}
                                                sx={{
                                                    width: '100%',
                                                    maxWidth: 60,
                                                    height: (cat.total / maxCatTotal) * 200 + 10,
                                                    bgcolor: selectedCategory === cat.name ? 'primary.main' : chartColors[i % chartColors.length],
                                                    borderRadius: '12px 12px 4px 4px',
                                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                                    border: '2px solid',
                                                    borderColor: selectedCategory === cat.name ? 'primary.dark' : 'transparent',
                                                    '&:hover': { transform: 'scaleY(1.05)', opacity: 0.9 }
                                                }}
                                            />
                                        </Tooltip>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 2,
                                                fontWeight: 900,
                                                fontSize: '0.65rem',
                                                writingMode: { xs: 'vertical-rl', sm: 'horizontal-tb' },
                                                textAlign: 'center',
                                                color: selectedCategory === cat.name ? 'primary.main' : 'text.primary'
                                            }}
                                        >
                                            {cat.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            /* CIRCULAR CHART FOR WINE */
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
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                    width: 140, height: 140, bgcolor: 'background.paper', borderRadius: '50%',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)', pointerEvents: 'none'
                                }}>
                                    {!activePie ? (
                                        <>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem' }}>TOTAL {vinsSubView === 'secundari' ? 'SECUNDARI' : 'VINS'}</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>{grandTotal}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{vinsSubView === 'secundari' ? 'unitats/L.' : 'unitats'}</Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem', textAlign: 'center', px: 1 }}>{activePie.name}</Typography>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: activePie.color }}>{activePie.total}</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 800 }}>{((activePie.total / grandTotal) * 100).toFixed(1)}%</Typography>
                                        </>
                                    )}
                                </Box>
                            </Box>
                        )}
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>
                                {section === 'material' ? "Clica una barra per veure el desglòs d'articles" : (!activePie ? "Prem un color per veure detall" : "Prem el centre per tornar al total")}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                {/* RIGHT AREA: DETAILS (HORIZONTAL BARS) */}
                <Grid item xs={12} md={7}>
                    <Card variant="outlined" sx={{ p: 4, borderRadius: 6, minHeight: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="overline" sx={{ fontWeight: 900, letterSpacing: 1.5 }}>
                                {section === 'material'
                                    ? (selectedCategory ? `DETALL: ${selectedCategory}` : "TOTS ELS ARTICLES DEL DRIVE")
                                    : "RECOMPTE TOTAL PER ARTICLE"
                                }
                            </Typography>
                            {selectedCategory && (
                                <IconButton size="small" onClick={() => setSelectedCategory(null)} sx={{ bgcolor: 'action.hover' }}>
                                    <ArrowLeft size={18} />
                                </IconButton>
                            )}
                        </Box>

                        {displayItems.map((item, i) => (
                            <Box
                                key={item.name}
                                sx={{ mb: 2.5, cursor: 'pointer' }}
                                onClick={() => onArticleClick(item.name)}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>{item.name}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1.2rem' }}>{item.total}</Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>{getUnit(item.name)}</Typography>
                                    </Box>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(item.total / currentMax) * 100}
                                    sx={{
                                        height: 14, borderRadius: 7, bgcolor: 'rgba(0,0,0,0.05)',
                                        '& .MuiLinearProgress-bar': { bgcolor: chartColors[i % chartColors.length], borderRadius: 7 }
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
