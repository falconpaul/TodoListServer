import { HttpError, serverError } from '@help/errors'
import { TokenPayload, userService } from '@services/user-service'

export type ResponseData = {
    status: number,
    headers: Record<string, string>
}
export type JsonQuery = {
    headers: Record<string, string>,
    params: QueryParams
    payload: Record<string, unknown>,
    resp: ResponseData
}

export type AuthJsonQuery = JsonQuery & {
    tokenData: TokenPayload | null
}

type JsonSimpleHandler = (request: JsonQuery) => Promise<unknown>

type JsonHandlerWrapper = (simpleHandler: JsonSimpleHandler) => Handler

type AuthJsonHandlerWrapper = (simpleHandler: (request: AuthJsonQuery) => Promise<unknown>) => JsonSimpleHandler

type JsonResponseBody = { status: 'ok' | 'error', payload: unknown }

export const jsonHandler: JsonHandlerWrapper = (simpleHandler) => {
    const wrapper: Handler = async(request) => {
        const resp: ResponseData = {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        }
        let body: JsonResponseBody
        try {
            const data = await simpleHandler({
                headers: request.headers,
                params: request.params,
                payload: JSON.parse(request.body.toString() || '{}'),
                resp
            })
            body = {
                status: 'ok',
                payload: data
            }
        }
        catch (e) {
            const err = e instanceof HttpError ? e : serverError((e as Error).message)
            resp.status = err.status
            body = {
                status: 'error',
                payload: err.message
            }
        }
        return {
            ...resp,
            body: JSON.stringify(body)
        }
    }
    return wrapper
}

export const authHandler: AuthJsonHandlerWrapper = (simpleHandler) => {
    return async (request) => {
        const tokenData = userService.getTokenData(request.headers['access-token'])
        return await simpleHandler({ ...request, tokenData })
    }
}
