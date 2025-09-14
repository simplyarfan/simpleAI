import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Mail, 
  Brain,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

const VerifyEmail = () => {
  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();
  
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [error, setError] = useState('');

  // Get email from URL params or allow manual entry
  useEffect(() => {
    const emailParam = router.query.email;
    const tokenParam = router.query.token;
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // If token is in URL, auto-verify
    if (tokenParam) {
      handleAutoVerify(tokenParam);
    }
  }, [router.query]);

  const handleAutoVerify = async (token) => {
    setIsVerifying(true);
    
    const result = await verifyEmail(token);
    
    if (result.success) {
      setVerificationSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } else {
      setError(result.error || 'Verification failed');
    }
    
    setIsVerifying(false);
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    setIsVerifying(true);
    setError('');
    
    const result = await verifyEmail(verificationCode);
    
    if (result.success) {
      setVerificationSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } else {
      setError(result.error || 'Verification failed');
    }
    
    setIsVerifying(false);
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsResending(true);
    setError('');
    
    const result = await resendVerification(email);
    
    if (!result.success) {
      setError(result.error || 'Failed to resend verification email');
    }
    
    setIsResending(false);
  };

  if (verificationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Email Verified Successfully!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account has been verified. Redirecting to login...
          </p>
          
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-4"></div>
            <Link
              href="/auth/login"
              className="font-medium text-green-600 hover:text-green-500"
            >
              Click here if not redirected automatically
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-7 h-7 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a verification link to your email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {/* Auto-verification in progress */}
          {isVerifying && router.query.token && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}

          {/* Manual verification form */}
          {!router.query.token && (
            <>
              {/* Email check/resend section */}
              <div className="mb-6">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Check your email
                    </p>
                    <p className="text-sm text-blue-700">
                      We sent a verification link to {email || 'your email address'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email input for resending */}
              {!email && (
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@securemaxtech.com"
                  />
                </div>
              )}

              {/* Manual verification code input */}
              <form onSubmit={handleManualVerify} className="space-y-6">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                    Or enter verification code manually
                  </label>
                  <div className="mt-1">
                    <input
                      id="verificationCode"
                      name="verificationCode"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter verification code from email"
                    />
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="flex items-center p-3 bg-red-50 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Verify button */}
                <div>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isVerifying ? (
                      <>
                        <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                          <div className="rounded-full h-5 w-5 border-b-2 border-white"></div>
                        </div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify Email
                        <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Resend verification */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Didn't receive the email? Check your spam folder or
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <>
                      <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700">
                        <div className="rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                      </div>
                      Resending...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Resend verification email
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Verification Instructions:
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your email for a verification link</li>
            <li>• Click the link to verify your account</li>
            <li>• Or copy and paste the verification code above</li>
            <li>• Check your spam/junk folder if you don't see the email</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;