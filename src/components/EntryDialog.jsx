import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, TextField, Button, Switch, IconButton, CircularProgress
} from '@mui/material';
import { Save, Camera, X } from 'lucide-react';

const EntryDialog = ({
    open,
    onClose,
    selectedArticle,
    anyada,
    setAnyada,
    years,
    caixes,
    setCaixes,
    ampolles,
    setAmpolles,
    barrils,
    setBarrils,
    isIncidencia,
    setIsIncidencia,
    incidenciaText,
    setIncidenciaText,
    isNoEtiquetat,
    setIsNoEtiquetat,
    isGranel,
    setIsGranel,
    granelLitres,
    setGranelLitres,
    isMagnum,
    setIsMagnum,
    photo,
    setPhoto,
    onPhotoCapture,
    onSave,
    darkMode
}) => {
    // Dynamic box size logic
    const getBottlesPerBox = () => {
        if (selectedArticle === 'CERVESA PETITA') return 16;
        return 6; // Standard for wine and big beer
    };

    const bottlesPerBox = getBottlesPerBox();
    const totalBottles = (parseInt(caixes || 0) * bottlesPerBox) + parseInt(ampolles || 0);
    const isBigBeer = selectedArticle === 'CERVESA GRAN';
    const isCadac = selectedArticle === 'CADAC';

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px' } }}>
            <DialogTitle sx={{ fontWeight: 900, pt: 3, px: 3 }}>{selectedArticle}</DialogTitle>
            <DialogContent sx={{ px: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
                    <TextField
                        label="Anyada / Data"
                        select
                        fullWidth
                        value={anyada}
                        onChange={(e) => setAnyada(e.target.value)}
                        SelectProps={{ native: true }}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </TextField>

                    {isGranel ? (
                        <Box>
                            <TextField
                                label="Litres a Granel"
                                type="number"
                                fullWidth
                                value={granelLitres || ''}
                                placeholder="0.00"
                                onChange={(e) => setGranelLitres(e.target.value)}
                                inputProps={{ inputMode: 'decimal', step: '0.01' }}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label={`Caixes (x${bottlesPerBox})`}
                                    type="text"
                                    fullWidth
                                    value={caixes === 0 ? '' : caixes}
                                    placeholder="0"
                                    onChange={(e) => setCaixes(parseInt(e.target.value) || 0)}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button
                                    fullWidth
                                    size="small"
                                    onClick={() => setCaixes(prev => parseInt(prev || 0) + 1)}
                                    sx={{ mt: 1, bgcolor: 'action.hover', fontWeight: 800, borderRadius: '10px', color: 'text.primary' }}
                                >
                                    +1 Caixa
                                </Button>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <TextField
                                    label="Ampolles"
                                    type="text"
                                    fullWidth
                                    value={ampolles === 0 ? '' : ampolles}
                                    placeholder="0"
                                    onChange={(e) => setAmpolles(parseInt(e.target.value) || 0)}
                                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button
                                    fullWidth
                                    size="small"
                                    onClick={() => setAmpolles(prev => parseInt(prev || 0) + 1)}
                                    sx={{ mt: 1, bgcolor: 'action.hover', fontWeight: 800, borderRadius: '10px', color: 'text.primary' }}
                                >
                                    +1 Amp.
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {isBigBeer && !isGranel && (
                        <Box>
                            <TextField
                                label="Barrils"
                                type="text"
                                fullWidth
                                value={barrils === 0 ? '' : barrils}
                                placeholder="0"
                                onChange={(e) => setBarrils(parseInt(e.target.value) || 0)}
                                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                                InputLabelProps={{ shrink: true }}
                            />
                            <Button
                                fullWidth
                                size="small"
                                onClick={() => setBarrils(prev => parseInt(prev || 0) + 1)}
                                sx={{ mt: 1, bgcolor: 'action.hover', fontWeight: 800, borderRadius: '10px', color: 'text.primary' }}
                            >
                                +1 Barril
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ p: 2.5, bgcolor: darkMode ? 'rgba(114, 47, 55, 0.15)' : 'rgba(114, 47, 55, 0.05)', borderRadius: '20px', textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            {isGranel ? granelLitres || 0 : totalBottles} 
                            <small style={{ fontSize: '1rem', marginLeft: '6px' }}>{isGranel ? 'L.' : 'amp.'}</small>
                            {isBigBeer && !isGranel && barrils > 0 && (
                                <Typography component="span" sx={{ display: 'block', fontSize: '1.2rem', fontWeight: 800, mt: 0.5 }}>
                                    + {barrils} barrils
                                </Typography>
                            )}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {/* Row 1: Common Actions */}
                            <Box sx={{ display: 'flex', flex: 1, gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isIncidencia ? 'primary.main' : 'action.hover', p: 0.5, borderRadius: '12px', flex: 1, color: isIncidencia ? 'white' : 'text.primary', transition: '0.2s' }}>
                                    <Switch size="small" checked={isIncidencia} onChange={(e) => setIsIncidencia(e.target.checked)} color="default" />
                                    <Typography variant="caption" sx={{ fontWeight: 800, ml: 0.5 }}>INCIDÈNCIA</Typography>
                                </Box>
                                <Button component="label" variant="text" size="small" startIcon={<Camera size={18} />} sx={{ fontWeight: 800 }}>
                                    FOTO
                                    <input type="file" hidden accept="image/*" onChange={onPhotoCapture} />
                                </Button>
                            </Box>

                            {/* Row 2: Type toggles */}
                            <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isNoEtiquetat ? 'primary.main' : 'action.hover', p: 0.5, borderRadius: '12px', flex: 1, color: isNoEtiquetat ? 'white' : 'text.primary', transition: '0.2s' }}>
                                    <Switch size="small" checked={isNoEtiquetat} onChange={(e) => setIsNoEtiquetat(e.target.checked)} color="default" />
                                    <Typography variant="caption" sx={{ fontWeight: 800, ml: 0.5 }}>NO ETIQUETAT</Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isGranel ? 'primary.main' : 'action.hover', p: 0.5, borderRadius: '12px', flex: 1, color: isGranel ? 'white' : 'text.primary', transition: '0.2s' }}>
                                    <Switch size="small" checked={isGranel} onChange={(e) => setIsGranel(e.target.checked)} color="default" />
                                    <Typography variant="caption" sx={{ fontWeight: 800, ml: 0.5 }}>A GRANEL</Typography>
                                </Box>
                            </Box>

                            {/* Special Row: Magnum only for CADAC */}
                            {isCadac && (
                                <Box sx={{ display: 'flex', width: '100%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: isMagnum ? 'primary.main' : 'action.hover', p: 0.5, borderRadius: '12px', flex: 1, color: isMagnum ? 'white' : 'text.primary', transition: '0.2s' }}>
                                        <Switch size="small" checked={isMagnum} onChange={(e) => setIsMagnum(e.target.checked)} color="default" />
                                        <Typography variant="caption" sx={{ fontWeight: 800, ml: 0.5 }}>MAGNUM (1.5L)</Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {isIncidencia && (
                            <TextField
                                label="Descripció de la incidència"
                                multiline
                                rows={2}
                                fullWidth
                                value={incidenciaText}
                                onChange={(e) => setIncidenciaText(e.target.value)}
                                placeholder="Explica què ha passat..."
                                variant="outlined"
                                autoFocus
                                sx={{ mt: 1 }}
                            />
                        )}
                    </Box>

                    {photo && (
                        <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                            <img src={photo} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            <IconButton onClick={() => setPhoto(null)} sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                <X size={18} />
                            </IconButton>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} sx={{ fontWeight: 800 }}>Anul·lar</Button>
                <Button variant="contained" onClick={onSave} startIcon={<Save />} sx={{ fontWeight: 800 }}>Guardar local</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EntryDialog;
