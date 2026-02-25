import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, Box, Typography, IconButton,
    Button, List, Card, CardContent, CircularProgress
} from '@mui/material';
import { X, Edit2, AlertTriangle } from 'lucide-react';
import { robustParseDate } from '../utils/dateUtils';

const GlobalHistoryDialog = ({
    open,
    onClose,
    loading,
    logs,
    historyRange,
    setHistoryRange,
    onLongPress,
    pressingLogIdx
}) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, px: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>Històric Global</Typography>
                <IconButton onClick={onClose}><X /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 3 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', py: 1 }}>
                    {[
                        { id: '24h', label: '24h' },
                        { id: '3d', label: '3d' },
                        { id: '7d', label: '7d' },
                        { id: '30d', label: '1m' },
                        { id: 'all', label: 'Tot' }
                    ].map(filter => (
                        <Button
                            key={filter.id}
                            size="small"
                            variant={historyRange === filter.id ? 'contained' : 'outlined'}
                            onClick={() => setHistoryRange(filter.id)}
                            sx={{ minWidth: '60px', borderRadius: '10px' }}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </Box>

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={30} /></Box>
                ) : logs.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>No s'han trobat registres.</Typography>
                ) : (
                    <List sx={{ pt: 0 }}>
                        {logs
                            .filter(log => {
                                const timestamp = log.TIMESTAMP || log.timestamp;
                                if (historyRange === 'all') return true;
                                const logDate = robustParseDate(timestamp);
                                const now = new Date();
                                const diff = (now - logDate) / (1000 * 60 * 60);
                                if (historyRange === '24h') return diff <= 24;
                                if (historyRange === '3d') return diff <= 72;
                                if (historyRange === '7d') return diff <= 168;
                                if (historyRange === '30d') return diff <= 720;
                                return true;
                            })
                            .map((log, idx) => {
                                const L = {
                                    article: log.ARTICLE || log.article || 'Desconegut',
                                    year: log.ANYADA || log.year || log.anyada || '',
                                    total: log['TOTAL AMPOLLES'] || log.totalBottles || log.total || 0,
                                    user: log.USUARI || log.user || log.usuari || '?',
                                    location: log.UBICACIÓ || log.location || log.ubicacio || '?',
                                    timestamp: log.TIMESTAMP || log.timestamp || '',
                                    incidencia: log.INCIDÈNCIA || log.incidencia || false,
                                    incidenciaText: log.incidenciaText || log.INCIDÈNCIA || ''
                                };

                                const hasIncident = L.incidencia && L.incidencia !== "false";

                                return (
                                    <Card
                                        key={idx}
                                        variant="outlined"
                                        {...onLongPress(log, idx)}
                                        sx={{
                                            mb: 2, borderRadius: '16px',
                                            border: '1px solid',
                                            borderColor: pressingLogIdx === idx ? 'primary.main' : 'divider',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            WebkitTapHighlightColor: 'transparent',
                                            transition: 'box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                                            transform: pressingLogIdx === idx ? 'scale(0.975)' : 'scale(1)',
                                            boxShadow: pressingLogIdx === idx
                                                ? '0 0 0 3px rgba(114,47,55,0.25), 0 4px 20px rgba(114,47,55,0.15)'
                                                : 'none',
                                        }}
                                    >
                                        <CardContent sx={{ p: '14px !important' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{L.article} ({L.year})</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{L.total} uts.</Typography>
                                                    <Edit2 size={12} style={{ opacity: pressingLogIdx === idx ? 0.8 : 0.25, transition: 'opacity 0.2s' }} />
                                                </Box>
                                            </Box>
                                            <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7, display: 'block', mb: 1 }}>
                                                {L.timestamp}
                                            </Typography>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <Typography variant="caption" sx={{ fontWeight: 800 }}>{L.user} • {L.location}</Typography>
                                                {hasIncident && (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                                        <Box sx={{ bgcolor: 'error.main', color: 'white', px: 1, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}>
                                                            INCIDÈNCIA
                                                        </Box>
                                                        {L.incidenciaText && L.incidenciaText !== "SÍ" && L.incidenciaText !== "VERITAT" && (
                                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700, fontStyle: 'italic', maxWidth: '150px', textAlign: 'right' }}>
                                                                {L.incidenciaText}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </List>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default GlobalHistoryDialog;
