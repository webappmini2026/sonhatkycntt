import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  QUICK_TEMPLATES,
  WORK_CATEGORIES,
  WORK_PRIORITIES,
  WORK_STATUSES,
} from '../data/initialLogs';
import {
  QuickTemplate,
  WorkCategory,
  WorkLogEntry,
  WorkPriority,
  WorkStatus,
} from '../types/logbook';
import {
  addMinutesToTime,
  calculateDurationMinutes,
  formatDurationVN,
  getTodayISO,
} from '../utils/logbookUtils';

interface LogFormModalProps {
  isOpen: boolean;
  editingEntry: WorkLogEntry | null;
  presetDate?: string;
  defaultAssignee: string;
  nextCode: string;
  onClose: () => void;
  onSave: (
    data: Omit<WorkLogEntry, 'id' | 'code' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => void;
}

export function LogFormModal({
  isOpen,
  editingEntry,
  presetDate,
  defaultAssignee,
  nextCode,
  onClose,
  onSave,
}: LogFormModalProps) {
  const [date, setDate] = useState(getTodayISO());
  const [startTime, setStartTime] = useState('08:30');
  const [endTime, setEndTime] = useState('09:30');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<WorkCategory>('Hạ tầng & Mạng');
  const [systemName, setSystemName] = useState('');
  const [location, setLocation] = useState('');
  const [assignee, setAssignee] = useState(defaultAssignee);
  const [priority, setPriority] = useState<WorkPriority>('Bình thường');
  const [status, setStatus] = useState<WorkStatus>('Hoàn thành');
  const [description, setDescription] = useState('');
  const [resultNote, setResultNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg('');
    if (editingEntry) {
      setDate(editingEntry.date);
      setStartTime(editingEntry.startTime);
      setEndTime(editingEntry.endTime);
      setTitle(editingEntry.title);
      setCategory(editingEntry.category);
      setSystemName(editingEntry.systemName);
      setLocation(editingEntry.location);
      setAssignee(editingEntry.assignee);
      setPriority(editingEntry.priority);
      setStatus(editingEntry.status);
      setDescription(editingEntry.description);
      setResultNote(editingEntry.resultNote);
    } else {
      setDate(presetDate || getTodayISO());
      setStartTime('08:30');
      setEndTime('09:30');
      setTitle('');
      setCategory('Hạ tầng & Mạng');
      setSystemName('');
      setLocation('Phòng Server');
      setAssignee(defaultAssignee);
      setPriority('Bình thường');
      setStatus('Hoàn thành');
      setDescription('');
      setResultNote('');
    }
  }, [isOpen, editingEntry, presetDate, defaultAssignee]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const durationMinutes = calculateDurationMinutes(startTime, endTime);

  const applyTemplate = (tpl: QuickTemplate) => {
    setCategory(tpl.category);
    setPriority(tpl.priority);
    setTitle(tpl.title);
    setSystemName(tpl.systemName);
    setLocation(tpl.location);
    setDescription(tpl.description);
    setResultNote(tpl.resultNote);
    setEndTime(addMinutesToTime(startTime, tpl.defaultDurationMinutes));
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề công việc.');
      return;
    }
    if (!date) {
      setErrorMsg('Vui lòng chọn ngày công tác.');
      return;
    }
    if (durationMinutes <= 0) {
      setErrorMsg('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    onSave(
      {
        date,
        startTime,
        endTime,
        durationMinutes,
        title: title.trim(),
        category,
        systemName: systemName.trim() || 'Hệ thống chung',
        location: location.trim() || 'Văn phòng',
        assignee: assignee.trim() || defaultAssignee,
        priority,
        status,
        description: description.trim(),
        resultNote: resultNote.trim(),
      },
      editingEntry?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="log-modal-title"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="log-modal-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {editingEntry ? 'Chỉnh sửa nhật ký công tác' : 'Ghi nhật ký công tác mới'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
              Mã sổ: {editingEntry ? editingEntry.code : nextCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600"
            aria-label="Đóng biểu mẫu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {!editingEntry && (
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                Mẫu ghi nhanh hoạt động CNTT
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg"
            >
              {errorMsg}
            </div>
          )}

          <div>
            <label
              htmlFor="log-title"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Tiêu đề công việc <span className="text-red-600">*</span>
            </label>
            <input
              id="log-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kiểm tra và gia hạn chứng chỉ SSL cổng dịch vụ"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="log-date"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Ngày công tác <span className="text-red-600">*</span>
              </label>
              <input
                id="log-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="log-start"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Từ giờ
              </label>
              <input
                id="log-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="log-end"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Đến giờ{' '}
                <span className="text-xs font-normal text-slate-500 font-mono tabular-nums">
                  ({formatDurationVN(durationMinutes)})
                </span>
              </label>
              <input
                id="log-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="log-category"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Nhóm công tác
              </label>
              <select
                id="log-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as WorkCategory)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              >
                {WORK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="log-priority"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Mức độ ưu tiên
              </label>
              <select
                id="log-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkPriority)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              >
                {WORK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="log-status"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Trạng thái
              </label>
              <select
                id="log-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkStatus)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              >
                {WORK_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="log-system"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Hệ thống / Thiết bị
              </label>
              <input
                id="log-system"
                type="text"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="VD: Firewall, VM-APP-01..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="log-location"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Địa điểm / Đơn vị
              </label>
              <input
                id="log-location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="VD: Phòng Server, Tầng 3..."
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label
                htmlFor="log-assignee"
                className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Cán bộ thực hiện
              </label>
              <input
                id="log-assignee"
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Họ và tên"
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="log-description"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Nội dung công việc đã thực hiện
            </label>
            <textarea
              id="log-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả thao tác kỹ thuật, nguyên nhân sự cố hoặc quy trình đã triển khai..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-y"
            />
          </div>

          <div>
            <label
              htmlFor="log-result"
              className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Kết quả & Ghi chú bàn giao
            </label>
            <textarea
              id="log-result"
              rows={2}
              value={resultNote}
              onChange={(e) => setResultNote(e.target.value)}
              placeholder="Kết quả kiểm tra sau xử lý, điểm cần theo dõi hoặc nội dung bàn giao ca sau..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              {editingEntry ? 'Lưu thay đổi' : 'Lưu vào sổ nhật ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
