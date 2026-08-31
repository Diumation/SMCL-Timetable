import { CourseCategory, ParsedTimeSlot, Student, TimetableBlockItem } from '../types';

export const DAYS: Array<'월' | '화' | '수' | '목' | '금'> = ['월', '화', '수', '목', '금'];

// 09:00 to 18:00 (9 hours -> 18 half-hour slots or 9 full-hour rows)
export const START_HOUR = 9;
export const END_HOUR = 18;
export const TOTAL_HOURS = END_HOUR - START_HOUR; // 9 hours

export function getCategoryFromCourse(courseCode: string, courseName: string, department: string): CourseCategory {
  const code = courseCode.toUpperCase();
  const name = courseName.toLowerCase();
  const dept = department.toLowerCase();

  if (name.includes('논문연구') || code.includes('92100') || code.includes('92200')) {
    return 'research';
  }
  if (name.includes('세미나') || code.includes('93100')) {
    return 'seminar';
  }
  if (code.startsWith('CC') || name.includes('리더십') || name.includes('scientific')) {
    return 'common_req';
  }
  if (code.startsWith('AI') || code.startsWith('AX') || dept.includes('ai') || name.includes('기계학습') || name.includes('인공지능')) {
    return 'ai_ml';
  }
  if (code.startsWith('HSS') || dept.includes('인문') || name.includes('스포츠') || name.includes('수영') || name.includes('체력') || name.includes('코어') || name.includes('요가')) {
    return 'humanities';
  }
  if (code.startsWith('ME') || code.startsWith('IE') || dept.includes('기계') || dept.includes('산업')) {
    return 'mechanical';
  }
  if (code.startsWith('AE') || code.startsWith('SPE') || dept.includes('항공') || dept.includes('우주')) {
    return 'aerospace';
  }

  return 'aerospace';
}

/**
 * Parses time string like "월/수 10:30 - 12:00", "월 13:00 - 15:00", "화/목 14:30 - 16:00"
 */
export function parseTimeString(timeStr: string): ParsedTimeSlot[] {
  if (!timeStr || timeStr === '-' || timeStr.trim() === '') {
    return [];
  }

  const results: ParsedTimeSlot[] = [];
  // Example patterns:
  // "월/수 10:30 - 12:00"
  // "화 15:00 - 17:00"
  // "화/목 14:30 - 16:00"
  // "화 14:00 - 18:00"
  const parts = timeStr.trim().split(/\s+/);
  if (parts.length < 4 && !timeStr.includes('-')) return [];

  const dayPart = parts[0]; // "월/수" or "화" or "월"
  const timeRangePart = parts.slice(1).join(' '); // "10:30 - 12:00"

  const timeMatch = timeRangePart.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!timeMatch) return [];

  const startHour = parseInt(timeMatch[1], 10);
  const startMinute = parseInt(timeMatch[2], 10);
  const endHour = parseInt(timeMatch[3], 10);
  const endMinute = parseInt(timeMatch[4], 10);

  const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

  const rawDays = dayPart.split('/');
  for (const d of rawDays) {
    const cleanDay = d.trim() as '월' | '화' | '수' | '목' | '금';
    if (DAYS.includes(cleanDay)) {
      results.push({
        day: cleanDay,
        startHour,
        startMinute,
        endHour,
        endMinute,
        totalMinutes,
      });
    }
  }

  return results;
}

/**
 * Aggregates all students into unique course-time timetable blocks
 */
export function buildTimetableBlocks(students: Student[]): TimetableBlockItem[] {
  const map = new Map<string, TimetableBlockItem>();

  for (const student of students) {
    for (const course of student.courses) {
      if (!course.timeString || course.timeString === '-' || course.isResearch) {
        continue;
      }

      const slots = parseTimeString(course.timeString);
      for (const slot of slots) {
        // Group by courseName + day + time
        const key = `${course.courseName}__${slot.day}__${slot.startHour}:${slot.startMinute}-${slot.endHour}:${slot.endMinute}`;

        if (!map.has(key)) {
          const cat = getCategoryFromCourse(course.courseCode, course.courseName, course.department);
          map.set(key, {
            courseId: course.id,
            courseCode: course.courseCode,
            courseName: course.courseName,
            department: course.department,
            professor: course.professor,
            credits: course.credits,
            timeString: course.timeString,
            slot,
            students: [],
            category: cat,
          });
        }

        const block = map.get(key)!;
        if (!block.students.some((s) => s.id === student.id)) {
          block.students.push({
            id: student.id,
            name: student.name,
            degree: student.degree,
            note: course.note,
          });
        }
      }
    }
  }

  return Array.from(map.values());
}

export interface PositionedBlockItem extends TimetableBlockItem {
  topPercent: number;
  heightPercent: number;
  leftPercent: number;
  widthPercent: number;
  column: number;
  totalColumns: number;
}

/**
 * Format minutes to top % inside a 09:00 - 18:00 column
 */
export function calculateSlotPosition(slot: ParsedTimeSlot) {
  const dayStartMinutes = START_HOUR * 60; // 9 * 60 = 540
  const dayTotalMinutes = TOTAL_HOURS * 60; // 9 * 60 = 540

  const startInMinutes = slot.startHour * 60 + slot.startMinute;
  const topPercent = Math.max(0, Math.min(100, ((startInMinutes - dayStartMinutes) / dayTotalMinutes) * 100));
  const heightPercent = Math.max(5, Math.min(100, (slot.totalMinutes / dayTotalMinutes) * 100));

  return {
    topPercent,
    heightPercent,
  };
}

