# Multi-Highlight


An efficient tool to highlight all words you want in webpages  
快速標記網頁關鍵詞，自動高亮標記所有你想要的字詞  
キーワードをすばやくマークし、必要なすべての単語を自動的に強調表示します  

✔️ Highlight on-the-fly  
✔️ Auto-highlight  
✔️ Savable word list  
✔️ Flexible delimiter  
✔️ Case sensitivity  
✔️ Whole word search  
✔️ Group words by colors  


Notes:
* After installation, refresh tabs to work
* Does not support PDF, iframe



Changelog:

20220624:
* Improve adaptability -- add support to highlight asynchronous text (e.g. AJAX content)

20220115:
* Support nested highlight
* Bug fix: innerHTML deleted unintentionally
* Bug fix: Word boundary not working for keyword-list
* DEV Change keyword data structure and update the version to "2.8.0" due to 
* Feature Re-highlighting.
* Feature Toggle highlighting.

20220110:  
* Improve stability

20220102:
* Adjust interface
* Fix bug (show current keyword list right after popup; properly remove highlights when NewLineNewColor mode is on)

20211226
* Add options: Whole words only, Casesensitive
* Update the highlight lib from [npmjs](https://www.npmjs.com/package/jquery-highlight)
* Modified: Handle the options change in one callback function.
* Modified: Use 2D array to store the keywords in `NewColorNewLine` mode.
* Bugfix: Keywords removal should not remove the container.

20211221
* Add keywords display zone
* Check wheter the page contains the keyword(s) or not, if not, gray it
* `Ctrl+Click` to delete the correspond keyword

20210826:
* Fix user settings reset after browser update

20210519
* Improve UI
* Change Logo
* Add "Always highlight" feature
* Add "Change color after newline" feature
* Fix unstable typesetting issue when typing
* Add 10 more highlight colors (now contains 20 colors)

20191028
* Customizable window size
* Add 4 more colors (now contains 10 colors)

20190609
* Add "paste keywords to new pages" mode

20190503
* Minimize extension size

20190110
* Highlight any strings (not just full word)
* Add Instant Search (highlight on-the-fly)
* Add customizable delimiter
* Make Highlight Words individual to each tab
* UI changes
* Add Ctrl+Shift+F as default shortcut

20181231
* Organize code
* Change UI (based on Multi-Highlight)
* Change extension icon
