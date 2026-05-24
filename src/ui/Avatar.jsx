import { iniciales, avatar } from "./styles.js";

export default function Avatar({ name }) {
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatar(name)}`}>
      {iniciales(name)}
    </div>
  );
}
