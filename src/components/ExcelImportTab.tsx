import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { RouteLog, FuelInvoice, Vehicle } from '../types/index';
import { downloadExcelTemplate } from '../utils/excelExport';

interface ExcelImportTabProps {
  onImportLogs: (logs: RouteLog[]) => void;
  onImportInvoices: (invoices: FuelInvoice[]) => void;
  vehicles: Vehicle[];
}

export const ExcelImportTab: React.FC<ExcelImportTabProps> = ({
  onImportLogs,
  onImportInvoices,
  vehicles,
}) => {
  const [importType, setImportType] = useState<'lotrinh' | 'hoadon'>('lotrinh');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        setPreviewData(data);
        setStatusMessage({
          type: 'success',
          text: `Đã đọc thành công ${data.length} dòng dữ liệu từ file "${file.name}"! Bạn có thể xem trước và bấm Xác nhận nạp.`,
        });
      } catch (err) {
        setStatusMessage({
          type: 'error',
          text: 'Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng file .xlsx hoặc .xls!',
        });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = () => {
    if (previewData.length === 0) return;

    if (importType === 'lotrinh') {
      const logs: RouteLog[] = previewData.map((row: any, idx) => ({
        id: `import-log-${Date.now()}-${idx}`,
        logCode: row['Mã nhật trình'] || row['Mã lộ trình'] || `LT-IMP-${idx + 1}`,
        date: row['Ngày chạy (YYYY-MM-DD)'] || row['Ngày'] || '2026-10-15',
        vehiclePlate: row['Biển số xe'] || row['Biển số'] || '29H-834.12',
        driverId: `drv-imp-${idx}`,
        driverName: row['Tên lái xe'] || row['Lái xe'] || 'Lái xe Viettel Post',
        routeType: 'Nội thành',
        routeName: row['Tuyến vận hành'] || row['Tuyến'] || 'Tuyến giao nhận CNKT3',
        kmStart: Number(row['Km bắt đầu']) || 0,
        kmEnd: Number(row['Km kết thúc']) || 0,
        kmTraveled:
          (Number(row['Km kết thúc']) || 0) - (Number(row['Km bắt đầu']) || 0) > 0
            ? (Number(row['Km kết thúc']) || 0) - (Number(row['Km bắt đầu']) || 0)
            : Number(row['Km thực chạy']) || 150,
        tripCount: Number(row['Số chuyến']) || 2,
        status: 'Khớp dữ liệu',
      }));
      onImportLogs(logs);
      setStatusMessage({
        type: 'success',
        text: `Đã nạp thành công ${logs.length} phiếu nhật trình lộ trình giấy vào hệ thống đối soát!`,
      });
      setPreviewData([]);
    } else {
      const invoices: FuelInvoice[] = previewData.map((row: any, idx) => ({
        id: `import-inv-${Date.now()}-${idx}`,
        invoiceNumber: row['Số hóa đơn'] || row['Số HĐ'] || `HĐ-IMP-${idx + 1}`,
        date: row['Ngày xuất HĐ (YYYY-MM-DD)'] || row['Ngày'] || '2026-10-15',
        vehiclePlate: row['Biển số xe'] || row['Biển số'] || '29H-834.12',
        driverName: row['Tên lái xe nhận'] || row['Lái xe'] || 'Lái xe nhận xăng',
        stationName: row['Cây xăng / Nhà cung cấp'] || row['Cây xăng'] || 'Petrolimex CHXD',
        fuelType: (row['Loại nhiên liệu'] || 'Diesel') as any,
        quantityLiters: Number(row['Số lít']) || 50,
        unitPrice: Number(row['Đơn giá (đ/lít)']) || Number(row['Đơn giá']) || 21500,
        totalAmount:
          (Number(row['Số lít']) || 50) *
          (Number(row['Đơn giá (đ/lít)']) || Number(row['Đơn giá']) || 21500),
        matchedWithRoute: true,
      }));
      onImportInvoices(invoices);
      setStatusMessage({
        type: 'success',
        text: `Đã nạp thành công ${invoices.length} hóa đơn nhiên liệu vào hệ thống đối soát!`,
      });
      setPreviewData([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-red-600" />
            Nạp Dữ Liệu Excel Tự Động & Tải File Mẫu Chuẩn Viettel Post
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nhân viên tổng hợp có thể nạp trực tiếp file Excel lộ trình giấy hoặc hóa đơn xăng để hệ thống tự động nhận diện và tính toán.
          </p>
        </div>
      </div>

      {/* 3 Download Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition">
          <div>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-2 font-bold text-xs">
              MẪU 1
            </div>
            <h3 className="text-sm font-bold text-slate-900">File Mẫu Lộ Trình Giấy</h3>
            <p className="text-xs text-slate-500 mt-1">
              Mẫu biểu ghi nhận Km bắt đầu, Km kết thúc, số chuyến và tuyến đường vận hành của lái xe.
            </p>
          </div>
          <button
            onClick={() => downloadExcelTemplate('lotrinh')}
            className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Mẫu Lộ Trình (.xlsx)</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2 font-bold text-xs">
              MẪU 2
            </div>
            <h3 className="text-sm font-bold text-slate-900">File Mẫu Hóa Đơn Xăng Dầu</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bảng kê hóa đơn từ Petrolimex, PVOIL: số hóa đơn, số lít, đơn giá, ngày xuất và biển số xe.
            </p>
          </div>
          <button
            onClick={() => downloadExcelTemplate('hoadon')}
            className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Mẫu Hóa Đơn (.xlsx)</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-red-200 transition">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 font-bold text-xs">
              MẪU 3
            </div>
            <h3 className="text-sm font-bold text-slate-900">File Định Mức & Đội Xe (110 xe)</h3>
            <p className="text-xs text-slate-500 mt-1">
              Danh mục toàn bộ phương tiện, tải trọng và định mức tiêu chuẩn Lít/100km theo Quyết định CNKT3.
            </p>
          </div>
          <button
            onClick={() => downloadExcelTemplate('xe_dinhmuc')}
            className="mt-4 inline-flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Mẫu Định Mức (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* File Upload Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Tải Lên File Excel Cần Nạp</h3>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="radio"
              name="importType"
              value="lotrinh"
              checked={importType === 'lotrinh'}
              onChange={() => setImportType('lotrinh')}
              className="text-red-600 focus:ring-red-500"
            />
            <span>Nạp File Lộ Trình Giấy (Nhật Trình Xe)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="radio"
              name="importType"
              value="hoadon"
              checked={importType === 'hoadon'}
              onChange={() => setImportType('hoadon')}
              className="text-red-600 focus:ring-red-500"
            />
            <span>Nạp File Bảng Kê Hóa Đơn Xăng Dầu Hàng Tháng</span>
          </label>
        </div>

        <div className="border-2 border-dashed border-slate-300 hover:border-red-400 rounded-xl p-8 text-center bg-slate-50/50 transition">
          <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <p className="text-xs font-medium text-slate-700">
            Kéo thả file Excel (.xlsx, .xls) vào đây hoặc bấm để chọn file
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Hỗ trợ cấu trúc tiêu đề theo mẫu chuẩn Viettel Post đã tải ở trên
          </p>

          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
            id="excel-file-input"
          />
          <label
            htmlFor="excel-file-input"
            className="mt-4 inline-block px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition"
          >
            Chọn File Excel Từ Máy Tính
          </label>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="mt-6 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Xem trước {previewData.length} dòng dữ liệu ({fileName})
              </span>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition flex items-center gap-1.5"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Xác Nhận Nạp Dữ Liệu Này</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-slate-100 text-slate-700 sticky top-0">
                  <tr>
                    {Object.keys(previewData[0] || {}).map((col) => (
                      <th key={col} className="p-2 border-b border-slate-200 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {previewData.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {Object.values(row).map((val: any, cidx) => (
                        <td key={cidx} className="p-2 text-slate-800 whitespace-nowrap">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 10 && (
              <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50 border-t border-slate-200">
                ... và {previewData.length - 10} dòng khác
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
