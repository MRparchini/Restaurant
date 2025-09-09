// // holiday.ts
// // export type RoundingMode = 'none' | 'up' | 'down' | 'nearest';

// export interface RegularInput {
//   startDate: string | Date;          // تاریخ شروع اشتغال در این سال مرخصی
//   endDate?: string | Date;           // تاریخ ترک کار در این سال مرخصی (اختیاری). اگر ندهید تا انتهای سال مرخصی محاسبه می‌شود.
//   weeklyHours: number;               // ساعات کار در هفته (مثلاً 40)
//   workingDaysPerWeek: number;        // تعداد روز کار در هفته (1..7)
//   leaveYearStartMonth?: number;      // شروع سال مرخصی (ماه). پیش‌فرض: 1 (ژانویه)
//   leaveYearStartDay?: number;        // شروع سال مرخصی (روز). پیش‌فرض: 1
//   roundingMode?: RoundingMode;       // پیش‌فرض: 'nearest'
//   roundingIncrementMinutes?: number; // گِردکردن به مضرب چند دقیقه؟ پیش‌فرض: 30
// }

// export interface IrregularInput {
//   hoursWorkedInPeriod: number;       // مجموع ساعات کارشده در همان دوره پرداخت
//   weeksEntitlement?: number;         // پیش‌فرض 5.6 هفته (حداقل قانونی). اگر قرارداداً بیشتر دارید این را افزایش دهید.
//   roundingMode?: RoundingMode;       // مشابه بالا
//   roundingIncrementMinutes?: number; // مشابه بالا
// }

// export function calcHolidayHoursRegular(input: RegularInput): number {
//   const {
//     startDate, endDate,
//     weeklyHours,
//     workingDaysPerWeek,
//     leaveYearStartMonth = 1,
//     leaveYearStartDay = 1,
//     roundingMode = 'nearest',
//     roundingIncrementMinutes = 30,
//   } = input;

//   if (weeklyHours <= 0) return 0;
//   if (workingDaysPerWeek <= 0 || workingDaysPerWeek > 7) throw new Error('workingDaysPerWeek باید بین 1 تا 7 باشد');

//   // تاریخ‌ها به UTC بدون زمان
//   const toUTCDate = (d: string | Date) => {
//     const dt = (d instanceof Date) ? d : new Date(d);
//     return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate()));
//   };

//   // مرزهای سال مرخصیِ حاوی start/end
//   const start = toUTCDate(startDate);
//   const end = toUTCDate(endDate ?? start); // موقت؛ بعداً با پایان سال مرخصی جایگزین می‌شود

//   // پیدا کردن سال مرخصیِ متناظر با start
//   const lyStartFor = (ref: Date) => {
//     const y = ref.getUTCFullYear();
//     const candidate = new Date(Date.UTC(y, leaveYearStartMonth - 1, leaveYearStartDay));
//     return (ref < candidate)
//       ? new Date(Date.UTC(y - 1, leaveYearStartMonth - 1, leaveYearStartDay))
//       : candidate;
//   };
//   const leaveYearStart = lyStartFor(start);
//   const leaveYearEnd = new Date(Date.UTC(leaveYearStart.getUTCFullYear() + 1, leaveYearStart.getUTCMonth(), leaveYearStart.getUTCDate()));

//   // اگر endDate داده نشده بود تا انتهای سال مرخصی محاسبه کن
//   const effectiveEnd = (endDate ? end : leaveYearEnd) < leaveYearEnd ? (endDate ? end : leaveYearEnd) : leaveYearEnd;

//   // بازه هم‌پوشان اشتغال با سال مرخصی
//   const overlapStart = (start < leaveYearStart) ? leaveYearStart : start;
//   const overlapEnd = (effectiveEnd > leaveYearEnd) ? leaveYearEnd : effectiveEnd;

//   if (overlapEnd <= overlapStart) return 0;

