import React from 'react';
import {
  Truck,
  Users,
  Gauge,
  Fuel,
  AlertTriangle,
  Award,
  Wallet,
  TrendingDown,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Clock,
} from 'lucide-react';
import { FuelReconciliationItem, DriverPayrollItem } from '../types/index';

interface DashboardProps {
  reconciliations: FuelReconciliationItem[];
  payrolls: DriverPayrollItem[];
  setActiveTab: (tab: string) => void;
  onExportExcel: () => void;
}

export const DashboardOverview: React.FC<DashboardProps> = ({
  reconciliations,
  payrolls,
  setActiveTab,
  onExportExcel,
}) => {
  const totalVehicles = 110; // Quy mô thực tế của CNKT3
  const activeVehiclesSample = reconciliations.length;
  const totalDrivers = 185; // Quân số thực tế
  const totalKm = reconciliations.reduce((acc, r) => acc + r.totalKm, 0);
  const totalTrips = reconciliations.reduce((acc, r) => acc + r.totalTrips, 0);
  const totalQuotaLiters = reconciliations.reduce((acc, r) => acc + r.quotaLiters, 0);
  const totalActualLiters = reconciliations.reduce((acc, r) => acc + r.actualLiters, 0);
  const varianceLiters = Number((totalActualLiters - totalQuotaLiters).toFixed(1));
  const totalActualFuelCost = reconciliations.reduce((acc, r) => acc + r.actualCost, 0);
  const totalPenalty = reconciliations.reduce((acc, r) => acc + r.penaltyAmount, 0);
  const totalSavingBonus = reconciliations.reduce((acc, r) => acc + r.savingBonus, 0);
  const totalPayrollFund = payrolls.reduce((acc, p) => acc + p.netSalary, 0);

  const overQuotaVehicles = reconciliations.filter(
    (r) => r.status === 'Vượt định mức' || r.status === 'Lệch bất thường'
  );
  const savingVehicles = reconciliations.filter((r) => r.status === 'Tiết kiệm xăng');

  // Average metrics
  const costPerKm = totalKm > 0 ? Math.round((totalActualFuelCost + totalPayrollFund) / totalKm) : 0;
  const fuelCostPerKm = totalKm > 0 ? Math.round(totalActualFuelCost / totalKm) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome & Problem-Solution Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 p-6 rounded-2xl border border-slate-700/60 shadow-md text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Truck className="w-80 h-80 text-white" />
        </div>
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
            Giải pháp Tự Động Hóa Dữ Liệu Nhân Viên Tổng Hợp CNKT3
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Giải Quyết 2 Nút Thắt: Đối Soát Xăng Xe & Tính Lương Lái Xe
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Thay vì tốn hàng chục giờ cộng dồn lộ trình giấy, dò từng hóa đơn xăng và dùng SUMIFS/VLOOKUP thủ công dễ sai lệch, hệ thống tự động đối chiếu số Km với hóa đơn nhiên liệu, tính định mức truy thu hoặc thưởng tiết kiệm, và liên kết thẳng vào bảng lương lái xe.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('reconciliation')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
            >
              <span>Vào Bảng Đối Soát Xăng Dầu</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Xem Bảng Lương Đã Trừ Phạt</span>
            </button>
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Báo Cáo Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Phương tiện & Quân số */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Đội Xe & Quân Số</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalVehicles}</span>
              <span className="text-xs text-slate-500">xe (~{totalDrivers} lái xe)</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="font-semibold text-blue-600">{activeVehiclesSample} xe</span> đang kiểm tra chi tiết kỳ này
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Tổng Km chạy:</span>
            <span className="font-semibold text-slate-800">{totalKm.toLocaleString()} km</span>
          </div>
        </div>

        {/* Card 2: Nhiên liệu thực tế vs Định mức */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nhiên Liệu Xăng Dầu</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalActualLiters.toLocaleString()}</span>
              <span className="text-xs text-slate-500">Lít (Hóa đơn)</span>
            </div>
            <div className="text-xs mt-1 flex items-center gap-1">
              <span className="text-slate-500">Định mức: {totalQuotaLiters.toLocaleString()} L</span>
              <span className={`font-semibold px-1.5 py-0.2 rounded text-[11px] ${
                varianceLiters > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {varianceLiters > 0 ? `+${varianceLiters} L` : `${varianceLiters} L`}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Chi phí xăng thực tế:</span>
            <span className="font-semibold text-slate-900">{totalActualFuelCost.toLocaleString()} đ</span>
          </div>
        </div>

        {/* Card 3: Truy thu vượt định mức & Thưởng tiết kiệm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Truy Thu & Thưởng Xăng</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-red-600">-{totalPenalty.toLocaleString()}</span>
              <span className="text-xs text-slate-500">đ truy thu</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span>{overQuotaVehicles.length} xe vượt định mức</span>
              <span className="text-emerald-600 font-medium">({savingVehicles.length} xe tiết kiệm)</span>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Thưởng lái xe tiết kiệm:</span>
            <span className="font-semibold text-emerald-600">+{totalSavingBonus.toLocaleString()} đ</span>
          </div>
        </div>

        {/* Card 4: Tổng Quỹ Lương & Suất Chi Phí/Km */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Quỹ Lương & Suất Chi Phí</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalPayrollFund.toLocaleString()}</span>
              <span className="text-xs text-slate-500">đ</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Đã khấu trừ trực tiếp truy thu nhiên liệu
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Suất chi phí TB:</span>
            <span className="font-semibold text-indigo-600">{costPerKm.toLocaleString()} đ/km</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Anomaly Vehicles & Workflow Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Top Xe Cần Xác Minh & Giải Trình */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Cảnh Báo Vượt Định Mức Nhiên Liệu Cần Xử Lý
              </h3>
              <p className="text-xs text-slate-500">
                Các phương tiện có mức tiêu hao thực tế cao hơn định mức Viettel Post quy định, cần kiểm tra giải trình
              </p>
            </div>
            <button
              onClick={() => setActiveTab('reconciliation')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
            >
              Xem tất cả ({reconciliations.length} xe) &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {overQuotaVehicles.map((item) => (
              <div
                key={item.vehiclePlate}
                className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 hover:bg-red-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      {item.vehiclePlate}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{item.driverName}</span>
                    <span className="text-[11px] text-slate-500">({item.team})</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Loại xe: {item.vehicleType}</span>
                    <span>Km chạy: {item.totalKm.toLocaleString()} km</span>
                    <span>Định mức: {item.quotaLiters} L</span>
                    <span className="text-red-600 font-semibold">Thực tế HĐ: {item.actualLiters} L (+{item.varianceLiters} L, +{item.variancePercent}%)</span>
                  </div>
                  {item.explanation && (
                    <div className="text-xs bg-white/80 p-1.5 rounded border border-red-200 text-slate-700 mt-1 italic">
                      Lý do giải trình: "{item.explanation}"
                    </div>
                  )}
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <div className="text-xs text-slate-500">Khấu trừ lương:</div>
                  <div className="text-sm font-bold text-red-600 font-mono">
                    -{item.penaltyAmount.toLocaleString()} đ
                  </div>
                  <button
                    onClick={() => setActiveTab('reconciliation')}
                    className="mt-1 text-[11px] text-blue-600 hover:underline cursor-pointer"
                  >
                    Đối chiếu & duyệt
                  </button>
                </div>
              </div>
            ))}

            {overQuotaVehicles.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm">
                Không có phương tiện nào vượt định mức trong kỳ này.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Quy trình tự động hóa thay thế thao tác thủ công */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-xs font-bold text-white">
                VTP
              </span>
              <h3 className="text-sm font-bold text-white">Quy Trình Tự Động Hóa 5 Bước</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Chu trình khép kín giúp Nhân viên tổng hợp hoàn thành đối soát trong 5 phút thay vì 3 ngày:
            </p>

            <ol className="space-y-3 text-xs">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                  1
                </span>
                <div>
                  <strong className="text-slate-200">Tiếp nhận & Thu thập:</strong>
                  <p className="text-slate-400 text-[11px]">Nhận file Lộ trình giấy từ lái xe & file Hóa đơn xăng từ trạm cấp.</p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                  2
                </span>
                <div>
                  <strong className="text-slate-200">Nạp File hoặc Đối Soát Tức Thì:</strong>
                  <p className="text-slate-400 text-[11px]">Hệ thống tự động khớp Biển số xe, ngày đổ xăng, tính tổng Km & số Lít thực.</p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                  3
                </span>
                <div>
                  <strong className="text-slate-200">So Sánh Định Mức & Bắt Lệch:</strong>
                  <p className="text-slate-400 text-[11px]">Tự động tính Lít định mức Viettel Post, tính chênh lệch thừa/thiếu, số tiền phạt hoặc thưởng.</p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                  4
                </span>
                <div>
                  <strong className="text-slate-200">Đẩy Vào Bảng Lương Lái Xe:</strong>
                  <p className="text-slate-400 text-[11px]">Số tiền truy thu tự động chuyển sang cột giảm trừ lương lái xe mà không cần gõ tay.</p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-700">
                  5
                </span>
                <div>
                  <strong className="text-slate-200">Xuất Excel & Trình Trưởng Phòng:</strong>
                  <p className="text-slate-400 text-[11px]">1-Click xuất đầy đủ file Excel các bảng biểu chuẩn và mẫu Tờ trình phê duyệt.</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Định mức áp dụng:</span>
            <span className="text-emerald-400 font-semibold">QĐ 2026/VTP-CNKT3</span>
          </div>
        </div>
      </div>
    </div>
  );
};
