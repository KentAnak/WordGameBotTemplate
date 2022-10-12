'use strict';
import { join, dirname } from 'path'
import { Low, JSONFileSync } from 'lowdb'
import { fileURLToPath } from 'url'
import line from '@line/bot-sdk'
import express from "express"
import fs from "fs"

const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const config = {
    channelSecret: '---Set your Secret---',
    channelAccessToken: '---Set your AccessToken---'
}

// Use tmp JSON file for storage
const file = "/tmp/users.json"
const adapter = new JSONFileSync(file)
const db = new Low(adapter)
const orgFile =  join(__dirname,'souri.json')

await db.read()
// Set default data
db.data ||= { posts: [] }             // Node >= 15.x
const { posts } = db.data

//Line Connection
const client = new line.Client(config)
app.get('/', (req, res) => {
   res.send('Hello LINE BOT!(GET)')
})
app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
})

//Main event handler
async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }
  let replyText = '';
  let userId = event.source.userId;

  if (!userExists(userId)) {
    if(event.message.text === '古今東西'){
      beginGame(userId);
      replyText = 'じゃあ私から。'+selectName(userId)+'。残りの件数は'+userRemainCnt(userId)+'だよ。';
    }else{
      replyText = '古今東西、総理大臣の名前で遊べるよ。古今東西、って言ったらゲームスタートだよ。';
    }
  } else {
    if(event.message.text === '降参'){
      replyText = 'OK。終わりにするよ。遊んでくれてありがとう。';
      resetGame(userId);
    } else if (event.message.text === 'スキップ'){
      replyText = 'しょうがないな。'+selectName(userId)+'。';
      if(userRemainCnt(userId)==0){
        replyText += "これで最後だね！　私の勝ち！　また遊んでね。";
        resetGame(userId);
      } else {
        replyText += '残り'+userRemainCnt(userId)+'件だよ。';
      }
    } else if (userRemainder(userId).some((v) => v.name === event.message.text)) {
      updateUsedList(event.message.text,userId)
      if(userRemainCnt(userId)!=0){
        replyText = 'OK。'+selectName(userId)+'。';
        if(userRemainCnt(userId)==0){
          replyText += "これで最後だね！ 私の勝ち！ また遊んでね。";
          resetGame(userId);
        } else {
          replyText += '残り'+userRemainCnt(userId)+'件だよ。';
        }
      } else {
        replyText = 'あ、今ので最後だね。あなたの勝ち！ また遊んでね。';
        resetGame(userId);
      } 
    } else if (userNameLists(userId).some((v) => v.name === event.message.text)){
      replyText = 'もう言ったよ！　残り'+userRemainCnt(userId)+'件だよ。分からないときはスキップ、諦めるときは降参って言ってね。';
    }
    else {
      replyText = 'それは一覧に無いね。残り'+userRemainCnt(userId)+'件だよ。分からないときはスキップ、諦めるときは降参って言ってね。';
    }
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText
  });
}

//virtual BackEnd
//SELECT func
function userExists(userId){
  return db.data.posts.map(e => e.user).some(e=>(e===userId));
}
function userNameLists(userId){
  let session= db.data.posts.filter(e => e.user === userId)
  return session.map(e => e.nameLists)[0]
}
function userRemainder(userId){
  let nameLists = userNameLists(userId)
  return nameLists.filter(e => e.flag === 0)
}
function userRemainCnt(userId){
  return userRemainder(userId).length
}
function userIndex(userId){
  return db.data.posts.map(e => e.user).indexOf(userId)
}
//DELETE func
async function resetGame(userId){ 
  if (userExists(userId)) {
    posts.splice(userIndex(userId), 1)
    await db.write() 
    console.log('User:'+userId+' session delete.')
  } else {
    console.log('User:'+userId+' session already deleted.')
  }
}
//UPDATE func
async function beginGame(userId){
  const orgData =  JSON.parse(fs.readFileSync(orgFile, 'utf8'))
  if (!userExists(userId)){
    posts.push({user:userId,nameLists:orgData})
    await db.write()
    console.log('User:'+userId+' db init complete.')
  } else {
    posts.splice(userIndex(userId), 1)
    posts.push({user:userId,nameLists:orgData})
    await db.write()
    console.log('User:'+userId+' already exists. flag reset.')
  }
}
async function updateUsedList(usedname, userId){
  let updateNameLists = userNameLists(userId)
  let nameIndex = updateNameLists.map(e => e.name).indexOf(usedname); 
  updateNameLists[nameIndex].flag = 1
  posts.splice(userIndex(userId), 1)
  posts.push({user:userId,nameLists:updateNameLists})
  await db.write() 
}
function selectName(userId){
  let updateNameLists = userNameLists(userId)
  let keys = Object.keys(updateNameLists)
  let randomKey = keys[Math.floor(Math.random()*keys.length)]
  let selected =  updateNameLists[randomKey]
  updateUsedList(selected.name, userId)
  return selected.name
}

//---debug local server---
//(process.env.NOW_REGION) ? module.exports = app : app.listen(PORT);
//console.log(`Server running at ${PORT}`);
//---Vercel server---
app.listen(PORT);
console.log(`Server running at ${PORT}`);

//---debug test code---
/*
beginGame("testUser");
console.log(userRemainCnt("testUser"))
updateUsedList("小泉純一郎","testUser")
console.log(userRemainCnt("testUser"))
beginGame("testUser2");
console.log(selectName("testUser"))
console.log(selectName("testUser"))
console.log(userRemainCnt("testUser"))
resetGame("testUser")
console.log(selectName("testUser2"))
console.log(userRemainCnt("testUser2"))
resetGame("testUser2")
*/
