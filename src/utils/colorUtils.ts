import { CourseCategory, DegreeType } from '../types';

export interface CategoryColorTheme {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  blockBg: string;
  blockBorder: string;
  headerBg: string;
  headerText: string;
  dotColor: string;
  accentColor: string;
}

export const CATEGORY_COLORS: Record<CourseCategory, CategoryColorTheme> = {
  aerospace: {
    label: '항공우주',
    badgeBg: 'bg-[#1E40AF]/10',
    badgeText: 'text-[#1E40AF]',
    badgeBorder: 'border-[#1E40AF]/40',
    blockBg: 'bg-[#1E40AF]/10 hover:bg-[#1E40AF]/15',
    blockBorder: 'border-l-4 border-l-[#1E40AF] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#1E40AF]',
    headerText: 'text-white',
    dotColor: 'bg-[#1E40AF]',
    accentColor: '#1E40AF',
  },
  ai_ml: {
    label: 'AI · 기계학습 · AX',
    badgeBg: 'bg-[#DB2777]/10',
    badgeText: 'text-[#DB2777]',
    badgeBorder: 'border-[#DB2777]/40',
    blockBg: 'bg-[#DB2777]/10 hover:bg-[#DB2777]/15',
    blockBorder: 'border-l-4 border-l-[#DB2777] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#DB2777]',
    headerText: 'text-white',
    dotColor: 'bg-[#DB2777]',
    accentColor: '#DB2777',
  },
  mechanical: {
    label: '기계공학',
    badgeBg: 'bg-[#EA580C]/10',
    badgeText: 'text-[#EA580C]',
    badgeBorder: 'border-[#EA580C]/40',
    blockBg: 'bg-[#EA580C]/10 hover:bg-[#EA580C]/15',
    blockBorder: 'border-l-4 border-l-[#EA580C] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#EA580C]',
    headerText: 'text-white',
    dotColor: 'bg-[#EA580C]',
    accentColor: '#EA580C',
  },
  humanities: {
    label: '인문사회 · 체육',
    badgeBg: 'bg-[#D97706]/10',
    badgeText: 'text-[#D97706]',
    badgeBorder: 'border-[#D97706]/40',
    blockBg: 'bg-[#D97706]/10 hover:bg-[#D97706]/15',
    blockBorder: 'border-l-4 border-l-[#D97706] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#D97706]',
    headerText: 'text-white',
    dotColor: 'bg-[#D97706]',
    accentColor: '#D97706',
  },
  common_req: {
    label: '공통필수 · Writing · 리더십',
    badgeBg: 'bg-[#4F46E5]/10',
    badgeText: 'text-[#4F46E5]',
    badgeBorder: 'border-[#4F46E5]/40',
    blockBg: 'bg-[#4F46E5]/10 hover:bg-[#4F46E5]/15',
    blockBorder: 'border-l-4 border-l-[#4F46E5] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#4F46E5]',
    headerText: 'text-white',
    dotColor: 'bg-[#4F46E5]',
    accentColor: '#4F46E5',
  },
  seminar: {
    label: '정기 세미나',
    badgeBg: 'bg-[#475569]/10',
    badgeText: 'text-[#475569]',
    badgeBorder: 'border-[#475569]/40',
    blockBg: 'bg-[#475569]/10 hover:bg-[#475569]/15',
    blockBorder: 'border-l-4 border-l-[#475569] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#475569]',
    headerText: 'text-white',
    dotColor: 'bg-[#475569]',
    accentColor: '#475569',
  },
  research: {
    label: '논문연구',
    badgeBg: 'bg-[#F1F0ED]',
    badgeText: 'text-[#1A1A1A]',
    badgeBorder: 'border-[#1A1A1A]/20',
    blockBg: 'bg-[#F1F0ED] hover:bg-[#EAE8E3]',
    blockBorder: 'border-l-4 border-l-[#1A1A1A] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#1A1A1A]',
    headerText: 'text-white',
    dotColor: 'bg-[#1A1A1A]',
    accentColor: '#1A1A1A',
  },
};

export interface CourseColorTheme {
  primary: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  blockBg: string;
  blockBorder: string;
  accentBar: string;
  dotColor: string;
}

