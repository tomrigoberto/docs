# Canonical Facts Reference

This directory documents the **canonical facts** the parsers produce. Patterns and the DSL access these via `facts.<name>(<args>)`.

Each `*.md` here documents one fact: what it is, how it's extracted, and which transcript types/fields feed it.

This is the contract between parsers and the rule engine. Adding or changing a fact requires an engineering change.
