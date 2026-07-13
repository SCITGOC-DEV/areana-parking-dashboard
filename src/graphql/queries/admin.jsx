import { gql } from '@apollo/client';

export const GET_ADMINS = gql`
  query GetAdmins {
    admins {
      id
      full_name
      admin_category
      active
      email
      phone
      user_name
      created_at
      updated_at
    }
  }
`;

export const GET_ADMIN_BY_ID = gql`
  query GetAdminById($id: Int!) {
    admins_by_pk(id: $id) {
      id
      full_name
      admin_category
      active
      dashboard
      point_reload
      reload_history
      transaction
      route
      pwd_report
      senior_citizen_report
      sale_report
      bir_pos_sale_report
      stationary_report
      bus_trip_report
      z_reading_report
      x_reading_report
      card
      bus_stop
      passenger
      driver
      staff
      bus
      vehicle_type
      x_reading
      vehicle_in_transit
      all_vehicle_route
      
    }
  }
`;

// Fetch all permissions for a specific admin
export const GET_ADMIN_PERMISSIONS_BY_ADMIN = gql`
  query MyQuery($adminId: Int!) {
    admin_permissions(where: {admin_id: {_eq: $adminId}}) {
      permission {
        name
        id
      }
      granted
      admin_id
      permission_id
    }
  }
`;
