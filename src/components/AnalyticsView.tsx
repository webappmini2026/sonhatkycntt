import { useMemo } from 'react';
import { WORK_CATEGORIES, WORK_STATUSES } from '../data/initialLogs';
import { WorkLogEntry } from '../types/logbook';
import {
  formatDateVN,
  formatDurationVN,
  getShortWeekdayVN,
  getTodayISO,
  offsetDateISO,
} from '../utils/logbookUtils';
import { StatusLabel } from './StatusIndicator';

interface AnalyticsViewProps {
  entries: WorkLogEntry[];
}

export function AnalyticsView({ entries }: AnalyticsViewProps) {
  const today = getTodayISO();

  const summary = useMemo(() => {
    const totalMinutes = entries.reduce((sum, e) => sum + e.durationMinutes, 0);
    const totalCount = entries.length;
    const avgMinutes = totalCount > 0 ? Math.round(totalMinutes / totalCount) : 0;

    const byCategory = WORK_CATEGORIES.map((cat) => {
      const matched = entries.filter((e) => e.category === cat);
      const mins = matched.reduce((s, e) => s + e.durationMinutes, 0);
      return {
        category: cat,
        count: matched.length,
        minutes: mins,
        pct: totalMinutes > 0 ? Math.round((mins / totalMinutes) * 100) : 0,
      };
    }).sort((a, b) => b.minutes - a.minutes);

    const byStatus = WORK_STATUSES.map((st) => {
      const matched = entries.filter((e) => e.status === st);
      return {
        status: st,
        count: matched.length,
        pct: totalCount > 0 ? Math.round((matched.length / totalCount) * 100) : 0,
      };
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const dateISO = offsetDateISO(today, i - 6);
      const dayItems = entries.filter((e) => e.date === dateISO);
      const mins = dayItems.reduce((s, e) => s + e.durationMinutes, 0);
      return {
        dateISO,
        label: `${getShortWeekdayVN(dateISO)} ${formatDateVN(dateISO).slice(0, 5)}`,
        count: dayItems.length,
        minutes: mins,
      };
    });

    const maxDayMinutes = Math.max(60, ...last7Days.map((d) => d.minutes));

    const systemMap = new Map<string, { count: number; minutes: number }>();
    for (const e of entries) {
      const key = e.systemName || 'Hệ thống khác';
      const cur = systemMap.get(key) || { count: 0, minutes: 0 };
      systemMap.set(key, {
        count: cur.count + 1,
        minutes: cur.minutes + e.durationMinutes,
      });
    }
    const topSystems = Array.from(systemMap.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6);

    const staffMap = new Map<string, { count: number; minutes: number }>();
    for (const e of entries) {
      const key = e.assignee || 'Chưa phân công';
      const cur = staffMap.get(key) || { count: 0, minutes: 0 };
      staffMap.set(key, {
        count: cur.count + 1,
        minutes: cur.minutes + e.durationMinutes,
      });
    }
    const topStaff = Array.from(staffMap.entries())
      .map(([name, val]) => ({ name, ...val }))
      .sort((a, b) => b.minutes - a.minutes);

    return {
      totalMinutes,
      totalCount,
      avgMinutes,
      byCategory,
      byStatus,
      last7Days,
      maxDayMinutes,
      topSystems,
      topStaff,
    };
  }, [entries, today]);

  return (
    <div className="space-y-6">
      {/* Top KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Tổng khối lượng đã ghi nhận
          </div>
          <div className="mt-1.5 text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatDurationVN(summary.totalMinutes)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            Trên tổng số {summary.totalCount} đầu việc
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Thời lượng trung bình mỗi đầu việc
          </div>
          <div className="mt-1.5 text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatDurationVN(summary.avgMinutes)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tính trên toàn bộ sổ công tác
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Số cán bộ tham gia ghi sổ
          </div>
          <div className="mt-1.5 text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {summary.topStaff.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Phân bổ công tác vận hành & hỗ trợ
          </div>
        </div>
      </div>

      {/* Category Distribution & 7-Day Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Phân bổ thời gian theo nhóm công tác
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tỷ trọng thời lượng xử lý giữa các mảng công việc CNTT
            </p>
          </div>

          <div className="space-y-4">
            {summary.byCategory.map((row) => (
              <div key={row.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {row.category}
                  </span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {row.count} việc · {formatDurationVN(row.minutes)} ({row.pct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Khối lượng công tác 7 ngày gần nhất
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Biểu đồ thời lượng công tác hàng ngày (giờ / phút)
            </p>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6">
            {summary.last7Days.map((day) => {
              const heightPct = Math.round(
                (day.minutes / summary.maxDayMinutes) * 100
              );
              return (
                <div
                  key={day.dateISO}
                  className="flex flex-col items-center justify-end h-full gap-2"
                >
                  <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {day.minutes > 0 ? formatDurationVN(day.minutes) : '—'}
                  </div>
                  <div className="w-full flex-1 flex items-end justify-center">
                    <div
                      className={`w-full max-w-[36px] rounded-t-md transition-all duration-300 ${
                        day.dateISO === today
                          ? 'bg-blue-600 dark:bg-blue-500'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                      style={{
                        height: `${day.minutes > 0 ? Math.max(10, heightPct) : 4}%`,
                      }}
                      title={`${day.label}: ${day.count} việc (${formatDurationVN(
                        day.minutes
                      )})`}
                    />
                  </div>
                  <div className="text-[11px] font-mono tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {day.label}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Bottom Tables: Systems & Status/Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Hệ thống & Thiết bị tác động nhiều nhất
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {summary.topSystems.length === 0 ? (
              <div className="px-6 py-8 text-sm text-slate-500 text-center">
                Chưa có dữ liệu hệ thống.
              </div>
            ) : (
              summary.topSystems.map((sys) => (
                <div
                  key={sys.name}
                  className="px-6 py-3 flex items-center justify-between gap-4 text-sm"
                >
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate">
                    {sys.name}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                    {sys.count} lượt · {formatDurationVN(sys.minutes)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Tình trạng xử lý & Đóng góp cán bộ
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {summary.byStatus.map((row) => (
              <div
                key={row.status}
                className="px-6 py-3 flex items-center justify-between gap-4 text-sm"
              >
                <StatusLabel status={row.status} />
                <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                  {row.count} mục ({row.pct}%)
                </span>
              </div>
            ))}
            {summary.topStaff.map((person) => (
              <div
                key={person.name}
                className="px-6 py-3 flex items-center justify-between gap-4 text-sm bg-slate-50/50 dark:bg-slate-950/30"
              >
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Cán bộ: {person.name}
                </span>
                <span className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {person.count} việc · {formatDurationVN(person.minutes)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
