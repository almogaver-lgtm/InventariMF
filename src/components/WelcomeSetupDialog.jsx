import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, TextField, Button } from '@mui/material';

const WelcomeSetupDialog = ({
    open,
    usuari,
    setUsuari,
    usuaris,
    ubicacio,
    setUbicacio,
    ubicacions,
    onConfirm
}) => {
    const isReady = usuari && ubicacio;

    return (
        <Dialog
            open={open}
            PaperProps={{ sx: { borderRadius: '28px', p: 2 } }}
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle sx={{ fontWeight: 900, textAlign: 'center', pb: 1 }}>
                Benvingut a InventariVi
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 4, opacity: 0.7 }}>
                    Si us plau, identifica't i indica on et trobes per poder realitzar l'inventari.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, mb: 1, display: 'block' }}>RESPONSABLE</Typography>
                        <TextField
                            select
                            fullWidth
                            value={usuari}
                            onChange={(e) => setUsuari(e.target.value)}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            sx={{ '& select': { fontWeight: 800 } }}
                        >
                            <option value="">-- Tria responsable --</option>
                            {usuaris.map(u => <option key={u} value={u}>{u}</option>)}
                        </TextField>
                    </Box>

                    <Box>
                        <Typography variant="caption" sx={{ fontWeight: 900, mb: 1, display: 'block' }}>UBICACIÓ</Typography>
                        <TextField
                            select
                            fullWidth
                            value={ubicacio}
                            onChange={(e) => setUbicacio(e.target.value)}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            sx={{ '& select': { fontWeight: 800 } }}
                        >
                            <option value="">-- Tria ubicació --</option>
                            {ubicacions.map(u => <option key={u} value={u}>{u}</option>)}
                        </TextField>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    fullWidth
                    disabled={!isReady}
                    onClick={onConfirm}
                    sx={{ py: 1.5, borderRadius: '16px', fontWeight: 900 }}
                >
                    Començar Inventari
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WelcomeSetupDialog;
