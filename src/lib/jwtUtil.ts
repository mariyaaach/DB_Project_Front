import jwtDecode from "jwt-decode";

type Token = {
    sub: string,
    iat: number,
    exp: number
}
const getRawToken = (): string => {
    return localStorage.getItem('accessToken')
}
const getJwt = (): Token => {
    return jwtDecode(localStorage.getItem('accessToken') || '{}')
}

const getSubFromToken = (): string => {
    return getJwt().sub
}


export {getSubFromToken, getJwt, getRawToken}