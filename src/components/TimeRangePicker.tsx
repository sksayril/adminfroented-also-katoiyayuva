import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface TimeRangePickerProps {
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

const convertTo24Hour = (time12h: string): string => {
    const time = time12h.trim();
    const isPM = time.toUpperCase().includes('PM');
    const isAM = time.toUpperCase().includes('AM');
    
    // Extract hours and minutes
    const timeOnly = time.replace(/\s*(AM|PM)/i, '').trim();
    const [hours, minutes = '00'] = timeOnly.split(':');
    
    let hour24 = parseInt(hours, 10);
    
    if (isPM && hour24 !== 12) {
      hour24 += 12;
    } else if (isAM && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const formatTo12Hour = (time24h: string): string => {
    const [hours, minutes] = time24h.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 % 12 || 12;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
};

export default function TimeRangePicker({ value = '', onChange, error, disabled }: TimeRangePickerProps) {
  const parseTimeSlot = (timeSlot: string) => {
    if (timeSlot) {
      const parts = timeSlot.split(' - ');
      if (parts.length === 2) {
        return {
          start: convertTo24Hour(parts[0].trim()),
          end: convertTo24Hour(parts[1].trim()),
        };
      }
    }
    return { start: '00:00', end: '00:00' };
  };

  const initialTimes = parseTimeSlot(value);
  const [startTime, setStartTime] = useState(initialTimes.start);
  const [endTime, setEndTime] = useState(initialTimes.end);

  // Initialize with default value if empty
  useEffect(() => {
    if (!value || value.trim() === '') {
      const defaultFormatted = `${formatTo12Hour('00:00')} - ${formatTo12Hour('00:00')}`;
      onChange(defaultFormatted);
    }
  }, []); // Only run on mount

  // Sync with value prop changes (only when value changes externally)
  useEffect(() => {
    if (value) {
      const parsed = parseTimeSlot(value);
      const currentFormatted = `${formatTo12Hour(startTime)} - ${formatTo12Hour(endTime)}`;
      // Only update if the value prop is different from what we would format
      if (value !== currentFormatted) {
        setStartTime(parsed.start);
        setEndTime(parsed.end);
      }
    }
  }, [value]);

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    const formatted = `${formatTo12Hour(newStartTime)} - ${formatTo12Hour(endTime)}`;
    onChange(formatted);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    const formatted = `${formatTo12Hour(startTime)} - ${formatTo12Hour(newEndTime)}`;
    onChange(formatted);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Start Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              disabled={disabled}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
          </div>
        </div>
        <div className="pt-6">
          <span className="text-gray-400 font-medium">-</span>
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">End Time</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              disabled={disabled}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              } disabled:bg-gray-50 disabled:cursor-not-allowed`}
            />
          </div>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
