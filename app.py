import streamlit as st
import state_manager

st.set_page_config(page_title="Materiales Naturales", page_icon="🎮", layout="wide")

state_manager.init_db()

st.title("MATERIALES NATURALES")
st.write("Select your role from the sidebar to continue.")

st.markdown("""
### Available Roles:
- **Host Dashboard**: For the Game Master to control the board and setup the game.
- **Team Buzzer**: For teams to join the game, use wildcards/traps, and buzz in.
""")

if st.button("Reset Game State (Danger)"):
    state_manager.reset_game()
    st.success("Game state has been reset.")
