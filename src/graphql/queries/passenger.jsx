import { gql } from "@apollo/client";

const GET_PASSENGERS = gql`
query MyQuery {
  results: passengers(order_by: {created_at: desc}) {
    wallet_value
    phone
    passenger_type
    first_name
    last_name
    email_address
    date_of_birth
    created_at
    updated_at
    active
    id
  }
}
`;

const ADMIN_CREATE_PASSENGER = gql`
mutation MyMutation(
  $firstName: String!
  $lastName: String!
  $passengerType: String!
  $password: String!
  $phone: String!
  $address: String!
  $dob: String!
  $email: String!
  $gender: String!
  $passengerCardId: String!
  $passengerIdNo: String!
  $tin: String!
) {
  results: adminCreatePassenger(
    firstName: $firstName
    lastName: $lastName
    passengerType: $passengerType
    password: $password
    phone: $phone
    address: $address
    dob: $dob
    email: $email
    gender: $gender
    passengerCardId: $passengerCardId
    passengerIdNo: $passengerIdNo
    tin: $tin
  ) {
    message
    error
  }
}

`;

const UPDATE_PASSENGER = gql`
mutation MyMutation(
  $id: Int!, 
  $address: String, 
  $email_address: String, 
  $first_name: String, 
  $gender: String, 
  $last_name: String, 
  $passenger_card_id: String, 
  $passenger_id_no: String, 
  $passenger_type: String, 
  $phone: String, 
  $tin: String, 
  $updated_at: timestamptz,
  $dob: date
) {
  results: update_passengers_by_pk(
    pk_columns: { id: $id }, 
    _set: { 
      address: $address, 
      email_address: $email_address, 
      first_name: $first_name, 
      gender: $gender, 
      last_name: $last_name, 
      passenger_card_id: $passenger_card_id, 
      passenger_id_no: $passenger_id_no, 
      passenger_type: $passenger_type, 
      phone: $phone, 
      tin: $tin, 
      updated_at: $updated_at,
      date_of_birth : $dob,
    }
  ) {
    id
  }
}
`

const GET_PASSENGER_TYPES = gql`
mutation MyMutation {
  results: ticketGetPassengerType {
    data {
      name
      id
    }
    error
    message
  }
}`

const GET_PASSENGER_INFO = gql`
query MyQuery($id: Int!) {
  results: passengers_by_pk(id: $id) {
    first_name
    last_name
    phone
    device_id
    passenger_type
    passenger_id_no
    passenger_card_id
    address
    gender
    email_address
    tin
    date_of_birth
  }
}
`

const GET_PASSENGER_DETAILS_BY_ID = gql`
query MyQuery($id: Int!) {
  passengers_by_pk(id: $id) {
    active
    address
    created_at
    date_of_birth
    email_address
    first_name
    gender
    last_name
    passenger_card_id
    passenger_type
    phone
    tin
    verified_email
    wallet_value
  }
}
`;

const CHECK_PHONE_NUMBER_EXISTS = gql`
query MyQuery($phone: String!) {
  passengers(where: {phone: {_eq: $phone}}) {
    id
    phone
  }
}
`

const CHECK_GMAIL_EXISTS = gql`
query MyQuery($email: String!) {
  passengers(where: {email_address: {_eq: $email}}) {
    id
    email_address
  }
}
`

const UPDATE_PASSENGER_STATUS = gql`
mutation MyMutation($id: Int!, $active: Boolean!) {
  update_passengers_by_pk(pk_columns: {id: $id}, _set: {active: $active}) {
    active
  }
}
`

const DELETE_PASSENGER_BY_ID = gql`
mutation MyMutation($id: Int!) {
  delete_passengers_by_pk(id: $id) {
    id
  }
}
`

export default {
    GET_PASSENGERS,
    ADMIN_CREATE_PASSENGER,
    GET_PASSENGER_DETAILS_BY_ID,
    GET_PASSENGER_INFO,
    UPDATE_PASSENGER,
    GET_PASSENGER_TYPES,
    CHECK_GMAIL_EXISTS,
    CHECK_PHONE_NUMBER_EXISTS,
    UPDATE_PASSENGER_STATUS,
    DELETE_PASSENGER_BY_ID,
}