export type WorkCategory =
  | 'Hạ tầng & Mạng'
  | 'Hệ thống & Máy chủ'
  | 'Hỗ trợ người dùng'
  | 'An toàn thông tin'
  | 'Phần mềm & CSDL'
  | 'Bảo trì định kỳ';

export type WorkPriority = 'Khẩn cấp' | 'Cao' | 'Bình thường' | 'Thấp';

export type WorkStatus =
  | 'Hoàn thành'
  | 'Đang xử lý'
  | 'Cần theo dõi'
  | 'Tạm hoãn';

export type AppView = 'logbook' | 'weekly' | 'analytics' | 'report';

export interface WorkLogEntry {
  id: string;
  code: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  title: string;
  category: WorkCategory;
  systemName: string;
  location: string;
  assignee: string;
  priority: WorkPriority;
  status: WorkStatus;
  description: string;
  resultNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitProfile {
  organizationName: string;
  departmentName: string;
  defaultAssignee: string;
  preparedByTitle: string;
}

export interface QuickTemplate {
  id: string;
  label: string;
  category: WorkCategory;
  priority: WorkPriority;
  title: string;
  systemName: string;
  location: string;
  description: string;
  resultNote: string;
  defaultDurationMinutes: number;
}
