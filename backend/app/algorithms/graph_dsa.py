import igraph
from typing import List, Set, Dict

def find_cycles_dfs(graph: igraph.Graph, min_len: int = 3, max_len: int = 5) -> List[Dict]:
    """
    Detects circular money flows (cycles) of length 3 to 5 using DFS.
    Returns a list of rings, where each ring is a list of vertex names.
    """
    cycles = []
    # Use a set of sorted tuples to avoid duplicate cycles (e.g., A-B-C vs B-C-A)
    seen_cycles = set()
    
    # We only care about nodes that have both in > 0 and out <= 100 (to avoid massive hubs)
    candidates = [v.index for v in graph.vs if 0 < v.degree(mode="out") <= 100 and v.degree(mode="in") > 0]

    
    for start_node_idx in candidates:
        stack = [(start_node_idx, [start_node_idx])] # (current_node, path)
        
        while stack:
            curr, path = stack.pop()
            
            if len(path) > max_len:
                continue
            
            # Get neighbors
            neighbors = graph.successors(curr)
            
            for neighbor in neighbors:
                if neighbor == start_node_idx:
                    # Cycle found!
                    if min_len <= len(path) <= max_len:
                        # Normalize cycle to check for duplicates
                        # A cycle is defined by its edges/nodes.
                        # (A, B, C) is same as (B, C, A).
                        # We use the canonical rotation (min element first).
                        
                        cycle_indices = tuple(path)
                        min_i = min(cycle_indices)
                        min_pos = cycle_indices.index(min_i)
                        canonical = cycle_indices[min_pos:] + cycle_indices[:min_pos]
                        
                        if canonical not in seen_cycles:
                            seen_cycles.add(canonical)
                            # Convert indices back to names
                            cycle_names = [graph.vs[i]["name"] for i in cycle_indices]
                            cycles.append({
                                "type": "cycle",
                                "members": cycle_names,
                                "metadata": {"length": len(path)}
                            })
                            
                elif neighbor not in path:
                    # Continue DFS
                    # Optimization: Only push if length < max_len
                    if len(path) < max_len:
                        stack.append((neighbor, path + [neighbor]))
                        
    return cycles

def detect_shells(graph: igraph.Graph, min_hops: int = 3) -> List[Dict]:
    """
    Detects layered shell networks.
    Chain of 3+ hops where intermediate nodes have low degree (2-3).
    Excludes nodes that are part of tight cycles (cliques).
    Includes the 'Head' (Source) and 'Tail' (Destination) of the chain.
    """
    shells = []
    
    # 1. Identify Shell Candidates (Pass-through nodes acting as layers)
    # Total degree 2 or 3, must have both in and out (flow-through)
    shell_candidates_indices = [
        v.index for v in graph.vs 
        if 2 <= v.degree() <= 3 
        and v.degree(mode="in") >= 1 
        and v.degree(mode="out") >= 1
    ]
    
    if len(shell_candidates_indices) < 2:
        return []

    # 2. Build Subgraph of Shell Candidates (The intermediate layers)
    shell_graph = graph.subgraph(shell_candidates_indices)
    
    # 3. Find Linear Components
    components = shell_graph.connected_components(mode="weak")
    
    for cluster in components:
        # cluster = indices in shell_graph
        if len(cluster) >= min_hops:
            # Map back to original indices
            original_indices = [shell_candidates_indices[i] for i in cluster]
            
            # Check topology linearity
            sub_g = graph.subgraph(original_indices)
            n_nodes = sub_g.vcount()
            n_edges = sub_g.ecount()
            
            # If strictly linear or near linear (allow small noise, e.g. < 1.2 edge ratio)
            if n_edges < n_nodes * 1.2:
                # Ordering the chain: Topological Sort on the subgraph
                # If it's truly a shell chain, it should be a DAG (Directed Acyclic Graph)
                try:
                    # topo_sort returns indices in sub_g (0 to N-1)
                    sorted_sub_indices = sub_g.topological_sorting()
                    # Map sub-graph indices -> original graph indices
                    sorted_original_indices = [original_indices[i] for i in sorted_sub_indices]
                except igraph.InternalError:
                    # Cycle detected in "linear" component -> fallback to just list or skip
                    # If it has a cycle, it's not a pure shell chain.
                    continue

                # Identify HEAD (Source feeding the chain) and TAIL (Destination receiving from chain)
                # Head: Predecessors of first shell node (not in shell)
                # Tail: Successors of last shell node (not in shell)
                
                chain_start_idx = sorted_original_indices[0]
                chain_end_idx = sorted_original_indices[-1]
                
                # Predecessors of start
                preds = graph.predecessors(chain_start_idx)
                # Successors of end
                succs = graph.successors(chain_end_idx)
                
                # Filter out those already in the shell
                heads = [p for p in preds if p not in original_indices]
                tails = [s for s in succs if s not in original_indices]
                
                # Construct Member List: Heads + Shells + Tails
                # Mapping indices to names
                
                head_names = [graph.vs[h]["name"] for h in heads]
                tail_names = [graph.vs[t]["name"] for t in tails]
                shell_names = [graph.vs[i]["name"] for i in sorted_original_indices]
                
                full_members = head_names + shell_names + tail_names
                
                # Deduplicate just in case? Usually logic ensures distinct sets.
                # If Head/Tail same (Cycle), handled by Cycle Detector.
                
                shells.append({
                    "type": "layered_shell",
                    "members": list(dict.fromkeys(full_members)), # Preserve order, dedupe
                    "metadata": {"size": len(full_members), "layers": len(shell_names)}
                })
            
    return shells
