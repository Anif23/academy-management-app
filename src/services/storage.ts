import { buildSeedDatabase } from '../mock/seed';
import type {
  AttendanceRecord,
  Batch,
  ClassReport,
  CourseRecord,
  Employee,
  FeeRecord,
  PerformanceRecord,
  Student,
  StudentTask,
  WalkIn,
} from '../types';

const STORAGE_VERSION = 'v1';
const STORAGE_PREFIX = `acadmey:${STORAGE_VERSION}:`;

type StoreKey =
  | 'employees'
  | 'batches'
  | 'walkIns'
  | 'students'
  | 'fees'
  | 'attendance'
  | 'classReports'
  | 'tasks'
  | 'performance'
  | 'courses';

function key(name: StoreKey): string {
  return `${STORAGE_PREFIX}${name}`;
}

function readRaw<T>(name: StoreKey): T | null {
  try {
    const raw = window.localStorage.getItem(key(name));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeRaw<T>(name: StoreKey, value: T): void {
  window.localStorage.setItem(key(name), JSON.stringify(value));
}

let seeded = false;

function ensureSeeded(): void {
  if (seeded) return;
  const alreadySeeded = window.localStorage.getItem(`${STORAGE_PREFIX}seeded`);
  if (!alreadySeeded) {
    const db = buildSeedDatabase();
    writeRaw('employees', db.employees);
    writeRaw('batches', db.batches);
    writeRaw('walkIns', db.walkIns);
    writeRaw('students', db.students);
    writeRaw('fees', db.fees);
    writeRaw('attendance', db.attendance);
    writeRaw('classReports', db.classReports);
    writeRaw('tasks', db.tasks);
    writeRaw('performance', db.performance);
    writeRaw('courses', db.courses);
    window.localStorage.setItem(`${STORAGE_PREFIX}seeded`, 'true');
  }
  seeded = true;
}

export function getCollection<T>(name: StoreKey): T[] {
  ensureSeeded();
  return readRaw<T[]>(name) ?? [];
}

export function setCollection<T>(name: StoreKey, value: T[]): void {
  writeRaw(name, value);
}

export function resetAllData(): void {
  window.localStorage.removeItem(`${STORAGE_PREFIX}seeded`);
  seeded = false;
  ensureSeeded();
}

export const collections = {
  employees: () => getCollection<Employee>('employees'),
  batches: () => getCollection<Batch>('batches'),
  walkIns: () => getCollection<WalkIn>('walkIns'),
  students: () => getCollection<Student>('students'),
  fees: () => getCollection<FeeRecord>('fees'),
  attendance: () => getCollection<AttendanceRecord>('attendance'),
  classReports: () => getCollection<ClassReport>('classReports'),
  tasks: () => getCollection<StudentTask>('tasks'),
  performance: () => getCollection<PerformanceRecord>('performance'),
  courses: () => getCollection<CourseRecord>('courses'),
};

export function saveEmployees(v: Employee[]) { setCollection('employees', v); }
export function saveBatches(v: Batch[]) { setCollection('batches', v); }
export function saveWalkIns(v: WalkIn[]) { setCollection('walkIns', v); }
export function saveStudents(v: Student[]) { setCollection('students', v); }
export function saveFees(v: FeeRecord[]) { setCollection('fees', v); }
export function saveAttendance(v: AttendanceRecord[]) { setCollection('attendance', v); }
export function saveClassReports(v: ClassReport[]) { setCollection('classReports', v); }
export function saveTasks(v: StudentTask[]) { setCollection('tasks', v); }
export function savePerformance(v: PerformanceRecord[]) { setCollection('performance', v); }
export function saveCourses(v: CourseRecord[]) { setCollection('courses', v); }

export { key as storageKey, STORAGE_PREFIX };
