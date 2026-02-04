import LoginPage from "../login/page";

export default function Signup(){
    return(
        <LoginPage apiUrl={'/signup'} btnText={'Sign Up'} btnTextLoading={'Creating account'} headerText={'Create new accout'} />
    )
}