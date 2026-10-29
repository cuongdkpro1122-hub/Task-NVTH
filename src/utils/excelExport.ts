import * as XLSX from 'xlsx';
import {
  FuelReconciliationItem,
  DriverPayrollItem,
  FuelInvoice,
  RouteLog,
  Vehicle,
} from '../types/index';

/**
 * Xuất Bảng đối soát nhiên liệu và lộ trình ra file Excel chuyên nghiệp
 */
export function exportFuelReconciliationToExcel(
  reconciliations: FuelReconciliationItem[],
  invoices: FuelInvoice[],
  routeLogs: RouteLog[],
  monthStr = 'Thang_10_2026'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Bảng tổng hợp đối soát nhiên liệu
  const reconData = reconciliations.map((r, index) => ({
    'STT': index + 1,
    'Biển số xe': r.vehiclePlate,
    'Lái xe phụ trách': r.driverName,
    'Đội xe': r.team,
    'Loại xe': r.vehicleType,
    'Tải trọng (Tấn)': r.tonnage,
    'Định mức (L/100km)': r.normPer100Km,
    'Tổng Km lộ trình': r.totalKm,
    'Tổng số chuyến': r.totalTrips,
    'Lít định mức Viettel Post': r.quotaLiters,
    'Lít thực tế hóa đơn': r.actualLiters,
    'Chênh lệch (+ Vượt / - Tiết kiệm)': r.varianceLiters,
    'Tỷ lệ lệch (%)': `${r.variancePercent}%`,
    'Đơn giá TB (đ/L)': r.fuelUnitPrice,
    'Tiền hóa đơn xăng (đ)': r.actualCost,
    'Tiền truy thu vượt định mức (đ)': r.penaltyAmount,
    'Thưởng tiết kiệm xăng (đ)': r.savingBonus,
    'Đánh giá': r.status,
    'Nội dung giải trình': r.explanation || '',
  }));
  const wsRecon = XLSX.utils.json_to_sheet(reconData);
  XLSX.utils.book_append_sheet(wb, wsRecon, 'Doi_Soat_Nhien_Lieu');

  // Sheet 2: Danh sách hóa đơn xăng dầu hàng tháng
  const invData = invoices.map((inv, idx) => ({
    'STT': idx + 1,
    'Số hóa đơn': inv.invoiceNumber,
    'Ngày xuất HĐ': inv.date,
    'Biển số xe': inv.vehiclePlate,
    'Lái xe ký nhận': inv.driverName,
    'Cây xăng / Đơn vị cấp': inv.stationName,
    'Loại nhiên liệu': inv.fuelType,
    'Số lít': inv.quantityLiters,
    'Đơn giá (đ)': inv.unitPrice,
    'Thành tiền (đ)': inv.totalAmount,
    'Trạng thái khớp': inv.matchedWithRoute ? 'Đã khớp lộ trình' : 'Cần kiểm tra',
  }));
  const wsInv = XLSX.utils.json_to_sheet(invData);
  XLSX.utils.book_append_sheet(wb, wsInv, 'Hoa_Don_Xang_Dau');

  // Sheet 3: Lộ trình giấy tổng hợp
  const logData = routeLogs.map((log, idx) => ({
    'STT': idx + 1,
    'Mã nhật trình giấy': log.logCode,
    'Ngày chạy': log.date,
    'Biển số xe': log.vehiclePlate,
    'Lái xe': log.driverName,
    'Tuyến vận hành': log.routeName,
    'Km bắt đầu': log.kmStart,
    'Km kết thúc': log.kmEnd,
    'Km thực chạy': log.kmTraveled,
    'Số chuyến': log.tripCount,
    'Ghi chú': log.notes || '',
  }));
  const wsLogs = XLSX.utils.json_to_sheet(logData);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Lo_Trinh_Giay');

  XLSX.writeFile(wb, `ViettelPost_CNKT3_DoiSoat_NhienLieu_${monthStr}.xlsx`);
}

/**
 * Xuất Bảng thanh toán lương lái xe (đã trừ truy thu nhiên liệu) ra Excel
 */
