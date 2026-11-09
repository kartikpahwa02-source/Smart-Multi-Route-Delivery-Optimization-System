// "use client";

// import { useState, forwardRef, useImperativeHandle } from "react";
// import { Node, Edge } from "./types";
// import Image from "next/image";

// export interface SimulatorHandle {
//     addStore: () => void;
//     addHouse: () => void;
//     enableRoadMode: () => void;
//     enableDestinationMode: () => void;
//     runAllAlgorithms: () => void;
// }

// interface SimulatorProps {
//     onSimulateResult?: (results: {
//         algo: string;
//         path: string;
//         cost: number;
//     }[]) => void;
// }

// const Simulator = forwardRef<SimulatorHandle, SimulatorProps>(
//     ({ onSimulateResult }, ref) => {

//         const [selectDestination, setSelectDestination] = useState(false);
//         const [roadMode, setRoadMode] = useState(false);
//         const [nodes, setNodes] = useState<Node[]>([]);
//         const [edges, setEdges] = useState<Edge[]>([]);
//         const [selectedNode, setSelectedNode] = useState<number | null>(null);

//         const [destinations, setDestinations] = useState<number[]>([]);
//         const [bestPath, setBestPath] = useState<number[]>([]);
//         const [placementMode, setPlacementMode] =
//             useState<"STORE" | "HOUSE" | null>(null);

//         const [algorithm, setAlgorithm] = useState<"GREEDY" | "DP">("GREEDY");

//         // ---------------- DIJKSTRA ----------------
//         const dijkstraFrom = (src: number) => {
//             const n = nodes.length;
//             const dist = Array(n).fill(Infinity);
//             dist[src] = 0;

//             const visited = Array(n).fill(false);

//             for (let i = 0; i < n; i++) {
//                 let u = -1, min = Infinity;

//                 for (let j = 0; j < n; j++) {
//                     if (!visited[j] && dist[j] < min) {
//                         min = dist[j];
//                         u = j;
//                     }
//                 }

//                 if (u === -1) break;
//                 visited[u] = true;

//                 edges.forEach(e => {
//                     if (e.from === u && dist[u] + e.weight < dist[e.to]) {
//                         dist[e.to] = dist[u] + e.weight;
//                     }
//                 });
//             }

//             return dist;
//         };

//         // ---------------- GREEDY ----------------
//         const greedyTSP = () => {
//             let current = 0;
//             let unvisited = [...destinations];
//             let path = [0];
//             let totalCost = 0;

//             while (unvisited.length) {
//                 const dist = dijkstraFrom(current);

//                 let next = unvisited[0];
//                 let best = dist[next];

//                 for (const d of unvisited) {
//                     if (dist[d] < best) {
//                         best = dist[d];
//                         next = d;
//                     }
//                 }

//                 totalCost += best;
//                 path.push(next);
//                 current = next;
//                 unvisited = unvisited.filter(x => x !== next);
//             }

//             return { path, cost: totalCost };
//         };

//         // ---------------- DP ----------------
//         const dpTSP = () => {
//             const n = nodes.length;
//             const distMatrix = Array.from({ length: n }, () =>
//                 Array(n).fill(Infinity)
//             );

//             for (let i = 0; i < n; i++) {
//                 distMatrix[i] = dijkstraFrom(i);
//             }

//             const m = destinations.length;
//             const FULL = 1 << m;

//             const dp = Array.from({ length: FULL }, () =>
//                 Array(m).fill(Infinity)
//             );

//             const parent: any = Array.from({ length: FULL }, () =>
//                 Array(m).fill(-1)
//             );

//             for (let i = 0; i < m; i++) {
//                 dp[1 << i][i] = distMatrix[0][destinations[i]];
//             }

//             for (let mask = 0; mask < FULL; mask++) {
//                 for (let u = 0; u < m; u++) {
//                     if (!(mask & (1 << u))) continue;

//                     for (let v = 0; v < m; v++) {
//                         if (mask & (1 << v)) continue;

//                         const nextMask = mask | (1 << v);
//                         const cost = dp[mask][u] +
//                             distMatrix[destinations[u]][destinations[v]];

