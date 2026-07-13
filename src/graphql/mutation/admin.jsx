import { gql } from '@apollo/client';

export const CREATE_ADMIN = gql`
  mutation AdminRegister($userName: String!, $email: String!, $fullName: String!, $password: String!, $phone: String, $adminCategory: String) {
    response: authAdminRegister(userName: $userName, email: $email, fullName: $fullName, password: $password, phone: $phone, adminCategory: $adminCategory) {
      success
      message
      admin {
        id
        userName
        fullName
        email
        phone
        adminCategory
        active
      }
    }
  }
`;

export const UPDATE_ADMIN = gql`
  mutation UpdateAdmin($id: Int!, $input: admins_set_input!) {
    update_admins_by_pk(pk_columns: {id: $id}, _set: $input) {
      id
      full_name
      admin_category
      active
    }
  }
`;

export const DELETE_ADMIN = gql`
  mutation DeleteAdmin($id: Int!) {
    delete_admins_by_pk(id: $id) {
      id
      full_name
    }
  }
`;

export const UPDATE_ADMIN_PASSWORD = gql`
mutation MyMutation($userId: Int!, $newPassword: String!) {
  response: adminAdminResetPassword(newPassword: $newPassword, userId: $userId) {
    success
    message
  }
}
`;

export const UPDATE_ADMIN_PERMISSION = gql`
  mutation UpdateAdminPermission($adminId: Int!, $granted: Boolean!, $permissionId: Int!) {
    adminCreateAdminPermissions(adminId: $adminId, granted: $granted, permissionId: $permissionId) {
      message
      error
    }
  }
`;
