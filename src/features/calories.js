export function calculateCalories(minutes, weight = 75) {

    const MET = 8

    return Math.round(
        (MET * 3.5 * weight / 200) * minutes
    )

}