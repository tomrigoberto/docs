# Tests

This directory holds the engine-driven tests for the library. Engineering owns the test runner; analysts only need to ensure each observation's `test_cases` block is correct.

To run locally (once the engine is checked out):

```
cd ../observations          # the app repo
make library-tests LIB=../observations-library
```

CI runs the same on every PR.
