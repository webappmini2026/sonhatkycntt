import {
  QuickTemplate,
  UnitProfile,
  WorkCategory,
  WorkLogEntry,
  WorkPriority,
  WorkStatus,
} from '../types/logbook';
import { getTodayISO, offsetDateISO } from '../utils/logbookUtils';

export const WORK_CATEGORIES: WorkCategory[] = [
  'Hạ tầng & Mạng',
  'Hệ thống & Máy chủ',
  'Hỗ trợ người dùng',
  'An toàn thông tin',
  'Phần mềm & CSDL',
  'Bảo trì định kỳ',
];

export const WORK_PRIORITIES: WorkPriority[] = [
  'Khẩn cấp',
  'Cao',
  'Bình thường',
  'Thấp',
];

export const WORK_STATUSES: WorkStatus[] = [
  'Hoàn thành',
  'Đang xử lý',
  'Cần theo dõi',
  'Tạm hoãn',
];

export const DEFAULT_UNIT_PROFILE: UnitProfile = {
  organizationName: 'Trung tâm Công nghệ Thông tin & Chuyển đổi số',
  departmentName: 'Phòng Vận hành Hệ thống & Hạ tầng',
  defaultAssignee: 'Nguyễn Minh Khôi',
  preparedByTitle: 'Kỹ sư Vận hành Hệ thống',
};

export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    id: 'tpl-network',
    label: 'Xử lý sự cố mạng',
    category: 'Hạ tầng & Mạng',
    priority: 'Cao',
    title: 'Kiểm tra và khắc phục mất kết nối mạng nội bộ',
    systemName: 'Switch Access / Access Point',
    location: 'Văn phòng làm việc',
    description:
      'Kiểm tra tình trạng cổng switch, đo suy hao dây nhảy quang/LAN và kiểm tra cấp phát DHCP cho khu vực bị ảnh hưởng.',
    resultNote: 'Kết nối ổn định trở lại, băng thông đạt chuẩn.',
    defaultDurationMinutes: 45,
  },
  {
    id: 'tpl-backup',
    label: 'Kiểm tra sao lưu CSDL',
    category: 'Phần mềm & CSDL',
    priority: 'Bình thường',
    title: 'Kiểm tra tác vụ sao lưu tự động và phục hồi thử nghiệm CSDL',
    systemName: 'Máy chủ CSDL PostgreSQL / NAS Backup',
    location: 'Phòng Server',
    description:
      'Đối chiếu dung lượng bản sao lưu hàng ngày, kiểm tra nhật ký đồng bộ off-site và test restore trên môi trường sandbox.',
    resultNote: 'Bản sao lưu toàn vẹn, dữ liệu phục hồi khớp checksum.',
    defaultDurationMinutes: 60,
  },
  {
    id: 'tpl-support',
    label: 'Hỗ trợ người dùng',
    category: 'Hỗ trợ người dùng',
    priority: 'Bình thường',
    title: 'Hỗ trợ cài đặt phần mềm nghiệp vụ và cấp quyền truy cập',
    systemName: 'Máy trạm người dùng / AD Domain',
    location: 'Khối Hành chính - Kế toán',
    description:
      'Cài đặt bộ ứng dụng văn phòng, cấu hình VPN nội bộ và thiết lập quyền truy cập thư mục dùng chung theo phiếu yêu cầu.',
    resultNote: 'Người dùng đăng nhập và sử dụng bình thường.',
    defaultDurationMinutes: 30,
  },
  {
    id: 'tpl-security',
    label: 'Vá lỗi & An toàn thông tin',
    category: 'An toàn thông tin',
    priority: 'Cao',
    title: 'Rà soát nhật ký tường lửa và cập nhật bản vá bảo mật hệ thống',
    systemName: 'Firewall / Endpoint Protection',
    location: 'Phòng Điều hành An toàn mạng',
    description:
      'Kiểm tra cảnh báo truy cập bất thường, cập nhật chữ ký mã độc mới nhất và áp dụng bản vá CVE cho các máy chủ ứng dụng.',
    resultNote: 'Đã cập nhật đầy đủ bản vá, không phát sinh cảnh báo nghiêm trọng.',
    defaultDurationMinutes: 90,
  },
];

