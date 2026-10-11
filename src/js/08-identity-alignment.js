
			( function () {
				'use strict';

				function alignIdentity() {
					var rail = document.querySelector( '.rail' );
					var original = rail.querySelector( '.who' );
					var hero = document.querySelector( '.opening-identity' );
					var box = original.getBoundingClientRect();
					var railBox = rail.getBoundingClientRect();
					hero.style.top = box.top - railBox.top + 'px';
					hero.style.left = box.left - railBox.left + 'px';
					var props = [
						'fontSize',
						'fontWeight',
						'lineHeight',
						'letterSpacing',
						'marginTop',
						'marginBottom',
						'width',
						'height',
					];
					[
						[ 'img', 'img' ],
						[ '.name', '.name' ],
						[ '.rail-role', '.rail-role' ],
					].forEach( function ( pair ) {
						var styles = getComputedStyle( original.querySelector( pair[ 0 ] ) );
						var target = hero.querySelector( pair[ 1 ] );
						props.forEach( function ( prop ) {
							target.style[ prop ] = styles[ prop ];
						} );
					} );
					var styles = getComputedStyle( original );
					hero.style.display = 'flex';
					hero.style.gap = styles.gap;
					hero.style.alignItems = styles.alignItems;
				}
				addEventListener( 'resize', alignIdentity );
				alignIdentity();
				if ( document.fonts ) {
					document.fonts.ready.then( alignIdentity );
				}
			} )();
		