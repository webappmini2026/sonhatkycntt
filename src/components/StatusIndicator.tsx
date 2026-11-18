import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  PauseCircle,
} from 'lucide-react';
import { WorkPriority, WorkStatus } from '../types/logbook';

export function StatusLabel({ status }: { status: WorkStatus }) {
  switch (status) {
    case 'Hoàn thành':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 whitespace-nowrap shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Hoàn thành</span>
        </span>
      );
    case 'Đang xử lý':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 whitespace-nowrap shrink-0">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Đang xử lý</span>
        </span>
      );
    case 'Cần theo dõi':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Cần theo dõi</span>
        </span>
      );
    case 'Tạm hoãn':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0">
          <PauseCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Tạm hoãn</span>
        </span>
      );
  }
}

export function PriorityLabel({ priority }: { priority: WorkPriority }) {
  switch (priority) {
    case 'Khẩn cấp':
      return (
        <span className="text-xs font-semibold text-red-700 dark:text-red-400 whitespace-nowrap shrink-0">
          Khẩn cấp
        </span>
      );
    case 'Cao':
      return (
        <span className="text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap shrink-0">
          Cao
        </span>
      );
    case 'Bình thường':
      return (
        <span className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0">
          Bình thường
        </span>
      );
    case 'Thấp':
      return (
        <span className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap shrink-0">
          Thấp
        </span>
      );
  }
}
