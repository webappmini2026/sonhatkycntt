import { WorkLogEntry } from '../types/logbook';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function offsetDateISO(baseISO: string, deltaDays: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d + deltaDays);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function formatDateVN(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export function getWeekdayVN(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const days = [
    'Chủ nhật',
    'Thứ hai',
    'Thứ ba',
    'Thứ tư',
    'Thứ năm',
    'Thứ sáu',
    'Thứ bảy',
  ];
  return days[dt.getDay()];
}

export function getShortWeekdayVN(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[dt.getDay()];
}

export function calculateDurationMinutes(
  startTime: string,
  endTime: string
): number {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  if (
    Number.isNaN(sh) ||
    Number.isNaN(sm) ||
    Number.isNaN(eh) ||
    Number.isNaN(em)
  ) {
    return 0;
  }
  const startTotal = sh * 60 + sm;
  const endTotal = eh * 60 + em;
  const diff = endTotal - startTotal;
  return diff >= 0 ? diff : 0;
}

export function formatDurationVN(minutes: number): string {
  if (minutes <= 0) return '0p';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}g`;
  return `${h}g ${m}p`;
}

export function addMinutesToTime(startTime: string, mins: number): string {
  const [sh, sm] = startTime.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(sm)) return '09:30';
  const total = Math.min(23 * 60 + 59, sh * 60 + sm + mins);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getWeekDates(anchorISO: string): string[] {
  const [y, m, d] = anchorISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const day = dt.getDay(); // 0=Sun, 1=Mon
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(y, m - 1, d + diffToMonday);
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    const cur = new Date(
      monday.getFullYear(),
      monday.getMonth(),
      monday.getDate() + i
    );
    const yy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    const dd = String(cur.getDate()).padStart(2, '0');
    result.push(`${yy}-${mm}-${dd}`);
  }
  return result;
}

export function generateNextCode(entries: WorkLogEntry[], dateISO: string): string {
  const year = dateISO.slice(0, 4) || String(new Date().getFullYear());
  const prefix = `NK-${year}-`;
  let maxNum = 0;
  for (const item of entries) {
    if (item.code.startsWith(prefix)) {
      const n = parseInt(item.code.slice(prefix.length), 10);
      if (!Number.isNaN(n) && n > maxNum) {
        maxNum = n;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'IT';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeCsvCell(value: string | number): string {
  const str = String(value ?? '');
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function exportEntriesToCSV(
  entries: WorkLogEntry[],
  filename = 'so-nhat-ky-cong-tac-cntt.csv'
): void {
  const headers = [
    'Mã nhật ký',
    'Ngày công tác',
    'Giờ bắt đầu',
    'Giờ kết thúc',
    'Thời lượng (phút)',
    'Nhóm công tác',
    'Mức độ',
    'Trạng thái',
    'Tiêu đề công việc',
    'Hệ thống / Thiết bị',
    'Địa điểm / Đơn vị',
    'Cán bộ thực hiện',
    'Nội dung chi tiết',
    'Kết quả / Ghi chú bàn giao',
  ];

  const rows = entries.map((e) => [
    e.code,
    formatDateVN(e.date),
    e.startTime,
    e.endTime,
    e.durationMinutes,
    e.category,
    e.priority,
    e.status,
    e.title,
    e.systemName,
    e.location,
    e.assignee,
    e.description,
    e.resultNote,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
      .join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportEntriesToJSON(
  entries: WorkLogEntry[],
  filename = 'sao-luu-nhat-ky-cntt.json'
): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 1,
    count: entries.length,
    entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