//                         if (cost < dp[nextMask][v]) {
//                             dp[nextMask][v] = cost;
//                             parent[nextMask][v] = u;
//                         }
//                     }
//                 }
//             }

//             let minCost = Infinity;
//             let last = -1;

//             for (let i = 0; i < m; i++) {
//                 if (dp[FULL - 1][i] < minCost) {
//                     minCost = dp[FULL - 1][i];
//                     last = i;
//                 }
//             }

//             let mask = FULL - 1;
//             let order: number[] = [];

//             while (last !== -1) {
//                 order.push(destinations[last]);
//                 const temp = parent[mask][last];
//                 mask ^= (1 << last);
//                 last = temp;
//             }

//             order.reverse();

//             return {
//                 path: [0, ...order],
//                 cost: minCost
//             };
//         };

//         // ---------------- RUN ----------------
//         const runAllAlgorithms = () => {
//             if (destinations.length === 0) {
//                 alert("Select destinations");
//                 return;
//             }

//             const greedy = greedyTSP();
//             const dp = dpTSP();

//             const chosen = algorithm === "GREEDY" ? greedy : dp;

//             setBestPath(chosen.path);

//             const results = [
//                 {
//                     algo: "GREEDY",
//                     cost: greedy.cost,
//                     path: greedy.path.map(i => nodes[i].label).join(" → ")
//                 },
//                 {
//                     algo: "DP_TSP",
//                     cost: dp.cost,
//                     path: dp.path.map(i => nodes[i].label).join(" → ")
//                 }
//             ];

//             onSimulateResult?.(results);
//         };

//         // ---------------- EDGE ----------------
//         const createEdge = (from: number, to: number) => {
//             if (edges.some(e => e.from === from && e.to === to)) return;

//             const type = prompt("normal / traffic / damaged");
//             const dist = Number(prompt("Distance"));

//             let weight = dist;
//             let traffic = false;
//             let damaged = false;

//             if (type === "traffic") {
//                 weight *= 2;
//                 traffic = true;
//             }

//             if (type === "damaged") {
//                 weight = Infinity;
//                 damaged = true;
//             }

//             setEdges(prev => [
//                 ...prev,
//                 { from, to, weight, traffic, damaged },
//                 { from: to, to: from, weight, traffic, damaged }
//             ]);
//         };

//         const handleNodeClick = (id: number) => {
//             if (selectDestination) {
//                 setDestinations(prev =>
//                     prev.includes(id)
//                         ? prev.filter(x => x !== id)
//                         : [...prev, id]
//                 );
//                 return;
//             }

//             if (!roadMode) return;

//             if (selectedNode === null) setSelectedNode(id);
//             else {
//                 createEdge(selectedNode, id);
//                 setSelectedNode(null);
//                 setRoadMode(false);
//             }
//         };

//         const isInBestPath = (from: number, to: number) => {
//             for (let i = 0; i < bestPath.length - 1; i++) {
//                 const a = bestPath[i];
//                 const b = bestPath[i + 1];

//                 // check both directions AND match edge
//                 if (
//                     (from === a && to === b) ||
//                     (from === b && to === a)
//                 ) {
//                     return true;
//                 }
//             }
//             return false;
//         };

//         const bestEdgeSet = new Set<string>();

//         for (let i = 0; i < bestPath.length - 1; i++) {
//             const a = bestPath[i];
//             const b = bestPath[i + 1];

//             bestEdgeSet.add(`${a}-${b}`);
//             bestEdgeSet.add(`${b}-${a}`); // both directions
//         }

//         useImperativeHandle(ref, () => ({
//             addStore: () => setPlacementMode("STORE"),
//             addHouse: () => setPlacementMode("HOUSE"),
//             enableRoadMode: () => setRoadMode(true),
//             enableDestinationMode: () => setSelectDestination(true),
//             runAllAlgorithms,
//         }));

//         return (
//             <div
//                 className="w-full h-full relative rounded-2xl overflow-hidden bg-no-repeat bg-center bg-cover"
//                 style={{ backgroundImage: 'url("/map.png")' }}
//             >

