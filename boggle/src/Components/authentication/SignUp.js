import {useState} from "react";
import UserPool from "../../UserPool";

function SignUp() {


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function onSubmit(e) {
        e.preventDefault();
        UserPool.signUp(email, password, [], null, (err, result) => {
            if (err){
                console.error(err);
            }
            console.log(result);
        })
    }

    return (
        <div >
            <form onSubmit={onSubmit}>

                <label htmlFor="email">Email</label>
                <input value={email}
                onChange={(event) => setEmail(event.target.value)}></input>
                <label htmlFor="password">Password</label>
                <input value={password}
                       onChange={(event) => setPassword(event.target.value)}></input>
            </form>
        </div>
    );
}

export default SignUp;
