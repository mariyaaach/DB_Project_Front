import jwtDecode from "jwt-decode";

type Token = {
    sub: string,
    iat: number,
    exp: number
}

const getRawToken = (): string => {
    if (typeof window === 'undefined') {
        return ''
    }
    const token = localStorage.getItem('accessToken')
    if (!token) {
        return ''
    }
    return token
}

const getJwt = (): Token => {
    if (typeof window === 'undefined') {
        return { sub: '', iat: 0, exp: 0 }
    }
    const token = localStorage.getItem('accessToken')
    if (!token) {
        return { sub: '', iat: 0, exp: 0 }
    }
    try {
        return jwtDecode(token)
    } catch (error) {
        console.error('Error decoding JWT token:', error)
        return { sub: '', iat: 0, exp: 0 }
    }
}

const getSubFromToken = (): string => {
    return getJwt().sub
}

export {getSubFromToken, getJwt, getRawToken}