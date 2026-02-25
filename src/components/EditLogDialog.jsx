import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, TextField, Button, CircularProgress
} from '@mui/material';
import { Save, Trash2, Edit2 } from 'lucide-react';

const EditLogDialog = ({
    open,
    onClose,
    editForm,
    setEditForm,
    years,
    ubicacions,
    onSave,
    onDelete,
    saving,
    deleting,
    darkMode
}) => {
    const totalBottles = (parseInt(editForm.boxes || 0) * 6) + parseInt(editForm.bottles || 0);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
            <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Edit2 size={20} />
                    Editar Registre
                </Box>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                    <TextField
                        label="Article"
                        fullWidth
                        value={editForm.article || ''}
                        disabled // Normally we don't change the article, but could if needed
                        InputLabelProps={{ shrink: true }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Anyada"
                            select
                            fullWidth
                            value={editForm.year || ''}
                            onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </TextField>
                        <TextField
                            label="Ubicació"
                            select
                            fullWidth
                            value={editForm.location || ''}
                            onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                            SelectProps={{ native: true }}
                            InputLabelProps={{ shrink: true }}
                        >
                            {ubicacions.map(u => <option key={u} value={u}>{u}</option>)}
                        </TextField>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Caixes (x6)"
                            type="text"
                            fullWidth
                            value={editForm.boxes === 0 ? '' : (editForm.boxes ?? '')}
                            placeholder="0"
                            onChange={e => setEditForm(f => ({ ...f, boxes: parseInt(e.target.value) || 0 }))}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Ampolles"
                            type="text"
                            fullWidth
                            value={editForm.bottles === 0 ? '' : (editForm.bottles ?? '')}
                            placeholder="0"
                            onChange={e => setEditForm(f => ({ ...f, bottles: parseInt(e.target.value) || 0 }))}
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>
                    <Box sx={{ p: 2, bgcolor: darkMode ? 'rgba(114,47,55,0.15)' : 'rgba(114,47,55,0.06)', borderRadius: '16px', textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            {totalBottles}
                            <small style={{ fontSize: '1rem', marginLeft: 6 }}>amp.</small>
                        </Typography>
                    </Box>

                    <TextField
                        label="Descripció Incidència"
                        multiline
                        rows={2}
                        fullWidth
                        value={editForm.incidenciaText || ''}
                        onChange={e => setEditForm(f => ({ ...f, incidenciaText: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
                <Button
                    variant="text"
                    color="error"
                    onClick={onDelete}
                    disabled={deleting || saving}
                    startIcon={deleting ? <CircularProgress size={16} color="error" /> : <Trash2 size={18} />}
                >
                    {deleting ? 'Eliminant...' : 'Eliminar'}
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose}>Cancel·lar</Button>
                    <Button
                        variant="contained"
                        onClick={onSave}
                        disabled={saving || deleting}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
                    >
                        {saving ? 'Guardant...' : 'Guardar'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default EditLogDialog;
