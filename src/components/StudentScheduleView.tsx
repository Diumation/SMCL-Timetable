import React, { useState } from 'react';
import { 
  User, 
  BookOpen, 
  Clock, 
  Trash2, 
  PlusCircle, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  Search,
  GraduationCap
} from 'lucide-react';
import { FilterDegree, Student, StudentCourse } from '../types';
import { CATEGORY_COLORS, getDegreeBadgeClass } from '../utils/colorUtils';
import { getCategoryFromCourse, parseTimeString, calculateSlotPosition, DAYS, START_HOUR, TOTAL_HOURS } from '../utils/timeUtils';

interface StudentScheduleViewProps {
  students: Student[];
  selectedStudentId: string | null;
  onSelectStudent: (studentId: string) => void;
  onAddCourseToStudent: (studentId: string) => void;
  onDeleteCourseFromStudent: (studentId: string, courseId: string) => void;
  filterDegree: FilterDegree;
  onFilterDegreeChange: (degree: FilterDegree) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export const StudentScheduleView: React.FC<StudentScheduleViewProps> = ({
  students,
  selectedStudentId,
  onSelectStudent,
  onAddCourseToStudent,
  onDeleteCourseFromStudent,
  filterDegree,
  onFilterDegreeChange,
  searchTerm,
  onSearchChange,
}) => {
  const filteredStudents = students.filter((s) => {
    if (filterDegree !== 'ALL' && s.degree !== filterDegree) return false;
    if (searchTerm) {
      const matchName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCourse = s.courses.some((c) =>
        c.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!matchName && !matchCourse) return false;
    }
    return true;
  });

  const activeStudent =
    students.find((s) => s.id === selectedStudentId) ||
    filteredStudents[0] ||
    students[0];

  // Calculate statistics for active student
  const totalCredits = activeStudent
    ? activeStudent.courses.reduce((acc, c) => acc + (typeof c.credits === 'number' ? c.credits : parseFloat(c.credits) || 0), 0)
    : 0;

  const courseworkCredits = activeStudent
    ? activeStudent.courses
        .filter((c) => !c.isResearch && c.timeString && c.timeString !== '-')
        .reduce((acc, c) => acc + (typeof c.credits === 'number' ? c.credits : parseFloat(c.credits) || 0), 0)
    : 0;

  const researchCredits = activeStudent
    ? activeStudent.courses
        .filter((c) => c.isResearch || c.courseName.includes('논문연구'))
        .reduce((acc, c) => acc + (typeof c.credits === 'number' ? c.credits : parseFloat(c.credits) || 0), 0)
    : 0;

  // Check for time conflicts in active student's courses
  const conflicts = checkStudentConflicts(activeStudent ? activeStudent.courses : []);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: 24 Students List Navigation (Editorial Aside) */}
      <div className="lg:col-span-4 bg-[#F1F0ED] rounded-xs border-2 border-[#1A1A1A] p-4 flex flex-col h-[820px]">
        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b-2 border-[#1A1A1A]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#E14C27]" />
            <h3 className="text-xs font-black tracking-wider text-[#1A1A1A]">
              연구원 목록 ({filteredStudents.length}/{students.length}명)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-[#1A1A1A]/50">선택하여 조회</span>
        </div>

        {/* Student Cards List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredStudents.map((s) => {
            const isSelected = s.id === activeStudent?.id;
            const isPhD = s.degree === 'PhD';
            const courseCount = s.courses.filter(
              (c) => !c.isResearch && c.timeString && c.timeString !== '-'
            ).length;
            const studentCredits = s.courses.reduce(
              (acc, c) => acc + (typeof c.credits === 'number' ? c.credits : parseFloat(c.credits) || 0),
              0
            );

            return (
              <button
                key={s.id}
                id={`student-card-${s.id}`}
                onClick={() => onSelectStudent(s.id)}
                className={`w-full text-left p-2.5 rounded-xs border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-none'
                    : 'bg-white border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-white/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold w-5 ${isSelected ? 'text-white/60' : 'text-[#1A1A1A]/50'}`}>
                    #{s.orderNumber}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-xs font-black ${
                    isSelected ? 'bg-white text-[#1A1A1A]' : isPhD ? 'bg-[#1A1A1A] text-white' : 'bg-[#E14C27] text-white'
                  }`}>
                    {isPhD ? 'Ph.D' : 'MS.'}
                  </span>
                  <div>
                    <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-[#1A1A1A]'}`}>
                      {s.name}
                    </span>
                    <div className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-[#1A1A1A]/60'}`}>
                      {courseCount > 0 ? `강의 ${courseCount}개` : '연구학점 전담'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-black ${isSelected ? 'text-[#E14C27]' : 'text-[#1A1A1A]'}`}>
                    {studentCredits}학점
                  </span>
                  <div className={`text-[8px] font-bold ${isSelected ? 'text-white/60' : 'text-[#1A1A1A]/50'}`}>
                    {courseCount > 0 ? '강의학점' : '연구학점'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Selected Student's Weekly Timetable & Course Management */}
      <div className="lg:col-span-8 space-y-4">
        {activeStudent ? (
          <>
            {/* Student Header Profile Banner (Editorial Masthead) */}
            <div className="bg-white rounded-xs border-2 border-[#1A1A1A] p-5 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xs bg-[#1A1A1A] text-white flex items-center justify-center font-black text-lg">
                  {activeStudent.name.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-xs font-black tracking-wider ${
                        activeStudent.degree === 'PhD'
                          ? 'bg-[#1A1A1A] text-white'
                          : 'bg-[#E14C27] text-white'
                      }`}
                    >
                      {activeStudent.degree === 'PhD' ? 'Ph.D (박사과정)' : 'MS. (석사과정)'}
                    </span>
                    <span className="text-xs font-bold text-[#1A1A1A]/50 font-mono">
                      No. {activeStudent.orderNumber}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#1A1A1A] mt-0.5 tracking-tight">
                    {activeStudent.name} 연구원
                  </h2>
                </div>
              </div>

              {/* Credit Breakdown Counters */}
              <div className="flex items-center gap-3 bg-[#F1F0ED] p-2.5 rounded-xs border border-[#1A1A1A]/30">
                <div className="text-center px-2">
                  <div className="text-[9px] font-black tracking-wider text-[#1A1A1A]/60">총 이수학점</div>
                  <div className="text-lg font-black text-[#1A1A1A]">{totalCredits}학점</div>
                </div>
                <div className="h-6 w-px bg-[#1A1A1A]/20"></div>
                <div className="text-center px-2">
                  <div className="text-[9px] font-black tracking-wider text-[#E14C27]">강의학점</div>
                  <div className="text-lg font-black text-[#E14C27]">{courseworkCredits}학점</div>
                </div>
                <div className="h-6 w-px bg-[#1A1A1A]/20"></div>
                <div className="text-center px-2">
                  <div className="text-[9px] font-black tracking-wider text-[#1A1A1A]/60">연구학점</div>
                  <div className="text-lg font-black text-[#1A1A1A]">{researchCredits}학점</div>
                </div>
              </div>
            </div>

            {/* Conflict Warning if any */}
            {conflicts.length > 0 && (
              <div className="bg-[#E14C27]/10 border-2 border-[#E14C27] rounded-xs p-3.5 flex items-start gap-3 text-[#1A1A1A] text-xs">
                <AlertTriangle className="w-5 h-5 text-[#E14C27] shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#E14C27] tracking-wider">⚠️ 강의 시간 중복 경고:</span>
                  <ul className="list-disc list-inside mt-1 space-y-0.5 font-bold">
                    {conflicts.map((c, idx) => (
                      <li key={idx}>
                        [{c.day}요일] <strong>{c.courseA}</strong> ↔ <strong>{c.courseB}</strong> 시간이 겹칩니다.
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Individual Student Weekly Timetable */}
            <div className="bg-white rounded-xs border-2 border-[#1A1A1A] p-4 shadow-none">
              <h4 className="text-xs font-black tracking-wider text-[#1A1A1A] mb-3 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#E14C27]" />
                {activeStudent.name} 연구원 주간 시간표
              </h4>

              <div className="grid grid-cols-11 border-2 border-[#1A1A1A] rounded-xs overflow-hidden min-h-[460px]">
                {/* Time Gutter */}
                <div className="col-span-1 border-r-2 border-[#1A1A1A] bg-[#F1F0ED]">
                  <div className="h-8 border-b-2 border-[#1A1A1A] text-[9px] font-black tracking-wider text-[#1A1A1A] flex items-center justify-center">
                    시간
                  </div>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="h-[46px] border-b border-[#1A1A1A]/15 px-1 text-right text-[9px] font-black text-[#1A1A1A]/70 flex items-center justify-end"
                    >
                      {hour}:00
                    </div>
                  ))}
                </div>

                {/* 5 Days */}
                {DAYS.map((day) => {
                  return (
                    <div
                      key={day}
                      className="col-span-2 relative border-r border-[#1A1A1A]/20 last:border-r-0 bg-white"
                    >
                      <div className="h-8 border-b-2 border-[#1A1A1A] text-xs font-black text-white flex items-center justify-center bg-[#1A1A1A] tracking-wider">
                        {day}요일
                      </div>

                      {/* Hour lines */}
                      {hours.map((hour) => (
                        <div key={hour} className="h-[46px] border-b border-[#1A1A1A]/10"></div>
                      ))}

                      {/* Student's courses on this day */}
                      {activeStudent.courses
                        .filter((c) => !c.isResearch && c.timeString && c.timeString !== '-')
                        .map((course) => {
                          const slots = parseTimeString(course.timeString).filter((s) => s.day === day);
                          const cat = getCategoryFromCourse(course.courseCode, course.courseName, course.department);
                          const theme = CATEGORY_COLORS[cat] || CATEGORY_COLORS.aerospace;

                          return slots.map((slot, idx) => {
                            const { topPercent, heightPercent } = calculateSlotPosition(slot);
                            return (
                              <div
                                key={`${course.id}-${idx}`}
                                style={{
                                  top: `calc(32px + (100% - 32px) * ${topPercent / 100})`,
                                  height: `calc((100% - 32px) * ${heightPercent / 100})`,
                                }}
                                className={`absolute left-0.5 right-0.5 p-1.5 rounded-xs ${theme.blockBorder} ${theme.blockBg} shadow-none overflow-hidden z-10 flex flex-col justify-between`}
                              >
                                <div>
                                  <span className={`text-[8px] font-black px-1 py-0.2 rounded-xs border border-[#1A1A1A]/20 ${theme.badgeBg} ${theme.badgeText}`}>
                                    {course.courseCode}
                                  </span>
                                  <div className="text-[10px] font-black text-[#1A1A1A] break-keep mt-0.5 leading-tight">
                                    {course.courseName}
                                  </div>
                                </div>
                                <div className="text-[8px] text-[#1A1A1A]/70 font-bold">
                                  {slot.startHour}:{slot.startMinute.toString().padStart(2, '0')}-
                                  {slot.endHour}:{slot.endMinute.toString().padStart(2, '0')}
                                </div>
                              </div>
                            );
                          });
                        })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enrolled Courses Table & Add/Delete Action */}
            <div className="bg-white rounded-xs border-2 border-[#1A1A1A] p-4 shadow-none">
              <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#1A1A1A]">
                <h4 className="text-xs font-black tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#E14C27]" />
                  신청 교과목 목록 ({activeStudent.courses.length}개)
                </h4>

