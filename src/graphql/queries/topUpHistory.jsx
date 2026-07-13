import {gql} from "@apollo/client";

const GET_TOP_UP_HISTORIES = gql`
query MyQuery {
  passenger_services_wallets_history {
    card_id
    category
    confirmed
    created_at
    id
    notes
    passenger_id
    transaction
    transaction_amount
    updated_at
    updated_passenger_wallet_amount
  }
  passenger_wallet_topup_history {
    admin_id
    card_id
    category
    created_at
    id
    new_wallet_value
    note
    passenger_id
    payment_type
    staff_id
    topup_amount
    transaction_type
    updated_at
  }
}`

export default {
    GET_TOP_UP_HISTORIES
}