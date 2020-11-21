const pool = require('./db');
const dotenv = require('dotenv');
dotenv.config();

// passwords
const bcrypt = require('bcrypt');
const hashPassword = async password => {
    const salt = await bcrypt.genSalt(16);
    console.log(salt);
    return await bcrypt.hash(password, salt);
};

// JWT
const jwt = require('jsonwebtoken');
const jwtRegister = access_key_data => {
    return jwt.sign(
        access_key_data,
        process.env.JWT_KEY,
        {expiresIn: '1d'}
    );
};
const jwtGetData = encrypted_access_token => {
    try	{
        return jwt.verify(encrypted_access_token, process.env.JWT_KEY);
    }
    catch(err) {
        return null;
    }
}

const getToken = ({id, login, email, headers}) => {
    const userAgent = headers['user-agent'];
    const tokenObj = {id, login, email, userAgent};
    return jwtRegister(tokenObj);
};

const checkToken = async (token, headers) => {
    const useragent = headers['user-agent'];
    const data = jwtGetData(token);
    if (data !== null) {
        const {id, login, email} = data;
        return await checkUserExist({id, login, email});
    }
};

// methods
const checkEmail = async (email) => {
    try {
        const data = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );
        return !!data.rowCount;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

const checkLogin = async (login) => {
    try {
        const data = await pool.query(
            "SELECT * FROM users WHERE login=$1",
            [login]
        );
        return !!data.rowCount;
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

const verify = async ({login, password}) => {
    try {
        const data = await pool.query(
            "SELECT * FROM users WHERE login=$1",
            [login]
        );
        if (data.rowCount) {
            const {id, email} = data.rows[0];
            const hash = data.rows[0].password;
            const verified = await bcrypt.compare(password, hash);
            return {verified, id, login, email};
        } else {
            return {verified: false}
        }
    } catch (err) {
        console.error(err.message);
        return false;
    }
};

const checkUserExist = async ({id, login, email}) => {
    const data = await pool.query(
        "SELECT * FROM users WHERE login=$1",
        [login]
    );

    if (data.rowCount) {
        const {id: dbId, email: dbEmail} = data.rows[0];
        return (id === dbId && email === dbEmail);
    } else {
        return false;
    }
};

const register = async ({login, email, password}) => {
    try {
        const hash = await hashPassword(password);
        const result = await pool.query(
            "INSERT INTO users (login, password, email) values ($1, $2, $3)",
            [login, hash, email]
        );
        return !!result.rowCount;
    } catch (err) {
        console.error(err.message);
        return false;
    }
}

const auth = async ({login, password}, headers) => {
    const {verified, id, email} = await verify({login, password});
    if (verified) {
        return getToken({id, login, email, headers});
    } else {
        return {verified: false};
    }
}

module.exports = {checkEmail, checkLogin, verify, register, auth, checkToken};
