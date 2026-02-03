interface LevelOption {
  label: string
  value: string
  available?: boolean
}

export const levelAvailable: LevelOption[] = [
  {
    label: 'Licence 1',
    value: 'L1',
    available: true,
  },
  {
    label: 'Licence 2',
    value: 'L2',
    available: true,
  },
  {
    label: 'Licence 3',
    value: 'L3',
    available: true,
  },
  {
    label: 'Master 1',
    value: 'M1',
    available: false,
  },
  {
    label: 'Master 2',
    value: 'M2',
    available: false,
  },
]
