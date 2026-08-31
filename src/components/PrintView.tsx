import React from 'react';
import { Student } from '../types';
import { CATEGORY_COLORS } from '../utils/colorUtils';
import { buildTimetableBlocks, DAYS, layoutDayBlocks, START_HOUR, TOTAL_HOURS } from '../utils/timeUtils';

interface PrintViewProps {
  students: Student[];
}

export const PrintView: React.FC<PrintViewProps> = ({ students }) => {
  const allBlocks = buildTimetableBlocks(students);
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  const phDCount = students.filter((s) => s.degree === 'PhD').length;
  const masterCount = students.filter((s) => s.degree === 'Master').length;

  const researchOnlyStudents = students.filter(
    (s) => s.courses.every((c) => c.isResearch || !c.timeString || c.timeString === '-')
  );

  const phDCountForBlock = (block: any) => block.students.filter((s: any) => s.degree === 'PhD').length;
  const masterCountForBlock = (block: any) => block.students.filter((s: any) => s.degree === 'Master').length;

  return (
    <div className="hidden print:flex flex-col justify-between p-4 max-w-[210mm] min-h-[297mm] mx-auto bg-white text-[#1A1A1A] font-sans box-border">
      {/* Printable Document Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2 mb-1.5 shrink-0">
        <div>
          <div className="text-[9.5px] font-black tracking-widest text-[#E14C27]">
            SMCL • Spacecraft Mission & Control Lab
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1A1A1A]">
            대학원생 Coursework 주간 종합 시간표
          </h1>
          <p className="text-[10.5px] text-[#1A1A1A]/70 font-bold tracking-wider">
            총원 {students.length}명 (Ph.D {phDCount}명 / MS. {masterCount}명)
          </p>
        </div>
        <div className="text-right text-[9px] font-bold text-[#1A1A1A]/60 tracking-wider">
          <div>출력일자: {new Date().toLocaleDateString('ko-KR')}</div>
          <div className="font-black text-[#1A1A1A] text-[10px]">A4 PORTRAIT MASTER</div>
        </div>
      </div>

      {/* Printable Grid Table - Stretched across A4 */}
      <div className="border-2 border-[#1A1A1A] bg-white flex-1 flex flex-col">
        {/* Day Header */}
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
                  <span className="ml-1 text-[8.5px] opacity-80 font-normal">({count})</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 9 Hours Grid Stretched */}
        <div className="relative flex flex-1 bg-white min-h-[890px]">
          {/* Time Column */}
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
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 border-b last:border-b-0 border-[#1A1A1A]/10 flex flex-col justify-end min-h-[98px]"
                    >
                      <div className="w-full border-b border-dashed border-[#1A1A1A]/10 h-1/2"></div>
                    </div>
                  ))}

                  {positionedBlocks.map((block, idx) => {
                    const colorTheme = CATEGORY_COLORS[block.category] || CATEGORY_COLORS.aerospace;
                    const isNarrow = block.widthPercent <= 48 || block.totalColumns >= 2;
                    const isVeryNarrow = block.widthPercent <= 28 || block.totalColumns >= 3;
                    const isUltraNarrow = block.widthPercent <= 22 || block.totalColumns >= 4;

                    const pCount = phDCountForBlock(block);
                    const mCount = masterCountForBlock(block);

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
                          className={`h-full w-full rounded-none ${colorTheme.blockBorder} ${colorTheme.blockBg} p-1.5 flex flex-col justify-between overflow-hidden shadow-2xs`}
                        >
                          {/* Top: Course Name & Divider & Headcount */}
                          <div>
                            <h4
                              className={`font-black text-[#1A1A1A] tracking-tighter leading-[1.18] ${
                                isUltraNarrow 
                                  ? 'text-[8.5px]' 
                                  : isVeryNarrow 
                                  ? 'text-[9.5px]' 
                                  : isNarrow 
                                  ? 'text-[10.5px]' 
                                  : 'text-[12px]'
                              }`}
                              style={{ wordBreak: isNarrow ? 'break-all' : 'keep-all' }}
                            >
                              {block.courseName}
                            </h4>

                            {/* Divider line */}
                            <div className="my-1 border-t border-[#1A1A1A]/30 w-full shrink-0" />

                            {/* Headcount */}
                            <div className="font-black text-[#1A1A1A]/90 tracking-tighter leading-tight shrink-0 mb-1">
                              {isUltraNarrow ? (
                                <div className="flex flex-col text-[7px] leading-tight">
                                  <span>P.{pCount} / M.{mCount}</span>
                                </div>
                              ) : isVeryNarrow ? (
                                <div className="flex flex-col text-[8px] leading-tight">
                                  <span>Ph.D.{pCount} / MS.{mCount}</span>
                                </div>
                              ) : (
                                <span className="text-[9px]">
                                  Ph.D. {pCount}명 / MS. {mCount}명
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bottom: Student Badges */}
                          {block.students.length > 0 && (
                            <div className="flex flex-col gap-0.5 mt-auto pt-1 w-full overflow-hidden">
                              {block.students.map((s) => {
                                const isPhD = s.degree === 'PhD';
                                return (
                                  <div
                                    key={s.id}
                                    className={`w-full flex items-center justify-between rounded-none font-black border leading-tight shrink-0 ${
                                      isUltraNarrow
                                        ? 'px-0.5 py-0.2 text-[7px]'
                                        : isVeryNarrow
                                        ? 'px-1 py-0.5 text-[8px]'
                                        : isNarrow
                                        ? 'px-1 py-0.5 text-[8.5px]'
                                        : 'px-1.5 py-0.5 text-[9.5px]'
                                    } ${
                                      isPhD
                                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                        : 'bg-[#E14C27] text-white border-[#c93f1d]'
                                    }`}
                                  >
                                    <span className="opacity-80 text-[0.85em]">{isPhD ? 'Ph.D' : 'MS.'}</span>
                                    <span className="font-bold tracking-tight">{s.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
          <div className="flex flex-wrap items-center gap-1">
            {researchOnlyStudents.map((s) => {
              const isPhD = s.degree === 'PhD';
              return (
                <span
                  key={s.id}
                  className={`px-1.5 py-0.5 rounded-none text-[9px] font-black border ${
                    isPhD
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#E14C27] text-white border-[#c93f1d]'
                  }`}
                >
                  <span className="text-[7.5px] opacity-80 mr-0.5">{isPhD ? 'Ph.D' : 'MS.'}</span>
                  {s.name}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between text-[8.5px] font-bold tracking-wider text-[#1A1A1A]/70">
          <span>SMCL (Spacecraft Mission & Control Lab)</span>
          <span>* Ph.D (박사: 검정색) / MS. (석사: 주황색)</span>
        </div>
      </div>
    </div>
  );
};
