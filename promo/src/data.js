const fs=require('fs');
const WI='/tmp/claude-0/-home-user/f7bb48ad-37b8-553c-9b28-c0e5ee4d6caa/scratchpad/web/public/img/';
const TG='/tmp/claude-0/-home-user-sahiwalthrift/f7bb48ad-37b8-553c-9b28-c0e5ee4d6caa/scratchpad/n7/img/';
const T10='/tmp/claude-0/-home-user-sahiwalthrift/f7bb48ad-37b8-553c-9b28-c0e5ee4d6caa/scratchpad/n7/img10/';
function IMG(sku){const n=+sku.slice(-4);if(n>=42&&fs.existsSync(WI+sku+'-2.jpg'))return WI+sku+'-2.jpg';return WI+sku+'-1.jpg'}
module.exports={IMG,TG,T10,WI,lib:require('/tmp/claude-0/-home-user-sahiwalthrift/f7bb48ad-37b8-553c-9b28-c0e5ee4d6caa/scratchpad/n7/lib.js'),
 LOGOW:__dirname+'/abcthrift-logo-white.png',LOGO:__dirname+'/abcthrift-logo.png'};
