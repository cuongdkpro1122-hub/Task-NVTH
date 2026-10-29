export interface Driver {
  id: string;
  code: string;
  name: string;
  team: string; // Đội xe 1, Đội xe 2, Đội liên tỉnh, Trung chuyển HUB
  phone: string;
  assignedPlate: string;
  baseSalary: number; // Lương cơ bản
  status: 'Đang hoạt động' | 'Tạm nghỉ' | 'Nghỉ phép';
}

export interface Vehicle {
  id: string;
  plateNumber: string; // e.g. 29H-834.12
  type: string; // Thaco Towner, Isuzu QKR, Hino 500, Dongfeng
  tonnage: number; // Tải trọng (tấn)
  fuelType: 'Diesel' | 'Xăng A95';
  normLitersPer100Km: number; // Định mức tiêu hao (Lít / 100km)
  team: string;
  driverId: string;
  driverName: string;
  odoStartMonth: number;
  odoCurrent: number;
  status: 'Hoạt động tốt' | 'Đang bảo dưỡng' | 'Chờ sửa chữa';
}

export interface RouteLog {
  id: string;
  logCode: string; // Mã phiếu lộ trình giấy
  date: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  routeType: 'Nội thành' | 'Liên tỉnh' | 'Trung chuyển Hub';
  routeName: string; // Tuyến: HUB Mê Linh -> Bưu cục Cầu Giấy...
  kmStart: number;
  kmEnd: number;
  kmTraveled: number;
  tripCount: number;
  paperLitersNote?: number; // Số lít ghi trên giấy lộ trình (nếu có)
  status: 'Chờ đối soát' | 'Khớp dữ liệu' | 'Cần xác minh';
  notes?: string;
}

export interface FuelInvoice {
  id: string;
  invoiceNumber: string; // Số HĐ: 0012948
  date: string;
  vehiclePlate: string;
  driverName: string;
  stationName: string; // Petrolimex CHXD 15, PVOIL 02...
  fuelType: 'Diesel' | 'Xăng A95';
  quantityLiters: number; // Số lít thực tế đổ
  unitPrice: number; // Đơn giá VNĐ/Lít (e.g. 21,500)
  totalAmount: number; // Thành tiền
  matchedWithRoute: boolean;
  notes?: string;
}

export interface FuelReconciliationItem {
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  team: string;
  vehicleType: string;
  tonnage: number;
  normPer100Km: number;
  totalKm: number;
  totalTrips: number;
  quotaLiters: number; // Lít định mức = (totalKm * norm) / 100
  actualLiters: number; // Lít hóa đơn thực tế
  varianceLiters: number; // actualLiters - quotaLiters
  variancePercent: number; // (variance / quota) * 100
  fuelUnitPrice: number;
  actualCost: number; // actualLiters * price
  quotaCost: number; // quotaLiters * price
  penaltyAmount: number; // Tiền truy thu nếu vượt định mức
  savingBonus: number; // Tiền thưởng tiết kiệm nếu dưới định mức
  status: 'Bình thường' | 'Vượt định mức' | 'Tiết kiệm xăng' | 'Lệch bất thường';
  explanation?: string; // Giải trình của lái xe/đội trưởng
  isApprovedExplanation?: boolean;
}

export interface DriverPayrollItem {
  id: string;
  driverId: string;
  driverCode: string;
  driverName: string;
  team: string;
  assignedPlate: string;
  workDays: number;
  totalTrips: number;
  totalKm: number;
  baseSalary: number; // Lương cơ bản
  tripAllowance: number; // Lương chuyến (vd 65,000đ/chuyến)
  kmAllowance: number; // Lương sản lượng km (vd 800đ/km)
  phoneAllowance: number; // Phụ cấp điện thoại
  mealAllowance: number; // Phụ cấp ăn trưa
  fuelPenalty: number; // Trừ truy thu vượt định mức nhiên liệu
  fuelSavingBonus: number; // Thưởng tiết kiệm nhiên liệu
  otherBonus: number; // Thưởng thi đua, công đoàn
  otherDeductions: number; // BHXH, công đoàn, tạm ứng
  netSalary: number; // Thực lĩnh
  status: 'Dự thảo' | 'Đã đối soát' | 'Chờ Trưởng phòng duyệt' | 'Đã chuyển kế toán';
  notes?: string;
}

export interface FilterState {
  team: string;
  month: string;
  search: string;
  statusFilter: string;
}
