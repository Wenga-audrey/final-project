import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@shared/api";
import {
  Mail,
  Lock,
  ArrowLeft,
  Shield,
  Key,
  CheckCircle,
  AlertCircle,
  Send,
  Clock,
  User
} from "@/lib/icons";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // email, sent, reset
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate sending reset code
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you would call the API here:
      // const response = await api.post('/api/auth/forgot-password', { email });

      setStep("sent");
    } catch (err) {
      setError("Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate code verification
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you would call the API here:
      // const response = await api.post('/api/auth/verify-reset-code', { email, code: resetCode });

      // For demo purposes, accept any 6-digit code
      if (resetCode.length === 6 && /^\d+$/.test(resetCode)) {
        setStep("reset");
      } else {
        setError("Invalid verification code. Please check and try again.");
      }
    } catch (err) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real app, you would call the API here:
      // const response = await api.post('/api/auth/reset-password', { 
      //   email, 
      //   code: resetCode, 
      //   newPassword 
      // });

      setSuccess(true);

      // Redirect to sign in after a short delay
      setTimeout(() => {
        navigate("/signin");
      }, 3000);
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
        <Header />
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-mindboost-green" />
              </div>
              <h1 className="text-3xl font-black text-gray-900 mb-4">
                Password Reset Successful!
              </h1>
              <p className="text-gray-700 mb-6">
                Your password has been successfully updated. You can now sign in with your new password.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-mindboost-green h-2.5 rounded-full animate-pulse" style={{ width: "100%" }}></div>
              </div>
              <p className="text-sm text-gray-600">
                Redirecting to sign in page...
              </p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      <Header />

      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full space-y-8">
            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                to="/signin"
                className="inline-flex items-center text-mindboost-green hover:text-mindboost-dark-green font-semibold"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>

            {/* Step 1: Email Input */}
            {step === "email" && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    Reset Password
                  </h2>
                  <p className="mt-2 text-gray-700">
                    Enter your email address and we'll send you a reset link
                  </p>
                </div>

                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8">
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green transition-all"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold py-3 text-lg shadow-xl hover:shadow-2xl transition-all"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Reset Code
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Code Verification */}
            {step === "sent" && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    Check Your Email
                  </h2>
                  <p className="mt-2 text-gray-700">
                    We've sent a verification code to{" "}
                    <span className="font-semibold">{email}</span>
                  </p>
                </div>

                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8">
                    <div className="mb-6 p-4 bg-mindboost-green/10 border border-mindboost-green/20 rounded-xl flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-mindboost-green" />
                      <span className="text-mindboost-green font-semibold">
                        Email sent successfully!
                      </span>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    )}

                    <form
                      onSubmit={handleCodeVerification}
                      className="space-y-6"
                    >
                      <div>
                        <Label htmlFor="resetCode" className="block text-sm font-bold text-gray-900 mb-2">
                          Verification Code
                        </Label>
                        <Input
                          type="text"
                          id="resetCode"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green transition-all text-center text-2xl font-bold tracking-widest"
                          placeholder="000000"
                          maxLength={6}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold py-3 text-lg shadow-xl hover:shadow-2xl transition-all"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                            Verifying...
                          </div>
                        ) : (
                          "Verify Code"
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <p className="text-gray-700 text-sm">
                        Didn't receive the code?{" "}
                        <button
                          onClick={() => setStep("email")}
                          className="text-mindboost-green hover:text-mindboost-dark-green font-semibold"
                        >
                          Resend
                        </button>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="bg-mindboost-green/5 rounded-xl p-4 border border-mindboost-green/10">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-mindboost-green" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        Code expires in 10 minutes
                      </p>
                      <p className="text-gray-600 text-xs">
                        For demo purposes, use code: 123456
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === "reset" && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6">
                    <Key className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900">
                    Create New Password
                  </h2>
                  <p className="mt-2 text-gray-700">
                    Choose a strong password for your account
                  </p>
                </div>

                <Card className="border-0 shadow-xl">
                  <CardContent className="p-8">
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                      </div>
                    )}

                    <form onSubmit={handlePasswordReset} className="space-y-6">
                      <div>
                        <Label htmlFor="newPassword" className="block text-sm font-bold text-gray-900 mb-2">
                          New Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green transition-all"
                            placeholder="Create a strong password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>

                        {newPassword && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Password Strength</span>
                              <span>{strengthLabels[passwordStrength - 1] || "Very Weak"}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${strengthColors[passwordStrength - 1] || "bg-red-500"}`}
                                style={{ width: `${passwordStrength * 25}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-900 mb-2">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green transition-all"
                            placeholder="Confirm your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold py-3 text-lg shadow-xl hover:shadow-2xl transition-all"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                            Updating Password...
                          </div>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Security Info */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-mindboost-green to-mindboost-dark-green relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative flex flex-col justify-center items-center text-white p-12">
            <div className="max-w-lg text-center space-y-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-10 w-10 text-white" />
              </div>

              <h2 className="text-4xl font-black leading-tight">
                Secure Your
                <span className="block text-white/90">Account</span>
              </h2>

              <p className="text-xl text-white/90 leading-relaxed">
                Your security is our priority. Follow these tips to keep your account safe and secure.
              </p>

              {/* Security Tips */}
              <div className="space-y-6 pt-8">
                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Use Strong Passwords</h3>
                    <p className="text-white/80 text-sm">Include uppercase, lowercase, numbers, and special characters</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Unique Password</h3>
                    <p className="text-white/80 text-sm">Don't reuse passwords from other accounts</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Lock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">Keep It Secret</h3>
                    <p className="text-white/80 text-sm">Never share your password with anyone</p>
                  </div>
                </div>
              </div>

              {/* Support Info */}
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur mt-8 border border-white/20">
                <h3 className="font-bold mb-2 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Need Help?
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  If you're having trouble resetting your password, our support team is here to help.
                </p>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-mindboost-green"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}