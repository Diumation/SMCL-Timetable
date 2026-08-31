import React from 'react';
import { FilterDegree, Student } from '../types';
import { getCourseColorTheme } from '../utils/colorUtils';
import { buildTimetableBlocks, DAYS, layoutDayBlocks, START_HOUR, TOTAL_HOURS } from '../utils/timeUtils';

interface PrintViewProps {
  students: Student[];
  filterDegree?: FilterDegree;
}

export const PrintView: React.FC<PrintViewProps> = ({ students, filterDegree = 'ALL' }) => {
  const totalPhdCount = students.filter((s) => s.degree === 'PhD').length;
  const totalMasterCount = students.filter((s) => s.degree === 'Master').length;

  const activeStudents = students.filter((s) => {
    if (filterDegree === 'PhD') return s.degree === 'PhD';
    if (filterDegree === 'Master') return s.degree === 'Master';
    return true;
  });

  const allBlocks = buildTimetableBlocks(activeStudents);
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const researchOnlyStudents = activeStudents.filter(
    (s) => s.courses.every((c) => c.isResearch || !c.timeString || c.timeString === '-')
  );

  return (
    <div className="hidden print:flex flex-col justify-between p-4 max-w-[210mm] min-h-[297mm] mx-auto bg-white text-[#1A1A1A] font-sans box-border">
      {/* Printable Document Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2 mb-1.5 shrink-0">
        <div>
          <div className="text-[9.5px] font-black tracking-widest text-[#2563EB]">
            SMCL • Spacecraft Mission & Control Lab
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1A1A1A]">
            {filterDegree === 'PhD'
              ? 'SMCL 연구원 시간표 (박사과정)'
              : filterDegree === 'Master'
              ? 'SMCL 연구원 시간표 (석사과정)'
              : 'SMCL 연구원 시간표 (주간 종합)'}
          </h1>
          <p className="text-[10.5px] text-[#1A1A1A]/70 font-bold tracking-wider">
            {filterDegree === 'PhD'
              ? `박사과정 총원 ${totalPhdCount}명 (Ph.D. Coursework & Research)`
              : filterDegree === 'Master'
              ? `석사과정 총원 ${totalMasterCount}명 (M.S. Coursework & Research)`
              : `총원 ${students.length}명 (Ph.D. ${totalPhdCount}명 / M.S. ${totalMasterCount}명)`}
          </p>
        </div>
        <div className="text-right text-[9px] font-bold text-[#1A1A1A]/60 tracking-wider">
          <div>출력일자: {new Date().toLocaleDateString('ko-KR')}</div>
          <div className="font-black text-[#1A1A1A] text-[10px]">
            {filterDegree === 'PhD'
              ? 'A4 PORTRAIT • Ph.D.'
              : filterDegree === 'Master'
              ? 'A4 PORTRAIT • M.S.'
              : 'A4 PORTRAIT • MASTER'}
          </div>
        </div>
      </div>

      {/* Timetable Grid Exactly Matching Screen Layout */}
      <div className="border-2 border-[#1A1A1A] bg-white flex-1 flex flex-col">
        {/* Day Header Row */}
        <div className="flex border-b-2 border-[#1A1A1A] bg-[#1A1A1A] text-white shrink-0">
          <div className="w-12 shrink-0 py-1.5 text-center text-[10.5px] font-black border-r border-white/20">
            시간
          </div>
          <div className="flex-1 grid grid-cols-5">
            {DAYS.map((day) => {
              const count = allBlocks.filter((b) => b.slot.day === day).length;
              return (
                <div
                  key={day}
                  className="py-1.5 px-1 text-center border-r last:border-r-0 border-white/20"
                >
                  <span className="text-[11.5px] font-black">{day}요일</span>
                  <span className="ml-1 text-[8.5px] opacity-80 font-normal">({count}개 과목)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid Body with 9 Hours */}
        <div className="relative flex flex-1 bg-white min-h-[890px]">
          {/* Y-Axis Time Gutter */}
          <div className="w-12 shrink-0 border-r-2 border-[#1A1A1A] bg-[#F1F0ED] select-none flex flex-col">
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 border-b last:border-b-0 border-[#1A1A1A]/15 px-1 py-1 text-right flex flex-col justify-between min-h-[98px]"
              >
                <span className="text-[9.5px] font-black text-[#1A1A1A]">
                  {hour}:00
                </span>
                <span className="text-[8px] font-bold text-[#1A1A1A]/40">
                  {hour}:30
                </span>
              </div>
            ))}
          </div>

          {/* 5 Day Columns */}
          <div className="flex-1 grid grid-cols-5">
            {DAYS.map((day) => {
              const dayBlocks = allBlocks.filter((b) => b.slot.day === day);
              const positionedBlocks = layoutDayBlocks(dayBlocks);

              return (
                <div
                  key={day}
                  className="relative border-r last:border-r-0 border-[#1A1A1A]/20 bg-white flex flex-col"
                >
                  {/* Background Grid Lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 border-b last:border-b-0 border-[#1A1A1A]/10 flex flex-col justify-end min-h-[98px]"
                    >
                      <div className="w-full border-b border-dashed border-[#1A1A1A]/10 h-1/2"></div>
                    </div>
                  ))}

                  {positionedBlocks.map((block, idx) => {
                    const courseColor = getCourseColorTheme(block.courseName);

                    const isSingleCol = block.widthPercent >= 80 || block.totalColumns === 1;
                    const isTwoCol = !isSingleCol && (block.widthPercent >= 45 || block.totalColumns === 2);
                    const isThreeCol = !isSingleCol && !isTwoCol && (block.widthPercent >= 28 || block.totalColumns === 3);
                    const isUltraNarrow = block.widthPercent < 28 || block.totalColumns >= 4;

                    const tagGridColsClass = isSingleCol
                      ? 'grid-cols-3'
                      : isTwoCol
                      ? 'grid-cols-2'
                      : 'grid-cols-1';

                    const visibleStudents = block.students.filter((s) => {
                      if (filterDegree === 'PhD') return s.degree === 'PhD';
                      if (filterDegree === 'Master') return s.degree === 'Master';
                      return true;
                    });

                    return (
                      <div
                        key={`${block.courseName}-${day}-${idx}`}
                        style={{
                          top: `${block.topPercent}%`,
                          height: `${block.heightPercent}%`,
                          left: `${block.leftPercent}%`,
                          width: `${block.widthPercent}%`,
                        }}
                        className="absolute p-0.5 z-10"
                      >
                        <div
                          className={`h-full w-full rounded-xs ${courseColor.blockBg} border border-[#1A1A1A]/30 border-l-[4px] ${
                            isUltraNarrow ? 'p-0.5' : isThreeCol ? 'p-0.5' : isTwoCol ? 'p-1' : 'p-1'
                          } flex flex-col justify-start overflow-hidden shadow-none`}
                          style={{ borderLeftColor: courseColor.primary }}
                        >
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
                                    <div
                                      key={student.id}
                                      className={`w-full flex items-center justify-center rounded-xs font-black tracking-tighter text-center whitespace-nowrap leading-none border ${nameSizeClass} ${
                                        isPhD
                                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                          : 'bg-[#1B6CA8] text-white border-[#145380]'
                                      }`}
                                    >
                                      <span className="whitespace-nowrap">{student.name}</span>
                                    </div>
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

      {/* Printable Footer */}
      <div className="mt-2 pt-1.5 border-t-2 border-[#1A1A1A] shrink-0">
        <div className="flex flex-row items-center justify-between gap-2 bg-[#F1F0ED] p-2 border border-[#1A1A1A]">
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-black text-[#1A1A1A]">
              수업 없는 인원 ({researchOnlyStudents.length}명):
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {researchOnlyStudents.length === 0 ? (
              <span className="text-[9px] font-bold text-[#1A1A1A]/60">전원 Coursework 수강 중</span>
            ) : (
              researchOnlyStudents.map((s) => {
                const isPhD = s.degree === 'PhD';
                return (
                  <span
                    key={s.id}
                    className={`px-2 py-1 rounded-xs text-[10px] font-black border ${
                      isPhD
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#1B6CA8] text-white border-[#145380]'
                    }`}
                  >
                    {s.name}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Sub-footer Note */}
        <div className="mt-1 flex items-center justify-between text-[8.5px] font-bold tracking-wider text-[#1A1A1A]/70">
          <span>SMCL (Spacecraft Mission & Control Lab)</span>
          <span>* Ph.D. (박사: 검정색) / M.S. (석사: 파란색) • 좌측 컬러 바로 과목 구분</span>
        </div>
      </div>
    </div>
  );
};
