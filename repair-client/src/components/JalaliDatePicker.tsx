import React from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import moment from 'moment-jalaali';

type Props = {
  label: string;
  value: string; // ISO string (میلادی)
  onChange: (iso: string) => void; // خروجی ISO میلادی
};

const JalaliDatePicker: React.FC<Props> = ({ label, value, onChange }) => {
  const selectedDate = value ? moment(value).format('jYYYY/jMM/jDD') : '';

  const handleChange = (date: any) => {
    if (date) {
      const gregorianDate = moment(date.format('jYYYY/jMM/jDD'), 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
      onChange(gregorianDate);
    } else {
      onChange('');
    }
  };

  return (
    <div className="flex flex-col" style={{ direction: 'rtl' }}>
      <label className="text-sm mb-1 text-gray-700 dark:text-gray-300 font-medium">{label}</label>
      <DatePicker
        value={selectedDate}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        calendarPosition="bottom-right"
        placeholder="انتخاب تاریخ"
        className="input px-4 py-3 w-full flex items-center justify-between text-base font-medium rounded-xl shadow-sm hover:shadow-md border border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        editable={true}
      />
    </div>
  );
};

export default JalaliDatePicker;