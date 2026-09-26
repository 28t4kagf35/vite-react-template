import TvindefossenPage from "./pages/TvindefossenPage";

// Stack proof: this page's content is fetched live from Sanity
// (see ./sanity.ts); the layout, typography and imagery come from the
// crystallized Replit design, carried over verbatim in ./pages/TvindefossenPage.tsx.
//
// Scope for today: Tvindefossen only, no navbar yet. The unused Hono API
// worker this template ships with (../worker/index.ts) is untouched.
function App() {
  return <TvindefossenPage />;
}

export default App;
