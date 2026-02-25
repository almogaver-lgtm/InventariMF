import React from 'react';
import { Dialog, DialogContent, Typography, LinearProgress, Box } from '@mui/material';

const SyncDialog = ({ open, currentItem, progress }) => {
    return (
        <Dialog open={open} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '12px' } }}>
            <DialogContent sx={{ py: 4 }}>
                <Typography variant="h6" sx={{ color: 'primary.main', mb: 1, fontWeight: 900 }}>Sincronitzant dades...</Typography>
                <Typography variant="body2" sx={{ mb: 3, fontWeight: 700 }}>Enviant: {currentItem}</Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 20, borderRadius: 10 }} />
                <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right', fontWeight: 900 }}>{Math.round(progress)}%</Typography>
            </DialogContent>
        </Dialog>
    );
};

export default SyncDialog;
