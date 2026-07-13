import {gql} from "@apollo/client";

const GET_ALL_PASSENGERS = gql `
query MyQuery {
  passengers(order_by: {created_at: desc}) {
    active
    address
    created_at
    device_id
    full_name
    id
    loyalty_enabled
    loyalty_points
    passenger_card_id
    passenger_id_no
    passenger_type
    password
    phone
    updated_at
    user_name
    wallet_value
  }
}
`
const GET_ALL_PASSENGERS_BY_PHONE = gql `
query MyQuery($phone: String!) {
  passengers(where: {phone: {_ilike: $phone}}) {
    phone
    first_name
    last_name
  }
}
`

export default {
    GET_ALL_PASSENGERS,
    GET_ALL_PASSENGERS_BY_PHONE,
}