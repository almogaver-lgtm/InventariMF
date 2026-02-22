import React, { useState, useEffect, useRef } from 'react';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    Container,
    Typography,
    Grid,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    AppBar,
    Toolbar,
    IconButton,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider,
    Switch,
    CircularProgress,
    LinearProgress,
    Tooltip
} from '@mui/material';
import {
    Wine,
    Box as BoxIcon,
    Save,
    History,
    Smartphone,
    CheckCircle2,
    Trash2,
    X,
    Moon,
    Sun,
    BarChart3,
    Camera,
    Layers,
    PieChart as PieIcon,
    RefreshCcw,
    ArrowUpRight,
    Edit2
} from 'lucide-react';

const INITIAL_ARTICLES = [
    'PICAPOLL', 'GX BLANCA', 'ROSAT', 'GX NEGRA', 'MERLOT',
    'PERAFITA NEGRA', 'MF', 'CADAC', 'VERMUT', 'MISTELLA',
    'GX DOLÇA', 'CERVESA GRAN', 'OLI', 'CERVESA PETITA',
    'LIMONCELLO', 'GINEBRA', 'CAVA BLANC', 'CAVA ROSAT', 'CAVA PICAPOLL'
];

const INITIAL_USUARIS = ['David', 'Djilali', 'Clara'];
const UBICACIONS = ['Pla', 'Celler', 'Botiga'];
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwDeb83AzYE7bqmLP_RGEkd95JaJb73VWTLYtMhsv6jrl4K58HniTl3MrlqUFYm3xlY8A/exec';

const CHART_COLORS = ['#722f37', '#b91c1c', '#dc2626', '#ef4444', '#f87171', '#fb923c', '#fbbf24', '#facc15', '#a3e635', '#4ade80', '#2dd4bf', '#22d3ee', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb7185'];

const robustParseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    // Si ja és un objecte Date, el retornem
    if (dateStr instanceof Date) return dateStr;

    try {
        // Si és un string que sembla una data ISO
        if (typeof dateStr === 'string' && dateStr.includes('T') && !isNaN(Date.parse(dateStr))) {
            return new Date(dateStr);
        }

        // Netegem el string
        let clean = dateStr.toString().replace(/,/g, '').replace(/\./g, '').toLowerCase();

        // Busquem números: DD MM YYYY HH MM SS
        const parts = clean.split(/[^0-9]+/).filter(x => x.length > 0);

        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);

            let hours = parts.length > 3 ? parseInt(parts[3]) : 0;
            const minutes = parts.length > 4 ? parseInt(parts[4]) : 0;
            const seconds = parts.length > 5 ? parseInt(parts[5]) : 0;

            // PM/AM logic fallback
            if ((clean.includes('p m') || clean.includes('pm')) && hours < 12) hours += 12;
            if ((clean.includes('a m') || clean.includes('am')) && hours === 12) hours = 0;

            const d = new Date(year, month, day, hours, minutes, seconds);
            if (!isNaN(d.getTime())) return d;
        }

        const fallback = new Date(dateStr);
        return isNaN(fallback.getTime()) ? new Date(0) : fallback;
    } catch (e) {
        return new Date(0);
    }
};

