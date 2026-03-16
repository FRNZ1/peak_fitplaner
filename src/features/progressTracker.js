export function saveWorkout(workout) {

    const history =
        JSON.parse(localStorage.getItem("history")) || []

    history.push(workout)

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    )

}

export function getHistory() {

    return JSON.parse(
        localStorage.getItem("history")
    ) || []

}