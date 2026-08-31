import React, { useRef, useState, useEffect } from 'react';
import { Printer, Download, X, Check, Loader2, Users, Layers, GraduationCap } from 'lucide-react';
import { FilterDegree, Student } from '../types';
import { CATEGORY_COLORS, getCourseColorTheme } from '../utils/colorUtils';
import { buildTimetableBlocks, DAYS, layoutDayBlocks, START_HOUR, TOTAL_HOURS } from '../utils/timeUtils';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  initialFilterDegree?: FilterDegree;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  students,
  initialFilterDegree = 'ALL',
}) => {
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const offscreenContainerRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const [printFilterDegree, setPrintFilterDegree] = useState<FilterDegree>(initialFilterDegree);

  // Synchronize when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setPrintFilterDegree(initialFilterDegree);
    }
  }, [isOpen, initialFilterDegree]);

  if (!isOpen) return null;

  const totalPhdCount = students.filter((s) => s.degree === 'PhD').length;
  const totalMasterCount = students.filter((s) => s.degree === 'Master').length;

  // Filter students based on printFilterDegree
  const activeStudents = students.filter((s) => {
    if (printFilterDegree === 'PhD') return s.degree === 'PhD';
    if (printFilterDegree === 'Master') return s.degree === 'Master';
    return true;
  });

  const allBlocks = buildTimetableBlocks(activeStudents);
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => START_HOUR + i);

  // 수업 없는 인원 (선택된 학위 내에서 전공연구 전담 및 수강과목 없는 학생)
  const researchOnlyStudents = activeStudents.filter(
    (s) => s.courses.every((c) => c.isResearch || !c.timeString || c.timeString === '-')
  );

  // Helper counts for block
  const phDCountForBlock = (block: any) => block.students.filter((s: any) => s.degree === 'PhD').length;
  const masterCountForBlock = (block: any) => block.students.filter((s: any) => s.degree === 'Master').length;

  // PDF Export Function using dedicated offscreen element to avoid clipping & stretch across A4
  const handleExportPdf = async () => {
    const targetElement = offscreenContainerRef.current || previewContainerRef.current;
    if (!targetElement) return;

    try {
      setIsExportingPdf(true);

      const dataUrl = await toPng(targetElement, {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: '#FFFFFF',
        cacheBust: true,
        skipFonts: true,
        fontEmbedCSS: '',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error('Image load failed'));
      });

      // A4 Portrait dimensions: 210mm x 297mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 8;
      const contentWidth = pdfWidth - margin * 2; // 194mm
      const maxPageHeight = pdfHeight - margin * 2; // 281mm

      const imgAspect = img.width / img.height;
      let renderWidth = contentWidth;
      let renderHeight = renderWidth / imgAspect;

      // Scale to fit completely within single page
      if (renderHeight > maxPageHeight) {
        renderHeight = maxPageHeight;
        renderWidth = renderHeight * imgAspect;
      }

      const xOffset = margin + (contentWidth - renderWidth) / 2;
      const yOffset = margin + (maxPageHeight - renderHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, renderWidth, renderHeight, undefined, 'FAST');
      const dateStr = new Date().toISOString().slice(0, 10);
      const degreeSuffix =
        printFilterDegree === 'PhD'
          ? 'PhD'
          : printFilterDegree === 'Master'
          ? 'Master'
          : 'All';
      pdf.save(`SMCL_Coursework_Timetable_${degreeSuffix}_${dateStr}.pdf`);

      setPdfExported(true);
      setTimeout(() => setPdfExported(false), 2500);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('PDF 파일 생성 중 오류가 발생했습니다. 브라우저 인쇄 창에서 [PDF로 저장]을 선택해 주세요.');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  // Reusable timetable component for preview and offscreen PDF rendering (A4 1:1.414 Proportional Stretched)
  const renderTimetableDocument = (containerRef?: React.RefObject<HTMLDivElement>) => (
    <div 
      ref={containerRef}
      className="w-[760px] bg-white p-4 border-2 border-[#1A1A1A] text-[#1A1A1A] font-sans box-border flex flex-col justify-between"
      style={{ width: '760px', minWidth: '760px', minHeight: '1070px', height: '1070px' }}
    >
      {/* Printable Document Header */}
      <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2 mb-1.5 shrink-0">
        <div>
          <div className="text-[9.5px] font-black tracking-widest text-[#2563EB]">
            SMCL • Spacecraft Mission & Control Lab
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1A1A1A]">
            {printFilterDegree === 'PhD'
              ? 'SMCL 연구원 시간표 (박사과정)'
              : printFilterDegree === 'Master'
              ? 'SMCL 연구원 시간표 (석사과정)'
              : 'SMCL 연구원 시간표 (주간 종합)'}
          </h1>
          <p className="text-[10.5px] text-[#1A1A1A]/70 font-bold tracking-wider">
            {printFilterDegree === 'PhD'
              ? `박사과정 총원 ${totalPhdCount}명 (Ph.D. Coursework & Research)`
              : printFilterDegree === 'Master'
              ? `석사과정 총원 ${totalMasterCount}명 (M.S. Coursework & Research)`
              : `총원 ${students.length}명 (Ph.D. ${totalPhdCount}명 / M.S. ${totalMasterCount}명)`}
          </p>
        </div>
        <div className="text-right text-[9px] font-bold text-[#1A1A1A]/60 tracking-wider">
          <div>출력일자: {new Date().toLocaleDateString('ko-KR')}</div>
          <div className="font-black text-[#1A1A1A] text-[10px]">
            {printFilterDegree === 'PhD'
              ? 'A4 PORTRAIT • Ph.D.'
              : printFilterDegree === 'Master'
              ? 'A4 PORTRAIT • M.S.'
              : 'A4 PORTRAIT • MASTER'}
          </div>
        </div>
      </div>

      {/* Continuous Precision Coordinate Timetable Grid - Exactly matching screen MasterTimetable */}
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

        {/* Grid Body with 9 Hours (09:00 - 18:00) */}
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

                  {/* Positioned Blocks (Identical to Main View) */}
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

                    // Filtered students inside this block according to selected print degree
                    const visibleStudents = block.students.filter((s) => {
                      if (printFilterDegree === 'PhD') return s.degree === 'PhD';
                      if (printFilterDegree === 'Master') return s.degree === 'Master';
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
                          {/* Student Name Tags Grid */}
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

      {/* Printable Footer: 수업 없는 인원 (이름만 깔끔하게 표기) */}
      <div className="mt-2 pt-1.5 border-t-2 border-[#1A1A1A] shrink-0">
        <div className="flex flex-row items-center justify-between gap-2 bg-[#F1F0ED] p-2 border border-[#1A1A1A]">
          <div className="flex items-center gap-1 shrink-0">
            <Users className="w-3.5 h-3.5 text-[#1B6CA8]" />
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

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Hidden Full-Height Offscreen Rendering Target specifically for jsPDF Capture */}
      <div 
        style={{ position: 'fixed', left: '-99999px', top: 0, zIndex: -100 }}
        aria-hidden="true"
      >
        {renderTimetableDocument(offscreenContainerRef)}
      </div>

      <div 
        className="bg-white border-2 border-[#1A1A1A] w-full max-w-[900px] max-h-[96vh] flex flex-col rounded-xs shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="bg-[#F1F0ED] border-b-2 border-[#1A1A1A] p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#1B6CA8]" />
            <h2 className="text-sm font-black text-[#1A1A1A] tracking-wider">
              시간표 인쇄 및 A4 세로 PDF 내보내기
            </h2>
          </div>

          {/* Segmented Filter Switch: 종합(ALL) / 박사(PhD) / 석사(Master) */}
          <div className="flex items-center bg-white border border-[#1A1A1A] p-0.5 rounded-xs shadow-2xs">
            <button
              onClick={() => setPrintFilterDegree('ALL')}
              className={`px-2.5 py-1 text-xs font-black transition-all cursor-pointer rounded-xs flex items-center gap-1 ${
                printFilterDegree === 'ALL'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F1F0ED]'
              }`}
            >
              <Layers className="w-3 h-3" />
              종합 (전체 {students.length}명)
            </button>
            <button
              onClick={() => setPrintFilterDegree('PhD')}
              className={`px-2.5 py-1 text-xs font-black transition-all cursor-pointer rounded-xs flex items-center gap-1 ${
                printFilterDegree === 'PhD'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F1F0ED]'
              }`}
            >
              <GraduationCap className="w-3 h-3 text-[#1A1A1A]" />
              박사 (Ph.D. {totalPhdCount}명)
            </button>
            <button
              onClick={() => setPrintFilterDegree('Master')}
              className={`px-2.5 py-1 text-xs font-black transition-all cursor-pointer rounded-xs flex items-center gap-1 ${
                printFilterDegree === 'Master'
                  ? 'bg-[#1B6CA8] text-white shadow-xs'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F1F0ED]'
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              석사 (M.S. {totalMasterCount}명)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* A4 Portrait PDF Export Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-[#1B6CA8] hover:bg-[#145380] border border-[#145380] rounded-xs transition-all cursor-pointer disabled:opacity-50"
              title="A4 세로 규격 PDF 파일 다운로드"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  PDF 생성 중...
                </>
              ) : pdfExported ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  PDF 다운로드 완료
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  {printFilterDegree === 'PhD'
                    ? '박사 PDF 다운로드'
                    : printFilterDegree === 'Master'
                    ? '석사 PDF 다운로드'
                    : '종합 PDF 다운로드'}
                </>
              )}
            </button>

            {/* Browser Print Button */}
            <button
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-[#1A1A1A] hover:bg-black border border-[#1A1A1A] rounded-xs transition-all cursor-pointer"
              title="브라우저 인쇄 다이얼로그 호출 (A4 세로 권장)"
            >
              <Printer className="w-3.5 h-3.5" />
              인쇄
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white border border-[#1A1A1A]/30 rounded-xs transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-auto p-4 bg-[#E5E3DF] flex justify-center">
          {renderTimetableDocument(previewContainerRef)}
        </div>
      </div>
    </div>
  );
};
