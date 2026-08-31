import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  User, 
  Info,
  BookOpen,
  Users,
  Search,
  Filter,
  Layers
} from 'lucide-react';
import { FilterDegree, Student, TimetableBlockItem, CourseCategory } from '../types';
import { getCourseColorTheme } from '../utils/colorUtils';
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

  // Filter students based on the active filterDegree (Ph.D vs MS. vs ALL)
  const filteredStudents = useMemo(() => {
    if (filterDegree === 'ALL') return students;
    return students.filter((s) => s.degree === filterDegree);
  }, [students, filterDegree]);

  // Generate all timetable blocks based on filtered students
  const allBlocks = useMemo(() => buildTimetableBlocks(filteredStudents), [filteredStudents]);

  // Unique courses for color legend
  const uniqueCourses = useMemo(() => {
    const map = new Map<string, { courseName: string; courseCode: string; category: CourseCategory; professor: string; timeString: string; totalStudents: number }>();
    for (const b of allBlocks) {
      if (!map.has(b.courseName)) {
        map.set(b.courseName, {
          courseName: b.courseName,
          courseCode: b.courseCode,
          category: b.category,
          professor: b.professor,
          timeString: b.timeString,
          totalStudents: b.students.length,
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.courseName.localeCompare(b.courseName));
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
      {/* Top Filter Bar: Interactive Standardized Degree Legend Buttons */}
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
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] ring-2 ring-[#1B6CA8]'
                  : 'bg-white text-[#1A1A1A]/80 border-[#1A1A1A]/30 hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
              }`}
              title="클릭 시 Ph.D.(박사과정) 학생 및 수업만 보기"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${filterDegree === 'PhD' ? 'bg-white' : 'bg-[#1A1A1A]'}`}></span>
              Ph.D. ({students.filter((s) => s.degree === 'PhD').length}명)
            </button>
            <button
              onClick={() => onFilterDegreeChange && onFilterDegreeChange(filterDegree === 'Master' ? 'ALL' : 'Master')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black rounded-xs border cursor-pointer transition-all ${
                filterDegree === 'Master'
                  ? 'bg-[#1B6CA8] text-white border-[#145380] ring-2 ring-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A]/80 border-[#1A1A1A]/30 hover:text-[#1A1A1A] hover:border-[#1A1A1A]'
              }`}
              title="클릭 시 M.S.(석사과정) 학생 및 수업만 보기"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${filterDegree === 'Master' ? 'bg-white' : 'bg-[#1B6CA8]'}`}></span>
              M.S. ({students.filter((s) => s.degree === 'Master').length}명)
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#1A1A1A]/70">
            * 블록 내 <span className="font-black text-[#1A1A1A]">검정(Ph.D.)</span> / <span className="font-black text-[#1B6CA8]">파랑(M.S.)</span> 태그는 수강 연구원이며, 클릭 시 상세 정보가 열립니다.
          </span>
        </div>
      </div>

      {/* Course Color Legend Bar (교수님 1-Page 확인용 개설 과목 색상 분류표) */}
      <div className="bg-white border-2 border-[#1A1A1A] rounded-xs p-2.5 shadow-xs">
        <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#1A1A1A]/15">
          <Layers className="w-3.5 h-3.5 text-[#1B6CA8]" />
          <span className="text-[11px] font-black text-[#1A1A1A] tracking-wider">
            개설 과목 색상 분류표 ({uniqueCourses.length}개 강좌)
          </span>
          <span className="text-[9.5px] font-bold text-[#1A1A1A]/50 ml-auto hidden sm:inline">
            과목에 마우스를 올리면 시간표 위치가 강조됩니다
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {uniqueCourses.map((c) => {
            const courseColor = getCourseColorTheme(c.courseName);
            const isHovered = hoveredCourseId === c.courseName;

            return (
              <div
                key={c.courseName}
                onMouseEnter={() => setHoveredCourseId(c.courseName)}
                onMouseLeave={() => setHoveredCourseId(null)}
                onClick={() => {
                  const sampleBlock = allBlocks.find((b) => b.courseName === c.courseName);
                  if (sampleBlock) setSelectedBlock(sampleBlock);
                }}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xs border text-[10px] font-black cursor-pointer transition-all ${
                  courseColor.blockBg
                } ${isHovered ? 'ring-2 ring-[#1A1A1A] scale-[1.03] shadow-xs' : 'border-[#1A1A1A]/20 hover:border-[#1A1A1A]'}`}
                title={`${c.courseName}\n담당: ${c.professor || '미지정'} | 시간: ${c.timeString}\n수강생: ${c.totalStudents}명`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                  style={{ backgroundColor: courseColor.primary }}
                />
                <span className="text-[#1A1A1A] truncate max-w-[170px]">{c.courseName}</span>
                <span className="text-[8.5px] font-bold px-1 py-0.2 rounded-2xs bg-white/80 border border-[#1A1A1A]/20 text-[#1A1A1A]/70">
                  {c.totalStudents}명
                </span>
              </div>
            );
          })}
        </div>
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
                const dayBlocks = allBlocks.filter((b) => b.slot.day === day);

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
                      const courseColor = getCourseColorTheme(block.courseName);

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

                      // Calculate block size tier for adaptive grid column count, typography, and spacing
                      const isSingleCol = block.widthPercent >= 80 || block.totalColumns === 1;
                      const isTwoCol = !isSingleCol && (block.widthPercent >= 45 || block.totalColumns === 2);
                      const isThreeCol = !isSingleCol && !isTwoCol && (block.widthPercent >= 28 || block.totalColumns === 3);
                      const isUltraNarrow = block.widthPercent < 28 || block.totalColumns >= 4;

                      // Determine how many columns to layout student tags inside this block
                      // Single block (1 in col): 3 columns of name tags
                      // Two blocks (2 in col): 2 columns of name tags
                      // 3 or more blocks: 1 column of name tags
                      const tagGridColsClass = isSingleCol
                        ? 'grid-cols-3'
                        : isTwoCol
                        ? 'grid-cols-2'
                        : 'grid-cols-1';

                      // Student names string for hover tooltip
                      const studentNamesText = block.students.map((s) => `${s.name}(${s.degree === 'PhD' ? 'Ph.D.' : 'M.S.'})`).join(', ');

                      return (
                        <div
                          key={`${block.courseName}-${block.slot.day}-${block.slot.startHour}-${block.slot.startMinute}-${idx}`}
                          id={`block-${block.courseName.replace(/[^a-zA-Z0-9가-힣]/g, '_')}-${day}-${idx}`}
                          onMouseEnter={() => setHoveredCourseId(block.courseName)}
                          onMouseLeave={() => setHoveredCourseId(null)}
                          onClick={() => setSelectedBlock(block)}
                          title={`[${block.courseName}] (${block.timeString})\n담당: ${block.professor || '미지정'}\n수강생 (${block.students.length}명): ${studentNamesText}\n👉 클릭 시 수강생 전체 목록 확인`}
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
                            className={`h-full w-full rounded-xs ${courseColor.blockBg} border border-[#1A1A1A]/30 border-l-[4px] ${
                              isUltraNarrow ? 'p-0.5' : isThreeCol ? 'p-0.5' : isTwoCol ? 'p-1' : 'p-1'
                            } flex flex-col justify-start shadow-none overflow-hidden transition-all ${
                              isMatchSearch ? 'ring-2 ring-[#E14C27] font-bold' : ''
                            } ${isHovered ? 'shadow-lg border-[#1A1A1A] ring-1 ring-[#1A1A1A]' : ''}`}
                            style={{ borderLeftColor: courseColor.primary }}
                          >
                            {/* Stacked Student Name Tags with Multi-Column Grid */}
                            <div className="h-full w-full flex flex-col justify-start overflow-hidden">
                              {visibleStudents.length > 0 ? (
                                <div
                                  className={`w-full grid ${tagGridColsClass} ${
                                    isUltraNarrow
                                      ? 'gap-0.5'
                                      : isThreeCol
                                      ? 'gap-0.5'
                                      : isTwoCol
                                      ? 'gap-1'
                                      : 'gap-1'
                                  }`}
                                >
                                  {visibleStudents.map((student) => {
                                    const isPhD = student.degree === 'PhD';
                                    const isHighlighted =
                                      searchTerm && student.name.toLowerCase().includes(searchTerm.toLowerCase());

                                    // Auto-scale font size for long names (e.g. Jetniphat, Yong Lin) to prevent clipping
                                    const nameLen = student.name.length;
                                    let nameSizeClass = '';
                                    if (isUltraNarrow) {
                                      nameSizeClass = nameLen >= 8 ? 'text-[5.5px] py-0.5 px-0.5' : nameLen >= 5 ? 'text-[6.5px] py-0.5 px-0.5' : 'text-[7.5px] py-0.5 px-0.5';
                                    } else if (isThreeCol) {
                                      nameSizeClass = nameLen >= 8 ? 'text-[6.5px] py-0.5 px-0.5' : nameLen >= 5 ? 'text-[7.5px] py-0.5 px-0.5' : 'text-[8.5px] py-0.5 px-0.5';
                                    } else if (isTwoCol) {
                                      nameSizeClass = nameLen >= 8 ? 'text-[7.5px] py-0.5 px-0.8' : nameLen >= 5 ? 'text-[8.5px] py-0.5 px-1' : 'text-[9.5px] py-0.5 px-1';
                                    } else {
                                      nameSizeClass = nameLen >= 8 ? 'text-[8.5px] py-1 px-1' : nameLen >= 5 ? 'text-[9.5px] py-1 px-1' : 'text-[10.5px] py-1 px-1.5';
                                    }

                                    return (
                                      <button
                                        key={student.id}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectStudent(student.id);
                                        }}
                                        className={`w-full flex items-center justify-center rounded-xs font-black tracking-tighter text-center whitespace-nowrap leading-none transition-transform hover:scale-[1.03] cursor-pointer border ${nameSizeClass} ${
                                          isPhD
                                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] hover:bg-black'
                                            : 'bg-[#1B6CA8] text-white border-[#145380] hover:bg-[#145380]'
                                        } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
                                        title={`${student.name} (${isPhD ? 'Ph.D.' : 'M.S.'}) - [${block.courseName}]`}
                                      >
                                        <span className="whitespace-nowrap">{student.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center">
                                  <span className="text-[7.5px] font-bold text-[#1A1A1A]/40">-</span>
                                </div>
                              )}
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
            <Info className="w-3.5 h-3.5 text-[#1B6CA8] shrink-0" />
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
                    className={`px-2.5 py-1.5 rounded-xs text-[11px] font-black flex items-center justify-center cursor-pointer transition-transform hover:scale-105 border ${
                      isPhD ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#1B6CA8] text-white border-[#145380]'
                    }`}
                    title={`${s.name} (${isPhD ? 'Ph.D.' : 'M.S.'}) - 수업 없음`}
                  >
                    <span>{s.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Course Details Modal */}
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
                <Clock className="w-4 h-4 text-[#1B6CA8] shrink-0" />
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
            <div className="pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-[#1A1A1A] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#1B6CA8]" />
                  수강 학생 전체 목록 ({selectedBlock.students.length}명)
                </h4>
                <span className="text-[10px] font-black text-[#1A1A1A]/70">
                  Ph.D. {selectedBlock.students.filter(s => s.degree === 'PhD').length}명 · M.S. {selectedBlock.students.filter(s => s.degree === 'Master').length}명
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-60 overflow-y-auto p-2 bg-white rounded-xs border-2 border-[#1A1A1A]">
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
                          isPhD ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-[#1B6CA8] text-white border-[#145380]'
                        }`}>
                          {isPhD ? 'Ph.D.' : 'M.S.'}
                        </span>
                        <span className="text-xs font-black text-[#1A1A1A] flex items-center gap-1">
                          {s.name}
                          {s.name === '이윤일' && <span className="text-[10px]" title="랩장">👑</span>}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
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


