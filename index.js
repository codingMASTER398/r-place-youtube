process.on('unhandledRejection', (err) => {
  console.error(err)
});

const { LiveChat } = require("youtube-chat");
const runCommand = require('./runCommand');
var Jimp = require('jimp');

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.redirect('https://www.youtube.com/watch?v=zTKUDEvw_5g')
})
app.get('/image',(req,res)=>{
  res.sendFile(process.cwd()+'/image.png')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

const colors = {
  'white': Jimp.rgbaToInt(255, 255, 255, 255),
  'lightgrey': Jimp.rgbaToInt(228,228,228, 255),
  'darkgrey': Jimp.rgbaToInt(136,136,136,255),
  'black': Jimp.rgbaToInt(	34, 34, 34, 255),
  
  'pink': Jimp.rgbaToInt(255,167,209, 255),
  'red': Jimp.rgbaToInt(229,0,0, 255),
  'orange': Jimp.rgbaToInt(229,149,0,255),
  'brown': Jimp.rgbaToInt(160,106,66, 255),
  
  'yellow': Jimp.rgbaToInt(229,217,0, 255),
  'lightgreen': Jimp.rgbaToInt(148,224,68, 255),
  'green': Jimp.rgbaToInt(2,190,1,255),
  'lightblue': Jimp.rgbaToInt(0,211,221, 255),
  
  'blue': Jimp.rgbaToInt(0,131,199, 255),
  'darkblue': Jimp.rgbaToInt(0,0,234, 255),
  'darkpink': Jimp.rgbaToInt(130,0,128,255),
}

Jimp.read('./image.png').then(image => {
  setInterval(()=>{
    image.writeAsync('./image.png');
  },2500)

  async function chat(){
    try{
    //const liveChat = new LiveChat({liveId: "NLR95qLB6A0"})
    const liveChat = new LiveChat({channelId: "UC3B7Nd8qzdcULkVQ3pg5zfQ"})
    //const liveChat = new LiveChat({channelId: "UChuLeaTGRcfzo0UjL-2qSbQ"})
  
    let going = false
    liveChat.on("start", ()=>{
      setTimeout(()=>{
        going = true
      },8000)
    })
     
    // Emit at end of observation chat.
    // reason: string?
    liveChat.on("end", ()=>{
      going = false
      setTimeout(()=>{
        chat();
      },8000)
    })
     
    // Emit at receive chat.
    // chat: ChatItem
    liveChat.on("chat", (chatItem) => {
      if(going){
        if(chatItem.message && chatItem.message[0] && chatItem.message[0].text){
          let split = chatItem.message[0].text.split(',')
          if(split.length == 3){
            if(!isNaN(parseInt(split[0])) && !isNaN(parseInt(split[1])) && colors[split[2].toLowerCase().replace(' ','')]){
              split[0] = Math.round(parseInt(split[0]))
              split[1] = Math.round(parseInt(split[1]))
              split[2] = colors[split[2].toLowerCase().replace(' ','')]
              
              if((parseInt(split[0]) > -1 && parseInt(split[0]) < 501)&&(parseInt(split[1]) > -1 && parseInt(split[1]) < 251)){
                image.setPixelColor(split[2], split[0], split[1]);
                console.log(`Set ${split[0]}, ${split[1]} to ${split[2]}`)
              }
            }
          }
        }
      }
    })
    
    const ok = await liveChat.start()
    if (!ok) {
      setTimeout(()=>{
        chat();
      },8000)
    }

    }catch{
      setTimeout(()=>{
        chat();
      },8000)
    }
  }
  chat()
  
})
.catch(err => {
  // Handle an exception.
});

function stream(){
  runCommand(
        'ffmpeg',
        `-threads:v 2 -threads:a 12 -filter_threads 2 -thread_queue_size 1080 \
-loop 1 -re -i ./image.png \
-re -i ./track.mp3 \
-pix_fmt yuv420p -c:v libx264 -qp:v 19 -profile:v high -rc:v cbr_ld_hq -level:v 4.2 -r:v 60 -g:v 120 -b:v 10M -refs:v 16 -preset fast -f flv rtmp://a.rtmp.youtube.com/live2/${process.env.streamKey}`,
      () => {},
      () => {
        stream()
      }
  )
}

stream()