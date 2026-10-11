
			( function () {
				'use strict';
				var bird = document.querySelector( '.hero-bird' );
				var retracted = null;
				function updateBird( state ) {
					var next = state.y > 0;
					if ( next === retracted ) {
						return;
					}
					retracted = next;
					bird.classList.toggle( 'is-retracted', next );
				}
				/* Use the shared paint so a recovered scroll also restores the bird. */
				window.__portfolioMotion.add( null, updateBird );
				updateBird( { y: window.scrollY } );
			} )();
		