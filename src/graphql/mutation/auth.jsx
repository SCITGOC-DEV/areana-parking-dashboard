import {gql} from "@apollo/client";

const SIGN_IN = gql`
  mutation AdminLogin($userName: String!, $password: String!) {
    response: authAdminLogin(userName: $userName, password: $password) {
      success
      message
      data {
        token
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
  }
`

export default {
    SIGN_IN,
}
