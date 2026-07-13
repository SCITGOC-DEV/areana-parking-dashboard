import { gql } from "@apollo/client"

const GET_DISPATCHERS = gql`
  query MyQuery {
    dispatchers(order_by: {created_at: desc}) {
      user_name
      phone
      id
      full_name
      active
      device_id
      updated_at
    }
  }
`

const UPDATE_DISPATCHER_STATUS = gql`
  mutation UpdateDispatcherStatus($id: Int!, $active: Boolean!) {
    update_dispatchers_by_pk(pk_columns: {id: $id}, _set: {active: $active}) {
      id
    }
  }
`

const ADD_DISPATCHER = gql`
  mutation MyMutation($fullName: String!, $password: String!, $phone: String!, $userName: String!) {
    adminCreateDispatcher(fullName: $fullName, password: $password, phone: $phone, userName: $userName) {
      error
      message
    }
  }
`

const UPDATE_DISPATCHER = gql`
  mutation MyMutation($id: Int!, $fullName: String!, $userName: String!, $phone: String!) {
    update_dispatchers(where: {id: {_eq: $id}}, _set: {full_name: $fullName, user_name: $userName, phone: $phone}) {
      affected_rows
    }
  }
`

const DELETE_DISPATCHER = gql`
  mutation DeleteDispatcherById($id: Int!) {
    delete_dispatchers_by_pk(id: $id) {
      id
    }
  }
`

const GET_DISPATCHER_BY_ID = gql`
  query GetDispatcherById($id: Int!) {
    results: dispatchers_by_pk(id: $id) {
      full_name
      password
      phone
      user_name
      device_id
      active
    }
  }
`

const UPDATE_DISPATCHER_PASSWORD = gql`
  mutation UpdateDispatcherPassword($newPassword: String!, $userId: Int!, $note: String!) {
    response: adminDispatcherResetPassword(newPassword: $newPassword, userId: $userId, note: $note) {
      error
      message
    }
  }
`

const GET_PERMISSIONS = gql`
  query MyQuery {
    permissions(order_by: {order_by: asc}) {
      name
      id
      display_name
      order_by
    }
  }
`

export default {
  GET_DISPATCHERS,
  UPDATE_DISPATCHER_STATUS,
  ADD_DISPATCHER,
  GET_DISPATCHER_BY_ID,
  UPDATE_DISPATCHER,
  UPDATE_DISPATCHER_PASSWORD,
  DELETE_DISPATCHER,
  GET_PERMISSIONS
}
