import { authHandler, jsonHandler } from "@help/decorators"
import { badRequest } from "@help/errors"
import { CreatingTodo, Todo, todoService } from "@services/todo-service"

export default {
    post: jsonHandler(authHandler(async ({ tokenData, payload }) => {
        if (!tokenData) {
            throw badRequest('Нужно авторизоваться')
        }
        return await todoService.createTodo(tokenData.id, payload as CreatingTodo)
    })),
    put: jsonHandler(authHandler(async ({ tokenData, payload }) => {
        if (!tokenData) {
            throw badRequest('Нужно авторизоваться')
        }
        return await todoService.updateTodo(tokenData.id, payload as Todo)
    })),
    delete: jsonHandler(authHandler(async ({ tokenData, params }) => {
        if (!tokenData) {
            throw badRequest('Нужно авторизоваться')
        }
        return await todoService.deleteTodo(tokenData.id, +params.id)
    })),
} as Endpoint
