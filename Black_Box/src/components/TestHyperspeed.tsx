import React, { lazy } from 'react';

const LazyHyperspeed = lazy(() => import('./Hyperspeed'));

export default React.memo(LazyHyperspeed);
