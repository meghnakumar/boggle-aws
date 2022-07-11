import {Form, FormControl, InputGroup} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import {useEffect, useState} from "react";
import {useTimer} from 'react-timer-hook';
import {useLocation} from "react-router-dom";
import axios from "axios";

// Scoring:
// 1 correct guess is 1 point
// For 3*3 grid:
//     If total time is 8 minutes and 10 extra points on all successful guesses
// For 4*4 grid:
//     If total time is 6 minutes and 10 extra points on all successful guesses
// For 5*5 grid:
//     If total time is 4 minutes and 10 extra points on all successful guesses

const GameDashboard = () => {
    const {state} = useLocation()
    const [gameType, setGameType] = useState({difficulty: "0", padding: 4});
    const [guessWord, setGuessWord] = useState('');
    const [isGameStarted, setIsGameStarted] = useState(false)
    const [gridData, setGridData] = useState({alphabets: [], possibleWords: {}})
    const [correctWordList, setCorrectWordList] = useState([]);
    const [incorrectWordList, setIncorrectWordList] = useState([]);
    const [leadershipBoard, setLeadershipBoard] = useState([]);
    const [userDetails, setUserDetails] = useState({});
    const [points, setPoints] = useState(0);

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
        alert("Game finished, you guessed " + correctWordList.length + " correct words!")
    }

    const fetchLeadershipBoard = () => {
        axios.get('https://wo64e7nzsi.execute-api.us-east-1.amazonaws.com/getLeadership')
            .then((response) => {
                console.log(response)
                setLeadershipBoard(JSON.parse(response.data.body));
            })
            .catch((error) => {
                console.log(error)
                console.log("Unable to fetch leadership board")
            })
    }
    const fetchUserDetails = () => {
        axios.get('https://wo64e7nzsi.execute-api.us-east-1.amazonaws.com/getLeadership')
            .then((response) => {
                console.log(response)
                setUserDetails(JSON.parse(response.data.body));
            })
            .catch((error) => {
                console.log(error)
                console.log("Unable to fetch user details")
            })
    }

    function getGridData(e) {
        if (e.target.value !== '0')
            axios.post('https://bomhpls6df.execute-api.us-east-1.amazonaws.com/prod',
                {
                    gridSize: e.target.value
                })
                .then((response) => {
                    console.log("Successfully fetched")
                    console.log(response.data)
                    let words = response.data.listOfWords
                    let chars = response.data.grid
                    setGridData({
                        alphabets: chars.split(","),
                        possibleWords: Object.fromEntries(words.map(word => [word, false]))
                    })
                    console.log(gridData)
                    setIsGameStarted(true)
                    const time = new Date();
                    if (response.data.gridSize === '3') {
                        setGameType({difficulty: response.data.gridSize, padding: 5})
                        time.setSeconds(time.getSeconds() + 480);
                    } else if (response.data.gridSize === '4') {
                        setGameType({difficulty: response.data.gridSize, padding: 4})
                        time.setSeconds(time.getSeconds() + 360);
                    } else {
                        setGameType({difficulty: response.data.gridSize, padding: 3})
                        time.setSeconds(time.getSeconds() + 240);
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
        console.log(e)
        setGuessWord(e.target.value);
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (guessWord.toUpperCase() in correctWordList || guessWord.toUpperCase() in incorrectWordList) {
                alert('You have already guessed this word, please try a new guess!');
            } else if (guessWord.toUpperCase() in gridData.possibleWords) {
                setPoints(points + 1);
                setCorrectWordList(wordList => [...wordList, guessWord.toUpperCase()]);
                alert('You made a correct guess!');
            } else {
                setIncorrectWordList(wordList => [...wordList, guessWord.toUpperCase()]);
                alert('OOPS! Your guess was wrong, try again!');
            }
            setGuessWord("");
        }
    };
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
                            <td className="p-2 text-center">{user.userID}</td>
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
                            <td className="p-2 text-center">8</td>
                            <td className="p-2 text-center">6</td>
                            <td className="p-2 text-center">4</td>
                        </tr>
                        <tr>
                            <td className="border-r text-center">Score</td>
                            <td className="p-2 text-center">50</td>
                            <td className="p-2 text-center">60</td>
                            <td className="p-2 text-center">95</td>
                        </tr>
                        <tr>
                            <td className="border-r text-center">Best Score</td>
                            <td className="p-2 text-center">5</td>
                            <td className="p-2 text-center">7</td>
                            <td className="p-2 text-center">32</td>
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
                    <div hidden={gameType.difficulty !== '3'} className={`grid grid-cols-3 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <div hidden={gameType.difficulty !== '4'} className={`grid grid-cols-4 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
                                {gridData.alphabets[i]}
                            </div>
                        ))}
                    </div>
                    <div hidden={gameType.difficulty !== '5'} className={`grid grid-cols-5 font-mono m-5 mt-2 mb-2`}>
                        {[...Array(parseInt(gameType.difficulty) * parseInt(gameType.difficulty)).fill(0)].map((_, i) => (
                            <div
                                className={`p-${gameType.padding} border-1 text-5xl font-bold border-solid  bg-yellow-400 text-center`}>
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
                            <td className="border-r">{correctWordList.toString()}</td>
                            <td className="p-2">{incorrectWordList.toString()}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default GameDashboard;
