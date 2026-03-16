import { exercises } from "../data/exercises"

export function generateWorkout(goal, duration) {

    const pool = exercises[goal] || exercises.strength

    const count = Math.max(3, Math.floor(duration / 5))

    const shuffled = [...pool].sort(() => Math.random() - 0.5)

    return shuffled.slice(0, count)

}