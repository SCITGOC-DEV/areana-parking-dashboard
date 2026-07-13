import {gql} from "@apollo/client";

const GET_Z_READING_REPORT = gql `
mutation MyMutation($machineId: Int!) {
  response: reportZReadingReportByAdmin(machineId: $machineId) {
    error
    message
    data {
      accreditationNo
      beginningOr
      dateIssued
      endingOr
      endDateTime
      totalCostOfPaperTicket
      totalNetAmountOfPaperTicket
      footerSubTitle
      footerTitle
      grossSales
      headerSubTitle
      min
      netSales
      newGrandTotal
      oldGrandTotal
      passengerData {
        count
        discount
        passengerType
        ticketCost
        totalNetAmount
      }
      paymentMethod {
        amount
        paymentType
      }
      ptuNo
      pwdDiscount
      reportDate
      reportTime
      seniorCitizenDiscount
      sn
      startDateTime
      studentDiscount
      totalDiscount
      totalPayment
      transactionDate
      validUntil
      vatTin
      vatableAmount
      vatableExemptSales
      vatableSales
      zeroRatedSales
    }
    reportData {
      reportDateTime
      reportId
      resetCount
      zReadingCount
    }
  }
}

`

const GET_X_READING_REPORT = gql `
mutation MyMutation($vehicleRouteId: Int!) {
  response: reportXReadingReportByDriver(vehicleRouteId: $vehicleRouteId) {
    data {
      accreditationNo
      beginningOr
      closingBalance
      dateIssued
      endDateTime
      endingOr
      footerSubTitle
      footerTitle
      headerSubTitle
      totalCostOfPaperTicket
      headerTitle
      min
      paymentMethod {
        amount
        paymentType
      }
      openingBalance
      ptuNo
      refund
      reportDate
      reportTime
      shortOver
      sn
      startDateTime
      totalPayment
      validUntil
      vatTin
      void
      withdrawal
      totalNetAmountOfPaperTicket
    }
    error
    message
  }
}
`

const UPDATE_Z_READING_COUNT = gql`
mutation MyMutation($machineId: Int!) {
  response: reportExportZReadingReportByAdmin(machineId: $machineId) {
    error
    message
    reportData {
      reportDateTime
      reportId
      resetCount
      zReadingCount
    }
    data {
      accreditationNo
      beginningOr
      dateIssued
      endDateTime
      endingOr
      footerSubTitle
      footerTitle
      grossSales
      headerSubTitle
      headerTitle
      min
      netSales
      newGrandTotal
      oldGrandTotal
      ptuNo
      passengerData {
        count
        discount
        passengerType
        ticketCost
        totalNetAmount
      }
      paymentMethod {
        amount
        paymentType
      }
      pwdDiscount
      reportDate
      reportTime
      seniorCitizenDiscount
      sn
      startDateTime
      studentDiscount
      totalCostOfPaperTicket
      totalCountOfPaperTicket
      totalDiscount
      totalNetAmountOfPaperTicket
      totalPayment
      transactionDate
      validUntil
      vatTin
      vatableAmount
      vatableExemptSales
      vatableSales
      zeroRatedSales
    }
  }
}

`

const GET_Z_READING_COUNT_BY_DRIVER = gql`
mutation MyMutation($machineId: Int!) {
  reportGetZReadingCountByDriver(machineId: $machineId) {
    data {
      reportDateTime
      resetCount
      zReadingCount
      reportId
    }
    error
    message
  }
}
`

const RESET_Z_READING_COUNT_BY_DRIVER = gql`
mutation MyMutation($machineId: Int!) {
  reportResetZReadingCountByDriver(machineId: $machineId) {
    data {
      reportDateTime
      reportId
      zReadingCount
      resetCount
    }
    error
    message
  }
}
`

export default {
    GET_Z_READING_REPORT,
    GET_X_READING_REPORT,
    UPDATE_Z_READING_COUNT,
    GET_Z_READING_COUNT_BY_DRIVER,
    RESET_Z_READING_COUNT_BY_DRIVER
}
