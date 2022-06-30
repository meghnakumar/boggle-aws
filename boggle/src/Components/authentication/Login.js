import {useState} from 'react';
import {Button, Col, Container, Form} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';
import {useNavigate} from "react-router-dom";
import UserPool from "../../UserPool";
import {CognitoUser, AuthenticationDetails} from "amazon-cognito-identity-js";
import {CognitoIdentityServiceProvider} from "aws-sdk";

export default function Login() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('')
    const [pageMode, setPageMode] = useState("Login")

    const navigation = useNavigate();

    const handleEmail = (e) => {
        setEmail(e.target.value);
        setErrorMessage('');
    };

    const handlePassword = (e) => {
        setPassword(e.target.value);
        setErrorMessage('');
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(pageMode)
        if (pageMode === "Login") {
            const user = new CognitoUser({
                Username: email,
                Pool: UserPool
            });
            const authDetails = new AuthenticationDetails({
                Username: email,
                Password: password
            });

            user.authenticateUser(authDetails, {
                onSuccess: (data) => {
                    navigation("/playgame/", {state: {email: email}});
                },
                onFailure: (data) => {
                    setErrorMessage("Incorrect email or password");
                },
                newPasswordRequired: (data) => {
                    console.log("newPasswordRequired", data);
                },

            });
        } else if (pageMode === "Sign Up") {
            console.log("here")
            UserPool.signUp(email, password, [], null, (err, data) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log(data)
                    navigation("/verify/", {state: {email: email}});
                    // let userData = {
                    //     Username: email,
                    //     Pool: UserPool
                    // };
                    // let cognitoUser = new CognitoIdentityServiceProvider.CognitoUser(userData);
                    // cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
                    //
                    // })
                    // cognitoUser.resendConfirmationCode((err, result) => {
                    //
                    // })
                }
            })

        }

    };

    function handleSignUpMode() {
        setPageMode("Sign Up");
    }

    function handleLoginMode() {
        setPageMode("Login")
    }

    return (
        <div>

            <div className="container-fluid col-md-6 bg-blue-100 p-2 mt-4 rounded-2">
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group controlId="validationCustom03">
                        <Form.Label className="mt-2">Email</Form.Label>
                        <Form.Control onChange={handleEmail} value={email} placeholder="Email"/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="mt-2">Password</Form.Label>
                        <Form.Control type="password"
                                      onChange={handlePassword}
                                      value={password} placeholder="Password"
                        />
                    </Form.Group>
                    <Form.Group>
                        <label hidden={errorMessage.length === 0} className="mt-2 text-red-600">
                            {errorMessage}
                        </label>
                    </Form.Group>

                    <Button className="mt-2" type="submit">{pageMode}</Button>
                </Form>
                <div hidden={pageMode === "Sign Up"} className="text-end">Don't have an account?
                    <Button className="m-1" variant="outline-primary" size="sm" onClick={handleSignUpMode}>Sign
                        Up</Button>
                </div>
                <div hidden={pageMode === "Login"} className="text-end">Already have an account?
                    <Button className="m-1" variant="outline-primary" size="sm" onClick={handleLoginMode}>Login</Button>
                </div>
            </div>
        </div>
    );
}
