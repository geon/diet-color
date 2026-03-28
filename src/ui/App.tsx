import { stylize } from "./stylize.js";
import cssModule from "./App.module.css";

const style = stylize(cssModule, "base");

export function App() {
    return (
        <div className={style()}>
        </div>
    );
}
