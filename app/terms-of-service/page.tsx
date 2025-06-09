"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsOfServicePage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container max-w-4xl mx-auto py-8 px-4"
    >
      <motion.div variants={item} className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing or using Cashlyzer, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations. If you do not agree with any of these terms, 
              you are prohibited from using or accessing this site.
            </p>
            <p>
              The materials contained in this website are protected by applicable copyright and 
              trademark law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Use License</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Permission is granted to temporarily use Cashlyzer for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title, 
              and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained in Cashlyzer</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
            <p>
              This license shall automatically terminate if you violate any of these restrictions 
              and may be terminated by Cashlyzer at any time.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              To use certain features of Cashlyzer, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account and password</li>
              <li>Promptly update any changes to your account information</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to disable any user account at any time if, in our opinion, 
              you have failed to comply with any of the provisions of these Terms of Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              When using Cashlyzer, you agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service only for lawful purposes</li>
              <li>Not use the service to store or transmit malicious code</li>
              <li>Not attempt to gain unauthorized access to any portion of the service</li>
              <li>Not interfere with or disrupt the service or servers connected to the service</li>
              <li>Not use the service to store or transmit any material that is illegal or violates third-party rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By using Cashlyzer, you acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for the accuracy of all financial information entered</li>
              <li>The service is not a substitute for professional financial advice</li>
              <li>We do not guarantee the accuracy of financial calculations or projections</li>
              <li>You should verify all financial information independently</li>
              <li>We are not responsible for any financial decisions made based on the service</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The materials on Cashlyzer are provided on an 'as is' basis. Cashlyzer makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other 
              warranties including, without limitation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Implied warranties of merchantability</li>
              <li>Fitness for a particular purpose</li>
              <li>Non-infringement of intellectual property</li>
              <li>Other violation of rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              In no event shall Cashlyzer or its suppliers be liable for any damages (including, 
              without limitation, damages for loss of data or profit, or due to business interruption) 
              arising out of the use or inability to use the materials on Cashlyzer.
            </p>
            <p>
              Because some jurisdictions do not allow limitations on implied warranties, or 
              limitations of liability for consequential or incidental damages, these limitations 
              may not apply to you.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revisions and Errata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The materials appearing on Cashlyzer could include technical, typographical, or 
              photographic errors. Cashlyzer does not warrant that any of the materials on its 
              website are accurate, complete, or current.
            </p>
            <p>
              Cashlyzer may make changes to the materials contained on its website at any time 
              without notice. Cashlyzer does not, however, make any commitment to update the materials.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cashlyzer has not reviewed all of the sites linked to its website and is not 
              responsible for the contents of any such linked site. The inclusion of any link 
              does not imply endorsement by Cashlyzer of the site.
            </p>
            <p>
              Use of any such linked website is at the user's own risk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cashlyzer may revise these terms of service for its website at any time without 
              notice. By using this website, you are agreeing to be bound by the then current 
              version of these terms of service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These terms and conditions are governed by and construed in accordance with the 
              laws and you irrevocably submit to the exclusive jurisdiction of the courts in 
              that location.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>By email: support@cashlyzer.com</li>
              <li>By visiting the contact page on our website</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
} 