"""Command-line entry point for gowithquantum (`gwq`)."""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

try:  # optional: load ANTHROPIC_API_KEY from a local .env
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel

from .agent import QuantumAgent


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(
        prog="gwq",
        description="gowithquantum — solve problems with quantum computers using natural language.",
    )
    parser.add_argument("problem", nargs="*", help="The problem to solve, in plain language.")
    parser.add_argument("--model", default="claude-opus-4-8", help="Claude model that drives the agent.")
    parser.add_argument("--max-turns", type=int, default=12, help="Max agent tool-use turns.")
    parser.add_argument("-o", "--output", help="Path to write the final Markdown report.")
    parser.add_argument("--no-save", action="store_true", help="Don't save a report file.")
    args = parser.parse_args(argv)

    console = Console()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        console.print(
            "[red]ANTHROPIC_API_KEY is not set.[/] Add it to your environment "
            "or a local .env file (see .env.example)."
        )
        return 1

    problem = " ".join(args.problem).strip()
    if not problem:
        console.print("[bold]gowithquantum[/] — describe a problem to solve on a quantum computer.")
        try:
            problem = console.input("[cyan]problem ›[/] ").strip()
        except (EOFError, KeyboardInterrupt):
            return 1
    if not problem:
        console.print("[yellow]No problem given. Nothing to do.[/]")
        return 1

    console.print(Panel(problem, title="problem", border_style="magenta"))

    agent = QuantumAgent(model=args.model, max_turns=args.max_turns, console=console)
    try:
        report = agent.solve(problem)
    except KeyboardInterrupt:
        console.print("\n[yellow]Interrupted.[/]")
        return 130
    except Exception as exc:  # surface API/runtime errors cleanly
        console.print(f"\n[red]Agent failed:[/] {exc}")
        return 1

    if report:
        console.print()
        console.rule("[bold green]report")
        console.print(Markdown(report))

        if not args.no_save:
            path = (
                Path(args.output)
                if args.output
                else Path("reports") / f"report-{datetime.now():%Y%m%d-%H%M%S}.md"
            )
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(report, encoding="utf-8")
            console.print(f"\n[green]Saved report →[/] {path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
