import { jsonHandler } from "@help/decorators"
import { userService } from "@services/user-service"

export default {
    post: jsonHandler(async ({ payload }) => {
        return await userService.getToken(payload.login as string, payload.password as string)
    })
} as Endpoint


