"""LangGraph single-node graph template.

Returns a predefined response. Replace logic and configuration as needed.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict

from langgraph.graph import StateGraph
from langgraph.runtime import Runtime
from typing_extensions import TypedDict

import os
import logging
from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain_core.messages import HumanMessage


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

llm = HuggingFaceEndpoint(
    repo_id="meta-llama/Llama-3.1-8B-Instruct",
)

model = ChatHuggingFace(llm=llm)

class Context(TypedDict):
    """Context parameters for the agent.

    Set these when creating assistants OR when invoking the graph.
    See: https://langchain-ai.github.io/langgraph/cloud/how-tos/configuration_cloud/
    """

    my_configurable_param: str


@dataclass
class State:
    """Input state for the agent.

    Defines the initial structure of incoming data.
    See: https://langchain-ai.github.io/langgraph/concepts/low_level/#state
    """

    messages: list = None
    changeme: str = "example"

    def __post_init__(self):
        if self.messages is None:
            self.messages = []


async def call_model(state: State, runtime: Runtime[Context]) -> Dict[str, Any]:
    """Process input and returns output.

    Can use runtime context to alter behavior.
    """

    logger.info(f"State:{state}")

    messages = state.messages + [HumanMessage(content=state.changeme)]
    content = ""
    async for chunk in model.astream(messages):
        logger.info(f"Chunk:{chunk}")
        if chunk.content:
            content += chunk.content

    logger.info(f"Response:{content}")

    messages.append({"role": "assistant", "content": content})

    return {"messages": messages, "changeme": content}

# Define the graph
graph = (
    StateGraph(State, context_schema=Context)
    .add_node(call_model)
    .add_edge("__start__", "call_model")
    .compile(name="New Graph")
)
