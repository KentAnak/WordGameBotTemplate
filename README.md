# WordGameBotTemplate
 Line chat bot template for Vercel.

This template uses Node.js and is designed for deployment in Vercel.
To set up the chatbot, simply set the Vercel URL for the webhook in the Line Developer Console and enter the token obtained there in server.js.

The sample is a "kokontouzai" game about the Prime Minister of Japan.
"Kokonzai" is a Japanese word game in which players take turns saying a list of proper nouns in accordance with a certain theme.
For the list of words, use Json obtained by scraping or API.
I have written an explanation of this code, though in Japanese, in the following blog.

https://qiita.com/B3QP/items/d414687235bbfaab782b

<b>Note: This is just a sample for study purposes</b>, and security and scale considerations should be made for practical use.

<b>Tested in:</b>
- node.js: 16.17.1

<b>Dependent modules are:</b>
- @line/bot-sdk: 7.5.2
- express: 4.18.1
- lowdb: 3.0.0"

