import {Form} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useState} from "react";

const GameDashboard = () => {
    const json = {
        "reminder1": {
            "name": "Electricity Bill",
            "amount": "67.85",
            "date": "5th June 1:30 PM",
            "desc": "Reminder description Lorem ipsum dofdlor sit amet, consectetur adipiscing elit."
        },
        "reminder2": {
            "name": "House Rent",
            "amount": "405",
            "date": "9th June 4:20 PM",
            "desc": "Reminder description Lorem ipsum dofdlor sit amet, consectetur adipiscing elit."
        },
        "reminder3": {
            "name": "Internet Bill",
            "amount": "45.97",
            "date": "12th June 9:30 AM",
            "desc": "Reminder description Lorem ipsum dofdlor sit amet, consectetur adipiscing elit."
        },
        "reminder4": {
            "name": "NSPower",
            "amount": "120",
            "date": "7th July 7:00 PM",
            "desc": "Reminder description Lorem ipsum dofdlor sit amet, consectetur adipiscing elit."
        }
    };

    const [gameType, setGameType] = useState({difficulty: 0, visibility: false, padding: 4});

    function handleOnChange(e) {
        console.log(e.target.value)
        if (e.target.value === '')
            setGameType({difficulty: e.target.value, visibility: false, padding: 4})
        else if (e.target.value === '3')
            setGameType({difficulty: e.target.value, visibility: true, padding: 5})
        else if (e.target.value === '4')
            setGameType({difficulty: e.target.value, visibility: true, padding: 4})
        else setGameType({difficulty: e.target.value, visibility: true, padding: 3})
    }

    return (
        <div className="grid grid-cols-3 gap-4 font-mono">
            <div>User Profile Information</div>

            {/*https://react-bootstrap.github.io/forms/select/*/}
            <div className="m-2">

                <div className="flex flex-col">
                    <div>
                        <Form.Select value={gameType.difficulty} onChange={handleOnChange}
                                     aria-label="Default select example">
                            <option value="0">Select game Type</option>
                            <option value="3">Easy</option>
                            <option value="4">Medium</option>
                            <option value="5">Hard</option>
                        </Form.Select>
                    </div>
                    <div className={`grid grid-cols-${gameType.difficulty} font-mono m-5 mt-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                A
                            </div>
                        ))}

                    </div>
                </div>

            </div>

            <div>Leadership Board</div>
        </div>
    );
}

export default GameDashboard;
