import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { UnitProfile } from '../types/logbook';

interface UnitSettingsModalProps {
  isOpen: boolean;
  profile: UnitProfile;
  onClose: () => void;
  onSave: (profile: UnitProfile) => void;
  onResetSampleData: () => void;
}

export function UnitSettingsModal({
  isOpen,
  profile,
  onClose,
  onSave,
  onResetSampleData,
}: UnitSettingsModalProps) {
  const [organizationName, setOrganizationName] = useState(
    profile.organizationName
  );
  const [departmentName, setDepartmentName] = useState(profile.departmentName);
  const [defaultAssignee, setDefaultAssignee] = useState(
    profile.defaultAssignee
  );
  const [preparedByTitle, setPreparedByTitle] = useState(
    profile.preparedByTitle
  );
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setOrganizationName(profile.organizationName);
    setDepartmentName(profile.departmentName);
    setDefaultAssignee(profile.defaultAssignee);
    setPreparedByTitle(profile.preparedByTitle);
    setConfirmReset(false);
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      organizationName: organizationName.trim() || profile.organizationName,
      departmentName: departmentName.trim() || profile.departmentName,
      defaultAssignee: defaultAssignee.trim() || profile.defaultAssignee,
      preparedByTitle: preparedByTitle.trim() || profile.preparedByTitle,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="unit-settings-title"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2
            id="unit-settings-title"
            className="text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            Cấu hình đơn vị & Người lập sổ
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="org-name"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Tên cơ quan / Doanh nghiệp
            </label>
            <input
              id="org-name"
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="dept-name"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Tên phòng / Bộ phận CNTT
            </label>
            <input
              id="dept-name"
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="default-assignee"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Cán bộ lập sổ mặc định
              </label>
              <input
                id="default-assignee"
                type="text"
                value={defaultAssignee}
                onChange={(e) => setDefaultAssignee(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="prepared-title"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Chức danh ký sổ
              </label>
              <input
                id="prepared-title"
                type="text"
                value={preparedByTitle}
                onChange={(e) => setPreparedByTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {confirmReset ? (
              <div className="flex items-center justify-between gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3.5 py-2.5">
                <span className="text-xs text-amber-800 dark:text-amber-300">
                  Khôi phục dữ liệu mẫu ban đầu?
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetSampleData();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded"
                  >
                    Khôi phục
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục dữ liệu mẫu mặc định</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Lưu cấu hình
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
