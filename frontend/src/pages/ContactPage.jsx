import './contact.css'

export default function ContactPage() {
  return (
    <div className="section__container contact-page" id="contact">
      <h2 className="section__header">Contact <span>Us</span></h2>
      <p className="section__description">We’re happy to hear from you! Fill out the form and we’ll respond shortly.</p>

      <form className="contact__form" action="mailto:ytsmart143@gmail.com" method="post" encType="text/plain">
        <div className="form__group">
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="Name" required />
        </div>
        <div className="form__group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="Email" required />
        </div>
        <div className="form__group">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="Message" rows="5" required></textarea>
        </div>
        <button type="submit" className="btn">Send Message</button>
      </form>
    </div>
  )
}
