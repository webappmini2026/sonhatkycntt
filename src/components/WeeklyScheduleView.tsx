import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { WorkLogEntry } from '../types/logbook';
import {
  formatDateVN,
  formatDurationVN,
  getShortWeekdayVN,
  getTodayISO,
  getWeekDates,
  offsetDateISO,
} from '../utils/logbookUtils';
import { StatusLabel } from './StatusIndicator';

interface WeeklyScheduleViewProps {
  entries: WorkLogEntry[];
  onSelectEntry: (entry: WorkLogEntry) => void;
  onCreateForDate: (dateISO: string) => void;
}

export function WeeklyScheduleView({
  entries,
  onSelectEntry,
  onCreateForDate,
}: WeeklyScheduleViewProps) {
  const today = getTodayISO();
  const [anchorDate, setAnchorDate] = useState(today);

  const weekDates = useMemo(() => getWeekDates(anchorDate), [anchorDate]);

  const entriesByDate = useMemo(() => {
    const map: Record<string, WorkLogEntry[]> = {};
    for (const d of weekDates) {
      map[d] = [];
    }
    for (const entry of entries) {
      if (map[entry.date]) {
        map[entry.date].push(entry);
      }
    }
    for (const d of weekDates) {
      map[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [entries, weekDates]);

  const weekTotalMinutes = useMemo(() => {
    return weekDates.reduce(
      (sum, d) =>
        sum + entriesByDate[d].reduce((s, item) => s + item.durationMinutes, 0),
      0
    );
  }, [weekDates, entriesByDate]);

  const weekTotalCount = useMemo(() => {
    return weekDates.reduce((sum, d) => sum + entriesByDate[d].length, 0);
  }, [weekDates, entriesByDate]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Lịch công tác tuần ({formatDateVN(weekDates[0])} –{' '}
            {formatDateVN(weekDates[6])})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            {weekTotalCount} mục công tác · Tổng thời lượng{' '}
            {formatDurationVN(weekTotalMinutes)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAnchorDate((prev) => offsetDateISO(prev, -7))}
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Tuần trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setAnchorDate(today)}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            Tuần hiện tại
          </button>
          <button
            type="button"
            onClick={() => setAnchorDate((prev) => offsetDateISO(prev, 7))}
            className="p-2 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Tuần sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
        {weekDates.map((dateISO) => {
          const dayEntries = entriesByDate[dateISO] || [];
          const dayMinutes = dayEntries.reduce(
            (sum, item) => sum + item.durationMinutes,
            0
          );
          const isToday = dateISO === today;

          return (
            <div
              key={dateISO}
              className={`flex flex-col bg-white dark:bg-slate-900 border rounded-xl overflow-hidden min-h-[280px] ${
                isToday
                  ? 'border-blue-600 dark:border-blue-500'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="px-3.5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-950/40">
                <div>
                  <div
                    className={`text-xs font-semibold ${
                      isToday
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {getShortWeekdayVN(dateISO)} · {formatDateVN(dateISO).slice(0, 5)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                    {dayEntries.length > 0
                      ? `${dayEntries.length} việc · ${formatDurationVN(dayMinutes)}`
                      : 'Chưa ghi'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onCreateForDate(dateISO)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-md transition-colors shrink-0"
                  title={`Ghi nhật ký ngày ${formatDateVN(dateISO)}`}
                  aria-label={`Ghi nhật ký ngày ${formatDateVN(dateISO)}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-2.5 space-y-2">
                {dayEntries.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-8 text-center">
                    <button
                      type="button"
                      onClick={() => onCreateForDate(dateISO)}
                      className="text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      + Thêm nhật ký
                    </button>
                  </div>
                ) : (
                  dayEntries.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectEntry(item)}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-950/30 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        <span>
                          {item.startTime}–{item.endTime}
                        </span>
                        <span>{formatDurationVN(item.durationMinutes)}</span>
                      </div>
                      <div className="text-xs font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.assignee}
                      </div>
                      <div className="pt-0.5">
                        <StatusLabel status={item.status} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
