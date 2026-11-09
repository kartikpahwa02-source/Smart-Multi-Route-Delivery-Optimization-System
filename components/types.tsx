export type NodeType = "STORE" | "HOUSE";

export interface Node { 
  id: number; 
  label: string; 
  x: number; 
  y: number; 
  type: NodeType;
}

export interface Edge { 
  from: number; 
  to: number; 
  weight: number; 
  traffic: boolean; 
  damaged: boolean; 
}
