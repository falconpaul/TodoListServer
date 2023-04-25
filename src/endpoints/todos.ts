import { authHandler, jsonHandler } from "@help/decorators"
import { badRequest } from "@help/errors"
import { todoService } from "@services/todo-service"

export default {
    get: jsonHandler(authHandler(async ({ tokenData }) => {
        if (!tokenData) {
            throw badRequest('Нужно авторизоваться')
        }
        return await todoService.getListByUser(tokenData.id)
    })),
    delete: jsonHandler(authHandler(async ({ params, tokenData }) => {
        if (!tokenData) {
            throw badRequest('Нужно авторизоваться')
        }
        if (params.filter === 'done') {
            await todoService.deleteDoneByUser(tokenData.id)
        }
        else {
            await todoService.deleteAllByUser(tokenData.id)
        }
    }))
} as Endpoint
