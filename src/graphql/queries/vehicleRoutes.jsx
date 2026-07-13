import {gql} from "@apollo/client";

const GET_VEHICLE_ROUTES_IN_TRANSIT = gql`
query MyQuery {
  results: vehicle_routes(order_by: {created_at: desc}, where: {arrival_time: {_is_null: true}}) {
    route_id
    id
    direction
    driver {
      full_name
    }
    end_bus_stop {
      bus_stop_name
    }
    start_bus_stop {
      bus_stop_name
    }
    vehicle {
      vehicle_plate_number
    }
    dispatch_time
    arrival_time
    current_latitude
    current_longitude
    vehicle_route_date
    current_bus_stop {
      bus_stop_name
    }
  }
}
`

const GET_ALL_VEHICLE_ROUTES_WITH_FILTER = gql `query MyQuery($plateNo: String!, $date: date!) {
  results: vehicle_routes(order_by: {created_at: desc}, where: {vehicle: {vehicle_plate_number: {_eq: $plateNo}}, vehicle_route_date: {_eq: $date}}) {
    arrival_time
    created_at 
    current_bus_stop {
      bus_stop_name
    }
    direction
    dispatch_time
    driver {
      full_name
      phone
    }
    end_bus_stop {
      bus_stop_name
    }
    start_bus_stop {
      bus_stop_name
    }
    id
    route {
      route_name
    }
    vehicle {
      vehicle_plate_number
    }
    vehicle_route_date
    current_latitude
    machine_serial_number
    current_longitude
  }
}

`

const GET_ALL_VEHICLE_ROUTES = gql`
query MyQuery {
  results: vehicle_routes(order_by: {created_at: desc}) {
    arrival_time
    created_at
    current_bus_stop {
      bus_stop_name
    }
    direction
    dispatch_time
    driver {
      full_name
      phone
    }
    end_bus_stop {
      bus_stop_name
    }
    start_bus_stop {
      bus_stop_name
    }
    id
    route {
      route_name
    }
    vehicle {
      vehicle_plate_number
    }
    vehicle_route_date
    current_latitude
    current_longitude
    machine_serial_number
  }
}

`

const GET_ROUTE_RUNNING_STATUS = gql`
query MyQuery {
  routes {
    id
    deleted_at
    route_name
  }
  vehicle_routes(where: {arrival_time: {_is_null: true}}) {
    id
    route_id
  }
}
`

const GET_VEHICLE_ROUTES_BY_DATE = gql`
query MyQuery($date: date!) {
  results: vehicle_routes(order_by: {created_at: desc}, where: {vehicle_route_date: {_eq: $date}}) {
    arrival_time
    created_at
    current_bus_stop {
      bus_stop_name
    }
    direction
    dispatch_time
    driver {
      full_name
      phone
    }
    end_bus_stop {
      bus_stop_name
    }
    start_bus_stop {
      bus_stop_name
    }
    id
    route {
      route_name
    }
    vehicle {
      vehicle_plate_number
    }
    vehicle_route_date
    current_latitude
    current_longitude
    machine_serial_number
  }
}
`

const GET_VEHICLE_ROUTES_BY_PLATE = gql`
query MyQuery($plateNo: String!) {
  results: vehicle_routes(order_by: {created_at: desc}, where: {vehicle: {vehicle_plate_number: {_eq: $plateNo}}}) {
    arrival_time
    created_at
    current_bus_stop {
      bus_stop_name
    }
    direction
    dispatch_time
    driver {
      full_name
      phone
    }
    end_bus_stop {
      bus_stop_name
    }
    start_bus_stop {
      bus_stop_name
    }
    id
    route {
      route_name
    }
    vehicle {
      vehicle_plate_number
    }
    vehicle_route_date
    current_latitude
    current_longitude
    machine_serial_number
  }
}
`

export default {
    GET_VEHICLE_ROUTES_IN_TRANSIT,
    GET_ALL_VEHICLE_ROUTES_WITH_FILTER,
    GET_ALL_VEHICLE_ROUTES,
    GET_ROUTE_RUNNING_STATUS,
    GET_VEHICLE_ROUTES_BY_DATE,
    GET_VEHICLE_ROUTES_BY_PLATE
}
