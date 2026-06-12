"""gowithquantum — solve problems with quantum computers using natural language."""

__version__ = "0.1.0"
__all__ = ["QuantumAgent", "__version__"]


def __getattr__(name):
    # Lazy import so submodules (e.g. quantum_runner) don't drag in the
    # anthropic SDK just to be imported.
    if name == "QuantumAgent":
        from .agent import QuantumAgent

        return QuantumAgent
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
