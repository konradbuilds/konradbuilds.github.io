
			/* Pause decorations outside the viewport. */
			( function () {
				'use strict';
				var scene = document.querySelector( '.roof-scene' );
				if ( 'IntersectionObserver' in window ) {
					new IntersectionObserver( function ( entries ) {
						scene.classList.toggle( 'is-active', entries[ 0 ].isIntersecting && !
							document.hidden );
						scene
							.closest( '.stage' )
							.classList.toggle( 'roof-active', entries[ 0 ].isIntersecting && !
								document.hidden );
					} ).observe( scene );
					document.addEventListener( 'visibilitychange', function () {
						var box = scene.getBoundingClientRect();
						scene.classList.toggle(
							'is-active',
							!document.hidden && box.bottom > 0 && box.top < innerHeight,
						);
						scene
							.closest( '.stage' )
							.classList.toggle(
								'roof-active',
								!document.hidden && box.bottom > 0 && box.top < innerHeight,
							);
					} );
				} else {
					scene.classList.add( 'is-active' );
					scene.closest( '.stage' ).classList.add( 'roof-active' );
				}
			} )();
		