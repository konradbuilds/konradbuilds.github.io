# Image format compatibility

The browser chooses a supported source inside picture. WebP remains first; the JPEG img is the compatibility fallback. Unsupported browsers skip the WebP source by MIME type. No user-agent sniffing, feature-detection script, onerror handler, base64 asset or fetch workaround.

The JPGs are intentionally baseline for old decoders. Images retain dimensions and loading priorities. Project pictures fill the existing screenshot anchors; avatar pictures preserve the fixed image dimensions and flex layout.

A picture fallback handles unsupported formats, not a broken URL for a supported format. Assets and HTML are published atomically to avoid missing fallback files.

Automated proof deliberately marks the WebP source as unsupported and confirms JPEG currentSrc, successful decoding and JPEG-only requests. Normal mode confirms WebP-only requests. Native Safari 13 remains a real-device check.
