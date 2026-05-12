import streamlit as st
from streamlit_autorefresh import st_autorefresh
import state_manager
import time

st.set_page_config(page_title="Host Dashboard", layout="wide")
state_manager.init_db()

# Auto-refresh the host page every 2 seconds to catch updates from teams
st_autorefresh(interval=2000, key="host_refresh")

phase = state_manager.get_state("phase", "setup")
teams = state_manager.get_teams()

if phase == "setup":
    st.header("Game Setup")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        game_title = st.text_input("Game Title", "MATERIALES NATURALES")
        time_limit = st.number_input("Time to Answer (Seconds)", min_value=5, value=30)
        
        st.subheader("Categories")
        num_cats = st.number_input("Number of Categories", min_value=1, max_value=6, value=3)
        num_qs = st.number_input("Questions per Category", min_value=1, max_value=5, value=3)
        
        categories = []
        for i in range(num_cats):
            st.markdown(f"**Category {i+1}**")
            cat_name = st.text_input(f"Category {i+1} Name", f"Category {i+1}", key=f"cat_name_{i}")
            questions = []
            for j in range(num_qs):
                colA, colB = st.columns(2)
                q_text = colA.text_input(f"Q{j+1} Text", f"Question {j+1}", key=f"q_text_{i}_{j}")
                q_ans = colB.text_input(f"Q{j+1} Answer", f"Answer {j+1}", key=f"q_ans_{i}_{j}")
                questions.append({
                    "id": f"q_{i}_{j}",
                    "text": q_text,
                    "answer": q_ans,
                    "isAnswered": False
                })
            categories.append({
                "id": f"cat_{i}",
                "name": cat_name,
                "questions": questions
            })

    with col2:
        st.subheader("Connected Teams")
        if not teams:
            st.info("Waiting for teams to join...")
        for team in teams:
            st.markdown(f"🟢 **{team['name']}**")
            if st.button("Kick", key=f"kick_{team['id']}"):
                state_manager.remove_team(team['id'])
                st.rerun()
                
    if st.button("Start Game", type="primary"):
        config = {
            "gameTitle": game_title,
            "timeLimit": time_limit,
            "categories": categories
        }
        state_manager.set_state("config", config)
        state_manager.set_state("phase", "playing")
        state_manager.set_state("active_question", None)
        state_manager.set_state("stealable", False)
        state_manager.set_state("has_stolen", False)
        st.rerun()

elif phase == "playing":
    config = state_manager.get_state("config")
    active_question = state_manager.get_state("active_question")
    active_effects = state_manager.get_active_effects()
    
    st.title(config.get("gameTitle", "MATERIALES NATURALES"))
    
    if active_effects:
        for eff in active_effects:
            team_name = next((t["name"] for t in teams if t["id"] == eff["team_id"]), "Unknown Team")
            st.warning(f"⚡ {team_name} activated {eff['name'].replace('_', ' ').upper()}!")

    st.markdown("---")
    
    if active_question:
        # Show active question modal-like interface
        st.header(f"Question (Value: {active_question.get('value', 10)})")
        st.subheader(active_question.get("text", ""))
        
        with st.expander("Show Answer"):
            st.write(active_question.get("answer", "No answer provided"))
            
        st.markdown("### Award Points To (Correct Answer)")
        cols = st.columns(len(teams) + 1)
        for idx, team in enumerate(teams):
            if cols[idx].button(team['name'], key=f"award_{team['id']}"):
                state_manager.update_team_score(team['id'], team['score'] + active_question.get('value', 10))
                # Mark as answered
                cat_idx = active_question['catIndex']
                q_idx = active_question['qIndex']
                config['categories'][cat_idx]['questions'][q_idx]['isAnswered'] = True
                state_manager.set_state("config", config)
                state_manager.set_state("active_question", None)
                state_manager.clear_active_effects()
                st.rerun()
                
        if cols[-1].button("Nobody (Close)"):
            cat_idx = active_question['catIndex']
            q_idx = active_question['qIndex']
            config['categories'][cat_idx]['questions'][q_idx]['isAnswered'] = True
            state_manager.set_state("config", config)
            state_manager.set_state("active_question", None)
            state_manager.clear_active_effects()
            st.rerun()
            
        st.markdown("### Incorrect Answer (-5 Points)")
        icols = st.columns(len(teams))
        for idx, team in enumerate(teams):
            if icols[idx].button(team['name'], key=f"penalty_{team['id']}"):
                state_manager.update_team_score(team['id'], team['score'] - 5)
                st.rerun()
                
        st.markdown("---")
        if st.button("Enable Steal / Reset Values", type="primary"):
            aq = active_question
            aq['value'] = 10
            aq['doubleChance'] = False
            aq['clue'] = False
            state_manager.set_state("active_question", aq)
            state_manager.set_state("stealable", True)
            state_manager.clear_active_effects()
            st.rerun()

    else:
        # Show Board
        categories = config.get("categories", [])
        cols = st.columns(len(categories))
        
        for c_idx, cat in enumerate(categories):
            cols[c_idx].markdown(f"### {cat['name']}")
            for q_idx, q in enumerate(cat['questions']):
                if not q.get('isAnswered'):
                    if cols[c_idx].button(f"10", key=f"btn_{c_idx}_{q_idx}", use_container_width=True):
                        # Calculate value based on active effects
                        q_value = 10
                        has_shield = any(e['name'] == 'shield' for e in active_effects)
                        double_chance = False
                        clue = False
                        if not has_shield:
                            for eff in active_effects:
                                if eff['type'] == 'trap':
                                    if eff['name'] == 'half_points':
                                        q_value = 5
                        for eff in active_effects:
                            if eff['type'] == 'wildcard':
                                if eff['name'] == 'double_points':
                                    q_value *= 2
                                elif eff['name'] == 'double_chance':
                                    double_chance = True
                                elif eff['name'] == 'clue':
                                    clue = True
                                    
                        aq = {
                            "catIndex": c_idx,
                            "qIndex": q_idx,
                            "text": q['text'],
                            "answer": q['answer'],
                            "value": q_value,
                            "doubleChance": double_chance,
                            "clue": clue
                        }
                        state_manager.set_state("active_question", aq)
                        st.rerun()
                else:
                    cols[c_idx].button(f" ", key=f"btn_{c_idx}_{q_idx}", disabled=True, use_container_width=True)
                    
    # Show Scores
    st.markdown("---")
    st.header("Scores")
    scols = st.columns(len(teams))
    for idx, team in enumerate(teams):
        scols[idx].metric(team['name'], team['score'])
