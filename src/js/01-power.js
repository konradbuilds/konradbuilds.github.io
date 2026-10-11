
			/* One idle deadline. Timed work is suspended, never queued into a backlog. */
			window.__portfolioPower = ( function () {
				'use strict';
				var lastActivity = Date.now();
				var idleTimer = 0;
				var resting = document.hidden;
				var jobs = new Set();
				function canRun( job ) { return !document.hidden && ( !resting || job.keepIdle ); }
				function arm( job ) {
					if ( !canRun( job ) || job.timer ) { return; }
					job.started = Date.now();
					job.timer = setTimeout( function () {
						job.timer = 0;
						if ( !canRun( job ) ) { return; }
						if ( !job.repeat ) { jobs.delete( job ); }
						job.callback();
						if ( job.repeat ) { job.remaining = job.delay; arm( job ); }
					}, job.remaining );
				}
				function setResting( value, force ) {
					if ( value === resting && !force ) { return; }
					resting = value;
					document.documentElement.classList.toggle( 'motion-resting', resting );
					jobs.forEach( function ( job ) {
						if ( !canRun( job ) && job.timer ) {
							clearTimeout( job.timer ); job.timer = 0;
							job.remaining = Math.max( 0, job.remaining - ( Date.now() - job.started ) );
						} else if ( canRun( job ) ) { arm( job ); }
					} );
					document.dispatchEvent( new Event( 'portfolio:power' ) );
				}
				function checkIdle() {
					idleTimer = 0;
					var remaining = 10000 - ( Date.now() - lastActivity );
					if ( document.hidden || remaining <= 0 ) { setResting( true ); }
					else { idleTimer = setTimeout( checkIdle, remaining ); }
				}
				function wake() {
					if ( document.hidden ) { return; }
					lastActivity = Date.now(); setResting( false );
					if ( !idleTimer ) { idleTimer = setTimeout( checkIdle, 10000 ); }
				}
				[ 'scroll', 'pointermove', 'pointerdown', 'touchstart', 'keydown' ].forEach( function ( event ) {
					window.addEventListener( event, wake, { passive: true } );
				} );
				document.addEventListener( 'visibilitychange', function () {
					document.documentElement.classList.toggle( 'tab-hidden', document.hidden );
					clearTimeout( idleTimer ); idleTimer = 0;
					if ( document.hidden ) { setResting( true, true ); } else { wake(); }
				} );
				window.addEventListener( 'pageshow', wake );
				function schedule( callback, delay, repeat, keepIdle ) {
					var job = { callback: callback, delay: delay, remaining: delay, repeat: repeat, timer: 0, keepIdle: keepIdle };
					jobs.add( job ); arm( job );
					return function () { clearTimeout( job.timer ); jobs.delete( job ); };
				}
				document.documentElement.classList.toggle( 'motion-resting', resting );
				document.documentElement.classList.toggle( 'tab-hidden', document.hidden );
				wake();
				return {
					isPaused: function () { return resting; },
					after: function ( callback, delay ) { return schedule( callback, delay, false ); },
					every: function ( callback, delay, keepIdle ) { return schedule( callback, delay, true, keepIdle ); }
				};
			} )();
		