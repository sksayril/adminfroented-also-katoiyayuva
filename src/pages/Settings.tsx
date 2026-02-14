import { useState } from 'react';
import { Settings as SettingsIcon, Palette, Moon, Sun, Sparkles, Droplet, Zap } from 'lucide-react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: React.ReactNode; gradient: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="w-5 h-5" />,
      gradient: 'from-gray-100 to-gray-200',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: <Moon className="w-5 h-5" />,
      gradient: 'from-slate-800 to-slate-900',
    },
    {
      value: 'blue',
      label: 'Blue',
      icon: <Droplet className="w-5 h-5" />,
      gradient: 'from-blue-600 to-blue-800',
    },
    {
      value: 'green',
      label: 'Green',
      icon: <Sparkles className="w-5 h-5" />,
      gradient: 'from-green-600 to-green-800',
    },
    {
      value: 'purple',
      label: 'Purple',
      icon: <Zap className="w-5 h-5" />,
      gradient: 'from-purple-600 to-purple-800',
    },
  ];

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    toast.success(`Theme changed to ${themes.find(t => t.value === newTheme)?.label}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-blue-600" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">Customize your application preferences</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Theme Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Color Theme</h2>
              <p className="text-sm text-gray-600">Choose your preferred color scheme</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {themes.map((themeOption) => (
              <button
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                  theme === themeOption.value
                    ? 'border-blue-500 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${themeOption.gradient} mb-3 flex items-center justify-center text-white`}>
                  {themeOption.icon}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-800">{themeOption.label}</p>
                  {theme === themeOption.value && (
                    <p className="text-xs text-blue-600 mt-1 font-medium">Active</p>
                  )}
                </div>
                {theme === themeOption.value && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Preview */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              theme === 'light' ? 'bg-gray-50 border-gray-200' :
              theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' :
              theme === 'blue' ? 'bg-blue-50 border-blue-200' :
              theme === 'green' ? 'bg-green-50 border-green-200' :
              'bg-purple-50 border-purple-200'
            }`}>
              <h4 className="font-semibold mb-2">Card Example</h4>
              <p className="text-sm opacity-80">This is how cards will look with your selected theme.</p>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              theme === 'light' ? 'bg-white border-gray-300' :
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' :
              theme === 'blue' ? 'bg-blue-100 border-blue-300' :
              theme === 'green' ? 'bg-green-100 border-green-300' :
              'bg-purple-100 border-purple-300'
            }`}>
              <h4 className="font-semibold mb-2">Button Example</h4>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === 'light' ? 'bg-blue-600 text-white' :
                theme === 'dark' ? 'bg-blue-500 text-white' :
                theme === 'blue' ? 'bg-blue-600 text-white' :
                theme === 'green' ? 'bg-green-600 text-white' :
                'bg-purple-600 text-white'
              }`}>
                Click Me
              </button>
            </div>
            <div className={`p-4 rounded-lg border-2 ${
              theme === 'light' ? 'bg-gray-100 border-gray-200' :
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' :
              theme === 'blue' ? 'bg-blue-900/20 border-blue-400/30' :
              theme === 'green' ? 'bg-green-900/20 border-green-400/30' :
              'bg-purple-900/20 border-purple-400/30'
            }`}>
              <h4 className="font-semibold mb-2">Accent Example</h4>
              <div className={`w-full h-2 rounded-full ${
                theme === 'light' ? 'bg-blue-500' :
                theme === 'dark' ? 'bg-blue-400' :
                theme === 'blue' ? 'bg-blue-500' :
                theme === 'green' ? 'bg-green-500' :
                'bg-purple-500'
              }`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
