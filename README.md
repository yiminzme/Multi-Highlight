# Multi-Highlight


An efficient tool to highlight all words you want in webpages
快速標記網頁關鍵詞，自動高亮標記所有你想要的字詞
キーワードをすばやくマークし、必要なすべての単語を自動的に強調表示します

* Support memorizing typed words
* Support always highlighting mode
* Support grouping words by colors
* Support customizable delimiter
* Support highlight as you type

* does not support PDF, iframe element


Changelog:

20220115
* Support nested highlight
* Bug fix: innerHTML deleted unintentionally
* Bug fix: Word boundary not working for keyword-list
* <tag>DEV</tag> Change keyword data structure and update the version to "2.8.0" due to 
* <tag>Feature</tag> Re-highlighting.
* <tag>Feature</tag> Toggle highlighting.


20211221
* Add keywords display zone
* Check wheter the page contains the keyword(s) or not, if not, gray it
* `Ctrl+Click` to delete the correspond keyword

20210519
* Improve UI
* Change Logo
* Add "Always highlight" feature
* Add "Change color after newline" feature
* Fix unstable typesetting issue when typing
* Add 10 more highlight colors

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





## User Interface  
![UI1](./src/img/20210519_screenshot1.jpg)  

## Demo  
![demo1](./src/img/20210519_screenshot3.jpg)  


<style>
tag{
	color: #eee;
	background-color: #d33;
	padding: 0 .3em;
	border-radius: .2em;
}
</style>
