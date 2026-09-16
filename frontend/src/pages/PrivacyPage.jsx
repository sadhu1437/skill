import './legal.css'

const sections = [
  ['1. Information We Collect', <><p>SkillBloom may collect information you provide when you create an account, contact us, publish content through an authorized panel, or use account features.</p><ul><li>Account details such as email address, username, and password hash.</li><li>Profile information and optional profile images.</li><li>Comments, articles, interview content, and other content you submit.</li><li>Messages or support requests that you send to us.</li></ul><p>We may also collect technical information such as browser type, device information, approximate location, IP address, pages visited, and request or error logs.</p></>],
  ['2. How We Use Information', <><p>We use collected information to:</p><ul><li>Provide, operate, and maintain SkillBloom.</li><li>Create and authenticate user accounts.</li><li>Display jobs, interview questions, learning resources, articles, and related content.</li><li>Process comments, likes, bookmarks, and other user actions.</li><li>Respond to support requests and communicate service updates.</li><li>Protect the platform against fraud, abuse, unauthorized access, and security threats.</li><li>Understand usage patterns and improve performance, content, and accessibility.</li><li>Display advertising where enabled and permitted by applicable law.</li></ul></>],
  ['3. Authentication and Account Security', <p>Passwords are stored using Django's password hashing system. Authentication tokens and security controls are used to protect account features. You are responsible for keeping your credentials private and should notify us if you believe your account has been accessed without permission.</p>],
  ['4. Cookies and Local Storage', <p>SkillBloom may use cookies, browser storage, and similar technologies to maintain authentication, remember preferences, improve performance, measure usage, and support advertising. You can control cookies through your browser settings, but disabling them may affect login and other functionality.</p>],
  ['5. Advertising and Google AdSense', <><p>SkillBloom may display advertisements through Google AdSense. Google and its advertising partners may use cookies or similar technologies to show, measure, and personalize ads according to their policies and applicable consent requirements.</p><p>SkillBloom does not control the content of third-party advertisements and does not endorse every advertised product or service.</p></>],
  ['6. Sharing of Information', <><p>We do not sell your personal information. Information may be shared when reasonably necessary with service providers that host, secure, monitor, or operate the platform; authentication, analytics, advertising, email, and storage providers; authorities when required by law; or a successor entity involved in a merger or transfer of assets.</p></>],
  ['7. Third-Party Links and Services', <p>SkillBloom may link to company career pages, PDF resources, social networks, videos, advertisements, and other third-party services. Those services have their own privacy policies and terms. SkillBloom is not responsible for their content, security, availability, or data practices.</p>],
  ['8. Data Retention', <p>We retain information for as long as reasonably necessary to provide the service, maintain security and records, resolve disputes, enforce agreements, and comply with legal obligations.</p>],
  ['9. Your Choices and Rights', <><p>Depending on your location, you may have rights to access, correct, export, restrict, or delete certain personal information. You may also request account closure or object to certain processing.</p><p>Contact us through the Contact page for a privacy request. We may need to verify your identity before completing it.</p></>],
  ['10. Children’s Privacy', <p>SkillBloom is not intended to knowingly collect personal information from children in violation of applicable law. Contact us if you believe a child has provided personal information to us.</p>],
  ['11. Data Security', <p>We use administrative, technical, and organizational safeguards designed to protect information. No internet transmission or storage system can be guaranteed to be completely secure.</p>],
  ['12. Changes to This Policy', <p>We may update this Privacy Policy when the service, law, or our practices change. The updated version will be published on this page with a revised effective date.</p>],
]

export default function PrivacyPage() {
  return (
    <main className="content-page legal-page">
      <header className="legal-hero">
        <p className="legal-kicker">SkillBloom policies</p>
        <h1>Privacy Policy</h1>
        <p>How SkillBloom collects, uses, protects, and manages information when you use this website.</p>
        <div className="legal-meta">
          <span>Effective date: September 15, 2026</span>
          <span>Last updated: September 15, 2026</span>
        </div>
      </header>
      <article className="content-panel privacy-panel">
        <p className="privacy-intro">Your privacy matters to SkillBloom. This policy explains the information practices for the SkillBloom website, account features, learning resources, jobs, interview questions, Explore content, comments, and advertising.</p>
        {sections.map(([title, content]) => <section key={title}><h2>{title}</h2>{content}</section>)}
        <section>
          <h2>13. Contact Us</h2>
          <p>For privacy questions, requests, or concerns, contact SkillBloom through the Contact page or email <a href="mailto:ytsmart143@gmail.com">ytsmart143@gmail.com</a>.</p>
        </section>
      </article>
    </main>
  )
}
