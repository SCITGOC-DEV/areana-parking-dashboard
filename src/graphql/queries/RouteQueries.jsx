import {gql} from "@apollo/client";
import {graphql} from "graphql/graphql";

const GET_ALL_ROUTES = gql`
query MyQuery {
  routes(order_by: {created_at: desc}) {
    active
    created_at
    id
    order_by
    route_info
    route_name
    updated_at
    deleted_at
  }
}
`

const GET_BUS_ROUTES = gql`
query MyQuery($routeId: Int!) {
  response: bus_stop_routes(where: {route_id: {_eq: $routeId}}, order_by: {order_by: asc}) {
    bus_stop {
      bus_stop_name
      id
      latitude
      longitude
      north_latitude
      north_longitude
      south_latitude
      south_longitude
    }
    id
    order_by
    created_at
    updated_at
    deleted_at
  }
}
`

const GET_BUS_FARES = gql `
query MyQuery($routeId: Int!) {
  response: bus_fares(where: {bus_stop_route: {route: {id: {_eq: $routeId}}}, deleted_at: {_is_null: true}}) {
    fare
    id
    end_bus_stop {
      bus_stop_name
      id
    }
    start_bus_stop {
      bus_stop_name
      id
    }
  }
}
`

const UPDATE_BUS_FARE = gql `
mutation UpdateBusFare($id: Int!, $fare: numeric!, $updatedAt: timestamptz!) {
  update_bus_fares(where: {id: {_eq: $id}}, _set: {fare: $fare, updated_at: $updatedAt}) {
    affected_rows
  }
}
`

/*
const ADD_BUS_FARE = gql `
`
*/

const ADD_BUS_STOP_TO_ROUTE = gql `
mutation MyMutation(
  $busStopId: Int!, 
  $orderBy: Int!, 
  $routeId: Int!
) {
  response: busRouteCreateBusStopInRoute(
    busStopId: $busStopId, 
    orderBy: $orderBy, 
    routeId: $routeId
  ) {
    error
    message
    data {
      id
      orderBy
    }
  }
}
`

const GET_VEHICLE_ROUTE = gql `
query MyQuery {
  response: vehicle_routes(order_by: {created_at: desc}) {
  id
    direction
    vehicle {
      vehicle_plate_number
    }
    route {
      route_info
    }
  }
}`

const GET_ROUTE_ANALYTICS = gql`
query MyQuery($date: date!) {
  routes(where: {deleted_at: {_is_null: true}}) {
    id
    route_name
    route_info
    vehicle_routes_aggregate(where: {vehicle_route_date: {_eq: $date}}) {
      aggregate {
        count(columns: id)
      }
    }
    vehicle_routes(where: {vehicle_route_date: {_eq: $date}}) {
      route_id
      vehicle_id
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
    GET_ALL_ROUTES,
    GET_BUS_ROUTES,
    GET_BUS_FARES,
    UPDATE_BUS_FARE,
    ADD_BUS_STOP_TO_ROUTE,
    GET_VEHICLE_ROUTE,
    GET_ROUTE_ANALYTICS
}