//                 {/* TOGGLE */}
//                 <div className="absolute top-4 left-4 bg-white p-1 rounded-lg shadow flex gap-1 z-10">
//                     <button
//                         onClick={() => setAlgorithm("GREEDY")}
//                         className={`px-3 py-1 rounded-md text-sm font-semibold
//         ${algorithm === "GREEDY"
//                                 ? "bg-green-500 text-white"
//                                 : "bg-gray-200 text-gray-600"}`}
//                     >
//                         Greedy
//                     </button>

//                     <button
//                         onClick={() => setAlgorithm("DP")}
//                         className={`px-3 py-1 rounded-md text-sm font-semibold
//         ${algorithm === "DP"
//                                 ? "bg-purple-500 text-white"
//                                 : "bg-gray-200 text-gray-600"}`}
//                     >
//                         DP
//                     </button>
//                 </div>

//                 {/* CANVAS */}
//                 <div
//                     className="w-full h-full"
//                     onClick={(e) => {
//                         if (!placementMode) return;

//                         const rect = e.currentTarget.getBoundingClientRect();
//                         const x = e.clientX - rect.left - 20;
//                         const y = e.clientY - rect.top - 20;

//                         if (placementMode === "STORE") {
//                             if (nodes.some(n => n.type === "STORE")) return;
//                             setNodes([...nodes, { id: 0, label: "S", x, y, type: "STORE" }]);
//                         }

//                         if (placementMode === "HOUSE") {
//                             const id = nodes.length;
//                             setNodes([...nodes, {
//                                 id,
//                                 label: String.fromCharCode(65 + id - 1),
//                                 x, y,
//                                 type: "HOUSE"
//                             }]);
//                         }

//                         setPlacementMode(null);
//                     }}
//                 >

//                     {/* SVG ROADS */}
//                     <svg className="absolute inset-0 w-full h-full pointer-events-none">
//                         {edges.map((e, i) => {
//                             const a = nodes.find(n => n.id === e.from);
//                             const b = nodes.find(n => n.id === e.to);
//                             if (!a || !b) return null;

//                             const x1 = a.x + 20;
//                             const y1 = a.y + 20;
//                             const x2 = b.x + 20;
//                             const y2 = b.y + 20;

//                             const mx = (x1 + x2) / 2;
//                             const my = (y1 + y2) / 2;

//                             const dx = x2 - x1;
//                             const dy = y2 - y1;

//                             const length = Math.sqrt(dx * dx + dy * dy) || 1;

//                             // perpendicular direction
//                             const nx = -dy / length;
//                             const ny = dx / length;

//                             // alternate side (so labels don’t overlap)
//                             const direction = i % 2 === 0 ? 1 : -1;

//                             const offset = 20;

//                             // final label position
//                             const lx = mx + nx * offset * direction;
//                             const ly = my + ny * offset * direction;

//                             // angle fix (no upside down text)
//                             let angle: number = Math.atan2(dy, dx) * 180 / Math.PI;

//                             // fix upside-down text
//                             if (angle > 90 || angle < -90) {
//                                 angle += 180;
//                             }

//                             const curve = 40;

//                             const path = `
//       M ${x1} ${y1}
//       Q ${mx + curve} ${my - curve}
//       ${x2} ${y2}
//     `;

//                             const isBest = bestEdgeSet.has(`${e.from}-${e.to}`);

//                             // ROAD COLOR
//                             const roadColor = e.damaged
//                                 ? "#888"
//                                 : e.traffic
//                                     ? "#facc15"
//                                     : "#22c55e";

//                             return (
//                                 <g key={i}>

//                                     {/* OUTER BORDER */}
//                                     <path
//                                         d={path}
//                                         stroke={isBest ? "red" : "#222"}
//                                         strokeWidth={12}
//                                         fill="none"
//                                     />

//                                     {/* INNER FILL */}
//                                     <path
//                                         d={path}
//                                         stroke={roadColor}
//                                         strokeWidth={8}
//                                         fill="none"
//                                     />

//                                     {/* TRAFFIC CENTER LINE */}
//                                     {e.traffic && (
//                                         <path
//                                             d={path}
//                                             stroke="#fff"
//                                             strokeWidth={2}
//                                             strokeDasharray="6 6"
//                                             fill="none"
//                                         />
//                                     )}

