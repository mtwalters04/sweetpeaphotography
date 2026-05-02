import { NavBar } from './nav-bar';

// NavBar reads auth client-side so this layout slot stays static and
// public pages don't get forced into dynamic rendering.
export function Nav() {
  return <NavBar />;
}
