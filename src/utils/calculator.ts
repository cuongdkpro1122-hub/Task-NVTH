import {
  Vehicle,
  RouteLog,
  FuelInvoice,
  FuelReconciliationItem,
  DriverPayrollItem,
} from '../types/index';

/**
 * Tính số lít định mức tiêu hao theo số km và định mức (Lít / 100km)
 */
export function calculateQuotaLiters(totalKm: number, normPer100Km: number): number {
  if (totalKm <= 0 || normPer100Km <= 0) return 0;
  return Number(((totalKm * normPer100Km) / 100).toFixed(2));
}

/**
 * Tính chênh lệch nhiên liệu giữa thực tế (hóa đơn) và định mức
 */
export function calculateFuelVariance(actualLiters: number, quotaLiters: number): {
  varianceLiters: number;
  variancePercent: number;
  isOver: boolean;
} {
  const varianceLiters = Number((actualLiters - quotaLiters).toFixed(2));
  let variancePercent = 0;
  if (quotaLiters > 0) {
    variancePercent = Number(((varianceLiters / quotaLiters) * 100).toFixed(1));
  }
  return {
    varianceLiters,
    variancePercent,
    isOver: varianceLiters > 0,
  };
}

/**
 * Tính số tiền truy thu (khi vượt định mức) hoặc tiền thưởng tiết kiệm (khi tiết kiệm)
 * @param varianceLiters Chênh lệch số lít (+: vượt, -: tiết kiệm)
 * @param unitPrice Đơn giá nhiên liệu theo hóa đơn (VNĐ/lít)
 * @param savingRewardRate Tỷ lệ thưởng tiết kiệm (mặc định 50% theo quy chế thi đua)
 */
export function calculateFuelPenaltyAndBonus(
  varianceLiters: number,
  unitPrice: number,
  savingRewardRate = 0.5
): { penaltyAmount: number; savingBonus: number } {
  if (varianceLiters > 0) {
    // Vượt định mức: truy thu 100% chi phí vượt
    return {
      penaltyAmount: Math.round(varianceLiters * unitPrice),
      savingBonus: 0,
    };
  } else if (varianceLiters < 0) {
    // Tiết kiệm định mức: thưởng theo tỷ lệ khuyến khích
    const savedLiters = Math.abs(varianceLiters);
    return {
      penaltyAmount: 0,
      savingBonus: Math.round(savedLiters * unitPrice * savingRewardRate),
    };
  }
  return { penaltyAmount: 0, savingBonus: 0 };
}

/**
 * Tính lương thực lĩnh cho lái xe:
 * Lương thực lĩnh = Lương CB + Lương Chuyến + Lương Km + Phụ cấp ăn/đt + Thưởng tiết kiệm xăng + Thưởng khác - Truy thu xăng vượt - Các khoản giảm trừ (BHXH, tạm ứng)
 */
export function calculateDriverNetSalary(p: {
  baseSalary: number;
  tripAllowance: number;
  kmAllowance: number;
  phoneAllowance: number;
  mealAllowance: number;
  fuelPenalty: number;
  fuelSavingBonus: number;
  otherBonus: number;
  otherDeductions: number;
}): number {
  const gross =
    p.baseSalary +
    p.tripAllowance +
    p.kmAllowance +
    p.phoneAllowance +
    p.mealAllowance +
    p.fuelSavingBonus +
    p.otherBonus;
  const net = gross - p.fuelPenalty - p.otherDeductions;
  return Math.max(0, Math.round(net));
}

/**
 * Tổng hợp dữ liệu đối soát nhiên liệu cho một phương tiện từ nhật trình và hóa đơn
 */
