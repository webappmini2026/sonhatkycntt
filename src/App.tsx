import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  Menu,
  Moon,
  Plus,
  Settings,
  Sun,
  X,
} from 'lucide-react';
import { AnalyticsView } from './components/AnalyticsView';
import { LogDetailDrawer } from './components/LogDetailDrawer';
import { LogFormModal } from './components/LogFormModal';
import { LogbookTableView } from './components/LogbookTableView';
import { ReportExportView } from './components/ReportExportView';
import { UnitSettingsModal } from './components/UnitSettingsModal';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import {
  createInitialLogEntries,
  DEFAULT_UNIT_PROFILE,
} from './data/initialLogs';
import {
  AppView,
  UnitProfile,
  WorkLogEntry,
  WorkStatus,
} from './types/logbook';
import { generateNextCode, getTodayISO } from './utils/logbookUtils';

const STORAGE_ENTRIES_KEY = 'cntt_logbook_entries_v1';
const STORAGE_PROFILE_KEY = 'cntt_logbook_profile_v1';
const STORAGE_THEME_KEY = 'cntt_logbook_theme_v1';

const NAV_ITEMS: { id: AppView; label: string; icon: typeof BookOpen }[] = [
  { id: 'logbook', label: 'Nhật ký công tác', icon: BookOpen },
  { id: 'weekly', label: 'Lịch công tác tuần', icon: CalendarDays },
  { id: 'analytics', label: 'Tổng quan & Thống kê', icon: BarChart3 },
  { id: 'report', label: 'Báo cáo & Xuất sổ', icon: FileSpreadsheet },
];

export default function App() {
  const [entries, setEntries] = useState<WorkLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ENTRIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return createInitialLogEntries();
  });

  const [unitProfile, setUnitProfile] = useState<UnitProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.organizationName === 'string') {
          return { ...DEFAULT_UNIT_PROFILE, ...parsed };
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_UNIT_PROFILE;
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_THEME_KEY) === 'dark';
    } catch {
      return false;
    }
  });

  const [activeView, setActiveView] = useState<AppView>('logbook');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WorkLogEntry | null>(null);
  const [presetDate, setPresetDate] = useState<string | undefined>(undefined);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entries));
    } catch {
      // ignore quota errors
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(unitProfile));
    } catch {
      // ignore quota errors
    }
  }, [unitProfile]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [isDark]);

  const selectedEntry = useMemo(
    () => entries.find((e) => e.id === selectedEntryId) || null,
    [entries, selectedEntryId]
  );

  const nextCode = useMemo(
    () => generateNextCode(entries, presetDate || getTodayISO()),
    [entries, presetDate]
  );

  const activeNavTitle =
    NAV_ITEMS.find((n) => n.id === activeView)?.label || 'Nhật ký công tác';

  const openCreateModal = (dateISO?: string) => {
    setEditingEntry(null);
    setPresetDate(dateISO);
    setFormOpen(true);
  };

  const openEditModal = (entry: WorkLogEntry) => {
    setEditingEntry(entry);
    setPresetDate(undefined);
    setFormOpen(true);
  };

  const handleSaveEntry = (
    data: Omit<WorkLogEntry, 'id' | 'code' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();
    if (existingId) {
      setEntries((prev) =>
        prev.map((item) =>
          item.id === existingId
            ? { ...item, ...data, updatedAt: now }
            : item
        )
      );
    } else {
      const code = generateNextCode(entries, data.date);
      const newEntry: WorkLogEntry = {
        ...data,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code,
        createdAt: now,
        updatedAt: now,
      };
      setEntries((prev) => [newEntry, ...prev]);
    }
  };

  const handleDuplicateEntry = (source: WorkLogEntry) => {
    const today = getTodayISO();
    const now = new Date().toISOString();
    const newEntry: WorkLogEntry = {
      ...source,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code: generateNextCode(entries, today),
      date: today,
      status: 'Đang xử lý',
      title: `${source.title} (Bản sao)`,
      createdAt: now,
      updatedAt: now,
    };
    setEntries((prev) => [newEntry, ...prev]);
    setSelectedEntryId(newEntry.id);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((item) => item.id !== id));
    if (selectedEntryId === id) {
      setSelectedEntryId(null);
    }
  };

  const handleUpdateStatus = (id: string, status: WorkStatus) => {
    const now = new Date().toISOString();
    setEntries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status, updatedAt: now } : item
      )
    );
  };

  const handleImportEntries = (imported: WorkLogEntry[]) => {
    setEntries((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const merged = [...prev];
      for (const item of imported) {
        if (!existingIds.has(item.id)) {
          merged.push(item);
        }
      }
      return merged;
    });
  };

  const handleResetSampleData = () => {
    setEntries(createInitialLogEntries());
    setUnitProfile(DEFAULT_UNIT_PROFILE);
    setSelectedEntryId(null);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div>
        <div className="px-5 h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="font-display font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
            Nhật ký CNTT
          </div>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-md"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Điều hướng sổ công tác">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <div className="px-3 py-2">
          <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
            {unitProfile.defaultAssignee}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {unitProfile.departmentName}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSettingsOpen(true);
            setMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors whitespace-nowrap"
        >
          <Settings className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Cấu hình đơn vị</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors whitespace-nowrap"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Giao diện sáng</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Giao diện tối</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="no-print fixed inset-0 z-40 lg:hidden flex bg-slate-950/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside
            className="w-64 bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar Contract: Breadcrumb on left, 1 Primary CTA on right */}
        <header className="no-print h-16 px-4 sm:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
                Sổ công tác CNTT
              </span>
              <span
                className="text-slate-400 dark:text-slate-600 hidden sm:inline"
                aria-hidden="true"
              >
                /
              </span>
              <h1 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeNavTitle}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Ghi nhật ký mới</span>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto">
          {activeView === 'logbook' && (
            <LogbookTableView
              entries={entries}
              onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
              onOpenCreate={() => openCreateModal()}
            />
          )}

          {activeView === 'weekly' && (
            <WeeklyScheduleView
              entries={entries}
              onSelectEntry={(entry) => setSelectedEntryId(entry.id)}
              onCreateForDate={(dateISO) => openCreateModal(dateISO)}
            />
          )}

          {activeView === 'analytics' && <AnalyticsView entries={entries} />}

          {activeView === 'report' && (
            <ReportExportView
              entries={entries}
              unitProfile={unitProfile}
              onImportEntries={handleImportEntries}
            />
          )}
        </main>
      </div>

      <LogFormModal
        isOpen={formOpen}
        editingEntry={editingEntry}
        presetDate={presetDate}
        defaultAssignee={unitProfile.defaultAssignee}
        nextCode={nextCode}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveEntry}
      />

      <LogDetailDrawer
        entry={selectedEntry}
        onClose={() => setSelectedEntryId(null)}
        onEdit={openEditModal}
        onDuplicate={handleDuplicateEntry}
        onDelete={handleDeleteEntry}
        onUpdateStatus={handleUpdateStatus}
      />

      <UnitSettingsModal
        isOpen={settingsOpen}
        profile={unitProfile}
        onClose={() => setSettingsOpen(false)}
        onSave={setUnitProfile}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}
