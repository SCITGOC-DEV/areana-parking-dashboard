import { gql } from "@apollo/client";

const GET_PARKING_SESSIONS = gql`
  query GetParkingSessions {
    parking_sessions(order_by: { paid_at: desc }) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      qr_code
      parked_valet_driver_id
      retrieved_valet_driver_id
      created_at
      updated_at
      parked_valet_driver {
        id
        name
        phone
        created_at
      }
      retrieved_valet_driver {
        id
        name
        created_at
      }
      parking_location {
        id
        name
        address
      }
    }
  }
`;

const GET_PARKING_SESSIONS_REPORT = gql`
  query GetParkingSessionsReport($startDate: timestamptz!, $endDate: timestamptz!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
    }
  }
`;

const GET_PARKING_SESSIONS_FOR_SENIOR_CITIZEN = gql`
  query GetParkingSessionsForSeniorCitizen($startDate: timestamptz!, $endDate: timestamptz!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        passenger_type: { _eq: "Senior Citizen1" }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
    }
  }
`;

const GET_PARKING_SESSIONS_FOR_PWD = gql`
  query GetParkingSessionsForPWD($startDate: timestamptz!, $endDate: timestamptz!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        passenger_type: { _eq: "PWD1" }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
    }
  }
`;

const GET_PARKING_SESSIONS_FOR_SENIOR_CITIZEN_WITH_MACHINE = gql`
  query GetParkingSessionsForSeniorCitizenWithMachine($startDate: timestamptz!, $endDate: timestamptz!, $saleMachineId: Int!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        passenger_type: { _eq: "Senior Citizen1" }
        machine_id: { _eq: $saleMachineId }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
      machine_id
    }
  }
`;

const GET_PARKING_SESSIONS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE = gql`
  query GetParkingSessionsForSeniorCitizenWithoutMachine($startDate: timestamptz!, $endDate: timestamptz!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        passenger_type: { _eq: "Senior Citizen1" }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
      machine_id
    }
  }
`;

const GET_PARKING_SESSIONS_FOR_PWD_WITH_MACHINE = gql`
  query GetParkingSessionsForPWDWithMachine($startDate: timestamptz!, $endDate: timestamptz!, $saleMachineId: Int!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        passenger_type: { _eq: "PWD1" }
        machine_id: { _eq: $saleMachineId }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
      machine_id
    }
  }
`;

const GET_PARKING_SESSIONS_FOR_PWD_WITHOUT_MACHINE = gql`
  query GetParkingSessionsForPWDWithoutMachine($startDate: timestamptz!, $endDate: timestamptz!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        passenger_type: { _eq: "PWD1" }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
      machine_id
    }
  }
`;

const GET_PARKING_SESSIONS_REPORT_WITH_MACHINE = gql`
  query GetParkingSessionsReportWithMachine($startDate: timestamptz!, $endDate: timestamptz!, $saleMachineId: Int!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
        machine_id: { _eq: $saleMachineId }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
      machine_id
    }
  }
`;

const GET_PARKING_SESSIONS_REPORT_WITHOUT_MACHINE = gql`
  query GetParkingSessionsReportWithoutMachine($startDate: timestamptz!, $endDate: timestamptz!) {
    response: parking_sessions(
      where: {
        paid_at: { _gte: $startDate, _lte: $endDate }
      }
      order_by: { created_at: asc }
    ) {
      id
      ticket_no
      status
      payment_status
      payment_method
      passenger_name
      passenger_email
      passenger_phone
      passenger_type
      passenger_id
      plate_number
      car_brand
      car_color
      car_model
      checkin_time
      checkout_time
      total_hours
      base_fee
      hourly_rate
      discount
      total_amount
      net_amount
      paid_amount
      paid_at
      created_at
      updated_at
      machine_id
    }
  }
`;

export default {
  GET_PARKING_SESSIONS,
  GET_PARKING_SESSIONS_REPORT,
  GET_PARKING_SESSIONS_REPORT_WITH_MACHINE,
  GET_PARKING_SESSIONS_REPORT_WITHOUT_MACHINE,
  GET_PARKING_SESSIONS_FOR_SENIOR_CITIZEN_WITH_MACHINE,
  GET_PARKING_SESSIONS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE,
  GET_PARKING_SESSIONS_FOR_PWD_WITH_MACHINE,
  GET_PARKING_SESSIONS_FOR_PWD_WITHOUT_MACHINE
};

