import ContactForm from "@/components/ContactForm";

export const metadata = { title: "Contact · VARDE" };

export default function Contact() {
  return (
    <main className="page contact">
      <div className="ct-grid">
        <div>
          <p className="eyebrow">Client care</p>
          <h1 className="display">We&apos;re here <em>to help.</em></h1>
          <p className="lead">Questions about sizing, an order, or a repair? Write to us and a real person replies within one working day.</p>
          <dl className="ct-info">
            <div><dt>Email</dt><dd>care@varde.example</dd></div>
            <div><dt>Hours</dt><dd>Monday to Friday, 9:00 to 18:00</dd></div>
            <div><dt>Studio</dt><dd>Visits by appointment</dd></div>
          </dl>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
