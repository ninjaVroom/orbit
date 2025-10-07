'use client';
import { useRef, useState, type FormEvent } from 'react';

type Errors = Partial<Record<'name' | 'email' | 'message', string>>;

function validate(f: FormData): Errors {
  const e: Errors = {};
  if (!String(f.get('name')).trim()) e.name = 'Add your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(f.get('email')))) e.email = 'That email doesn’t look right.';
  if (!String(f.get('message')).trim()) e.message = 'Add a message, even a short one.';
  return e;
}

export function ContactForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [email, setEmail] = useState('');
  const summary = useRef<HTMLDivElement>(null);
  const done = useRef<HTMLDivElement>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get('company')) return; // honeypot
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) { requestAnimationFrame(() => summary.current?.focus()); return; }
    setState('sending');
    setEmail(String(f.get('email')));
    // no mail backend in the demo; wire a route handler to an email API when this goes live.
    setTimeout(() => { setState('sent'); requestAnimationFrame(() => done.current?.focus()); }, 900);
  };

  if (state === 'sent') {
    return (
      <div className="contact-form" ref={done} tabIndex={-1}>
        <h2>thanks. your message is in.</h2>
        <p className="muted">In the live version I’d reply to {email}. This demo doesn’t send email, so nothing left your browser.</p>
      </div>
    );
  }

  const field = (name: keyof Errors, label: string, input: React.ReactNode) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {input}
      {errors[name] && <p className="field-error" id={`${name}-err`}>{errors[name]}</p>}
    </div>
  );
  const aria = (n: keyof Errors) => ({ 'aria-invalid': !!errors[n], 'aria-describedby': errors[n] ? `${n}-err` : undefined });

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      {Object.keys(errors).length > 0 && (
        <div className="contact-summary" ref={summary} tabIndex={-1} role="alert">
          Fix {Object.keys(errors).length === 1 ? 'one thing' : `${Object.keys(errors).length} things`} before sending.
        </div>
      )}
      {field('name', 'your name', <input id="name" name="name" autoComplete="name" {...aria('name')} />)}
      {field('email', 'email', <input id="email" name="email" type="email" autoComplete="email" {...aria('email')} />)}
      <div className="field">
        <label htmlFor="topic">what it’s about</label>
        <select id="topic" name="topic"><option>a question about orbit</option><option>hiring</option><option>something else</option></select>
      </div>
      {field('message', 'message', <textarea id="message" name="message" rows={5} {...aria('message')} />)}
      <input className="hp" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="actions">
        <button className="btn btn--primary btn--lg" aria-busy={state === 'sending'} disabled={state === 'sending'}>
          {state === 'sending' ? 'sending…' : 'send message'}
        </button>
      </div>
    </form>
  );
}
