# ============================================================
# Fireball.gd
# Moves a player-fired projectile horizontally and bounces it off floors.
#
# Responsibilities:
#   - Travel horizontally at SPEED in the direction set by the spawner
#   - Apply gravity so the fireball arcs downward over time
#   - Bounce off the floor with a fixed upward velocity
#   - Destroy itself on wall contact or when it leaves the screen
#   - Spin the sprite to give the projectile a rolling appearance
#   - Play a sound effect on a timer after being spawned
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

var velocity  = Vector2()
var direction = 1   # Set by Player.gd immediately after instancing

const SPEED   = 800
const GRAVITY = 22
const BOUNCE  = -300  # Upward velocity applied each time the fireball hits the floor


# ============================================================
# 2) READY
# ============================================================

func _ready():
	velocity.x = SPEED * direction


# ============================================================
# 3) PHYSICS PROCESS
# ============================================================

func _physics_process(delta):
	# Spin the sprite in the travel direction for a rolling effect
	$Sprite.rotation_degrees += 25 * direction

	velocity.y += GRAVITY

	if is_on_floor():
		velocity.y = BOUNCE

	if is_on_wall():
		queue_free()

	velocity = move_and_slide(velocity, Vector2.UP)


# ============================================================
# 4) SIGNAL HANDLERS
# ============================================================

func _on_VisibilityNotifier2D_screen_exited():
	queue_free()


func _on_Timer_timeout():
	# Delayed sound plays shortly after spawn so it doesn't overlap the player's fire sound
	$SoundFireball.play()
