import { useState } from "react"

export default function useLocalStorage(key, initial) {

    const [value, setValue] = useState(() => {

        const stored = localStorage.getItem(key)

        return stored
            ? JSON.parse(stored)
            : initial

    })

    function update(v) {

        setValue(v)

        localStorage.setItem(
            key,
            JSON.stringify(v)
        )

    }

    return [value, update]

}