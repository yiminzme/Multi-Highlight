# Multi-Highlight


There are several common bugs that should be test every time the code is changed.
1. Toggle `Change color after newline` several times, chances are that, some
   highlighted keywords are completely removed from the page (the outerHTML of
   the highlighted span). 


Not test:
1. `"`(quote), `()`(parentheis), `\` (slash), and other special symbol character might not be highlighted.