export function createInitialLogEntries(): WorkLogEntry[] {
  const today = getTodayISO();
  const year = today.slice(0, 4);

  return [
    {
      id: 'log-1',
      code: `NK-${year}-001`,
      date: today,
      startTime: '08:15',
      endTime: '09:30',
      durationMinutes: 75,
      title: 'Gia hạn chứng chỉ SSL và kiểm tra cấu hình Reverse Proxy',
      category: 'An toàn thông tin',
      systemName: 'Nginx Gateway / Cổng dịch vụ công',
      location: 'Phòng Server',
      assignee: 'Nguyễn Minh Khôi',
      priority: 'Cao',
      status: 'Hoàn thành',
      description:
        'Thực hiện cài đặt chứng chỉ số SSL mới trước thời hạn hết hạn 7 ngày, cấu hình tự động chuyển hướng HTTPS và kiểm tra chuỗi chứng chỉ trung gian.',
      resultNote:
        'Điểm đánh giá TLS đạt hạng A, toàn bộ phân hệ hoạt động ổn định.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-2',
      code: `NK-${year}-002`,
      date: today,
      startTime: '09:45',
      endTime: '11:00',
      durationMinutes: 75,
      title: 'Xử lý cảnh báo đầy dung lượng phân vùng log trên máy chủ ứng dụng',
      category: 'Hệ thống & Máy chủ',
      systemName: 'VM-APP-02 (Ubuntu 24.04)',
      location: 'Cụm máy chủ ảo hóa',
      assignee: 'Trần Quốc Bảo',
      priority: 'Khẩn cấp',
      status: 'Đang xử lý',
      description:
        'Phát hiện phân vùng /var/log đạt 92% dung lượng. Tiến hành nén lưu trữ log cũ sang NAS và tinh chỉnh cấu hình logrotate theo chu kỳ 14 ngày.',
      resultNote:
        'Đã giải phóng 42 GB dung lượng; đang theo dõi tốc độ sinh log trong ca chiều.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-3',
      code: `NK-${year}-003`,
      date: today,
      startTime: '13:30',
      endTime: '14:20',
      durationMinutes: 50,
      title: 'Cấu hình VPN và bàn giao máy tính xách tay cho nhân sự mới',
      category: 'Hỗ trợ người dùng',
      systemName: 'Laptop Dell Latitude 5440 / FortiClient',
      location: 'Phòng Tài chính - Kế toán',
      assignee: 'Lê Thảo Vy',
      priority: 'Bình thường',
      status: 'Hoàn thành',
      description:
        'Cài đặt hệ điều hành chuẩn hóa theo image công ty, gia nhập Domain nội bộ, kích hoạt mã hóa ổ đĩa BitLocker và hướng dẫn xác thực 2 lớp.',
      resultNote: 'Đã bàn giao thiết bị kèm biên bản ký nhận.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-4',
      code: `NK-${year}-004`,
      date: offsetDateISO(today, -1),
      startTime: '08:30',
      endTime: '10:30',
      durationMinutes: 120,
      title: 'Nâng cấp firmware Switch Core tầng 3 và tối ưu VLAN thoại',
      category: 'Hạ tầng & Mạng',
      systemName: 'Cisco Catalyst 9300-48P',
      location: 'Tủ mạng tầng 3',
      assignee: 'Nguyễn Minh Khôi',
      priority: 'Cao',
      status: 'Hoàn thành',
      description:
        'Sao lưu file cấu hình hiện hành, nâng cấp firmware phiên bản khuyến nghị từ nhà sản xuất và tách băng thông ưu tiên QoS cho tổng đài IP.',
      resultNote: 'Chuyển mạch dự phòng hoạt động chính xác, không rớt gói tin thoại.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-5',
      code: `NK-${year}-005`,
      date: offsetDateISO(today, -1),
      startTime: '14:00',
      endTime: '15:45',
      durationMinutes: 105,
      title: 'Tối ưu chỉ mục truy vấn chậm trên phân hệ Quản lý Văn bản',
      category: 'Phần mềm & CSDL',
      systemName: 'PostgreSQL 16 - DB_DOC_PROD',
      location: 'Từ xa (VPN quản trị)',
      assignee: 'Trần Quốc Bảo',
      priority: 'Cao',
      status: 'Cần theo dõi',
      description:
        'Phân tích pg_stat_statements phát hiện 3 truy vấn tìm kiếm hồ sơ mất >2.8s. Bổ sung composite index và chạy ANALYZE trên bảng hồ sơ.',
      resultNote:
        'Thời gian phản hồi giảm xuống còn 180ms; tiếp tục theo dõi giờ cao điểm sáng mai.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-6',
      code: `NK-${year}-006`,
      date: offsetDateISO(today, -2),
      startTime: '09:00',
      endTime: '11:30',
      durationMinutes: 150,
      title: 'Kiểm tra định kỳ hệ thống lưu điện UPS và điều hòa phòng máy',
      category: 'Bảo trì định kỳ',
      systemName: 'APC Smart-UPS RT 10kVA & Điều hòa chính xác',
      location: 'Phòng Server tầng 2',
      assignee: 'Nguyễn Minh Khôi',
      priority: 'Bình thường',
      status: 'Hoàn thành',
      description:
        'Đo điện áp từng cell ắc quy UPS, vệ sinh lưới lọc bụi điều hòa và kiểm tra cảm biến nhiệt độ - độ ẩm môi trường phòng máy.',
      resultNote: 'Nhiệt độ duy trì 21.5°C, độ ẩm 48%, UPS sẵn sàng tải 45 phút.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-7',
      code: `NK-${year}-007`,
      date: offsetDateISO(today, -3),
      startTime: '10:00',
      endTime: '11:15',
      durationMinutes: 75,
      title: 'Khắc phục lỗi không in được qua mạng tại bộ phận Một cửa',
      category: 'Hỗ trợ người dùng',
      systemName: 'Máy in mạng HP LaserJet Pro M404dn',
      location: 'Bộ phận Tiếp nhận hồ sơ',
      assignee: 'Lê Thảo Vy',
      priority: 'Bình thường',
      status: 'Hoàn thành',
      description:
        'Máy in bị đổi IP động do hết hạn lease DHCP. Gán IP tĩnh theo địa chỉ MAC trên router và cập nhật lại cổng TCP/IP trên 4 máy trạm.',
      resultNote: 'Các máy trạm in ổn định, đã ghi chú IP cố định vào sổ thiết bị.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'log-8',
      code: `NK-${year}-008`,
      date: offsetDateISO(today, -4),
      startTime: '15:00',
      endTime: '16:30',
      durationMinutes: 90,
      title: 'Diễn tập khôi phục dữ liệu từ bản sao lưu ngoại tuyến',
      category: 'An toàn thông tin',
      systemName: 'Hệ thống Backup Veeam & NAS Synology',
      location: 'Phòng Server',
      assignee: 'Trần Quốc Bảo',
      priority: 'Bình thường',
      status: 'Hoàn thành',
      description:
        'Thực hiện kiểm thử phục hồi máy chủ cổng thông tin từ bản snapshot tuần trước trên VLAN cô lập để xác minh mục tiêu RPO/RTO.',
      resultNote: 'Khôi phục thành công trong 28 phút, đạt chuẩn RTO cam kết.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
