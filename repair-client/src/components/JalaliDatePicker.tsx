import React, { useState, useRef, useEffect } from "react";
import moment, { Moment } from "moment-jalaali";
import { formatJalaliDate } from "../utils/format";

// اطمینان از فعال بودن تقویم جلالی
moment.loadPersian({
  usePersianDigits: false,
  dialect: "persian-modern",
});

type Props = {
  label: string;
  value: string; // مقدار تاریخ به صورت ISO (میلادی، مثلا 2025-11-14)
  onChange: (iso: string) => void;
};

const JalaliDatePicker: React.FC<Props> = ({ label, value, onChange }) => {
  const [open, setOpen] = useState(false);

  // محاسبه ماه جاری تقویم (بر اساس تاریخ انتخاب‌شده یا امروز)
  const initialMoment: Moment = value
    ? moment(value, "YYYY-MM-DD")
    : moment(); // اگر value خالی بود، امروز

  const [current, setCurrent] = useState<Moment>(initialMoment); // لحظهٔ فعلی (جلالی)

  const containerRef = useRef<HTMLDivElement>(null);

  // بروزرسانی ماه جاری هنگام تغییر prop value بیرونی
  useEffect(() => {
    if (value) {
      setCurrent(moment(value, "YYYY-MM-DD"));
    }
  }, [value]);

  // بستن پنل هنگام کلیک خارج از آن
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // انتخاب روز از تقویم
  const handleSelectDay = (day: number) => {
    const jYear = current.format("jYYYY");
    const jMonth = current.format("jM");
    const jDayStr = day.toString().padStart(2, "0");

    // تبدیل تاریخ شمسی به میلادی ISO (YYYY-MM-DD)
    const gregorian = moment(
      `${jYear}/${jMonth}/${jDayStr}`,
      "jYYYY/jM/jD"
    ).format("YYYY-MM-DD");

    onChange(gregorian);
    setOpen(false);
  };

  // ماه قبلی / بعدی (بر اساس ماه شمسی)
  const prevMonth = () => {
    setCurrent((prev) => moment(prev).subtract(1, "jMonth"));
  };

  const nextMonth = () => {
    setCurrent((prev) => moment(prev).add(1, "jMonth"));
  };

  // محاسبه نام ماه و سال شمسی جاری برای هدر
  const currentJYear = current.format("jYYYY");
  const currentJMonthName = current.format("jMMMM");

  // محاسبه تعداد روزهای ماه جاری (با استفاده از تابع استاتیک jDaysInMonth)
  const jYearNum = parseInt(current.format("jYYYY"), 10);
  const jMonthNum = parseInt(current.format("jM"), 10) - 1; // ماه‌ها در jDaysInMonth از 0 تا 11 هستند
  const daysInMonth = moment.jDaysInMonth(jYearNum, jMonthNum);

  // اولین روز ماه شمسی
  const firstDayOfMonth = moment(current).startOf("jMonth");
  const startDayOfWeek = firstDayOfMonth.day();

  // آفست از شنبه (شروع هفته در تقویم شمسی)
  const offset = (startDayOfWeek + 1) % 7;

  // حروف ایام هفته (شنبه تا جمعه)
  const weekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  // مقدار قابل نمایش در input (فرمت جلالی زیبا)
  const displayValue = value ? formatJalaliDate(value) : "";

  return (
    <div
      className="relative flex flex-col"
      ref={containerRef}
      style={{ direction: "rtl" }}
    >
      <label className="text-sm mb-1 font-medium">{label}</label>

      <input
        type="text"
        className="input w-full cursor-pointer"
        readOnly
        placeholder="انتخاب تاریخ"
        value={displayValue}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
      />

      {open && (
        <div className="select-portal card p-3 mt-1">
          {/* هدر ماه/سال و ناوبری */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              className="btn btn-ghost px-2 py-1 text-sm"
              onClick={prevMonth}
            >
              ‹
            </button>
            <span className="font-medium">
              {currentJMonthName} {currentJYear}
            </span>
            <button
              type="button"
              className="btn btn-ghost px-2 py-1 text-sm"
              onClick={nextMonth}
            >
              ›
            </button>
          </div>

          {/* عناوین ایام هفته */}
          <div className="grid grid-cols-7 text-xs text-center opacity-75 mb-1">
            {weekDays.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* شبکه روزها */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* خانه‌های خالی ابتدای ماه */}
            {Array.from({ length: offset }).map((_, idx) => (
              <div key={`empty-${idx}`} />
            ))}

            {/* روزهای ماه */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;

              const isSelected =
                !!value &&
                dayNum ===
                  parseInt(
                    moment(value, "YYYY-MM-DD").format("jD"),
                    10
                  ) &&
                current.format("jYYYY/jM") ===
                  moment(value, "YYYY-MM-DD").format("jYYYY/jM");

              return (
                <div
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`py-1 rounded-full cursor-pointer ${
                    isSelected
                      ? "selected-day"
                      : "hover:bg-[rgba(255,255,255,0.1)]"
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default JalaliDatePicker;