//                                     {/* DAMAGED BLOCK */}
//                                     {e.damaged && (
//                                         <>
//                                             <path
//                                                 d={path}
//                                                 stroke="red"
//                                                 strokeWidth={4}
//                                                 strokeDasharray="10 6"
//                                                 fill="none"
//                                             />
//                                             <text
//                                                 x={mx}
//                                                 y={my}
//                                                 fontSize="16"
//                                                 textAnchor="middle"
//                                             >
//                                                 🚫
//                                             </text>
//                                         </>
//                                     )}

//                                     {/* DISTANCE LABEL */}
//                                     <g transform={`rotate(${angle}, ${lx}, ${ly})`}>
//                                         <rect
//                                             x={lx - 18}
//                                             y={ly - 10}
//                                             width="36"
//                                             height="14"
//                                             rx="4"
//                                             fill="white"
//                                             opacity="0.9"
//                                         />
//                                         <text
//                                             x={lx}
//                                             y={ly}
//                                             fontSize="11"
//                                             textAnchor="middle"
//                                             alignmentBaseline="middle"
//                                             fill="#333"
//                                         >
//                                             {e.weight === Infinity ? "X" : `${e.weight} km`}
//                                         </text>
//                                     </g>

//                                 </g>
//                             );
//                         })}
//                     </svg>

//                     {/* NODES */}
//                     {nodes.map(n => (
//                         <div
//                             key={n.id}
//                             onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleNodeClick(n.id);
//                             }}
//                             className="absolute z-10 cursor-pointer"
//                             style={{
//                                 left: n.x,
//                                 top: n.y,
//                                 border: destinations.includes(n.id)
//                                     ? "3px solid red"
//                                     : "none",
//                                 borderRadius: "10px"
//                             }}
//                         >
//                             <img
//                                 src={n.type === "STORE" ? "/store.png" : "/house.png"}
//                                 alt=""
//                                 width={40}
//                                 height={40}
//                             />

//                             <div className="text-xs text-center text-black mt-1">
//                                 {n.label}
//                             </div>
//                         </div>
//                     ))}

//                 </div>
//             </div>
//         );
//     });

// export default Simulator;


"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Node, Edge } from "./types";

export interface SimulatorHandle {
    addStore: () => void;
    addHouse: () => void;
    enableRoadMode: () => void;
    enableDestinationMode: () => void;
    runAllAlgorithms: () => void;
}

interface SimulatorProps {
    onSimulateResult?: (results: any[]) => void;
}

