import {gql} from "@apollo/client";

const ADD_BUS_ROUTE = gql `
mutation MyMutation($isActive: Boolean!, $routeInfo: String!, $routeName: String!, $orderBy: Int!) {
  insert_routes_one(object: {active: $isActive, route_info: $routeInfo, route_name: $routeName, order_by: $orderBy}) {
    route_info
  }
}
`

const DELETE_BUS_ROUTE = gql `
mutation MyMutation($id: Int!, $deletedAt: timestamptz) {
  update_routes(where: {id: {_eq: $id}}, _set: {deleted_at: $deletedAt}) {
    affected_rows
  }
  update_bus_stop_routes(where: {route: {id: {_eq: $id}}, deleted_at: {_is_null: true}}, _set: {deleted_at: $deletedAt}) {
    affected_rows
  }
  update_bus_fares(where: {bus_stop_route: {route: {id: {_eq: $id}, deleted_at: {_is_null: true}}}}, _set: {deleted_at: $deletedAt}) {
    affected_rows
  }
}
`

const ENABLE_BUS_ROUTE = gql `
mutation MyMutation($enable: Boolean!, $routeId: Int!, $deletedAt: String!) {
  results: busRouteEnableRoute(enable: $enable, routeId: $routeId, deletedAt: $deletedAt) {
    error
    message
  }
}
`

export default {
    ADD_BUS_ROUTE,
    DELETE_BUS_ROUTE,
    ENABLE_BUS_ROUTE
}