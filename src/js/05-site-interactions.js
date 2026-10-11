
			( function () {
				'use strict';

				var motion = window.__portfolioMotion;
				/* Layout updates. */
				var RELAYOUT = 'ks:relayout';

				function relayout() {
					window.dispatchEvent( new Event( RELAYOUT ) );
				}

				function onRelayout( fn ) {
					window.addEventListener( 'resize', fn );
					window.addEventListener( RELAYOUT, fn );
				}

				/* CV disclosure. */
				( function () {
					var wrap = document.getElementById( 'hiring' );
					var btns = document.querySelectorAll( '[data-hiring]' );
					var close = document.querySelector( '[data-hiring-close]' );
					var cvScroll = matchMedia( '(prefers-reduced-motion: reduce)' ).matches ?
						'auto' : 'smooth';

					if ( !wrap || !btns.length ) {
						return;
					}

					function label( isOpen ) {
						btns.forEach( function ( btn ) {
							var txt = btn.querySelector( '.cv-txt' );

							btn.setAttribute( 'aria-expanded', isOpen ? 'true' : 'false' );

							if ( txt ) {
								txt.textContent = isOpen ? 'Close CV' : 'Open CV';
							}
						} );
					}

					function open( e ) {
						if ( e ) {
							e.preventDefault();
						}

						wrap.hidden = false;
						label( true );
						motion.invalidate();
						requestAnimationFrame( function () {
							wrap.scrollIntoView( {
								behavior: cvScroll,
								block: 'start',
							} );
						} );
					}

					function shut() {
						wrap.hidden = true;
						label( false );
						motion.invalidate();
					}

					btns.forEach( function ( btn ) {
						btn.addEventListener( 'click', function ( e ) {
							if ( wrap.hidden ) {
								open( e );
							} else {
								shut();
								btn.scrollIntoView( {
									behavior: cvScroll,
									block: 'center',
								} );
							}
						} );
					} );

					if ( close ) {
						close.addEventListener( 'click', function () {
							shut();

							if ( btns[ 0 ] ) {
								btns[ 0 ].focus( { preventScroll: true } );
								btns[ 0 ].scrollIntoView( {
									behavior: cvScroll,
									block: 'center',
								} );
							}
						} );
					}

					if ( '#history' === location.hash || '#hiring' === location.hash ) {
						open();
					}
				} )();

				/* Smooth anchor scrolling. */
				window.__jumping = false;

				window.__jumpTo = function ( target, speed ) {
					var margin = parseFloat( getComputedStyle( target ).scrollMarginTop ) || 0;
					var to = target.getBoundingClientRect().top + window.scrollY - margin;

					if ( matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
						window.scrollTo( 0, to );
						return;
					}

					var factor = 1.9 * ( speed || 1 );
					var from = window.scrollY;
					var dist = to - from;
					var start = performance.now();
					var dur = Math.min( 420 * factor, ( 180 + Math.abs( dist ) * 0.05 ) * factor );

					window.__jumping = true;

					( function step( now ) {
						var k = Math.min( 1, ( now - start ) / dur );
						var ease = k < 0.5 ? 4 * k * k * k : 1 - Math.pow( -2 * k + 2, 3 ) / 2;

						window.scrollTo( 0, from + dist * ease );

						if ( k < 1 ) {
							requestAnimationFrame( step );
						} else {
							setTimeout( function () {
								window.__jumping = false;
							}, 90 );
						}
					} )( start );
				};

				document.addEventListener( 'click', function ( e ) {
					if ( e.defaultPrevented ) {
						return;
					}

					var link = e.target.closest && e.target.closest( 'a[href^="#"]' );

					if ( !link ) {
						return;
					}

					var hash = link.getAttribute( 'href' );

					if ( hash.length < 2 ) {
						return;
					}

					var target = document.querySelector( hash );

					if ( !target ) {
						return;
					}

					e.preventDefault();
					window.__jumpTo( target );
					if ( link.classList.contains( 'skip-link' ) ) {
						target.setAttribute( 'tabindex', '-1' );
						target.focus( { preventScroll: true } );
					}

					if ( history.pushState ) {
						history.pushState( null, '', hash );
					}
				} );

				/* Mobile menus; closed panels stay inert. */
				var rail = document.querySelector( '.rail' );
				var railMenu = document.getElementById( 'rail-menu' );
				var railBtn = document.querySelector( '.rail .menu-btn' );
				var topbar = document.getElementById( 'topbar' );
				var tbBtn = topbar && topbar.querySelector( '.menu-btn' );
				var tbPanel = document.getElementById( 'tb-panel' );
				var tbBody = topbar && topbar.querySelector( '.tb-panel-body' );
				var collapses = window.matchMedia( '(max-width:999px)' );

				function syncInert() {
					if ( railMenu ) {
						railMenu.inert = collapses.matches && !rail.classList.contains( 'is-open' );
					}

					if ( tbPanel ) {
						tbPanel.inert = !topbar.classList.contains( 'is-open' );
					}
				}

				function setRailMenu( isOpen ) {
					var txt = railBtn.querySelector( '.mb-txt' );

					rail.classList.toggle( 'is-open', isOpen );
					motion.invalidate();
					railBtn.setAttribute( 'aria-expanded', isOpen ? 'true' : 'false' );
					txt.textContent = isOpen ? 'Close' : 'Menu';
					syncInert();
				}

				function setTopbarMenu( isOpen ) {
					if ( !tbBtn ) {
						return;
					}

					topbar.classList.toggle( 'is-open', isOpen );
					tbBtn.setAttribute( 'aria-expanded', isOpen ? 'true' : 'false' );
					tbBtn.querySelector( '.mb-txt' ).textContent = isOpen ? 'Close' : 'Menu';
					syncInert();
				}

				if ( rail && railBtn ) {
					railBtn.addEventListener( 'click', function () {
						setRailMenu( !rail.classList.contains( 'is-open' ) );
					} );

					rail.querySelectorAll( '.rail-menu a[href^="#"]' ).forEach( function ( link ) {
						link.addEventListener( 'click', function ( e ) {
							if ( !rail.classList.contains( 'is-open' ) ) {
								return;
							}

							var target = document.querySelector( link.getAttribute(
								'href' ) );

							if ( !target ) {
								return;
							}

							e.preventDefault();
							setRailMenu( false );
							setTimeout( function () {
								window.__jumpTo( target );
							}, 340 );
						} );
					} );
				}

				if ( topbar && rail ) {
					var topbarOn = null;
					var aboutTop = 0;
					motion.measure( function () {
						aboutTop = document.getElementById( 'about' ).getBoundingClientRect().top + scrollY;
					} );
					motion.add( function ( scroll ) {
						return scroll.width < 1000 && aboutTop - scroll.y <= 50;
					}, function ( on ) {
						if ( on === topbarOn ) return;
						if ( on && topbarOn === false && navigator.vibrate &&
							navigator.userActivation && navigator.userActivation.hasBeenActive &&
							!matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
							navigator.vibrate( 10 );
						}
						topbarOn = on;
						topbar.classList.toggle( 'is-on', on );
						topbar.inert = !on;
						if ( !on ) setTopbarMenu( false );
					} );
				}

				if ( tbBtn && tbBody ) {
					var srcNav = document.querySelector( '.rail .rail-nav' );
					var srcChat = document.querySelector( '.rail .rail-chat' );

					if ( srcNav ) {
						var navCopy = srcNav.cloneNode( true );

						navCopy.setAttribute( 'aria-label', 'Sections, menu' );
						tbBody.appendChild( navCopy );
					}

					if ( srcChat ) {
						tbBody.appendChild( srcChat.cloneNode( true ) );
					}

					tbBtn.addEventListener( 'click', function () {
						setTopbarMenu( !topbar.classList.contains( 'is-open' ) );
					} );

					tbBody.querySelectorAll( 'a' ).forEach( function ( link ) {
						link.addEventListener( 'click', function () {
							setTopbarMenu( false );
						} );
					} );
				}

				/* Outside taps close first; Tab stays natural. */
				var menuTabbing = false;

				function dismissOutsideMenu( target ) {
					if ( topbar && topbar.classList.contains( 'is-open' ) &&
						!tbPanel.contains( target ) && !tbBtn.contains( target ) ) {
						var restoreTopbarFocus = tbPanel.contains( document.activeElement );
						setTopbarMenu( false );
						if ( restoreTopbarFocus ) {
							tbBtn.focus( { preventScroll: true } );
						}
						return true;
					}

					if ( collapses.matches && rail && rail.classList.contains( 'is-open' ) &&
						!railMenu.contains( target ) && !railBtn.contains( target ) ) {
						var restoreRailFocus = railMenu.contains( document.activeElement );
						setRailMenu( false );
						if ( restoreRailFocus ) {
							railBtn.focus( { preventScroll: true } );
						}
						return true;
					}

					return false;
				}

				document.addEventListener( 'click', function ( event ) {
					if ( dismissOutsideMenu( event.target ) ) {
						event.preventDefault();
						event.stopPropagation();
					}
				}, true );

				document.addEventListener( 'focusin', function ( event ) {
					if ( menuTabbing ) {
						menuTabbing = false;
						dismissOutsideMenu( event.target );
					}
				} );

				document.addEventListener( 'keydown', function ( event ) {
					if ( event.key === 'Tab' ) {
						menuTabbing = true;
						setTimeout( function () { menuTabbing = false; }, 0 );
						return;
					}

					if ( event.key !== 'Escape' ) {
						return;
					}

					if ( topbar && topbar.classList.contains( 'is-open' ) ) {
						setTopbarMenu( false );
						tbBtn.focus();
					} else if ( rail && rail.classList.contains( 'is-open' ) ) {
						setRailMenu( false );
						railBtn.focus();
					}
				} );

				if ( collapses.addEventListener ) {
					collapses.addEventListener( 'change', syncInert );
				} else {
					collapses.addListener( syncInert );
				}
				syncInert();

				/* Clock, weather and air quality. */
				function startClock() {
					var CACHE_KEY = 'bkk-wx';
					var CACHE_MS = 30 * 60 * 1000;
					var wx = null;
					var zoneIndex = 0;
					var zones = [ {
							name: 'Bangkok',
							tz: 'Asia/Bangkok',
						},
						{
							name: 'Düsseldorf',
							tz: 'Europe/Berlin',
						},
					];

					try {
						var mine = Intl.DateTimeFormat().resolvedOptions().timeZone;
						var short = function ( tz ) {
							return new Intl.DateTimeFormat( 'en-US', {
								timeZone: tz,
								hour: 'numeric',
								minute: 'numeric',
							} ).format( new Date() );
						};

						if ( mine && short( mine ) !== short( 'Asia/Bangkok' ) && short( mine ) !==
							short( 'Europe/Berlin' ) ) {
							zones.unshift( {
								name: mine.split( '/' ).pop().replace( /_/g, ' ' ),
								tz: mine,
								you: true,
							} );
						}
					} catch {}

					function words( code ) {
						if ( 0 === code ) {
							return 'clear';
						}
						if ( code <= 2 ) {
							return 'partly cloudy';
						}
						if ( 3 === code ) {
							return 'cloudy';
						}
						if ( 45 === code || 48 === code ) {
							return 'hazy';
						}
						if ( code >= 51 && code <= 57 ) {
							return 'drizzle';
						}
						if ( 61 === code || 80 === code ) {
							return 'light rain';
						}
						if ( 63 === code || 81 === code ) {
							return 'rain';
						}
						if ( 65 === code || 82 === code || 67 === code ) {
							return 'heavy rain';
						}
						if ( code >= 95 ) {
							return 'thunderstorm';
						}

						return '';
					}

					var clockFormats = {};

					function clock( tz ) {
						var fragment = document.createDocumentFragment();
						try {
							tz = tz || 'Asia/Bangkok';
							clockFormats[ tz ] = clockFormats[ tz ] || new Intl.DateTimeFormat( 'en-US', {
								timeZone: tz,
								hour: '2-digit',
								minute: '2-digit',
								hour12: true,
							} );
							clockFormats[ tz ].formatToParts( new Date() ).forEach( function ( part ) {
								if ( part.type === 'literal' && part.value === ':' ) {
									var colon = document.createElement( 'span' );
									colon.className = 'blink';
									colon.textContent = ':';
									fragment.appendChild( colon );
								} else {
									fragment.appendChild( document.createTextNode( part.value.toUpperCase() ) );
								}
							} );
						} catch {}
						return fragment;
					}

					/* US EPA PM2.5 thresholds, µg/m³. */
					function pmClass( value ) {
						if ( value <= 9 ) {
							return 'pm-good';
						}
						if ( value <= 35.4 ) {
							return 'pm-mod';
						}
						if ( value <= 55.4 ) {
							return 'pm-usg';
						}

						return 'pm-bad';
					}

					var weatherLabels = document.querySelectorAll( '.bkk-wx' );
					var liveLabels = document.querySelectorAll( '.rail-live' );

					function paint() {
						weatherLabels.forEach( function ( el ) {
							el.textContent = '';
							el.appendChild( clock( 'Asia/Bangkok' ) );
							if ( wx && Number.isFinite( wx.temp ) ) {
								el.appendChild( document.createTextNode( ' · ' + Math.round( wx.temp ) + '°C' ) );
								if ( typeof wx.words === 'string' && wx.words ) {
									el.appendChild( document.createTextNode( ', ' + wx.words ) );
								}
								if ( Number.isFinite( wx.pm ) ) {
									el.appendChild( document.createTextNode( ' · PM2.5 ' ) );
									var pm = document.createElement( 'b' );
									pm.className = pmClass( wx.pm );
									pm.textContent = String( Math.round( wx.pm ) );
									el.appendChild( pm );
								}
							}
							el.parentNode.hidden = false;
						} );

						var zone = zones[ zoneIndex ];
						liveLabels.forEach( function ( el ) {
							el.textContent = '';
							el.appendChild( document.createTextNode( zone.name + ' ' ) );
							el.appendChild( clock( zone.tz ) );
							if ( zone.you ) {
								var you = document.createElement( 'i' );
								you.textContent = '(you)';
								el.appendChild( document.createTextNode( ' ' ) );
								el.appendChild( you );
							}
						} );
					}

					function load() {
						try {
							var cached = JSON.parse( sessionStorage.getItem( CACHE_KEY ) || 'null' );

							if ( cached && Number.isFinite( cached.temp ) && Date.now() - cached.at < CACHE_MS ) {
								wx = cached;
								paint();
								relayout();
								return;
							}
						} catch {}

						var query = 'latitude=13.75&longitude=100.5&timezone=Asia%2FBangkok';

						Promise.all( [
								fetch(
									'https://api.open-meteo.com/v1/forecast?' +
									query +
									'&current=temperature_2m,weather_code',
								).then( function ( r ) {
									return r.json();
								} ),
								fetch( 'https://air-quality-api.open-meteo.com/v1/air-quality?' +
									query + '&current=pm2_5' )
								.then( function ( r ) {
									return r.json();
								} )
								.catch( function () {
									return null;
								} ),
							] )
							.then( function ( res ) {
								var now = res[ 0 ] && res[ 0 ].current;

								wx = {
									at: Date.now(),
									temp: now ? now.temperature_2m : null,
									words: now ? words( now.weather_code ) : '',
									pm: res[ 1 ] && res[ 1 ].current ? res[ 1 ].current.pm2_5 :
										null,
								};

								if ( null != wx.temp ) {
									try {
										sessionStorage.setItem( CACHE_KEY, JSON.stringify( wx ) );
									} catch {}
								} else {
									window.__portfolioPower.after( load, 60000 );
								}

								paint();
								relayout();
							} )
							.catch( function () {
								paint();
								window.__portfolioPower.after( load, 60000 );
							} );
					}

					onRelayout( function () {
						weatherLabels = document.querySelectorAll( '.bkk-wx' );
						liveLabels = document.querySelectorAll( '.rail-live' );
						paint();
					} );
					paint();
					load();
					function clockVisible() {
						return Array.from( weatherLabels ).concat( Array.from( liveLabels ) ).some( function ( el ) {
							var box = el.getBoundingClientRect();
							return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight;
						} );
					}
					window.__portfolioPower.every( function () {
						if ( !document.hidden && clockVisible() ) {
							paint();
						}
					}, 30000, true );

					window.__portfolioPower.every( function () {
						if ( document.hidden || zones.length < 2 || !clockVisible() ) {
							return;
						}

						var els = liveLabels;

						els.forEach( function ( el ) {
							el.classList.add( 'is-out' );
						} );

						setTimeout( function () {
							zoneIndex = ( zoneIndex + 1 ) % zones.length;
							paint();
							els.forEach( function ( el ) {
								el.classList.remove( 'is-out' );
							} );
						}, 250 );
					}, 8000, true );
				}
				motion.near( document.querySelector( '.shell' ), startClock );

				/* Sidebar progress. */
				( function () {
					var nav = document.querySelector( '.rail .rail-menu-in' );

					if ( !nav ) {
						return;
					}

					var links = Array.prototype.slice.call( nav.querySelectorAll( '.rail-link' ) );
					var secs = links.map( function ( link ) {
						return document.querySelector( link.getAttribute( 'href' ) );
					} );

					var track = document.createElement( 'span' );
					var fill = document.createElement( 'span' );

					track.className = 'rail-track';
					track.setAttribute( 'aria-hidden', 'true' );
					fill.className = 'rail-fill';
					track.appendChild( fill );

					var dots = links.map( function () {
						var dot = document.createElement( 'span' );

						dot.className = 'rail-dot';
						track.appendChild( dot );

						return dot;
					} );

					nav.appendChild( track );

					var ys = [];
					var positions = [];
					var lastIdx = null;
					var lastFill = '';
					var railLinks = document.querySelectorAll( '.rail-link[href]' );

					function measure() {
						var top0 = nav.getBoundingClientRect().top;

						ys = links.map( function ( link ) {
							var box = link.getBoundingClientRect();

							return box.top - top0 + box.height / 2;
						} );

						positions = secs.map( function ( sec ) {
							return sec ? sec.getBoundingClientRect().top + scrollY : Infinity;
						} );
						lastIdx = null;
						return function () {
							track.style.top = ys[ 0 ] + 'px';
							track.style.height = ys[ ys.length - 1 ] - ys[ 0 ] + 'px';

							dots.forEach( function ( dot, i ) {
								dot.style.top = ys[ i ] - ys[ 0 ] + 'px';
							} );
						};
					}

					function update( scroll ) {
						var mark = scroll.y + scroll.height * 0.4;
						var idx = -1;
						var frac = 0;

						positions.forEach( function ( top, i ) {
							if ( top <= mark ) {
								idx = i;
							}
						} );

						if ( idx >= 0 && idx < secs.length - 1 ) {
							var a = positions[ idx ];
							var b = positions[ idx + 1 ];

							frac = Math.min( 1, Math.max( 0, ( mark - a ) / Math.max( 1, b - a ) ) );
						}

						var fillHeight =
							( idx < 0 ?
								0 :
								ys[ idx ] - ys[ 0 ] + ( idx < ys.length - 1 ? frac * ( ys[ idx + 1 ] -
									ys[ idx ] ) : 0 ) ) + 'px';
						if ( fillHeight !== lastFill ) {
							fill.style.height = fillHeight;
							lastFill = fillHeight;
						}

						if ( idx === lastIdx ) {
							return;
						}

						lastIdx = idx;

						dots.forEach( function ( dot, i ) {
							dot.classList.toggle( 'on', i <= idx );
						} );

						railLinks.forEach( function ( link ) {
							link.classList.toggle(
								'is-here',
								idx >= 0 && link.getAttribute( 'href' ) === links[ idx ]
								.getAttribute( 'href' ),
							);
						} );
					}

					motion.measure( measure );
					motion.add( null, update );
					if ( 'ResizeObserver' in window ) {
						new ResizeObserver( motion.invalidate ).observe( nav );
					}
				} )();

				/* Sidebar snap feedback. */
				( function () {
					var avatar = rail && rail.querySelector( '.avatar' );
					if ( !avatar || !avatar.animate ) return;
					var reducedMotion = matchMedia( '(prefers-reduced-motion: reduce)' );
					var railTop = 0;
					var pinned = null;
					var lastY = scrollY;
					var bounce;
					motion.measure( function () {
						railTop = document.querySelector( '.shell' ).getBoundingClientRect().top + scrollY;
					} );
					motion.add( null, function ( scroll ) {
						var next = scroll.width >= 1000 && scroll.y >= railTop;
						if ( next && pinned === false && scroll.y > lastY && !reducedMotion.matches ) {
							if ( bounce ) bounce.cancel();
							bounce = avatar.animate( [
								{ transform: 'scale(1)' },
								{ transform: 'scale(1.1)' },
								{ transform: 'scale(1)' }
							], { duration: 200, easing: 'ease-in-out' } );
						}
						pinned = next;
						lastY = scroll.y;
					} );
				} )();

				/* Back-to-top control. */
				( function () {
					if ( !rail ) {
						return;
					}

					var last = window.scrollY;
					var up = 0;
					var idle = null;

					motion.add( null, function ( scroll ) {
							var y = scroll.y;
							if ( y === last ) return;
							var d = last - y;

							last = y;

							clearTimeout( idle );
							idle = setTimeout( function () {
								up = 0;
								rail.classList.remove( 'show-top' );
							}, 1000 );

							if ( d > 0 ) {
								up += d;
							} else if ( d < 0 ) {
								up = 0;
							}

							rail.classList.toggle( 'is-down', y > 200 );

							if ( y < 120 ) {
								up = 0;
								rail.classList.remove( 'show-top' );
								return;
							}

							if ( up > 200 ) {
								rail.classList.add( 'show-top' );
							} else if ( d < -40 ) {
								rail.classList.remove( 'show-top' );
							}
					} );
				} )();

				/* Gentle section snapping; fast scrolling skips it. */
				( function () {
					if ( matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
						return;
					}

					var REACH = 30;
					var IDLE = 40;
					var FAST = 1.5;

					var secs = Array.prototype.slice.call(
						document.querySelectorAll(
							'.main > section.band:not(.ways-band), #history' ),
					);
					var last = window.scrollY;
					var lastT = performance.now();
					var peak = 0;
					var dist = 0;
					var timer = null;
					var native = 'onscrollend' in window;
					var boxes = [];
					var pageHeight = 0;
					motion.measure( function () {
						boxes = secs.map( function ( sec ) {
							var rect = sec.getBoundingClientRect();
							return { element: sec, top: rect.top + scrollY, height: rect.height,
								margin: parseFloat( getComputedStyle( sec ).scrollMarginTop ) || 0 };
						} );
						pageHeight = document.documentElement.scrollHeight;
					} );

					function settle() {
						timer = null;

						if ( window.__jumping ) {
							return;
						}

						var quick = peak > FAST || dist > window.innerHeight * 1.4;

						peak = 0;
						dist = 0;

						if ( quick ) {
							return;
						}

						var y = window.scrollY;

						if ( y < 60 || y + window.innerHeight > pageHeight -
							60 ) {
							return;
						}

						var best = null;
						var bestOff = 1e9;

						boxes.forEach( function ( box ) {

							if ( box.height < 280 ) {
								return;
							}

							var off = box.top - y - box.margin;

							if ( Math.abs( off ) < Math.abs( bestOff ) ) {
								bestOff = off;
								best = box.element;
							}
						} );

						if ( best && Math.abs( bestOff ) > 4 && Math.abs( bestOff ) <= REACH ) {
							window.__jumpTo( best, 0.6 );
						}
					}

					motion.sample( function ( scroll ) {
							if ( window.__jumping ) {
								last = scroll.y;
								lastT = scroll.time;
								return;
							}

							var now = scroll.time;
							var y = scroll.y;
							var dt = now - lastT;
							var dy = Math.abs( y - last );

							if ( dt > 220 ) {
								peak = 0;
								dist = 0;
							}

							if ( dt > 0 ) {
								peak = Math.max( peak * 0.85, dy / dt );
							}

							dist += dy;
							last = y;
							lastT = now;

							clearTimeout( timer );

							if ( !native ) {
								timer = setTimeout( settle, IDLE );
							}
					} );

					if ( native ) {
						window.addEventListener( 'scrollend', settle );
					}
				} )();

				/* Footer ticker: 29px/s, 1.5s pause. */
				document.querySelectorAll( '.ticker-track' ).forEach( function ( track ) {
					motion.near( track.closest( '.ticker' ), function () {
						Array.prototype.slice.call( track.children ).forEach( function ( child ) {
							var copy = child.cloneNode( true );

							copy.setAttribute( 'aria-hidden', 'true' );
							track.appendChild( copy );
						} );
						relayout();

						if ( matchMedia( '(prefers-reduced-motion: reduce)' ).matches || !track
							.animate ) {
							return;
						}

						var HOLD = 1500;
						var anim = null;
						var lastWidth = 0;

						function run( first ) {
							var width = track.scrollWidth / 2;

							if ( !width || ( !first && Math.abs( width - lastWidth ) < 1 ) ) {
								return;
							}

							lastWidth = width;

							var move = ( width / 29.04 ) * 1000;
							var total = move + HOLD;
							var at = anim ? anim.currentTime : 0;

							if ( anim ) {
								anim.cancel();
							}

							anim = track.animate(
								[ {
										transform: 'translateX(0)',
										offset: 0,
									},
									{
										transform: 'translateX(0)',
										offset: HOLD / total,
									},
									{
										transform: 'translateX(-50%)',
										offset: 1,
									},
								], {
									duration: total,
									iterations: Infinity,
									easing: 'linear',
									delay: first ? 4000 : 0,
								},
							);

							if ( !first && at ) {
								anim.currentTime = at % total;
							}
							updateTicker();
						}

						run( true );

						var idle;

						onRelayout( function () {
							clearTimeout( idle );
							idle = setTimeout( function () {
								run( false );
							}, 150 );
						} );

						var box = track.closest( '.ticker' );

						var visible = true;
						var hovered = false;

						function updateTicker() {
							if ( anim ) {
								if ( visible && !hovered && !document.hidden ) {
									anim.play();
								} else {
									anim.pause();
								}
							}
						}

						updateTicker();

						if ( 'IntersectionObserver' in window ) {
							new IntersectionObserver( function ( entries ) {
								visible = entries[ 0 ].isIntersecting;
								updateTicker();
							} ).observe( box );
						}

						document.addEventListener( 'visibilitychange', updateTicker );
						document.addEventListener( 'portfolio:power', updateTicker );
						box.addEventListener( 'mouseenter', function () {
							hovered = true;
							updateTicker();
						} );
						box.addEventListener( 'mouseleave', function () {
							hovered = false;
							updateTicker();
					} );
				} );
				} );

				/* Load thumbnails near the viewport; videos on click. */
				function showPoster( button ) {
					if ( /^[A-Za-z0-9_-]{11}$/.test( button.dataset.id ) ) {
						button.style.backgroundImage = 'url("https://i.ytimg.com/vi/' + button.dataset.id + '/hqdefault.jpg")';
					}
				}

				if ( 'IntersectionObserver' in window ) {
					var posterObserver = new IntersectionObserver( function ( entries ) {
						entries.forEach( function ( entry ) {
							if ( entry.isIntersecting ) {
								showPoster( entry.target );
								posterObserver.unobserve( entry.target );
							}
						} );
					}, { rootMargin: '300px' } );
					document.querySelectorAll( '.yt' ).forEach( function ( button ) {
						posterObserver.observe( button );
					} );
				} else {
					document.querySelectorAll( '.yt' ).forEach( showPoster );
				}

				document.querySelectorAll( '.yt' ).forEach( function ( btn ) {
					btn.addEventListener( 'click', function () {
						if ( !/^[A-Za-z0-9_-]{11}$/.test( btn.dataset.id ) ) {
							return;
						}
						if ( 'file:' === location.protocol ) {
							window.open( 'https://www.youtube.com/watch?v=' + btn.dataset
								.id, '_blank', 'noopener' );
							return;
						}

						var frame = document.createElement( 'iframe' );

						frame.referrerPolicy = 'strict-origin-when-cross-origin';
						frame.src = 'https://www.youtube-nocookie.com/embed/' + btn.dataset
							.id + '?autoplay=1&rel=0';
						frame.title = btn.getAttribute( 'aria-label' );
						frame.allow =
							'autoplay; encrypted-media; picture-in-picture; fullscreen';
						frame.allowFullscreen = true;
						btn.replaceWith( frame );
					} );
				} );

				/* Footer size and load time. */
				window.addEventListener( 'load', function () {
					setTimeout( function () {
						var nav = performance.getEntriesByType && performance
							.getEntriesByType( 'navigation' )[ 0 ];
						var ms = nav ? nav.duration : 0;

						if ( !ms && performance.timing ) {
							ms = performance.timing.loadEventEnd - performance.timing
								.navigationStart;
						}

						if ( !( ms > 0 ) ) {
							return;
						}

						var shown = ms < 1000 ? Math.round( ms ) + 'ms' : Math.round( ms /
							100 ) / 10 + 's';

						document.querySelectorAll( '.kb' ).forEach( function ( el ) {
							motion.near( el, function () {
								var frames = [ 'loaded in ' + shown, el.textContent ];
								var i = 0;

								el.textContent = frames[ 0 ];

								window.__portfolioPower.every( function () {
									if ( document.hidden || el.closest( '.decorations-paused' ) ) {
										return;
									}
									el.classList.add( 'is-out' );
									setTimeout( function () {
										i = ( i + 1 ) % frames.length;
										el.textContent = frames[ i ];
										el.classList.remove( 'is-out' );
									}, 250 );
								}, 5000, true );
							} );
						} );
					}, 0 );
				} );
			} )();
		