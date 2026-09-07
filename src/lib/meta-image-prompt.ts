export const META_IMAGE_MODEL = "muse-image-1.0";

export const META_IMAGE_PROMPT = `DETERMINISTIC MODE - 100% REPRODUCIBILITY LOCK: This is 100% deterministic non-generative technical tracing with ZERO creativity, ZERO variation. Same image + same prompt = 100% pixel-identical output every time, any account, anywhere. Temperature=0, seed=fixed, no randomness. Every stroke must be traced from source, 0.01% outside-prompt addition invalid.

STEP 0 - AUTO-DETECT & CLEAN: Detect if source is Type A (black ink on white paper) or Type B (white ink on black paper - inverted). Remove 100%: watermark bar (shutterstock text bar at bottom/top), paper texture, background, shadows, JPEG artifacts, grid lines. Crop edge-to-edge to artwork only, correct perspective/skew, fill background with solid #0A1931 navy. If Type B inverted, treat white as artwork.

STEP 1 - V4.2.1 SHARP FLAT GOLD V2 WITH FAINT-DETAIL RECOVERY: Perform precise 3x ultra high resolution forensic tracing. Keep 100% identical composition, count, positioning — no addition, no deletion, no new motifs.

GENERIC FILL-LOCK:
- For ANY closed solid black mass (or white solid mass if inverted) — including peacock body patch, elephant head patch, floral bunch that is solid filled, paisley solid, lotus heart, leaf cluster that is filled — Render as SOLID FLAT filled golden yellow #FFD700, NOT as outline. Preserve internal details inside solid as thin #0A1931 navy negative lines.
- For ANY open thin stroke, vine, stem, branch, swirl, feather strand, trunk wrinkle, geometric outline: Render as solid #FFD700 stroke matching exact curve but boosted thickness for sharpness, 100% opaque.
- For ANY tiny dot, sequin, eye dot, butti, center dot: Solid #FFD700 dot matching exact position, 100% opacity.
- For ANY border band that is solid: Render as solid flat #FFD700 band with internal lines as #0A1931 negatives.

CRITICAL FLAT GOLD SHARP LOCK:
All artwork areas must become 100% flat uniform opaque solid #FFD700 with ZERO paper texture, ZERO ink texture, ZERO shading, ZERO transparency, ZERO gradient, full opacity. Vector-sharp crisp edges, high contrast. No faded look.

FORENSIC FAINT-LINE & MICRO-REPAIR RULE (Fix for previous misses):
- Scan for extremely faint 3-15% low-contrast thin lines, especially inside flower buds (striped buds), inside feather eyes, inside leaf veins, inside vine tips — boost to 100% #FFD700 and include, do NOT discard.
- 4-5px micro-repair: If a thin line is broken due to scan blur with gap <=5px, reconnect with straight line of same thickness. No new branches.
- NO LEAF MERGING: For dense leaf/vine clusters, keep minimum 3px gap between leaves. Each leaf separate. Do NOT merge 8-10 tiny leaves into solid blob.
- NO SOLID BLOBS WHERE SOURCE HAS STRIPES: If a bud/flower has internal radial stripes/lines in source, render bud as solid gold BUT preserve those stripes as #0A1931 navy negative lines inside, plus center dot. Do NOT fill as solid blob.
- Internal patterns inside peacocks (zigzag, scales, dots, feather lines) -> render as #0A1931 negatives inside gold fill.

ANTI-HALLUCINATION:
No new flowers, paisleys, vines, feathers, dots beyond what is in source. Exact count of feathers, petals, leaves, dots must match source. No AI decorative fill. Background #0A1931 solid navy, artwork 100% flat solid opaque bright #FFD700 with #0A1931 internal negatives, vector-sharp. Pixel-identical on every execution.

BORDER RULE:
- All art line should be 1 pixel in width, no hair line, no gradients

ANTI-HAIRLINE LOCK (V4.2.1 V3.1 - MINIMAL ADDITION):
- ABSOLUTELY NO hairlines, NO cross-hatching, NO crosshatch, NO stippling, NO dotted texture, NO engraving lines, NO woodcut shading, NO etched shading lines, NO parallel double lines inside solid #FFD700.
- Solid gold must stay 100% flat - if source has 1 line, output 1 line only, never add extra fine lines for texture.

OUTPUT: Flat vector-like gold motif on solid navy, sharp, bright, no paper visible. Ultra-conservative trace. Minimum creativity, maximum fidelity.`;
