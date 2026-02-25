import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, IconButton, Button, Typography, Box
} from '@mui/material';
import { Save, Trash2 } from 'lucide-react';

const PendingDialog = ({
    open,
    onClose,
    entries,
    onEdit,
    onDelete,
    onSync
}) => {
    const count = entries.length;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
            <DialogTitle sx={{ fontWeight: 900 }}>Pendents de pujar ({count})</DialogTitle>
            <DialogContent>
                {count === 0 ? (
                    <Typography sx={{ p: 3, textAlign: 'center' }}>Cap dada pendent.</Typography>
                ) : (
                    <List>
                        {[...entries].reverse().map((entry, idx) => {
                            const realIdx = entries.length - 1 - idx;
                            return (
                                <ListItem key={realIdx} secondaryAction={
                                    <Box>
                                        <IconButton onClick={() => onEdit(entry, realIdx)} color="primary"><Save size={18} /></IconButton>
                                        <IconButton onClick={() => onDelete(realIdx)} color="error"><Trash2 size={18} /></IconButton>
                                    </Box>
                                }>
                                    <ListItemText
                                        primary={<Typography sx={{ fontWeight: 800 }}>{entry.article} - {entry.totalBottles} u.</Typography>}
                                        secondary={entry.timestamp}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose}>Tancar</Button>
                <Button variant="contained" onClick={onSync} disabled={count === 0} sx={{ borderRadius: 3, fontWeight: 900 }}>
                    Sincronitzar Tot
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PendingDialog;
