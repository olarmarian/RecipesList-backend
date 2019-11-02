const isEmpty = (string) =>{
    if(string.trim() === ''){
        return true;
    }
    return false;
};

const isEmail = (email)=>{
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(emailRegEx)){
        return true;
    }
    return false;
};

exports.validateSignUpData = (newUser) =>{
    let errors = {};
    if(isEmpty(newUser.email)){
        errors.email = 'Email must not be empty';
    }else if(!isEmail(newUser.email)){
        erros.email = 'Must be a valid email address';
    }
    if(isEmpty(newUser.password)){
        errors.password = 'Password must not be empty';
    }
    if(newUser.password !== newUser.confirmedPassword){
        errors.confirmedPassword = 'Passwords must match';
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLogInData = (user) =>{
    let errors = {};

    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be empty';
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}
