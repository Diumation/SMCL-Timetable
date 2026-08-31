import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles, 
  BookOpen, 
  Clock, 
  User, 
  AlertCircle
} from 'lucide-react';
import { Student, StudentCourse } from '../types';
import { getDegreeBadgeClass } from '../utils/colorUtils';

interface AddDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onUpdateStudents: (updatedStudents: Student[]) => void;
  initialStudentId?: string | null;
  initialCourseData?: { courseCode: string; courseName: string } | null;
}

export const AddDropModal: React.FC<AddDropModalProps> = ({
  isOpen,
  onClose,
  students,
  onUpdateStudents,
  initialStudentId,
  initialCourseData,
}) => {
  if (!isOpen) return null;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );

  // Form State for adding a new course
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [department, setDepartment] = useState('항공우주공학과');
  const [professor, setProfessor] = useState('이동헌');
  const [credits, setCredits] = useState<number | string>(3);
  const [timeString, setTimeString] = useState('월/수 10:30 - 12:00');
  const [note, setNote] = useState('');
  const [isResearch, setIsResearch] = useState(false);

  // Preset known courses in the lab for one-click selection
  const knownCourses: {
    courseCode: string;
    courseName: string;
    department: string;
    professor: string;
    credits: number;
    timeString: string;
  }[] = [
    {
      courseCode: 'AE.89900',
      courseName: '항공우주공학 특론<행성간 탐사 임무 설계>',
      department: '항공우주공학과',
      professor: '이동헌',
      credits: 3,
      timeString: '월/수 10:30 - 12:00',
    },
    {
      courseCode: 'SPE.52000',
      courseName: '위성공학개론',
      department: '우주탐사공학학제전공',
      professor: '윤효상',
      credits: 3,
      timeString: '월/수 14:30 - 16:00',
    },
    {
      courseCode: 'AX.50011',
      courseName: '계산과학을 위한 기계학습',
      department: 'AX학과',
      professor: '이승철',
      credits: 3,
      timeString: '화/목 14:30 - 16:00',
    },
    {
      courseCode: 'AI.70100',
      courseName: '베이지안 기계학습',
      department: '김재철AI대학원',
      professor: '이주호',
      credits: 3,
      timeString: '화/목 10:30 - 12:00',
    },
    {
      courseCode: 'AI.50400',
      courseName: '인공지능을 위한 프로그래밍',
      department: '김재철AI대학원',
      professor: '최윤재',
      credits: 3,
      timeString: '화/목 10:30 - 12:00',
    },
    {
      courseCode: 'CC.50000',
      courseName: 'Scientific Writing',
      department: '공통필수',
      professor: '김희진',
      credits: 3,
      timeString: '화/목 13:00 - 14:30',
    },
    {
      courseCode: 'AE.55001',
      courseName: '비행체 최적제어 개론',
      department: '항공우주공학과',
      professor: '안재명',
      credits: 3,
      timeString: '화/목 09:00 - 10:30',
    },
    {
      courseCode: 'AE.55006',
      courseName: '항공우주응용 인공지능 기법',
      department: '항공우주공학과',
      professor: '최한림',
      credits: 3,
      timeString: '화/목 14:30 - 16:00',
    },
    {
      courseCode: 'AE.58070',
      courseName: '미래항공우주융합기술',
      department: '항공우주공학과',
      professor: '최지환',
      credits: 3,
      timeString: '월/수 14:30 - 16:00',
    },
    {
      courseCode: 'ME.50091',
      courseName: '랜덤데이타:해석 및 처리',
      department: '기계공학과',
      professor: '박용화',
      credits: 3,
      timeString: '월/수 14:30 - 16:00',
    },
    {
      courseCode: 'IE.92200',
      courseName: '무기체계분석',
      department: '산업및시스템공학과',
      professor: '권오정',
      credits: 3,
      timeString: '월/수 14:30 - 16:00',
    },
    {
      courseCode: 'AE.93100',
      courseName: '세미나(석사)',
      department: '항공우주공학과',
      professor: '이동헌',
      credits: 1,
      timeString: '화 16:00 - 18:00',
    },
    {
      courseCode: 'HSS.49902',
      courseName: '스포츠특강<요가와 생활>',
      department: '디지털인문사회과학부',
      professor: '남미희',
      credits: 2,
      timeString: '월 13:00 - 15:00',
    },
    {
      courseCode: 'HSS.40021',
      courseName: '체력육성',
      department: '디지털인문사회과학부',
      professor: '하희문',
      credits: 2,
      timeString: '금 15:00 - 17:00',
    },
    {
      courseCode: 'CC.50001',
      courseName: '리더십강좌<석사 리더십 강좌(A)>',
      department: '공통필수',
      professor: '담당교수미정',
      credits: 1,
      timeString: '금 16:00 - 18:00',
    },
  ];

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const handleSelectPreset = (preset: typeof knownCourses[0]) => {
    setCourseCode(preset.courseCode);
    setCourseName(preset.courseName);
    setDepartment(preset.department);
    setProfessor(preset.professor);
    setCredits(preset.credits);
    setTimeString(preset.timeString);
    setIsResearch(preset.courseName.includes('논문연구'));
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !selectedStudentId) return;

    const newCourse: StudentCourse = {
      id: 'c-' + Date.now(),
      courseCode: courseCode.trim() || 'AE.00000',
      department: department.trim() || '항공우주공학과',
      courseName: courseName.trim(),
      professor: professor.trim() || '담당교수',
      credits: Number(credits) || 3,
      timeString: isResearch ? '-' : timeString.trim(),
      note: note.trim(),
      isResearch: isResearch || courseName.includes('논문연구'),
      isSeminar: courseName.includes('세미나'),
    };

    const updated = students.map((s) => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          courses: [...s.courses, newCourse],
        };
      }
      return s;
    });

    onUpdateStudents(updated);

    // Reset some fields
    setNote('');
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = students.map((s) => {
      if (s.id === selectedStudentId) {
        return {
          ...s,
          courses: s.courses.filter((c) => c.id !== courseId),
        };
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#F9F8F6] rounded-xs max-w-3xl w-full p-6 shadow-2xl border-4 border-[#1A1A1A] animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-black tracking-wider rounded-xs bg-[#1A1A1A] text-white">
                수강 변경 및 정정
              </span>
              <span className="text-xs font-bold text-[#1A1A1A]/70">실시간 자동 동기화</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-[#1A1A1A] mt-1">
              연구원 수강과목 추가 / 삭제 / 변경
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xs bg-[#1A1A1A] text-white hover:bg-black flex items-center justify-center text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          
          {/* Step 1: Select Student */}
          <div>
            <label className="block text-xs font-black tracking-wider text-[#1A1A1A] mb-2">
              1. 대상 연구원 선택 (총 {students.length}명)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#F1F0ED] rounded-xs border-2 border-[#1A1A1A]">
              {students.map((s) => {
                const isSelected = s.id === selectedStudentId;
                const isPhD = s.degree === 'PhD';
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudentId(s.id)}
                    className={`p-1.5 rounded-xs text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white shadow-none'
                        : 'bg-white text-[#1A1A1A] border border-[#1A1A1A]/20 hover:border-[#1A1A1A]'
                    }`}
                  >
                    <span>{s.name}</span>
                    <span className={`text-[8px] px-1 py-0.2 rounded-xs ${
                      isSelected ? 'bg-white text-[#1A1A1A]' : isPhD ? 'bg-[#1A1A1A] text-white' : 'bg-[#E14C27] text-white'
                    }`}>
                      {isPhD ? 'Ph.D' : 'MS.'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Enrolled Courses of this student */}
          {currentStudent && (
            <div className="p-3.5 bg-white rounded-xs border-2 border-[#1A1A1A]">
              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#1A1A1A]/20">
                <span className="text-xs font-black tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#E14C27]" />
                  {currentStudent.name} 연구원 ({currentStudent.degree === 'PhD' ? 'Ph.D' : 'MS.'}) 현재 수강 과목 ({currentStudent.courses.length}개)
                </span>
                <span className="text-xs font-bold text-[#E14C27]">
                  총 {currentStudent.courses.reduce((acc, c) => acc + Number(c.credits || 0), 0)}학점 이수 중
                </span>
              </div>

              <div className="space-y-1.5">
                {currentStudent.courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 bg-[#F9F8F6] rounded-xs border border-[#1A1A1A]/20 flex items-center justify-between text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#1A1A1A]/60">{c.courseCode}</span>
                      <span className="font-black text-[#1A1A1A]">{c.courseName}</span>
                      <span className="text-[#1A1A1A]/60">({c.professor} • {c.credits}학점)</span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-[#F1F0ED] border border-[#1A1A1A]/20 text-[#1A1A1A]">
                        {c.timeString || '-'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-1 text-[#1A1A1A]/40 hover:text-[#E14C27] hover:bg-[#E14C27]/10 rounded-xs transition-colors cursor-pointer"
                      title="과목 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Add New Course */}
          <form onSubmit={handleAddCourse} className="space-y-4 border-t-2 border-[#1A1A1A] pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#E14C27]" />
                2. 신규 과목 등록
              </label>
              <span className="text-[10px] font-bold text-[#1A1A1A]/60">아래 빈출 과목 템플릿 클릭 시 자동 입력</span>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[10px] font-black tracking-wider text-[#1A1A1A]/60 mb-1.5 block">
                연구실 빈출 교과목 프리셋:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {knownCourses.map((kc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(kc)}
                    className="px-2 py-1 bg-white hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] rounded-xs text-[10px] font-bold tracking-wider transition-colors cursor-pointer"
                  >
                    {kc.courseName} ({kc.timeString})
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-black tracking-wider text-[#1A1A1A] mb-1">과목 코드</label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="예: AE.89900"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                  required
                />
              </div>

              <div>
                <label className="block font-black tracking-wider text-[#1A1A1A] mb-1">교과목명</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="예: 항공우주공학 특론"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                  required
                />
              </div>

              <div>
                <label className="block font-black tracking-wider text-[#1A1A1A] mb-1">개설 학과</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="예: 항공우주공학과"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-black tracking-wider text-[#1A1A1A] mb-1">담당 교수</label>
                <input
                  type="text"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  placeholder="예: 이동헌"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-black tracking-wider text-[#1A1A1A] mb-1">학점</label>
                <input
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="12"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-black tracking-wider text-[#1A1A1A] mb-1">강의 시간</label>
                <input
                  type="text"
                  value={timeString}
                  onChange={(e) => setTimeString(e.target.value)}
                  disabled={isResearch}
                  placeholder="예: 월/수 10:30 - 12:00"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] disabled:bg-[#F1F0ED] disabled:text-[#1A1A1A]/40"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-black text-[#1A1A1A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isResearch}
                  onChange={(e) => setIsResearch(e.target.checked)}
                  className="rounded-xs text-[#1A1A1A] focus:ring-0"
                />
                논문연구 (강의 시간 없음)
              </label>

              <div className="flex-1">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="비고 (선택 사항: 예: 전공 학점 이수 완료 등)"
                  className="w-full px-3 py-1.5 bg-white border border-[#1A1A1A] rounded-xs text-xs font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-black tracking-wider rounded-xs shadow-none transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#E14C27]" />
                {currentStudent?.name} 시간표에 즉시 반영
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t-2 border-[#1A1A1A] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F1F0ED] text-[#1A1A1A] text-xs font-black tracking-wider border border-[#1A1A1A] rounded-xs transition-colors cursor-pointer"
          >
            완료 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
