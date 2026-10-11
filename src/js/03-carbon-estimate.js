

			( function () {
				'use strict';

				var badge = document.getElementById( 'wcb' );
				if ( !badge || !/^https?:$/.test( location.protocol ) ) {
					return;
				}

				var pageUrl = document.querySelector( 'link[rel="canonical"]' ).href;
				var cacheKey = 'wcb_' + encodeURIComponent( pageUrl );
				var hasEstimate = false;

				function numeric( value ) {
					return typeof value === 'number' ||
						typeof value === 'string' && value.trim() !== '' ? Number( value ) : NaN;
				}

				function showEstimate( result, cached ) {
					var carbon = result && numeric( result.c );
					if ( !Number.isFinite( carbon ) || carbon < 0 ) {
						return false;
					}
					var percentile = numeric( result.p );
					badge.querySelector( '.carbon-value' ).textContent = String( carbon );
					badge.querySelector( '#wcb_2' ).textContent =
						Number.isFinite( percentile ) && percentile >= 0 && percentile <= 100 ?
						'Cleaner than ' + percentile + '% of pages tested.' :
						'Last measured result from Website Carbon.';
					if ( cached ) {
						badge.querySelector( '#wcb_2' ).textContent += ' Last measured result.';
					}
					hasEstimate = true;
					return true;
				}

				function loadBadge() {
					try {
						var cached = JSON.parse( localStorage.getItem( cacheKey ) );
						if ( cached && showEstimate( cached, true ) &&
							Number.isFinite( cached.t ) && cached.t <= Date.now() &&
							Date.now() - cached.t < 86400000 ) {
							return;
						}
					} catch ( error ) {
						/* Storage may be blocked. */
					}
					fetch( 'https://api.websitecarbon.com/b?url=' + encodeURIComponent( pageUrl ) )
						.then( function ( response ) {
							if ( !response.ok ) {
								throw new Error( 'Carbon estimate unavailable.' );
							}
							return response.json();
						} )
						.then( function ( result ) {
							if ( !showEstimate( result, false ) ) {
								throw new Error( 'Invalid carbon estimate.' );
							}
							try {
								localStorage.setItem( cacheKey, JSON.stringify( {
									c: numeric( result.c ), p: numeric( result.p ), t: Date.now()
								} ) );
							} catch ( error ) {
								/* Keep the result when storage is blocked. */
							}
						} )
						.catch( function () {
							if ( !hasEstimate ) {
								badge.querySelector( '#wcb_2' ).textContent =
									'Live measurement unavailable — <0.01 was last measured.';
							}
						} );
				}

				if ( 'IntersectionObserver' in window ) {
					var observer = new IntersectionObserver( function ( entries ) {
						if ( entries[ 0 ].isIntersecting ) {
							observer.disconnect();
							loadBadge();
						}
					}, { rootMargin: '300px' } );
					observer.observe( badge );
				} else {
					loadBadge();
				}
			} )();
		