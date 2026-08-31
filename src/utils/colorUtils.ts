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
    label: '항공우주 · 우주탐사',
    badgeBg: 'bg-[#34495E]/10',
    badgeText: 'text-[#34495E]',
    badgeBorder: 'border-[#34495E]/40',
    blockBg: 'bg-[#34495E]/10 hover:bg-[#34495E]/15',
    blockBorder: 'border-l-4 border-l-[#34495E] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#34495E]',
    headerText: 'text-white',
    dotColor: 'bg-[#34495E]',
    accentColor: '#34495E',
  },
  ai_ml: {
    label: 'AI · 기계학습 · AX',
    badgeBg: 'bg-[#E14C27]/10',
    badgeText: 'text-[#E14C27]',
    badgeBorder: 'border-[#E14C27]/40',
    blockBg: 'bg-[#E14C27]/10 hover:bg-[#E14C27]/15',
    blockBorder: 'border-l-4 border-l-[#E14C27] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#E14C27]',
    headerText: 'text-white',
    dotColor: 'bg-[#E14C27]',
    accentColor: '#E14C27',
  },
  mechanical: {
    label: '기계 · 산업 · 시스템',
    badgeBg: 'bg-[#2ECC71]/15',
    badgeText: 'text-[#1E824C]',
    badgeBorder: 'border-[#2ECC71]/50',
    blockBg: 'bg-[#2ECC71]/10 hover:bg-[#2ECC71]/15',
    blockBorder: 'border-l-4 border-l-[#2ECC71] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#2ECC71]',
    headerText: 'text-white',
    dotColor: 'bg-[#2ECC71]',
    accentColor: '#2ECC71',
  },
  humanities: {
    label: '인문사회 · 체육 · 스포츠특강',
    badgeBg: 'bg-[#E67E22]/15',
    badgeText: 'text-[#D35400]',
    badgeBorder: 'border-[#E67E22]/50',
    blockBg: 'bg-[#E67E22]/10 hover:bg-[#E67E22]/15',
    blockBorder: 'border-l-4 border-l-[#E67E22] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#E67E22]',
    headerText: 'text-white',
    dotColor: 'bg-[#E67E22]',
    accentColor: '#E67E22',
  },
  common_req: {
    label: '공통필수 · Writing · 리더십',
    badgeBg: 'bg-[#8E44AD]/10',
    badgeText: 'text-[#8E44AD]',
    badgeBorder: 'border-[#8E44AD]/40',
    blockBg: 'bg-[#8E44AD]/10 hover:bg-[#8E44AD]/15',
    blockBorder: 'border-l-4 border-l-[#8E44AD] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#8E44AD]',
    headerText: 'text-white',
    dotColor: 'bg-[#8E44AD]',
    accentColor: '#8E44AD',
  },
  seminar: {
    label: '대학원 정기 세미나',
    badgeBg: 'bg-[#C0392B]/10',
    badgeText: 'text-[#C0392B]',
    badgeBorder: 'border-[#C0392B]/40',
    blockBg: 'bg-[#C0392B]/10 hover:bg-[#C0392B]/15',
    blockBorder: 'border-l-4 border-l-[#C0392B] border-t border-r border-b border-[#1A1A1A]/20',
    headerBg: 'bg-[#C0392B]',
    headerText: 'text-white',
    dotColor: 'bg-[#C0392B]',
    accentColor: '#C0392B',
  },
  research: {
    label: '논문연구 (연구학점)',
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

export function getDegreeBadgeClass(degree: DegreeType): {
  container: string;
  tag: string;
  label: string;
} {
  if (degree === 'PhD') {
    return {
      container: 'bg-[#1A1A1A] text-white border border-[#1A1A1A] hover:bg-black font-extrabold shadow-none rounded-xs',
      tag: 'bg-[#E14C27] text-white',
      label: 'Ph.D',
    };
  }
  return {
    container: 'bg-[#E14C27] text-white border border-[#E14C27] hover:bg-[#c93f1d] font-black shadow-none rounded-xs',
    tag: 'bg-[#1A1A1A] text-white',
    label: 'MS.',
  };
}