//   const daysBetween = (a: Date, b: Date) => Math.floor((b.getTime() - a.getTime()) / (24 * 3600 * 1000));
//   const overlapDays = daysBetween(overlapStart, overlapEnd);
//   const leaveYearDays = daysBetween(leaveYearStart, leaveYearEnd); // 365 یا 366

//   // محاسبه سالانه (سقف 28 روز اعمال می‌شود)
//   const avgHoursPerDay = weeklyHours / workingDaysPerWeek;
//   const annualHoursByWeeks = 5.6 * weeklyHours;
//   const annualHoursByCap = 28 * avgHoursPerDay; // سقف 28 روز
//   const annualEntitlementHours = Math.min(annualHoursByWeeks, annualHoursByCap);

//   // پرو-راتا
//   const prorated = annualEntitlementHours * (overlapDays / leaveYearDays);

//   return roundHours(prorated, roundingMode, roundingIncrementMinutes);
// }

// export function calcHolidayHoursIrregular(input: IrregularInput): number {
//   const {
//     hoursWorkedInPeriod,
//     weeksEntitlement = 5.6,
//     roundingMode = 'nearest',
//     roundingIncrementMinutes = 30,
//   } = input;

//   if (hoursWorkedInPeriod <= 0) return 0;

//   // درصد انباشت طبق اصلاحات 2024: weeks / (52 - weeks)
//   const accrualRate = weeksEntitlement / (52 - weeksEntitlement); // 5.6/46.4 = 0.120689...
//   const hours = hoursWorkedInPeriod * accrualRate;

//   return roundHours(hours, roundingMode, roundingIncrementMinutes);
// }

// // --- Helpers ---
// // function roundHours(hours: number, mode: RoundingMode, incrementMinutes: number): number {
// //   if (mode === 'none') return hours;
// //   const incHrs = (incrementMinutes > 0 ? incrementMinutes : 30) / 60;
// //   const factor = 1 / incHrs;
// //   const v = hours * factor;
// //   if (mode === 'up') return Math.ceil(v) / factor;
// //   if (mode === 'down') return Math.floor(v) / factor;
// //   // nearest
// //   return Math.round(v) / factor;
// // }



// //new rate of calculation

// // calcStatutoryHolidayHours.ts

// export type RoundingMode = 'none' | 'up' | 'down' | 'nearest';

// export interface Input {
//   employmentStart: string | Date;    // تاریخ شروع در همان سال مرخصی
//   employmentEnd:   string | Date;    // تاریخ پایان (یا آخرین روز محاسبه)
//   weeklyHours: number;               // ساعات کار در هفته (مثلاً 40)
//   daysPerWeek: number;               // روزهای کار در هفته (1..7)
//   // اگر سال مرخصی شما Jan–Dec نیست، این دو مقدار را ست کنید:
//   leaveYearStartMonth?: number;      // پیش‌فرض: 1 (ژانویه)
//   leaveYearStartDay?: number;        // پیش‌فرض: 1
//   roundingMode?: RoundingMode;       // پیش‌فرض: 'nearest'
//   roundToMinutes?: number;           // پیش‌فرض: 30 (به مضرب 30 دقیقه گرد می‌کند)
//   // اگر قرارداداً بیش از حداقل قانونی می‌دهید، می‌توانید افزایش دهید:
//   contractualWeeksPerYear?: number;  // پیش‌فرض: 5.6 (حداقل قانونی)
//   capDaysPerYear?: number;           // پیش‌فرض: 28 (سقف قانونی بر مبنای روز)
// }

// export function calcStatutoryHolidayHours(input: Input): number {
//   const {
//     employmentStart, employmentEnd,
//     weeklyHours, daysPerWeek,
//     leaveYearStartMonth = 1,
//     leaveYearStartDay = 1,
//     roundingMode = 'nearest',
//     roundToMinutes = 30,
//     contractualWeeksPerYear = 5.6, // حداقل قانونی
//     capDaysPerYear = 28,           // سقف قانونی
//   } = input;

