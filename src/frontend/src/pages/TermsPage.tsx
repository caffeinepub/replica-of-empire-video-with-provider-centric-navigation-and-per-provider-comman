import { ScrollArea } from '@/components/ui/scroll-area';

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Terms & Conditions</h1>
            <p className="text-sm text-muted-foreground">Last updated: February 9, 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Empire C.C, you accept and agree to be bound by the terms and provisions of this agreement. 
              If you do not agree to these terms, please do not use this application.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily use Empire C.C for personal, non-commercial purposes. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained in Empire C.C</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">3. API Keys and Third-Party Services</h2>
            <p className="text-muted-foreground">
              Empire C.C allows you to connect to third-party AI provider services using your own API keys. 
              You are solely responsible for:
            </p>
            <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Maintaining the security and confidentiality of your API keys</li>
              <li>All activities that occur under your API keys</li>
              <li>Compliance with the terms of service of third-party providers</li>
              <li>Any costs or charges incurred through the use of third-party services</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">4. Privacy and Data Storage</h2>
            <p className="text-muted-foreground">
              Your data, including API keys, chat history, and workflow runs, is stored on the Internet Computer blockchain. 
              While we implement security measures to protect your data, you acknowledge that no method of transmission over 
              the internet is 100% secure. You are responsible for maintaining the security of your Internet Identity credentials.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">5. Disclaimer</h2>
            <p className="text-muted-foreground">
              The materials within Empire C.C are provided on an 'as is' basis. We make no warranties, expressed or implied, 
              and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions 
              of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">6. Limitations</h2>
            <p className="text-muted-foreground">
              In no event shall Seale's Empire or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use 
              Empire C.C, even if we or our authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">7. Accuracy of Materials</h2>
            <p className="text-muted-foreground">
              The materials appearing in Empire C.C could include technical, typographical, or photographic errors. 
              We do not warrant that any of the materials are accurate, complete, or current. We may make changes to the 
              materials at any time without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">8. Links</h2>
            <p className="text-muted-foreground">
              We have not reviewed all of the sites linked to Empire C.C and are not responsible for the contents of any such linked site. 
              The inclusion of any link does not imply endorsement by us. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">9. Modifications</h2>
            <p className="text-muted-foreground">
              We may revise these terms of service at any time without notice. By using Empire C.C, you are agreeing to be bound 
              by the then current version of these terms of service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">10. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with applicable laws, and you irrevocably 
              submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">11. Contact Information</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms & Conditions, please contact us through the application's support channels.
            </p>
          </section>
        </div>
      </ScrollArea>
    </div>
  );
}
