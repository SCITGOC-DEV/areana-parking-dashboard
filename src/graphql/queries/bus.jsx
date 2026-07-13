import { gql } from "@apollo/client"

const GET_BUSES = gql`
query MyQuery {
  results: vehicles(order_by: {created_at: desc}) {
    created_at
    updated_at
    description
    id
    driver {
      full_name
      phone
    }
    vehicle_plate_number
    vehicle_type {
      vehicle_type
      max_seat
    }
    machine_serial_number
  }
}
`

const DELETE_BUS_BY_ID = gql`
mutation MyMutation($id: Int!) {
  delete_vehicles_by_pk(id: $id) {
    id
  }
}
`

export default {
    GET_BUSES,
    DELETE_BUS_BY_ID,
}