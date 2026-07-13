import { gql } from "@apollo/client"

const GET_DRIVERS = gql`
query MyQuery {
  drivers(order_by: {created_at: desc, updated_at: desc}) {
    active
    created_at
    first_name
    full_name
    id
    last_name
    phone
    user_name
    updated_at
  }
}

`

const UPDATE_DRIVER_STATUS = gql`
mutation MyMutation($id: Int!, $active: Boolean!) {
  update_drivers_by_pk(pk_columns: {id: $id}, _set: {active: $active}) {
    id
  }
}
`

const ADD_DRIVER = gql`
  mutation InsertDriver($fullName: String!, $firstName: String!, $lastName: String!, $phone: String!, $userName: String!) {
    insert_drivers_one(object: {
      full_name: $fullName,
      first_name: $firstName,
      last_name: $lastName,
      phone: $phone,
      user_name: $userName,
      active: true
    }) {
      id
    }
  }
`;

const UPDATE_DRIVER = gql`
mutation MyMutation($id: Int!, $fullName: String!, $firstName: String!, $lastName: String!, $phone: String!, $userName: String!, $updatedAt: timestamptz!) {
  update_drivers_by_pk(pk_columns: {id: $id}, _set: {full_name: $fullName, first_name: $firstName, last_name: $lastName, phone: $phone, user_name: $userName, updated_at: $updatedAt}) {
    full_name
    first_name
    last_name
    phone
    user_name
  }
}
`;

const DELETE_DRIVER = gql`
mutation DeleteDriver($id: Int!) {
  delete_drivers_by_pk(id: $id) {
    id
  }
}
`;


const GET_DRIVER_BY_ID = gql`
query MyQuery ($id: Int!) {
  results: drivers_by_pk(id: $id) {
    full_name
    password
    phone
    user_name
    device_id
    active
  }
}
`

const UPDATE_DRIVER_PASSWORD = gql`
mutation MyMutation($newPassword: String!, $userId: Int!, $note: String!) {
  response: adminDriverResetPassword(newPassword: $newPassword, userId: $userId, note: $note) {
    error
    message
  }
}
`

const SEARCH_MACHINE = gql`
query MyQuery($serialNumber: String!) {
  machines(limit: 6, where: {serial_number: {_ilike: $serialNumber}, type: {_eq: "Driver"}}) {
    id
    serial_number
    pos_terminal_number
  }
}
`

const CHANGE_MACHINE = gql`
mutation MyMutation($machineSerialNumber: String!, $vehicleId: Int!) {
  response: busRouteChangeBusOnMachineRouteByAdmin(machineSerialNumber: $machineSerialNumber, vehicleId: $vehicleId) {
    error
    message
  }
}

`
export default {
    GET_DRIVERS,
    UPDATE_DRIVER_STATUS,
    ADD_DRIVER,
    GET_DRIVER_BY_ID,
    UPDATE_DRIVER,
    UPDATE_DRIVER_PASSWORD,
    SEARCH_MACHINE,
    CHANGE_MACHINE,
    DELETE_DRIVER
}
