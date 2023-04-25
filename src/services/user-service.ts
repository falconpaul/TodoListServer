import { badRequest, HttpError, serverError } from '@help/errors'
import crypto from 'crypto'
import { passwordSecretKey, tokenSecretKey } from 'env'
import mysql from 'mysql2'
import { db } from "./db-service"


const hash = (s: string) => {
    return crypto.createHash('sha256').update(s).digest('hex')
}

export type TokenPayload = {
    id: number,
    login: string,
    expires: number
}

export const userService = {
    reg: async (login: string, password: string) => {
        try {
            const id = await db.insert('users', {
                login,
                password: hash(password + passwordSecretKey)
            })
            return id
        }
        catch (e) {
            if (e instanceof HttpError && e.parentError !== undefined) {
                const pe = e.parentError as mysql.QueryError
                if (pe.code === 'ER_DUP_ENTRY') {
                    throw serverError('Пользователь с таким логином уже существует')
                }
            }
            throw e
        }
    },

    getToken: async (login: string, password: string) => {
        const user = await db.selectOne(
            `select id
               from users
              where login = :login
                and password = :password`,
            {
                login,
                password: hash(password + passwordSecretKey)
            }
        )
        if (!user) {
            throw badRequest('Пользователя с такими данными не существует')
        }
        const expires = new Date()
        expires.setDate(expires.getDate() + 14)
        const tokenPayload: TokenPayload = {
            id: user.id as number,
            login,
            expires: +expires
        }
        const tokenPayloadString = Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
        const sign = hash(tokenPayloadString + tokenSecretKey)
        return `${tokenPayloadString}.${sign}`
    },

    getTokenData: (token: string | undefined) => {
        if (!token) return null
        const [payloadString, sign] = token.split('.')
        const payload: TokenPayload = JSON.parse(Buffer.from(payloadString, 'base64').toString())
        if (payload.expires < +new Date()) {
            throw badRequest('Токен истёк')
        }
        const computedSign = hash(payloadString + tokenSecretKey)
        if (sign !== computedSign) {
            throw badRequest('Подпись токена неверна')
        }
        return payload
    }
}
