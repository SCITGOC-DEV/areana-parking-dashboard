import { gql } from "@apollo/client";

export const UPDATE_SETTING = gql`
  mutation UpdateSetting($id: bigint!, $value: String!) {
    update_settings_by_pk(pk_columns: { id: $id }, _set: { value: $value }) {
      id
      key
      value
      updated_at
    }
  }
`;

export default {
  UPDATE_SETTING,
};
