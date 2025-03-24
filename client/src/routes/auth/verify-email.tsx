import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, AlertCircle, Loader2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const email = new URLSearchParams(location.search).get('email');
  const token = new URLSearchParams(location.search).get('token');
  const type = new URLSearchParams(location.search).get('type');
  const isGmail = email?.toLowerCase().endsWith('@gmail.com');
  const gmailUrl = 'https://mail.google.com/mail/u/0/#inbox';

  useEffect(() => {
    const verifyEmailAndSignIn = async () => {
      if (token && type === 'signup') {
        setIsVerifying(true);
        try {
          // Verify the email
          const { error: verifyError } = await supabase.auth.verifyOtp({
            email: email || '',
            token,
            type: 'signup'
          });

          if (verifyError) throw verifyError;

          // If verification successful, redirect to syllabus upload
          navigate('/user/syllabus-upload');
        } catch (error) {
          console.error('Verification error:', error);
          setVerificationError(
            error instanceof Error ? error.message : 'Failed to verify email'
          );
        } finally {
          setIsVerifying(false);
        }
      }
    };

    verifyEmailAndSignIn();
  }, [token, type, navigate]);

  if (isVerifying) {
    return (
      <div className="max-w-lg w-full mx-auto p-4">
        <Card className="shadow-lg border-2">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-lg font-medium">Verifying your email...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationError) {
    return (
      <div className="max-w-lg w-full mx-auto p-4">
        <Card className="shadow-lg border-2">
          <CardContent className="py-8">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Verification failed</p>
                <p className="text-sm text-muted-foreground">{verificationError}</p>
              </div>
              <Link 
                to="/auth/sign-in"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto p-4">
      <Card className="shadow-lg border-2">
        <CardHeader className="text-center space-y-6 pb-6">
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold py-3">Check your email</CardTitle>
            <CardDescription className="text-base px-4">
              We've sent a verification link to
              <div className="font-medium text-foreground mt-1 break-words">
                {email}
              </div>
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Click the verification link in the email to activate your account.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-2">Can't find the email?</p>
                  <ul className="list-disc list-inside space-y-1.5">
                    <li>Check your spam folder</li>
                    <li>Make sure the email address is correct</li>
                    <li>The link expires in 24 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Actions */}
          <div className="flex flex-col items-center gap-4 pt-2">
            {isGmail && (
              <Button
                variant="default"
                size="lg"
                className="w-full max-w-xs"
                onClick={() => window.open(gmailUrl, '_blank')}
              >
                Open Gmail
              </Button>
            )}
            <Link 
              to="/auth/sign-in" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
