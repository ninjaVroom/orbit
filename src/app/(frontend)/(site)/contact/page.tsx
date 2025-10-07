import type { Metadata } from 'next';
import { ContactForm } from './form';

export const metadata: Metadata = { title: 'contact', description: 'Questions, feedback, or a job you think I’d be right for.' };

export default function Contact() {
  return (
    <>
      <header className="container page-hero">
        <h1>get in touch</h1>
      </header>
      <section className="container contact">
        <div className="contact-facts">
          <p className="lead muted">Questions, feedback, or a job you think I’d be right for.</p>
          <p>Based in Toronto, on Eastern time. Happy to talk remote or hybrid anywhere in Canada.</p>
        </div>
        <ContactForm />
      </section>
    </>
  );
}
