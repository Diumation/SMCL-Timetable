import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  Copy, 
  Check, 
  FileSpreadsheet, 
  AlertCircle,
  RefreshCw,
  Printer,
  FileText
} from 'lucide-react';
import { Student, StudentCourse } from '../types';

interface CsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onImportStudents: (students: Student[]) => void;
  onOpenPrintModal?: () => void;
}

export const CsvModal: React.FC<CsvModalProps> = ({
  isOpen,
  onClose,
  students,
  onImportStudents,
  onOpenPrintModal,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Generate CSV text representation
  const generateCsvText = () => {
    let csv = '번호,과정(Ph.D/MS.),이름,과목코드,개설학과,교과목명,담당교수,학점,강의시간,비고\n';
    students.forEach((s) => {
      if (s.courses.length === 0) {
        csv += `${s.orderNumber},${s.degree === 'PhD' ? 'Ph.D' : 'MS.'},${s.name},,,,,,,,\n`;
      } else {
        s.courses.forEach((c, idx) => {
          const order = idx === 0 ? s.orderNumber : '';
          const deg = idx === 0 ? (s.degree === 'PhD' ? 'Ph.D' : 'MS.') : '';
          const name = idx === 0 ? s.name : '';
          csv += `${order},${deg},${name},"${c.courseCode || ''}","${c.department || ''}","${c.courseName || ''}","${c.professor || ''}","${c.credits || ''}","${c.timeString || ''}","${c.note || ''}"\n`;
        });
      }
    });
    return csv;
  };

  const handleCopyCsv = () => {
    const text = generateCsvText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const text = generateCsvText();
    const blob = new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SMCL_Coursework_Timetable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = () => {
    if (!csvInput.trim()) {
      setErrorMsg('CSV 텍스트를 입력해주세요.');
      return;
    }

    try {
      const lines = csvInput.trim().split('\n');
      const studentMap = new Map<string, Student>();
      let currentStudent: Student | null = null;
      let orderCounter = 1;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('2026') || line.startsWith('번호')) continue;

        // Split by comma or tab (handles quotes)
        const parts = parseCsvLine(line);
        if (parts.length < 3) continue;

        const orderStr = parts[0]?.trim();
        const degreeStr = parts[1]?.trim();
        const nameStr = parts[2]?.trim();
        const courseCode = parts[3]?.trim() || '';
        const department = parts[4]?.trim() || '';
        const courseName = parts[5]?.trim() || '';
        const professor = parts[6]?.trim() || '';
        const credits = parts[7]?.trim() || '3';
        const timeString = parts[8]?.trim() || '-';
        const note = parts[9]?.trim() || '';

        if (nameStr) {
          // New student row
          const deg = degreeStr.includes('박사') || degreeStr.toLowerCase().includes('ph') ? 'PhD' : 'Master';
          currentStudent = {
            id: `s-${Date.now()}-${orderCounter}`,
            orderNumber: parseInt(orderStr, 10) || orderCounter,
            name: nameStr,
            degree: deg,
            courses: [],
          };
          studentMap.set(nameStr, currentStudent);
          orderCounter++;
        }

        if (currentStudent && courseName) {
          currentStudent.courses.push({
            id: `c-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            courseCode,
            department,
            courseName,
            professor,
            credits: isNaN(Number(credits)) ? credits : Number(credits),
            timeString,
            note,
            isResearch: courseName.includes('논문연구') || timeString === '-',
            isSeminar: courseName.includes('세미나'),
          });
        }
      }

      const importedList = Array.from(studentMap.values());
      if (importedList.length === 0) {
        setErrorMsg('유효한 학생 데이터가 없습니다. CSV 형식을 확인해주세요.');
        return;
      }

      onImportStudents(importedList);
      setErrorMsg('');
      onClose();
    } catch (err) {
      setErrorMsg('CSV 파싱 오류가 발생했습니다. 형식을 다시 확인해주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-[#F9F8F6] rounded-xs max-w-2xl w-full p-6 shadow-2xl border-4 border-[#1A1A1A] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xs bg-[#1A1A1A] text-white flex items-center justify-center font-black">
              <FileSpreadsheet className="w-4 h-4 text-[#E14C27]" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-[#1A1A1A]">
                Excel / CSV 데이터 동기화
              </h3>
              <p className="text-xs font-bold text-[#1A1A1A]/60">
                시간표 데이터를 CSV 파일로 내보내거나, 엑셀 데이터를 일괄 등록/수정합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xs bg-[#1A1A1A] text-white hover:bg-black flex items-center justify-center text-xs font-black cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {/* Export Actions */}
          <div className="p-4 bg-white rounded-xs border-2 border-[#1A1A1A] space-y-3">
            <h4 className="font-black tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <Download className="w-4 h-4 text-[#E14C27]" />
              전체 시간표 데이터 내보내기 (Export)
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadCsv}
                className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-black text-white font-black tracking-wider rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#E14C27]" />
                CSV 다운로드 (.csv)
              </button>

              {onOpenPrintModal && (
                <button
                  onClick={onOpenPrintModal}
                  className="px-3.5 py-2 bg-[#E14C27] hover:bg-[#c93f1d] text-white font-black tracking-wider rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-[#c93f1d]"
                >
                  <FileText className="w-3.5 h-3.5 text-white" />
                  A4 PDF 내보내기 / 인쇄
                </button>
              )}

              <button
                onClick={handleCopyCsv}
                className="px-3.5 py-2 bg-white border border-[#1A1A1A] hover:bg-[#F1F0ED] font-black tracking-wider text-[#1A1A1A] rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#2ECC71]" /> : <Copy className="w-3.5 h-3.5 text-[#1A1A1A]" />}
                {copied ? '클립보드에 복사 완료!' : '클립보드에 복사'}
              </button>
            </div>
          </div>

          {/* Import Actions */}
          <div className="space-y-2">
            <h4 className="font-black tracking-wider text-[#1A1A1A] flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-[#E14C27]" />
              엑셀/CSV 데이터 붙여넣어 일괄 업데이트 (Import)
            </h4>
            <p className="text-[10px] font-bold text-[#1A1A1A]/60">
              엑셀 열 형식: 번호, 과정(Ph.D/MS.), 이름, 과목코드, 개설학과, 교과목명, 담당교수, 학점, 강의시간, 비고
            </p>

            <textarea
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              placeholder="예:&#10;1,Ph.D,임경선,AE.92200,항공우주공학과,논문연구(박사),이동헌,9,-,&#10;8,Ph.D,김윤중,AI.70100,김재철AI대학원,베이지안 기계학습,이주호,3,화/목 10:30 - 12:00,"
              className="w-full h-36 p-3 bg-white border border-[#1A1A1A] rounded-xs font-mono text-[11px] font-bold text-[#1A1A1A] focus:outline-hidden focus:ring-1 focus:ring-[#1A1A1A] resize-none"
            ></textarea>

            {errorMsg && (
              <div className="p-2.5 bg-[#E14C27]/10 border border-[#E14C27] rounded-xs text-[#E14C27] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-3 border-t-2 border-[#1A1A1A] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#F1F0ED] text-[#1A1A1A] text-xs font-black tracking-wider border border-[#1A1A1A] rounded-xs transition-colors cursor-pointer"
          >
            취소
          </button>

          <button
            onClick={handleImport}
            className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-xs font-black tracking-wider rounded-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E14C27]" />
            시간표 일괄 반영하기
          </button>
        </div>
      </div>
    </div>
  );
};

function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === ',' || c === '\t') && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}
