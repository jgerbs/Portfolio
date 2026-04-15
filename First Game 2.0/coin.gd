# ============================================================
# coin.gd
# Collectible coin that signals the HUD and removes itself on pickup.
#
# Responsibilities:
#   - Emit a coin_collected signal when the player enters the coin's area
#   - Play a bounce animation on collection before disappearing
#   - Disable the collision mask immediately to prevent double-collection
#   - Play a sound effect on collection
#   - Free itself from the scene after the animation finishes
#
# Sections:
#   1) CLASS + SIGNALS
#   2) SIGNAL HANDLERS
# ============================================================


# ============================================================
# 1) CLASS + SIGNALS
# ============================================================

extends Area2D

signal coin_collected


# ============================================================
# 2) SIGNAL HANDLERS
# ============================================================

func _on_coin_body_entered(body):
	$AnimationPlayer.play("bounce")
	emit_signal("coin_collected")
	# Disable mask bit 0 immediately so the player cannot re-trigger collection
	set_collision_mask_bit(0, false)
	$SoundCoinCollect.play()


func _on_AnimationPlayer_animation_finished(anim_name):
	queue_free()
