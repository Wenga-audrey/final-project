import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail } from '@/lib/icons';
import { api, setAuthToken } from '@shared/api';
import { API_CONFIG } from '@shared/config';
import { login } from '@/lib/auth';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use the login function from auth library
      const { user, token, dashboardRole } = await login({
        email,
        password
      });

      // Redirect based on user role
      switch (dashboardRole) {
        case 'learner':
          navigate("/dashboard/learner");
          break;
        case 'instructor':
          navigate("/dashboard/instructor");
          break;
        case 'admin':
          navigate("/dashboard/admin");
          break;
        case 'super-admin':
          navigate("/dashboard/super-admin");
          break;
        default:
          navigate("/dashboard/learner");
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 brand-shadow bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center mx-auto mb-6 brand-shadow">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-mindboost-dark-green drop-shadow-lg">Welcome Back</CardTitle>
            <CardDescription className="text-mindboost-slate">Sign in to your account to continue learning</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-mindboost-dark-green">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mindboost-green h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-6 rounded-xl border-mindboost-light-green focus:border-mindboost-green focus:ring-mindboost-green"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-mindboost-dark-green">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mindboost-green h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 py-6 rounded-xl border-mindboost-light-green focus:border-mindboost-green focus:ring-mindboost-green"
                    required
                  />

                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-mindboost-green focus:ring-mindboost-green border-mindboost-light-green rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-mindboost-dark-green">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-mindboost-green hover:text-mindboost-dark-green">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full brand-btn py-6 rounded-xl"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-mindboost-slate mb-4">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-mindboost-green hover:text-mindboost-dark-green">
                Sign up
              </Link>
            </div>
            <div className="text-xs text-mindboost-slate text-center">
              By signing in, you agree to our{" "}
              <Link to="/terms" className="underline hover:text-mindboost-green">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline hover:text-mindboost-green">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Demo Accounts */}
        <div className="mt-6 text-center">
          <p className="text-sm text-mindboost-slate mb-3">Demo Accounts:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail("learner@mindboost.com");
                setPassword("learner123");
              }}
              className="text-xs bg-mindboost-green text-white hover:bg-mindboost-dark-green"
            >
              Student Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEmail("teacher@mindboost.com");
                setPassword("teacher123");
              }}
              className="text-xs bg-mindboost-green text-white hover:bg-mindboost-dark-green"
            >
              Instructor Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}