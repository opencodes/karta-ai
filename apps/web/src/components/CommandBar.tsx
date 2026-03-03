import { FormEvent, RefObject, useState } from 'react';

type CommandBarProps = {
  onSubmit: (value: string) => void;
  inputRef?: RefObject<HTMLInputElement>;
};

export function CommandBar({ onSubmit, inputRef }: CommandBarProps) {
  const [value, setValue] = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue('');
  }

  return (
    <form className="command-shell" onSubmit={handleSubmit}>
      <span className="prompt">Karta {'>'}</span>
      <input
        ref={inputRef}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Give one instruction, e.g. Pay electricity bill tomorrow 4pm"
        aria-label="Create task"
      />
      <span className="shortcut">Cmd/Ctrl + K</span>
      <button type="submit">Execute</button>
    </form>
  );
}
