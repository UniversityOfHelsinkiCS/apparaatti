//this file might be useful to move to the common/types in order to share with the client
import express from 'express'

export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

export interface User {
  id: string;
  username: string;
  language?: string;
  iamGroups: string[];
  email?: string;
  isAdmin: boolean;
  isPowerUser: boolean;
  activeCourseIds?: string[];
  ownCourses?: string[];
  isStatsViewer: boolean;
}

export interface RequestWithUser extends express.Request {
  user: User;
  hijackedBy?: User;
}

export type ActivityPeriod = {
  startDate: string;
  endDate: string;
};

export type CourseUnitRealisation = {
  id: string;
  name: Locales;
  nameSpecifier: object;
  activityPeriod: ActivityPeriod;
};

export type Enrollment = {
  id: string;
  personId: string;
  state: string;
  courseUnitRealisation: CourseUnitRealisation;
};

export type Locales = {
  fi: string;
  en: string;
  sv: string;
};

export interface CourseUnit {
  code: string;
  organisations: {
    id: string;
    code: string;
    name: {
      en: string;
      fi: string;
      sv: string;
    };
  }[];
}

type Programme = {
  key: string;
  name: Locales;
  level: string;
  companionFaculties: Array<string>;
  international: boolean;
};

export interface OrganisationData {
  code: string;
  name: Locales;
  programmes: Array<Programme>;
}

export interface SisuCourseUnit {
  id: string;
  name: Locales;
  validityPeriod: ActivityPeriod;
}
export interface SisuResponsibilityInfo {
  roleUrn: string;
  personId: string;
}

export interface SisuCourseWithRealization {
  id: string;
  courseUnitRealisationTypeUrn: string;
  flowState: string;
  courseUnits: SisuCourseUnit[];
  name: Locales;
  activityPeriod: ActivityPeriod;
  responsibilityInfos: SisuResponsibilityInfo[];
}

export interface ResponsibilityRow {
  id?: string;
  chatInstanceId: string;
  userId: string;
}