const formatCurrentDate = () => {
    const now = new Date();
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}:${s}`;
};

const GENERATE_YEARS = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = 2015; y <= currentYear + 1; y++) {
        years.push(y.toString());
    }
    return years.reverse();
};

function App() {
    const [darkMode, setDarkMode] = useState(localStorage.getItem('inventory_dark_mode') === 'true');
    const [view, setView] = useState('grid'); // 'grid' or 'dash'
    const [dashMode, setDashMode] = useState('cards'); // 'cards' or 'charts'
    const [activePie, setActivePie] = useState(null);
    const [articles, setArticles] = useState(INITIAL_ARTICLES);
    const [usuaris, setUsuaris] = useState(INITIAL_USUARIS);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [open, setOpen] = useState(false);
    const [ampolles, setAmpolles] = useState(0);
    const [caixes, setCaixes] = useState(0);
    const [ubicacio, setUbicacio] = useState('Pla');
    const [usuari, setUsuari] = useState('David');
    const [anyada, setAnyada] = useState(new Date().getFullYear().toString());
    const [photo, setPhoto] = useState(null);
    const [isIncidencia, setIsIncidencia] = useState(false);

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pendingCount, setPendingCount] = useState(0);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [pendingEntries, setPendingEntries] = useState([]);
    const [stockLevels, setStockLevels] = useState({});
    const [loading, setLoading] = useState(false);

    // Sync and History states
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncCurrentItem, setSyncCurrentItem] = useState('');
    const [globalLogs, setGlobalLogs] = useState([]);
    const [globalHistoryOpen, setGlobalHistoryOpen] = useState(false);
    const [historyRange, setHistoryRange] = useState('24h');
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Edit history entry states
    const [editLogOpen, setEditLogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [pressingLogIdx, setPressingLogIdx] = useState(null);
    const longPressTimer = useRef(null);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: {
                main: '#722f37',
                light: '#a65d63',
                dark: '#450a11',
                contrastText: '#ffffff',
            },
            secondary: { main: '#10b981' },
            background: {
                default: darkMode ? '#0f0e0e' : '#f8f9fa',
                paper: darkMode ? '#1a1818' : '#ffffff',
            },
            divider: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        typography: {
            fontFamily: '"Outfit", "Inter", sans-serif',
            h6: { fontWeight: 900 },
        },
        shape: { borderRadius: 20 },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: { textTransform: 'none', borderRadius: 12 }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none' }
                }
            }
        }
    });

    useEffect(() => {
        const savedUser = localStorage.getItem('inventory_user');
        if (savedUser) setUsuari(savedUser);
        fetchGlobalConfig();

        const updatePendingData = () => {
            const pending = JSON.parse(localStorage.getItem('inventory_pending') || '[]');
            setPendingCount(pending.length);
            setPendingEntries(pending);
        };

        updatePendingData();
        window.addEventListener('storage', updatePendingData);
        const interval = setInterval(updatePendingData, 3000);
        return () => {
            window.removeEventListener('storage', updatePendingData);
            clearInterval(interval);
        };
    }, []);

    const useLongPress = (log, idx) => ({
        onMouseDown: () => {
            setPressingLogIdx(idx);
            longPressTimer.current = setTimeout(() => {
                if (navigator.vibrate) navigator.vibrate(50);
                setPressingLogIdx(null);
                setEditingLog(log);
                setEditForm({
                    article: log.article,
                    year: log.year,
                    location: log.location,
                    bottles: log.bottles,
                    boxes: log.boxes,
                    totalBottles: log.totalBottles,
                    timestamp: log.timestamp,
                    user: log.user
                });
                setEditLogOpen(true);
            }, 1000);
        },
        onMouseUp: () => { clearTimeout(longPressTimer.current); setPressingLogIdx(null); },
        onMouseLeave: () => { clearTimeout(longPressTimer.current); setPressingLogIdx(null); },
        onTouchStart: () => {
            setPressingLogIdx(idx);
            longPressTimer.current = setTimeout(() => {
                if (navigator.vibrate) navigator.vibrate(50);
                setPressingLogIdx(null);
                setEditingLog(log);
                setEditForm({
                    article: log.article,
                    year: log.year,
                    location: log.location,
                    bottles: log.bottles,
                    boxes: log.boxes,
                    totalBottles: log.totalBottles,
                    timestamp: log.timestamp,
                    user: log.user
                });
                setEditLogOpen(true);
            }, 1000);
        },
        onTouchEnd: () => { clearTimeout(longPressTimer.current); setPressingLogIdx(null); },
        onContextMenu: (e) => e.preventDefault(),
    });

    const handleSaveEditLog = async () => {
        setSavingEdit(true);
        const updated = {
            ...editForm,
            bottles: parseInt(editForm.bottles) || 0,
            boxes: parseInt(editForm.boxes) || 0,
            totalBottles: (parseInt(editForm.boxes) || 0) * 6 + (parseInt(editForm.bottles) || 0),
        };
        try {
            await fetch(DEFAULT_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'editEntry', originalTimestamp: editingLog.timestamp, ...updated })
            });
            // Update local state immediately
            setGlobalLogs(prev => prev.map(l =>
                l.timestamp === editingLog.timestamp && l.article === editingLog.article ? { ...l, ...updated } : l
            ));
            setSnackbar({ open: true, message: 'Registre actualitzat!', severity: 'success' });
            setEditLogOpen(false);
        } catch (err) {
            setSnackbar({ open: true, message: 'Error actualitzant: ' + err.message, severity: 'error' });
        } finally {
            setSavingEdit(false);
        }
    };

    const fetchGlobalConfig = async () => {
        try {
            const res = await fetch(`${DEFAULT_SCRIPT_URL}?action=getConfig`);
            const data = await res.json();
            if (data.users && data.users.length > 0) {
                setUsuaris([...new Set([...INITIAL_USUARIS, ...data.users])]);
            }
            if (data.articles && data.articles.length > 0) {
                setArticles([...new Set([...INITIAL_ARTICLES, ...data.articles])]);
            }
            if (data.stock) setStockLevels(data.stock);
        } catch (e) {
            console.log("Error de connexió");
            const localArt = JSON.parse(localStorage.getItem('inventory_custom_articles') || '[]');
            const localUsr = JSON.parse(localStorage.getItem('inventory_custom_users') || '[]');
            setArticles([...new Set([...INITIAL_ARTICLES, ...localArt])]);
            setUsuaris([...new Set([...INITIAL_USUARIS, ...localUsr])]);
        }
    };

    const fetchGlobalHistory = async () => {
        setLoadingHistory(true);
        setGlobalLogs([]); // Reset each time
        try {
            const res = await fetch(`${DEFAULT_SCRIPT_URL}?action=getHistory`);
            const text = await res.text();
            console.log('RAW HISTORY RESPONSE:', text); // 🔍 Diagnosi: veure que retorna el script

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseErr) {
                console.error('El script no ha retornat JSON vàlid:', text);
                setSnackbar({ open: true, message: `Error: el script no retorna JSON. Resposta: ${text.substring(0, 80)}`, severity: 'error' });
                setLoadingHistory(false);
                return;
            }

            console.log('PARSED HISTORY DATA:', data);

            // Suportem múltiples formats de resposta
            const logs = data.logs || data.rows || data.data || data.records || (Array.isArray(data) ? data : null);

            if (logs && logs.length > 0) {
                setGlobalLogs(logs);
                console.log(`✅ ${logs.length} registres carregats`);
            } else {
                console.warn('Resposta rebuda però sense registres:', data);
                setSnackbar({ open: true, message: `El script ha respost però no hi ha dades. Claus rebudes: ${Object.keys(data).join(', ')}`, severity: 'warning' });
            }
        } catch (e) {
            console.error('Error de xarxa:', e);
            setSnackbar({ open: true, message: `Error de xarxa: ${e.message}`, severity: 'error' });
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleOpen = (article, index = null) => {
        setSelectedArticle(article);
        setIsIncidencia(false);
        setPhoto(null);
        if (index !== null) {
            const entry = pendingEntries[index];
            setAmpolles(entry.bottles || 0);
            setCaixes(entry.boxes || 0);
            setAnyada(entry.year || '');
            setUbicacio(entry.location || 'Celler');
            setEditIndex(index);
        } else {
            setAmpolles(0);
            setCaixes(0);
            setEditIndex(null);
        }
        setOpen(true);
    };

    const handlePhotoCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSync = async () => {
        const pending = JSON.parse(localStorage.getItem('inventory_pending') || '[]');
        if (pending.length === 0) {
            setSnackbar({ open: true, message: 'No hi ha dades pendents', severity: 'info' });
            return;
        }

        setSyncDialogOpen(true);
        setSyncProgress(0);
        let successCount = 0;

        for (let i = 0; i < pending.length; i++) {
            const entry = pending[i];
            setSyncCurrentItem(`${entry.article} (${i + 1}/${pending.length})`);

            try {
                const payload = JSON.stringify({
                    user: entry.user,
                    article: entry.article,
                    year: entry.year,
                    location: entry.location,
                    bottles: entry.bottles,
                    boxes: entry.boxes,
                    totalBottles: entry.totalBottles,
                    locationSource: entry.locationSource,
                    incidencia: entry.incidencia,
                    image: entry.image,
                    timestamp: entry.timestamp
                });

                await fetch(DEFAULT_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: payload
                });
                successCount++;
                setSyncProgress(((i + 1) / pending.length) * 100);
                await new Promise(r => setTimeout(r, 400));
            } catch (error) {
                console.error("Sync error:", error);
                break;
            }
        }

        const remaining = pending.slice(successCount);
        localStorage.setItem('inventory_pending', JSON.stringify(remaining));
        setPendingCount(remaining.length);

        setTimeout(() => {
            setSyncDialogOpen(false);
            if (successCount === pending.length) {
                setSnackbar({ open: true, message: 'Dades enviades correctament!', severity: 'success' });
                fetchGlobalConfig();
            } else {
                setSnackbar({ open: true, message: `S'han enviat ${successCount}. Queden ${remaining.length} pendents.`, severity: 'error' });
            }
        }, 500);
    };

    const handleSave = () => {
        const totalAmpolles = (parseInt(caixes || 0) * 6) + parseInt(ampolles || 0);
        const entry = {
            timestamp: formatCurrentDate(),
            user: usuari,
            article: selectedArticle,
            year: anyada,
            location: ubicacio,
            bottles: parseInt(ampolles || 0),
            boxes: parseInt(caixes || 0),
            totalBottles: totalAmpolles,
            locationSource: 'App Mobil',
            incidencia: isIncidencia,
            image: photo
        };

        const existingEntries = JSON.parse(localStorage.getItem('inventory_pending') || '[]');
        if (editIndex !== null) existingEntries[editIndex] = entry;
        else existingEntries.push(entry);

        localStorage.setItem('inventory_pending', JSON.stringify(existingEntries));
        localStorage.setItem('inventory_user', usuari);
        setPendingCount(existingEntries.length);
        setOpen(false);
        setSnackbar({ open: true, message: 'Guardat en local', severity: 'success' });
    };

    const renderCharts = () => {
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
            return { name, total: data.total, path: pathData, color: CHART_COLORS[i % CHART_COLORS.length] };
        });

        const activeData = activePie || (slices.length > 0 ? slices[0] : null);

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
                                            onClick={() => setActivePie(slice)}
                                            style={{
                                                opacity: activePie && activePie.name !== slice.name ? 0.6 : 1,
                                                transform: activePie && activePie.name === slice.name ? 'scale(1.04)' : 'scale(1)',
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
                                    {activeData && (
                                        <>
                                            <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', fontSize: '0.65rem' }}>
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
                                Prem un color per veure dades
                            </Typography>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={7}>
                        <Card variant="outlined" sx={{ p: 4, borderRadius: 6 }}>
                            <Typography variant="overline" sx={{ mb: 3, display: 'block', fontWeight: 900, letterSpacing: 1.5 }}>RECOMPTE TOTAL PER ARTICLE</Typography>
                            {sortedLevels.map(([name, data], i) => (
                                <Box key={name} sx={{ mb: 2.5, cursor: 'pointer' }} onClick={() => setActivePie({ name, total: data.total, color: CHART_COLORS[i % CHART_COLORS.length] })}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>{name}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main' }}>{data.total} <small>u.</small></Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(data.total / maxTotal) * 100}
                                        sx={{
                                            height: 14,
                                            borderRadius: 7,
                                            bgcolor: 'rgba(0,0,0,0.05)',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: CHART_COLORS[i % CHART_COLORS.length],
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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default' }}>
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: darkMode ? 'background.paper' : '#722f37', borderBottom: '1px solid', borderColor: 'divider' }}>
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
                                fetchGlobalHistory();
                                setGlobalHistoryOpen(true);
                            }}>
                                <History size={22} />
                            </IconButton>
                            <IconButton
                                color="inherit"
                                onClick={() => setHistoryOpen(true)}
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

                <Container sx={{ mt: 3, maxWidth: '1000px !important' }}>
                    {view === 'grid' ? (
                        <Box sx={{
                            bgcolor: 'background.paper',
                            borderRadius: '32px',
                            p: { xs: 2.5, sm: 4 },
                            boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.05)',
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900 }}>Productes</Typography>
                                <Button variant="outlined" size="small" onClick={() => {
                                    const name = window.prompt("Nom article:")?.toUpperCase();
                                    if (name) {
                                        setArticles([...articles, name]);
                                        localStorage.setItem('inventory_custom_articles', JSON.stringify([...articles, name]));
                                    }
                                }}>+ Nou</Button>
                            </Box>

                            <Grid container spacing={2}>
                                {articles.map((article) => (
                                    <Grid item xs={6} sm={4} md={3} key={article}>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            onClick={() => handleOpen(article)}
                                            sx={{
                                                height: '90px',
                                                borderWidth: '2px',
                                                borderRadius: '16px',
                                                borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
                                                bgcolor: darkMode ? 'rgba(255,255,255,0.03)' : 'transparent',
                                                flexDirection: 'column',
                                                color: 'text.primary',
                                                '&:hover': {
                                                    borderWidth: '2px',
                                                    borderColor: 'primary.main',
                                                    bgcolor: darkMode ? 'rgba(114, 47, 55, 0.1)' : 'rgba(114, 47, 55, 0.04)',
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ fontWeight: 900, textAlign: 'center', lineHeight: 1.2 }}>
                                                {article}
                                            </Typography>
                                        </Button>
                                    </Grid>
                                ))}
                            </Grid>

                            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: 1 }}>RESPONSABLE</Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            value={usuari}
                                            onChange={(e) => setUsuari(e.target.value)}
                                            SelectProps={{ native: true }}
                                            variant="outlined"
                                            sx={{ '& select': { fontWeight: 800, py: 1.5 } }}
                                        >
                                            {usuaris.map(u => <option key={u} value={u}>{u}</option>)}
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 900, color: 'text.secondary', display: 'block', mb: 1 }}>UBICACIÓ</Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            value={ubicacio}
                                            onChange={(e) => setUbicacio(e.target.value)}
                                            SelectProps={{ native: true }}
                                            variant="outlined"
                                            sx={{ '& select': { fontWeight: 800, py: 1.5 } }}
                                        >
                                            {UBICACIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ p: { xs: 0, sm: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900 }}>Estat de l'Estoc</Typography>
                                <Box sx={{ display: 'flex', bgcolor: 'rgba(0,0,0,0.05)', borderRadius: '12px', p: 0.5 }}>
                                    <Button
                                        size="small"
                                        onClick={() => setDashMode('cards')}
                                        variant={dashMode === 'cards' ? 'contained' : 'text'}
                                    >Llista</Button>
                                    <Button
                                        size="small"
                                        onClick={() => setDashMode('charts')}
                                        variant={dashMode === 'charts' ? 'contained' : 'text'}
                                    >Gràfics</Button>
                                </Box>
                            </Box>

                            {Object.keys(stockLevels).length === 0 ? (
                                <Alert severity="info" sx={{ borderRadius: 4 }}>Sincronitza primer per veure dades del Drive.</Alert>
                            ) : (
                                dashMode === 'cards' ? (
                                    <Grid container spacing={2}>
                                        {Object.entries(stockLevels).map(([name, data]) => (
                                            <Grid item xs={12} sm={6} md={4} key={name}>
                                                <Card variant="outlined" sx={{ borderRadius: 5 }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary' }}>{name}</Typography>
                                                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 2 }}>{data.total} <small style={{ fontSize: '0.9rem' }}>u.</small></Typography>
                                                        <Divider sx={{ mb: 2 }} />
                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            <Box>
                                                                <Typography variant="caption" display="block">CELLER</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 900 }}>{data.celler}</Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography variant="caption" display="block">EL PLA</Typography>
                                                                <Typography variant="body1" sx={{ fontWeight: 900 }}>{data.pla}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    renderCharts()
                                )
                            )}
                        </Box>
                    )}
                </Container>

                <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px' } }}>
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
                                {GENERATE_YEARS().map(y => <option key={y} value={y}>{y}</option>)}
                            </TextField>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <TextField
                                        label="Caixes (x6)"
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
                                        variant="action"
                                        size="small"
                                        onClick={() => setCaixes(prev => parseInt(prev || 0) + 1)}
                                        sx={{ mt: 1, bgcolor: 'action.hover', fontWeight: 800, borderRadius: '10px' }}
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
                                        variant="action"
                                        size="small"
                                        onClick={() => setAmpolles(prev => parseInt(prev || 0) + 1)}
                                        sx={{ mt: 1, bgcolor: 'action.hover', fontWeight: 800, borderRadius: '10px' }}
                                    >
                                        +1 Amp.
                                    </Button>
                                </Box>
                            </Box>

                            <Box sx={{ p: 2.5, bgcolor: darkMode ? 'rgba(114, 47, 55, 0.15)' : 'rgba(114, 47, 55, 0.05)', borderRadius: '20px', textAlign: 'center' }}>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                    {(parseInt(caixes || 0) * 6) + parseInt(ampolles || 0)} <small style={{ fontSize: '1rem' }}>amp.</small>
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Switch checked={isIncidencia} onChange={(e) => setIsIncidencia(e.target.checked)} />
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>⚠️ Incidència</Typography>
                                </Box>
                                <Button component="label" variant="text" startIcon={<Camera size={20} />}>
                                    Foto
                                    <input type="file" hidden accept="image/*" capture="environment" onChange={handlePhotoCapture} />
                                </Button>
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
                        <Button onClick={() => setOpen(false)}>Anul·lar</Button>
                        <Button variant="contained" onClick={handleSave} startIcon={<Save />}>Guardar local</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={syncDialogOpen} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '12px' } }}>
                    <DialogContent sx={{ py: 4 }}>
                        <Typography variant="h6" sx={{ color: 'primary.main', mb: 1 }}>Sincronitzant dades...</Typography>
                        <Typography variant="body2" sx={{ mb: 3 }}>Enviant: {syncCurrentItem}</Typography>
                        <LinearProgress variant="determinate" value={syncProgress} sx={{ height: 20, borderRadius: 10 }} />
                        <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right', fontWeight: 900 }}>{Math.round(syncProgress)}%</Typography>
                    </DialogContent>
                </Dialog>

                <Dialog open={globalHistoryOpen} onClose={() => setGlobalHistoryOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
                    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, px: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900 }}>Històric Global</Typography>
                        <IconButton onClick={() => setGlobalHistoryOpen(false)}><X /></IconButton>
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

                        {loadingHistory ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress size={30} /></Box>
                        ) : globalLogs.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', py: 4, opacity: 0.6 }}>No s'han trobat registres.</Typography>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                {globalLogs
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
                                        // Mapeig flexible per si les claus venen en majúscules o minúscules
                                        const L = {
                                            article: log.ARTICLE || log.article || 'Desconegut',
                                            year: log.ANYADA || log.year || log.anyada || '',
                                            total: log['TOTAL AMPOLLES'] || log.totalBottles || log.total || 0,
                                            user: log.USUARI || log.user || log.usuari || '?',
                                            location: log.UBICACIÓ || log.location || log.ubicacio || '?',
                                            timestamp: log.TIMESTAMP || log.timestamp || '',
                                            incidencia: log.INCIDÈNCIA || log.incidencia || false
                                        };

                                        return (
                                            <Card
                                                key={idx}
                                                variant="outlined"
                                                {...useLongPress(log, idx)}
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
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Typography variant="caption" sx={{ fontWeight: 800 }}>{L.user} • {L.location}</Typography>
                                                        {L.incidencia && (
                                                            <Box sx={{ bgcolor: 'error.main', color: 'white', px: 1, py: 0.2, borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900 }}>INCIDÈNCIA</Box>
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

                {/* Diàleg d'edició de registre historial */}
                <Dialog open={editLogOpen} onClose={() => setEditLogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px' } }}>
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
                                onChange={e => setEditForm(f => ({ ...f, article: e.target.value.toUpperCase() }))}
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
                                    {GENERATE_YEARS().map(y => <option key={y} value={y}>{y}</option>)}
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
                                    {UBICACIONS.map(u => <option key={u} value={u}>{u}</option>)}
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
                                    {(parseInt(editForm.boxes) || 0) * 6 + (parseInt(editForm.bottles) || 0)}
                                    <small style={{ fontSize: '1rem', marginLeft: 6 }}>amp.</small>
                                </Typography>
                            </Box>
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setEditLogOpen(false)}>Cancel·lar</Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveEditLog}
                            disabled={savingEdit}
                            startIcon={savingEdit ? <CircularProgress size={16} /> : <Save size={16} />}
                        >
                            {savingEdit ? 'Guardant...' : 'Guardar Canvis'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '24px' } }}>
                    <DialogTitle sx={{ fontWeight: 900 }}>Pendents de pujar ({pendingCount})</DialogTitle>
                    <DialogContent>
                        {pendingEntries.length === 0 ? (
                            <Typography sx={{ p: 3, textAlign: 'center' }}>Cap dada pendent.</Typography>
                        ) : (
                            <List>
                                {[...pendingEntries].reverse().map((entry, idx) => {
                                    const realIdx = pendingEntries.length - 1 - idx;
                                    return (
                                        <ListItem key={realIdx} secondaryAction={
                                            <Box>
                                                <IconButton onClick={() => { handleOpen(entry.article, realIdx); setHistoryOpen(false); }} color="primary"><Save size={18} /></IconButton>
                                                <IconButton onClick={() => {
                                                    const p = [...pendingEntries]; p.splice(realIdx, 1);
                                                    localStorage.setItem('inventory_pending', JSON.stringify(p));
                                                    setPendingCount(p.length);
                                                }} color="error"><Trash2 size={18} /></IconButton>
                                            </Box>
                                        }>
                                            <ListItemText primary={<Typography sx={{ fontWeight: 800 }}>{entry.article} - {entry.totalBottles} u.</Typography>} secondary={entry.timestamp} />
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setHistoryOpen(false)}>Tancar</Button>
                        <Button variant="contained" onClick={handleSync} disabled={pendingCount === 0}>Sincronitzar Tot</Button>
                    </DialogActions>
                </Dialog>

                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px', fontWeight: 800 }}>{snackbar.message}</Alert>
                </Snackbar>
            </Box>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap');
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </ThemeProvider>
    );
}

export default App;