// 17 Sophisticated, Unique & Distinct Color Definitions for each Course
export const COURSE_COLOR_MAP: Record<string, CourseColorTheme> = {
  // 1. 항공우주공학 특론 (Deep Royal Navy)
  '항공우주공학 특론<행성간 탐사 임무 설계>': {
    primary: '#1E40AF',
    badgeBg: 'bg-[#1E40AF]/10',
    badgeText: 'text-[#1E40AF]',
    badgeBorder: 'border-[#1E40AF]/40',
    blockBg: 'bg-[#1E40AF]/10 hover:bg-[#1E40AF]/15',
    blockBorder: 'border-[#1E40AF]/30',
    accentBar: 'bg-[#1E40AF]',
    dotColor: 'bg-[#1E40AF]',
  },
  // 2. 비행체 최적제어 개론 (Cerulean Blue)
  '비행체 최적제어 개론': {
    primary: '#0284C7',
    badgeBg: 'bg-[#0284C7]/10',
    badgeText: 'text-[#0284C7]',
    badgeBorder: 'border-[#0284C7]/40',
    blockBg: 'bg-[#0284C7]/10 hover:bg-[#0284C7]/15',
    blockBorder: 'border-[#0284C7]/30',
    accentBar: 'bg-[#0284C7]',
    dotColor: 'bg-[#0284C7]',
  },
  // 3. 항공우주응용 인공지능 기법 (Teal / Pine Green)
  '항공우주응용 인공지능 기법': {
    primary: '#0D9488',
    badgeBg: 'bg-[#0D9488]/10',
    badgeText: 'text-[#0D9488]',
    badgeBorder: 'border-[#0D9488]/40',
    blockBg: 'bg-[#0D9488]/10 hover:bg-[#0D9488]/15',
    blockBorder: 'border-[#0D9488]/30',
    accentBar: 'bg-[#0D9488]',
    dotColor: 'bg-[#0D9488]',
  },
  // 4. 미래항공우주융합기술 (Emerald Green)
  '미래항공우주융합기술': {
    primary: '#10B981',
    badgeBg: 'bg-[#10B981]/10',
    badgeText: 'text-[#059669]',
    badgeBorder: 'border-[#10B981]/40',
    blockBg: 'bg-[#10B981]/10 hover:bg-[#10B981]/15',
    blockBorder: 'border-[#10B981]/30',
    accentBar: 'bg-[#10B981]',
    dotColor: 'bg-[#10B981]',
  },
  // 5. 세미나 (Slate Steel)
  '세미나(석사)': {
    primary: '#475569',
    badgeBg: 'bg-[#475569]/10',
    badgeText: 'text-[#334155]',
    badgeBorder: 'border-[#475569]/40',
    blockBg: 'bg-[#475569]/10 hover:bg-[#475569]/15',
    blockBorder: 'border-[#475569]/30',
    accentBar: 'bg-[#475569]',
    dotColor: 'bg-[#475569]',
  },
  // 6. 위성공학개론 (Indigo Blue)
  '위성공학개론': {
    primary: '#6366F1',
    badgeBg: 'bg-[#6366F1]/10',
    badgeText: 'text-[#4F46E5]',
    badgeBorder: 'border-[#6366F1]/40',
    blockBg: 'bg-[#6366F1]/10 hover:bg-[#6366F1]/15',
    blockBorder: 'border-[#6366F1]/30',
    accentBar: 'bg-[#6366F1]',
    dotColor: 'bg-[#6366F1]',
  },
  // 7. 베이지안 기계학습 (Purple Violet)
  '베이지안 기계학습': {
    primary: '#8B5CF6',
    badgeBg: 'bg-[#8B5CF6]/10',
    badgeText: 'text-[#7C3AED]',
    badgeBorder: 'border-[#8B5CF6]/40',
    blockBg: 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15',
    blockBorder: 'border-[#8B5CF6]/30',
    accentBar: 'bg-[#8B5CF6]',
    dotColor: 'bg-[#8B5CF6]',
  },
  // 8. 인공지능을 위한 프로그래밍 (Fuchsia Berry)
  '인공지능을 위한 프로그래밍': {
    primary: '#C026D3',
    badgeBg: 'bg-[#C026D3]/10',
    badgeText: 'text-[#A21CAF]',
    badgeBorder: 'border-[#C026D3]/40',
    blockBg: 'bg-[#C026D3]/10 hover:bg-[#C026D3]/15',
    blockBorder: 'border-[#C026D3]/30',
    accentBar: 'bg-[#C026D3]',
    dotColor: 'bg-[#C026D3]',
  },
  // 9. 계산과학을 위한 기계학습 (Deep Rose / Magenta)
  '계산과학을 위한 기계학습': {
    primary: '#DB2777',
    badgeBg: 'bg-[#DB2777]/10',
    badgeText: 'text-[#BE185D]',
    badgeBorder: 'border-[#DB2777]/40',
    blockBg: 'bg-[#DB2777]/10 hover:bg-[#DB2777]/15',
    blockBorder: 'border-[#DB2777]/30',
    accentBar: 'bg-[#DB2777]',
    dotColor: 'bg-[#DB2777]',
  },
  // 10. 랜덤데이타:해석 및 처리 (Warm Orange)
  '랜덤데이타:해석 및 처리': {
    primary: '#EA580C',
    badgeBg: 'bg-[#EA580C]/10',
    badgeText: 'text-[#C2410C]',
    badgeBorder: 'border-[#EA580C]/40',
    blockBg: 'bg-[#EA580C]/10 hover:bg-[#EA580C]/15',
    blockBorder: 'border-[#EA580C]/30',
    accentBar: 'bg-[#EA580C]',
    dotColor: 'bg-[#EA580C]',
  },
  // 11. 무기체계분석 (Golden Ochre / Bronze)
  '무기체계분석': {
    primary: '#CA8A04',
    badgeBg: 'bg-[#CA8A04]/10',
    badgeText: 'text-[#A16207]',
    badgeBorder: 'border-[#CA8A04]/40',
    blockBg: 'bg-[#CA8A04]/10 hover:bg-[#CA8A04]/15',
    blockBorder: 'border-[#CA8A04]/30',
    accentBar: 'bg-[#CA8A04]',
    dotColor: 'bg-[#CA8A04]',
  },
  // 12. Scientific Writing (Forest Green)
  'Scientific Writing': {
    primary: '#15803D',
    badgeBg: 'bg-[#15803D]/10',
    badgeText: 'text-[#166534]',
    badgeBorder: 'border-[#15803D]/40',
    blockBg: 'bg-[#15803D]/10 hover:bg-[#15803D]/15',
    blockBorder: 'border-[#15803D]/30',
    accentBar: 'bg-[#15803D]',
    dotColor: 'bg-[#15803D]',
  },
  // 13. 리더십강좌<석사 리더십 강좌(A)> (Cobalt Purple-Blue)
  '리더십강좌<석사 리더십 강좌(A)>': {
    primary: '#4338CA',
    badgeBg: 'bg-[#4338CA]/10',
    badgeText: 'text-[#3730A3]',
    badgeBorder: 'border-[#4338CA]/40',
    blockBg: 'bg-[#4338CA]/10 hover:bg-[#4338CA]/15',
    blockBorder: 'border-[#4338CA]/30',
    accentBar: 'bg-[#4338CA]',
    dotColor: 'bg-[#4338CA]',
  },
  // 14. 스포츠특강<요가와 생활> (Warm Amber)
  '스포츠특강<요가와 생활>': {
    primary: '#D97706',
    badgeBg: 'bg-[#D97706]/10',
    badgeText: 'text-[#B45309]',
    badgeBorder: 'border-[#D97706]/40',
    blockBg: 'bg-[#D97706]/10 hover:bg-[#D97706]/15',
    blockBorder: 'border-[#D97706]/30',
    accentBar: 'bg-[#D97706]',
    dotColor: 'bg-[#D97706]',
  },
  // 15. 체력육성 (Ruby Crimson Red)
  '체력육성': {
    primary: '#E11D48',
    badgeBg: 'bg-[#E11D48]/10',
    badgeText: 'text-[#BE123C]',
    badgeBorder: 'border-[#E11D48]/40',
    blockBg: 'bg-[#E11D48]/10 hover:bg-[#E11D48]/15',
    blockBorder: 'border-[#E11D48]/30',
    accentBar: 'bg-[#E11D48]',
    dotColor: 'bg-[#E11D48]',
  },
  // 16. 고급수영 (Cyan Aqua)
  '고급수영': {
    primary: '#0891B2',
    badgeBg: 'bg-[#0891B2]/10',
    badgeText: 'text-[#0E7490]',
    badgeBorder: 'border-[#0891B2]/40',
    blockBg: 'bg-[#0891B2]/10 hover:bg-[#0891B2]/15',
    blockBorder: 'border-[#0891B2]/30',
    accentBar: 'bg-[#0891B2]',
    dotColor: 'bg-[#0891B2]',
  },
  // 17. 코어운동 (Olive Green)
  '코어운동': {
    primary: '#65A30D',
    badgeBg: 'bg-[#65A30D]/10',
    badgeText: 'text-[#4D7C0F]',
    badgeBorder: 'border-[#65A30D]/40',
    blockBg: 'bg-[#65A30D]/10 hover:bg-[#65A30D]/15',
    blockBorder: 'border-[#65A30D]/30',
    accentBar: 'bg-[#65A30D]',
    dotColor: 'bg-[#65A30D]',
  },
};

export const COURSE_PALETTE: CourseColorTheme[] = Object.values(COURSE_COLOR_MAP);

export function getCourseColorTheme(courseName: string): CourseColorTheme {
  if (COURSE_COLOR_MAP[courseName]) {
    return COURSE_COLOR_MAP[courseName];
  }
  // Fallback for custom or edited courses
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COURSE_PALETTE.length;
  return COURSE_PALETTE[index];
}

export function getDegreeBadgeClass(degree: DegreeType): {
  container: string;
  tag: string;
  label: string;
} {
  if (degree === 'PhD') {
    return {
      container: 'bg-[#1A1A1A] text-white border border-[#1A1A1A] hover:bg-black font-extrabold shadow-none rounded-xs',
      tag: 'bg-[#1B6CA8] text-white',
      label: 'Ph.D.',
    };
  }
  return {
    container: 'bg-[#1B6CA8] text-white border border-[#145380] hover:bg-[#145380] font-black shadow-none rounded-xs',
    tag: 'bg-[#1A1A1A] text-white',
    label: 'M.S.',
  };
}


