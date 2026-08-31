import React from 'react';
import { 
  CalendarDays, 
  Users, 
  Building2, 
  FileEdit, 
  Printer, 
  Download, 
  Upload, 
  RotateCcw, 
  Search,
  Filter,
  GraduationCap
} from 'lucide-react';
import { FilterDegree, Student, ViewMode } from '../types';

interface HeaderProps {
  students: Student[];
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  filterDegree: FilterDegree;
  onFilterDegreeChange: (degree: FilterDegree) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onOpenAddDrop: () => void;
  onOpenCsvModal: () => void;
  onResetData: () => void;
  onPrint: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  students,
  currentView,
  onViewChange,
  filterDegree,
  onFilterDegreeChange,
  searchTerm,
  onSearchChange,
  onOpenAddDrop,
  onOpenCsvModal,
  onResetData,
  onPrint,
}) => {
  const phDCount = students.filter((s) => s.degree === 'PhD').length;
  const masterCount = students.filter((s) => s.degree === 'Master').length;

  return (
    <header className="bg-[#F9F8F6] border-b-2 border-[#1A1A1A] sticky top-0 z-30 print:hidden">
      {/* Top Main Editorial Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          
          {/* Main Title & Masthead */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#1A1A1A] text-white text-[10px] font-black px-2 py-0.5 tracking-wider rounded-xs">
                SMCL • Spacecraft Mission & Control Lab
              </span>
              <span className="text-[11px] font-bold text-[#1A1A1A]/70">
                우주비행체 임무 및 제어 연구실
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#1A1A1A] leading-none">
              대학원생 수강신청 주간 종합 시간표
            </h1>
            <p className="text-xs font-bold text-[#1A1A1A]/60 mt-1">
              24명 연구원 주간 종합 시간표 • 실시간 수강신청 정정 시스템
            </p>
          </div>

          {/* Right Stats & Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Degree Distribution Masthead */}
            <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-2 border-[#1A1A1A]/20 pl-3 sm:pl-0 sm:pr-4">
              <p className="text-[10px] tracking-wider font-bold text-[#1A1A1A]/60">
                학위 과정별 인원
              </p>
              <p className="text-xl sm:text-2xl font-black leading-none text-[#1A1A1A] mt-0.5">
                {phDCount} <span className="text-xs font-bold text-[#1A1A1A]/50">Ph.D</span> / {masterCount}{' '}
                <span className="text-xs font-bold text-[#1A1A1A]/50">MS.</span>
              </p>
            </div>

            {/* Sync Active Status Badge */}
            <div className="bg-[#E14C27] text-white px-3 py-1.5 flex flex-col justify-center items-center rounded-xs shadow-none border border-[#E14C27]">
              <span className="text-[9px] font-bold tracking-wider leading-tight opacity-90">상태</span>
              <span className="text-[11px] font-black tracking-wider leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                실시간 동기화 중
              </span>
            </div>

            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                id="btn-edit-adddrop"
                onClick={onOpenAddDrop}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-black tracking-wider text-white bg-[#1A1A1A] hover:bg-black border border-[#1A1A1A] rounded-xs transition-colors cursor-pointer"
                title="학생별 수강 과목 추가, 변경, 삭제"
              >
                <FileEdit className="w-3.5 h-3.5 text-[#E14C27]" />
                수강정정 관리
              </button>

              <button
                id="btn-csv-manager"
                onClick={onOpenCsvModal}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold tracking-wider text-[#1A1A1A] bg-white hover:bg-[#F1F0ED] border border-[#1A1A1A] rounded-xs transition-colors cursor-pointer"
                title="CSV 데이터 일괄 붙여넣기 또는 내보내기"
              >
                <Upload className="w-3.5 h-3.5 text-[#1A1A1A]" />
                CSV 데이터 관리
              </button>

              <button
                id="btn-print-view"
                onClick={onPrint}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-bold tracking-wider text-[#1A1A1A] bg-white hover:bg-[#F1F0ED] border border-[#1A1A1A] rounded-xs transition-colors cursor-pointer"
                title="A4 세로 인쇄 및 A4 PDF 다운로드"
              >
                <Printer className="w-3.5 h-3.5 text-[#E14C27]" />
                시간표 인쇄 / PDF
              </button>

              <button
                id="btn-reset-initial"
                onClick={onResetData}
                className="p-2 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F1F0ED] border border-[#1A1A1A]/30 rounded-xs transition-colors cursor-pointer"
                title="초기 수강신청 원본 데이터로 되돌리기"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs & Sub-Navigation Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#1A1A1A]/20">
          
          {/* Navigation View Tabs */}
          <div className="flex items-center bg-[#F1F0ED] border border-[#1A1A1A] p-0.5 rounded-xs">
            <button
              id="tab-timetable"
              onClick={() => onViewChange('TIMETABLE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black tracking-wider transition-all cursor-pointer rounded-xs ${
                currentView === 'TIMETABLE'
                  ? 'bg-[#1A1A1A] text-white shadow-none'
                  : 'text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              주간 종합 시간표
            </button>

            <button
              id="tab-students"
              onClick={() => onViewChange('STUDENTS')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black tracking-wider transition-all cursor-pointer rounded-xs ${
                currentView === 'STUDENTS'
                  ? 'bg-[#1A1A1A] text-white shadow-none'
                  : 'text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              연구원별 시간표
            </button>

            <button
              id="tab-labmatrix"
              onClick={() => onViewChange('LAB_MATRIX')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black tracking-wider transition-all cursor-pointer rounded-xs ${
                currentView === 'LAB_MATRIX'
                  ? 'bg-[#1A1A1A] text-white shadow-none'
                  : 'text-[#1A1A1A] hover:bg-white/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              연구실 재실/수업 상황
            </button>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex items-center gap-2">
            {/* Degree Filter Chips */}
            <div className="flex items-center bg-[#F1F0ED] border border-[#1A1A1A] p-0.5 rounded-xs text-xs">
              <button
                id="filter-all"
                onClick={() => onFilterDegreeChange('ALL')}
                className={`px-2.5 py-1 font-black tracking-wider transition-colors cursor-pointer rounded-xs ${
                  filterDegree === 'ALL'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A] hover:bg-white/50'
                }`}
              >
                전체 ({students.length})
              </button>
              <button
                id="filter-phd"
                onClick={() => onFilterDegreeChange('PhD')}
                className={`px-2.5 py-1 font-black tracking-wider transition-colors flex items-center gap-1 cursor-pointer rounded-xs ${
                  filterDegree === 'PhD'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#1A1A1A] hover:bg-white/50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E14C27]"></span>
                Ph.D ({phDCount})
              </button>
              <button
                id="filter-master"
                onClick={() => onFilterDegreeChange('Master')}
                className={`px-2.5 py-1 font-black tracking-wider transition-colors flex items-center gap-1 cursor-pointer rounded-xs ${
                  filterDegree === 'Master'
                    ? 'bg-[#E14C27] text-white'
                    : 'text-[#1A1A1A] hover:bg-white/50'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]"></span>
                MS. ({masterCount})
              </button>
            </div>

            {/* Student Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="연구원명 / 과목 검색..."
                className="pl-8 pr-2.5 py-1 bg-white border border-[#1A1A1A] rounded-xs text-xs font-bold text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] w-36 sm:w-44"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 hover:text-[#1A1A1A] text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
