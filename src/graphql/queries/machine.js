import {gql} from "@apollo/client";

const GET_ALL_MACHINES = gql`
query MyQuery {
  response:machines {
    id
    serial_number
    type
  }
}
`

const GET_MACHINES_BY_DRIVER = gql`
query MyQuery {
  response: machines(where: {type: {_eq: "Driver"}}) {
    serial_number
    id
    pos_terminal_number
  }
}`

const GET_ALL_MACHINES_WITH_POS = gql`
query MyQuery {
  response: machines (where: {type: {_eq: "POS"}}) {
    id
    serial_number
    pos_terminal_number
  }
}
`

export default {
    GET_ALL_MACHINES,
    GET_MACHINES_BY_DRIVER,
    GET_ALL_MACHINES_WITH_POS
}
