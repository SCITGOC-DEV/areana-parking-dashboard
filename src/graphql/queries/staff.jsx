import { gql } from "@apollo/client";

const GET_STAFFS = gql`
query MyQuery {
  staffs(order_by: {id: asc}) {
    user_name
    updated_at
    phone
    id
    full_name
    device_id
    active
  }
}

`;

const GET_STAFFS_NAME = gql`
query MyQuery {
  staffs(order_by: {created_at: desc}) {
    id
    full_name
    created_at
    active
  }
}

`;

const UPDATE_STAFF_STATUS = gql`
mutation MyMutation($id: Int!, $active: Boolean!) {
  results: update_staffs_by_pk(pk_columns: {id: $id}, _set: {active: $active}) {
    id
    }
}
`;

const ADD_STAFF = gql`
  mutation AdminCreateStaff($fullName: String!, $userName: String!, $phone: String!, $password: String!) {
    results: adminCreateStaff(fullName: $fullName, userName: $userName, phone: $phone, password: $password) {
      error
      message
    }
  }
`;

const UPDATE_STAFF = gql`
mutation MyMutation($id: Int!, $fullName: String!, $phone: String!, $userName: String!, $updatedAt: timestamptz!) {
  results: update_staffs_by_pk(
    pk_columns: {id: $id}
    _set: {full_name: $fullName, phone: $phone, user_name: $userName, updated_at: $updatedAt}
  ) {
    full_name
    phone
    user_name
  }
}
`

const UPDATE_STAFF_PASSWORD = gql`
mutation MyMutation($newPassword: String!, $userId: Int!, $note: String!) {
  response: adminStaffResetPassword(newPassword: $newPassword, userId: $userId, note: $note) {
    error
    message
  }
}
`


const GET_STAFF_BY_ID = gql`
query MyQuery ($id: Int!) {
  results: staffs_by_pk(id: $id) {
    full_name
    id
    phone
    user_name
    active
  }
}
`;


export default {
    GET_STAFFS,
    UPDATE_STAFF_STATUS,
    ADD_STAFF,
    GET_STAFF_BY_ID,
    UPDATE_STAFF,
    UPDATE_STAFF_PASSWORD,
    GET_STAFFS_NAME
};