                <button
                  id={`btn-add-course-${activeStudent.id}`}
                  onClick={() => onAddCourseToStudent(activeStudent.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xs bg-[#1A1A1A] hover:bg-black text-white text-xs font-black tracking-wider transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-[#E14C27]" />
                  과목 추가 / 정정
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1A1A1A] text-white border-b-2 border-[#1A1A1A] text-[10px] tracking-wider font-black">
                      <th className="py-2 px-3">과목코드</th>
                      <th className="py-2 px-3">교과목명</th>
                      <th className="py-2 px-3">개설 학과</th>
                      <th className="py-2 px-3">담당교수</th>
                      <th className="py-2 px-3 text-center">학점</th>
                      <th className="py-2 px-3">강의 시간</th>
                      <th className="py-2 px-3">비고</th>
                      <th className="py-2 px-3 text-right">삭제</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/10 border border-[#1A1A1A]/20">
                    {activeStudent.courses.map((c) => {
                      const cat = getCategoryFromCourse(c.courseCode, c.courseName, c.department);
                      const theme = CATEGORY_COLORS[cat] || CATEGORY_COLORS.aerospace;

                      return (
                        <tr key={c.id} className="hover:bg-[#F1F0ED] transition-colors font-bold">
                          <td className="py-2 px-3 font-mono text-[#1A1A1A]/80">
                            {c.courseCode}
                          </td>
                          <td className="py-2 px-3 font-black text-[#1A1A1A]">
                            <span className={`inline-block w-2 h-2 mr-1.5 ${theme.dotColor}`}></span>
                            {c.courseName}
                          </td>
                          <td className="py-2 px-3 text-[#1A1A1A]/70">{c.department}</td>
                          <td className="py-2 px-3 text-[#1A1A1A]">{c.professor}</td>
                          <td className="py-2 px-3 text-center font-black text-[#1A1A1A]">{c.credits}</td>
                          <td className="py-2 px-3 text-[#1A1A1A]">
                            {c.timeString || '-'}
                          </td>
                          <td className="py-2 px-3 text-[#1A1A1A]/50 italic max-w-xs truncate" title={c.note}>
                            {c.note || '-'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => onDeleteCourseFromStudent(activeStudent.id, c.id)}
                              className="p-1 text-[#1A1A1A]/40 hover:text-[#E14C27] hover:bg-[#E14C27]/10 rounded-xs transition-colors cursor-pointer"
                              title="과목 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-[#1A1A1A]/40 bg-white rounded-xs border-2 border-[#1A1A1A] font-bold tracking-wider">
            연구원을 선택해주세요.
          </div>
        )}
      </div>
    </div>
  );
};

function checkStudentConflicts(courses: StudentCourse[]) {
  const conflicts: { day: string; courseA: string; courseB: string }[] = [];
  const activeLectures = courses.filter((c) => !c.isResearch && c.timeString && c.timeString !== '-');

  for (let i = 0; i < activeLectures.length; i++) {
    const slotsA = parseTimeString(activeLectures[i].timeString);
    for (let j = i + 1; j < activeLectures.length; j++) {
      const slotsB = parseTimeString(activeLectures[j].timeString);

      for (const sa of slotsA) {
        for (const sb of slotsB) {
          if (sa.day === sb.day) {
            const startA = sa.startHour * 60 + sa.startMinute;
            const endA = sa.endHour * 60 + sa.endMinute;
            const startB = sb.startHour * 60 + sb.startMinute;
            const endB = sb.endHour * 60 + sb.endMinute;

            if (Math.max(startA, startB) < Math.min(endA, endB)) {
              conflicts.push({
                day: sa.day,
                courseA: activeLectures[i].courseName,
                courseB: activeLectures[j].courseName,
              });
            }
          }
        }
      }
    }
  }
  return conflicts;
}
