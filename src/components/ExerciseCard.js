import { motion } from "framer-motion"

export default function ExerciseCard({ name }) {

    return (

        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl
border border-white/20"
        >

            {name}

        </motion.div>

    )

}