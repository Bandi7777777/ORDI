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
      <label className="text-sm mb-1 font-medium">{label}</label>
      <DatePicker
        value={selectedDate}
        onChange={handleChange}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        calendarPosition="bottom-right"
        placeholder="انتخاب تاریخ"
        className="input w-full"
        editable={true}
      />
    </div>
  );
};

export default JalaliDatePicker;
