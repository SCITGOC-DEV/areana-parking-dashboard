import { gql } from "@apollo/client";

export const GET_SETTINGS = gql`
  query GetSettings {
    settings(limit: 1) {
      created_at
      id
      key
      updated_at
      value
    }
  }
`;

export default {
  GET_SETTINGS,
};
