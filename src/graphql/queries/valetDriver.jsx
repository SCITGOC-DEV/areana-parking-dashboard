import { gql } from "@apollo/client";

const GET_VALET_DRIVERS = gql`
  query GetValetDrivers {
    valet_drivers {
      id
      name
      email
      email_verified
      employee_code
      last_login
      phone
      phone_verified
      status
      created_at
      updated_at
      valet_driver_parking_locations(where: { is_active: { _eq: true } }) {
        id
        is_active
        assigned_at
        note
        parking_location {
          id
          name
          code
          address
        }
      }
    }
  }
`;

const GET_VALET_DRIVER_BY_ID = gql`
  query GetValetDriverById($id: Int!) {
    results: valet_drivers_by_pk(id: $id) {
      id
      name
      email
      phone
      employee_code
      status
    }
  }
`;

const ADD_VALET_DRIVER = gql`
  mutation AddValetDriver($name: String!, $email: String!, $phone: String!, $password: String!, $parkingLocationId: Int!) {
    response: authValetRegister(name: $name, email: $email, phone: $phone, password: $password, parkingLocationId: $parkingLocationId) {
      success
      message
      driver {
        id
        name
        email
        phone
        employee_code
      }
    }
  }
`;

const UPDATE_VALET_DRIVER = gql`
  mutation UpdateValetDriver($id: Int!, $name: String!, $email: String!, $phone: String!, $employee_code: String!, $status: String!) {
    results: update_valet_drivers_by_pk(
      pk_columns: { id: $id }
      _set: { name: $name, email: $email, phone: $phone, employee_code: $employee_code, status: $status }
    ) {
      id
      name
      email
      phone
      employee_code
      status
    }
  }
`;

const UPDATE_VALET_DRIVER_STATUS = gql`
  mutation UpdateValetDriverStatus($id: Int!, $status: String!) {
    results: update_valet_drivers_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
      status
    }
  }
`;

const DELETE_VALET_DRIVER = gql`
  mutation DeleteValetDriver($id: Int!) {
    results: delete_valet_drivers_by_pk(id: $id) {
      id
      name
    }
  }
`;

const CHANGE_VALET_DRIVER_PARKING_LOCATION = gql`
  mutation AdminChangeValetDriverParkingLocation($driverId: Int!, $parkingLocationId: Int!, $note: String) {
    response: adminChangeValetDriverParkingLocation(driverId: $driverId, parkingLocationId: $parkingLocationId, note: $note) {
      success
      statusCode
      message
      data {
        driverId
        parkingLocationId
        assignmentId
      }
    }
  }
`;

const RESET_VALET_DRIVER_PASSWORD = gql`
  mutation AdminValetDriverResetPassword($userId: Int!, $newPassword: String!) {
    response: adminValetDriverResetPassword(userId: $userId, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export default {
    GET_VALET_DRIVERS,
    GET_VALET_DRIVER_BY_ID,
    ADD_VALET_DRIVER,
    UPDATE_VALET_DRIVER,
    UPDATE_VALET_DRIVER_STATUS,
    DELETE_VALET_DRIVER,
    CHANGE_VALET_DRIVER_PARKING_LOCATION,
    RESET_VALET_DRIVER_PASSWORD,
};
