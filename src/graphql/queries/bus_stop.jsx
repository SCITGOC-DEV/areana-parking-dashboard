import {gql} from "@apollo/client";

const GET_ALL_BUS_STOPS = gql`
query MyQuery {
  response: bus_stops(order_by: {created_at: desc}) {
    address
    bus_stop_name
    created_at
    id
    latitude
    north_latitude
    north_longitude
    south_latitude
    south_longitude
    location_map
    longitude
    updated_at
  }
}`

const ADD_BUS_STOP = gql`
mutation MyMutation(
  $address: String!
  $busStopName: String!
  $north_latitude: numeric
  $north_longitude: numeric
  $south_latitude: numeric
  $south_longitude: numeric
) {
  insert_bus_stops_one(
    object: {
      address: $address
      bus_stop_name: $busStopName
      north_latitude: $north_latitude
      north_longitude: $north_longitude
      south_latitude: $south_latitude
      south_longitude: $south_longitude
    }
  ) {
    id
  }
}

`

const DELETE_BUS_STOP = gql`
mutation DeleteBusStop($busStopId: Int!) {
  delete_bus_stops(where: {id: {_eq: $busStopId}}) {
    affected_rows
  }
}
`

const UPDATE_BUS_STOP = gql`
mutation UpdateBusStop(
  $busStopId: Int!
  $busStopName: String!
  $address: String!
  $updatedAt: timestamptz!
  $northLatitude: numeric
  $northLongitude: numeric
  $southLatitude: numeric
  $southLongitude: numeric
) {
  update_bus_stops_by_pk(
    pk_columns: { id: $busStopId }
    _set: {
      bus_stop_name: $busStopName
      address: $address
      updated_at: $updatedAt
      north_latitude: $northLatitude
      north_longitude: $northLongitude
      south_latitude: $southLatitude
      south_longitude: $southLongitude
    }
  ) {
    id
  }
}
`

const GET_ALL_BUS_STOPS_BY_ROUTE_ID = gql`
query MyQuery ($routeId: Int!) {
  response: bus_stop_routes(where: {route_id: {_eq: $routeId}}) {
    bus_stop {
      id
      bus_stop_name
    }
  }
}
`

export default {
    GET_ALL_BUS_STOPS,
    ADD_BUS_STOP,
    DELETE_BUS_STOP,
    UPDATE_BUS_STOP,
    GET_ALL_BUS_STOPS_BY_ROUTE_ID
}
