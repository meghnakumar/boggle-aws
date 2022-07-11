import {useState} from 'react';
import {Button, Form} from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.css';
import {useLocation, useNavigate} from "react-router-dom";
import UserPool from "../../UserPool";
import {CognitoUser} from 'amazon-cognito-identity-js';
import axios from "axios";

export default function VerifyUser() {
    const {state} = useLocation()
    const [verificationCode, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('')

    const navigation = useNavigate();
    let userData = {
        Username: state.email,
        Pool: UserPool
    };
    let cognitoUser = new CognitoUser(userData);

    const handleSubmit = (e) => {
        e.preventDefault();
        cognitoUser.confirmRegistration(verificationCode, true, async (err, result) => {
            if (err) {
                console.log(err)
                setErrorMessage("Incorrect verification code, please regenerate verification again.")
            } else {
                console.log(result)
                await axios.post('https://fruphzswd4.execute-api.us-east-1.amazonaws.com/addUser',
                    {
                        userID: state.email})
                    .then((response) => {
                        console.log("User successfully added")
                    })
                    .catch((error) => {
                        console.log(error)
                        console.log("Unable to add user")
                    })
                await axios.post('https://6ij93fr12c.execute-api.us-east-1.amazonaws.com/subscribe',
                    {
                        userID: state.email
                    })
                    .then((response) => {
                        console.log("User successfully subscribed")
                    })
                    .catch((error) => {
                        console.log(error)
                        console.log("Unable to subscribe to mails")
                    })

                navigation("/playgame/", {state: {username: state.username, email: state.email}});
            }
        })

    };


    function handleResendVerification() {
        setErrorMessage('');
        setVerificationCode('');
        cognitoUser.resendConfirmationCode((err, result) => {

        })
    }

    const handleVerificationCode = (e) => {
        setVerificationCode(e.target.value);
        setErrorMessage('');
    };

    return (
        <div>

            <div className="container-fluid col-md-6 bg-blue-100 p-2 mt-4 rounded-2">
                <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label className="mt-2">Verification Code</Form.Label>
                        <Form.Control disabled={errorMessage.length !== 0} onChange={handleVerificationCode}
                                      value={verificationCode} type="number"
                                      placeholder="Verification Code"/>
                    </Form.Group>
                    <Form.Group>
                        <label hidden={errorMessage.length === 0} className="mt-2 text-red-600">
                            {errorMessage}
                        </label>
                    </Form.Group>

                    <Button className="mt-2" type="submit">Verify</Button>
                </Form>
                <div hidden={errorMessage.length === 0} className="text-end">Resend Verification Code
                    <Button className="m-1" variant="outline-primary" size="sm"
                            onClick={handleResendVerification}>Resend</Button>
                </div>
            </div>
        </div>
    );
}
