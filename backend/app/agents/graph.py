"""
LangGraph Multi-Agent Orchestration Engine
Constructs the state graph connecting:
Profile Analyzer -> Macro Optimizer -> Recipe Generator -> Constraint Verifier
with feedback and conditional retry loops.
"""

from typing import Literal, Dict, Any
from langgraph.graph import StateGraph, START, END

from app.agents.state import AgentState
from app.agents.profile_analyzer import profile_analyzer_node
from app.agents.macro_optimizer import macro_optimizer_node
from app.agents.recipe_generator import recipe_generator_node
from app.agents.constraint_verifier import constraint_verifier_node

def should_retry(state: AgentState) -> Literal["recipe_generator", "__end__"]:
    """
    Conditional routing edge function.
    If constraint verification fails and retry count is below threshold,
    loops back to recipe_generator for corrective adjustment.
    """
    is_valid = state.get("is_valid", False)
    retry_count = state.get("retry_count", 0)
    max_retries = state.get("max_retries", 3)
    
    if is_valid or retry_count >= max_retries:
        return "__end__"
    else:
        return "recipe_generator"

def build_nutrition_agent_graph():
    """
    Builds and compiles the LangGraph StateGraph.
    """
    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("profile_analyzer", profile_analyzer_node)
    workflow.add_node("macro_optimizer", macro_optimizer_node)
    workflow.add_node("recipe_generator", recipe_generator_node)
    workflow.add_node("constraint_verifier", constraint_verifier_node)
    
    # Connect Sequential Edges
    workflow.add_edge(START, "profile_analyzer")
    workflow.add_edge("profile_analyzer", "macro_optimizer")
    workflow.add_edge("macro_optimizer", "recipe_generator")
    workflow.add_edge("recipe_generator", "constraint_verifier")
    
    # Conditional Routing for Self-Correction Cycle
    workflow.add_conditional_edges(
        "constraint_verifier",
        should_retry,
        {
            "recipe_generator": "recipe_generator",
            "__end__": END
        }
    )
    
    return workflow.compile()

# Singleton compiled agent graph
nutrition_graph = build_nutrition_agent_graph()

def run_nutrition_pipeline(initial_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the multi-agent graph with initial inputs and returns final validated state.
    """
    # Set default execution boundaries
    state = dict(initial_state)
    state.setdefault("retry_count", 0)
    state.setdefault("max_retries", 3)
    state.setdefault("agent_logs", [])
    
    result = nutrition_graph.invoke(state)
    return result
