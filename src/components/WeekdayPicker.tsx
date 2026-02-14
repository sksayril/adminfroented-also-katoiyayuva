import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

interface WeekdayPickerProps {
  value: string[];
  onChange: (weekdays: string[]) => void;
  error?: string;
  disabled?: boolean;
}

const WEEKDAYS = [
  { value: 'Sunday', label: 'Sun', short: 'S' },
  { value: 'Monday', label: 'Mon', short: 'M' },
  { value: 'Tuesday', label: 'Tue', short: 'T' },
  { value: 'Wednesday', label: 'Wed', short: 'W' },
  { value: 'Thursday', label: 'Thu', short: 'T' },
  { value: 'Friday', label: 'Fri', short: 'F' },
  { value: 'Saturday', label: 'Sat', short: 'S' },
];

export default function WeekdayPicker({ value = [], onChange, error, disabled }: WeekdayPickerProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(value);

  // Sync with value prop changes
  useEffect(() => {
    setSelectedDays(value || []);
  }, [value]);

  const toggleDay = (day: string) => {
    if (disabled) return;
    
    const newSelected = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelected);
    onChange(newSelected);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-500" />
        <label className="block text-xs text-gray-600">Select Weekdays</label>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day.value);
          return (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              disabled={disabled}
              className={`
                aspect-square rounded-lg font-semibold text-sm transition-all duration-200
                ${isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/50 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
              title={day.value}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-bold">{day.short}</span>
                <span className="text-[10px] opacity-75">{day.label}</span>
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedDays.length > 0 && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Selected: </span>
          <span className="text-blue-600">
            {selectedDays
              .sort((a, b) => {
                const order = WEEKDAYS.map((d) => d.value);
                return order.indexOf(a) - order.indexOf(b);
              })
              .join(', ')}
          </span>
        </div>
      )}
      
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
