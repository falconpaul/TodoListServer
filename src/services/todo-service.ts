import { db } from "./db-service"

export type Todo = {
    id: number,
    text: string,
    done: 0 | 1
}

export type CreatingTodo = Omit<Todo, 'id' | 'done'>

export const todoService = {
    getListByUser: async (userId: number) => {
        return await db.selectAll(
            `select id
                   ,text
                   ,done
               from todos
              where user_id = :userId`,
            { userId }
        )
    },
    createTodo: async (userId: number, todo: CreatingTodo) => {
        return await db.insert('todos', {
            user_id: userId,
            text: todo.text,
            done: 0
        })
    },
    updateTodo: async (userId: number, todo: Todo) => {
        await db.query(
            `update todos
                set text = :text
                   ,done = :done
              where id = :id
                and user_id = :userId`,
            { userId, ...todo }
        )
    },
    deleteTodo: async (userId: number, id: number) => {
        await db.query(
            `delete from todos
              where id = :id
                and user_id = :userId`,
            { userId, id }
        )
    },
    deleteAllByUser: async (userId: number) => {
        await db.query(
            `delete from todos
              where user_id = :userId`,
            { userId }
        )
    },
    deleteDoneByUser: async (userId: number) => {
        await db.query(
            `delete from todos
              where user_id = :userId
                and done = 1`,
            { userId }
        )
    }
}
