import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Edit2,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  Gauge,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Vehicle } from '../types/index';
import { downloadExcelTemplate } from '../utils/excelExport';

interface VehicleFleetTabProps {
  vehicles: Vehicle[];
  onUpdateVehicle: (updated: Vehicle) => void;
  onAddVehicle: (newVeh: Vehicle) => void;
}

export const VehicleFleetTab: React.FC<VehicleFleetTabProps> = ({
  vehicles,
  onUpdateVehicle,
  onAddVehicle,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    plateNumber: '',
    type: 'Isuzu QKR',
    tonnage: 2.4,
    fuelType: 'Diesel',
    normLitersPer100Km: 12.0,
    team: 'Đội xe Nội tỉnh 1',
    driverName: '',
    odoStartMonth: 50000,
    odoCurrent: 52000,
    status: 'Hoạt động tốt',
  });

  const filteredVehicles = vehicles.filter((v) => {
    const matchSearch =
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTeam = selectedTeam === 'ALL' || v.team === selectedTeam;
    return matchSearch && matchTeam;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVehicle) {
      onUpdateVehicle(editingVehicle);
      setEditingVehicle(null);
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Vehicle = {
      id: `veh-${Date.now()}`,
      plateNumber: newVehicle.plateNumber || '29H-999.99',
      type: newVehicle.type || 'Isuzu QKR',
      tonnage: Number(newVehicle.tonnage) || 2.4,
      fuelType: newVehicle.fuelType as any || 'Diesel',
      normLitersPer100Km: Number(newVehicle.normLitersPer100Km) || 12.0,
      team: newVehicle.team || 'Đội xe Nội tỉnh 1',
      driverId: `drv-${Date.now()}`,
      driverName: newVehicle.driverName || 'Lái xe mới',
      odoStartMonth: Number(newVehicle.odoStartMonth) || 0,
      odoCurrent: Number(newVehicle.odoCurrent) || 0,
      status: 'Hoạt động tốt',
    };
    onAddVehicle(created);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-red-600" />
            Danh Mục Đội Xe & Bảng Định Mức Nhiên Liệu (110 Phương Tiện)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thông số tải trọng, định mức lít/100km chuẩn làm căn cứ tự động so sánh vượt/tiết kiệm xăng dầu toàn Chi nhánh Khai thác 3.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => downloadExcelTemplate('xe_dinhmuc')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Tải Bảng Định Mức Excel</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Xe Mới</span>
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
            placeholder="Tìm theo biển số xe, tên lái xe, model xe..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">STT</th>
                <th className="py-3 px-3">Biển Số Xe</th>
                <th className="py-3 px-3">Loại Xe / Model</th>
                <th className="py-3 px-3 text-center">Tải Trọng</th>
                <th className="py-3 px-3">Loại Nhiên Liệu</th>
                <th className="py-3 px-3 text-right bg-red-50/60 text-red-700 font-bold">
                  Định Mức Chuẩn
                </th>
                <th className="py-3 px-3">Đội Xe</th>
                <th className="py-3 px-3">Lái Xe Phụ Trách</th>
                <th className="py-3 px-3 text-right">Odo Đầu Kỳ</th>
                <th className="py-3 px-3 text-right">Odo Hiện Tại</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Sửa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((veh, index) => (
                <tr key={veh.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 text-slate-400 font-mono">{index + 1}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {veh.plateNumber}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{veh.type}</td>
                  <td className="py-3 px-3 text-center font-mono">{veh.tonnage} Tấn</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        veh.fuelType === 'Diesel'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {veh.fuelType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-red-600 bg-red-50/30">
                    {veh.normLitersPer100Km} Lít/100km
                  </td>
                  <td className="py-3 px-3 text-slate-600">{veh.team}</td>
                  <td className="py-3 px-3 font-medium text-slate-900">{veh.driverName}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">
                    {veh.odoStartMonth.toLocaleString()} km
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                    {veh.odoCurrent.toLocaleString()} km
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                      {veh.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => setEditingVehicle({ ...veh })}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Chỉnh sửa thông số xe & định mức"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Vehicle Modal */}
      {editingVehicle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-sm font-bold">
                Cập Nhật Thông Tin Xe: {editingVehicle.plateNumber}
              </h3>
              <button
                onClick={() => setEditingVehicle(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Loại Xe / Model:</label>
                <input
                  type="text"
                  value={editingVehicle.type}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, type: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Tải Trọng (Tấn):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingVehicle.tonnage}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        tonnage: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1 font-bold text-red-700">
                    Định Mức (L/100km):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingVehicle.normLitersPer100Km}
                    onChange={(e) =>
                      setEditingVehicle({
                        ...editingVehicle,
                        normLitersPer100Km: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-red-300 font-mono text-red-700 font-bold bg-red-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Lái Xe Phụ Trách:</label>
                <input
                  type="text"
                  value={editingVehicle.driverName}
                  onChange={(e) =>
                    setEditingVehicle({ ...editingVehicle, driverName: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Đội Xe:</label>
                <select
                  value={editingVehicle.team}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, team: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Đội xe Nội tỉnh 1">Đội xe Nội tỉnh 1</option>
                  <option value="Đội xe Nội tỉnh 2">Đội xe Nội tỉnh 2</option>
                  <option value="Đội xe Trung chuyển HUB">Đội xe Trung chuyển HUB</option>
                  <option value="Đội xe Liên tỉnh Bắc - Nam">Đội xe Liên tỉnh Bắc - Nam</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingVehicle(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                >
                  Lưu Thông Tin Xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200">
            <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-sm font-bold">Thêm Phương Tiện Mới Vào Đội Xe CNKT3</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Biển Số Xe (*):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 29H-888.66"
                  value={newVehicle.plateNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Loại Xe / Model:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Thaco Towner 1.25T"
                  value={newVehicle.type}
                  onChange={(e) => setNewVehicle({ ...newVehicle, type: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Tải Trọng (Tấn):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVehicle.tonnage}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, tonnage: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Loại Nhiên Liệu:</label>
                  <select
                    value={newVehicle.fuelType}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuelType: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Diesel">Dầu Diesel</option>
                    <option value="Xăng A95">Xăng RON 95</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1 font-bold text-red-700">
                    Định Mức (L/100km):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newVehicle.normLitersPer100Km}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        normLitersPer100Km: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 rounded-lg border border-red-300 font-mono font-bold text-red-700 bg-red-50/30"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Lái Xe Phụ Trách:</label>
                  <input
                    type="text"
                    placeholder="Họ tên lái xe"
                    value={newVehicle.driverName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Đội Xe:</label>
                <select
                  value={newVehicle.team}
                  onChange={(e) => setNewVehicle({ ...newVehicle, team: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Đội xe Nội tỉnh 1">Đội xe Nội tỉnh 1</option>
                  <option value="Đội xe Nội tỉnh 2">Đội xe Nội tỉnh 2</option>
                  <option value="Đội xe Trung chuyển HUB">Đội xe Trung chuyển HUB</option>
                  <option value="Đội xe Liên tỉnh Bắc - Nam">Đội xe Liên tỉnh Bắc - Nam</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer"
                >
                  Thêm Xe Vào Hệ Thống
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