//   if (weeklyHours <= 0) return 0;
//   if (!(daysPerWeek >= 1 && daysPerWeek <= 7)) throw new Error('daysPerWeek باید بین 1 تا 7 باشد');

//   // نرمال‌سازی تاریخ‌ها به UTC (بدون ساعت)
//   const toUTC = (d: string | Date) => {
//     const x = (d instanceof Date) ? d : new Date(d);
//     return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
//   };
//   const start = toUTC(employmentStart);
//   const end   = toUTC(employmentEnd);
//   if (end < start) throw new Error('employmentEnd نباید قبل از employmentStart باشد');

//   // مرزهای «سال مرخصی» شامل start
//   const lyStartFor = (ref: Date) => {
//     const y = ref.getUTCFullYear();
//     const candidate = new Date(Date.UTC(y, leaveYearStartMonth - 1, leaveYearStartDay));
//     return (ref < candidate)
//       ? new Date(Date.UTC(y - 1, leaveYearStartMonth - 1, leaveYearStartDay))
//       : candidate;
//   };
//   const leaveYearStart = lyStartFor(start);
//   const leaveYearEnd = new Date(Date.UTC(
//     leaveYearStart.getUTCFullYear() + 1,
//     leaveYearStart.getUTCMonth(),
//     leaveYearStart.getUTCDate()
//   ));
//   // بازهٔ مؤثر = هم‌پوشانی بازهٔ اشتغال با همان سال مرخصی
//   const overlapStart = start < leaveYearStart ? leaveYearStart : start;
//   const overlapEnd   = end   > leaveYearEnd   ? leaveYearEnd   : end;
//   // اگر بازه بیرون این سال مرخصی است، چیزی برای محاسبه نداریم
//   if (overlapEnd < overlapStart) return 0;

//   const msDay = 24 * 3600 * 1000;
//   const daysBetweenInclusive = (a: Date, b: Date) =>
//     Math.floor((b.getTime() - a.getTime()) / msDay) + 1;

//   const overlapDays = daysBetweenInclusive(overlapStart, overlapEnd);
//   const leaveYearDays = daysBetweenInclusive(leaveYearStart, new Date(leaveYearEnd.getTime() - msDay)); // 365 یا 366

//   // میانگین ساعت روزانهٔ کارمند از قرارداد خودش:
//   const avgDailyHours = weeklyHours / daysPerWeek;

//   // «حق سال کامل» بر حسب ساعت، با اعمال سقف 28 روزِ «میانگین روز کاری»
//   const annualHoursByWeeks = contractualWeeksPerYear * weeklyHours;
//   const annualHoursByCap   = capDaysPerYear * avgDailyHours;
//   const annualEntitlementHours = Math.min(annualHoursByWeeks, annualHoursByCap);

//   // پرو-راتا بر اساس تعداد «روزهای اشتغال» در همان سال مرخصی
//   const proratedHours = annualEntitlementHours * (overlapDays / leaveYearDays);

//   return roundHours(proratedHours, roundingMode, roundToMinutes);
// }

// // --- Helper ---
// function roundHours(hours: number, mode: RoundingMode, incMinutes: number): number {
//   if (mode === 'none') return hours;
//   const step = (incMinutes > 0 ? incMinutes : 30) / 60;
//   const units = hours / step;
//   if (mode === 'up')      return Math.ceil(units) * step;
//   if (mode === 'down')    return Math.floor(units) * step;
//   /* nearest */           return Math.round(units) * step;
// }


// ukHoliday.ts
export type RoundingMode = 'none' | 'nearest' | 'up' | 'down';

