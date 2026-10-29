import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateQuotaLiters,
  calculateFuelVariance,
  calculateFuelPenaltyAndBonus,
  calculateDriverNetSalary,
  reconcileVehicle,
  calculateBranchSummary,
} from './calculator';
import { Vehicle, RouteLog, FuelInvoice } from '../types/index';

test('calculateQuotaLiters returns correct quota for given km and norm', () => {
  // 1200 km, norm 12 liters/100km -> 144 liters
  const quota = calculateQuotaLiters(1200, 12);
  assert.equal(quota, 144);

  // 0 km -> 0 liters
  assert.equal(calculateQuotaLiters(0, 15), 0);
  assert.equal(calculateQuotaLiters(-50, 15), 0);
});

test('calculateFuelVariance correctly flags over-consumption and savings', () => {
  // Over consumption: Actual 160L, Quota 144L -> +16L, 11.1%
  const over = calculateFuelVariance(160, 144);
  assert.equal(over.varianceLiters, 16);
  assert.equal(over.isOver, true);
  assert.equal(over.variancePercent, 11.1);

  // Saving: Actual 130L, Quota 144L -> -14L
  const save = calculateFuelVariance(130, 144);
  assert.equal(save.varianceLiters, -14);
  assert.equal(save.isOver, false);
});

test('calculateFuelPenaltyAndBonus computes penalty for excess and bonus for savings', () => {
  const price = 21000;
  // Excess 10 liters -> penalty 210,000 VND
  const penalty = calculateFuelPenaltyAndBonus(10, price);
  assert.equal(penalty.penaltyAmount, 210000);
  assert.equal(penalty.savingBonus, 0);

  // Saved 10 liters at 50% reward rate -> bonus 105,000 VND
  const bonus = calculateFuelPenaltyAndBonus(-10, price, 0.5);
  assert.equal(bonus.penaltyAmount, 0);
  assert.equal(bonus.savingBonus, 105000);
});

test('calculateDriverNetSalary aggregates earnings and deducts fuel penalty accurately', () => {
  const net = calculateDriverNetSalary({
    baseSalary: 6000000,
    tripAllowance: 2500000,
    kmAllowance: 1200000,
    phoneAllowance: 300000,
    mealAllowance: 650000,
    fuelPenalty: 420000, // Truy thu xăng dầu vượt định mức
    fuelSavingBonus: 0,
    otherBonus: 200000,
    otherDeductions: 500000, // BHXH, công đoàn
  });
  // 6000000 + 2500000 + 1200000 + 300000 + 650000 + 200000 = 10,850,000 gross
  // deductions: 420,000 + 500,000 = 920,000
  // net: 10,850,000 - 920,000 = 9,930,000
  assert.equal(net, 9930000);
});

test('reconcileVehicle integrates route logs and fuel invoices correctly', () => {
  const mockVehicle: Vehicle = {
    id: 'v1',
    plateNumber: '29H-123.45',
    type: 'Isuzu QKR 2.4T',
    tonnage: 2.4,
    fuelType: 'Diesel',
    normLitersPer100Km: 12,
    team: 'Đội xe Nội tỉnh 1',
    driverId: 'd1',
    driverName: 'Nguyễn Văn Hùng',
    odoStartMonth: 45000,
    odoCurrent: 46200,
    status: 'Hoạt động tốt',
  };

  const logs: RouteLog[] = [
    {
      id: 'l1',
      logCode: 'LT-001',
      date: '2026-10-05',
      vehiclePlate: '29H-123.45',
      driverId: 'd1',
      driverName: 'Nguyễn Văn Hùng',
      routeType: 'Nội thành',
      routeName: 'HUB Mê Linh -> Bưu cục Đống Đa',
      kmStart: 45000,
      kmEnd: 45600,
      kmTraveled: 600,
      tripCount: 6,
      status: 'Khớp dữ liệu',
    },
    {
      id: 'l2',
      logCode: 'LT-002',
      date: '2026-10-15',
      vehiclePlate: '29H-123.45',
      driverId: 'd1',
      driverName: 'Nguyễn Văn Hùng',
      routeType: 'Nội thành',
      routeName: 'HUB Mê Linh -> Bưu cục Cầu Giấy',
      kmStart: 45600,
      kmEnd: 46200,
      kmTraveled: 600,
      tripCount: 6,
      status: 'Khớp dữ liệu',
    },
  ];

  const invoices: FuelInvoice[] = [
    {
      id: 'i1',
      invoiceNumber: 'HĐ-89211',
      date: '2026-10-06',
      vehiclePlate: '29H-123.45',
      driverName: 'Nguyễn Văn Hùng',
      stationName: 'Petrolimex CHXD 15',
      fuelType: 'Diesel',
      quantityLiters: 80,
      unitPrice: 21000,
      totalAmount: 1680000,
      matchedWithRoute: true,
    },
    {
      id: 'i2',
      invoiceNumber: 'HĐ-89422',
      date: '2026-10-18',
      vehiclePlate: '29H-123.45',
      driverName: 'Nguyễn Văn Hùng',
      stationName: 'Petrolimex CHXD 15',
      fuelType: 'Diesel',
      quantityLiters: 80,
      unitPrice: 21000,
      totalAmount: 1680000,
      matchedWithRoute: true,
    },
  ];

  // Total km: 1200 km, norm 12L/100km -> Quota: 144L
  // Actual Liters: 160L -> Variance: +16L (over quota, variance % = 16/144 = 11.1% -> Lệch bất thường)
  const result = reconcileVehicle(mockVehicle, logs, invoices);
  assert.equal(result.totalKm, 1200);
  assert.equal(result.quotaLiters, 144);
  assert.equal(result.actualLiters, 160);
  assert.equal(result.varianceLiters, 16);
  assert.equal(result.penaltyAmount, 16 * 21000);
  assert.equal(result.status, 'Lệch bất thường');
});
