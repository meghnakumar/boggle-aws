import './App.css';
import GameDashboard from "./Components/dashboard/GameDashboard";
import Login from "./Components/authentication/Login";
import {Routes} from "react-router";
import {BrowserRouter as Router, Route} from "react-router-dom";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/playgame" element={<GameDashboard/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
