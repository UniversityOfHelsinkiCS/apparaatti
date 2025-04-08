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
