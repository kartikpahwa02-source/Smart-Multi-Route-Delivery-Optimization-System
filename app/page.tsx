// "use client";

// import Simulator, { SimulatorHandle } from "@/components/simulator";
// import { useRef, useState } from "react";

// export default function Home() {
//   const simRef = useRef<SimulatorHandle | null>(null);

//   const [results, setResults] = useState<
//     { algo: string; path: string; cost: number }[]
//   >([]);

//   const best = results.length
//     ? results.reduce((min, r) => (r.cost < min.cost ? r : min))
//     : null;

//   return (
//     <div className="h-screen w-screen bg-blue-950 flex items-center justify-center">
//       <div className="bg-white h-[75%] w-[75%] relative rounded-3xl border-4">

//         {/* ✅ IMPORTANT: ref connected here */}
//         <Simulator
//           ref={simRef}
//           onSimulateResult={(res) => setResults(res)}
//         />

//         {/* TOOLBOX */}
//         <div className="absolute bottom-4 left-5 w-[75%] h-[15%]  bg-slate-900 opacity-69 rounded-2xl flex justify-center items-center gap-5">

//           <button onClick={() => simRef.current?.addStore()} className="px-4 py-2 bg-green-600 text-white rounded-lg">
//             Store
//           </button>

//           <button onClick={() => simRef.current?.addHouse()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
//             House
//           </button>

//           <button onClick={() => simRef.current?.enableRoadMode()} className="px-4 py-2 bg-yellow-600 text-white rounded-lg">
//             Road
//           </button>

//           <button onClick={() => simRef.current?.enableDestinationMode()} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
//             Destination
//           </button>

//           <button
//             onClick={() => simRef.current?.runAllAlgorithms()}
//             className="px-4 py-2 bg-red-600 text-white rounded-lg"
//           >
//             Simulate
//           </button>


//         </div>

//         {/* RESULTS */}
//         <div className="absolute right-4 top-4 h-[95%] w-[22%] bg-slate-900 opacity-69 rounded-2xl p-5 overflow-y-auto">
//           <h2 className="text-2xl font-bold text-center text-amber-400">
//             Results
//           </h2>

//           <div className="mt-4 space-y-3 text-white">

//             {best && (
//               <div className="bg-green-700 p-3 rounded-lg">
//                 <p className="font-bold">🏆 Best: {best.algo}</p>
//                 <p>Path: {best.path}</p>
//                 <p>Cost: {best.cost}</p>
//               </div>
//             )}

//             {results.map((r, i) => (
//               <div key={i} className="bg-slate-800 p-3 rounded-lg">
//                 <p className="text-yellow-400 font-bold">{r.algo}</p>
//                 <p>Path: {r.path}</p>
//                 <p>Cost: {r.cost}</p>
//               </div>
//             ))}

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }


"use client";

import Simulator, { SimulatorHandle } from "@/components/simulator";
import { useRef, useState } from "react";

export default function Home() {
  const simRef = useRef<SimulatorHandle | null>(null);

  const [results, setResults] = useState<
    { algo: string; cost: number | null; time: string; path: string }[]
  >([]);

  const validResults = results.filter(r => r.cost !== null);

  const best = validResults.length
    ? validResults.reduce((min, r) =>
      r.cost! < min.cost! ? r : min
    )
    : null;

  const others = best ? results.filter(r => r !== best) : results;

  return (
    <div className="h-screen w-screen bg-blue-950 flex items-center justify-center">
      <div className="bg-white h-[75%] w-[75%] relative rounded-3xl border-4">

        <Simulator ref={simRef} onSimulateResult={setResults} />

        {/* TOOLBOX */}
        <div className="absolute bottom-4 left-5 w-[75%] h-[15%] bg-slate-900 rounded-2xl flex gap-4 items-center justify-center">

          <button onClick={() => simRef.current?.addStore()} className="bg-green-600 px-4 py-2 text-white">Store</button>

          <button onClick={() => simRef.current?.addHouse()} className="bg-blue-600 px-4 py-2 text-white">House</button>

          <button onClick={() => simRef.current?.enableRoadMode()} className="bg-yellow-600 px-4 py-2 text-white">Road</button>

          <button onClick={() => simRef.current?.enableDestinationMode()} className="bg-purple-600 px-4 py-2 text-white">Destination</button>

          <button onClick={() => simRef.current?.runAllAlgorithms()} className="bg-red-600 px-4 py-2 text-white">Simulate</button>
        </div>

        {/* RESULTS */}
        <div className="absolute right-4 top-4 h-[95%] w-[22%] bg-slate-900 rounded-2xl p-5 overflow-y-auto text-white">
          <h2 className="text-xl font-bold text-yellow-400">Results</h2>

          <div className="mt-4 space-y-3 text-white">

            {/* 🟢 BEST ONLY */}
            {/* BEST */}
            {best && (
              <div className="bg-green-700 p-3 rounded-lg">
                <p>🏆 Best: {best.algo}</p>
                <p>Path: {best.path}</p>
                <p>Cost: {best.cost}</p>
              </div>
            )}

            {/* OTHER PATHS */}
            {others.map((r, i) => (
              <div key={i} className="bg-slate-800 p-3 rounded-lg">
                <p className="text-yellow-400 font-bold">{r.algo}</p>

                {r.path && <p>Path: {r.path}</p>}

                {r.cost !== null && <p>Cost: {r.cost}</p>}
                {r.time !== "-" && <p>Time: {r.time} ms</p>}
              </div>
            ))}
          </div>


        </div>

      </div>
    </div >
  );
}