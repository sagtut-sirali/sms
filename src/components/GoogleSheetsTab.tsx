import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Upload,
  Download,
  RefreshCw, 
  ExternalLink, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  Layers, 
  Users, 
  FolderKanban, 
  CalendarCheck, 
  GraduationCap, 
  BookOpen, 
  Receipt, 
  Copy, 
  Check, 
  Settings, 
  LogOut, 
  Search, 
  Eye, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  Student, 
  StudentGroup, 
  AttendanceRecord, 
  TestScore, 
  SubjectSyllabus, 
  FeeRecord, 
  GoogleSheetsConfig 
} from '../types';
import { 
  fetchSpreadsheetInfo, 
  createTuitionDatabaseSpreadsheet, 
  syncAllTablesToGoogleSheets, 
  pullAllTablesFromGoogleSheets, 
  readSheetValues, 
  addSheetTab, 
  deleteSheetTab, 
  SpreadsheetDetails, 
  SheetTabInfo, 
  FullTuitionDataset 
} from '../services/googleSheets';
import { googleSignIn, googleSignOut, getAccessToken } from '../services/googleAuth';

interface GoogleSheetsTabProps {
  students: Student[];
  groups: StudentGroup[];
  attendance: AttendanceRecord[];
  testScores: TestScore[];
  syllabus: SubjectSyllabus[];
  fees: FeeRecord[];
  sheetsConfig: GoogleSheetsConfig | null;
  onUpdateConfig: (config: GoogleSheetsConfig | null) => void;
  onApplyPulledData: (data: FullTuitionDataset) => void;
  showToast: (msg: string) => void;
  currentUser: User | null;
  onUserAuthChange: (user: User | null) => void;
}

