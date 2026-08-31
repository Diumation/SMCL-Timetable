import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  User, 
  Sparkles, 
  Info,
  BookOpen,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { FilterDegree, Student, TimetableBlockItem } from '../types';
import { CATEGORY_COLORS } from '../utils/colorUtils';
import { buildTimetableBlocks, layoutDayBlocks, DAYS, START_HOUR, TOTAL_HOURS, PositionedBlockItem } from '../utils/timeUtils';

interface MasterTimetableProps {
  students: Student[];
  filterDegree: FilterDegree;
  onFilterDegreeChange?: (degree: FilterDegree) => void;
  searchTerm: string;
  onSelectStudent: (studentId: string) => void;
  onEditCourse: (courseCode: string, courseName: string) => void;
}

export const MasterTimetable: React.FC<MasterTimetableProps> = ({
  students,
  filterDegree,
  onFilterDegreeChange,
  searchTerm,
  onSelectStudent,
  onEditCourse,
}) => {
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<TimetableBlockItem | null>(null);
  const [duplicateFilter, setDuplicateFilter] = useState<string | null>(null);

  // Filter students based on the active filterDegree (Ph.D vs MS. vs ALL)
  const filteredStudents = useMemo(() => {
    if (filterDegree === 'ALL') return students;
    return students.filter((s) => s.degree === filterDegree);
  }, [students, filterDegree]);

  // Generate all timetable blocks based on filtered students
  const allBlocks = useMemo(() => buildTimetableBlocks(filteredStudents), [filteredStudents]);

  // Find courses that share the exact same course name but have different time slots
  const multiSectionCourses = useMemo(() => {
    const nameTimeMap = new Map<string, Set<string>>();
    allBlocks.forEach((b) => {
      const times = nameTimeMap.get(b.courseName) || new Set<string>();
      times.add(b.timeString);
      nameTimeMap.set(b.courseName, times);
    });

    const multi = new Map<string, string[]>();
    nameTimeMap.forEach((times, name) => {
      if (times.size > 1) {
        multi.set(name, Array.from(times));
      }
    });
    return multi;
  }, [allBlocks]);

  // Hours array [9, 10, 11, 12, 13, 14, 15, 16, 17]
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // Calculate research credits & no-coursework students for filtered list
  const researchOnlyStudents = useMemo(() => {
    return filteredStudents.filter(
      (s) => s.courses.every((c) => c.isResearch || !c.timeString || c.timeString === '-')
    );
  }, [filteredStudents]);

  return (
    <div className="space-y-4">
      {/* Top Filter Bar: Interactive Standardized Degree Legend Buttons & Section filter */}
      <div className="bg-[#F1F0ED] p-3 border-2 border-[#1A1A1A] rounded-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-[#1A1A1A] tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#E14C27]" />
            학위 과정 필터
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onFilterDegreeChange && onFilterDegreeChange('ALL')}
              className={`px-2.5 py-1 text-[10px] font-black rounded-xs border cursor-pointer transition-all ${
                filterDegree === 'ALL'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/30 hover:text-[#1A1A1A]'
              }`}
            >
              전체 ({students.length}명)
            </button>
            <button
              onClick={() => onFilterDegreeChange && onFilterDegreeChange(filterDegree === 'PhD' ? 'ALL' : 'PhD')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-xs border cursor-pointer transition-all ${
                filterDegree === 'PhD'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] ring-2 ring-[#E14C27]'
                  : 'bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/30 hover:text-[#1A1A1A]'
              }`}
              title="클릭 시 Ph.D(박사과정) 학생 및 수업만 보기"
            >
              <span className="w-1.5 h-1.5 bg-[#E14C27] rounded-full"></span>
              Ph.D ({students.filter((s) => s.degree === 'PhD').length}명)
            </button>
            <button
              onClick={() => onFilterDegreeChange && onFilterDegreeChange(filterDegree === 'Master' ? 'ALL' : 'Master')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-xs border cursor-pointer transition-all ${
                filterDegree === 'Master'
                  ? 'bg-[#E14C27] text-white border-[#c93f1d] ring-2 ring-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/30 hover:text-[#1A1A1A]'
              }`}
              title="클릭 시 MS.(석사과정) 학생 및 수업만 보기"
            >
              <span className="w-1.5 h-1.5 bg-[#E14C27] rounded-full"></span>
              MS. ({students.filter((s) => s.degree === 'Master').length}명)
            </button>
          </div>
        </div>

        {/* 동일 교과목 다중 분반/시간대 알림 바 (존재할 경우에만 표시) */}
        {multiSectionCourses.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <span className="font-bold text-[#1A1A1A]">동일 과목명 분반:</span>
            {Array.from(multiSectionCourses.entries()).map(([courseName, times]) => (
              <button
                key={courseName}
                onClick={() => setDuplicateFilter(duplicateFilter === courseName ? null : courseName)}
                className={`px-2 py-0.5 rounded-xs font-black tracking-wide transition-colors cursor-pointer border ${
                  duplicateFilter === courseName 
                    ? 'bg-[#E14C27] text-white border-[#E14C27]' 
                    : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
                }`}
              >
                {courseName} ({times.length}개 시간대)
              </button>
            ))}
            {duplicateFilter && (
              <button
                onClick={() => setDuplicateFilter(null)}
                className="text-[9px] font-black text-[#E14C27] hover:underline cursor-pointer"
              >
                필터 해제 ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Weekly Timetable Container */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-xs shadow-none overflow-x-auto">
        <div className="min-w-[960px]">
          {/* Table Header: Days of the week (5일 균등 분할) */}
          <div className="flex border-b-2 border-[#1A1A1A] bg-[#1A1A1A] text-white sticky top-0 z-20">
            {/* Time Header */}
            <div className="w-16 shrink-0 py-2.5 px-1 text-center text-[11px] font-black tracking-wider border-r border-white/20">
              시간
            </div>

            {/* 5 Day Headers */}
            <div className="flex-1 grid grid-cols-5">
              {DAYS.map((day) => {
                const count = allBlocks.filter((b) => b.slot.day === day).length;
                return (
                  <div
                    key={day}
                    className="py-2.5 px-2 text-center border-r last:border-r-0 border-white/20"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs font-black tracking-wider">{day}요일</span>
                      <span className="px-1.5 py-0.2 text-[9px] font-black rounded-xs bg-white text-[#1A1A1A]">
                        {count}개 과목
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timetable Body (9 Hours, 09:00 - 18:00) */}
          <div className="relative flex min-h-[820px] bg-white">
            
            {/* Time Gutter Column (좌측 Y축 시간 기준선) */}
            <div className="w-16 shrink-0 border-r-2 border-[#1A1A1A] bg-[#F1F0ED] select-none">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-[91px] border-b border-[#1A1A1A]/15 px-1.5 py-1 text-right flex flex-col justify-between"
                >
                  <span className="text-[11px] font-black text-[#1A1A1A]">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                  <span className="text-[9px] font-bold text-[#1A1A1A]/40">
                    {hour.toString().padStart(2, '0')}:30
                  </span>
                </div>
              ))}
            </div>

            {/* 5 Day Columns with High-Precision Expanded Placement */}
            <div className="flex-1 grid grid-cols-5">
              {DAYS.map((day) => {
                // Get all blocks for this specific day
                const dayBlocks = allBlocks.filter((b) => {
                  if (duplicateFilter && b.courseName !== duplicateFilter) return false;
                  return b.slot.day === day;
                });

                // High-precision lane placement & dynamic expansion
                const positionedBlocks = layoutDayBlocks(dayBlocks);

                return (
                  <div
                    key={day}
                    className="relative border-r border-[#1A1A1A]/20 last:border-r-0 bg-white"
                  >
                    {/* Background Hour Guidelines */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-[91px] border-b border-[#1A1A1A]/10 flex flex-col justify-end"
                      >
                        <div className="w-full border-b border-dashed border-[#1A1A1A]/10 h-1/2"></div>
                      </div>
                    ))}

                    {/* Render Course Blocks for this Day */}
                    {positionedBlocks.map((block, idx) => {
                      const colorTheme = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.aerospace;

                      // Filter students by current active filter / search
                      const visibleStudents = block.students.filter((s) => {
                        if (filterDegree !== 'ALL' && s.degree !== filterDegree) return false;
                        if (
                          searchTerm &&
                          !s.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                          !block.courseName.toLowerCase().includes(searchTerm.toLowerCase())
                        ) {
                          return false;
                        }
                        return true;
                      });

                      const isMatchSearch =
                        searchTerm &&
                        (block.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          block.students.some((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase())));

                      const isHovered = hoveredCourseId === block.courseName;

                      // Check if this block is narrow (e.g. concurrent classes where width is small)
                      const isNarrow = block.widthPercent <= 48 || block.totalColumns >= 2;
                      const isVeryNarrow = block.widthPercent <= 28 || block.totalColumns >= 3;
                      const isUltraNarrow = block.widthPercent <= 22 || block.totalColumns >= 4;

                      // Student names string for hover tooltip
                      const studentNamesText = block.students.map((s) => `${s.name}(${s.degree === 'PhD' ? 'Ph.D' : 'MS.'})`).join(', ');

                      const paddingClass = isUltraNarrow ? 'p-1' : isVeryNarrow ? 'p-1.5' : isNarrow ? 'p-1.5' : 'p-2';

                      return (
                        <div
                          key={`${block.courseName}-${block.slot.day}-${block.slot.startHour}-${block.slot.startMinute}-${idx}`}
                          id={`block-${block.courseName.replace(/[^a-zA-Z0-9가-힣]/g, '_')}-${day}-${idx}`}
                          onMouseEnter={() => setHoveredCourseId(block.courseName)}
                          onMouseLeave={() => setHoveredCourseId(null)}
                          onClick={() => setSelectedBlock(block)}
                          title={`${block.courseName} (${block.timeString})\n수강생 (${block.students.length}명): ${studentNamesText}\n👉 클릭 시 수강생 전체 목록 확인`}
                          style={{
                            top: `${block.topPercent}%`,
                            height: `${block.heightPercent}%`,
                            left: `${block.leftPercent}%`,
                            width: `${block.widthPercent}%`,
                          }}
                          className={`absolute p-0.5 z-10 transition-all duration-150 cursor-pointer ${
                            isHovered ? 'z-30 scale-[1.01]' : ''
                          }`}
                        >
                          <div
                            className={`h-full w-full rounded-xs ${colorTheme.blockBorder} ${colorTheme.blockBg} ${paddingClass} flex flex-col justify-start shadow-none overflow-hidden transition-all ${
                              isMatchSearch ? 'ring-2 ring-[#E14C27] font-bold' : ''
                            } ${isHovered ? 'shadow-lg border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : ''}`}
                          >
                            {/* Unified Block Content: Title -> Divider -> Headcount -> Student Badges */}
                            <div className="h-full w-full flex flex-col justify-start overflow-hidden">
                              {/* 1. Course Name */}
                              <div>
                                <h4
                                  className={`font-black text-[#1A1A1A] tracking-tighter leading-[1.18] select-none ${
                                    isUltraNarrow
                                      ? 'text-[8.5px]'
                                      : isVeryNarrow
                                      ? 'text-[9.5px]'
                                      : isNarrow
                                      ? 'text-[10.5px]'
                                      : 'text-xs'
                                  }`}
                                  style={{ wordBreak: isNarrow ? 'break-all' : 'keep-all' }}
                                >
                                  {block.courseName}
                                </h4>
                              </div>

                              {/* 2. Horizontal Divider Line directly below Title */}
                              <div className="my-1 border-t border-[#1A1A1A]/30 w-full shrink-0" />

                              {/* 3. Headcount directly below Divider */}
                              <div className="flex items-center justify-between font-black text-[#1A1A1A]/85 tracking-tighter leading-tight shrink-0 mb-1">
                                {isUltraNarrow ? (
                                  <div className="flex flex-col text-[7px] leading-none">
                                    <span>P.{phDCountForBlock(block)}</span>
                                    <span>M.{masterCountForBlock(block)}</span>
                                  </div>
                                ) : isVeryNarrow ? (
                                  <div className="flex flex-col text-[8px] leading-tight">
                                    <span>Ph.D. {phDCountForBlock(block)}</span>
                                    <span>MS. {masterCountForBlock(block)}</span>
                                  </div>
                                ) : (
                                  <span className="text-[8.5px] whitespace-nowrap">
                                    Ph.D. {phDCountForBlock(block)}명 / MS. {masterCountForBlock(block)}명
                                  </span>
                                )}
                              </div>

                              {/* 4. Student Badges (Ph.D. or Master 필터 선택 시에만 칩 표시, 블록이 넓고 학생 수가 많으면 2열로 3, 2 배치) */}
                              {filterDegree !== 'ALL' && visibleStudents.length > 0 && (() => {
                                const isWideForTwoCols = !isNarrow && visibleStudents.length >= 4;
                                const rowCount = Math.ceil(visibleStudents.length / 2);

                                return (
                                  <div
                                    className={`mt-auto pt-1 w-full overflow-hidden ${
                                      !isWideForTwoCols ? 'flex flex-col gap-0.5' : ''
                                    }`}
                                    style={
                                      isWideForTwoCols
                                        ? {
                                            display: 'grid',
                                            gridTemplateRows: `repeat(${rowCount}, minmax(0, 1fr))`,
                                            gridAutoFlow: 'column',
                                            gap: '3px',
                                          }
                                        : undefined
                                    }
                                  >
                                    {visibleStudents.map((student) => {
                                      const isPhD = student.degree === 'PhD';
                                      const isHighlighted =
                                        searchTerm && student.name.toLowerCase().includes(searchTerm.toLowerCase());

                                      return (
                                        <button
                                          key={student.id}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectStudent(student.id);
                                          }}
                                          className={`w-full flex items-center justify-between px-1.5 py-0.5 rounded-none font-black transition-transform hover:scale-[1.02] cursor-pointer border ${
                                            isUltraNarrow
                                              ? 'text-[7px] py-0.2 px-0.5'
                                              : isVeryNarrow
                                              ? 'text-[8px] py-0.5 px-1'
                                              : isNarrow
                                              ? 'text-[8.5px] py-0.5 px-1'
                                              : isWideForTwoCols
                                              ? 'text-[9px] py-0.5 px-1'
                                              : 'text-[10px] py-0.5 px-1.5'
                                          } ${
                                            isPhD
                                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-black'
                                              : 'bg-[#E14C27] text-white border-[#c93f1d] hover:bg-[#c93f1d]'
                                          } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
                                          title={`${isPhD ? 'Ph.D' : 'MS.'}: ${student.name}${
                                            student.note ? ` (${student.note})` : ''
                                          }`}
                                        >
                                          <span className="opacity-80 font-black text-[0.8em]">
                                            {isPhD ? 'Ph.D' : 'MS.'}
                                          </span>
                                          <span className="font-bold tracking-tight">{student.name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar 1: 수업 없는 인원 (간략화된 단일 라인, 학위 필터 연동) */}
      <div className="bg-[#F1F0ED] border-2 border-[#1A1A1A] rounded-xs p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#E14C27] shrink-0" />
            <span className="text-xs font-black text-[#1A1A1A]">
              수업 없는 인원 ({researchOnlyStudents.length}명)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {researchOnlyStudents.length === 0 ? (
              <span className="text-xs font-bold text-[#1A1A1A]/50">해당 조건의 인원이 없습니다.</span>
            ) : (
              researchOnlyStudents.map((s) => {
                const isPhD = s.degree === 'PhD';
                return (
                  <button
                    key={s.id}
                    onClick={() => onSelectStudent(s.id)}
                    className={`px-2 py-1 rounded-xs text-[10px] font-black flex items-center gap-1.5 cursor-pointer transition-transform hover:scale-105 border ${
                      isPhD ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#E14C27] text-white border-[#c93f1d]'
                    }`}
                    title={`${s.name} (${isPhD ? 'Ph.D' : 'MS.'}) - 수업 없음`}
                  >
                    <span className="text-[8px] opacity-75 font-extrabold uppercase">{isPhD ? 'Ph.D' : 'MS.'}</span>
                    <span className="font-bold">{s.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar 2: 교과목 분류 범례 (수업 없는 인원 아래로 배치) */}
      <div className="bg-[#F1F0ED] p-3 border-2 border-[#1A1A1A] rounded-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-[#1A1A1A] tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E14C27]" />
              교과목 분류 범례
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
            {Object.entries(CATEGORY_COLORS)
              .filter(([cat]) => cat !== 'research')
              .map(([key, theme]) => (
                <div
                  key={key}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#1A1A1A]/30 text-[#1A1A1A] rounded-xs"
                >
                  <span className={`w-2.5 h-2.5 rounded-none ${theme.dotColor}`}></span>
                  {theme.label}
                </div>
              ))}
            
            <div className="h-3 w-px bg-[#1A1A1A]/30 mx-1 hidden sm:block"></div>

            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1A1A1A] text-white text-[10px] font-black rounded-xs border border-[#1A1A1A]">
              <span className="w-1.5 h-1.5 bg-[#E14C27] rounded-full"></span>
              Ph.D (박사)
            </div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#E14C27] text-white text-[10px] font-black rounded-xs border border-[#c93f1d]">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              MS. (석사)
            </div>
          </div>
        </div>
      </div>

      {/* Quick Course Details / Add-Drop Action Modal */}
      {selectedBlock && (
        <div 
          className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedBlock(null)}
        >
          <div 
            className="bg-[#F9F8F6] rounded-xs max-w-lg w-full p-6 shadow-2xl border-4 border-[#1A1A1A] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b-2 border-[#1A1A1A]">
              <div>
                <span className="inline-block px-2 py-0.5 text-[10px] font-black rounded-xs mb-1.5 bg-[#1A1A1A] text-white">
                  {selectedBlock.department || '학과'} • {selectedBlock.courseCode || '코드'}
                </span>
                <h3 className="text-lg font-black tracking-tight text-[#1A1A1A]">
                  {selectedBlock.courseName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBlock(null)}
                className="w-7 h-7 rounded-xs bg-[#1A1A1A] text-white hover:bg-black flex items-center justify-center text-xs font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-2 gap-3 py-3 text-xs border-b border-[#1A1A1A]/20 font-bold text-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E14C27] shrink-0" />
                <div>
                  <span className="text-[#1A1A1A]/60 text-[10px] block">강의 시간</span>
                  <span>{selectedBlock.timeString}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#34495E] shrink-0" />
                <div>
                  <span className="text-[#1A1A1A]/60 text-[10px] block">학점 및 담당</span>
                  <span>{selectedBlock.credits}학점 ({selectedBlock.professor || '담당교수미정'} 교수)</span>
                </div>
              </div>
            </div>

            {/* Enrolled Students list (균일하고 깔끔한 리스트 뷰) */}
            <div className="py-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-[#1A1A1A] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E14C27]" />
                  수강 학생 전체 목록 ({selectedBlock.students.length}명)
                </h4>
                <span className="text-[10px] font-black text-[#1A1A1A]/70">
                  Ph.D {selectedBlock.students.filter(s => s.degree === 'PhD').length}명 · MS. {selectedBlock.students.filter(s => s.degree === 'Master').length}명
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto p-2 bg-white rounded-xs border-2 border-[#1A1A1A]">
                {selectedBlock.students.map((s) => {
                  const isPhD = s.degree === 'PhD';
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        setSelectedBlock(null);
                        onSelectStudent(s.id);
                      }}
                      className="p-2 bg-[#F9F8F6] rounded-xs border border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-[#F1F0ED] transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-black border ${
                          isPhD ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#E14C27] text-white border-[#c93f1d]'
                        }`}>
                          {isPhD ? 'Ph.D' : 'MS.'}
                        </span>
                        <span className="text-xs font-black text-[#1A1A1A]">{s.name}</span>
                      </div>
                      {s.note && (
                        <span className="text-[9px] text-[#1A1A1A]/50 truncate max-w-[85px]" title={s.note}>
                          {s.note}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t-2 border-[#1A1A1A]">
              <button
                onClick={() => {
                  setSelectedBlock(null);
                  onEditCourse(selectedBlock.courseCode, selectedBlock.courseName);
                }}
                className="w-full py-2.5 px-4 rounded-xs bg-[#1A1A1A] hover:bg-black text-white text-xs font-black tracking-wider shadow-none transition-colors cursor-pointer text-center"
              >
                ✏️ 이 과목 수강생 및 시간 정정하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function phDCountForBlock(block: TimetableBlockItem) {
  return block.students.filter((s) => s.degree === 'PhD').length;
}

function masterCountForBlock(block: TimetableBlockItem) {
  return block.students.filter((s) => s.degree === 'Master').length;
}


