import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';
import App from './App';
import {ThemeProvider} from "./context/ThemeContext";
import {ApolloProvider} from "@apollo/client";
import {client} from "./api/apolloClient";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <ThemeProvider>
                <App />
            </ThemeProvider>
        </ApolloProvider>
    </React.StrictMode>
);
