import React from 'react';
import { AuthForms } from '@/components/AuthForms';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useLocation } from 'wouter';

export default function SignupPage() {
  const [, setLocation] = useLocation();

  const handleAuthSuccess = () => {
    setLocation('/builder');
  };

  const handleSwitchMode = (mode: 'login' | 'signup') => {
    if (mode === 'login') {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

                 {/* Signup Card */}
         <Card className="border-2 hover:border-green-300 transition-colors">
           <CardHeader className="text-center">
             <CardTitle className="flex items-center justify-center gap-2 text-2xl">
               <UserPlus className="h-6 w-6" />
               Create Account
             </CardTitle>
             <p className="text-muted-foreground">
               Join ResumeBuilder to create your perfect resume
             </p>
           </CardHeader>
           <CardContent className="space-y-4">
             {/* Email/Password Signup */}
             <AuthForms
               onAuthSuccess={handleAuthSuccess}
               onSwitchMode={handleSwitchMode}
               defaultMode="signup"
             />

             {/* Divider */}
             <div className="relative">
               <div className="absolute inset-0 flex items-center">
                 <Separator className="w-full" />
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                 <span className="bg-white px-2 text-muted-foreground">
                   Or continue with
                 </span>
               </div>
             </div>

                           {/* Google Sign-up */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Sign up quickly with your Google account
                </p>
                <GoogleSignInButton 
                  text="Sign up with Google"
                  onSuccess={handleAuthSuccess} 
                />
              </div>
           </CardContent>
         </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By creating an account, you agree to our{' '}
            <Button variant="link" className="p-0 h-auto text-sm">
              Terms of Service
            </Button>{' '}
            and{' '}
            <Button variant="link" className="p-0 h-auto text-sm">
              Privacy Policy
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
} 