/**
 * High-precision interval layout for timetable blocks in a day column.
 * Handles concurrent courses, greedy lane placement, and rightward expansion.
 */
export function layoutDayBlocks(blocks: TimetableBlockItem[]): PositionedBlockItem[] {
  if (blocks.length === 0) return [];

  // Sort blocks by start time ascending, then by end time descending
  const sorted = [...blocks].sort((a, b) => {
    const aStart = a.slot.startHour * 60 + a.slot.startMinute;
    const bStart = b.slot.startHour * 60 + b.slot.startMinute;
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = a.slot.endHour * 60 + a.slot.endMinute;
    const bEnd = b.slot.endHour * 60 + b.slot.endMinute;
    return bEnd - aEnd;
  });

  // Group into connected components (groups of transitively overlapping time spans)
  const components: TimetableBlockItem[][] = [];
  let currentComp: TimetableBlockItem[] = [sorted[0]];
  let compEnd = sorted[0].slot.endHour * 60 + sorted[0].slot.endMinute;

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    const itemStart = item.slot.startHour * 60 + item.slot.startMinute;
    const itemEnd = item.slot.endHour * 60 + item.slot.endMinute;

    if (itemStart < compEnd) {
      currentComp.push(item);
      compEnd = Math.max(compEnd, itemEnd);
    } else {
      components.push(currentComp);
      currentComp = [item];
      compEnd = itemEnd;
    }
  }
  components.push(currentComp);

  const results: PositionedBlockItem[] = [];

  for (const comp of components) {
    // If only 1 block in component, full 100% width
    if (comp.length === 1) {
      const b = comp[0];
      const pos = calculateSlotPosition(b.slot);
      results.push({
        ...b,
        topPercent: pos.topPercent,
        heightPercent: pos.heightPercent,
        leftPercent: 0,
        widthPercent: 100,
        column: 0,
        totalColumns: 1,
      });
      continue;
    }

    // Assign lanes greedily
    const lanes: { block: TimetableBlockItem; start: number; end: number }[][] = [];
    const blockMeta = new Map<TimetableBlockItem, { col: number; start: number; end: number }>();

    for (const b of comp) {
      const bStart = b.slot.startHour * 60 + b.slot.startMinute;
      const bEnd = b.slot.endHour * 60 + b.slot.endMinute;

      let placedCol = -1;
      for (let c = 0; c < lanes.length; c++) {
        const hasOverlap = lanes[c].some((prev) => bStart < prev.end && bEnd > prev.start);
        if (!hasOverlap) {
          placedCol = c;
          lanes[c].push({ block: b, start: bStart, end: bEnd });
          break;
        }
      }

      if (placedCol === -1) {
        placedCol = lanes.length;
        lanes.push([{ block: b, start: bStart, end: bEnd }]);
      }

      blockMeta.set(b, { col: placedCol, start: bStart, end: bEnd });
    }

    const totalLanes = lanes.length;

    // For each block in component, calculate if it can expand into adjacent empty right lanes
    for (const b of comp) {
      const { col, start, end } = blockMeta.get(b)!;
      const pos = calculateSlotPosition(b.slot);

      let span = 1;
      for (let c = col + 1; c < totalLanes; c++) {
        const laneOverlap = lanes[c].some((prev) => start < prev.end && end > prev.start);
        if (laneOverlap) {
          break;
        }
        span++;
      }

      const widthPercent = (span / totalLanes) * 100;
      const leftPercent = (col / totalLanes) * 100;

      results.push({
        ...b,
        topPercent: pos.topPercent,
        heightPercent: pos.heightPercent,
        leftPercent,
        widthPercent,
        column: col,
        totalColumns: totalLanes,
      });
    }
  }

  return results;
}


/**
 * Get students who are currently in class during a specific day and hour
 */
export function getStudentsInClass(students: Student[], day: '월' | '화' | '수' | '목' | '금', hour: number) {
  const inClass: { student: Student; courseName: string; time: string }[] = [];
  const inLab: Student[] = [];

  for (const s of students) {
    let hasClass = false;
    let matchingCourseName = '';
    let matchingTime = '';

    for (const c of s.courses) {
      if (c.isResearch || !c.timeString || c.timeString === '-') continue;
      const slots = parseTimeString(c.timeString);
      for (const slot of slots) {
        if (slot.day === day) {
          const slotStart = slot.startHour + slot.startMinute / 60;
          const slotEnd = slot.endHour + slot.endMinute / 60;
          if (hour >= slotStart && hour < slotEnd) {
            hasClass = true;
            matchingCourseName = c.courseName;
            matchingTime = `${slot.startHour}:${slot.startMinute === 0 ? '00' : slot.startMinute}-${slot.endHour}:${slot.endMinute === 0 ? '00' : slot.endMinute}`;
            break;
          }
        }
      }
      if (hasClass) break;
    }

    if (hasClass) {
      inClass.push({ student: s, courseName: matchingCourseName, time: matchingTime });
    } else {
      inLab.push(s);
    }
  }

  return { inClass, inLab };
}
