import React from 'react';
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { Wine, BarChart3, Layers, History, Save, Sun, Moon } from 'lucide-react';

const AppHeader = ({
    view,
    setView,
    darkMode,
    setDarkMode,
    pendingCount,
    onOpenHistory,
    onOpenGlobalHistory,
    onFetchGlobalHistory
}) => {
    return (
        <AppBar position="sticky" elevation={0} sx={{
            bgcolor: darkMode ? 'background.paper' : '#722f37',
            borderBottom: '1px solid',
            borderColor: 'divider'
        }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Wine size={28} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.4rem' } }}>
                        {view === 'grid' ? 'Inventari Vi' : 'Estoc Global'}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton color="inherit" onClick={() => setView(view === 'grid' ? 'dash' : 'grid')}>
                        {view === 'grid' ? <BarChart3 /> : <Layers />}
                    </IconButton>
                    <IconButton color="inherit" onClick={() => {
                        onFetchGlobalHistory();
                        onOpenGlobalHistory(true);
                    }}>
                        <History size={22} />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={() => onOpenHistory(true)}
                        sx={{
                            color: pendingCount > 0 ? '#ffea00' : 'inherit',
                            animation: pendingCount > 0 ? 'pulse 2s infinite' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <Box sx={{ position: 'relative', display: 'flex' }}>
                            <Save size={24} />
                            {pendingCount > 0 && (
                                <Box sx={{
                                    position: 'absolute', top: -6, right: -6,
                                    bgcolor: '#ff4444', color: 'white',
                                    borderRadius: '50%', minWidth: 16, height: 16,
                                    fontSize: '0.65rem', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 900, border: '2px solid #722f37'
                                }}>
                                    {pendingCount}
                                </Box>
                            )}
                        </Box>
                    </IconButton>
                    <IconButton color="inherit" onClick={() => {
                        const newVal = !darkMode;
                        setDarkMode(newVal);
                        localStorage.setItem('inventory_dark_mode', newVal);
                    }}>
                        {darkMode ? <Sun size={22} /> : <Moon size={22} />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AppHeader;
