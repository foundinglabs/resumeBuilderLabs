import React, { useState } from 'react';
import { AuthForms } from '@/components/AuthForms';
import { GoogleSignInButton } from '@/components/GoogleSignInButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail } from 'lucide-react';
import { useLocation } from 'wouter';

export default function LoginPage() {
  const [authMode, setAuthMode] = useState<'email' | 'google'>('email');
  const [, setLocation] = useLocation();

  const handleAuthSuccess = () => {
    setLocation('/builder');
  };

  const handleSwitchMode = (mode: 'login' | 'signup') => {
    // This can be used to track analytics or show different content
    console.log('Switched to:', mode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
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

                 {/* Login Card */}
         <Card className="border-2 hover:border-blue-300 transition-colors">
           <CardHeader className="text-center">
             <CardTitle className="text-2xl">Login to Your Account</CardTitle>
             <p className="text-muted-foreground">
               Sign in to continue building your resume
             </p>
           </CardHeader>
           <CardContent className="space-y-4">
             {/* Email/Password Login */}
             <AuthForms
               onAuthSuccess={handleAuthSuccess}
               onSwitchMode={handleSwitchMode}
               defaultMode="login"
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

                           {/* Google Sign-in */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Sign in quickly with your Google account
                </p>
                <GoogleSignInButton 
                  text="Sign in with Google"
                  onSuccess={handleAuthSuccess} 
                />
              </div>
           </CardContent>
         </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By signing in, you agree to our{' '}
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