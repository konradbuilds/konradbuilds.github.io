
			window.dataLayer = window.dataLayer || [];

			function gtag() {
				dataLayer.push( arguments );
			}
			/* Wait 16 seconds, then prefer an idle moment. */
			window.__portfolioPower.after( function () {
				function loadAnalytics() {
					if ( window.__portfolioPower.isPaused() ) {
						window.__portfolioPower.after( loadAnalytics, 0 );
						return;
					}
					gtag( 'js', new Date() );
					gtag( 'config', 'G-CMZLED4P2L' );
					var script = document.createElement( 'script' );
					script.async = true;
					script.src = 'https://www.googletagmanager.com/gtag/js?id=G-CMZLED4P2L';
					document.head.appendChild( script );
				}
				if ( 'requestIdleCallback' in window ) {
					requestIdleCallback( loadAnalytics, { timeout: 3000 } );
				} else {
					loadAnalytics();
				}
			}, 16000 );
		