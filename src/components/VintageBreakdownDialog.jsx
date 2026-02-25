import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Button, Divider, List, ListItem, ListItemText, CircularProgress
} from '@mui/material';
import { X, AlertTriangle } from 'lucide-react';

const VintageBreakdownDialog = ({
    open,
    onClose,
    article,
    loading,
    data
}) => {
    const grandTotal = data.reduce((acc, v) => acc + v.total, 0);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, px: 3 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{article}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6 }}>Desglossat per anyada</Typography>
                </Box>
                <IconButton onClick={onClose}><X /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 2 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress size={30} />
                    </Box>
                ) : data.length === 0 ? (
                    <Typography sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>
                        No hi ha dades detallades per aquest article.
                    </Typography>
                ) : (
                    <Box sx={{ mt: 1 }}>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 3, textAlign: 'center', mb: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                {grandTotal} <small style={{ fontSize: '1rem' }}>uts.</small>
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.7 }}>TOTAL CALCULAT</Typography>
                        </Box>

                        <List sx={{ pt: 0 }}>
                            {data.sort((a, b) => b.year - a.year).map((v, i) => (
                                <Box key={i}>
                                    <ListItem sx={{ px: 1 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
                                                        {v.year || "SENSE ANYADA"}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {v.hasIncidents && <AlertTriangle size={16} color="#ef4444" />}
                                                        <Typography sx={{ fontWeight: 900, color: 'primary.main' }}>
                                                            {v.total} u.
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.6 }}>
                                                        {((v.total / grandTotal) * 100).toFixed(1)}% del total
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {i < data.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </List>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button variant="contained" fullWidth onClick={onClose} sx={{ borderRadius: 3, py: 1, fontWeight: 900 }}>
                    Tancar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Wrapper with IconButton to fix missing import in components above if needed
import { IconButton } from '@mui/material';

export default VintageBreakdownDialog;
