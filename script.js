//color name api
async function getName(code){
     const res = await fetch(`https://www.thecolorapi.com/id?hex=${code}`);
    if (!res.ok) throw new Error("user not found.");
    return await res.json();
}

let code='F45B69'
function printScreen(details){
   console.log(details.name.value)
}
getName(code).then(data=>{
    console.log(data)
    printScreen(data)
}).catch(error=>{
    console.error(error)
})

document.addEventListener('keydown', function(event) {
  // Check if the pressed key is the spacebar using event.code
  if (event.code === 'Space') {
    console.log('Spacebar pressed (keydown event)');
    // Your code to execute when spacebar is pressed down
  }
});
