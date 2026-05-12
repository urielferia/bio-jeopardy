import streamlit as st
from streamlit_autorefresh import st_autorefresh
import state_manager
import uuid

st.set_page_config(page_title="Team Buzzer", layout="centered")
state_manager.init_db()

st_autorefresh(interval=2000, key="team_refresh")

if "team_id" not in st.session_state:
    st.title("Join Game")
    team_name = st.text_input("Team Name")
    color = st.color_picker("Team Color", "#22c55e")
    
    if st.button("Join"):
        if team_name:
            t_id = str(uuid.uuid4())
            state_manager.add_team(t_id, team_name, color)
            st.session_state.team_id = t_id
            st.rerun()
else:
    t_id = st.session_state.team_id
    teams = state_manager.get_teams()
    my_team = next((t for t in teams if t["id"] == t_id), None)
    
    if not my_team:
        st.warning("You have been kicked or the game reset.")
        if st.button("Rejoin"):
            del st.session_state.team_id
            st.rerun()
        st.stop()
        
    st.markdown(f"<h1 style='text-align: center; color: {my_team['color']}'>{my_team['name']}</h1>", unsafe_allow_html=True)
    st.markdown(f"<h3 style='text-align: center'>Score: {my_team['score']}</h3>", unsafe_allow_html=True)
    
    phase = state_manager.get_state("phase", "setup")
    
    if phase == "setup":
        st.info("Waiting for host to start the game...")
    else:
        active_question = state_manager.get_state("active_question")
        stealable = state_manager.get_state("stealable", False)
        
        if active_question:
            st.warning("Question is open! Look at the Host screen!")
            if stealable:
                st.markdown("<h2 style='text-align: center'>STEAL AVAILABLE!</h2>", unsafe_allow_html=True)
                # We can't really do real-time buzzer speed accurately in Streamlit,
                # but we'll show a big button anyway.
                if st.button("🔔 STEAL! 🔔", use_container_width=True, type="primary"):
                    st.success("Buzzed in! (Wait for host to see)")
            else:
                st.info("Waiting for answer / time to expire...")
        else:
            st.success("Board is open. Select a question or use an item.")
            
            # Inventory
            st.markdown("---")
            st.subheader("Inventory")
            
            active_effects = state_manager.get_active_effects()
            
            if len(active_effects) > 0:
                st.error("An item is already active this turn!")
            else:
                col1, col2 = st.columns(2)
                
                with col1:
                    st.markdown("**Wildcards**")
                    for w in my_team['wildcards']:
                        if st.button(f"Activate {w.replace('_', ' ').title()}", key=f"w_{w}"):
                            if state_manager.use_item(t_id, "wildcard", w):
                                st.success(f"Activated {w}!")
                                st.rerun()
                                
                with col2:
                    st.markdown("**Traps**")
                    for t in my_team['traps']:
                        if st.button(f"Activate {t.replace('_', ' ').title()}", key=f"t_{t}"):
                            if state_manager.use_item(t_id, "trap", t):
                                st.success(f"Activated {t}!")
                                st.rerun()