export interface CalcInput {
  employmentStart: string | Date; // تاریخ شروع اشتغال (شمسی ندهید؛ ISO/Date)
  employmentEnd:   string | Date; // آخرین روز اشتغال (شامل همان روز)
  weeklyHours: number;            // ساعات کار هفتگی، مثل 40
  daysPerWeek: number;            // روزهای کار در هفته، 1..7
  // اگر سال مرخصی شما Jan–Dec نیست این دو را ست کنید:
  leaveYearStartMonth?: number;   // پیش‌فرض 1 (ژانویه)
  leaveYearStartDay?: number;     // پیش‌فرض 1
  // اختیاری:
  rounding?: RoundingMode;        // پیش‌فرض 'nearest'
  roundToMinutes?: number;        // پیش‌فرض 30
  // اگر قرارداداً بیش از حداقل می‌دهید:
  contractualWeeksPerYear?: number; // پیش‌فرض 5.6 (حداقل قانونی)
  capDaysPerYear?: number;          // پیش‌فرض 28 (سقف قانونی به روز)
}

export function calcUKHolidayHours(input: CalcInput): number {
  const {
    employmentStart, employmentEnd,
    weeklyHours, daysPerWeek,
    leaveYearStartMonth = 1,
    leaveYearStartDay = 1,
    rounding = 'nearest',
    roundToMinutes = 30,
    contractualWeeksPerYear = 5.6,
    capDaysPerYear = 28,
  } = input;

  if (weeklyHours <= 0) return 0;
  if (!(daysPerWeek >= 1 && daysPerWeek <= 7)) {
    throw new Error('daysPerWeek باید بین 1 تا 7 باشد');
  }

  // تاریخ‌ها به UTC (روز-محور)
  const toUTC = (d: string | Date) => {
    const x = d instanceof Date ? d : new Date(d);
    return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()));
  };
  const startInc = toUTC(employmentStart);
  const endInc   = toUTC(employmentEnd);
  if (endInc < startInc) throw new Error('employmentEnd نباید قبل از employmentStart باشد');

  // دوره‌ها را به بازه‌های سال مرخصی می‌بُریم
  const msDay = 24 * 3600 * 1000;
  const endEx = new Date(endInc.getTime() + msDay); // انتها را نیم-باز می‌کنیم [start, end)
  const avgDailyHours = weeklyHours / daysPerWeek;

  // حق سال کامل (ساعت) با سقف 28 "روزِ میانگین کاری"
  const fullYearHours = Math.min(
    contractualWeeksPerYear * weeklyHours,
    capDaysPerYear * avgDailyHours
  );

  // اولین شروع سال مرخصی که startInc داخل آن است
  const lyStartFor = (ref: Date) => {
    const y = ref.getUTCFullYear();
    const candidate = new Date(Date.UTC(y, leaveYearStartMonth - 1, leaveYearStartDay));
    return ref < candidate
      ? new Date(Date.UTC(y - 1, leaveYearStartMonth - 1, leaveYearStartDay))
      : candidate;
  };

  let total = 0;
  let lyStart = lyStartFor(startInc);

  while (lyStart < endEx) {
    const lyEnd = new Date(Date.UTC(lyStart.getUTCFullYear() + 1, lyStart.getUTCMonth(), lyStart.getUTCDate())); // [lyStart, lyEnd)
    const segStart = startInc > lyStart ? startInc : lyStart;
    const segEnd   = endEx   < lyEnd   ? endEx   : lyEnd;

    if (segEnd > segStart) {
      const segDays   = (segEnd.getTime() - segStart.getTime()) / msDay;      // نیم-باز
      const yearDays  = (lyEnd.getTime() - lyStart.getTime()) / msDay;         // 365 یا 366
      total += fullYearHours * (segDays / yearDays);
    }
    lyStart = new Date(Date.UTC(lyStart.getUTCFullYear() + 1, lyStart.getUTCMonth(), lyStart.getUTCDate()));
  }

  return roundHours(total, rounding, roundToMinutes);
}

// --- Helpers ---
function roundHours(hours: number, mode: RoundingMode, incMin: number): number {
  if (mode === 'none') return hours;
  const step = Math.max(1, incMin || 30) / 60; // به ساعت
  const u = hours / step;
  if (mode === 'up')      return Math.ceil(u) * step;
  if (mode === 'down')    return Math.floor(u) * step;
  /* nearest */           return Math.round(u) * step;
}
