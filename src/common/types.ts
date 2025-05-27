export type LocalizedString = Partial<{
  fi: string;
  sv: string;
  en: string;
}>

export type Option = {
  id: string;
  name: LocalizedString;
}

export type Question = {
  id: string;
  question: LocalizedString;
  type: string;
  options: Option[];
}

export type Form = {
  id: string;
  questions: Question[];
}

export const DIMENSIONS = [
  'fear',
  'teachingMethod',
  'experience',
] as const

export type Dimension = typeof DIMENSIONS[number]

export type CourseRecommendation = {
  id: string;
  name: string;
  description: string;
  courseCode: string;
  credits: number;
  url: string;
} & Record<Dimension, number>


export type CourseRealization = {
  id: string;
  name: LocalizedString;
  startDate: Date;
  endDate: Date;
}


export type CurCuRelation = {
  cuId: string;
  curId: string;
}