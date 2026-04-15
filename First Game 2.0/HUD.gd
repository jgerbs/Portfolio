# ============================================================
# HUD.gd
# Heads-up display that tracks coins and triggers level completion.
#
# Responsibilities:
#   - Display the current coin count on screen via a Label node
#   - Listen for coin_collected signals from each coin in the level
#   - Increment the internal coin counter on each collection
#   - Transition to the Win Screen when the required coin count is reached
#
# Sections:
#   1) CLASS + CONSTANTS
#   2) READY
#   3) PHYSICS PROCESS
#   4) SIGNAL HANDLERS
# ============================================================


# ============================================================
# 1) CLASS + CONSTANTS
# ============================================================

extends CanvasLayer

var coins = 0
const LEVEL_COMPLETE = 7  # Number of coins required to finish the level


# ============================================================
# 2) READY
# ============================================================

func _ready():
	$Coins.text = String(coins)


# ============================================================
# 3) PHYSICS PROCESS
# ============================================================

func _physics_process(delta):
	if coins == LEVEL_COMPLETE:
		get_tree().change_scene("res://WinScreen.tscn")


# ============================================================
# 4) SIGNAL HANDLERS
# ============================================================

func _on_coin_collected():
	coins += 1
	# Refresh the label by re-running _ready's display logic
	_ready()




	
