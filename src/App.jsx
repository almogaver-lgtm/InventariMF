import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Snackbar, Alert } from '@mui/material';

// Constants & Utils
import { INITIAL_ARTICLES, INITIAL_USUARIS, UBICACIONS, DEFAULT_SCRIPT_URL, CHART_COLORS } from './constants';
import { robustParseDate, formatCurrentDate, GENERATE_YEARS } from './utils/dateUtils';
import { useLongPress } from './hooks/useLongPress';

// Components
import AppHeader from './components/AppHeader';
import ProductGrid from './components/ProductGrid';
import EntryDialog from './components/EntryDialog';
import StockDashboard from './components/StockDashboard';
import GlobalHistoryDialog from './components/GlobalHistoryDialog';
import EditLogDialog from './components/EditLogDialog';
import PendingDialog from './components/PendingDialog';
import SyncDialog from './components/SyncDialog';
import WelcomeSetupDialog from './components/WelcomeSetupDialog';
import VintageBreakdownDialog from './components/VintageBreakdownDialog';

function App() {
    // UI State
    const [darkMode, setDarkMode] = useState(localStorage.getItem('inventory_dark_mode') === 'true');
    const [view, setView] = useState('grid');
    const [setupOpen, setSetupOpen] = useState(false);

    // Core Data State
    const [articles, setArticles] = useState(INITIAL_ARTICLES);
    const [usuaris, setUsuaris] = useState(INITIAL_USUARIS);
    const [stockLevels, setStockLevels] = useState({});
    const [pendingEntries, setPendingEntries] = useState([]);
    const [pendingCount, setPendingCount] = useState(0);

    // Current Entry State
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [open, setOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(null);
    const [ampolles, setAmpolles] = useState(0);
    const [caixes, setCaixes] = useState(0);
    const [barrils, setBarrils] = useState(0);
    const [anyada, setAnyada] = useState(new Date().getFullYear().toString());
    const [photo, setPhoto] = useState(null);
    const [isIncidencia, setIsIncidencia] = useState(false);
    const [incidenciaText, setIncidenciaText] = useState('');

    // Selection State
    const [usuari, setUsuari] = useState(localStorage.getItem('inventory_user') || '');
    const [ubicacio, setUbicacio] = useState(''); // Obligatory every session

    // History & Sync State
    const [globalLogs, setGlobalLogs] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyRange, setHistoryRange] = useState('24h');
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncCurrentItem, setSyncCurrentItem] = useState('');
    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    // Breakdown State
    const [vintageDialogOpen, setVintageDialogOpen] = useState(false);
    const [vintageData, setVintageData] = useState([]);
    const [vintageLoading, setVintageLoading] = useState(false);
    const [vintageArticle, setVintageArticle] = useState('');

    // Dialog Control
    const [historyOpen, setHistoryOpen] = useState(false);
    const [globalHistoryOpen, setGlobalHistoryOpen] = useState(false);
    const [editLogOpen, setEditLogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingLog, setDeletingLog] = useState(false);

    // Feedback
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [pressingLogIdx, setPressingLogIdx] = useState(null);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            primary: { main: '#722f37' },
            background: {
                default: darkMode ? '#0f0e0e' : '#f8f9fa',
                paper: darkMode ? '#1a1818' : '#ffffff',
            },
        },
        typography: { fontFamily: '"Outfit", "Inter", sans-serif' },
        shape: { borderRadius: 20 },
    });

    useEffect(() => {
        fetchGlobalConfig();
        const updatePending = () => {
            const pending = JSON.parse(localStorage.getItem('inventory_pending') || '[]');
            setPendingCount(pending.length);
            setPendingEntries(pending);
        };
        updatePending();
        window.addEventListener('storage', updatePending);
        if (!usuari) setSetupOpen(true);
        return () => window.removeEventListener('storage', updatePending);
    }, []);

    const fetchGlobalConfig = async () => {
        try {
            const res = await fetch(`${DEFAULT_SCRIPT_URL}?action=getConfig`);
            const data = await res.json();
            if (data.users) setUsuaris([...new Set([...INITIAL_USUARIS, ...data.users])]);
            if (data.articles) setArticles([...new Set([...INITIAL_ARTICLES, ...data.articles])]);
            if (data.stock) setStockLevels(data.stock);
        } catch (e) {
            console.log("Offline mode or GAS error");
        }
    };

    const fetchGlobalHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch(`${DEFAULT_SCRIPT_URL}?action=getHistory`);
            const data = await res.json();
            setGlobalLogs(data.logs || []);
        } catch (e) {
            setSnackbar({ open: true, message: 'Error carregant historial', severity: 'error' });
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchVintageBreakdown = async (article) => {
        setVintageArticle(article);
        setVintageData([]);
        setVintageLoading(true);
        setVintageDialogOpen(true);
        try {
            const res = await fetch(`${DEFAULT_SCRIPT_URL}?action=getStockByVintage&article=${encodeURIComponent(article)}`);
            const data = await res.json();
            setVintageData(data.vintages || []);
        } catch (e) {
            setSnackbar({ open: true, message: 'Error carregant detall per anyada', severity: 'error' });
        } finally {
            setVintageLoading(false);
        }
    };

    const handleOpenArticle = (article, index = null) => {
        setSelectedArticle(article);
        setIsIncidencia(false);
        setIncidenciaText('');
        setPhoto(null);
        setBarrils(0);
        if (index !== null) {
            const entry = pendingEntries[index];
            setAmpolles(entry.bottles || 0);
            setCaixes(entry.boxes || 0);
            setBarrils(entry.barrels || 0);
            setAnyada(entry.year || '');
            setEditIndex(index);
        } else {
            setAmpolles(0);
            setCaixes(0);
            setEditIndex(null);
        }
        setOpen(true);
    };

    const handleSaveEntry = () => {
        const bottlesPerBox = selectedArticle === 'CERVESA PETITA' ? 16 : 6;
        const total = (parseInt(caixes || 0) * bottlesPerBox) + parseInt(ampolles || 0);

        let finalIncidenciaText = incidenciaText;
        if (barrils > 0) {
            const barrelTag = `[${barrils} BARRILS]`;
            if (!finalIncidenciaText.includes(barrelTag)) {
                finalIncidenciaText = finalIncidenciaText ? `${barrelTag} ${finalIncidenciaText}` : barrelTag;
            }
        }

        const entry = {
            timestamp: formatCurrentDate(),
            user: usuari,
            article: selectedArticle,
            year: anyada,
            location: ubicacio,
            bottles: parseInt(ampolles || 0),
            boxes: parseInt(caixes || 0),
            barrels: parseInt(barrils || 0),
            totalBottles: total,
            incidencia: isIncidencia || barrils > 0,
            incidenciaText: finalIncidenciaText,
            image: photo,
            locationSource: 'App Mobil v2'
        };

        const pending = JSON.parse(localStorage.getItem('inventory_pending') || '[]');
        if (editIndex !== null) pending[editIndex] = entry;
        else pending.push(entry);

        localStorage.setItem('inventory_pending', JSON.stringify(pending));
        localStorage.setItem('inventory_user', usuari);
        setPendingCount(pending.length);
        setPendingEntries(pending);
        setOpen(false);
        setSnackbar({ open: true, message: 'Guardat en local', severity: 'success' });
    };

    const handleSync = async () => {
        const pending = pendingEntries;
        if (pending.length === 0) return;
        setSyncDialogOpen(true);
        let success = 0;
        for (let i = 0; i < pending.length; i++) {
            setSyncCurrentItem(`${pending[i].article} (${i + 1}/${pending.length})`);
            setSyncProgress(((i + 1) / pending.length) * 100);
            try {
                const res = await fetch(DEFAULT_SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify(pending[i])
                });
                const result = await res.json();
                if (result.status === 'success') success++;
                else break;
            } catch (e) { break; }
        }
        const remaining = pending.slice(success);
        localStorage.setItem('inventory_pending', JSON.stringify(remaining));
        setPendingCount(remaining.length);
        setPendingEntries(remaining);
        setSyncDialogOpen(false);
        if (success === pending.length) {
            setSnackbar({ open: true, message: 'Sincronitzat amb èxit!', severity: 'success' });
            fetchGlobalConfig();
        }
    };

    const handleLongPress = useLongPress((log) => {
        setEditingLog(log);
        setEditForm({
            article: log.ARTICLE || log.article,
            year: log.ANYADA || log.year,
            location: log.UBICACIÓ || log.location,
            bottles: log.AMPOLLES || log.bottles || 0,
            boxes: log.CAIXES || log.boxes || 0,
            incidenciaText: log.INCIDÈNCIA || log.incidenciaText || '',
            timestamp: log.TIMESTAMP || log.timestamp
        });
        setEditLogOpen(true);
    });

    const handleSaveEdit = async () => {
        setSavingEdit(true);
        try {
            await fetch(DEFAULT_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'editEntry', originalTimestamp: editForm.timestamp, ...editForm })
            });
            setEditLogOpen(false);
            fetchGlobalHistory();
            setSnackbar({ open: true, message: 'Registre actualitzat', severity: 'success' });
        } catch (e) {
            setSnackbar({ open: true, message: 'Error al servidor', severity: 'error' });
        } finally {
            setSavingEdit(false);
        }
    };

    const handleDeleteLog = async () => {
        if (!window.confirm("Segur que vols eliminar aquest registre?")) return;
        setDeletingLog(true);
        try {
            await fetch(DEFAULT_SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: 'deleteEntry', originalTimestamp: editForm.timestamp })
            });
            setEditLogOpen(false);
            fetchGlobalHistory();
            setSnackbar({ open: true, message: 'Registre eliminat', severity: 'success' });
        } catch (e) {
            setSnackbar({ open: true, message: 'Error eliminant', severity: 'error' });
        } finally {
            setDeletingLog(false);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'background.default' }}>
                <AppHeader
                    view={view} setView={setView}
                    darkMode={darkMode} setDarkMode={setDarkMode}
                    pendingCount={pendingCount}
                    onOpenHistory={() => setHistoryOpen(true)}
                    onOpenGlobalHistory={setGlobalHistoryOpen}
                    onFetchGlobalHistory={fetchGlobalHistory}
                />

                <Box sx={{ mt: 3, px: 2 }}>
                    {view === 'grid' ? (
                        <ProductGrid
                            articles={articles}
                            onOpenArticle={handleOpenArticle}
                            usuari={usuari} setUsuari={setUsuari} usuaris={usuaris}
                            ubicacio={ubicacio} setUbicacio={setUbicacio} ubicacions={UBICACIONS}
                            darkMode={darkMode}
                        />
                    ) : (
                        <StockDashboard
                            stockLevels={stockLevels}
                            chartColors={CHART_COLORS}
                            darkMode={darkMode}
                            onArticleClick={fetchVintageBreakdown}
                        />
                    )}
                </Box>

                <WelcomeSetupDialog
                    open={setupOpen}
                    usuari={usuari} setUsuari={setUsuari} usuaris={usuaris}
                    ubicacio={ubicacio} setUbicacio={setUbicacio} ubicacions={UBICACIONS}
                    onConfirm={() => setSetupOpen(false)}
                />

                <EntryDialog
                    open={open} onClose={() => setOpen(false)}
                    selectedArticle={selectedArticle}
                    anyada={anyada} setAnyada={setAnyada} years={GENERATE_YEARS()}
                    caixes={caixes} setCaixes={setCaixes}
                    ampolles={ampolles} setAmpolles={setAmpolles}
                    barrils={barrils} setBarrils={setBarrils}
                    isIncidencia={isIncidencia} setIsIncidencia={setIsIncidencia}
                    incidenciaText={incidenciaText} setIncidenciaText={setIncidenciaText}
                    photo={photo} setPhoto={setPhoto}
                    onPhotoCapture={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => setPhoto(ev.target.result);
                            reader.readAsDataURL(file);
                            setIsIncidencia(true);
                        }
                    }}
                    onSave={handleSaveEntry}
                    darkMode={darkMode}
                />

                <VintageBreakdownDialog
                    open={vintageDialogOpen} onClose={() => setVintageDialogOpen(false)}
                    article={vintageArticle} loading={vintageLoading} data={vintageData}
                />

                <GlobalHistoryDialog
                    open={globalHistoryOpen} onClose={() => setGlobalHistoryOpen(false)}
                    loading={loadingHistory} logs={globalLogs}
                    historyRange={historyRange} setHistoryRange={setHistoryRange}
                    onLongPress={(log, idx) => ({
                        ...handleLongPress,
                        onMouseDown: (e) => { setPressingLogIdx(idx); handleLongPress.onMouseDown(log)(e); },
                        onMouseUp: () => { setPressingLogIdx(null); handleLongPress.onMouseUp(); },
                        onTouchStart: (e) => { setPressingLogIdx(idx); handleLongPress.onTouchStart(log)(e); },
                        onTouchEnd: () => { setPressingLogIdx(null); handleLongPress.onTouchEnd(); }
                    })}
                    pressingLogIdx={pressingLogIdx}
                />

                <EditLogDialog
                    open={editLogOpen} onClose={() => setEditLogOpen(false)}
                    editForm={editForm} setEditForm={setEditForm}
                    years={GENERATE_YEARS()} ubicacions={UBICACIONS}
                    onSave={handleSaveEdit} onDelete={handleDeleteLog}
                    saving={savingEdit} deleting={deletingLog} darkMode={darkMode}
                />

                <PendingDialog
                    open={historyOpen} onClose={() => setHistoryOpen(false)}
                    entries={pendingEntries}
                    onEdit={(entry, idx) => { handleOpenArticle(entry.article, idx); setHistoryOpen(false); }}
                    onDelete={(idx) => {
                        const p = [...pendingEntries]; p.splice(idx, 1);
                        localStorage.setItem('inventory_pending', JSON.stringify(p));
                        setPendingCount(p.length); setPendingEntries(p);
                    }}
                    onSync={handleSync}
                />

                <SyncDialog open={syncDialogOpen} currentItem={syncCurrentItem} progress={syncProgress} />

                <Snackbar
                    open={snackbar.open} autoHideDuration={4000}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert severity={snackbar.severity} sx={{ borderRadius: '12px', fontWeight: 800 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap');
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
            `}</style>
        </ThemeProvider>
    );
}

export default App;