export function exportDriverPayrollToExcel(
  payrolls: DriverPayrollItem[],
  monthStr = 'Thang_10_2026'
) {
  const wb = XLSX.utils.book_new();

  const data = payrolls.map((p, idx) => ({
    'STT': idx + 1,
    'Mã NV': p.driverCode,
    'Họ và tên lái xe': p.driverName,
    'Đội xe': p.team,
    'Biển số xe phụ trách': p.assignedPlate,
    'Ngày công': p.workDays,
    'Số chuyến': p.totalTrips,
    'Tổng Km chạy': p.totalKm,
    'Lương cơ bản (đ)': p.baseSalary,
    'Lương theo chuyến (đ)': p.tripAllowance,
    'Lương theo Km (đ)': p.kmAllowance,
    'Phụ cấp ĐT & Ăn ca (đ)': p.phoneAllowance + p.mealAllowance,
    'Thưởng tiết kiệm xăng (đ)': p.fuelSavingBonus,
    'Thưởng thi đua khác (đ)': p.otherBonus,
    'TRỪ TRUY THU XĂNG VƯỢT ĐỊNH MỨC (đ)': p.fuelPenalty,
    'Giảm trừ khác (BHXH/Tạm ứng) (đ)': p.otherDeductions,
    'LƯƠNG THỰC LĨNH (đ)': p.netSalary,
    'Trạng thái': p.status,
    'Ghi chú / Giải trình': p.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, 'Bang_Luong_Lai_Xe');

  XLSX.writeFile(wb, `ViettelPost_CNKT3_BangLuong_LaiXe_${monthStr}.xlsx`);
}

/**
 * Xuất Báo cáo Chi phí & Hiệu quả Vận hành tổng thể
 */
export function exportOverallCostReportToExcel(
  summary: {
    totalVehicles: number;
    totalDrivers: number;
    totalKm: number;
    totalTrips: number;
    totalQuotaLiters: number;
    totalActualLiters: number;
    varianceLiters: number;
    totalActualFuelCost: number;
    totalPenalties: number;
    totalSavings: number;
    totalPayrollFund: number;
    totalOperatingCost: number;
    costPerKm: number;
    fuelCostPerKm: number;
  },
  teamBreakdown: Array<{
    team: string;
    vehicleCount: number;
    totalKm: number;
    fuelCost: number;
    payrollCost: number;
    totalCost: number;
    costPerKm: number;
    varianceLiters: number;
  }>,
  monthStr = 'Thang_10_2026'
) {
  const wb = XLSX.utils.book_new();

  // Summary indicators
  const kpiRows = [
    { 'Chỉ tiêu Quản trị': 'Đơn vị', 'Giá trị': 'Phòng Vận hành KD - CNKT3 Viettel Post' },
    { 'Chỉ tiêu Quản trị': 'Quy mô phương tiện', 'Giá trị': `${summary.totalVehicles} xe` },
    { 'Chỉ tiêu Quản trị': 'Tổng quân số lái xe', 'Giá trị': `${summary.totalDrivers} người` },
    { 'Chỉ tiêu Quản trị': 'Tổng Km vận hành toàn chi nhánh', 'Giá trị': `${summary.totalKm.toLocaleString()} km` },
    { 'Chỉ tiêu Quản trị': 'Tổng số chuyến xe thực hiện', 'Giá trị': `${summary.totalTrips.toLocaleString()} chuyến` },
    { 'Chỉ tiêu Quản trị': 'Tổng nhiên liệu định mức (Lít)', 'Giá trị': `${summary.totalQuotaLiters.toLocaleString()} L` },
    { 'Chỉ tiêu Quản trị': 'Tổng nhiên liệu thực tế hóa đơn (Lít)', 'Giá trị': `${summary.totalActualLiters.toLocaleString()} L` },
    { 'Chỉ tiêu Quản trị': 'Chênh lệch xăng dầu (Lít)', 'Giá trị': `${summary.varianceLiters > 0 ? '+' : ''}${summary.varianceLiters.toLocaleString()} L` },
    { 'Chỉ tiêu Quản trị': 'Tổng chi phí xăng dầu theo hóa đơn (đ)', 'Giá trị': summary.totalActualFuelCost.toLocaleString() },
    { 'Chỉ tiêu Quản trị': 'Tổng số tiền truy thu vượt định mức (đ)', 'Giá trị': summary.totalPenalties.toLocaleString() },
    { 'Chỉ tiêu Quản trị': 'Tổng tiền thưởng tiết kiệm nhiên liệu (đ)', 'Giá trị': summary.totalSavings.toLocaleString() },
    { 'Chỉ tiêu Quản trị': 'Tổng quỹ lương lái xe (đ)', 'Giá trị': summary.totalPayrollFund.toLocaleString() },
    { 'Chỉ tiêu Quản trị': 'TỔNG CHI PHÍ VẬN HÀNH (XĂNG + LƯƠNG) (đ)', 'Giá trị': summary.totalOperatingCost.toLocaleString() },
    { 'Chỉ tiêu Quản trị': 'Suất chi phí bình quân trên 1 Km (đ/km)', 'Giá trị': `${summary.costPerKm.toLocaleString()} đ/km` },
    { 'Chỉ tiêu Quản trị': 'Suất chi phí xăng dầu bình quân (đ/km)', 'Giá trị': `${summary.fuelCostPerKm.toLocaleString()} đ/km` },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Tong_Quan_Chi_Phi');

  // Team breakdown
  const teamRows = teamBreakdown.map((t) => ({
    'Đội xe': t.team,
    'Số lượng xe': t.vehicleCount,
    'Tổng Km chạy': t.totalKm,
    'Chi phí xăng dầu (đ)': t.fuelCost,
    'Chênh lệch xăng (Lít)': t.varianceLiters,
    'Tổng quỹ lương (đ)': t.payrollCost,
    'Tổng chi phí vận hành (đ)': t.totalCost,
    'Chi phí TB / Km (đ/km)': t.costPerKm,
  }));
  const wsTeams = XLSX.utils.json_to_sheet(teamRows);
  XLSX.utils.book_append_sheet(wb, wsTeams, 'Hieu_Qua_Tung_Doi_Xe');

  XLSX.writeFile(wb, `ViettelPost_CNKT3_BaoCao_ChiPhi_TongThe_${monthStr}.xlsx`);
}

/**
 * Tải file Excel mẫu để người dùng nhập liệu (Lộ trình giấy hoặc Hóa đơn xăng)
 */
export function downloadExcelTemplate(templateType: 'lotrinh' | 'hoadon' | 'xe_dinhmuc') {
  const wb = XLSX.utils.book_new();

  if (templateType === 'lotrinh') {
    const sampleData = [
      {
        'Mã nhật trình': 'LT-2026-10-001',
        'Ngày chạy (YYYY-MM-DD)': '2026-10-01',
        'Biển số xe': '29H-123.45',
        'Tên lái xe': 'Nguyễn Văn Hùng',
        'Tuyến vận hành': 'HUB Mê Linh - Bưu cục Cầu Giấy',
        'Km bắt đầu': 45100,
        'Km kết thúc': 45220,
        'Số chuyến': 2,
        'Ghi chú': 'Chạy tăng ca đêm',
      },
      {
        'Mã nhật trình': 'LT-2026-10-002',
        'Ngày chạy (YYYY-MM-DD)': '2026-10-02',
        'Biển số xe': '29C-789.12',
        'Tên lái xe': 'Trần Đình Tuấn',
        'Tuyến vận hành': 'HUB Mê Linh - Hà Đông',
        'Km bắt đầu': 82300,
        'Km kết thúc': 82450,
        'Số chuyến': 3,
        'Ghi chú': 'Kẹt xe đường vành đai 3',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Lo_Trinh_Giay');
    XLSX.writeFile(wb, 'Mau_File_Lo_Trinh_Giay_ViettelPost.xlsx');
  } else if (templateType === 'hoadon') {
    const sampleData = [
      {
        'Số hóa đơn': '0098231',
        'Ngày xuất HĐ (YYYY-MM-DD)': '2026-10-05',
        'Biển số xe': '29H-123.45',
        'Tên lái xe nhận': 'Nguyễn Văn Hùng',
        'Cây xăng / Nhà cung cấp': 'Petrolimex CHXD 12 Phạm Văn Đồng',
        'Loại nhiên liệu': 'Diesel',
        'Số lít': 65.5,
        'Đơn giá (đ/lít)': 21500,
        'Ghi chú': 'Đổ đầy bình ca sáng',
      },
      {
        'Số hóa đơn': '0098232',
        'Ngày xuất HĐ (YYYY-MM-DD)': '2026-10-07',
        'Biển số xe': '29C-789.12',
        'Tên lái xe nhận': 'Trần Đình Tuấn',
        'Cây xăng / Nhà cung cấp': 'PVOIL Cửa hàng 03 Thăng Long',
        'Loại nhiên liệu': 'Diesel',
        'Số lít': 80.0,
        'Đơn giá (đ/lít)': 21500,
        'Ghi chú': '',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Hoa_Don_Xang');
    XLSX.writeFile(wb, 'Mau_File_Hoa_Don_Xang_ViettelPost.xlsx');
  } else {
    const sampleData = [
      {
        'Biển số xe': '29H-123.45',
        'Loại xe': 'Isuzu QKR',
        'Tải trọng (Tấn)': 2.4,
        'Loại nhiên liệu': 'Diesel',
        'Định mức chuẩn (L/100km)': 12.0,
        'Đội xe': 'Đội xe Nội tỉnh 1',
        'Lái xe chính': 'Nguyễn Văn Hùng',
        'Odo đầu tháng': 45000,
      },
      {
        'Biển số xe': '29C-789.12',
        'Loại xe': 'Hino 500 Series',
        'Tải trọng (Tấn)': 5.0,
        'Loại nhiên liệu': 'Diesel',
        'Định mức chuẩn (L/100km)': 16.5,
        'Đội xe': 'Đội xe Trung chuyển HUB',
        'Lái xe chính': 'Trần Đình Tuấn',
        'Odo đầu tháng': 82000,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Danh_Muc_Xe_Dinh_Muc');
    XLSX.writeFile(wb, 'Mau_Danh_Muc_Xe_Dinh_Muc_ViettelPost.xlsx');
  }
}
