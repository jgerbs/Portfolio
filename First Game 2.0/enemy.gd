# ============================================================
# enemy.gd
# Controls patrol movement and collision responses for a basic enemy.
#
# Responsibilities:
#   - Walk horizontally at a fixed speed, reversing on walls
#   - Optionally detect cliff edges and reverse before falling off
#   - Color-tint cliff-aware enemies to distinguish them visually
#   - Play a squish animation and disable collisions when stomped
#   - Trigger player bounce when stomped from above
#   - Trigger player damage when touching the player from the side
#   - Destroy both enemy and projectile on fireball contact
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

extends KinematicBody2D

var speed = 50
var velocity = Vector2()

export var direction      = -1    # Initial walk direction: -1 = left, 1 = right
export var detects_cliffs = true  # When true, enemy turns before walking off ledges

const GRAVITY = 20


# ============================================================
# 2) READY
# ============================================================

func _ready():
	if direction == 1:
		$AnimatedSprite.flip_h = true

	# Position the cliff-detector ray at the leading edge of the hitbox
	$floor_checker.position.x = $CollisionShape2D.shape.get_extents().x * direction
	$floor_checker.enabled = detects_cliffs

	if detects_cliffs:
		# Purple tint flags cliff-aware enemies in the editor and at runtime
		set_modulate(Color(1.2, 0.5, 1))


# ============================================================
# 3) PHYSICS PROCESS
# ============================================================

# warning-ignore:unused_argument
func _physics_process(delta):
	# Reverse direction when hitting a wall or when the cliff checker stops detecting floor
	if is_on_wall() or not $floor_checker.is_colliding() and detects_cliffs and is_on_floor():
		direction = direction * -1
		$AnimatedSprite.flip_h = not $AnimatedSprite.flip_h
		$floor_checker.position.x = $CollisionShape2D.shape.get_extents().x * direction

	velocity.y += GRAVITY
	velocity.x = speed * direction
	velocity = move_and_slide(velocity, Vector2.UP)


# ============================================================
# 4) SIGNAL HANDLERS
# ============================================================

func _on_top_checker_body_entered(body):
	# Player or object landed on top — squish the enemy
	$AnimatedSprite.play("squished")
	speed = 0
	# Disable all collision layers so the corpse stops interacting
	set_collision_layer_bit(4, false)
	set_collision_mask_bit(0, false)
	$top_checker.set_collision_layer_bit(4, false)
	$top_checker.set_collision_mask_bit(0, false)
	$side_checker.set_collision_layer_bit(4, false)
	$side_checker.set_collision_mask_bit(0, false)
	$Timer.start()
	if body.get_collision_layer() == 1:
		body.bounce()
	$SoundSquash.play()


func _on_side_checker_body_entered(body):
	if body.get_collision_layer() == 1:
		# Player touched the side — deal damage
		body.ouch(position.x)
	elif body.get_collision_layer() == 32:
		# Fireball hit — destroy both projectile and enemy
		body.queue_free()
		queue_free()


func _on_Timer_timeout():
	queue_free()

