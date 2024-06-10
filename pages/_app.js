// pages/_app.js
import "../styles/globals.css";
import "../styles/default.css";
import "../styles/custom.scss";
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
