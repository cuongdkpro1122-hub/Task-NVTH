import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Plus,
  Eye,
  MessageSquare,
  Fuel,
  TrendingDown,
  TrendingUp,
  Download,
  Calendar,
  X,
  FileText,
} from 'lucide-react';
import {
  FuelReconciliationItem,
  Vehicle,
  RouteLog,
  FuelInvoice,
} from '../types/index';

interface FuelReconciliationTabProps {
  reconciliations: FuelReconciliationItem[];
  vehicles: Vehicle[];
  routeLogs: RouteLog[];
  fuelInvoices: FuelInvoice[];
  onUpdateExplanation: (plateNumber: string, explanation: string, isApproved: boolean) => void;
  onAddFuelInvoice: (invoice: Partial<FuelInvoice>) => void;
  onAddRouteLog: (log: Partial<RouteLog>) => void;
  onExportExcel: () => void;
  onSyncToPayroll: () => void;
}

export const FuelReconciliationTab: React.FC<FuelReconciliationTabProps> = ({
  reconciliations,
  vehicles,
  routeLogs,
  fuelInvoices,
  onUpdateExplanation,
  onAddFuelInvoice,
  onAddRouteLog,
  onExportExcel,
  onSyncToPayroll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [activeModalVehicle, setActiveModalVehicle] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState('');
  const [isApprovedExplanation, setIsApprovedExplanation] = useState(false);

  // New Invoice Modal state
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    vehiclePlate: vehicles[0]?.plateNumber || '',
    stationName: 'Petrolimex CHXD 15 Thăng Long',
    fuelType: 'Diesel' as 'Diesel' | 'Xăng A95',
    quantityLiters: 50,
    unitPrice: 21500,
  });

  // Filter list
  const filteredItems = reconciliations.filter((item) => {
    const matchSearch =
      item.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vehicleType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTeam = selectedTeam === 'ALL' || item.team === selectedTeam;
    const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    return matchSearch && matchTeam && matchStatus;
  });

  // Open explanation modal
  const handleOpenDetailModal = (item: FuelReconciliationItem) => {
    setActiveModalVehicle(item.vehiclePlate);
    setExplanationText(item.explanation || '');
    setIsApprovedExplanation(item.isApprovedExplanation || false);
  };

  const handleSaveExplanation = () => {
    if (activeModalVehicle) {
      onUpdateExplanation(activeModalVehicle, explanationText, isApprovedExplanation);
      setActiveModalVehicle(null);
    }
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicle = vehicles.find((v) => v.plateNumber === newInvoice.vehiclePlate);
    onAddFuelInvoice({
      ...newInvoice,
      driverName: vehicle?.driverName || 'Lái xe phụ trách',
      totalAmount: Math.round(newInvoice.quantityLiters * newInvoice.unitPrice),
      matchedWithRoute: true,
    });
    setShowAddInvoiceModal(false);
  };

  const selectedVehicleObj = vehicles.find((v) => v.plateNumber === activeModalVehicle);
  const selectedVehicleRecon = reconciliations.find((r) => r.vehiclePlate === activeModalVehicle);
  const vehicleLogs = routeLogs.filter((l) => l.vehiclePlate === activeModalVehicle);
  const vehicleInvoices = fuelInvoices.filter((i) => i.vehiclePlate === activeModalVehicle);

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Fuel className="w-5 h-5 text-red-600" />
            Đối Soát Nhiên Liệu Xăng Dầu & Lộ Trình Giấy Chi Nhánh
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tự động đối chiếu số Km trên nhật trình giấy với hóa đơn thực tế và định mức Viettel Post quy định để tính truy thu/thưởng.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddInvoiceModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Hóa Đơn Xăng</span>
          </button>

          <button
            onClick={onSyncToPayroll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer shadow-xs"
            title="Tự động chuyển các khoản phạt vượt định mức vào Bảng lương lái xe"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Đồng Bộ Vào Bảng Lương</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
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
            placeholder="Tìm theo biển số xe (29H-...), tên lái xe, loại xe..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
          >
            <option value="ALL">-- Tất cả Đội xe --</option>
            <option value="Đội xe Nội tỉnh 1">Đội xe Nội tỉnh 1</option>
            <option value="Đội xe Nội tỉnh 2">Đội xe Nội tỉnh 2</option>
            <option value="Đội xe Trung chuyển HUB">Đội xe Trung chuyển HUB</option>
            <option value="Đội xe Liên tỉnh Bắc - Nam">Đội xe Liên tỉnh Bắc - Nam</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 cursor-pointer"
          >
            <option value="ALL">-- Tất cả Trạng thái --</option>
            <option value="Vượt định mức">⚠️ Vượt định mức</option>
            <option value="Lệch bất thường">🚨 Lệch bất thường (&gt;10%)</option>
            <option value="Tiết kiệm xăng">✨ Tiết kiệm xăng</option>
            <option value="Bình thường">✅ Khớp chuẩn</option>
          </select>

          <span className="text-xs text-slate-500 px-2">
            Hiển thị <strong>{filteredItems.length}</strong> / {reconciliations.length} xe
          </span>
        </div>
      </div>

      {/* Main Reconciliation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">STT</th>
                <th className="py-3 px-3">Biển Số Xe</th>
                <th className="py-3 px-3">Lái Xe Phụ Trách</th>
                <th className="py-3 px-3">Đội Xe</th>
                <th className="py-3 px-3">Loại Xe / Tải Trọng</th>
                <th className="py-3 px-3 text-right">Định Mức</th>
                <th className="py-3 px-3 text-right">Km Lộ Trình</th>
                <th className="py-3 px-3 text-right">Lít Đ.Mức</th>
                <th className="py-3 px-3 text-right">Lít Hóa Đơn</th>
                <th className="py-3 px-3 text-right">Chênh Lệch</th>
                <th className="py-3 px-3 text-right">Truy Thu / Thưởng</th>
                <th className="py-3 px-3 text-center">Đánh Giá</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => {
                const isOver = item.status === 'Vượt định mức' || item.status === 'Lệch bất thường';
                const isSaving = item.status === 'Tiết kiệm xăng';

                return (
                  <tr
                    key={item.vehiclePlate}
                    className={`hover:bg-slate-50/80 transition ${
                      isOver ? 'bg-red-50/20' : isSaving ? 'bg-emerald-50/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {item.vehiclePlate}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      <div>{item.driverName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Mã: {item.driverId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{item.team}</td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>{item.vehicleType}</div>
                      <div className="text-[10px] text-slate-400">{item.tonnage} Tấn</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {item.normPer100Km} L/100km
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-900">
                      {item.totalKm.toLocaleString()} km
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {item.quotaLiters} L
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {item.actualLiters} L
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                          isOver
                            ? 'bg-red-100 text-red-700'
                            : isSaving
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {item.varianceLiters > 0 ? `+${item.varianceLiters}` : item.varianceLiters} L
                        <span className="text-[9px]">({item.variancePercent}%)</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {item.penaltyAmount > 0 && (
                        <div className="font-bold text-red-600">
                          -{item.penaltyAmount.toLocaleString()} đ
                          <span className="block text-[9px] text-red-400">truy thu</span>
                        </div>
                      )}
                      {item.savingBonus > 0 && (
                        <div className="font-bold text-emerald-600">
                          +{item.savingBonus.toLocaleString()} đ
                          <span className="block text-[9px] text-emerald-400">thưởng</span>
                        </div>
                      )}
                      {item.penaltyAmount === 0 && item.savingBonus === 0 && (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          item.status === 'Lệch bất thường'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : item.status === 'Vượt định mức'
                            ? 'bg-amber-100 text-amber-800'
                            : item.status === 'Tiết kiệm xăng'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status}
                      </span>
                      {item.explanation && (
                        <div className="text-[10px] text-blue-600 mt-0.5 flex items-center justify-center gap-0.5">
                          <MessageSquare className="w-2.5 h-2.5" /> Có giải trình
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => handleOpenDetailModal(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                        title="Xem chi tiết lộ trình giấy, hóa đơn xăng và nhập giải trình"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Đối soát</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={13} className="text-center py-8 text-slate-400 text-sm">
                    Không tìm thấy xe phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Explanation Modal */}
      {activeModalVehicle && selectedVehicleRecon && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 rounded-t-2xl flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold font-mono">
                  {selectedVehicleRecon.vehiclePlate.slice(0, 3)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Đối Soát Chi Tiết Phương Tiện: {selectedVehicleRecon.vehiclePlate}
                    <span className="text-xs font-normal text-slate-300">
                      ({selectedVehicleRecon.vehicleType})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lái xe: <strong>{selectedVehicleRecon.driverName}</strong> | {selectedVehicleRecon.team}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalVehicle(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Formula & Calculation Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-red-600" />
                  Công Thức Tính Toán Định Mức Nhiên Liệu Viettel Post
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Tổng Km Lộ trình giấy:</span>
                    <strong className="text-sm font-mono text-slate-900">
                      {selectedVehicleRecon.totalKm.toLocaleString()} km
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Định mức áp dụng:</span>
                    <strong className="text-sm font-mono text-slate-900">
                      {selectedVehicleRecon.normPer100Km} L/100km
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Lít quy định (Quota):</span>
                    <strong className="text-sm font-mono text-blue-600">
                      {selectedVehicleRecon.quotaLiters} Lít
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Lít hóa đơn xăng:</span>
                    <strong className="text-sm font-mono text-slate-900">
                      {selectedVehicleRecon.actualLiters} Lít
                    </strong>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-600">Kết quả đối soát: </span>
                    <strong
                      className={
                        selectedVehicleRecon.varianceLiters > 0
                          ? 'text-red-600 font-bold'
                          : 'text-emerald-600 font-bold'
                      }
                    >
                      {selectedVehicleRecon.varianceLiters > 0
                        ? `Vượt ${selectedVehicleRecon.varianceLiters} Lít (+${selectedVehicleRecon.variancePercent}%)`
                        : `Tiết kiệm ${Math.abs(selectedVehicleRecon.varianceLiters)} Lít`}
                    </strong>
                  </div>
                  <div className="text-xs">
                    {selectedVehicleRecon.penaltyAmount > 0 && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-bold">
                        Khấu trừ lương lái xe: -{selectedVehicleRecon.penaltyAmount.toLocaleString()} đ
                      </span>
                    )}
                    {selectedVehicleRecon.savingBonus > 0 && (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold">
                        Thưởng tiết kiệm: +{selectedVehicleRecon.savingBonus.toLocaleString()} đ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Side by side: Route logs vs Invoices */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Paper Route Logs */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>1. Chi tiết Lộ Trình Giấy ({vehicleLogs.length} phiếu)</span>
                    <span className="text-slate-400 font-normal">Nhật trình xe</span>
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                    {vehicleLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex justify-between font-medium text-slate-800">
                          <span className="font-mono text-blue-600">{log.logCode}</span>
                          <span>{log.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">{log.routeName}</div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                          <span>Odo: {log.kmStart} &rarr; {log.kmEnd}</span>
                          <span className="font-bold text-slate-800">
                            {log.kmTraveled} km ({log.tripCount} chuyến)
                          </span>
                        </div>
                      </div>
                    ))}
                    {vehicleLogs.length === 0 && (
                      <div className="text-slate-400 py-4 text-center">Chưa có nhật trình giấy.</div>
                    )}
                  </div>
                </div>

                {/* Fuel Invoices */}
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>2. Chi tiết Hóa Đơn Xăng Dầu ({vehicleInvoices.length} HĐ)</span>
                    <span className="text-slate-400 font-normal">Từ Petrolimex/PVOIL</span>
                  </h4>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
                    {vehicleInvoices.map((inv) => (
                      <div key={inv.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex justify-between font-medium text-slate-800">
                          <span className="font-mono text-red-600">{inv.invoiceNumber}</span>
                          <span>{inv.date}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 mt-1">{inv.stationName}</div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                          <span>{inv.quantityLiters} Lít @ {inv.unitPrice.toLocaleString()} đ</span>
                          <span className="font-bold text-slate-800">
                            {inv.totalAmount.toLocaleString()} đ
                          </span>
                        </div>
                      </div>
                    ))}
                    {vehicleInvoices.length === 0 && (
                      <div className="text-slate-400 py-4 text-center">Chưa có hóa đơn xăng.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Explanation & Approval Box */}
              <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                  Giải Trình Của Lái Xe & Đội Trưởng Phê Duyệt
                </h4>
                <p className="text-xs text-amber-800 mb-2">
                  Theo quy định của CNKT3: Xe vượt định mức phải ghi rõ nguyên nhân khách quan (tắc đường, sự cố kỹ thuật, máy lạnh chạy hàng lạnh...) để Trưởng phòng xem xét miễn giảm truy thu.
                </p>
                <textarea
                  value={explanationText}
                  onChange={(e) => setExplanationText(e.target.value)}
                  placeholder="Nhập nội dung giải trình của lái xe hoặc ý kiến của Đội trưởng..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
                />

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isApprovedExplanation}
                      onChange={(e) => setIsApprovedExplanation(e.target.checked)}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                    />
                    <span>Đội trưởng xác nhận lý do chính đáng (Đề xuất miễn trừ truy thu)</span>
                  </label>

                  <button
                    onClick={handleSaveExplanation}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
                  >
                    Lưu Giải Trình & Cập Nhật
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 rounded-b-2xl border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setActiveModalVehicle(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" />
                Thêm Hóa Đơn Xăng Dầu Hàng Tháng
              </h3>
              <button
                onClick={() => setShowAddInvoiceModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Số Hóa Đơn (*):</label>
                <input
                  type="text"
                  required
                  value={newInvoice.invoiceNumber}
                  onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
                  placeholder="Ví dụ: HĐ-PTL-9501"
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Phương Tiện / Biển Số (*):</label>
                <select
                  value={newInvoice.vehiclePlate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, vehiclePlate: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plateNumber}>
                      {v.plateNumber} - {v.driverName} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Ngày Xuất HĐ:</label>
                  <input
                    type="date"
                    value={newInvoice.date}
                    onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Loại Nhiên Liệu:</label>
                  <select
                    value={newInvoice.fuelType}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, fuelType: e.target.value as 'Diesel' | 'Xăng A95' })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Diesel">Dầu Diesel 0.05S</option>
                    <option value="Xăng A95">Xăng RON 95-III</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Cây Xăng / Trạm Cấp:</label>
                <input
                  type="text"
                  value={newInvoice.stationName}
                  onChange={(e) => setNewInvoice({ ...newInvoice, stationName: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Số Lít Thực Đổ (*):</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={newInvoice.quantityLiters}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, quantityLiters: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Đơn Giá (đ/lít):</label>
                  <input
                    type="number"
                    step="100"
                    min="1000"
                    required
                    value={newInvoice.unitPrice}
                    onChange={(e) =>
                      setNewInvoice({ ...newInvoice, unitPrice: parseInt(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg text-slate-700 flex justify-between font-medium">
                <span>Tổng thành tiền:</span>
                <span className="font-bold text-red-600 font-mono">
                  {(newInvoice.quantityLiters * newInvoice.unitPrice).toLocaleString()} đ
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                >
                  Lưu Hóa Đơn & Tự Động Khớp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
