import { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  FilePlus2,
  RotateCcw,
  Search,
} from 'lucide-react';
import { WORK_CATEGORIES, WORK_STATUSES } from '../data/initialLogs';
import { WorkCategory, WorkLogEntry, WorkStatus } from '../types/logbook';
import {
  formatDateVN,
  formatDurationVN,
  getInitials,
  getTodayISO,
  offsetDateISO,
} from '../utils/logbookUtils';
import { PriorityLabel, StatusLabel } from './StatusIndicator';

interface LogbookTableViewProps {
  entries: WorkLogEntry[];
  onSelectEntry: (entry: WorkLogEntry) => void;
  onOpenCreate: () => void;
}

type DateScope = 'all' | 'today' | '7days' | 'month';
type SortField = 'date' | 'duration';

export function LogbookTableView({
  entries,
  onSelectEntry,
  onOpenCreate,
}: LogbookTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WorkStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | WorkCategory>('all');
  const [dateScope, setDateScope] = useState<DateScope>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const today = getTodayISO();
  const sevenDaysAgo = offsetDateISO(today, -6);
  const currentMonthPrefix = today.slice(0, 7);

  const stats = useMemo(() => {
    const totalCount = entries.length;
    const todayCount = entries.filter((e) => e.date === today).length;
    const totalMinutes = entries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const completedCount = entries.filter((e) => e.status === 'Hoàn thành').length;
    const openCount = entries.filter(
      (e) => e.status === 'Đang xử lý' || e.status === 'Cần theo dõi'
    ).length;
    const completionRate =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      todayCount,
      totalMinutes,
      completedCount,
      openCount,
      completionRate,
    };
  }, [entries, today]);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = entries.filter((entry) => {
      if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && entry.category !== categoryFilter) return false;
      if (dateScope === 'today' && entry.date !== today) return false;
      if (dateScope === '7days' && entry.date < sevenDaysAgo) return false;
      if (dateScope === 'month' && !entry.date.startsWith(currentMonthPrefix)) {
        return false;
      }

      if (q) {
        const haystack = [
          entry.code,
          entry.title,
          entry.systemName,
          entry.location,
          entry.assignee,
          entry.description,
          entry.resultNote,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') {
        const keyA = `${a.date} ${a.startTime}`;
        const keyB = `${b.date} ${b.startTime}`;
        cmp = keyA.localeCompare(keyB);
      } else {
        cmp = a.durationMinutes - b.durationMinutes;
      }
      return sortAsc ? cmp : -cmp;
    });

    return list;
  }, [
    entries,
    searchQuery,
    statusFilter,
    categoryFilter,
    dateScope,
    sortField,
    sortAsc,
    today,
    sevenDaysAgo,
    currentMonthPrefix,
  ]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    categoryFilter !== 'all' ||
    dateScope !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setDateScope('all');
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc((prev) => !prev);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Compact 4-column summary strip separated by 1px hairline dividers */}
      <section
        aria-label="Thống kê nhanh sổ nhật ký"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800"
      >
        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tổng số mục nhật ký
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {stats.totalCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {stats.todayCount} mục hôm nay
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tổng thời lượng công tác
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatDurationVN(stats.totalMinutes)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {(stats.totalMinutes / 60).toFixed(1)} giờ
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Công việc hoàn thành
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {stats.completedCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              Đạt {stats.completionRate}%
            </span>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Đang mở / Cần theo dõi
          </div>
          <div className="mt-1.5 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-semibold text-amber-700 dark:text-amber-400 tabular-nums">
              {stats.openCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Cần bàn giao ca
            </span>
          </div>
        </div>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã sổ, nội dung, thiết bị, cán bộ..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Lọc theo nhóm công tác"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as 'all' | WorkCategory)
              }
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Tất cả nhóm công tác</option>
              {WORK_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc theo khoảng thời gian"
              value={dateScope}
              onChange={(e) => setDateScope(e.target.value as DateScope)}
              className="px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-600"
            >
              <option value="all">Toàn bộ thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="7days">7 ngày gần đây</option>
              <option value="month">Tháng hiện tại</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Segmented status filter bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div
            role="tablist"
            aria-label="Lọc theo trạng thái"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Tất cả ({entries.length})
            </button>
            {WORK_STATUSES.map((st) => {
              const count = entries.filter((e) => e.status === st).length;
              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                    active
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            Hiển thị {filteredEntries.length} / {entries.length} mục
          </div>
        </div>
      </section>

      {/* Main High-Density Data Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {filteredEntries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {entries.length === 0
                ? 'Sổ nhật ký công tác chưa có dữ liệu'
                : 'Không tìm thấy mục nhật ký phù hợp'}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto">
              {entries.length === 0
                ? 'Bắt đầu ghi nhận hoạt động vận hành, hỗ trợ kỹ thuật hoặc bảo trì hệ thống vào sổ công tác.'
                : 'Thử thay đổi từ khóa tìm kiếm hoặc đặt lại bộ lọc trạng thái và thời gian.'}
            </p>
            <div className="mt-5">
              {entries.length === 0 ? (
                <button
                  type="button"
                  onClick={onOpenCreate}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Ghi mục đầu tiên</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Đặt lại bộ lọc</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 pl-5 pr-3 whitespace-nowrap">Mã sổ</th>
                  <th className="py-3 px-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleSort('date')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                    >
                      <span>Ngày & Giờ</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                  <th className="py-3 px-3 min-w-[260px]">Nội dung công tác</th>
                  <th className="py-3 px-3 whitespace-nowrap">Nhóm & Mức độ</th>
                  <th className="py-3 px-3 whitespace-nowrap">Cán bộ</th>
                  <th className="py-3 px-3 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3 pl-3 pr-5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => toggleSort('duration')}
                      className="inline-flex items-center justify-end gap-1 hover:text-slate-900 dark:hover:text-slate-100 transition-colors ml-auto"
                    >
                      <span>Thời lượng</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => onSelectEntry(entry)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectEntry(entry);
                      }
                    }}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:bg-blue-50/60 dark:focus:bg-slate-800"
                  >
                    <td className="py-3 pl-5 pr-3 align-top font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {entry.code}
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="font-mono text-xs text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatDateVN(entry.date)}
                      </div>
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                        {entry.startTime}–{entry.endTime}
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top max-w-md">
                      <div className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {entry.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        <span>{entry.systemName}</span>
                        <span aria-hidden="true" className="mx-1.5">
                          ·
                        </span>
                        <span>{entry.location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="text-xs text-slate-700 dark:text-slate-300">
                        {entry.category}
                      </div>
                      <div className="mt-0.5">
                        <PriorityLabel priority={entry.priority} />
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold inline-flex items-center justify-center shrink-0"
                        >
                          {getInitials(entry.assignee)}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                          {entry.assignee}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <StatusLabel status={entry.status} />
                    </td>

                    <td className="py-3 pl-3 pr-5 align-top text-right font-mono text-xs text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">
                      {formatDurationVN(entry.durationMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
