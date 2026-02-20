import pandas as pd
from typing import List, Dict

def detect_smurfing(df: pd.DataFrame, window_hours: int = 72, count_threshold: int = 10) -> List[Dict]:
    """
    Detects Smurfing (Fan-in / Fan-out) using sliding temporal windows.
    Fan-in: Many senders -> 1 receiver.
    Fan-out: 1 sender -> Many receivers.
    """
    results = []
    
    # Ensure timestamp is datetime
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
    df = df.sort_values('timestamp')
    
    # --- Fan-in Detection (Receiver focus) ---
    receiver_counts = df.groupby('receiver_id')['sender_id'].nunique()
    sus_receivers = receiver_counts[receiver_counts >= count_threshold].index.tolist()
    
    for receiver in sus_receivers:
        receiver_df = df[df['receiver_id'] == receiver].sort_values('timestamp')
        
        # MERCHANT TRAP FIX: Mean Amount Check
        # Merchants receive large amounts (e.g. > 2000 per tx on average)
        # Smurfs aggregate small amounts (e.g. 200-300)
        mean_amount = receiver_df['amount'].mean()
        if mean_amount > 2000:
            continue
            
        times = receiver_df['timestamp'].values
        senders = receiver_df['sender_id'].values
        n = len(times)
        
        start = 0
        window_senders = {}
        distinct_count = 0
        window_td = pd.Timedelta(hours=window_hours)
        
        # We need to collect ALL nodes in the max density window, not just stop at threshold.
        # Strategy: Find the window with MAX unique senders. If max >= threshold, report it.
        # Or report the FIRST valid window but extend it?
        # Better: Greedy approach. Iterate windows. If we find a window > threshold, 
        # keep sliding 'end' until time limit to maximize membership? 
        # Standard sliding window finds specific windows. 
        # Let's find the window with Maximum unique count for the node? 
        # Or just report the first valid one but capture ALL in that window.
        
        # To avoid multiple reports for same node, we can just find the "Best" window or combine all?
        # Let's report the first valid window that meets criteria, but ensures we take ALL edges in that window.
        
        # Actually, simpler: sliding window max.
        # Since we just need to return "members", if there are disjoint windows, do we merge?
        # Usually smurfing happens in one burst.
        
        best_window_members = set()
        
        for end in range(n):
            s_end = senders[end]
            if s_end not in window_senders:
                window_senders[s_end] = 0
                distinct_count += 1
            window_senders[s_end] += 1
            
            while times[end] - times[start] > window_td:
                s_start = senders[start]
                window_senders[s_start] -= 1
                if window_senders[s_start] == 0:
                    del window_senders[s_start]
                    distinct_count -= 1
                start += 1
            
            if distinct_count >= count_threshold:
                # We found a valid window. 
                # Capture current members.
                current_members = set(window_senders.keys())
                if len(current_members) > len(best_window_members):
                    best_window_members = current_members
        
        if len(best_window_members) >= count_threshold:
            results.append({
                "type": "smurfing (fan-in)",
                "members": [receiver] + list(best_window_members),
                "metadata": {"central_node": receiver, "unique_peers": len(best_window_members)}
            })

                
    # --- Fan-out Detection (Sender focus) ---
    sender_counts = df.groupby('sender_id')['receiver_id'].nunique()
    sus_senders = sender_counts[sender_counts >= count_threshold].index.tolist()
    
    for sender in sus_senders:
        sender_df = df[df['sender_id'] == sender].sort_values('timestamp')
        
        # PAYROLL TRAP FIX: Variance Check
        # Payroll sends identical amounts (variance ~ 0).
        # Structuring/Smurfing usually has some variance (to avoid detection or split amounts).
        std_amount = sender_df['amount'].std()
        if pd.isna(std_amount) or std_amount < 1.0: # Close to zero variance
            continue

        times = sender_df['timestamp'].values
        receivers = sender_df['receiver_id'].values
        n = len(times)
        
        start = 0
        window_receivers = {}
        distinct_count = 0
        window_td = pd.Timedelta(hours=window_hours)
        
        best_window_members = set()

        for end in range(n):
            r_end = receivers[end]
            if r_end not in window_receivers:
                window_receivers[r_end] = 0
                distinct_count += 1
            window_receivers[r_end] += 1
            
            while times[end] - times[start] > window_td:
                r_start = receivers[start]
                window_receivers[r_start] -= 1
                if window_receivers[r_start] == 0:
                    del window_receivers[r_start]
                    distinct_count -= 1
                start += 1
            
            if distinct_count >= count_threshold:
                current_members = set(window_receivers.keys())
                if len(current_members) > len(best_window_members):
                    best_window_members = current_members

        if len(best_window_members) >= count_threshold:
            results.append({
                "type": "smurfing (fan-out)",
                "members": [sender] + list(best_window_members),
                "metadata": {"central_node": sender, "unique_peers": len(best_window_members)}
            })
 
    return results
