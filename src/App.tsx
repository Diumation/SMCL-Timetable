/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { INITIAL_STUDENTS } from './data/initialData';
import { FilterDegree, Student, ViewMode } from './types';
import { Header } from './components/Header';
import { MasterTimetable } from './components/MasterTimetable';
import { StudentScheduleView } from './components/StudentScheduleView';
import { LabMatrixView } from './components/LabMatrixView';
import { AddDropModal } from './components/AddDropModal';
import { CsvModal } from './components/CsvModal';
import { PrintView } from './components/PrintView';
import { PrintModal } from './components/PrintModal';

const STORAGE_KEY = 'smcl_coursework_timetable_v1';

export default function App() {
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved students:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('TIMETABLE');
  const [filterDegree, setFilterDegree] = useState<FilterDegree>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Modals state
  const [isAddDropModalOpen, setIsAddDropModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [initialStudentForModal, setInitialStudentForModal] = useState<string | null>(null);
  const [editingCourseData, setEditingCourseData] = useState<{ courseCode: string; courseName: string } | null>(null);

  // Save to LocalStorage on update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students:', e);
    }
  }, [students]);

  const handleUpdateStudents = (updated: Student[]) => {
    setStudents(updated);
  };

  const handleResetData = () => {
    if (window.confirm('초기 수강신청 원본 데이터(24명)로 초기화하시겠습니까?')) {
      setStudents(INITIAL_STUDENTS);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setCurrentView('STUDENTS');
  };

  const handleOpenAddDropForStudent = (studentId: string) => {
    setInitialStudentForModal(studentId);
    setIsAddDropModalOpen(true);
  };

  const handleEditCourse = (courseCode: string, courseName: string) => {
    setEditingCourseData({ courseCode, courseName });
    setIsAddDropModalOpen(true);
  };

  const handleDeleteCourseFromStudent = (studentId: string, courseId: string) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          courses: s.courses.filter((c) => c.id !== courseId),
        };
      }
      return s;
    });
    setStudents(updated);
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#E14C27] selection:text-white">
      {/* Screen Header & Top Controls */}
      <Header
        students={students}
        currentView={currentView}
        onViewChange={setCurrentView}
        filterDegree={filterDegree}
        onFilterDegreeChange={setFilterDegree}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAddDrop={() => {
          setInitialStudentForModal(null);
          setIsAddDropModalOpen(true);
        }}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onResetData={handleResetData}
        onPrint={handlePrint}
      />

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 print:hidden">
        {currentView === 'TIMETABLE' && (
          <MasterTimetable
            students={students}
            filterDegree={filterDegree}
            onFilterDegreeChange={setFilterDegree}
            searchTerm={searchTerm}
            onSelectStudent={handleSelectStudent}
            onEditCourse={handleEditCourse}
          />
        )}

        {currentView === 'STUDENTS' && (
          <StudentScheduleView
            students={students}
            selectedStudentId={selectedStudentId}
            onSelectStudent={setSelectedStudentId}
            onAddCourseToStudent={handleOpenAddDropForStudent}
            onDeleteCourseFromStudent={handleDeleteCourseFromStudent}
            filterDegree={filterDegree}
            onFilterDegreeChange={setFilterDegree}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {currentView === 'LAB_MATRIX' && (
          <LabMatrixView
            students={students}
            onSelectStudent={handleSelectStudent}
          />
        )}
      </main>

      {/* 1-Page Landscape Print View (visible only during window.print()) */}
      <PrintView students={students} />

      {/* Modals */}
      <AddDropModal
        isOpen={isAddDropModalOpen}
        onClose={() => {
          setIsAddDropModalOpen(false);
          setInitialStudentForModal(null);
          setEditingCourseData(null);
        }}
        students={students}
        onUpdateStudents={handleUpdateStudents}
        initialStudentId={initialStudentForModal}
        initialCourseData={editingCourseData}
      />

      <CsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        students={students}
        onImportStudents={handleUpdateStudents}
        onOpenPrintModal={() => {
          setIsCsvModalOpen(false);
          setIsPrintModalOpen(true);
        }}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={students}
      />

      {/* Editorial Footer */}
      <footer className="bg-white border-t-2 border-[#1A1A1A] py-3.5 px-6 text-[#1A1A1A] print:hidden mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-black tracking-wider">
          <div className="flex items-center gap-3">
            <span className="bg-[#1A1A1A] text-white px-2 py-0.5 rounded-xs">SMCL</span>
            <span>Spacecraft Mission & Control Lab • 24인 연구원 시간표 관리 시스템</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="opacity-60">상태: <strong className="text-[#E14C27]">실시간 동기화 활성</strong></span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#E14C27]"></span>AI/기계학습</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#34495E]"></span>항공우주/위성</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#2ECC71]"></span>기계/시스템</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#E67E22]"></span>인문사회/기타</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
