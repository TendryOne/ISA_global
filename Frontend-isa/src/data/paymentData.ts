interface DataPaymentsInterface {
  mobileMoneyNumber: string
  mobileMoneyOwner: string
  BankAccountNumber: string
  BankAccountOwner: string
  BankName: string
  bankCode?: string
}

const DataPayments: DataPaymentsInterface = {
  mobileMoneyNumber: '+261 34 50 798 08',
  mobileMoneyOwner: 'Alain Michel',
  BankAccountNumber: '1234 5678 9012 3456',
  BankAccountOwner: 'Alain Michel',
  BankName: 'Bank of Africa Madagascar',
  bankCode: 'BOAMMGXXX',
}

export default DataPayments
