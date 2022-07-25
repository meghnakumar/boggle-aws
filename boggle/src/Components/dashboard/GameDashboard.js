import {Button, Form, FormControl, InputGroup} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState} from "react";
import {useTimer} from 'react-timer-hook';
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";


const GameDashboard = () => {
    const {state} = useLocation()
    const [gameType, setGameType] = useState({difficulty: "0"});
    const [guessWord, setGuessWord] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [gridData, setGridData] = useState({alphabets: [], possibleWords: {}})
    const [correctWordList, setCorrectWordList] = useState([]);
    const [incorrectWordList, setIncorrectWordList] = useState([]);
    const [leadershipBoard, setLeadershipBoard] = useState([]);
    const [userDetails, setUserDetails] = useState({});
    const [points, setPoints] = useState(0);
    const [message, setMessage] = useState("");

    const navigation = useNavigate();
    useEffect(() => {
        fetchLeadershipBoard()
        fetchUserDetails()
    }, [])

    const expiryTimestamp = new Date();
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 6); // 10 minutes timer
    const {
        seconds,
        minutes,
        hours,
        days,
        isRunning,
        start,
        pause,
        resume,
        restart
    } = useTimer({expiryTimestamp, onExpire: () => handleGameFinish(), autoStart: false});

    function handleGameFinish() {
        setIsGameStarted(false);
        setCorrectWordList([]);
        setIncorrectWordList([]);
        setMessage("Game finished, you guessed " + correctWordList.length + " correct words and scored " + points + " points!");
        updateLeadershipBoard();
        updateUserDetails();
        setGameType({difficulty: "0"});
        setPoints(0)
        fetchLeadershipBoard()
    }

    const fetchLeadershipBoard = () => {
        axios.get('https://wo64e7nzsi.execute-api.us-east-1.amazonaws.com/getLeadership')
            .then((response) => {
                console.log("fetchLeadershipBoard", response)
                setLeadershipBoard(JSON.parse(response.data.body));
            })
            .catch((error) => {
                console.log(error)
                console.log("Unable to fetch leadership board")
            })
    }
    const fetchUserDetails = () => {
        axios.post('https://5b7o5gzla0.execute-api.us-east-1.amazonaws.com/getUserDetails',
            {
                userID: state.email
            })
            .then((response) => {
                console.log("userDetails",JSON.parse(response.data.body).Item)
                setUserDetails(JSON.parse(response.data.body).Item);
            })
            .catch((error) => {
                console.log(error)
                console.log("Some error occurred")
            })
    }


    const updateUserDetails = () => {
        let userData = userDetails;
        if (gameType.difficulty === "3") {
            userData.EasyGames +=1
            userData.EasyScore +=points
            if (userData.EasyBest < points)
                userData.EasyBest = points
        } else if (gameType.difficulty === "4") {
            userData.MediumGames +=1
            userData.MediumScore +=points
            if (userData.MediumBest < points)
                userData.MediumBest = points
        } else {
            userData.HardGames +=1
            userData.HardScore +=points
            if (userData.HardBest < points)
                userData.HardBest = points
        }
        setUserDetails(userData)
        axios.post('https://6tkputzb8l.execute-api.us-east-1.amazonaws.com/updateUserDetails',
            userData )
            .then((response) => {
                console.log("update response",response)
            })
            .catch((error) => {
                console.log(error)
                console.log("Some error occurred in updateUserDetails")
            })
    }

    const updateLeadershipBoard = () => {
        axios.post('https://8qveqn5ht2.execute-api.us-east-1.amazonaws.com/updateLeadership',
            {
                userID: state.email,
                userName: state.username,
                score: userDetails.EasyScore + userDetails.MediumScore + userDetails.HardScore + points
            })
            .then((response) => {
                console.log("updateLeadershipBoard", response)
            })
            .catch((error) => {
                console.log(error)
                console.log("Some error occurred in updateLeadershipBoard")
            })
    }

    function getGridData(e) {
        setMessage("")
        if (e.target.value !== '0')
            axios.post('https://bomhpls6df.execute-api.us-east-1.amazonaws.com/prod',
                {
                    gridSize: e.target.value
                })
                .then((response) => {
                    console.log("grid data",response.data)
                    let words = response.data.listOfWords
                    let chars = response.data.grid
                    setGridData({
                        alphabets: chars.split(","),
                        possibleWords: Object.fromEntries(words.map(word => [word, false]))
                    })
                    setIsGameStarted(true)
                    const time = new Date();
                    if (response.data.gridSize === '3') {
                        setGameType({difficulty: response.data.gridSize})
                        time.setSeconds(time.getSeconds() + 30);
                    } else if (response.data.gridSize === '4') {
                        setGameType({difficulty: response.data.gridSize})
                        time.setSeconds(time.getSeconds() + 30);
                    } else {
                        setGameType({difficulty: response.data.gridSize})
                        time.setSeconds(time.getSeconds() + 20);
                    }
                    restart(time)
                })
                .catch((error) => {
                    console.log(error)
                    console.log("Some error occurred")
                })
        else {
            setGameType({difficulty: e.target.value, padding: 4})
            setIsGameStarted(false)
        }
        setCorrectWordList([]);
        setIncorrectWordList([]);
    }

    const handleGuessWord = (e) => {
        setGuessWord(e.target.value);
    };
    const handleKeyDown = (e) => {
        // Scoring:
        // For 3*3 grid:
        //     1 correct guess is 1 point
        //     If total time is 8 minutes and 10 extra points on all successful guesses
        // For 4*4 grid:
        //     1 correct guess is 2 point
        //     If total time is 6 minutes and 10 extra points on all successful guesses
        // For 5*5 grid:
        //     1 correct guess is 3 point
        //     If total time is 4 minutes and 10 extra points on all successful guesses

        if (e.key === 'Enter') {
            if (correctWordList.includes(guessWord.toUpperCase()) || incorrectWordList.includes(guessWord.toUpperCase())) {
                alert('You have already guessed this word, please try a new guess!');
            } else if (guessWord.toUpperCase() in gridData.possibleWords) {
                if (gameType.difficulty === "3")
                    setPoints(points + 1);
                else if (gameType.difficulty === "4")
                    setPoints(points + 2);
                else setPoints(points + 3);
                setCorrectWordList(wordList => [...wordList, guessWord.toUpperCase()]);
                alert('You made a correct guess!');
            } else {
                setIncorrectWordList(wordList => [...wordList, guessWord.toUpperCase()]);
                alert('OOPS! Your guess was wrong, try again!');
            }
            setGuessWord("");
        }
    };

    function handleLogout() {
        navigation("/")
    }

    return (
        <div className="grid grid-cols-3 gap-4 font-mono">
            <div>
                <label className="text-lg p-3 font-bold">Hey {state.username}!</label>
                <br/>
                <label className="text-lg font-bold p-3">Leadership Board:</label>
                <div className="bg-white rounded-2 p-1 mt-0 m-2" hidden={leadershipBoard.length === 0}>
                    <table className="table-fixed border-collapse table-fixed w-full text-sm">
                        <thead>
                        <tr>
                            <th className="border-b p-2 text-center">Rank</th>
                            <th className="border-b p-2 text-center">Username</th>
                            <th className="border-b p-2 text-center">Score</th>
                        </tr>
                        </thead>
                        <tbody>
                        {leadershipBoard.map((user, index) => <tr>
                            <td className="border-r text-center">{index + 1}</td>
                            <td className="p-2 text-center">{user.userName}</td>
                            <td className="p-2 text-center">{user.score}</td>
                        </tr>)}

                        </tbody>
                    </table>
                </div>
                <label className="text-lg font-bold p-3">Scoreboard:</label>
                <div className="bg-white rounded-2 p-1 mt-0 m-2" hidden={leadershipBoard.length === 0}>
                    <table className="table-fixed border-collapse table-fixed w-full text-sm">
                        <thead>
                        <tr>
                            <th className="border-b p-2 text-center"></th>
                            <th className="border-b p-2 text-center">Easy</th>
                            <th className="border-b p-2 text-center">Medium</th>
                            <th className="border-b p-2 text-center">Hard</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border-r text-center">Games Played</td>
                            <td className="p-2 text-center">{userDetails.EasyGames}</td>
                            <td className="p-2 text-center">{userDetails.MediumGames}</td>
                            <td className="p-2 text-center">{userDetails.HardGames}</td>
                        </tr>
                        <tr>
                            <td className="border-r text-center">Score</td>
                            <td className="p-2 text-center">{userDetails.EasyScore}</td>
                            <td className="p-2 text-center">{userDetails.MediumScore}</td>
                            <td className="p-2 text-center">{userDetails.HardScore}</td>
                        </tr>
                        <tr>
                            <td className="border-r text-center">Best Score</td>
                            <td className="p-2 text-center">{userDetails.EasyScore}</td>
                            <td className="p-2 text-center">{userDetails.MediumBest}</td>
                            <td className="p-2 text-center">{userDetails.HardBest}</td>
                        </tr>

                        </tbody>
                    </table>
                </div>
                <br/>
            </div>

            {/*https://react-bootstrap.github.io/forms/select/*/}
            <div className="m-2">

                <div className="flex flex-col">
                    <div>
                        <label>Select difficulty level to start the game:</label>
                        <Form.Select value={gameType.difficulty} onChange={getGridData}
                                     aria-label="Default select example">
                            <option value="0">Select game Type</option>
                            <option value="3">Easy</option>
                            <option value="4">Medium</option>
                            <option value="5">Hard</option>
                        </Form.Select>
                    </div>
                    {message.length !== 0 && <label style={{color: '#ff6f00'}}>{message}</label>}
                    <div hidden={gameType.difficulty !== '3'} className={`grid grid-cols-3 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-5 border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <div hidden={gameType.difficulty !== '4'} className={`grid grid-cols-4 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-4 border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <div hidden={gameType.difficulty !== '5'} className={`grid grid-cols-5 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-3 border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <InputGroup hidden={gameType.difficulty === "0" || !isGameStarted}>
                        <FormControl
                            placeholder="Guess Word"
                            aria-label="Guess Word"
                            aria-describedby="basic-addon2"
                            onChange={handleGuessWord}
                            value={guessWord}
                            onKeyDown={handleKeyDown}
                        />
                    </InputGroup>
                </div>

            </div>

            <div>
                <div style={{textAlign: 'end'}} className="m-3">
                <Button variant={"outline-danger"} onClick={handleLogout}>Logout</Button>
                </div>
                <div style={{textAlign: 'center'}} hidden={!isGameStarted}>
                    <div style={{fontSize: '80px'}}>
                        <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:<span>{seconds}</span>
                    </div>
                </div>
                <div className="bg-white rounded-2 p-2 m-2" hidden={!isGameStarted}>
                    <table className="table-fixed border-collapse table-fixed w-full text-sm">
                        <thead>
                        <tr>
                            <th className="border-b p-2 text-center">Correct Words</th>
                            <th className="border-b p-2 text-center">Incorrect Words</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border-r">{correctWordList.join(", ")}</td>
                            <td className="p-2">{incorrectWordList.join(", ")}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default GameDashboard;
