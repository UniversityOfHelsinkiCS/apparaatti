import Cur from '../server/db/models/cur'

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
  value: string;
  question: LocalizedString;
  type: string;
  explanation: "string";
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
  course: CourseRealization,
  distance: number,
  courseCodes: number[]
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