import { gql } from "@apollo/client";

const GET_PARKINGS = gql`
  query GetParkings($startDate: timestamptz!, $endDate: timestamptz!) {
    parkings(
      where: {
        check_in_time: { _gte: $startDate, _lte: $endDate }
      }
      order_by: { check_in_time: desc }
    ) {
      check_in_machine_id
      check_in_time
      check_out_machine_id
      check_out_time
      created_at
      id
      plate_number
      ticket_no
      vehicle_type_id
    }
  }
`;

export default {
  GET_PARKINGS,
};
