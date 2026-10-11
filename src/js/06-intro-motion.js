
			( function () {
				'use strict';

				var stage = document.querySelector( '.stage' );
				var eyebrow = document.querySelector( '.opening-identity' );
				var headline = stage.querySelector( 'h1' );
				var lead = stage.querySelector( '.lead' );
				var opening = document.querySelector( '.opening' );
				var blobFinished = false;
				var depthMeasureKey = '';
				var greetingFinished = false;
				var arrowFinished = false;
				var lastRecordOffset = -1;
				var lastCloudDistance = -1;
				var lastLeadOpacity = -1;
				var lastSunState = -1;
				var curtainActive = false;
				var flockTimer = null;
				var flockReady = false;
				var lastDepthDistance = -1;
				var lastWordDistance = -1;
				var lastDepthReveal = 0;
				var wordProgress = [];
				var membrane = document.getElementById( 'membrane' );
				var track = document.querySelector( '.track-inner' );
				var cloudTops = [];
				var cloudOpacity = [];
				var recordItems = Array.from( track.querySelectorAll( '.label, .stat' ) );
				var recordBounds = [];
				var recordRevealTop = 0;
				var recordOpacity = [];
				var wave = [];
				var drop = stage.querySelector( '.drop' );
				var clouds = stage.querySelectorAll( '.apricot-cloud' );
				var reduced = window.matchMedia( '(prefers-reduced-motion: reduce)' );
				var heroWords = Array.prototype.slice.call( headline.querySelectorAll( '.hero-word' ) );

				if ( !stage || !membrane || reduced.matches ) {
					return;
				}

				var roofScene = stage.querySelector( '.roof-scene' );
				var skylineLayers = roofScene.querySelectorAll(
					'.skyline' );
				var introScroll = stage.querySelector( '.intro-scroll' );
				var sticky = stage.querySelector( '.sticky' );
				var motion = window.__portfolioMotion;
				var lastPhase = -1;
				var lastHorizon = '';
				var stageTop;
				var stageHeight;
				var viewportHeight;
				var roofHeight;
				var curtainCurve;
				var stickyRelease;
				var maxRecordOffset;
				var depthDistance;
				var depthHandoff;
				/* Scroll distances, not timers: hold the complete message before breakup. */
				var heroHold = 50;
				var wordStart;
				var wordEnd;
				var curtainDelay = 100;
				var depthX = 0;
				var depthY = 0;
				var depthScale = 1;
				var depthBox;
				var depthTitle = document.createElement( 'div' );
				depthTitle.className = 'depth-title';
				headline.before( depthTitle );
				depthTitle.appendChild( headline );
				/* A viewport-sized SVG keeps the deep zoom vector-sharp without a giant CSS layer. */
				var svgNS = 'http://www.w3.org/2000/svg';
				var depthVector = document.createElementNS( svgNS, 'svg' );
				depthVector.setAttribute( 'class', 'depth-vector' );
				depthVector.setAttribute( 'aria-hidden', 'true' );
				depthVector.setAttribute( 'preserveAspectRatio', 'none' );
				var depthVectorGroup = document.createElementNS( svgNS, 'g' );
				depthVector.appendChild( depthVectorGroup );
				opening.appendChild( depthVector );
				var depthCover = document.createElement( 'div' );
				depthCover.className = 'depth-cover';
				depthCover.setAttribute( 'aria-hidden', 'true' );
				opening.appendChild( depthCover );
				var depthGlyph = null;
				var glyphWindow;
				var lastIsolated = null;
				var dotBounds;
				var svgDotImage = null;
				var svgDotFont = '';
				var svgDotRequested = '';

				var leadWords = lead.textContent.trim().split( /\s+/ ).map( function ( text ) {
					var span = document.createElement( 'span' );
					span.className = 'lead-word';
					span.textContent = text;
					return span;
				} );
				lead.textContent = '';
				leadWords.forEach( function ( word, index ) {
					if ( index ) {
						lead.append( ' ' );
					}
					lead.appendChild( word );
				} );

				depthTitle.appendChild( lead );
				var allWords = heroWords.concat( leadWords );
				var greetings = {
					de: 'Hi, ich bin Konrad',
					fr: 'Salut, moi c’est Konrad',
					es: 'Hola, soy Konrad',
					it: 'Ciao, sono Konrad',
					pt: 'Olá, sou o Konrad',
					nl: 'Hoi, ik ben Konrad',
					pl: 'Cześć, jestem Konrad',
					sv: 'Hej, jag heter Konrad',
					da: 'Hej, jeg hedder Konrad',
					no: 'Hei, jeg heter Konrad',
					nb: 'Hei, jeg heter Konrad',
					fi: 'Moi, olen Konrad',
					cs: 'Ahoj, jsem Konrad',
					sk: 'Ahoj, som Konrad',
					hu: 'Szia, Konrad vagyok',
					ro: 'Salut, sunt Konrad',
					tr: 'Merhaba, ben Konrad',
					el: 'Γεια, είμαι ο Konrad',
					uk: 'Привіт, я Конрад',
					ru: 'Привет, я Конрад',
					id: 'Hai, saya Konrad',
					ms: 'Hai, saya Konrad',
					vi: 'Chào bạn, mình là Konrad',
					th: 'สวัสดีครับ ผมชื่อคอนราด',
					ja: 'こんにちは、​コンラッドです',
					ko: '안녕하세요, 콘라트입니다',
					zh: '你好，我是 Konrad',
					ar: 'مرحبًا، أنا كونراد',
					he: 'היי, אני קונרד',
					hi: 'नमस्ते, मैं कोनराड हूँ',
					my: 'မင်္ဂလာပါ၊ ကျွန်တော် Konrad ပါ'
				};
				var language = ( navigator.language || 'en' ).toLowerCase().split( '-' )[ 0 ];
				var greeting = document.createElement( 'h2' );
				greeting.className = 'depth-greeting';
				greeting.textContent = greetings[ language ] || "Hi, I'm Konrad";
				greeting.lang = greetings[ language ] ? language : 'en';
				greeting.dir = 'auto';
				var arrow = document.createElement( 'button' );
				arrow.className = 'depth-arrow';
				arrow.type = 'button';
				arrow.setAttribute( 'aria-label', 'Scroll to introduction' );
				arrow.innerHTML = '<svg width="30" height="34" viewBox="0 0 30 34" fill="none" aria-hidden="true"><path d="M15 3v26M5 19l10 10 10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
				arrow.addEventListener( 'click', function () {
					window.scrollTo( { top: stageTop + depthDistance, behavior: 'smooth' } );
				} );
				opening.append( greeting, arrow );
				stage.classList.add( 'depth-enabled' );


				/* Locate the real first i-dot, including the platform's font metrics. */
				function measureDepth() {
					var font = getComputedStyle( headline );
					var key = [ innerWidth, viewportHeight, font.fontFamily, font.fontSize, font.fontWeight, font.lineHeight, document.fonts ? document.fonts.status : '' ].join( '|' );
					if ( key === depthMeasureKey ) { return; }
					depthMeasureKey = key;
					depthTitle.style.display = '';
					lastIsolated = null;
					lastDepthDistance = -1;
					blobFinished = false;
					wordProgress = [];
					lastWordDistance = -1;
					lastSunState = -1;
					depthDistance = Math.round( Math.min( 760, Math.max( 420, viewportHeight * 0.85 ) ) );
					/* Finish zooming, hold the message, then overlap breakup with the curtain. */
					wordStart = depthDistance + heroHold;
					wordEnd = wordStart + 32 + viewportHeight * 0.23;
					depthHandoff = wordStart;
					stage.style.setProperty( '--depth-scroll', ( depthHandoff + curtainDelay ) + 'px' );
					depthTitle.style.transform = 'none';
					headline.style.transform = 'none';
					heroWords.forEach( function ( word ) {
						word.style.transform = 'none';
					} );
					depthBox = depthTitle.getBoundingClientRect();
					var word = document.getElementById( 'hero-word-03' );
					var range = document.createRange();
					range.setStart( word.firstChild, 2 );
					range.setEnd( word.firstChild, 3 );
					var glyph = range.getBoundingClientRect();
					var style = getComputedStyle( headline );
					var size = parseFloat( style.fontSize );
					var dotFont = [ style.fontFamily, style.fontWeight, style.fontSize ].join( '|' );
					/* Measure the SVG renderer's glyph, rather than assuming Canvas text is identical. */
					if ( svgDotRequested !== dotFont ) {
						svgDotRequested = dotFont;
						var probe = document.createElementNS( svgNS, 'svg' );
						probe.setAttribute( 'xmlns', svgNS );
						probe.setAttribute( 'width', Math.ceil( size * 8 ) );
						probe.setAttribute( 'height', Math.ceil( size * 8 ) );
						probe.setAttribute( 'viewBox', '0 0 ' + ( size * 2 ) + ' ' + ( size * 2 ) );
						var probeText = document.createElementNS( svgNS, 'text' );
						probeText.setAttribute( 'x', size / 2 );
						probeText.setAttribute( 'y', size );
						probeText.setAttribute( 'font-family', style.fontFamily );
						probeText.setAttribute( 'font-size', style.fontSize );
						probeText.setAttribute( 'font-weight', style.fontWeight );
						probeText.textContent = 'i';
						probe.appendChild( probeText );
						var image = new Image();
						image.onload = function () {
							if ( svgDotRequested !== dotFont ) { return; }
							svgDotImage = image;
							svgDotFont = dotFont;
							depthMeasureKey = '';
							motion.invalidate();
						};
						image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent( new XMLSerializer().serializeToString( probe ) );
					}
					var baseline = document.createElement( 'span' );
					baseline.style.cssText = 'display:inline-block;width:0;height:0;padding:0;vertical-align:baseline';
					word.appendChild( baseline );
					var baselineY = baseline.getBoundingClientRect().top;
					baseline.remove();

					/* Canvas reads can be denied by browser privacy settings or extensions. */
					try {
						/* Subpixel ink bounds: a rounded 1px error becomes a sideways jump at deep zoom. */
						var dotPrecision = 4;
						var canvas = document.createElement( 'canvas' );
						canvas.width = canvas.height = Math.ceil( size * 2 * dotPrecision );
						var context = canvas.getContext( '2d', { willReadFrequently: true } );
						context.scale( dotPrecision, dotPrecision );
						context.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
						if ( svgDotImage && svgDotFont === dotFont ) {
							context.drawImage( svgDotImage, 0, 0, size * 2, size * 2 );
						} else { context.fillText( 'i', size / 2, size ); }
						var pixels = context.getImageData( 0, 0, canvas.width, canvas.height ).data;
						var left = canvas.width;
						var right = 0;
						var top = -1;
						var bottom = 0;
						for ( var y = 0; y < canvas.height; y++ ) {
							var found = false;
							for ( var x = 0; x < canvas.width; x++ ) {
								if ( pixels[ ( y * canvas.width + x ) * 4 + 3 ] > 200 ) {
									found = true;
									left = Math.min( left, x );
									right = Math.max( right, x );
								}
							}
							if ( found ) {
							if ( top < 0 ) {
								top = y;
							}
							bottom = y;
						} else if ( top >= 0 ) {
							break;
						}
					}
						if ( top < 0 || right <= left || bottom <= top ) { throw new Error( 'Unavailable i-dot pixels' ); }
						left /= dotPrecision;
						right = ( right + 1 ) / dotPrecision;
						top /= dotPrecision;
						bottom = ( bottom + 1 ) / dotPrecision;
						if ( right - left > size * 0.5 || bottom - top > size * 0.3 ) { throw new Error( 'Unavailable i-dot pixels' ); }
					} catch ( error ) {
						/* Conservative dot estimate; ordinary text still uses native layout. */
						left = size / 2 + glyph.width * 0.25;
						right = size / 2 + glyph.width * 0.75;
						top = size * 0.27;
						bottom = size * 0.40;
					}
					depthX = glyph.left - depthBox.left + ( left + right ) / 2 - size / 2;
					depthY = baselineY - depthBox.top + ( top + bottom ) / 2 - size;
					depthTitle.style.transformOrigin = depthX + 'px ' + depthY + 'px';
					dotBounds = { left: glyph.left - depthBox.left + left - size / 2 + 1,
						right: glyph.left - depthBox.left + right - size / 2 - 1,
						top: baselineY - depthBox.top + top - size + 1,
						bottom: baselineY - depthBox.top + bottom - size - 1 };
					depthVector.setAttribute( 'viewBox', '0 0 ' + innerWidth + ' ' + viewportHeight );
					depthVectorGroup.textContent = '';
					depthGlyph = document.createElementNS( svgNS, 'text' );
					depthGlyph.textContent = 'i';
					glyphWindow = { left: glyph.left - depthBox.left + 2, right: glyph.right - depthBox.left - 2 };
					depthGlyph.setAttribute( 'x', glyph.left - depthBox.left );
					depthGlyph.setAttribute( 'y', baselineY - depthBox.top );
					depthGlyph.style.fontFamily = style.fontFamily;
					depthGlyph.style.fontSize = style.fontSize;
					depthGlyph.style.fontWeight = style.fontWeight;
					depthGlyph.style.letterSpacing = style.letterSpacing;
					depthVectorGroup.appendChild( depthGlyph );
					heroWords.forEach( function ( word ) {
						var box = word.getBoundingClientRect();
						var marker = document.createElement( 'span' );
						marker.style.cssText = 'display:inline-block;width:0;height:0;padding:0;vertical-align:baseline';
						word.appendChild( marker );
						var baseline = marker.getBoundingClientRect().top - depthBox.top;
						marker.remove();
						var text = document.createElementNS( svgNS, 'text' );
						text.textContent = word.textContent;
						text.setAttribute( 'x', box.left - depthBox.left );
						text.setAttribute( 'y', baseline );
						text.style.fontFamily = style.fontFamily;
						text.style.fontSize = style.fontSize;
						text.style.fontWeight = style.fontWeight;
						text.style.letterSpacing = style.letterSpacing;
						depthVectorGroup.appendChild( text );
					} );
					depthBox = { left: depthBox.left, top: depthBox.top - sticky.getBoundingClientRect().top };
					/* Twice the required cover keeps even rounded dot corners outside the viewport. */
					depthScale = Math.max( ( innerWidth + 1000 ) / Math.max( 1, right - left ),
						( viewportHeight + 1000 ) / Math.max( 1, bottom - top ) ) * 2;
				}

				function renderDepth( distance ) {
					/* Stop the parent transform once every word has disappeared. */
					distance = Math.min( distance, wordEnd );
					if ( distance === lastDepthDistance ) {
						return lastDepthReveal;
					}
					lastDepthDistance = distance;
					var t = clamp( distance / depthDistance, 0, 1 );
					var travel = 1 - Math.pow( 1 - t, 3 );
					var scale = Math.exp( Math.log( depthScale ) * ( 1 - travel ) );
					var x = ( innerWidth / 2 - depthBox.left - depthX ) * ( 1 - travel );
					var y = ( viewportHeight / 2 - depthBox.top - depthY ) * ( 1 - travel );

					var finished = distance >= wordEnd;
					var vectorZoom = scale > 2;
					depthTitle.style.display = finished ? 'none' : '';
					depthTitle.style.visibility = finished ? 'hidden' : '';
					depthTitle.style.opacity = vectorZoom ? '0' : '1';
					depthTitle.style.transform = finished || vectorZoom || t === 1 ? 'none' : 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
					var viewX = depthX - ( depthBox.left + x + depthX ) / scale;
					var viewY = depthY - ( depthBox.top + y + depthY ) / scale;
					var viewWidth = innerWidth / scale;
					var viewHeight = viewportHeight / scale;
					var covered = vectorZoom && viewX >= dotBounds.left && viewY >= dotBounds.top &&
						viewX + viewWidth <= dotBounds.right && viewY + viewHeight <= dotBounds.bottom;
					/* Let the lettering arrive beneath apricot before revealing it; no hard colour switch. */
					var coverOpacity = covered ? 1 : ( vectorZoom ? 1 - smooth( clamp( ( t - 0.20 ) / 0.12, 0, 1 ) ) : 0 );
					depthCover.style.display = coverOpacity > 0 ? 'block' : 'none';
					depthCover.style.opacity = String( coverOpacity );
					depthVector.style.display = vectorZoom && !covered ? 'block' : 'none';
					if ( vectorZoom && !covered ) {
						/* At deep zoom only the i can enter the viewport. Restore words before they approach. */
						var isolated = viewX >= glyphWindow.left && viewX + viewWidth <= glyphWindow.right;
						if ( isolated !== lastIsolated ) {
							lastIsolated = isolated;
							depthGlyph.style.display = isolated ? '' : 'none';
							Array.from( depthVectorGroup.children ).forEach( function ( node ) {
								if ( node !== depthGlyph ) { node.style.display = isolated ? 'none' : ''; }
							} );
						}
						/* Keep the viewport stable: move the artwork, not the SVG camera. */
						depthVectorGroup.setAttribute( 'transform', 'matrix(' + scale + ' 0 0 ' + scale + ' ' +
							( -viewX * scale ) + ' ' + ( -viewY * scale ) + ')' );
					}
					/* Bend around the revealing dot, then dissolve only the backing into the sky. */
					if ( !blobFinished || t < 0.28 ) {
						var swell = smooth( clamp( t / 0.42, 0, 1 ) );
						eyebrow.style.setProperty( '--blob-x', 2 + swell * 0.55 );
						eyebrow.style.setProperty( '--blob-y', 2 + swell * 0.3 );
						eyebrow.style.setProperty( '--blob-pull', -swell * 25 + 'px' );
						eyebrow.style.setProperty( '--blob-drop', -swell * 12 + 'px' );
						eyebrow.style.setProperty( '--blob-angle', -swell * 12 + 'deg' );
						eyebrow.style.setProperty( '--blob-opacity', 1 - smooth( clamp( ( t - 0.15 ) / 0.13, 0, 1 ) ) );
						eyebrow.style.setProperty( '--blob-radius',
							'38% 62% ' + ( 43 + swell * 20 ) + '% ' + ( 57 - swell * 20 ) +
							'% / 28% ' + ( 36 + swell * 18 ) + '% ' + ( 64 - swell * 18 ) + '% 72%' );
						blobFinished = t >= 0.28;
						eyebrow.classList.toggle( 'blob-finished', blobFinished );
					}

					if ( !greetingFinished || t < 0.25 ) {
						var helloScale = Math.exp( -2 * Math.log( depthScale ) * travel );
						greeting.style.transform = t >= 0.25 ? 'none' : 'scale(' + helloScale + ')';
						greeting.style.visibility = t >= 0.25 ? 'hidden' : '';
						greeting.style.opacity = String( 1 - smooth( clamp( t / 0.25, 0, 1 ) ) );
						greeting.setAttribute( 'aria-hidden', t > 0.1 ? 'true' : 'false' );
						greetingFinished = t >= 0.25;
					}
					if ( !arrowFinished || distance < 90 ) {
						arrow.style.opacity = String( 1 - clamp( distance / 90, 0, 1 ) );
						arrow.hidden = distance >= 90;
						arrowFinished = distance >= 90;
					}

					lastDepthReveal = smooth( clamp( ( t - 0.62 ) / 0.2, 0, 1 ) );
					return lastDepthReveal;
				}


				function clamp( value, min, max ) {
					return Math.max( min, Math.min( max, value ) );
				}

				function smooth( t ) {
					return t * t * ( 3 - 2 * t );
				}

				/* Cache geometry before scroll writes. */
				function measure() {
                    /* Match the 100vh stage, not the address bar's changing visible
                     * viewport. Width/orientation/real layout changes still remeasure. */
                    viewportHeight = sticky.clientHeight || window.innerHeight;
                    measureDepth();
					stageTop = stage.getBoundingClientRect().top + window.scrollY;
					stageHeight = stage.offsetHeight;
					roofHeight = roofScene.getBoundingClientRect().height;
					/* Shallow mobile curtain. */
					curtainCurve = window.innerWidth < 768 ? window.innerWidth / 1440 : 1;
					stickyRelease = Math.max( 0, introScroll.offsetHeight - sticky.offsetHeight );
					var padding = parseFloat( getComputedStyle( track ).paddingBottom ) || 0;
					var recordBottom = track.offsetTop + track.offsetHeight - padding;
					maxRecordOffset = Math.max( 0, sticky.clientHeight - recordBottom - 24 );
					var gradientBox = track.querySelector( '.wide' ).getBoundingClientRect();
					track.querySelectorAll( '.label, .stat b, .stat span' ).forEach( function ( text ) {
						var textBox = text.getBoundingClientRect();
						var fraction = clamp( ( textBox.top + textBox.height / 2 - gradientBox.top ) / Math.max( 1, gradientBox.height ), 0, 1 );
						text.style.color = 'rgb(' + Math.round( 54 - 34 * fraction ) + ',' +
							Math.round( 31 - 9 * fraction ) + ',' + Math.round( 84 - 58 * fraction ) + ')';
					} );
					recordBounds = recordItems.map( function ( item ) {
						var box = item.getBoundingClientRect();
						return { x: ( box.left + box.width / 2 ) / innerWidth,
							y: box.top - sticky.getBoundingClientRect().top - Math.min( Math.max( 0, window.scrollY - stageTop - stickyRelease ) * 0.125, maxRecordOffset ) };
					} );
					recordRevealTop = Math.min.apply( null, recordBounds.map( function ( bounds ) { return bounds.y; } ) );
					recordOpacity = [];
					cloudTops = Array.from( clouds, function ( cloud ) {
						return cloud.getBoundingClientRect().top - sticky.getBoundingClientRect().top;
					} );
					cloudOpacity = [];
					lastPhase = -1;
					queueFrame();
				}

				function queueFrame() {
					motion.queue();
				}

				function render() {
					var top = stageTop - window.scrollY;
					var rect = {
						top: top,
						bottom: top + stageHeight
					};
					if ( rect.bottom <= 0 || rect.top >= viewportHeight ) {
						return;
					}
					var horizon =
						'translateY(' +
						( 42 * ( 1 - clamp( ( viewportHeight - rect.bottom + 260 ) / 260, 0, 1 ) ) )
						.toFixed( 2 ) +
						'px)';
					if ( rect.bottom - roofHeight < viewportHeight && horizon !== lastHorizon ) {
						skylineLayers.forEach( function ( layer ) {
							layer.style.transform = horizon;
						} );
						lastHorizon = horizon;
					}
					var afterHandoff = Math.max( 0, -rect.top - stickyRelease );
					var recordOffset = Math.min( afterHandoff * 0.125, maxRecordOffset );
					if ( recordOffset !== lastRecordOffset ) {
						track.style.transform = recordOffset ? 'translateY(' + recordOffset.toFixed( 2 ) + 'px)' : 'none';
						lastRecordOffset = recordOffset;
					}
					var cloudDistance = Math.max( 0, -rect.top - depthHandoff ) / Math.max( 1, stageHeight - depthHandoff );
					if ( cloudDistance !== lastCloudDistance ) {
						clouds.forEach( function ( cloud ) {
							cloud.style.transform =
								'translate(' +
								cloudDistance * 0.75 * Number( cloud.dataset
									.drift ) +
								'vw,0)';
					} );
					lastCloudDistance = cloudDistance;
					}

					var depthReveal = renderDepth( Math.max( 0, -rect.top ) );
					var curtainDistance = Math.max( 0, -rect.top - depthHandoff - curtainDelay );
					var p = clamp( curtainDistance / Math.max( 1, viewportHeight * 0.9 ), 0, 0.4 );
					if ( depthReveal !== lastLeadOpacity ) {
						lead.style.opacity = String( depthReveal );
						lastLeadOpacity = depthReveal;
					}
					/* Keep the stars still while the curved wipe is doing the painting. */
					if ( curtainActive !== ( curtainDistance > 0 ) ) {
						curtainActive = curtainDistance > 0;
						opening.classList.toggle( 'curtain-active', curtainActive );
					}

					/* Break up both lines before the incoming curtain reaches the viewport. */
					var wordDistance = clamp( -rect.top, wordStart, wordEnd );
					if ( wordDistance !== lastWordDistance ) {
						lastWordDistance = wordDistance;
						allWords.forEach( function ( word, index ) {
							var stagger = ( ( index * 37 ) % 9 ) * 4;
							var t = smooth( clamp( ( wordDistance - wordStart - stagger ) / ( viewportHeight * 0.23 ), 0, 1 ) );
							if ( wordProgress[ index ] === t ) {
								return;
							}
							wordProgress[ index ] = t;
							word.style.opacity = String( 1 - t );
							word.style.transform = t === 1 ? 'none' : 'translate(' + ( ( index % 3 ) - 1 ) * t * 10 + 'px,' +
								-t * ( 36 + ( index % 4 ) * 12 ) + 'px) rotate(' + ( index % 2 ? 1 : -1 ) * t * 5 + 'deg)';
						} );
					}

					if ( p !== lastPhase ) {
						stage.classList.toggle( 'is-wiping', p > 0 && p < 0.4 );
						if ( p >= 0.4 && !flockReady && flockTimer === null ) {
							flockTimer = setTimeout( function () {
								stage.classList.add( 'flock-started' );
								flockReady = true;
								flockTimer = null;
							}, 1000 );
						} else if ( p < 0.4 ) {
							clearTimeout( flockTimer );
							flockTimer = null;
							flockReady = false;
							stage.classList.remove( 'flock-started' );
						}

						var rise = smooth( clamp( p / 0.58, 0, 1 ) );


						var baseY = 940 - rise * 1010 + ( 1000 * 100 / viewportHeight + 60 + 56 * curtainCurve ) * ( 1 - smooth( clamp( p / 0.16, 0, 1 ) ) );
						var energy = Math.sin( rise * Math.PI );
						var amp = ( 56 + energy * 120 ) * curtainCurve;
						var phase = p * Math.PI * 3.1;
						var y1 = baseY + Math.sin( phase ) * amp;
						var y2 = baseY - Math.cos( phase * 0.92 ) * amp * 0.76;
						var y3 = baseY + Math.sin( phase * 1.07 + 1.2 ) * amp * 0.66;
						var y4 = baseY - Math.cos( phase * 0.86 + 0.6 ) * amp * 0.72;
						/* Finish above the actual text bounds before releasing the sticky fold.
						 * Font metrics vary across engines; a fixed final wave can strand a column. */
						var clearY = ( recordRevealTop + recordOffset - 46 ) * 1000 / viewportHeight;
						var clearance = Math.max( 0, Math.max( y1, y2, y3, y4 ) - clearY ) *
							smooth( clamp( ( p - 0.32 ) / 0.08, 0, 1 ) );
						y1 -= clearance;
						y2 -= clearance;
						y3 -= clearance;
						y4 -= clearance;
						wave = [ y1, y2, y3, y1, y4, y2, y3 ];

						membrane.setAttribute(
							'd',
							'M0 ' +
							y1.toFixed( 1 ) +
							' C165 ' +
							y2.toFixed( 1 ) +
							' 335 ' +
							y3.toFixed( 1 ) +
							' 520 ' +
							y1.toFixed( 1 ) +
							' C700 ' +
							y4.toFixed( 1 ) +
							' 850 ' +
							y2.toFixed( 1 ) +
							' 1000 ' +
							y3.toFixed( 1 ) +
							' L1000 1600 L0 1600 Z',
						);

						eyebrow.style.opacity = String( 1 - smooth( clamp( ( p - 0.18 ) / 0.13, 0, 1 ) ) );



						opening.inert = p > 0.39;

						var reveal = smooth( clamp( ( p - 0.24 ) / 0.15, 0, 1 ) );

						track.style.opacity = '1';
						track.inert = reveal < 0.95;

						lastPhase = p;
					}

					/* Text is outside the SVG clip: fade each block after the edge passes it. */

					recordItems.forEach( function ( item, index ) {
						var bounds = recordBounds[ index ];
						var x = bounds.x;
						var u = x <= 0.52 ? x / 0.52 : ( x - 0.52 ) / 0.48;
						var v = 1 - u;
						var start = x <= 0.52 ? 0 : 3;
						var edge = p > 0 ? ( v * v * v * wave[ start ] + 3 * v * v * u * wave[ start + 1 ] +
							3 * v * u * u * wave[ start + 2 ] + u * u * u * wave[ start + 3 ] ) * viewportHeight / 1000 : viewportHeight * 2;
						var opacity = smooth( clamp( ( bounds.y + recordOffset - edge ) / 45, 0, 1 ) );
						if ( recordOpacity[ index ] !== opacity ) {
							item.style.opacity = String( opacity );
							item.style.visibility = opacity === 0 ? 'hidden' : 'visible';
							recordOpacity[ index ] = opacity;
						}
					} );

					/* Wait until the whole curved edge clears each cloud, then fade it in. */
					var cloudEdge = p > 0 ? Math.max.apply( null, wave ) * viewportHeight / 1000 : viewportHeight * 2;
					clouds.forEach( function ( cloud, index ) {
						var opacity = smooth( clamp( ( cloudTops[ index ] - cloudEdge ) / 45, 0, 1 ) );
						if ( cloudOpacity[ index ] !== opacity ) {
							cloud.style.opacity = String( opacity * 0.12 );
							cloudOpacity[ index ] = opacity;
						}
					} );

					/* Sun: 200px delay, curved leftward path. */
					var sunDistance = Math.max( 0, curtainDistance - 200 );
					var sunRange = Math.max( 1, viewportHeight * 0.72 );
					var sunPhase = clamp( sunDistance / sunRange, 0, 1 );
					var sunState = curtainDistance < 200 ? -2 : sunPhase;
					if ( sunState === lastSunState ) { return; }
					lastSunState = sunState;
					var sunMotion = 1 - Math.pow( 1 - sunPhase, 2 );
					var sunHeight = 72 * smooth( 0.4 / 0.58 );
					var sunScale = 2.6 - 1.6 * smooth( sunPhase );
					drop.style.transform =
						'translate(' + ( -34 * sunMotion * sunMotion ) + 'vw,' +
						( -sunHeight * sunMotion ) + 'vh) scale(' + sunScale + ')';
					drop.style.visibility = curtainDistance >= 200 ? 'visible' : 'hidden';

					/* Apricot until 50px; yellow by 60%. */
					var sunColour = smooth( clamp(
						( sunDistance - 50 ) / Math.max( 1, sunRange * 0.6 - 50 ), 0, 1
					) );
					var sunFrom = [ 255, 177, 140 ];
					var sunTo = [ 255, 227, 82 ];
					drop.style.backgroundColor = 'rgb(' + sunFrom.map( function ( channel, index ) {
						return Math.round( channel + ( sunTo[ index ] - channel ) * sunColour );
					} ).join( ',' ) + ')';

				}

				if ( 'IntersectionObserver' in window ) {
					new IntersectionObserver( function ( entries ) {
						var sleeping = !entries[ 0 ].isIntersecting;
						stage.classList.toggle( 'effects-sleeping', sleeping );
						if ( sleeping ) {
							clearTimeout( flockTimer );
							flockTimer = null;
						} else {
							lastPhase = -1;
							motion.queue();
						}
					}, { rootMargin: '200px' } ).observe( stage );
				}
				/* Establish the opening synchronously; some engines defer the first RAF. */
				measure();
				render();
				motion.add( null, render );
				motion.measure( measure );
				if ( 'ResizeObserver' in window ) {
					new ResizeObserver( motion.invalidate ).observe( track );
				}
				if ( document.fonts ) {
					document.fonts.ready.then( function () {
						depthMeasureKey = '';
						motion.invalidate();
					} );
				}
			} )();
			( function () {
				var jump = window.__jumpTo;
				window.__jumpTo = function ( target, speed ) {
					if ( target && target.id === 'track' ) {
						var stage = document.querySelector( '.stage' );
						var reduced = matchMedia( '(prefers-reduced-motion:reduce)' ).matches;
						var y = reduced ?
							target.getBoundingClientRect().top + scrollY :
							stage.offsetTop + stage.offsetHeight - innerHeight;
						scrollTo( {
							top: y,
							behavior: reduced ? 'instant' : 'smooth',
						} );
						return;
					}
					jump( target, speed );
				};
			} )();
		