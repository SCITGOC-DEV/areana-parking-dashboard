import { ApolloClient, ApolloLink, createHttpLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { jwtDecode } from "jwt-decode";
import { BASE_URL } from "./NetworkConstants";

// Load Apollo Client dev messages in development
if (process.env.NODE_ENV === 'development') {
    loadDevMessages();
    loadErrorMessages();
}

// Store the current Hasura role
let currentHasuraRole = 'super_admin';

// No-op kept for compatibility
export const updateHasuraRole = (role) => {};

// Function to reset Hasura role on logout
export const resetHasuraRole = () => {
    currentHasuraRole = 'super_admin';
};

// Helper to get role from token
const getRoleFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded?.hasura?.['x-hasura-default-role'] || 'super_admin';
    } catch {
        return 'super_admin';
    }
};

// 1. Configure HTTP Link with Hasura headers
const httpLink = createHttpLink({
    uri: BASE_URL,
    fetchOptions: {
        mode: 'cors' // Ensure CORS mode is enabled
    }
});

// 2. Enhanced Auth Link for Hasura with dynamic role
const authLink = setContext((operation, { headers }) => {
    const token = localStorage.getItem('token');
    const role = token ? getRoleFromToken(token) : 'super_admin';

    const baseHeaders = {
        ...(token && { Authorization: `Bearer ${token}` }),
        'x-hasura-role': role,
        'Content-Type': 'application/json',
    };

    return {
        headers: {
            ...baseHeaders,
            ...headers,
        }
    };
});

// 3. Improved Error Handling
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    /*console.log(`[Network error]: ${networkError.message}`)
    console.log(`[GraphQL Error]: ${networkError.message}`)*/
    console.log(`[GraphQL Error]: ${networkError}`)
    // GraphQL Errors
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, extensions }) => {
            console.error(`[GraphQL error]: ${message}`, {
                operation: operation.operationName,
                variables: operation.variables,
                extensions
            });

            if (extensions?.code === 'invalid-jwt' || extensions?.code === 'UNAUTHENTICATED') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        });
    }

    // Network Errors
    if (networkError) {
        console.log(`[Network error]: ${networkError.message}`, {
            statusCode: networkError.statusCode,
            operation: operation.operationName
        });

        if (networkError.statusCode === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    }

    /*console.log(`[Network error]: ${networkError.message}`)
    console.log(`[GraphQL Error]: ${networkError.message}`)*/
});

const logLink = new ApolloLink((operation, forward) => {
    console.log("Outgoing request:", {
        operation: operation.operationName,
        variables: operation.variables,
        headers: operation.getContext().headers,
    });

    const startTime = Date.now();

    return forward(operation).map((result) => {
        const duration = Date.now() - startTime;
        console.log(`Received response for ${operation.operationName} in ${duration}ms`, {
            data: result.data,
            errors: result.errors,
        });
        return result;
    });
});

// 4. Client Configuration with Hasura Best Practices
export const client = new ApolloClient({
    link: authLink.concat(errorLink).concat(logLink).concat(httpLink),
    cache: new InMemoryCache(),
    connectToDevTools: process.env.NODE_ENV === 'development'
});
