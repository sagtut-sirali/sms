import React from 'react';
import { 
  GraduationCap, 
  Users, 
  Home, 
  Laptop, 
  Plus, 
  Upload, 
  RotateCcw,
  CheckCircle2,
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { ActiveTab, TuitionMode } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedModeFilter: 'all' | TuitionMode;
  setSelectedModeFilter: (mode: 'all' | TuitionMode) => void;
  onOpenAddStudent: () => void;
  onOpenRecordFee: () => void;
  onOpenAddTest: () => void;
  onExportData?: () => void;
  onResetData: () => void;
  studentCounts: { total: number; home: number; online: number };
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedModeFilter,
  setSelectedModeFilter,
  onOpenAddStudent,
  onOpenRecordFee,
  onOpenAddTest,
  onExportData,
  onResetData,
  studentCounts,
}) => {
  const tabs = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'students', label: 'Students', count: studentCounts.total },
    { id: 'attendance', label: 'Attendance' },
    { id: 'syllabus', label: 'Syllabus Tracker' },
    { id: 'progress', label: 'Progress & Tests' },
    { id: 'fees', label: 'Fee Records' },
  ];

  return (
    <header className="bg-white text-[#2D3329] border-b border-[#E0E4D9] sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5C6652] flex items-center justify-center shadow-sm text-white font-bold">
              <GraduationCap className="w-6 h-6 text-[#E9EDE0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#2D3329] font-serif flex items-center gap-1.5">
                  Sir Ali Preparations
                </h1>
                <span className="bg-[#E9EDE0] text-[#5C6652] border border-[#DDE4D1] text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Portal
                </span>
              </div>
              <p className="text-xs text-[#707969] font-medium">
                Home Tuitions & Online Academic Management System
              </p>
            </div>
          </div>

          {/* Quick Tuition Mode Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Mode Filter Pill */}
            <div className="inline-flex bg-[#F0F2EA] p-1 rounded-xl border border-[#E0E4D9] text-xs font-medium">
              <button
                id="filter-mode-all-btn"
                onClick={() => setSelectedModeFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedModeFilter === 'all'
                    ? 'bg-[#5C6652] text-white font-semibold shadow-xs'
                    : 'text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0]/60'
                }`}
              >
                All ({studentCounts.total})
              </button>
              <button
                id="filter-mode-home-btn"
                onClick={() => setSelectedModeFilter('home')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedModeFilter === 'home'
                    ? 'bg-[#5C6652] text-white font-semibold shadow-xs'
                    : 'text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0]/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                Home ({studentCounts.home})
              </button>
              <button
                id="filter-mode-online-btn"
                onClick={() => setSelectedModeFilter('online')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedModeFilter === 'online'
                    ? 'bg-[#5C6652] text-white font-semibold shadow-xs'
                    : 'text-[#5C6652] hover:text-[#2D3329] hover:bg-[#E9EDE0]/60'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Online ({studentCounts.online})
              </button>
            </div>

            {/* Quick Action Buttons */}
            <button
              id="header-add-student-btn"
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 bg-[#5C6652] hover:bg-[#4D5644] text-white font-medium text-xs px-3.5 py-2 rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>

            <button
              id="header-record-fee-btn"
              onClick={onOpenRecordFee}
              className="inline-flex items-center gap-1.5 bg-[#F0F2EA] hover:bg-[#E9EDE0] text-[#2D3329] border border-[#E0E4D9] font-medium text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#5C6652]" />
              <span>Record Fee</span>
            </button>

            {/* Data options dropdown/buttons */}
            <div className="flex items-center gap-1 border-l border-[#E0E4D9] pl-2">
              <button
                id="header-reset-btn"
                onClick={onResetData}
                title="Reset sample records"
                className="p-2 text-[#707969] hover:text-[#5C6652] hover:bg-[#F0F2EA] rounded-xl transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto mt-4 pt-2.5 border-t border-[#E0E4D9] scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`relative px-3.5 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'text-[#2D3329] bg-[#E9EDE0] font-semibold'
                    : 'text-[#707969] hover:text-[#2D3329] hover:bg-[#F0F2EA]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    isActive ? 'bg-[#5C6652] text-white' : 'bg-[#E0E4D9] text-[#5C6652]'
                  }`}>
                    {tab.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#5C6652] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
