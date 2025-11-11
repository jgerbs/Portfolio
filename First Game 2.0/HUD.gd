extends CanvasLayer

var coins = 0
const LEVEL_COMPLETE = 7

func _ready():
	$Coins.text = String(coins)
	

func _physics_process(delta):
	if coins == LEVEL_COMPLETE:
		get_tree().change_scene("res://WinScreen.tscn")
		
func _on_coin_collected():
	coins += 1
	_ready()




	
