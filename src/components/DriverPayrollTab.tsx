import React, { useState } from 'react';
import {
  Wallet,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Award,
  Edit3,
  Check,
  Send,
  X,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { DriverPayrollItem, FuelReconciliationItem } from '../types/index';

interface DriverPayrollTabProps {
  payrolls: DriverPayrollItem[];
  reconciliations: FuelReconciliationItem[];
  onUpdatePayrollItem: (item: DriverPayrollItem) => void;
  onApproveAll: () => void;
  onExportExcel: () => void;
}

export const DriverPayrollTab: React.FC<DriverPayrollTabProps> = ({
  payrolls,
  reconciliations,
  onUpdatePayrollItem,
  onApproveAll,
  onExportExcel,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [editingItem, setEditingItem] = useState<DriverPayrollItem | null>(null);

  const filteredPayrolls = payrolls.filter((p) => {
    const matchSearch =
      p.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.driverCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.assignedPlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTeam = selectedTeam === 'ALL' || p.team === selectedTeam;
    const matchStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchSearch && matchTeam && matchStatus;
  });

  const totalFund = filteredPayrolls.reduce((acc, p) => acc + p.netSalary, 0);
  const totalPenalties = filteredPayrolls.reduce((acc, p) => acc + p.fuelPenalty, 0);
  const totalSavings = filteredPayrolls.reduce((acc, p) => acc + p.fuelSavingBonus, 0);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      // Recalculate net salary
      const gross =
        editingItem.baseSalary +
        editingItem.tripAllowance +
        editingItem.kmAllowance +
        editingItem.phoneAllowance +
        editingItem.mealAllowance +
        editingItem.fuelSavingBonus +
        editingItem.otherBonus;
      const net = Math.max(0, gross - editingItem.fuelPenalty - editingItem.otherDeductions);

      onUpdatePayrollItem({
        ...editingItem,
        netSalary: net,
      });
      setEditingItem(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            Bảng Tính Lương Lái Xe & Khấu Trừ Chi Phí Nhiên Liệu Vượt Định Mức
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tự động liên kết dữ liệu chuyến xe, số Km và trừ trực tiếp tiền phạt xăng vượt định mức vào lương thực lĩnh theo quy chế CNKT3.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onApproveAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Phê Duyệt Hàng Loạt</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Bảng Lương Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tổng Quỹ Lương Thực Lĩnh:</span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {totalFund.toLocaleString()} đ
          </div>
          <span className="text-[11px] text-slate-400">Cho {filteredPayrolls.length} lái xe</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tổng Tiền Trừ Xăng Vượt Mức:</span>
          <div className="text-xl font-bold text-red-600 mt-1 font-mono">
            -{totalPenalties.toLocaleString()} đ
          </div>
          <span className="text-[11px] text-red-400">Khấu trừ tự động từ đối soát nhiên liệu</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tổng Tiền Thưởng Tiết Kiệm Xăng:</span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
            +{totalSavings.toLocaleString()} đ
          </div>
          <span className="text-[11px] text-emerald-500">Khuyến khích lái xe chạy chuẩn định mức</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã NV (VTP-...), họ tên lái xe, biển số xe..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất cả Đội xe --</option>
            <option value="Đội xe Nội tỉnh 1">Đội xe Nội tỉnh 1</option>
            <option value="Đội xe Nội tỉnh 2">Đội xe Nội tỉnh 2</option>
            <option value="Đội xe Trung chuyển HUB">Đội xe Trung chuyển HUB</option>
            <option value="Đội xe Liên tỉnh Bắc - Nam">Đội xe Liên tỉnh Bắc - Nam</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">-- Tất cả Trạng thái --</option>
            <option value="Dự thảo">Bản dự thảo</option>
            <option value="Đã đối soát">Đã đối soát</option>
            <option value="Chờ Trưởng phòng duyệt">Chờ Trưởng phòng duyệt</option>
            <option value="Đã chuyển kế toán">Đã chuyển kế toán</option>
          </select>
        </div>
      </div>

      {/* Main Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Mã NV</th>
                <th className="py-3 px-3">Họ Tên Lái Xe</th>
                <th className="py-3 px-3">Xe Phụ Trách</th>
                <th className="py-3 px-3">Đội Xe</th>
                <th className="py-3 px-3 text-center">Công / Chuyến</th>
                <th className="py-3 px-3 text-right">Tổng Km</th>
                <th className="py-3 px-3 text-right">Lương CB</th>
                <th className="py-3 px-3 text-right">Lương Chuyến/Km</th>
                <th className="py-3 px-3 text-right">Phụ Cấp</th>
                <th className="py-3 px-3 text-right">Thưởng Tiết Kiệm</th>
                <th className="py-3 px-3 text-right bg-red-50 text-red-700">Trừ Truy Thu Xăng</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900 bg-emerald-50">
                  THỰC LĨNH
                </th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayrolls.map((p) => {
                const allowances = p.phoneAllowance + p.mealAllowance;
                const tripAndKm = p.tripAllowance + p.kmAllowance;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-medium text-slate-500">{p.driverCode}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{p.driverName}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-bold text-slate-800">
                        {p.assignedPlate}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.team}</td>
                    <td className="py-3 px-3 text-center text-slate-700">
                      <div>{p.workDays} công</div>
                      <div className="text-[10px] text-slate-400 font-medium">({p.totalTrips} chuyến)</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-800">
                      {p.totalKm.toLocaleString()} km
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {p.baseSalary.toLocaleString()} đ
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      <div>{tripAndKm.toLocaleString()} đ</div>
                      <div className="text-[10px] text-slate-400">
                        ({p.tripAllowance.toLocaleString()} + {p.kmAllowance.toLocaleString()})
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {allowances.toLocaleString()} đ
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {p.fuelSavingBonus > 0 ? (
                        <span className="font-bold text-emerald-600">
                          +{p.fuelSavingBonus.toLocaleString()} đ
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono bg-red-50/50">
                      {p.fuelPenalty > 0 ? (
                        <span className="font-bold text-red-600">
                          -{p.fuelPenalty.toLocaleString()} đ
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-emerald-50/60 text-sm">
                      {p.netSalary.toLocaleString()} đ
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.status === 'Đã chuyển kế toán'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'Chờ Trưởng phòng duyệt'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setEditingItem({ ...p })}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Chỉnh sửa ngày công, phụ cấp hoặc ghi chú"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Payroll Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">
                  Điều Chỉnh Số Liệu Lương: {editingItem.driverName}
                </h3>
                <span className="text-xs text-slate-400">
                  Mã: {editingItem.driverCode} | Xe: {editingItem.assignedPlate}
                </span>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Số Ngày Công:</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingItem.workDays}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, workDays: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Lương Cơ Bản (đ):</label>
                  <input
                    type="number"
                    step="100000"
                    value={editingItem.baseSalary}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, baseSalary: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Lương Chuyến (đ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={editingItem.tripAllowance}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tripAllowance: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Lương Sản Lượng Km (đ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={editingItem.kmAllowance}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, kmAllowance: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Fuel Penalty Linked Field */}
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-red-900">
                    Khoản Trừ Truy Thu Xăng Vượt Mức (đ):
                  </label>
                  <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                    Tự động đối soát
                  </span>
                </div>
                <input
                  type="number"
                  step="1000"
                  value={editingItem.fuelPenalty}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, fuelPenalty: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2 rounded-lg border border-red-300 font-mono text-red-600 font-bold bg-white"
                />
                <p className="text-[11px] text-red-700 mt-1">
                  Khoản tiền trừ khi xe vượt quá định mức xăng tiêu chuẩn của Viettel Post.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Thưởng Khác (đ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={editingItem.otherBonus}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, otherBonus: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Giảm Trừ Khác (BHXH/Tạm ứng) (đ):</label>
                  <input
                    type="number"
                    step="50000"
                    value={editingItem.otherDeductions}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        otherDeductions: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Trạng Thái Hồ Sơ:</label>
                <select
                  value={editingItem.status}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      status: e.target.value as DriverPayrollItem['status'],
                    })
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Dự thảo">Dự thảo</option>
                  <option value="Đã đối soát">Đã đối soát</option>
                  <option value="Chờ Trưởng phòng duyệt">Chờ Trưởng phòng duyệt</option>
                  <option value="Đã chuyển kế toán">Đã chuyển kế toán</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  Cập Nhật Lương Thực Lĩnh
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
