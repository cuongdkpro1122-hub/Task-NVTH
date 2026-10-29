import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  CheckCircle,
  Building2,
  Calendar,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { FuelReconciliationItem, DriverPayrollItem } from '../types/index';

interface ManagementReportTabProps {
  reconciliations: FuelReconciliationItem[];
  payrolls: DriverPayrollItem[];
  onExportExcel: () => void;
}

export const ManagementReportTab: React.FC<ManagementReportTabProps> = ({
  reconciliations,
  payrolls,
  onExportExcel,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const totalKm = reconciliations.reduce((s, r) => s + r.totalKm, 0);
  const totalTrips = reconciliations.reduce((s, r) => s + r.totalTrips, 0);
  const totalQuotaLiters = reconciliations.reduce((s, r) => s + r.quotaLiters, 0);
  const totalActualLiters = reconciliations.reduce((s, r) => s + r.actualLiters, 0);
  const varianceLiters = Number((totalActualLiters - totalQuotaLiters).toFixed(1));
  const totalActualFuelCost = reconciliations.reduce((s, r) => s + r.actualCost, 0);
  const totalPenalty = reconciliations.reduce((s, r) => s + r.penaltyAmount, 0);
  const totalSavingBonus = reconciliations.reduce((s, r) => s + r.savingBonus, 0);
  const totalPayrollFund = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const totalOperatingCost = totalActualFuelCost + totalPayrollFund;
  const costPerKm = totalKm > 0 ? Math.round(totalOperatingCost / totalKm) : 0;

  const overVehicles = reconciliations.filter(
    (r) => r.status === 'Vượt định mức' || r.status === 'Lệch bất thường'
  );
  const savingVehicles = reconciliations.filter((r) => r.status === 'Tiết kiệm xăng');

  // Breakdown by team
  const teams = [
    'Đội xe Nội tỉnh 1',
    'Đội xe Nội tỉnh 2',
    'Đội xe Trung chuyển HUB',
    'Đội xe Liên tỉnh Bắc - Nam',
  ];

  const teamData = teams.map((teamName) => {
    const teamRecons = reconciliations.filter((r) => r.team === teamName);
    const teamPayrolls = payrolls.filter((p) => p.team === teamName);
    const km = teamRecons.reduce((s, r) => s + r.totalKm, 0);
    const fuelCost = teamRecons.reduce((s, r) => s + r.actualCost, 0);
    const payrollCost = teamPayrolls.reduce((s, p) => s + p.netSalary, 0);
    const totalCost = fuelCost + payrollCost;
    const teamCostPerKm = km > 0 ? Math.round(totalCost / km) : 0;
    const vLiters = Number(
      (
        teamRecons.reduce((s, r) => s + r.actualLiters, 0) -
        teamRecons.reduce((s, r) => s + r.quotaLiters, 0)
      ).toFixed(1)
    );

    return {
      team: teamName,
      vehicleCount: teamRecons.length,
      km,
      fuelCost,
      payrollCost,
      totalCost,
      costPerKm: teamCostPerKm,
      varianceLiters: vLiters,
    };
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Báo Cáo Quản Trị & Dự Thảo Tờ Trình Trình Trưởng Phòng
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Soạn thảo tự động văn bản đề xuất phê duyệt truy thu, khen thưởng và báo cáo chi phí vận hành gửi Lãnh đạo Phòng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Tờ Trình</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Báo Cáo Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Team Breakdown KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {teamData.map((t) => (
          <div key={t.team} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">{t.team}</span>
            <div className="text-base font-bold text-slate-900 mt-1">
              {t.totalCost.toLocaleString()} đ
            </div>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Số phương tiện:</span>
                <span className="font-semibold">{t.vehicleCount} xe</span>
              </div>
              <div className="flex justify-between">
                <span>Tổng sản lượng:</span>
                <span className="font-semibold">{t.km.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span>Chênh lệch xăng:</span>
                <span
                  className={
                    t.varianceLiters > 0 ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'
                  }
                >
                  {t.varianceLiters > 0 ? `+${t.varianceLiters}` : t.varianceLiters} L
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-100">
                <span>Suất chi phí/Km:</span>
                <span className="font-bold text-indigo-600">{t.costPerKm.toLocaleString()} đ/km</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Formal Submission Document (TỜ TRÌNH CHUẨN VIETTEL POST) */}
      <div
        ref={printRef}
        className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto text-slate-800 text-sm leading-relaxed"
      >
        {/* National / Corporate Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-300 pb-6 mb-6 gap-4">
          <div className="text-center sm:text-left">
            <div className="font-bold text-xs uppercase tracking-wide">
              TỔNG CÔNG TY CP BƯU CHÍNH VIETTEL
            </div>
            <div className="font-bold text-xs uppercase tracking-wide text-red-600">
              CHI NHÁNH KHAI THÁC 3 (CNKT3)
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Phòng Vận Hành Kinh Doanh - Tổ Tổng Hợp
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-bold text-xs uppercase tracking-wide">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </div>
            <div className="text-xs font-semibold underline decoration-slate-400">
              Độc lập - Tự do - Hạnh phúc
            </div>
            <div className="text-[11px] text-slate-500 mt-2 italic">
              Hà Nội, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-lg md:text-xl font-bold uppercase tracking-wide text-slate-900">
            TỜ TRÌNH
          </h1>
          <p className="text-xs font-semibold text-slate-600 mt-1 italic">
            V/v: Phê duyệt kết quả đối soát tiêu hao nhiên liệu và đề xuất khấu trừ/khen thưởng trong kỳ tính lương lái xe Tháng 10/2026
          </p>
        </div>

        {/* Recipient */}
        <div className="mb-6 text-center sm:text-left font-medium">
          <span className="italic">Kính gửi:</span>{' '}
          <strong className="text-slate-900 uppercase">
            Trưởng phòng Vận hành Kinh doanh – Chi nhánh Khai thác 3 (CNKT3)
          </strong>
        </div>

        {/* Body */}
        <div className="space-y-4 text-xs md:text-sm text-justify">
          <p>
            Căn cứ Quyết định ban hành Quy chế quản lý phương tiện và định mức tiêu hao nhiên liệu của Tổng công ty Cổ phần Bưu chính Viettel;
          </p>
          <p>
            Căn cứ dữ liệu tổng hợp từ <strong>Nhật trình lộ trình giấy</strong> của đội ngũ lái xe và <strong>Bảng kê hóa đơn xăng dầu hàng tháng</strong> từ các nhà cung cấp (Petrolimex, PVOIL);
          </p>
          <p>
            Bộ phận Tổng hợp Phòng Vận hành Kinh doanh kính trình Trưởng phòng xem xét và phê duyệt kết quả đối soát dữ liệu vận hành đội xe kỳ Tháng 10/2026 với các nội dung chi tiết như sau:
          </p>

          {/* Section 1 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">
              I. TỔNG HỢP KẾT QUẢ VẬN HÀNH & TIÊU HAO NHIÊN LIỆU:
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Tổng số phương tiện kiểm tra chi tiết: <strong>{reconciliations.length} xe</strong> (trên tổng quy mô 110 xe của CNKT3).
              </li>
              <li>
                Tổng quãng đường vận hành: <strong>{totalKm.toLocaleString()} km</strong> với <strong>{totalTrips.toLocaleString()} chuyến xe</strong>.
              </li>
              <li>
                Tổng nhiên liệu định mức Viettel Post cho phép: <strong>{totalQuotaLiters.toLocaleString()} Lít</strong>.
              </li>
              <li>
                Tổng nhiên liệu thực tế theo hóa đơn: <strong>{totalActualLiters.toLocaleString()} Lít</strong> (Chênh lệch: <strong className={varianceLiters > 0 ? 'text-red-600' : 'text-emerald-600'}>{varianceLiters > 0 ? `+${varianceLiters}` : varianceLiters} Lít</strong>).
              </li>
              <li>
                Tổng chi phí nhiên liệu thanh toán: <strong>{totalActualFuelCost.toLocaleString()} VNĐ</strong>.
              </li>
              <li>
                Suất tiêu hao bình quân toàn chi nhánh: <strong>{costPerKm.toLocaleString()} VNĐ / km</strong>.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-2">
              II. ĐỀ XUẤT XỬ LÝ KHẤU TRỪ TRUY THU & KHEN THƯỞNG LÁI XE:
            </h4>
            <div className="space-y-2">
              <div>
                <strong>1. Về các trường hợp vượt định mức nhiên liệu:</strong>
                <p className="mt-1">
                  Có <strong>{overVehicles.length} phương tiện</strong> vượt định mức cho phép. Tổng số tiền đề xuất khấu trừ truy thu vào kỳ lương là:{' '}
                  <span className="text-red-600 font-bold font-mono">
                    -{totalPenalty.toLocaleString()} VNĐ
                  </span>
                  . Cụ thể các trường hợp:
                </p>
                <div className="mt-2 space-y-1">
                  {overVehicles.map((v) => (
                    <div key={v.vehiclePlate} className="text-xs pl-3 border-l-2 border-red-400">
                      - Xe <strong>{v.vehiclePlate}</strong> (Lái xe: {v.driverName}): Vượt {v.varianceLiters} Lít (+{v.variancePercent}%), đề xuất truy thu <strong>{v.penaltyAmount.toLocaleString()} đ</strong>. {v.explanation && `[Giải trình: ${v.explanation}]`}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <strong>2. Về các trường hợp tiết kiệm nhiên liệu:</strong>
                <p className="mt-1">
                  Có <strong>{savingVehicles.length} phương tiện</strong> vận hành tiết kiệm nhiên liệu, đề xuất thưởng khuyến khích theo quy chế là:{' '}
                  <span className="text-emerald-600 font-bold font-mono">
                    +{totalSavingBonus.toLocaleString()} VNĐ
                  </span>
                  .
                </p>
              </div>

              <div className="pt-2">
                <strong>3. Về quỹ lương lái xe thực lĩnh sau đối soát:</strong>
                <p className="mt-1">
                  Tổng quỹ lương thực lĩnh chuyển bộ phận Kế toán / Tiền lương sau khi đã khấu trừ trực tiếp các khoản truy thu xăng xe là:{' '}
                  <strong className="text-slate-900 font-mono">
                    {totalPayrollFund.toLocaleString()} VNĐ
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>

          <p>
            Kính trình Trưởng phòng Vận hành Kinh doanh xem xét, phê duyệt kết quả đối soát để Tổ Tổng hợp hoàn tất bảng lương và chuyển bộ phận Kế toán thanh toán kịp thời hạn cho người lao động.
          </p>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 mt-12 pt-6 text-center text-xs md:text-sm">
          <div>
            <div className="font-bold uppercase text-slate-800">NGƯỜI LẬP TỜ TRÌNH</div>
            <div className="text-slate-500 italic mt-0.5">Nhân viên tổng hợp CNKT3</div>
            <div className="h-16 flex items-center justify-center text-slate-400 italic text-xs">
              (Đã ký điện tử vOffice)
            </div>
            <div className="font-bold text-slate-900">Tổ Tổng Hợp CNKT3</div>
          </div>

          <div>
            <div className="font-bold uppercase text-slate-800">TRƯỞNG PHÒNG VẬN HÀNH KINH DOANH</div>
            <div className="text-slate-500 italic mt-0.5">Phê duyệt & Ý kiến chỉ đạo</div>
            <div className="h-16 flex items-center justify-center text-slate-400 italic text-xs">
              (Chờ phê duyệt)
            </div>
            <div className="font-bold text-slate-900">Trưởng Phòng VHKD</div>
          </div>
        </div>
      </div>
    </div>
  );
};