export const GoogleSheetsTab: React.FC<GoogleSheetsTabProps> = ({
  students,
  groups,
  attendance,
  testScores,
  syllabus,
  fees,
  sheetsConfig,
  onUpdateConfig,
  onApplyPulledData,
  showToast,
  currentUser,
  onUserAuthChange,
}) => {
  const [spreadsheetDetails, setSpreadsheetDetails] = useState<SpreadsheetDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectIdInput, setConnectIdInput] = useState('');
  const [isConnectingExisting, setIsConnectingExisting] = useState(false);

  // Tab Manager state
  const [newTabTitle, setNewTabTitle] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [selectedInspectTab, setSelectedInspectTab] = useState<string | null>(null);
  const [inspectData, setInspectData] = useState<any[][] | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectSearch, setInspectSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Destructive Action Modal state
  const [deleteTabConfirm, setDeleteTabConfirm] = useState<SheetTabInfo | null>(null);
  const [pullConfirmOpen, setPullConfirmOpen] = useState(false);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<{ id: string; time: string; text: string; type: 'success' | 'info' | 'error' }[]>([
    { id: '1', time: new Date().toLocaleTimeString(), text: 'Google Sheets Database engine initialized', type: 'info' },
  ]);

  const addLog = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setActivityLogs(prev => [
      { id: `log-${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString(), text, type },
      ...prev.slice(0, 25),
    ]);
  };

  // Load Spreadsheet Details if configured
  useEffect(() => {
    const loadDetails = async () => {
      const token = getAccessToken();
      if (!token || !sheetsConfig?.spreadsheetId) return;

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const details = await fetchSpreadsheetInfo(token, sheetsConfig.spreadsheetId);
        setSpreadsheetDetails(details);
      } catch (err: any) {
        console.error('Failed to load spreadsheet details:', err);
        setErrorMessage(err.message || 'Could not load spreadsheet details. Please reconnect your account or verify spreadsheet ID.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser && sheetsConfig?.spreadsheetId) {
      loadDetails();
    }
  }, [currentUser, sheetsConfig?.spreadsheetId]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const res = await googleSignIn();
      if (res) {
        onUserAuthChange(res.user);
        showToast(`Signed in as ${res.user.displayName || res.user.email}`);
        addLog(`Connected Google Account: ${res.user.email}`, 'success');
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Browser popup was blocked. Please allow popups for this site in your browser URL bar and try again.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google Sign-in popup was closed before completing authentication.');
      } else if (err.message?.includes('verification') || err.message?.includes('blocked') || err.message?.includes('access_denied')) {
        setErrorMessage('Google OAuth Notice: If Google shows "Google hasn\'t verified this app", click "Advanced" (or "Show details") at the bottom-left of the Google popup, then click "Go to sound-mercury-m98sv.firebaseapp.com (unsafe)" and confirm permissions.');
      } else {
        setErrorMessage(err.message || 'Failed to sign in with Google');
      }
      showToast('Google Sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      onUserAuthChange(null);
      setSpreadsheetDetails(null);
      showToast('Signed out of Google Account');
      addLog('Signed out of Google Account', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDatabase = async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      addLog('Creating new Google Spreadsheet database with standard schema tabs...', 'info');
      
      const newSheet = await createTuitionDatabaseSpreadsheet(token, 'Sir Ali Preparations - Tuition Database');
      
      const newConfig: GoogleSheetsConfig = {
        spreadsheetId: newSheet.id,
        spreadsheetTitle: newSheet.title,
        spreadsheetUrl: newSheet.url,
        autoSync: true,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };
      
      onUpdateConfig(newConfig);
      setSpreadsheetDetails(newSheet);
      showToast(`Created & Linked "${newSheet.title}"`);
      addLog(`Created spreadsheet "${newSheet.title}" (ID: ${newSheet.id})`, 'success');

      // Immediately push existing local data to populate the newly created sheet
      addLog('Syncing current student records and batches into new spreadsheet...', 'info');
      await syncAllTablesToGoogleSheets(token, newSheet.id, {
        students,
        groups,
        attendance,
        testScores,
        syllabus,
        fees,
      });
      showToast('Initial data pushed to Google Sheets successfully!');
      addLog('Initial database sync completed successfully!', 'success');
    } catch (err: any) {
      console.error('Failed to create database:', err);
      setErrorMessage(err.message || 'Failed to create new spreadsheet');
      showToast('Failed to create spreadsheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectExisting = async () => {
    const token = getAccessToken();
    if (!token) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    let extractedId = connectIdInput.trim();
    // Extract ID if full URL pasted
    if (extractedId.includes('/spreadsheets/d/')) {
      const match = extractedId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        extractedId = match[1];
      }
    }

    if (!extractedId) {
      setErrorMessage('Please enter a valid Google Spreadsheet ID or URL');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const details = await fetchSpreadsheetInfo(token, extractedId);
      
      const newConfig: GoogleSheetsConfig = {
        spreadsheetId: details.id,
        spreadsheetTitle: details.title,
        spreadsheetUrl: details.url,
        autoSync: sheetsConfig?.autoSync ?? true,
        lastSyncedAt: new Date().toLocaleTimeString(),
      };

      onUpdateConfig(newConfig);
      setSpreadsheetDetails(details);
      setIsConnectingExisting(false);
      setConnectIdInput('');
      showToast(`Connected to "${details.title}"`);
      addLog(`Connected to Google Spreadsheet: ${details.title}`, 'success');
    } catch (err: any) {
      console.error('Failed to connect spreadsheet:', err);
      setErrorMessage(err.message || 'Could not connect to this spreadsheet. Make sure your Google account has edit permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushAllData = async () => {
    const token = getAccessToken();
    if (!token || !sheetsConfig?.spreadsheetId) {
      setErrorMessage('Spreadsheet is not connected.');
      return;
    }

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      addLog('Pushing all database tables to Google Sheets...', 'info');

      await syncAllTablesToGoogleSheets(token, sheetsConfig.spreadsheetId, {
        students,
        groups,
        attendance,
        testScores,
        syllabus,
        fees,
      });

      const time = new Date().toLocaleTimeString();
      onUpdateConfig({
        ...sheetsConfig,
        lastSyncedAt: time,
      });

      // Refresh sheet info
      const updatedDetails = await fetchSpreadsheetInfo(token, sheetsConfig.spreadsheetId);
      setSpreadsheetDetails(updatedDetails);

      showToast('All tables successfully synced to Google Sheets!');
      addLog(`Pushed ${students.length} students, ${groups.length} batches, ${attendance.length} attendance logs, ${fees.length} fee records to Google Sheets`, 'success');
    } catch (err: any) {
      console.error('Push failed:', err);
      setErrorMessage(err.message || 'Failed to sync data to Google Sheets');
      showToast('Push to Google Sheets failed');
      addLog(`Sync error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExecutePullData = async () => {
    const token = getAccessToken();
    if (!token || !sheetsConfig?.spreadsheetId) {
      setErrorMessage('Spreadsheet is not connected.');
      return;
    }

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      setPullConfirmOpen(false);
      addLog('Pulling fresh database rows from Google Sheets...', 'info');

      const pulled = await pullAllTablesFromGoogleSheets(token, sheetsConfig.spreadsheetId);
      onApplyPulledData(pulled);

      const time = new Date().toLocaleTimeString();
      onUpdateConfig({
        ...sheetsConfig,
        lastSyncedAt: time,
      });

      showToast(`Loaded ${pulled.students.length} students & ${pulled.groups.length} batches from Google Sheets!`);
      addLog(`Imported ${pulled.students.length} students, ${pulled.groups.length} batches, ${pulled.fees.length} fee records from Google Sheets`, 'success');
    } catch (err: any) {
      console.error('Pull failed:', err);
      setErrorMessage(err.message || 'Failed to pull data from Google Sheets');
      showToast('Failed to pull from Google Sheets');
      addLog(`Pull error: ${err.message}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddCustomTab = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAccessToken();
    if (!token || !sheetsConfig?.spreadsheetId || !newTabTitle.trim()) return;

    try {
      setIsLoading(true);
      await addSheetTab(token, sheetsConfig.spreadsheetId, newTabTitle.trim());
      showToast(`Added tab "${newTabTitle.trim()}" to Google Sheets`);
      addLog(`Created sheet tab: "${newTabTitle.trim()}" in Google Sheets`, 'success');
      setNewTabTitle('');
      setIsAddingTab(false);

      const updatedDetails = await fetchSpreadsheetInfo(token, sheetsConfig.spreadsheetId);
      setSpreadsheetDetails(updatedDetails);
    } catch (err: any) {
      console.error('Add tab failed:', err);
      setErrorMessage(err.message || 'Failed to add tab');
      showToast('Failed to add tab');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteDeleteTab = async () => {
    const token = getAccessToken();
    if (!token || !sheetsConfig?.spreadsheetId || !deleteTabConfirm) return;

    try {
      setIsLoading(true);
      await deleteSheetTab(token, sheetsConfig.spreadsheetId, deleteTabConfirm.sheetId);
      showToast(`Deleted tab "${deleteTabConfirm.title}"`);
      addLog(`Deleted sheet tab "${deleteTabConfirm.title}" from Google Sheets`, 'info');
      setDeleteTabConfirm(null);

      const updatedDetails = await fetchSpreadsheetInfo(token, sheetsConfig.spreadsheetId);
      setSpreadsheetDetails(updatedDetails);
    } catch (err: any) {
      console.error('Delete tab failed:', err);
      setErrorMessage(err.message || 'Failed to delete tab');
      showToast('Failed to delete tab');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspectTab = async (tabTitle: string) => {
    const token = getAccessToken();
    if (!token || !sheetsConfig?.spreadsheetId) return;

    try {
      setIsInspecting(true);
      setSelectedInspectTab(tabTitle);
      setInspectData(null);
      const rows = await readSheetValues(token, sheetsConfig.spreadsheetId, `${tabTitle}!A1:Z100`);
      setInspectData(rows);
    } catch (err: any) {
      console.error('Inspect failed:', err);
      showToast(`Could not read data from tab "${tabTitle}"`);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleToggleAutoSync = () => {
    if (!sheetsConfig) return;
    const updated = {
      ...sheetsConfig,
      autoSync: !sheetsConfig.autoSync,
    };
    onUpdateConfig(updated);
    showToast(updated.autoSync ? 'Auto-Sync enabled: Changes will save to Google Sheets' : 'Auto-Sync disabled: Local-only mode');
  };

  const copySpreadsheetLink = () => {
    if (!sheetsConfig?.spreadsheetUrl) return;
    navigator.clipboard.writeText(sheetsConfig.spreadsheetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    showToast('Spreadsheet URL copied to clipboard');
  };

  // Metric summaries for visual cards
  const standardTabsMeta = [
    { name: 'Students', icon: Users, count: students.length, unit: 'students', color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400' },
    { name: 'Groups', icon: FolderKanban, count: groups.length, unit: 'batches', color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-purple-400' },
    { name: 'Attendance', icon: CalendarCheck, count: attendance.length, unit: 'records', color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400' },
    { name: 'TestScores', icon: GraduationCap, count: testScores.length, unit: 'quizzes', color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400' },
    { name: 'Syllabus', icon: BookOpen, count: syllabus.length, unit: 'subjects', color: 'from-cyan-500/10 to-sky-500/10 border-cyan-500/30 text-cyan-400' },
    { name: 'Fees', icon: Receipt, count: fees.length, unit: 'invoices', color: 'from-rose-500/10 to-red-500/10 border-rose-500/30 text-rose-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                  Google Sheets Live Database
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                    Manageable Tabs & Real-Time Sync
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Use your Google Drive & Sheets account as the master database for Sir Ali Preparations with full tab management, live backup, and instant restore.
                </p>
              </div>
            </div>
          </div>

          {/* User Auth & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {!currentUser ? (
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                id="google-signin-btn"
                className="gsi-material-button flex items-center gap-3 bg-white hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-xl font-medium shadow-md transition-all duration-150 disabled:opacity-50"
              >
                <div className="gsi-material-button-icon w-5 h-5">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-sm font-semibold">Sign in with Google</span>
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/70 rounded-xl p-1.5 pr-3">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                    {(currentUser.displayName || currentUser.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">{currentUser.displayName || 'Google Account'}</p>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{currentUser.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error / Warning Alert */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-start gap-3 text-rose-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-rose-200">Database Action Notice</p>
            <p className="text-rose-300/90 mt-0.5 leading-relaxed">{errorMessage}</p>
          </div>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="text-xs text-rose-400 hover:text-rose-200 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Verification Notice Helper (If not logged in) */}
      {!currentUser && (
        <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4 flex items-start gap-3 text-blue-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-blue-200">Google OAuth Sign-in Note</p>
            <p className="text-blue-300/90 leading-relaxed">
              When signing in with Google: If Google shows a warning screen stating <em>"Google hasn't verified this app"</em>, click <strong>"Advanced"</strong> (or <em>Show details</em>) at the bottom left of the Google popup, and then click <strong>"Go to Sir Ali Preparations / sound-mercury-m98sv.firebaseapp.com (unsafe)"</strong> to grant permission to create and sync your tuition database spreadsheets.
            </p>
          </div>
        </div>
      )}

      {/* Database Connection & Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Spreadsheet & Manageable Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Database Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`w-3.5 h-3.5 rounded-full ${sheetsConfig?.spreadsheetId ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    {sheetsConfig?.spreadsheetTitle || 'No Spreadsheet Connected'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {sheetsConfig?.spreadsheetId ? (
                      <span className="font-mono text-slate-400">ID: {sheetsConfig.spreadsheetId}</span>
                    ) : (
                      'Create a new database spreadsheet or connect an existing one'
                    )}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {sheetsConfig?.spreadsheetUrl && (
                  <>
                    <a
                      href={sheetsConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in Sheets
                    </a>
                    <button
                      onClick={copySpreadsheetLink}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      title="Copy URL"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setIsConnectingExisting(!isConnectingExisting)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  {isConnectingExisting ? 'Cancel' : 'Switch / Connect'}
                </button>
              </div>
            </div>

            {/* Connect Existing Form (Expandable) */}
            {isConnectingExisting && (
              <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Connect Existing Google Sheet</h3>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={connectIdInput}
                    onChange={(e) => setConnectIdInput(e.target.value)}
                    placeholder="Paste Spreadsheet ID or full Google Sheet URL..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleConnectExisting}
                    disabled={isLoading || !connectIdInput.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Link Sheet
                  </button>
                </div>
              </div>
            )}

            {/* If no sheet connected, prompt */}
            {!sheetsConfig?.spreadsheetId ? (
              <div className="mt-6 text-center py-8 px-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-200">Initialize Google Sheets Database</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Create a dedicated spreadsheet in your Google Drive with all 6 tabs pre-structured (Students, Groups, Attendance, TestScores, Syllabus, Fees).
                  </p>
                </div>
                <button
                  onClick={handleCreateDatabase}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {isLoading ? 'Creating...' : '1-Click Create Google Sheets Database'}
                </button>
              </div>
            ) : (
              /* Sync Control Bar */
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={handlePushAllData}
                  disabled={isSyncing || isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-900/30 disabled:opacity-50"
                >
                  <CloudUpload className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  Push to Sheets (Sync Now)
                </button>

                <button
                  onClick={() => setPullConfirmOpen(true)}
                  disabled={isSyncing || isLoading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-colors disabled:opacity-50"
                >
                  <CloudDownload className="w-4 h-4 text-blue-400" />
                  Pull from Sheets (Restore)
                </button>

                <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-3.5 h-3.5 ${sheetsConfig.autoSync ? 'text-emerald-400 animate-spin-slow' : 'text-slate-500'}`} />
                    <span className="font-medium text-slate-300">Auto-Sync</span>
                  </div>
                  <button
                    onClick={handleToggleAutoSync}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${sheetsConfig.autoSync ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${sheetsConfig.autoSync ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Manageable Tabs Dashboard */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  Manageable Spreadsheet Tabs
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect raw rows, verify tab structure, add custom tabs, or delete obsolete sheets.
                </p>
              </div>

              {sheetsConfig?.spreadsheetId && (
                <button
                  onClick={() => setIsAddingTab(!isAddingTab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  Add Custom Tab
                </button>
              )}
            </div>

            {/* Add Tab Drawer */}
            {isAddingTab && (
              <form onSubmit={handleAddCustomTab} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-slate-300">Add New Sheet Tab to Google Spreadsheet</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTabTitle}
                    onChange={(e) => setNewTabTitle(e.target.value)}
                    placeholder="e.g. PastPapers_2026, Homework_Tracker..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !newTabTitle.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    Create Tab
                  </button>
                </div>
              </form>
            )}

            {/* Tab Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {standardTabsMeta.map((tab) => {
                const Icon = tab.icon;
                const isConfigured = spreadsheetDetails?.sheets.some((s) => s.title.toLowerCase() === tab.name.toLowerCase());
                return (
                  <div
                    key={tab.name}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg bg-slate-900 border ${tab.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                            {tab.name}
                            {isConfigured && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" title="Tab verified in Google Sheets" />
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-400">{tab.count} {tab.unit}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                      <button
                        onClick={() => handleInspectTab(tab.name)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Data
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Tab: {tab.name}!A1
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Custom Extra Tabs from Google Sheets */}
              {spreadsheetDetails?.sheets
                .filter((s) => !standardTabsMeta.some((std) => std.name.toLowerCase() === s.title.toLowerCase()))
                .map((customSheet) => (
                  <div
                    key={customSheet.sheetId}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400">
                          <Table className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-200">{customSheet.title}</h3>
                          <p className="text-[11px] text-slate-400">Custom Sheet Tab</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDeleteTabConfirm(customSheet)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Tab"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                      <button
                        onClick={() => handleInspectTab(customSheet.title)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect Data
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {customSheet.sheetId}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Col: Sync Stats, Live Logs & Instructions */}
        <div className="space-y-6">
          {/* Live Sync Status Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-400" />
              Database Engine Status
            </h2>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Primary Database</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Google Sheets API v4
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Sync Mode</span>
                <span className="text-xs font-semibold text-slate-200">
                  {sheetsConfig?.autoSync ? 'Bi-directional Real-time' : 'Manual Push/Pull'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400">Last Synced At</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">
                  {sheetsConfig?.lastSyncedAt || 'Not yet synced'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Lock-In & Excel Compatible
              </p>
              <p className="text-emerald-300/80 leading-relaxed text-[11px]">
                Your tuition records are stored in standard spreadsheets in your personal Google Drive. You can open, export, share, or edit them anytime via Google Sheets or Microsoft Excel.
              </p>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                Database Activity Log
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">{activityLogs.length} events</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{log.time}</span>
                    <span className={`px-1.5 py-0.2 rounded font-semibold ${
                      log.type === 'success' ? 'text-emerald-400 bg-emerald-500/10' :
                      log.type === 'error' ? 'text-rose-400 bg-rose-500/10' : 'text-blue-400 bg-blue-500/10'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] break-words">{log.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data & Cell Inspector Modal */}
      {selectedInspectTab && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Table className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Tab Inspector: <span className="text-emerald-400">{selectedInspectTab}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live raw rows queried from Google Sheets range <code className="text-slate-300">{selectedInspectTab}!A1:Z100</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inspectSearch}
                    onChange={(e) => setInspectSearch(e.target.value)}
                    placeholder="Filter rows..."
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setSelectedInspectTab(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-5 overflow-auto flex-1">
              {isInspecting ? (
                <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  Fetching live cells from Google Sheets...
                </div>
              ) : !inspectData || inspectData.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  This tab has no data or has not been pushed yet. Click "Push to Sheets" to populate it.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-300 border-b border-slate-800 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="p-3 w-12 text-slate-500 font-mono text-center">#</th>
                        {inspectData[0]?.map((headerCol: any, idx: number) => (
                          <th key={idx} className="p-3 border-r border-slate-800/80 whitespace-nowrap">
                            {String(headerCol)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60 font-mono text-slate-300">
                      {inspectData.slice(1)
                        .filter(row => !inspectSearch || row.some(cell => String(cell).toLowerCase().includes(inspectSearch.toLowerCase())))
                        .map((row: any[], rowIdx: number) => (
                          <tr key={rowIdx} className="hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 text-slate-500 text-center border-r border-slate-800/80">{rowIdx + 1}</td>
                            {row.map((cell: any, cellIdx: number) => (
                              <td key={cellIdx} className="p-3 border-r border-slate-800/80 whitespace-nowrap max-w-xs truncate">
                                {String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Showing {inspectData ? Math.max(0, inspectData.length - 1) : 0} row(s)</span>
              <button
                onClick={() => setSelectedInspectTab(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pull / Restore Confirmation Modal (Mandatory User Confirmation per Skill Guidelines) */}
      {pullConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CloudDownload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">Restore from Google Sheets?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                This will pull all rows from your connected Google Spreadsheet and replace your current local state with the Google Sheets master data.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-slate-200">Will import data for:</p>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                <li>Students Directory & Contacts</li>
                <li>Group Batches & Roster assignments</li>
                <li>Daily Attendance Logs</li>
                <li>Test & Quiz Scores</li>
                <li>Syllabus Topic Trackers</li>
                <li>Monthly Fee Invoices & Payments</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPullConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecutePullData}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                {isSyncing ? 'Pulling...' : 'Yes, Pull & Replace Local State'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Tab Confirmation Modal (Mandatory User Confirmation per Skill Guidelines) */}
      {deleteTabConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-100">Delete Google Sheet Tab?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to permanently delete the tab <strong className="text-rose-300 font-mono">"{deleteTabConfirm.title}"</strong> (Sheet ID: {deleteTabConfirm.sheetId}) from your Google Spreadsheet?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTabConfirm(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDeleteTab}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-500/20"
              >
                {isLoading ? 'Deleting...' : 'Confirm Delete Tab'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
