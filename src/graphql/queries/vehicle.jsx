import {gql} from "@apollo/client";

const GET_ALL_VEHICLE_PLATE_NUMBERS = gql `
query MyQuery {
  response: vehicles {
    vehicle_plate_number
    id
    machine_serial_number
    machine_id
  }
}
`

const GET_STATION_REPORT_DATA = gql `
mutation MyMutation($busStopId: Int!, $date: String!, $direction: String!, $routeId: Int!) {
  response: reportStationaryTripReport(busStopId: $busStopId, date: $date, direction: $direction, routeId: $routeId) {
    error
    message
    data {
      busStopTime
      count
      driverName
      vehiclePlateNumber
      vehicleRouteId
    }
  }
}
`

const GET_BUS_TRIP_REPORT_DATA = gql `
mutation MyMutation($vehiclePlateNumber: String!, $date: String!, $routeId: Int!) {
  response: reportBusTripReport(vehiclePlateNumber: $vehiclePlateNumber, date: $date, routeId: $routeId) {
    error
    message
    vehicle_list {
      full_name
      arrival_time
      dispatch_time
      route_info
      route_name
      vehicle_plate_number
      vehicle_route_date
      vehicle_route_id
      distance
      bus_stop_list {
        bus_stop_id
        bus_stop_name
        order_by
        route_info
        route_name
        ticket_count
      }
      direction
    }
  }
}
`

const GET_VEHICLE_TYPES = gql `
query MyQuery {
  results: vehicle_types(order_by: {created_at: desc}) {
    active
    created_at
    description
    id
    image_url
    max_seat
    max_weight
    vehicle_type
    updated_at
  }
}
`

const ADD_VEHICLE_TYPE = gql `
mutation AddVehicleType(
  $active: Boolean!
  $description: String!
  $image_url: String!
  $max_seat: Int!
  $max_weight: numeric!
  $vehicle_type: String!
) {
  insert_vehicle_types_one(object: {
    active: $active
    description: $description
    image_url: $image_url
    max_seat: $max_seat
    max_weight: $max_weight
    vehicle_type: $vehicle_type
  }) {
    id
  }
}
`

const GET_VEHICLE_TYPE_INFO_BY_ID = gql `
query GetVehicleTypeById($id: Int!) {
  results: vehicle_types_by_pk(id: $id) {
    active
    description
    image_url
    max_seat
    max_weight
    vehicle_type
  }
}
`

const UPDATE_VEHICLE_TYPE_INFO_BY_ID = gql `
mutation UpdateVehicleType(
  $id: Int!
  $active: Boolean
  $description: String
  $image_url: String
  $max_seat: Int
  $max_weight: numeric!
  $updated_at: timestamptz
  $vehicle_type: String
) {
  update_vehicle_types_by_pk(
    pk_columns: { id: $id }
    _set: {
      active: $active
      description: $description
      image_url: $image_url
      max_seat: $max_seat
      max_weight: $max_weight
      updated_at: $updated_at
      vehicle_type: $vehicle_type
    }
  ) {
    id
  }
}
`

const UPDATE_VEHICLE_TYPE_ACTIVE_STATUS = gql `
mutation UpdateVehicleType(
  $id: Int!
  $active: Boolean
) {
  update_vehicle_types_by_pk(
    pk_columns: { id: $id }
    _set: {
      active: $active
    }
  ) {
    id
  }
}`

const GET_BUS_ANALYTICS = gql`
query MyQuery($date: date!) {
  vehicles {
    id
    vehicle_plate_number
    vehicle_routes_aggregate(where: {vehicle_route_date: {_eq: $date}}) {
      aggregate {
        count(columns: id)
      }
    }
    vehicle_routes(where: {vehicle_route_date: {_eq: $date}}) {
      id
      normal_ticketings_aggregate(where: {boarded_at: {_is_null: false}}) {
        aggregate {
          sum {
            net_amount
            ticket_cost
          }
          count(columns: id)
        }
      }
    }
  }
}
`

export default {
    GET_ALL_VEHICLE_PLATE_NUMBERS,
    GET_STATION_REPORT_DATA,
    GET_BUS_TRIP_REPORT_DATA,
    GET_VEHICLE_TYPES,
    ADD_VEHICLE_TYPE,
    GET_VEHICLE_TYPE_INFO_BY_ID,
    UPDATE_VEHICLE_TYPE_INFO_BY_ID,
    UPDATE_VEHICLE_TYPE_ACTIVE_STATUS,
    GET_BUS_ANALYTICS,
}
