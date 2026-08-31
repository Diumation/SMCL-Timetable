import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  Sparkles,
  CalendarCheck
} from 'lucide-react';
import { Student } from '../types';
import { getDegreeBadgeClass } from '../utils/colorUtils';
import { DAYS, END_HOUR, getStudentsInClass, START_HOUR, TOTAL_HOURS } from '../utils/timeUtils';

interface LabMatrixViewProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
}

export const LabMatrixView: React.FC<LabMatrixViewProps> = ({
  students,
  onSelectStudent,
}) => {
  const [selectedCell, setSelectedCell] = useState<{
    day: '월' | '화' | '수' | '목' | '금';
    hour: number;
  }>({
    day: '월',
    hour: 10,
  });

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // Compute stats for selected cell
  const currentSlotData = getStudentsInClass(students, selectedCell.day, selectedCell.hour);

  // Find best meeting times (where fewest students have classes)
  const meetingSlots: { day: '월' | '화' | '수' | '목' | '금'; hour: number; inClassCount: number }[] = [];
  DAYS.forEach((day) => {
    hours.forEach((hour) => {
      const data = getStudentsInClass(students, day, hour);
      meetingSlots.push({ day, hour, inClassCount: data.inClass.length });
    });
  });

  // Sort by fewest in class
  meetingSlots.sort((a, b) => a.inClassCount - b.inClassCount);
  const bestSlots = meetingSlots.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Intro Banner (Editorial Masthead) */}
      <div className="bg-[#1A1A1A] text-white rounded-xs p-5 border-2 border-[#1A1A1A] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-[#E14C27] text-xs font-black tracking-wider">
            <Building2 className="w-4 h-4" />
            SMCL 연구실 재실 및 수업 상황
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            연구실 세미나 및 전체 미팅 최적 시간 검색
          </h2>
          <p className="text-xs font-bold text-white/70 mt-1">
            원하는 시간대 셀을 클릭하면 해당 시간에 수업 중인 연구원과 랩실 재실 연구원 명단을 즉시 확인합니다.
          </p>
        </div>

        {/* Top recommended slots badge */}
        <div className="bg-white/10 border border-white/20 p-3 rounded-xs">
          <div className="text-[10px] font-black tracking-wider text-white/80 flex items-center gap-1 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E14C27]" />
            추천 세미나 시간대
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bestSlots.slice(0, 3).map((slot, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCell({ day: slot.day, hour: slot.hour })}
                className="px-2 py-1 rounded-xs bg-white text-[#1A1A1A] hover:bg-[#F1F0ED] text-[10px] font-black tracking-wider transition-colors cursor-pointer"
              >
                {slot.day} {slot.hour}:00 ({students.length - slot.inClassCount}명 참석 가능)
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap Grid (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xs border-2 border-[#1A1A1A] p-5 shadow-none">
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-[#1A1A1A]">
            <h3 className="text-xs font-black tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#E14C27]" />
              주간 요일 및 시간대별 수업 인원 현황
            </h3>
            <div className="flex items-center gap-3 text-[10px] font-bold text-[#1A1A1A]/70">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#2ECC71]/20 border border-[#2ECC71]"></span> 0명 (전원 랩)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#F39C12]/20 border border-[#F39C12]"></span> 1~3명 수업
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#E14C27]/20 border border-[#E14C27]"></span> 4명 이상 수업
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 border-2 border-[#1A1A1A] rounded-xs overflow-hidden text-center">
            {/* Header */}
            <div className="py-2.5 bg-[#1A1A1A] border-b-2 border-r border-[#1A1A1A] text-white text-[10px] font-black tracking-wider">
              시간
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="py-2.5 bg-[#1A1A1A] border-b-2 border-r last:border-r-0 border-white/20 text-white text-xs font-black tracking-wider"
              >
                {day}요일
              </div>
            ))}

            {/* Matrix Cells */}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {/* Hour Header */}
                <div className="py-3 px-1 border-b border-r border-[#1A1A1A]/20 bg-[#F1F0ED] text-[11px] font-black text-[#1A1A1A] flex items-center justify-center">
                  {hour}:00
                </div>

                {DAYS.map((day) => {
                  const data = getStudentsInClass(students, day, hour);
                  const isSelected = selectedCell.day === day && selectedCell.hour === hour;
                  const inClassCount = data.inClass.length;

                  let cellBg = 'bg-[#2ECC71]/10 text-[#1A1A1A]';
                  if (inClassCount >= 4) {
                    cellBg = 'bg-[#E14C27]/15 text-[#1A1A1A] font-black';
                  } else if (inClassCount >= 1) {
                    cellBg = 'bg-[#F39C12]/15 text-[#1A1A1A] font-bold';
                  }

                  return (
                    <button
                      key={`${day}-${hour}`}
                      onClick={() => setSelectedCell({ day, hour })}
                      className={`py-3 px-1 border-b border-r last:border-r-0 border-[#1A1A1A]/20 transition-all cursor-pointer flex flex-col items-center justify-center ${cellBg} ${
                        isSelected ? 'ring-2 ring-[#1A1A1A] z-10 bg-[#1A1A1A]! text-white!' : 'hover:opacity-80'
                      }`}
                    >
                      <span className="text-xs font-black">
                        {inClassCount > 0 ? `${inClassCount}명 수업` : '전원 랩실'}
                      </span>
                      <span className={`text-[9px] font-bold ${isSelected ? 'text-white/70' : 'text-[#1A1A1A]/60'}`}>
                        {students.length - inClassCount}명 재실
                      </span>
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Selected Slot Detailed Panel (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xs border-2 border-[#1A1A1A] p-5 shadow-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#E14C27]" />
                <h3 className="text-xs font-black tracking-wider text-[#1A1A1A]">
                  {selectedCell.day}요일 {selectedCell.hour}:00 ~ {selectedCell.hour + 1}:00 현황
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-xs text-[10px] font-black bg-[#1A1A1A] text-white tracking-wider">
                총원 {students.length}명
              </span>
            </div>

            {/* In-Class Students */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-black text-[#1A1A1A] mb-2 tracking-wider">
                <span className="flex items-center gap-1.5 text-[#E14C27]">
                  <BookOpen className="w-3.5 h-3.5" />
                  수업 중 연구원 ({currentSlotData.inClass.length}명)
                </span>
                <span className="text-[10px] font-bold text-[#1A1A1A]/50">강의실 이동</span>
              </div>

              {currentSlotData.inClass.length === 0 ? (
                <div className="p-4 rounded-xs bg-[#2ECC71]/15 border border-[#2ECC71] text-[#1A1A1A] text-xs font-bold text-center">
                  🎉 이 시간대에 수업 중인 연구원이 없습니다! 24명 전원 세미나 참석 가능합니다.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {currentSlotData.inClass.map(({ student, courseName, time }) => {
                    const isPhD = student.degree === 'PhD';
                    return (
                      <div
                        key={student.id}
                        onClick={() => onSelectStudent(student.id)}
                        className="p-2 rounded-xs border border-[#1A1A1A]/20 bg-[#F9F8F6] hover:bg-[#F1F0ED] hover:border-[#1A1A1A] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-xs font-black ${
                            isPhD ? 'bg-[#1A1A1A] text-white' : 'bg-[#E14C27] text-white'
                          }`}>
                            {isPhD ? 'Ph.D' : 'MS.'}
                          </span>
                          <span className="text-xs font-black text-[#1A1A1A]">{student.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-[#E14C27] break-keep">{courseName}</div>
                          <div className="text-[9px] font-bold text-[#1A1A1A]/50">{time}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Available in Lab Students */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-black text-[#1A1A1A] mb-2 tracking-wider">
                <span className="flex items-center gap-1.5 text-[#2ECC71]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#2ECC71]" />
                  연구실 재실 연구원 ({currentSlotData.inLab.length}명)
                </span>
                <span className="text-[10px] font-bold text-[#1A1A1A]/50">연구실 근무</span>
              </div>

              <div className="flex flex-wrap gap-1 max-h-44 overflow-y-auto p-2 bg-[#F1F0ED] rounded-xs border border-[#1A1A1A]/20">
                {currentSlotData.inLab.map((s) => {
                  const isPhD = s.degree === 'PhD';
                  return (
                    <button
                      key={s.id}
                      onClick={() => onSelectStudent(s.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[10px] font-black transition-transform hover:scale-105 cursor-pointer ${
                        isPhD ? 'bg-[#1A1A1A] text-white' : 'bg-[#E14C27] text-white'
                      }`}
                    >
                      <span className="text-[8px] opacity-75 font-extrabold">
                        {isPhD ? 'Ph.D' : 'MS.'}
                      </span>
                      <span>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[#1A1A1A] text-xs font-bold text-[#1A1A1A] flex items-center justify-between">
            <span className="text-[10px] tracking-wider text-[#1A1A1A]/60">세미나 및 미팅 적합도:</span>
            <span className={`font-black tracking-wider ${
              currentSlotData.inClass.length <= 2 ? 'text-[#2ECC71]' : 'text-[#E14C27]'
            }`}>
              {currentSlotData.inClass.length === 0
                ? '★ 최적 (100% 전원 참석 가능)'
                : currentSlotData.inClass.length <= 2
                ? '○ 추천 (대다수 참석 가능)'
                : '△ 주의 (다수 연구원 수업 중)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

