// import React from 'react';
// import { useNavigate } from 'react-router-dom'; 

// export default function NotFound() {
//     const navigate = useNavigate();
//     return (
//        <div className="min-h-screen text-black dark:text-white flex items-center justify-center">
//          <div className="flex flex-col items-center justify-center text-sm max-md:px-4">
//             <h1 className="text-8xl md:text-9xl font-bold text-core">404</h1>
//             <div className="h-1 w-16 rounded bg-core my-5 md:my-7"></div>
//             <p className="text-2xl md:text-3xl font-bold">Page Not Found</p>
//             <p className="text-sm md:text-base mt-4 text-gray-500 max-w-md text-center">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
//             <div className="flex items-center gap-4 mt-6">
//                 <a onClick={()=>{navigate('/')}} className="bg-core hover:opacity-90 px-7 py-2.5 text-black rounded-md active:scale-95 transition-all cursor-pointer">
//                     Return Home
//                 </a>
//                 <a
//                   href="https://gadgetvishwa.vercel.app"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="border border-core px-7 py-2.5 text-core rounded-md active:scale-95 transition-all hover:text-black hover:border-black hover:dark:text-white hover:dark:border-white cursor-pointer"
//                 >
//                   Contact Support
//                 </a>
//             </div>
//         </div>
//        </div>
//     );
// };

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center text-black dark:text-white">

      {/* Background Blobs */}

      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-80 h-80 rounded-full bg-core/20 blur-[120px] left-[-100px] top-[-80px]"
      />

      <motion.div
        animate={{
          x: [0, -60, 0],
          y: [0, 60, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-96 h-96 rounded-full bg-purple-500/20 blur-[150px] right-[-120px] bottom-[-120px]"
      />

      {/* Floating Particles */}

      {[...Array(20)].map((_, i) => (
        <motion.span
          key={i}
          initial={{
            opacity: 0,
            y: Math.random() * 600,
            x: Math.random() * window.innerWidth,
          }}
          animate={{
            y: -100,
            opacity: [0, 1, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 10 + Math.random() * 10,
            delay: Math.random() * 5,
          }}
          className="absolute w-2 h-2 rounded-full bg-core/40"
        />
      ))}

      {/* Content */}

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        {/* Animated 404 */}

        <motion.h1
          animate={{
            scale: [1, 1.03, 1],
            textShadow: [
              "0 0 10px rgba(255,120,0,.2)",
              "0 0 40px rgba(255,120,0,.8)",
              "0 0 10px rgba(255,120,0,.2)",
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
          }}
          className="text-[120px] md:text-[180px] font-black text-core leading-none"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.4 }}
          className="h-1 bg-core rounded-full mx-auto my-6"
        />

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-3xl md:text-5xl font-bold"
        >
          Oops! Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-5 max-w-lg mx-auto text-gray-500"
        >
          The page you are looking for might have been removed, renamed,
          or is temporarily unavailable.
        </motion.p>

        {/* Buttons */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mt-10"
        >
          <motion.button
            whileHover={{
              scale: 1.08,
              boxShadow: "0 15px 40px rgba(255,120,0,.4)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="bg-core text-black px-8 py-3 rounded-lg font-semibold"
          >
            Return Home
          </motion.button>

          <motion.a
            whileHover={{
              scale: 1.08,
            }}
            whileTap={{ scale: 0.95 }}
            href="https://gadgetvishwa.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-core text-core px-8 py-3 rounded-lg font-semibold hover:bg-core hover:text-black transition"
          >
          Contact Support
          </motion.a>
        </motion.div>

        {/* Floating Emoji */}

        
      </motion.div>
    </div>
  );
}