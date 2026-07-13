import {gql} from "@apollo/client";

const REPORT_ANEX_B = gql `
mutation GetUsers($startDate: String!, $endDate: String!, $machineId: Int!) {
  reportAnexBReport(startDate: $startDate, endDate: $endDate, machineId: $machineId) {
    error
    message
    data {
      paymentMethod {
        paymentType
        amount
      }
      passengerSummaryData {
        passengerType
        totalDiscount
        totalNetAmount
        totalTicketCost
      }
      passengerData {
        count
        discount
        passengerType
        ticketCost
        totalNetAmount
        __typename
      }
      pwdDiscount
      seniorCitizenDiscount
      studentDiscount
      transactionDate
      oldGrandTotal
      newGrandTotal
      netSales
      grossSales
      endingOr
      beginningOr
      zeroRatedSales
      vatableSales
      vatableExemptSales
      vatableAmount
      endDateTime
      startDateTime
      totalDiscount
      transactionTime
      zReadingCount
      resetCount
      zCounterNo
      restCounterNo
    }
    dateIssue
    ptuNo
    min
    vehiclePlateNumber
    vatTin
    validUntil
    sn
    hTitle
    hSubTitle
    fTitle
    fSubTitle
    accreditationNo
    __typename
  }
}
`

const REPORT_ANEX_B_BY_VEHICLE = gql `
mutation GetUsersByVehicle($startDate: String!, $endDate: String!, $machineId: Int, $machineType: String) {
  reportAnexBReport(startDate: $startDate, endDate: $endDate, machineId: $machineId, machineType: $machineType) {
    error
    message
    data {
      paymentMethod {
        paymentType
        amount
      }
      passengerSummaryData {
        passengerType
        totalDiscount
        totalNetAmount
        totalTicketCost
      }
      passengerData {
        count
        discount
        passengerType
        ticketCost
        totalNetAmount
        __typename
      }
      pwdDiscount
      seniorCitizenDiscount
      studentDiscount
      transactionDate
      oldGrandTotal
      newGrandTotal
      netSales
      grossSales
      endingOr
      beginningOr
      zeroRatedSales
      vatableSales
      vatableExemptSales
      vatableAmount
      endDateTime
      startDateTime
      totalDiscount
      transactionTime
      zReadingCount
      resetCount
      zCounterNo
      restCounterNo
    }
    dateIssue
    ptuNo
    min
    vehiclePlateNumber
    vatTin
    validUntil
    sn
    hTitle
    hSubTitle
    fTitle
    fSubTitle
    accreditationNo
    __typename
  }
}
`

const REPORT_ANEX_B_BY_MACHINE = gql `
mutation GetUsersByMachine($startDate: String!, $endDate: String!, $machineId: Int!) {
  reportAnexBReport(startDate: $startDate, endDate: $endDate, machineId: $machineId) {
    error
    message
    data {
      paymentMethod {
        paymentType
        amount
      }
      passengerSummaryData {
        passengerType
        totalDiscount
        totalNetAmount
        totalTicketCost
      }
      passengerData {
        count
        discount
        passengerType
        ticketCost
        totalNetAmount
        __typename
      }
      pwdDiscount
      seniorCitizenDiscount
      studentDiscount
      transactionDate
      oldGrandTotal
      newGrandTotal
      netSales
      grossSales
      endingOr
      beginningOr
      zeroRatedSales
      vatableSales
      vatableExemptSales
      vatableAmount
      endDateTime
      startDateTime
      totalDiscount
      transactionTime
      zReadingCount
      resetCount
      zCounterNo
      restCounterNo
    }
    dateIssue
    ptuNo
    min
    vehiclePlateNumber
    vatTin
    validUntil
    sn
    hTitle
    hSubTitle
    fTitle
    fSubTitle
    accreditationNo
    __typename
  }
}
`

const REPORT_ANEX_B_ALL = gql `
mutation GetUsersAll($startDate: String!, $endDate: String!) {
  reportAnexBReport(startDate: $startDate, endDate: $endDate) {
    error
    message
    data {
      paymentMethod {
        paymentType
        amount
      }
      passengerSummaryData {
        passengerType
        totalDiscount
        totalNetAmount
        totalTicketCost
      }
      passengerData {
        count
        discount
        passengerType
        ticketCost
        totalNetAmount
        __typename
      }
      pwdDiscount
      seniorCitizenDiscount
      studentDiscount
      transactionDate
      oldGrandTotal
      newGrandTotal
      netSales
      grossSales
      endingOr
      beginningOr
      zeroRatedSales
      vatableSales
      vatableExemptSales
      vatableAmount
      endDateTime
      startDateTime
      totalDiscount
      transactionTime
      zReadingCount
      resetCount
      zCounterNo
      restCounterNo
    }
    dateIssue
    ptuNo
    min
    vehiclePlateNumber
    vatTin
    validUntil
    sn
    hTitle
    hSubTitle
    fTitle
    fSubTitle
    accreditationNo
    __typename
  }
}
`

const CHAT_AI_DASHBOARD = gql`
mutation ChatAIDashboard($message: String!, $sessionId: String!) {
  chatAIDashboardChat(message: $message, sessionId: $sessionId) {
    answer
    message
    question
    success
  }
}
`

const REPORT_GENERATE_CARD_REPORT = gql`
query ReportGenerateCardReport($startDate: String!, $endDate: String!, $cardNo: String) {
  reportGenerateCardReport(startDate: $startDate, endDate: $endDate, cardNo: $cardNo) {
    message
    error
    data {
      cardNo
      period
      time
      dateGenerated
      grandTotal {
        credit
        debit
        payable
      }
      cards {
        cardNo
        credit
        debit
        paymentMethod
        payable
      }
    }
  }
}
`

export default {
    REPORT_ANEX_B,
    REPORT_ANEX_B_BY_VEHICLE,
    REPORT_ANEX_B_BY_MACHINE,
    REPORT_ANEX_B_ALL,
    CHAT_AI_DASHBOARD,
    REPORT_GENERATE_CARD_REPORT,
}
