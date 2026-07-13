import { gql } from "@apollo/client";

const GET_ALL_TICKETS = gql`
  query MyQuery($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(where: {created_at: {_gte: $startDate, _lte: $endDate}}, order_by: [{machine: {serial_number: asc}}, {ticket_id: asc}]) {
    vehicle_route_id
    vatable_sales
    vat_exempt_sales
    vat_amount
    access_decision
    validator_id
    ticket_id
    ticket_cost
    staff_id
    registered_phone
    boarded_at
    registered_name
    registered_date_of_birth
    payment_method
    passenger_type
    passenger_id_no
    passenger_id
    passenger_card_id
    note
    net_amount
    machine_id
    id
    driver_id
    discount
    created_at
    bus_stop_route_id
    boarded
    admin_id
    ticket_code
    staff {
      id
      full_name
    }
    machine {
      id
      serial_number
    }
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      route {
        route_name
        id
        route_info
      }
      driver {
        full_name
      }
    }
    bus_fare {
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      direction
      fare
    }
  }
}


`

const GET_UNUSED_TICKETS_POS = gql`
query MyQuery($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(where: {boarded_at: {_is_null: true}, staff_id: {_is_null: false}, created_at: {_gte: $startDate, _lte: $endDate}}, order_by: {created_at: desc}) {
    vehicle_route_id
    ticket_code
    vatable_sales
    vat_exempt_sales
    vat_amount
    access_decision
    validator_id
    ticket_id
    ticket_cost
    staff_id
    registered_phone
    boarded_at
    registered_name
    registered_date_of_birth
    payment_method
    passenger_type
    passenger_id_no
    passenger_id
    passenger_card_id
    note
    net_amount
    machine_id
    id
    driver_id
    discount
    created_at
    bus_stop_route_id
    boarded
    admin_id
    staff {
      id
      full_name
    }
    machine {
      id
      serial_number
    }
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      route {
        route_name
        id
        route_info
      }
      driver {
        full_name
      }
    }
    bus_fare {
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      direction
      fare
      bus_stop_route {
        route {
          route_name
          route_info
          id
        }
      }
    }
  }
}
`

const GET_USED_TICKETS_POS = gql`query MyQuery($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(where: {boarded_at: {_is_null: false}, staff_id: {_is_null: false}, created_at: {_gte: $startDate, _lte: $endDate}}, order_by: {created_at: desc}) {
    vehicle_route_id
    ticket_code
    vatable_sales
    vat_exempt_sales
    vat_amount
    access_decision
    validator_id
    ticket_id
    ticket_cost
    staff_id
    registered_phone
    boarded_at
    registered_name
    registered_date_of_birth
    payment_method
    passenger_type
    passenger_id_no
    passenger_id
    passenger_card_id
    note
    net_amount
    machine_id
    id
    driver_id
    discount
    created_at
    bus_stop_route_id
    boarded
    admin_id
    staff {
      id
      full_name
    }
    machine {
      id
      serial_number
    }
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      route {
        route_name
        id
        route_info
      }
      driver {
        full_name
      }
    }
    bus_fare {
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      direction
      fare
      bus_stop_route {
        route {
          route_name
          route_info
          id
        }
      }
    }
  }
}`
const GET_USED_TICKETS_QR = gql`query MyQuery($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(where: {boarded_at: {_is_null: false}, passenger_id: {_is_null: false}, created_at: {_gte: $startDate, _lte: $endDate}}, order_by: {created_at: desc}) {
    vehicle_route_id
    ticket_code
    vatable_sales
    vat_exempt_sales
    vat_amount
    access_decision
    validator_id
    ticket_id
    ticket_cost
    staff_id
    registered_phone
    boarded_at
    registered_name
    registered_date_of_birth
    payment_method
    passenger_type
    passenger_id_no
    passenger_id
    passenger_card_id
    note
    net_amount
    machine_id
    id
    driver_id
    discount
    created_at
    bus_stop_route_id
    boarded
    admin_id
    staff {
      id
      full_name
    }
    machine {
      id
      serial_number
    }
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      route {
        route_name
        id
        route_info
      }
    }
    bus_fare {
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      direction
      fare
      bus_stop_route {
        route {
          route_name
          route_info
          id
        }
      }
    }
  }
}`

const GET_UNUSED_TICKETS_QR = gql`query MyQuery($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings(where: {boarded_at: {_is_null: true}, passenger_id: {_is_null: false}, created_at: {_gte: $startDate, _lte: $endDate}}, order_by: {created_at: desc}) {
    vehicle_route_id
    ticket_code
    vatable_sales
    vat_exempt_sales
    vat_amount
    access_decision
    validator_id
    ticket_id
    ticket_cost
    staff_id
    registered_phone
    boarded_at
    registered_name
    registered_date_of_birth
    payment_method
    passenger_type
    passenger_id_no
    passenger_id
    passenger_card_id
    note
    net_amount
    machine_id
    id
    driver_id
    discount
    created_at
    bus_stop_route_id
    boarded
    admin_id
    staff {
      id
      full_name
    }
    machine {
      id
      serial_number
    }
    vehicle_route {
      vehicle {
        vehicle_plate_number
      }
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      route {
        route_name
        id
        route_info
      }
    }
    bus_fare {
      end_bus_stop {
        bus_stop_name
      }
      start_bus_stop {
        bus_stop_name
      }
      direction
      fare
      bus_stop_route {
        route {
          route_name
          route_info
          id
        }
      }
    }
  }
}`

const GET_SALE_TICKETS = gql `query GetSaleTickets($startDate: timestamptz!, $endDate: timestamptz!) {
  response: normal_ticketings (
    where: {
      card_id: {_is_null: true}
      created_at: {_gte: $startDate, _lte: $endDate}
    }
    order_by: {created_at: desc}
  ) {
    boarded_at
    created_at
    passenger_type
    machine_id
    ticket_id
    registered_name
    passenger_id
    staff_id
    registered_phone
    boarded
    ticket_cost
    discount
    net_amount
    ticket_code
  }
}
`

export default {
    GET_ALL_TICKETS,
    GET_UNUSED_TICKETS_POS,
    GET_USED_TICKETS_POS,
    GET_USED_TICKETS_QR,
    GET_UNUSED_TICKETS_QR,
    GET_SALE_TICKETS
}
