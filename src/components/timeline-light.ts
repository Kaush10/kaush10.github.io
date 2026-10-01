import { motionValue } from "motion/react";

// Whether the timeline's light has reached the end of the page and lit the
// spotlight there: 0 until then, 1 for good after. Once it's 1 the spine stays
// filled and every entry stays lit, even scrolling back up, because the light
// at the bottom is still on.
export const timelineLit = motionValue(0);