export function reconcileVehicle(
  vehicle: Vehicle,
  vehicleLogs: RouteLog[],
  vehicleInvoices: FuelInvoice[],
  defaultFuelPrice = 21500
): FuelReconciliationItem {
  const totalKm = vehicleLogs.reduce((acc, log) => acc + (log.kmTraveled || 0), 0);
  const totalTrips = vehicleLogs.reduce((acc, log) => acc + (log.tripCount || 1), 0);
  const quotaLiters = calculateQuotaLiters(totalKm, vehicle.normLitersPer100Km);

  const actualLiters = Number(
    vehicleInvoices.reduce((acc, inv) => acc + (inv.quantityLiters || 0), 0).toFixed(2)
  );

  const totalInvoiceAmount = vehicleInvoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
  const effectivePrice =
    actualLiters > 0 && totalInvoiceAmount > 0
      ? Math.round(totalInvoiceAmount / actualLiters)
      : defaultFuelPrice;

  const { varianceLiters, variancePercent, isOver } = calculateFuelVariance(
    actualLiters,
    quotaLiters
  );
  const { penaltyAmount, savingBonus } = calculateFuelPenaltyAndBonus(
    varianceLiters,
    effectivePrice
  );

  let status: FuelReconciliationItem['status'] = 'Bình thường';
  if (variancePercent > 10) {
    status = 'Lệch bất thường';
  } else if (isOver && varianceLiters > 2) {
    status = 'Vượt định mức';
  } else if (varianceLiters < -2) {
    status = 'Tiết kiệm xăng';
  }

  return {
    vehiclePlate: vehicle.plateNumber,
    driverId: vehicle.driverId,
    driverName: vehicle.driverName,
    team: vehicle.team,
    vehicleType: vehicle.type,
    tonnage: vehicle.tonnage,
    normPer100Km: vehicle.normLitersPer100Km,
    totalKm,
    totalTrips,
    quotaLiters,
    actualLiters,
    varianceLiters,
    variancePercent,
    fuelUnitPrice: effectivePrice,
    actualCost: Math.round(actualLiters * effectivePrice),
    quotaCost: Math.round(quotaLiters * effectivePrice),
    penaltyAmount,
    savingBonus,
    status,
  };
}

/**
 * Tổng hợp số liệu KPI toàn chi nhánh CNKT3
 */
export function calculateBranchSummary(
  reconciliations: FuelReconciliationItem[],
  payrolls: DriverPayrollItem[]
) {
  const totalVehicles = reconciliations.length;
  const totalKm = reconciliations.reduce((s, r) => s + r.totalKm, 0);
  const totalTrips = reconciliations.reduce((s, r) => s + r.totalTrips, 0);
  const totalQuotaLiters = reconciliations.reduce((s, r) => s + r.quotaLiters, 0);
  const totalActualLiters = reconciliations.reduce((s, r) => s + r.actualLiters, 0);
  const totalActualFuelCost = reconciliations.reduce((s, r) => s + r.actualCost, 0);
  const totalPenalties = reconciliations.reduce((s, r) => s + r.penaltyAmount, 0);
  const totalSavings = reconciliations.reduce((s, r) => s + r.savingBonus, 0);

  const overrunCount = reconciliations.filter((r) => r.status === 'Vượt định mức' || r.status === 'Lệch bất thường').length;
  const savingCount = reconciliations.filter((r) => r.status === 'Tiết kiệm xăng').length;
  const normalCount = reconciliations.filter((r) => r.status === 'Bình thường').length;

  const totalPayrollFund = payrolls.reduce((s, p) => s + p.netSalary, 0);
  const totalOperatingCost = totalActualFuelCost + totalPayrollFund;
  const costPerKm = totalKm > 0 ? Math.round(totalOperatingCost / totalKm) : 0;
  const fuelCostPerKm = totalKm > 0 ? Math.round(totalActualFuelCost / totalKm) : 0;

  return {
    totalVehicles,
    totalDrivers: payrolls.length,
    totalKm,
    totalTrips,
    totalQuotaLiters: Number(totalQuotaLiters.toFixed(1)),
    totalActualLiters: Number(totalActualLiters.toFixed(1)),
    varianceLiters: Number((totalActualLiters - totalQuotaLiters).toFixed(1)),
    totalActualFuelCost,
    totalPenalties,
    totalSavings,
    overrunCount,
    savingCount,
    normalCount,
    totalPayrollFund,
    totalOperatingCost,
    costPerKm,
    fuelCostPerKm,
  };
}
