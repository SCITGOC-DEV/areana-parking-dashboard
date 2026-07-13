import {gql} from "@apollo/client";

const GET_X_READINGS = gql`
query MyQuery($startDate: date, $endDate: date) {
  results: x_readings(
    where: {
      transaction_date: {_gte: $startDate, _lte: $endDate}
    }
    order_by: {created_at: desc}
  ) {
    closing_balance
    created_at
    end_time
    id
    opening_balance
    transaction_date
    start_time
    machine {
      pos_terminal_number
      type
    }
    staff {
      phone
      full_name
    }
  }
}`

const GET_X_READING_REPORT_BY_MACHINE = gql`
query GetXReadingReportByMachine($reportDate: date!, $machineId: Int!) {
  response: x_readings(
    where: {
      machine_id: {_eq: $machineId}
      transaction_date: {_eq: $reportDate}
    }
  ) {
    closing_balance
    created_at
    end_time
    id
    machine_id
    opening_balance
    start_time
    transaction_date
    valet_driver_id
  }
}
`

const GET_X_READING_REPORT_BY_MACHINE_ALL = gql`
query GetXReadingReportByMachineAll($reportDate: date!) {
  response: x_readings(
    where: {
      transaction_date: {_eq: $reportDate}
    }
  ) {
    closing_balance
    created_at
    end_time
    id
    machine_id
    opening_balance
    start_time
    transaction_date
    valet_driver_id
  }
}
`

export default {
    GET_X_READINGS,
    GET_X_READING_REPORT_BY_MACHINE,
    GET_X_READING_REPORT_BY_MACHINE_ALL,
}
