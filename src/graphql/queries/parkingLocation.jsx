import { gql } from "@apollo/client";

const GET_PARKING_LOCATIONS = gql`
  query GetParkingLocations {
    parking_locations(order_by: { created_at: desc }) {
      id
      name
      code
      address
      latitude
      longitude
      description
      created_by
      active
      created_at
    }
  }
`;

const GET_PARKING_LOCATION_BY_ID = gql`
  query GetParkingLocationById($id: Int!) {
    results: parking_locations_by_pk(id: $id) {
      id
      name
      code
      address
      latitude
      longitude
      description
      active
    }
  }
`;

const ADD_PARKING_LOCATION = gql`
  mutation AddParkingLocation($name: String!, $code: String, $address: String, $latitude: numeric, $longitude: numeric, $description: String) {
    results: insert_parking_locations_one(object: {
      name: $name
      code: $code
      address: $address
      latitude: $latitude
      longitude: $longitude
      description: $description
    }) {
      id
      name
    }
  }
`;

const UPDATE_PARKING_LOCATION = gql`
  mutation UpdateParkingLocation($id: Int!, $name: String!, $code: String, $address: String, $latitude: numeric, $longitude: numeric, $description: String, $active: Boolean!) {
    results: update_parking_locations_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, code: $code, address: $address, latitude: $latitude, longitude: $longitude, description: $description, active: $active }
    ) {
      id
      name
    }
  }
`;

const DELETE_PARKING_LOCATION = gql`
  mutation DeleteParkingLocation($id: Int!) {
    results: delete_parking_locations_by_pk(id: $id) {
      id
      name
    }
  }
`;

export default {
    GET_PARKING_LOCATIONS,
    GET_PARKING_LOCATION_BY_ID,
    ADD_PARKING_LOCATION,
    UPDATE_PARKING_LOCATION,
    DELETE_PARKING_LOCATION,
};
