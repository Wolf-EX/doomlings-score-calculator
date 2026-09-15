# [Doomlings Score Calculator](https://wolf-ex.github.io/doomlings-score-calculator/)
An app that automatically calculates the score for the game [DOOMLINGS](https://www.doomlings.com/).  
https://wolf-ex.github.io/doomlings-score-calculator/

## About
When I received doomlings as a gift I loved the game, but not everyone enjoyed calculating their scores and would have me do it. 
I figured I would just make a program that could calculate the scores for everyone and came up with this. 
I wanted something that works well on mobile devices, is simple, and quick to use. 
It doesn't have every expansion yet but I plan to add them over time. 

## How to use
To add a player, click the add player button then enter your name and set your gene pool size and catastrophe bonus if it's applicable, 
then click the Add button.  

_Catastrophe Bonus is for catastrophe events that don't use the players trait pile, hand, or discard pile.
"Deus Ex Machina" is the only one implemented that currently uses it so you set it to the face value of the card you drew.
leave it 0 for every other catastrophe._

To add a trait, enter the trait name in the input bar and click "Add to traits", "Add to hand", or "Add to discard".  

To set the catastrophe, click the "Catastrophe" button at the top.

The scores will automatically be calulated and displayed on the player bar.

#### Importing a player with a qr code
- for the player being imported, once you added all your traits click the qr code icon on the player info bar that has your name and score.
- for the player importing, click the add player button then the qr code icon and scan the qr code with your camera.  
_It might request permission to use the camera._

## Todo
- Implement rest of expansions.
  - Currently only has the deluxe bundle (base game + upgrade pack).
- Improve landscape view layout.

## Credit
- First DOOMLINGS! You can find their game at https://www.doomlings.com/collections/all-products. 
<sub>_I also use some images from their site and can remove them if requested._</sub>  
- For the qr code implementation, I use the [Html5-QRCode](https://github.com/mebjas/html5-qrcode) 
and [react-qr-code](https://github.com/rosskhanas/react-qr-code#readme) libraries.
