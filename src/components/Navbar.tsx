import React from 'react';
import { Truck, FileSpreadsheet, Download, RefreshCw, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExportAll: () => void;
  onResetData: () => void;
  onDownloadTemplates: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportAll,
  onResetData,
  onDownloadTemplates,
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Tổng Quan & KPI', icon: '📊' },
    { id: 'reconciliation', label: 'Đối Soát Xăng & Lộ Trình', icon: '⛽' },
    { id: 'payroll', label: 'Tính Lương Lái Xe', icon: '💰' },
    { id: 'management', label: 'Báo Cáo Quản Trị & Tờ Trình', icon: '📑' },
    { id: 'import', label: 'Nạp File Excel & Mẫu Biểu', icon: '📥' },
    { id: 'fleet', label: 'Đội Xe & Định Mức (110 Xe)', icon: '🚛' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      {/* Top Banner Viettel Post branding */}
      <div className="bg-[#EE0033] px-4 py-1.5 text-xs text-white flex flex-wrap items-center justify-between font-medium tracking-wide">
        <div className="flex items-center gap-2">
          <span className="font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded">VIETTEL POST</span>
          <span>Phòng Vận Hành Kinh Doanh – Chi Nhánh Khai Thác 3 (CNKT3)</span>
          <span className="hidden md:inline text-red-200">| Hệ thống Tự Động Hóa Đối Soát Dữ Liệu Nghiệp Vụ</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px] bg-red-800/60 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-emerald-300" /> Chuẩn quy chế Tổng công ty
          </span>
          <span className="text-red-100 font-mono">Kỳ báo cáo: Tháng 10/2026</span>
        </div>
      </div>

      {/* Main Nav header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center shadow-md shadow-red-900/30">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Quản Trị Đội Xe & Đối Soát Lương - Chi Phí Xăng Dầu
                <span className="text-[10px] uppercase font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                  CNKT3
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Tự động hóa xử lý Lộ trình giấy ➔ Hóa đơn xăng ➔ Định mức vượt/tiết kiệm ➔ Lương lái xe ➔ Báo cáo Excel
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onExportAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm cursor-pointer"
              title="Xuất file Excel đầy đủ đối soát, lương và chi phí"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất Full Excel (.xlsx)</span>
            </button>

            <button
              onClick={onDownloadTemplates}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Tải các file mẫu Excel để nhập liệu"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Tải Mẫu Biểu</span>
            </button>

            <button
              onClick={onResetData}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Khôi phục lại dữ liệu mẫu chuẩn"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Dữ liệu mẫu</span>
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-1 overflow-x-auto pb-2 pt-1 border-t border-slate-800/80 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