const Simulator = forwardRef<SimulatorHandle, SimulatorProps>(
    ({ onSimulateResult }, ref) => {

        const [nodes, setNodes] = useState<Node[]>([]);
        const [edges, setEdges] = useState<Edge[]>([]);
        const [destinations, setDestinations] = useState<number[]>([]);
        const [bestPath, setBestPath] = useState<number[]>([]);
        const [times, setTimes] = useState<any[]>([]);
        const [vehiclePos, setVehiclePos] = useState<{ x: number, y: number } | null>(null);

        // ---------------- RANDOM POSITION ----------------
        const randomPos = () => ({
            x: Math.random() * 600 + 50,
            y: Math.random() * 400 + 50,
        });

        // ---------------- DIJKSTRA ----------------
        const dijkstraFrom = (src: number) => {
            const n = nodes.length;
            const dist = Array(n).fill(Infinity);
            const visited = Array(n).fill(false);
            dist[src] = 0;

            for (let i = 0; i < n; i++) {
                let u = -1;
                for (let j = 0; j < n; j++) {
                    if (!visited[j] && (u === -1 || dist[j] < dist[u])) u = j;
                }
                if (dist[u] === Infinity) break;

                visited[u] = true;

                edges.forEach(e => {
                    if (e.from === u && dist[u] + e.weight < dist[e.to]) {
                        dist[e.to] = dist[u] + e.weight;
                    }
                });
            }
            return dist;
        };

        // ---------------- BELLMAN ----------------
        const bellmanFord = (src: number) => {
            const n = nodes.length;
            const dist = Array(n).fill(Infinity);
            dist[src] = 0;

            for (let i = 0; i < n - 1; i++) {
                edges.forEach(e => {
                    if (dist[e.from] + e.weight < dist[e.to]) {
                        dist[e.to] = dist[e.from] + e.weight;
                    }
                });
            }
            return dist;
        };

        // ---------------- FLOYD ----------------
        const floydWarshall = () => {
            const n = nodes.length;
            const dist = Array.from({ length: n }, () =>
                Array(n).fill(Infinity)
            );

            for (let i = 0; i < n; i++) dist[i][i] = 0;

            edges.forEach(e => {
                dist[e.from][e.to] = Math.min(dist[e.from][e.to], e.weight);
            });

            for (let k = 0; k < n; k++) {
                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < n; j++) {
                        if (dist[i][k] + dist[k][j] < dist[i][j]) {
                            dist[i][j] = dist[i][k] + dist[k][j];
                        }
                    }
                }
            }

            return dist;
        };

        const bfsPaths = () => {
            const start = 0;
            const paths: number[][] = [];

            const queue: number[][] = [[start]];

            while (queue.length) {
                const path = queue.shift()!;
                const last = path[path.length - 1];

                if (destinations.includes(last) && path.length > 1) {
                    paths.push(path);
                }

                edges.forEach(e => {
                    if (e.from === last && !path.includes(e.to)) {
                        queue.push([...path, e.to]);
                    }
                });
            }

            return paths;
        };

        const dfsPaths = () => {
            const start = 0;
            const paths: number[][] = [];

            const dfs = (node: number, path: number[]) => {
                if (destinations.includes(node) && path.length > 1) {
                    paths.push([...path]);
                }

                edges.forEach(e => {
                    if (e.from === node && !path.includes(e.to)) {
                        dfs(e.to, [...path, e.to]);
                    }
                });
            };

            dfs(start, [start]);
            return paths;
        };

        // ---------------- GREEDY ----------------
        const greedyTSP = (method: "DIJKSTRA" | "BELLMAN") => {
            let current = 0;
            let unvisited = [...destinations];
            let path = [0];
            let totalCost = 0;

            while (unvisited.length) {
                const dist =
                    method === "BELLMAN"
                        ? bellmanFord(current)
                        : dijkstraFrom(current);

                let next = unvisited[0];
                let best = dist[next];

                for (const d of unvisited) {
                    if (dist[d] < best) {
                        best = dist[d];
                        next = d;
                    }
                }

                totalCost += best;
                path.push(next);
                current = next;
                unvisited = unvisited.filter(x => x !== next);
            }

            return { path, cost: totalCost };
        };

        // ---------------- DP ----------------
        const dpTSP = (distMatrix: number[][]) => {
            const m = destinations.length;
            const FULL = 1 << m;

            const dp = Array.from({ length: FULL }, () =>
                Array(m).fill(Infinity)
            );

            for (let i = 0; i < m; i++) {
                dp[1 << i][i] = distMatrix[0][destinations[i]];
            }

            for (let mask = 0; mask < FULL; mask++) {
                for (let u = 0; u < m; u++) {
                    if (!(mask & (1 << u))) continue;

                    for (let v = 0; v < m; v++) {
                        if (mask & (1 << v)) continue;

                        const nextMask = mask | (1 << v);
                        const cost =
                            dp[mask][u] +
                            distMatrix[destinations[u]][destinations[v]];

                        if (cost < dp[nextMask][v]) {
                            dp[nextMask][v] = cost;
                        }
                    }
                }
            }

            let minCost = Infinity;
            for (let i = 0; i < m; i++) {
                minCost = Math.min(minCost, dp[FULL - 1][i]);
            }

            return { cost: minCost };
        };

        // ---------------- MEASURE ----------------
        const measure = (fn: any) => {
            const start = performance.now();
            const res = fn();
            const end = performance.now();
            return { res, time: (end - start).toFixed(2) };
        };

        const formatPath = (path: number[]) => {
            if (!path || path.length === 0) return "No path";
            return path.map(i => nodes[i]?.label ?? "?").join(" → ");
        };

        const animatePath = (path: number[]) => {
            if (!path || path.length < 2) return;

            let i = 0;

            const moveSegment = () => {
                if (i >= path.length - 1) return;

                const from = nodes[path[i]];
                const to = nodes[path[i + 1]];

                let t = 0;

                const interval = setInterval(() => {
                    t += 0.04;

                    const x = from.x + (to.x - from.x) * t;
                    const y = from.y + (to.y - from.y) * t;

                    setVehiclePos({ x, y });

                    if (t >= 1) {
                        clearInterval(interval);
                        i++;
                        moveSegment();
                    }
                }, 30);
            };

            moveSegment();
        };

        // ---------------- RUN ----------------
        const runAllAlgorithms = () => {
            if (!destinations.length) return alert("Select destinations");

            const floyd = floydWarshall();

            const g = measure(() => greedyTSP("DIJKSTRA"));
            const b = measure(() => greedyTSP("BELLMAN"));
            const d = measure(() => dpTSP(floyd));
            const dj = measure(() => greedyTSP("DIJKSTRA"));
            const f = measure(() => dpTSP(floyd));

            // ✅ BEST PATH
            setBestPath(g.res.path);

            // ✅ START ANIMATION
            animatePath(g.res.path);

            const bfs = bfsPaths();
            const dfs = dfsPaths();

            const pathResults = [
                ...bfs.map(p => ({
                    algo: "BFS Path",
                    cost: null,
                    time: "-",
                    path: formatPath(p),
                })),
                ...dfs.map(p => ({
                    algo: "DFS Path",
                    cost: null,
                    time: "-",
                    path: formatPath(p),
                })),
            ];

            const mainResults = [
                {
                    algo: "GREEDY",
                    cost: g.res.cost,
                    time: g.time,
                    path: formatPath(g.res.path),
                },
                {
                    algo: "BELLMAN",
                    cost: b.res.cost,
                    time: b.time,
                    path: formatPath(b.res.path),
                },
                {
                    algo: "DP",
                    cost: d.res.cost,
                    time: d.time,
                    path: "",
                },
                {
                    algo: "DIJKSTRA",
                    cost: dj.res.cost,
                    time: dj.time,
                    path: formatPath(dj.res.path),
                },
                {
                    algo: "FLOYD",
                    cost: f.res.cost,
                    time: f.time,
                    path: "",
                },
            ];

            setTimes(mainResults); // ✅ ONLY main algos in black box
            onSimulateResult?.([...mainResults, ...pathResults]); // ✅ full list in right panel


        };

        // ---------------- ROAD INPUT ----------------
        const createEdgePrompt = () => {
            const fromLabel = prompt("Enter Point 1 (S/A/B...)");
            if (!fromLabel) return;

            const from = nodes.find(n => n.label === fromLabel.toUpperCase());
            if (!from) return alert("Invalid Point 1");

            const toLabel = prompt("Enter Point 2");
            if (!toLabel) return;

            const to = nodes.find(n => n.label === toLabel.toUpperCase());
            if (!to) return alert("Invalid Point 2");

            const dist = Number(prompt("Enter Distance"));
            if (isNaN(dist)) return alert("Invalid distance");

            const type = prompt("normal / traffic / damaged");

            let weight = dist;
            let traffic = false;
            let damaged = false;

            if (type === "traffic") {
                weight *= 2;
                traffic = true;
            }

            if (type === "damaged") {
                weight = Infinity;
                damaged = true;
            }

            setEdges(prev => [
                ...prev,
                { from: from.id, to: to.id, weight, traffic, damaged },
                { from: to.id, to: from.id, weight, traffic, damaged },
            ]);
        };

        // ---------------- EDGE PROMPT ----------------
        const createEdge = (from: number, to: number) => {
            const type = prompt("normal / traffic / damaged");
            const dist = Number(prompt("Distance"));

            let weight = dist;
            let traffic = false;
            let damaged = false;

            if (type === "traffic") {
                weight *= 2;
                traffic = true;
            }

            if (type === "damaged") {
                weight = Infinity;
                damaged = true;
            }

            setEdges(prev => [
                ...prev,
                { from, to, weight, traffic, damaged },
                { from: to, to: from, weight, traffic, damaged }
            ]);
        };

        // ---------------- IMPERATIVE ----------------
        useImperativeHandle(ref, () => ({
            addStore: () => {
                if (nodes.some(n => n.type === "STORE")) return;
                const { x, y } = randomPos();
                setNodes([...nodes, { id: 0, label: "S", x, y, type: "STORE" }]);
            },

            addHouse: () => {
                const id = nodes.length;
                const { x, y } = randomPos();

                setNodes([
                    ...nodes,
                    {
                        id,
                        label: String.fromCharCode(65 + id - 1),
                        x,
                        y,
                        type: "HOUSE",
                    },
                ]);
            },

            enableRoadMode: () => {

                // STEP 1
                const fromLabel = prompt("Enter Point 1 (S for Store, A/B/C for houses)");

                if (!fromLabel) return;

                const fromNode = nodes.find(n => n.label === fromLabel.toUpperCase());

                if (!fromNode) {
                    alert("Invalid Point 1");
                    return;
                }

                // STEP 2
                const toLabel = prompt("Enter Point 2");

                if (!toLabel) return;

                const toNode = nodes.find(n => n.label === toLabel.toUpperCase());

                if (!toNode) {
                    alert("Invalid Point 2");
                    return;
                }

                // STEP 3
                const distInput = prompt("Enter Distance");

                if (!distInput) return;

                const dist = Number(distInput);

                if (isNaN(dist)) {
                    alert("Invalid distance");
                    return;
                }

                // STEP 4
                const type = prompt("Enter Road Type: normal / traffic / damaged");

                let weight = dist;
                let traffic = false;
                let damaged = false;

                if (type === "traffic") {
                    weight = dist * 2;
                    traffic = true;
                }

                if (type === "damaged") {
                    weight = Infinity;
                    damaged = true;
                }

                // CREATE EDGE
                setEdges(prev => [
                    ...prev,
                    { from: fromNode.id, to: toNode.id, weight, traffic, damaged },
                    { from: toNode.id, to: fromNode.id, weight, traffic, damaged }
                ]);
            },

            enableDestinationMode: () => {
                const d = prompt("Enter destination node");
                const node = nodes.find(n => n.label === d);
                if (!node) return;
                setDestinations(prev => [...prev, node.id]);
            },

            runAllAlgorithms,
        }));

        // ---------------- RENDER ----------------
        return (
            <div className="w-full h-full relative bg-cover" style={{ backgroundImage: 'url("/map.png")' }}>

                {/* TIME BOX */}
                <div className="absolute top-4 left-4 bg-black text-white p-3 rounded z-20">
                    {times.map(t => (
                        <div key={t.algo}>
                            {t.algo}: {t.time} ms
                        </div>
                    ))}
                </div>

                {/* SVG ROADS */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {edges.map((e, i) => {
                        const a = nodes.find(n => n.id === e.from);
                        const b = nodes.find(n => n.id === e.to);
                        if (!a || !b) return null;

                        const isBest = bestPath.includes(e.from) && bestPath.includes(e.to);

                        const color = e.damaged
                            ? "#888"
                            : e.traffic
                                ? "#facc15"
                                : "#22c55e";

                        return (
                            <line
                                key={i}
                                x1={a.x + 20}
                                y1={a.y + 20}
                                x2={b.x + 20}
                                y2={b.y + 20}
                                stroke={isBest ? "red" : color}
                                strokeWidth={5}
                            />
                        );
                    })}
                </svg>

                {/* 🚚 VEHICLE (SEPARATE LAYER) */}
                {vehiclePos && (
                    <div
                        className="absolute z-20 text-xl pointer-events-none"
                        style={{
                            left: vehiclePos.x,
                            top: vehiclePos.y,
                            transform: "translate(-50%, -50%)",
                        }}
                    >
                        🚚
                    </div>
                )}

                {/* NODES */}
                {nodes.map(n => (
                    <div
                        key={n.id}
                        className="absolute z-10 flex flex-col items-center"
                        style={{ left: n.x, top: n.y }}
                    >
                        <img
                            src={n.type === "STORE" ? "/store.png" : "/house.png"}
                            width={40}
                            height={40}
                        />

                        {/* ✅ LABEL FIX */}
                        <div className="text-xs font-bold text-black bg-white px-1 rounded mt-1 shadow">
                            {n.label}
                        </div>
                    </div>
                ))}

            </div>
        );
    }
);

export default Simulator;
