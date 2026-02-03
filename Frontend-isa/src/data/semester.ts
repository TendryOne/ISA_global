interface SemesterInfo {
  code: string // ex: 'S1'
  label: string // ex: 'Semestre 1 (L1)'
  year: string // ex: 'L1'
  cycle: string // ex: 'Licence'
  details: string // ex: '1ère année, semestre 1'
  available?: boolean
}

export const semesters = [
  {
    code: 'S1',
    label: 'Semestre 1 (L1)',
    year: 'L1',
    cycle: 'Licence',
    details: '1ère année - semestre 1 ',
    available: true,
  },
  {
    code: 'S2',
    label: 'Semestre 2 (L1)',
    year: 'L1',
    cycle: 'Licence',
    details: '1ère année - semestre 2 ',
    available: true,
  },
  {
    code: 'S3',
    label: 'Semestre 3 (L2)',
    year: 'L2',
    cycle: 'Licence',
    details: '2ème année - semestre 3 ',
    available: true,
  },
  {
    code: 'S4',
    label: 'Semestre 4 (L2)',
    year: 'L2',
    cycle: 'Licence',
    details: '2ème année - semestre 4 ',
    available: true,
  },
  {
    code: 'S5',
    label: 'Semestre 5 (L3)',
    year: 'L3',
    cycle: 'Licence',
    details: '3ème année - semestre 5 ',
    available: true,
  },
  {
    code: 'S6',
    label: 'Semestre 6 (L3)',
    year: 'L3',
    cycle: 'Licence',
    details: '3ème année - semestre 6 ',
    available: true,
  },
  {
    code: 'S7',
    label: 'Semestre 7 (M1)',
    year: 'M1',
    cycle: 'Master',
    details: '4ème année - semestre 7 ',
    available: false,
  },
  {
    code: 'S8',
    label: 'Semestre 8 (M1)',
    year: 'M1',
    cycle: 'Master',
    details: '4ème année - semestre 8 ',
    available: false,
  },
  {
    code: 'S9',
    label: 'Semestre 9 (M2)',
    year: 'M2',
    cycle: 'Master',
    details: '5ème année - semestre 9 ',
    available: false,
  },
  {
    code: 'S10',
    label: 'Semestre 10 (M2)',
    year: 'M2',
    cycle: 'Master',
    details: '5ème année - semestre 10 ',
    available: false,
  },
] as SemesterInfo[]
