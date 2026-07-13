import {gql} from "@apollo/client";

const GET_ALL_CARDS = gql`
query MyQuery {
  cards(order_by: {connected_at: desc}) {
    active
    card_no
    card_value
    user_phone
    user_id_no
    passenger_id
    last_name
    is_connected
    id
    email
    tin
    first_name
    connected_at
    passenger {
      first_name
      last_name
      phone
      wallet_value
    }
  }
}
`

const UPDATE_CARD_STATUS = gql`
mutation UpdateCardStatus($id: Int!, $active: Boolean!) {
  update_cards_by_pk(pk_columns: {id: $id}, _set: {active: $active}) {
    active
  }
}
`

const LINK_PASSENGER_WITH_CARD = gql`
mutation MyMutation($cardNo: String!, $passengerPhoneNo: String!) {
  response: walletLinkPassengerCard(cardNo: $cardNo, passengerPhoneNo: $passengerPhoneNo) {
    error
    message
  }
}
`

const TOP_UP_CARD = gql`
mutation MyMutation($amount: String!, $cardNo: String!, $note: String!, $role: String!) {
  response: walletPOSTopupCard(amount: $amount, cardNo: $cardNo, note: $note, role: $role) {
    error
    message
  }
}
`

const CREATE_CARD = gql`
mutation MyMutation(
  $cardNo: String!,
  $email: String!,
  $firstName: String!,
  $lastName: String!,
  $passengerId: String!,
  $passengerType: String = "",
  $userIdNo: String = "",
  $userPhone: String = ""
) {
  response: walletCreateCard(
    cardNo: $cardNo,
    passengerType: $passengerType,
    email: $email,
    firstName: $firstName,
    lastName: $lastName,
    passengerId: $passengerId,
    userIdNo: $userIdNo,
    userPhone: $userPhone
  ) {
    error
    message
  }
}
`

const CREATE_CARD_WITHOUT_PASSENGER = gql`
mutation MyMutation(
  $cardNo: String!,
  $userIdNo: String = "",
  $passengerType: String = "",
) {
  response: walletCreateCard(
    cardNo: $cardNo,
    userIdNo: $userIdNo,
    passengerType: $passengerType,
  ) {
    error
    message
  }
}
`

const UPDATE_CARD_AMOUNT = gql`
mutation MyMutation(
  $amount: String!,
  $cardNo: String!,
  $note: String!,
  $role: String!,
  $transactionType: String!
) {
  response: walletUpdateCardAmount(
    amount: $amount,
    cardNo: $cardNo,
    note: $note,
    role: $role,
    transactionType: $transactionType
  ) {
    error
    message
  }
}
`

const UPDATE_CARD_INFO = gql`
mutation UpdateCard(
  $id: Int!
  $cardNo: String
  $email: String
  $firstName: String
  $lastName: String
  $tin: String
  $userIdNo: String
  $userPhone: String
) {
  response: update_cards(
    where: { id: { _eq: $id } }
    _set: {
      card_no: $cardNo
      email: $email
      first_name: $firstName
      last_name: $lastName
      tin: $tin
      user_id_no: $userIdNo
      user_phone: $userPhone
    }
  ) {
    affected_rows
  }
}
`

const UPDATE_PASSENGER_TYPE = gql`
mutation UpdatePassengerType(
  $phone: String!,
  $tin: String!,
  $passengerType: String!,
  $remark: String
) {
  response: authPassengerUpdateCardPassengerType(
    phone: $phone,
    tin: $tin,
    passengerType: $passengerType,
    remark: $remark
  ) {
    error
    message
  }
}
`

export default {
    GET_ALL_CARDS,
    LINK_PASSENGER_WITH_CARD,
    TOP_UP_CARD,
    UPDATE_CARD_AMOUNT,
    CREATE_CARD,
    CREATE_CARD_WITHOUT_PASSENGER,
    UPDATE_CARD_STATUS,
    UPDATE_PASSENGER_TYPE,
    UPDATE_CARD_INFO
}
