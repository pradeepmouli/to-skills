"""Minimal FastMCP server used by `stdio-python-fastmcp.test.ts`.

Run manually with:
    python server.py

The test harness spawns this via `python <path>/server.py` and validates
`extract` against it. Requires `pip install fastmcp` in the active Python
environment; the test gates itself on `HAS_FASTMCP=1` to avoid hard failures
when the dependency is absent.
"""
from fastmcp import FastMCP

mcp = FastMCP("py-test-server")


@mcp.tool()
def echo(message: str) -> str:
    """Echo back the input message."""
    return message


if __name__ == "__main__":
    mcp.run(transport="stdio")
