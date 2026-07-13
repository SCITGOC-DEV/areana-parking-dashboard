import { AppRoutes } from './routes/AppRoutes';
import {useEffect} from "react";
import {removeToken} from "./utils/token";

function App() {
    useEffect(() => {
        //removeToken()
    }, []);
    return (
        <AppRoutes />
    );
}

export default App;