import { getHistory } from "../features/progressTracker"

export default function ProgressStats() {

    const history = getHistory()

    const totalWorkouts = history.length

    const totalCalories =
        history.reduce((a, b) => a + b.calories, 0)

    return (

        <div className="space-y-4">

            <h1 className="text-2xl font-bold">
                Progress
            </h1>

            <p>
                Workouts: {totalWorkouts}
            </p>

            <p>
                Calories burned: {totalCalories}
            </p>

        </div>

    )

}