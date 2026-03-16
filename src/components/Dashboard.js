import { generateWorkout } from "../features/aiGenerator"

export default function Dashboard({ setWorkout, setView }) {

    function start() {

        const workout = generateWorkout("strength", 20)

        setWorkout(workout)

        setView("workout")

    }

    return (

        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Peak Fitplaner
            </h1>

            <button
                onClick={start}
                className="px-6 py-3 rounded-xl bg-orange-500 text-white"
            >

                AI Workout starten

            </button>

        </div>

    )

}