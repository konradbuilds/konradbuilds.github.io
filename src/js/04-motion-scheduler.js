
			/* Measure layout changes together; paint scrolling once per frame. */
			window.__portfolioMotion = ( function () {
				'use strict';
				var tasks = [];
				var measurements = [];
				var samples = [];
				var frame = 0;
				var frameFallback = 0;
				var settleTimer = 0;
				var paintedY = -1;
				var dirty = true;
				var running = false;
				var failedCallbacks = new WeakSet();
				function safely( callback, value ) {
					if ( failedCallbacks.has( callback ) ) { return; }
					try { return callback( value ); }
					catch ( error ) {
						failedCallbacks.add( callback );
						console.error( 'Portfolio effect stopped; other effects remain active.', error );
					}
				}

				function state() {
					return { y: scrollY, width: innerWidth, height: innerHeight, time: performance.now() };
				}

				function queue() {
					if ( document.hidden ) {
						return;
					}
					/* Scroll/layout paints are event-driven and must never depend on decoration timers. */
					if ( !frame && !running ) {
						frame = requestAnimationFrame( flush );
						/* Recover a frame deferred by older WebKit during page activation. */
						frameFallback = setTimeout( function () {
							cancelAnimationFrame( frame );
							flush();
						}, 100 );
					}
				}

				/* Check once after an input burst; recover a final scroll event missed by WebKit. */
				function settleScroll() {
					clearTimeout( settleTimer );
					settleTimer = setTimeout( function () {
						settleTimer = 0;
						if ( ! document.hidden && scrollY !== paintedY ) {
							queue();
						}
					}, 120 );
				}

				function invalidate() {
					dirty = true;
					queue();
				}

				function flush() {
					clearTimeout( frameFallback );
					frameFallback = 0;
					frame = 0;
					running = true;
					if ( dirty ) {
						dirty = false;
						var changes = measurements.map( function ( measure ) {
							return safely( measure );
						} );
						changes.forEach( function ( write ) {
							if ( write ) {
								safely( write );
							}
						} );
					}
					var scroll = state();
					var values = tasks.map( function ( task ) {
						return task.read ? safely( task.read, scroll ) : scroll;
					} );
					tasks.forEach( function ( task, i ) {
						if ( !task.read || !failedCallbacks.has( task.read ) ) { safely( task.write, values[ i ] ); }
					} );
					paintedY = scroll.y;
					running = false;
					if ( dirty ) {
						queue();
					}
				}

				var pendingStarts = new WeakMap();
				var approaching = 'IntersectionObserver' in window ? new IntersectionObserver( function ( entries ) {
					entries.forEach( function ( entry ) {
						if ( entry.isIntersecting ) {
							approaching.unobserve( entry.target );
							var start = pendingStarts.get( entry.target );
							pendingStarts.delete( entry.target );
							if ( start ) {
								start();
							}
						}
					} );
				}, { rootMargin: '300px' } ) : null;

				window.addEventListener( 'scroll', function () {
					var scroll = state();
					samples.forEach( function ( sample ) {
							safely( sample, scroll );
					} );
					queue();
					settleScroll();
				}, { passive: true } );
				[ 'wheel', 'touchend', 'keyup' ].forEach( function ( event ) {
					window.addEventListener( event, settleScroll, { passive: true } );
				} );
				document.addEventListener( 'portfolio:power', function () {
					if ( window.__portfolioPower.isPaused() ) { cancelAnimationFrame( frame ); clearTimeout( frameFallback ); frameFallback = 0; frame = 0; } else { queue(); }
				} );
				window.addEventListener( 'resize', invalidate );
				window.addEventListener( 'ks:relayout', invalidate );
				document.addEventListener( 'visibilitychange', function () {
					if ( document.hidden ) {
						clearTimeout( settleTimer );
						settleTimer = 0;
						clearTimeout( frameFallback );
						cancelAnimationFrame( frame );
						frame = 0;
					} else {
						invalidate();
					}
				} );
				if ( 'ResizeObserver' in window ) {
					var observer = new ResizeObserver( invalidate );
					[ document.body, document.querySelector( '.main' ), document.querySelector( '.stage' ) ].forEach( function ( element ) {
						if ( element ) {
							observer.observe( element );
						}
					} );
				}
				if ( document.fonts ) document.fonts.ready.then( invalidate );

				return {
					add: function ( read, write ) {
						tasks.push( { read: read, write: write } );
						queue();
					},
					measure: function ( measure ) {
						measurements.push( measure );
						invalidate();
					},
					sample: function ( sample ) {
						samples.push( sample );
					},
					/* Read-only status for checking that the latest position has been painted. */
					isCurrent: function () {
						return ! dirty && ! running && ! frame && paintedY === scrollY;
					},
					queue: queue,
					invalidate: invalidate,
					near: function ( element, start ) {
						if ( approaching && element ) {
							pendingStarts.set( element, start );
							approaching.observe( element );
						} else {
							start();
						}
					}
				};
			} )();
		