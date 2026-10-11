
			/* Offscreen decoration does not need to keep animating. */
			( function () {
				'use strict';
				if ( !( 'IntersectionObserver' in window ) ) {
					return;
				}
				var regions = document.querySelectorAll( 'section, footer, .rail, .opening, .roof-scene' );
				var visible = new WeakMap();
				function update( region ) {
					region.classList.toggle( 'decorations-paused', document.hidden || !visible.get( region ) );
				}
				var observer = new IntersectionObserver( function ( entries ) {
					entries.forEach( function ( entry ) {
						visible.set( entry.target, entry.isIntersecting );
						update( entry.target );
					} );
				}, { rootMargin: '80px' } );
				regions.forEach( function ( region ) {
					observer.observe( region );
				} );
				document.addEventListener( 'visibilitychange', function () {
					regions.forEach( update );
				} );
			} )();
		