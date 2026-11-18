import React, { useMemo, useRef, useState } from 'react';
import { Download, FileSpreadsheet, Printer, Upload } from 'lucide-react';
import { WORK_STATUSES } from '../data/initialLogs';
import { UnitProfile, WorkLogEntry, WorkStatus } from '../types/logbook';
import {
  exportEntriesToCSV,
  exportEntriesToJSON,
  formatDateVN,
  formatDurationVN,
  getTodayISO,
  offsetDateISO,
} from '../utils/logbookUtils';

interface ReportExportViewProps {
  entries: WorkLogEntry[];
  unitProfile: UnitProfile;
  onImportEntries: (imported: WorkLogEntry[]) => void;
}

export function ReportExportView({
  entries,
  unitProfile,
  onImportEntries,
}: ReportExportViewProps) {
  const today = getTodayISO();
  const [fromDate, setFromDate] = useState(offsetDateISO(today, -30));
  const [toDate, setToDate] = useState(today);
  const [statusFilter, setStatusFilter] = useState<'all' | WorkStatus>('all');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reportEntries = useMemo(() => {
    return entries
      .filter((e) => {
        if (fromDate && e.date < fromDate) return false;
        if (toDate && e.date > toDate) return false;
        if (statusFilter !== 'all' && e.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
  }, [entries, fromDate, toDate, statusFilter]);

  const totalMinutes = useMemo(
    () => reportEntries.reduce((sum, e) => sum + e.durationMinutes, 0),
    [reportEntries]
  );

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed) ? parsed : parsed?.entries;
        if (!Array.isArray(list)) {
          setFeedback({
            type: 'error',
            text: 'Tệp JSON không đúng định dạng sổ nhật ký.',
          });
          return;
        }
        const valid = list.filter(
          (item) =>
            item &&
            typeof item.title === 'string' &&
            typeof item.date === 'string' &&
            typeof item.code === 'string'
        ) as WorkLogEntry[];
        if (valid.length === 0) {
          setFeedback({
            type: 'error',
            text: 'Không tìm thấy bản ghi hợp lệ trong tệp.',
          });
          return;
        }
        onImportEntries(valid);
        setFeedback({
          type: 'success',
          text: `Đã nhập thành công ${valid.length} mục nhật ký từ tệp sao lưu.`,
        });
      } catch {
        setFeedback({
          type: 'error',
          text: 'Không thể đọc tệp JSON. Vui lòng kiểm tra lại.',
        });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Export & Filter Controls (Hidden when printing) */}
      <section className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 max-w-2xl">
            <div>
              <label
                htmlFor="report-from"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Từ ngày
              </label>
              <input
                id="report-from"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="report-to"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Đến ngày
              </label>
              <input
                id="report-to"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="report-status"
                className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1"
              >
                Trạng thái công việc
              </label>
              <select
                id="report-status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | WorkStatus)
                }
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              >
                <option value="all">Tất cả trạng thái</option>
                {WORK_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => exportEntriesToCSV(reportEntries)}
              disabled={reportEntries.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất CSV (Excel)</span>
            </button>

            <button
              type="button"
              onClick={() => exportEntriesToJSON(entries)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Sao lưu JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Nhập JSON</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => window.print()}
              disabled={reportEntries.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>In sổ / Lưu PDF</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className={`px-3.5 py-2 text-xs rounded-lg border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900'
            }`}
          >
            {feedback.text}
          </div>
        )}
      </section>

      {/* Formal Printable IT Logbook Sheet */}
      <section className="print-area bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {unitProfile.organizationName}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {unitProfile.departmentName}
            </div>
          </div>
          <div className="sm:text-right text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <div>
              Kỳ sổ: {formatDateVN(fromDate)} – {formatDateVN(toDate)}
            </div>
            <div className="mt-0.5">
              Tổng cộng: {reportEntries.length} mục · {formatDurationVN(totalMinutes)}
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            SỔ NHẬT KÝ HOẠT ĐỘNG CÔNG TÁC CÔNG NGHỆ THÔNG TIN
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ghi chép công tác vận hành hệ thống, xử lý sự cố, bảo trì hạ tầng và hỗ trợ người dùng
          </p>
        </div>

        {reportEntries.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            Không có mục công tác nào trong khoảng thời gian đã chọn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-y border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 font-semibold">
                  <th className="py-2.5 px-2.5 text-center w-10">STT</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Ngày / Giờ</th>
                  <th className="py-2.5 px-2.5 min-w-[200px]">
                    Nội dung công tác & Hệ thống
                  </th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Nhóm công tác</th>
                  <th className="py-2.5 px-2.5 whitespace-nowrap">Cán bộ</th>
                  <th className="py-2.5 px-2.5 min-w-[160px]">Kết quả & Trạng thái</th>
                  <th className="py-2.5 px-2.5 text-right whitespace-nowrap">
                    Thời lượng
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {reportEntries.map((item, idx) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-3 px-2.5 text-center font-mono tabular-nums text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-2.5 font-mono tabular-nums whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div>{formatDateVN(item.date)}</div>
                      <div className="text-slate-500 mt-0.5">
                        {item.startTime}–{item.endTime}
                      </div>
                    </td>
                    <td className="py-3 px-2.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.systemName} · {item.location}
                      </div>
                      {item.description && (
                        <div className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <div>{item.category}</div>
                      <div className="text-slate-500 font-mono mt-0.5">
                        {item.code}
                      </div>
                    </td>
                    <td className="py-3 px-2.5 whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {item.assignee}
                    </td>
                    <td className="py-3 px-2.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {item.status}
                      </div>
                      {item.resultNote && (
                        <div className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.resultNote}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono tabular-nums whitespace-nowrap text-slate-800 dark:text-slate-200">
                      {formatDurationVN(item.durationMinutes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs text-slate-600 dark:text-slate-400">
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Người lập sổ nhật ký
            </div>
            <div className="italic mt-0.5">{unitProfile.preparedByTitle}</div>
            <div className="mt-14 font-semibold text-slate-900 dark:text-slate-100">
              {unitProfile.defaultAssignee}
            </div>
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              Xác nhận của Phụ trách bộ phận
            </div>
            <div className="italic mt-0.5">(Ký, ghi rõ họ tên)</div>
            <div className="mt-14 font-medium text-slate-400">
              ........................................
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
