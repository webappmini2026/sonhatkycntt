import { useEffect, useState } from 'react';
import { Copy, Edit3, Trash2, X } from 'lucide-react';
import { WORK_STATUSES } from '../data/initialLogs';
import { WorkLogEntry, WorkStatus } from '../types/logbook';
import {
  formatDateVN,
  formatDurationVN,
  getWeekdayVN,
} from '../utils/logbookUtils';
import { PriorityLabel, StatusLabel } from './StatusIndicator';

interface LogDetailDrawerProps {
  entry: WorkLogEntry | null;
  onClose: () => void;
  onEdit: (entry: WorkLogEntry) => void;
  onDuplicate: (entry: WorkLogEntry) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: WorkStatus) => void;
}

export function LogDetailDrawer({
  entry,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onUpdateStatus,
}: LogDetailDrawerProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setConfirmingDelete(false);
  }, [entry?.id]);

  useEffect(() => {
    if (!entry) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [entry, onClose]);

  if (!entry) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-950/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-log-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 h-full flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span>{entry.code}</span>
              <span aria-hidden="true">·</span>
              <span>{getWeekdayVN(entry.date)}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDateVN(entry.date)}</span>
            </div>
            <h2
              id="drawer-log-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1.5 leading-snug"
            >
              {entry.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Đóng chi tiết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Cập nhật nhanh trạng thái
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
              {WORK_STATUSES.map((st) => {
                const active = entry.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onUpdateStatus(entry.id, st)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-slate-200 dark:border-slate-800 text-sm">
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Trạng thái hiện tại
              </dt>
              <dd className="mt-1">
                <StatusLabel status={entry.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Mức độ ưu tiên
              </dt>
              <dd className="mt-1">
                <PriorityLabel priority={entry.priority} />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Khung giờ & Thời lượng
              </dt>
              <dd className="mt-1 font-mono tabular-nums text-slate-900 dark:text-slate-100 text-xs">
                {entry.startTime} – {entry.endTime} ({formatDurationVN(entry.durationMinutes)})
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Nhóm công tác
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-slate-100 font-medium">
                {entry.category}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Hệ thống / Thiết bị
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-slate-100">
                {entry.systemName}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Địa điểm / Đơn vị
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-slate-100">
                {entry.location}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-slate-500 dark:text-slate-400">
                Cán bộ thực hiện
              </dt>
              <dd className="mt-1 text-slate-900 dark:text-slate-100 font-medium">
                {entry.assignee}
              </dd>
            </div>
          </dl>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nội dung chi tiết công việc
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {entry.description || 'Chưa ghi nội dung chi tiết.'}
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Kết quả & Ghi chú bàn giao
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {entry.resultNote || 'Chưa có ghi chú bàn giao.'}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          {confirmingDelete ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-red-700 dark:text-red-400">
                Xóa mục nhật ký {entry.code}?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(entry.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors whitespace-nowrap"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDuplicate(entry);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Nhân bản</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEdit(entry);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
