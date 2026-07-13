import {gql} from "@apollo/client";

const GET_NORMAL_TICKETS = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!, $saleMachineId: Int!) {
  response: normal_ticketings(
    where: {
      created_at: { _gte: $startDate, _lte: $endDate }
      sales_machine_id: { _eq: $saleMachineId }
    }
    order_by: { created_at: asc }
  )  {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    validator_id
    boarded_at
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}
`;

// Query without plate number filter
const GET_ALL_NORMAL_TICKETS_FOR_POS = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      created_at: { _gte: $startDate, _lte: $endDate }
      staff_id: {_is_null: false}


    }
    order_by: { created_at: asc }
  ) {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    boarded_at
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}

`;

const GET_ALL_NORMAL_TICKETS_FOR_OVV = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      created_at: { _gte: $startDate, _lte: $endDate }
      card_id : {_is_null: false}


    }
    order_by: { created_at: asc }
  ) {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    boarded_at
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}

`;
const GET_ALL_NORMAL_TICKETS = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      created_at: { _gte: $startDate, _lte: $endDate }

    }
    order_by: { created_at: asc }
  ) {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    boarded_at
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}

`;

const GET_ALL_NORMAL_TICKETS_BY_DATE = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      created_at: {_gte: $startDate, _lte: $endDate}
    }
    order_by: {created_at: desc}
  ) {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_id
    ticket_id
    boarded_at
    validator_id
    staff_id
    boarded
    vehicle_route_id
    vat_amount
    vat_exempt_sales
    vatable_sales
    payment_method
    ticket_code
    __typename
  }
}

`;

const GET_NORMAL_TICKETS_BY_STAFF = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!, $validatorId: Int!) {
  response: normal_ticketings(
    where: {
      staff_id: {_eq: $validatorId}
      created_at: {_gte: $startDate, _lte: $endDate}
    }
    order_by: {created_at: desc}
  ) {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_id
    ticket_id
    machine_id
    validator_id
    staff_id
    boarded_at
    boarded
    vehicle_route_id
    vat_amount
    vat_exempt_sales
    vatable_sales
    payment_method
    ticket_code
    staff {
      full_name
      id
    }
    __typename
  }
}
`;

const GET_NORMAL_TICKETS_BY_ALL_STAFF = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      staff_id: {_is_null: false}
      created_at: {_gte: $startDate, _lte: $endDate}
    }
    order_by: {created_at: desc}
  ) {
    discount
    net_amount
    created_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_id
    ticket_id
    machine_id
    validator_id
    staff_id
    boarded_at
    boarded
    vehicle_route_id
    vat_amount
    vat_exempt_sales
    vatable_sales
    payment_method
    ticket_code
    staff {
      full_name
      id
    }
    __typename
  }
}
`;



const GET_NORMAL_TICKETS_FOR_DISABLE_PERSON = gql`
query GetUsers($startDate: date!, $endDate: date!, $machineSerialNo: String!) {
  response: normal_ticketings(where: {vehicle_route: {machine: {serial_number: {_eq: $machineSerialNo}}, vehicle_route_date: {_gte: $startDate, _lte: $endDate}}, passenger_type: {_eq: "PWD"}}, order_by: {boarded_at: asc}) {
    discount
    net_amount
    created_at
    boarded_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}
`

const GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITHOUT_MACHINE = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      passenger_type: { _eq: "PWD" }
      created_at: { _gte: $startDate, _lte: $endDate }

    }
    order_by: { created_at: asc }
  ) {
    discount
    net_amount
    created_at
    boarded_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}
`

const GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITHOUT_MACHINE_FOR_POS = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      passenger_type: { _eq: "Senior Citizen" }
      created_at: { _gte: $startDate, _lte: $endDate }
      staff_id: {_is_null: false}

    }
    order_by: { created_at: asc }
  ){
    discount
    net_amount
    created_at
    boarded_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}
`
const GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITHOUT_MACHINE_FOR_OVV = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      passenger_type: { _eq: "PWD" }
      created_at: { _gte: $startDate, _lte: $endDate }
      card_id : {_is_null: false}

    }
    order_by: { created_at: asc }
  )  {
    discount
    net_amount
    created_at
    boarded_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}
`

const GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITH_SALE_MACHINE_ID = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!, $saleMachineId: Int!) {
  response: normal_ticketings(
    where: {
      created_at: { _gte: $startDate, _lte: $endDate }
      passenger_type: { _eq: "PWD" }
      sales_machine_id: { _eq: $saleMachineId }
    }
    order_by: { created_at: asc }
  ) {
    discount
    net_amount
    created_at
    boarded_at
    passenger_card_id
    passenger_id_no
    passenger_type
    registered_name
    ticket_cost
    card_no
    tin
    ticket_id
    ticket_code
    validator_id
    boarded
    vehicle_route_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    __typename
  }
}
`

const GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      passenger_type: { _eq: "Senior Citizen" }
      created_at: { _gte: $startDate, _lte: $endDate }

    }
    order_by: { created_at: asc }
  )  {
    discount
    net_amount
    note
    created_at
    boarded_at
    validator_id
    passenger_card_id
    passenger_id_no
    passenger_id
    passenger_type
    payment_method
    registered_date_of_birth
    registered_name
    registered_phone
    ticket_cost
    ticket_id
    ticket_code
    vat_amount
    vat_exempt_sales
    vatable_sales
    vehicle_route_id
    card_no
    tin
    sales_machine_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    machine {
      serial_number
    }
  }
}
`
const GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE_FOR_POS = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      passenger_type: { _eq: "Senior Citizen" }
      created_at: { _gte: $startDate, _lte: $endDate }
      staff_id: {_is_null: false}

    }
    order_by: { created_at: asc }
  )  {
    discount
    net_amount
    note
    created_at
    boarded_at
    validator_id
    passenger_card_id
    passenger_id_no
    passenger_id
    passenger_type
    payment_method
    registered_date_of_birth
    registered_name
    registered_phone
    ticket_cost
    ticket_id
    ticket_code
    vat_amount
    vat_exempt_sales
    vatable_sales
    vehicle_route_id
    card_no
    tin
    sales_machine_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    machine {
      serial_number
    }
  }
}
`

const GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE_FOR_OVV = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(
    where: {
      passenger_type: { _eq: "Senior Citizen" }
      created_at: { _gte: $startDate, _lte: $endDate }
      card_id : {_is_null: false}

    }
    order_by: { created_at: asc }
  )  {
    discount
    net_amount
    note
    created_at
    boarded_at
    validator_id
    passenger_card_id
    passenger_id_no
    passenger_id
    passenger_type
    payment_method
    registered_date_of_birth
    registered_name
    registered_phone
    ticket_cost
    ticket_id
    ticket_code
    vat_amount
    vat_exempt_sales
    vatable_sales
    vehicle_route_id
    card_no
    tin
    sales_machine_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    machine {
      serial_number
    }
  }
}
`


const GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITH_SALEMACHINE_ID = gql`
query GetUsers($startDate: timestamptz!, $endDate: timestamptz!, $saleMachineId: Int!) {
  response: normal_ticketings(
    where: {
      created_at: { _gte: $startDate, _lte: $endDate }
      passenger_type: { _eq: "Senior Citizen" }
      sales_machine_id: { _eq: $saleMachineId }
    }
    order_by: { created_at: asc }
  )  {
    discount
    net_amount
    note
    created_at
    boarded_at
    passenger_card_id
    passenger_id
    passenger_id_no
    passenger_type
    payment_method
    registered_date_of_birth
    registered_name
    registered_phone
    validator_id
    ticket_cost
    ticket_id
    ticket_code
    vat_amount
    vat_exempt_sales
    vatable_sales
    vehicle_route_id
    card_no
    tin
    sales_machine_id
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      machine {
        serial_number
      }
    }
    machine {
      serial_number
    }
  }
}
`

export default {

    GET_NORMAL_TICKETS,
    GET_ALL_NORMAL_TICKETS_FOR_OVV,
    GET_ALL_NORMAL_TICKETS_FOR_POS,
    GET_ALL_NORMAL_TICKETS,


    GET_ALL_NORMAL_TICKETS_BY_DATE,
    GET_NORMAL_TICKETS_BY_STAFF,
    GET_NORMAL_TICKETS_BY_ALL_STAFF,

    GET_NORMAL_TICKETS_FOR_DISABLE_PERSON,
    GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITHOUT_MACHINE,
    GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITHOUT_MACHINE_FOR_OVV,
    GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITHOUT_MACHINE_FOR_POS,
    GET_NORMAL_TICKETS_FOR_DISABLE_PERSON_WITH_SALE_MACHINE_ID,

    GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE,
    GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITH_SALEMACHINE_ID,
    GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE_FOR_OVV,
    GET_NORMAL_TICKETS_FOR_SENIOR_CITIZEN_WITHOUT_MACHINE_FOR_POS,
}
