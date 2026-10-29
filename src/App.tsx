import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { FuelReconciliationTab } from './components/FuelReconciliationTab';
import { DriverPayrollTab } from './components/DriverPayrollTab';
import { ManagementReportTab } from './components/ManagementReportTab';
import { ExcelImportTab } from './components/ExcelImportTab';
import { VehicleFleetTab } from './components/VehicleFleetTab';

import {
  Vehicle,
  Driver,
  RouteLog,
  FuelInvoice,
  DriverPayrollItem,
  FuelReconciliationItem,
} from './types/index';
import {
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_ROUTE_LOGS,
  INITIAL_FUEL_INVOICES,
} from './data/mockData';
import { reconcileVehicle, calculateDriverNetSalary, calculateBranchSummary } from './utils/calculator';
import {
  exportFuelReconciliationToExcel,
  exportDriverPayrollToExcel,
  exportOverallCostReportToExcel,
  downloadExcelTemplate,
} from './utils/excelExport';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [routeLogs, setRouteLogs] = useState<RouteLog[]>(INITIAL_ROUTE_LOGS);
  const [fuelInvoices, setFuelInvoices] = useState<FuelInvoice[]>(INITIAL_FUEL_INVOICES);

  // Manual explanations map: { [plateNumber]: { explanation: string, isApproved: boolean } }
  const [explanations, setExplanations] = useState<
    Record<string, { explanation: string; isApproved: boolean }>
  >({
    '29H-834.12': {
      explanation: 'Tắc đường Vành đai 3 kéo dài giờ cao điểm do công trường sửa chữa',
      isApproved: false,
    },
    '29H-912.33': {
      explanation: 'Chạy điều hòa liên tục phục vụ giao bưu gửi vắc xin y tế bảo quản lạnh',
      isApproved: true,
    },
  });

  // Payroll custom adjustments: { [driverId]: Partial<DriverPayrollItem> }
  const [customPayrolls, setCustomPayrolls] = useState<Record<string, Partial<DriverPayrollItem>>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compute fuel reconciliations dynamically
  const reconciliations: FuelReconciliationItem[] = useMemo(() => {
    return vehicles.map((v) => {
      const vLogs = routeLogs.filter((l) => l.vehiclePlate === v.plateNumber);
      const vInvoices = fuelInvoices.filter((i) => i.vehiclePlate === v.plateNumber);
      const baseRecon = reconcileVehicle(v, vLogs, vInvoices);

      const exp = explanations[v.plateNumber];
      if (exp) {
        baseRecon.explanation = exp.explanation;
        baseRecon.isApprovedExplanation = exp.isApproved;
        // If approved explanation, wave or reduce penalty
        if (exp.isApproved) {
          baseRecon.penaltyAmount = 0; // Miễn trừ truy thu do lý do chính đáng
        }
      }
      return baseRecon;
    });
  }, [vehicles, routeLogs, fuelInvoices, explanations]);

  // Compute driver payroll items dynamically with linked fuel penalties
  const payrolls: DriverPayrollItem[] = useMemo(() => {
    return drivers.map((d) => {
      // Find assigned vehicle & reconciliation
      const assignedVeh = vehicles.find((v) => v.driverId === d.id || v.plateNumber === d.assignedPlate);
      const recon = assignedVeh
        ? reconciliations.find((r) => r.vehiclePlate === assignedVeh.plateNumber)
        : null;

      const totalKm = recon ? recon.totalKm : 2000;
      const totalTrips = recon ? recon.totalTrips : 20;

      // Base amounts
      const workDays = 26;
      const tripAllowance = totalTrips * 65000; // 65k / chuyến
      const kmAllowance = Math.round(totalKm * 800); // 800đ / km
      const phoneAllowance = 300000;
      const mealAllowance = 650000;
      const fuelPenalty = recon ? recon.penaltyAmount : 0;
      const fuelSavingBonus = recon ? recon.savingBonus : 0;
      const otherBonus = 0;
      const otherDeductions = 450000; // BHXH, công đoàn

      const custom = customPayrolls[d.id] || {};

      const baseSalary = custom.baseSalary !== undefined ? custom.baseSalary : d.baseSalary;
      const finalWorkDays = custom.workDays !== undefined ? custom.workDays : workDays;
      const finalTripAllowance =
        custom.tripAllowance !== undefined ? custom.tripAllowance : tripAllowance;
      const finalKmAllowance = custom.kmAllowance !== undefined ? custom.kmAllowance : kmAllowance;
      const finalFuelPenalty = custom.fuelPenalty !== undefined ? custom.fuelPenalty : fuelPenalty;
      const finalSavingBonus =
        custom.fuelSavingBonus !== undefined ? custom.fuelSavingBonus : fuelSavingBonus;
      const finalOtherBonus = custom.otherBonus !== undefined ? custom.otherBonus : otherBonus;
      const finalDeductions =
        custom.otherDeductions !== undefined ? custom.otherDeductions : otherDeductions;
      const finalStatus = custom.status || 'Đã đối soát';

      const netSalary = calculateDriverNetSalary({
        baseSalary,
        tripAllowance: finalTripAllowance,
        kmAllowance: finalKmAllowance,
        phoneAllowance,
        mealAllowance,
        fuelPenalty: finalFuelPenalty,
        fuelSavingBonus: finalSavingBonus,
        otherBonus: finalOtherBonus,
        otherDeductions: finalDeductions,
      });

      return {
        id: `pay-${d.id}`,
        driverId: d.id,
        driverCode: d.code,
        driverName: d.name,
        team: d.team,
        assignedPlate: d.assignedPlate,
        workDays: finalWorkDays,
        totalTrips,
        totalKm,
        baseSalary,
        tripAllowance: finalTripAllowance,
        kmAllowance: finalKmAllowance,
        phoneAllowance,
        mealAllowance,
        fuelPenalty: finalFuelPenalty,
        fuelSavingBonus: finalSavingBonus,
        otherBonus: finalOtherBonus,
        otherDeductions: finalDeductions,
        netSalary,
        status: finalStatus,
        notes: custom.notes || '',
      };
    });
  }, [drivers, vehicles, reconciliations, customPayrolls]);

  // Overall summary KPIs
  const branchSummary = useMemo(() => {
    return calculateBranchSummary(reconciliations, payrolls);
  }, [reconciliations, payrolls]);

  // Team breakdown for cost reports
  const teamBreakdown = useMemo(() => {
    const teams = [
      'Đội xe Nội tỉnh 1',
      'Đội xe Nội tỉnh 2',
      'Đội xe Trung chuyển HUB',
      'Đội xe Liên tỉnh Bắc - Nam',
    ];

    return teams.map((teamName) => {
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
        totalKm: km,
        fuelCost,
        payrollCost,
        totalCost,
        costPerKm: teamCostPerKm,
        varianceLiters: vLiters,
      };
    });
  }, [reconciliations, payrolls]);

  // Handlers
  const handleUpdateExplanation = (
    plateNumber: string,
    explanation: string,
    isApproved: boolean
  ) => {
    setExplanations((prev) => ({
      ...prev,
      [plateNumber]: { explanation, isApproved },
    }));
    showToast(`Đã lưu giải trình cho xe ${plateNumber} thành công!`);
  };

  const handleAddFuelInvoice = (inv: Partial<FuelInvoice>) => {
    const newInv: FuelInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: inv.invoiceNumber || `HĐ-PTL-${Date.now().toString().slice(-4)}`,
      date: inv.date || new Date().toISOString().split('T')[0],
      vehiclePlate: inv.vehiclePlate || '29H-834.12',
      driverName: inv.driverName || 'Lái xe',
      stationName: inv.stationName || 'Petrolimex CHXD',
      fuelType: inv.fuelType || 'Diesel',
      quantityLiters: inv.quantityLiters || 50,
      unitPrice: inv.unitPrice || 21500,
      totalAmount: (inv.quantityLiters || 50) * (inv.unitPrice || 21500),
      matchedWithRoute: true,
    };
    setFuelInvoices((prev) => [newInv, ...prev]);
    showToast(`Đã thêm hóa đơn ${newInv.invoiceNumber} và tự động đối soát!`);
  };

  const handleAddRouteLog = (log: Partial<RouteLog>) => {
    const newLog: RouteLog = {
      id: `log-${Date.now()}`,
      logCode: log.logCode || `LT-${Date.now().toString().slice(-4)}`,
      date: log.date || new Date().toISOString().split('T')[0],
      vehiclePlate: log.vehiclePlate || '29H-834.12',
      driverId: log.driverId || 'drv-01',
      driverName: log.driverName || 'Lái xe',
      routeType: log.routeType || 'Nội thành',
      routeName: log.routeName || 'Tuyến HUB CNKT3',
      kmStart: log.kmStart || 0,
      kmEnd: log.kmEnd || 100,
      kmTraveled: (log.kmEnd || 100) - (log.kmStart || 0),
      tripCount: log.tripCount || 2,
      status: 'Khớp dữ liệu',
    };
    setRouteLogs((prev) => [newLog, ...prev]);
    showToast(`Đã thêm phiếu lộ trình giấy ${newLog.logCode}!`);
  };

  const handleImportLogs = (logs: RouteLog[]) => {
    setRouteLogs((prev) => [...logs, ...prev]);
    showToast(`Đã nạp ${logs.length} phiếu nhật trình lộ trình giấy thành công!`);
  };

  const handleImportInvoices = (invs: FuelInvoice[]) => {
    setFuelInvoices((prev) => [...invs, ...prev]);
    showToast(`Đã nạp ${invs.length} hóa đơn xăng dầu thành công!`);
  };

  const handleUpdatePayrollItem = (item: DriverPayrollItem) => {
    setCustomPayrolls((prev) => ({
      ...prev,
      [item.driverId]: item,
    }));
    showToast(`Đã cập nhật bảng lương cho lái xe ${item.driverName}!`);
  };

  const handleApproveAllPayrolls = () => {
    const updated: Record<string, Partial<DriverPayrollItem>> = {};
    drivers.forEach((d) => {
      updated[d.id] = {
        ...(customPayrolls[d.id] || {}),
        status: 'Chờ Trưởng phòng duyệt',
      };
    });
    setCustomPayrolls(updated);
    showToast('Đã phê duyệt đối soát toàn bộ bảng lương và chuyển Trưởng phòng xem xét!');
  };

  const handleSyncToPayroll = () => {
    showToast('Đã đồng bộ tự động tiền phạt xăng xe vượt định mức vào Bảng lương lái xe!');
    setActiveTab('payroll');
  };

  const handleExportAllExcel = () => {
    exportFuelReconciliationToExcel(reconciliations, fuelInvoices, routeLogs);
    exportDriverPayrollToExcel(payrolls);
    exportOverallCostReportToExcel(branchSummary, teamBreakdown);
    showToast('Đã xuất thành công 3 file Excel: Bảng Đối Soát Xăng, Bảng Lương, và Báo Cáo Chi Phí!');
  };

  const handleResetData = () => {
    setVehicles(INITIAL_VEHICLES);
    setDrivers(INITIAL_DRIVERS);
    setRouteLogs(INITIAL_ROUTE_LOGS);
    setFuelInvoices(INITIAL_FUEL_INVOICES);
    setExplanations({
      '29H-834.12': {
        explanation: 'Tắc đường Vành đai 3 kéo dài giờ cao điểm do công trường sửa chữa',
        isApproved: false,
      },
      '29H-912.33': {
        explanation: 'Chạy điều hòa liên tục phục vụ giao bưu gửi vắc xin y tế bảo quản lạnh',
        isApproved: true,
      },
    });
    setCustomPayrolls({});
    showToast('Đã khôi phục dữ liệu ban đầu của CNKT3!');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportAll={handleExportAllExcel}
        onResetData={handleResetData}
        onDownloadTemplates={() => setActiveTab('import')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast alert */}
        {toastMessage && (
          <div className="mb-4 p-3 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-2">
            <span>✨ {toastMessage}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-sm px-2 cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Dynamic Tab Rendering */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            reconciliations={reconciliations}
            payrolls={payrolls}
            setActiveTab={setActiveTab}
            onExportExcel={handleExportAllExcel}
          />
        )}

        {activeTab === 'reconciliation' && (
          <FuelReconciliationTab
            reconciliations={reconciliations}
            vehicles={vehicles}
            routeLogs={routeLogs}
            fuelInvoices={fuelInvoices}
            onUpdateExplanation={handleUpdateExplanation}
            onAddFuelInvoice={handleAddFuelInvoice}
            onAddRouteLog={handleAddRouteLog}
            onExportExcel={() =>
              exportFuelReconciliationToExcel(reconciliations, fuelInvoices, routeLogs)
            }
            onSyncToPayroll={handleSyncToPayroll}
          />
        )}

        {activeTab === 'payroll' && (
          <DriverPayrollTab
            payrolls={payrolls}
            reconciliations={reconciliations}
            onUpdatePayrollItem={handleUpdatePayrollItem}
            onApproveAll={handleApproveAllPayrolls}
            onExportExcel={() => exportDriverPayrollToExcel(payrolls)}
          />
        )}

        {activeTab === 'management' && (
          <ManagementReportTab
            reconciliations={reconciliations}
            payrolls={payrolls}
            onExportExcel={() =>
              exportOverallCostReportToExcel(branchSummary, teamBreakdown)
            }
          />
        )}

        {activeTab === 'import' && (
          <ExcelImportTab
            onImportLogs={handleImportLogs}
            onImportInvoices={handleImportInvoices}
            vehicles={vehicles}
          />
        )}

        {activeTab === 'fleet' && (
          <VehicleFleetTab
            vehicles={vehicles}
            onUpdateVehicle={(updated) =>
              setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
            }
            onAddVehicle={(newVeh) => setVehicles((prev) => [newVeh, ...prev])}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Viettel Post – Chi nhánh Khai thác 3 (CNKT3)</strong> | Phòng Vận hành Kinh doanh
          </div>
          <div className="flex items-center gap-3">
            <span>Hệ thống Tự Động Hóa Nghiệp Vụ Nhân Viên Tổng Hợp</span>
            <span>•</span>
            <span className="text-slate-400">Phiên bản 2.5 - 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
