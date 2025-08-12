import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { LogIn, Mail, Eye, EyeOff, Loader2, ArrowLeft, Lock, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const getRedirectPath = () => {
    const storedPath = localStorage.getItem('auth_redirect_path');
    localStorage.removeItem('auth_redirect_path');
    return storedPath || '/';
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signIn();
      setLocation(getRedirectPath());
    } catch (error: any) {
      console.error('Google sign in error:', error);
      if (error.message !== 'Sign-in was cancelled by user') {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      setLocation(getRedirectPath());
    } catch (error: any) {
      console.error('Email login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later');
          break;
        default:
          setError('Failed to sign in. Please check your credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, formData.email);
      setSuccessMessage('Password reset email sent! Please check your inbox.');
      setShowResetPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address');
          break;
        default:
          setError('Failed to send password reset email. Please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="text-muted-foreground hover:text-foreground dark:text-slate-300 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">
            Sign in to your account to continue building your resume
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-background/80 backdrop-blur-sm dark:bg-slate-800/90 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-center text-xl text-foreground dark:text-white">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In Button */}
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full bg-white hover:bg-gray-50 dark:bg-slate-700 dark:hover:bg-slate-600 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 font-medium shadow-sm hover:shadow-md transition-all duration-200" 
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-slate-800 px-2 text-muted-foreground dark:text-slate-400">
                  Or continue with email
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {successMessage && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground dark:text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground dark:text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground dark:text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 pr-10 bg-background dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-slate-400 focus:border-blue-500 dark:focus:border-blue-400"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent dark:text-slate-400 dark:hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  disabled={isLoading}
                  className="text-sm text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 p-0 h-auto"
                >
                  Forgot your password?
                </Button>
              </div>

              {/* Password Reset Form */}
              {showResetPassword && (
                <div className="space-y-4 p-4 border border-border dark:border-slate-600 rounded-lg bg-muted/50 dark:bg-slate-700/50">
                  <div className="text-center">
                    <h3 className="font-semibold text-sm text-foreground dark:text-white">Reset Password</h3>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">
                      Enter your email to receive a password reset link
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handlePasswordReset}
                      disabled={isLoading}
                      className="flex-1"
                      size="sm"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowResetPassword(false)}
                      disabled={isLoading}
                      size="sm"
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Sign In
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:text-primary/80 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 