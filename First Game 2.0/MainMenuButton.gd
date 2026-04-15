# ============================================================
# MainMenuButton.gd
# Handles the Main Menu button press on game-over or win screens.
#
# Responsibilities:
#   - Extend Godot's Button node to attach press logic
#   - Return the player to the title menu when the button is pressed
#
# Sections:
#   1) CLASS
#   2) SIGNAL HANDLERS
# ============================================================


# ============================================================
# 1) CLASS
# ============================================================

extends Button


# ============================================================
# 2) SIGNAL HANDLERS
# ============================================================

func _on_MainMenuButton_pressed():
	get_tree().change_scene("res://TitleMenu.tscn")
