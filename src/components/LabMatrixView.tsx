import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  Search,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Student } from '../types';
import { DAYS, START_HOUR, TOTAL_HOURS, getStudentsInClass } from '../utils/timeUtils';

interface LabMatrixViewProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
}

export const LabMatrixView: React.FC<LabMatrixViewProps> = ({
  students,
  onSelectStudent,
}) => {
  const [selectedDay, setSelectedDay] = useState<'월' | '화' | '수' | '목' | '금'>('월');
  const [selectedHour, setSelectedHour] = useState<number>(14);
  const [degreeFilter, setDegreeFilter] = useState<'ALL' | 'PhD' | 'Master'>('ALL');

  const filteredStudents = students.filter((s) => {
    if (degreeFilter === 'PhD') return s.degree === 'PhD';
    if (degreeFilter === 'Master') return s.degree === 'Master';
    return true;
  });

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // Get in-class and in-lab students for the selected slot
  const { inClass, inLab } = getStudentsInClass(filteredStudents, selectedDay, selectedHour);

  return (
    <div className="space-y-4">
      {/* Main Interactive Grid Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Hourly Matrix Heatmap (8 Cols) */}
        <div className="lg:col-span-7 bg-[#F9F8F6] border-2 border-[#1A1A1A] p-5 rounded-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1A1A1A]" />
              <h3 className="text-sm font-black text-[#1A1A1A] tracking-wider">
                주간 시간대별 재실 인원 매트릭스
              </h3>
            </div>

            {/* Degree Filter Chips */}
            <div className="flex items-center bg-[#F1F0ED] border border-[#1A1A1A] p-0.5 rounded-xs text-xs">
              <button
                onClick={() => setDegreeFilter('ALL')}
                className={`px-2.5 py-0.5 font-black transition-colors cursor-pointer rounded-xs ${
                  degreeFilter === 'ALL' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#1A1A1A] hover:bg-white/50'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setDegreeFilter('PhD')}
                className={`px-2.5 py-0.5 font-black transition-colors cursor-pointer rounded-xs flex items-center gap-1.5 ${
                  degreeFilter === 'PhD' ? 'bg-[#1A1A1A] text-white shadow-xs' : 'text-[#1A1A1A] hover:bg-white/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${degreeFilter === 'PhD' ? 'bg-white' : 'bg-[#1A1A1A]'}`}></span>
                Ph.D.
              </button>
              <button
                onClick={() => setDegreeFilter('Master')}
                className={`px-2.5 py-0.5 font-black transition-colors cursor-pointer rounded-xs flex items-center gap-1.5 ${
                  degreeFilter === 'Master' ? 'bg-[#1B6CA8] text-white shadow-xs' : 'text-[#1A1A1A] hover:bg-white/50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${degreeFilter === 'Master' ? 'bg-white' : 'bg-[#1B6CA8]'}`}></span>
                M.S.
              </button>
            </div>
          </div>

          {/* Day Selection Bar */}
          <div className="grid grid-cols-5 gap-1">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`py-2 text-center text-xs font-black border transition-all cursor-pointer rounded-xs ${
                  selectedDay === day
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                    : 'bg-white text-[#1A1A1A] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
                }`}
              >
                {day}요일
              </button>
            ))}
          </div>

          {/* Hourly Slots Table for the Selected Day */}
          <div className="space-y-1.5 pt-2">
            {hours.map((hour) => {
              const { inClass: classList, inLab: labList } = getStudentsInClass(filteredStudents, selectedDay, hour);
              const isSelected = selectedHour === hour;
              const total = filteredStudents.length;
              const labPercent = total > 0 ? (labList.length / total) * 100 : 0;

              return (
                <div
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`p-2.5 border-2 rounded-xs transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-white border-[#1B6CA8] shadow-sm ring-1 ring-[#1B6CA8]'
                      : 'bg-white border-[#1A1A1A]/20 hover:border-[#1A1A1A] hover:bg-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-14 text-center font-black text-xs px-1.5 py-0.5 rounded-xs border ${
                      isSelected 
                        ? 'bg-[#1B6CA8] text-white border-[#145380]' 
                        : 'bg-[#F1F0ED] text-[#1A1A1A] border-[#1A1A1A]/30'
                    }`}>
                      {hour}:00
                    </span>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-[#1A1A1A]">
                          연구실 재실: {labList.length}명
                        </span>
                        <span className="text-[11px] font-bold text-[#1A1A1A]/60">
                          (수업 중: {classList.length}명)
                        </span>
                      </div>
                      
                      {/* Mini Bar Gauge */}
                      <div className="w-36 sm:w-48 h-1.5 bg-[#F1F0ED] rounded-full overflow-hidden mt-1 border border-[#1A1A1A]/10">
                        <div 
                          className="h-full bg-[#1A1A1A]" 
                          style={{ width: `${labPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {classList.length > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#1B6CA8] bg-[#1B6CA8]/10 px-2 py-0.5 rounded-xs border border-[#1B6CA8]/30 max-w-[180px] truncate">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        <span className="truncate">{classList.map(c => c.courseName).slice(0, 2).join(', ')}</span>
                      </div>
                    )}
                    <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-[#1B6CA8]' : 'text-[#1A1A1A]/30'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Drilldown for Selected Day & Hour (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Active Slot Status Box */}
          <div className="bg-[#1A1A1A] text-white p-4 border-2 border-[#1A1A1A] rounded-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#1B6CA8] uppercase">
                선택된 시간대 상세 조회
              </span>
              <h4 className="text-xl font-black tracking-tight">
                {selectedDay}요일 {selectedHour}:00 ~ {selectedHour + 1}:00
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-[#1B6CA8]">{inLab.length}</span>
              <span className="text-xs font-bold text-white/60"> / {filteredStudents.length}명 재실</span>
            </div>
          </div>

          {/* In Lab List Card */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-xs shadow-none space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/20">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                <h4 className="text-xs font-black text-[#1A1A1A] tracking-wider">
                  연구실 재실 가능 연구원 ({inLab.length}명)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#1A1A1A]/60">클릭 시 학생 시간표 이동</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {inLab.map((student) => {
                const isPhD = student.degree === 'PhD';
                return (
                  <button
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className="p-2 text-left bg-[#F9F8F6] hover:bg-[#F1F0ED] border border-[#1A1A1A]/30 rounded-xs transition-colors cursor-pointer group flex items-center justify-between"
                  >
                    <div>
                      <span className={`text-[9px] font-black px-1 py-0.2 rounded-2xs mr-1 ${
                        isPhD ? 'bg-[#1A1A1A] text-white' : 'bg-[#1B6CA8] text-white'
                      }`}>
                        {isPhD ? 'Ph.D.' : 'M.S.'}
                      </span>
                      <span className="text-xs font-black text-[#1A1A1A] group-hover:text-[#1B6CA8] inline-flex items-center gap-1">
                        <span>{student.name}</span>
                        {(student.name === '이윤일' || student.orderNumber === 2) && <span className="text-[10px]" title="랩장">👑</span>}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* In Class (Coursework) List Card */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-xs shadow-none space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1A1A1A]/20">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#1B6CA8]" />
                <h4 className="text-xs font-black text-[#1A1A1A] tracking-wider">
                  현재 수업 진행 중 연구원 ({inClass.length}명)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-[#1B6CA8]">Coursework</span>
            </div>

            {inClass.length === 0 ? (
              <p className="text-xs font-bold text-[#1A1A1A]/50 py-4 text-center">
                해당 시간대에 진행 중인 수업이 없습니다. (전원 연구실 재실)
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {inClass.map(({ student, courseName, time }) => {
                  const isPhD = student.degree === 'PhD';
                  return (
                    <div
                      key={student.id}
                      onClick={() => onSelectStudent(student.id)}
                      className="p-2.5 bg-[#F9F8F6] border border-[#1A1A1A]/30 rounded-xs hover:border-[#1A1A1A] transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-2xs ${
                          isPhD ? 'bg-[#1A1A1A] text-white' : 'bg-[#1B6CA8] text-white'
                        }`}>
                          {isPhD ? 'Ph.D.' : 'M.S.'}
                        </span>
                        <span className="text-xs font-black text-[#1A1A1A] inline-flex items-center gap-1">
                          <span>{student.name}</span>
                          {(student.name === '이윤일' || student.orderNumber === 2) && <span className="text-[10px]" title="랩장">👑</span>}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-black text-[#1B6CA8] leading-tight">
                          {courseName}
                        </p>
                        <p className="text-[10px] font-bold text-[#1A1A1A]/60">
                          {time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
