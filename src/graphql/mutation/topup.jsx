import {gql} from "@apollo/client";

const PASSENGER_TOPUP = gql`
mutation MyMutation(
  $amount: Float!, 
  $note: String!, 
  $passengerPhoneNo: String!, 
  $role: String!
) {
  walletPOSTopupWallet(
    amount: $amount, 
    note: $note, 
    passengerPhoneNo: $passengerPhoneNo, 
    role: $role
  ) {
    error
    message
  }
}
`

export default {
    PASSENGER_TOPUP
}