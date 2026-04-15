# ============================================================
# PlayButton.gd
# Handles the Play button press on the title/menu screen.
#
# Responsibilities:
#   - Extend Godot's Button node to attach press logic
#   - Load Level 1 when the button is pressed
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

func _on_PlayButton_pressed():
	get_tree().change_scene("res://Level 1.tscn")
