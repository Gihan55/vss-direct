// Temp bridge: expose the app's own React instance from inside Vite's SSR
// module graph, so the harness renders with the exact same copy the app uses.
import * as ReactNS from 'react';
import * as ServerNS from 'react-dom/server';

export const React = ReactNS.default ?? ReactNS;
export const ReactDOMServer = ServerNS.default ?? ServerNS;
