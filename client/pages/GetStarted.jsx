import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@shared/api";
import { API_CONFIG } from "@shared/config";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building,
  BookOpen,
  Target,
  Zap,
  Star,
  Shield,
  Lightbulb
} from "@/lib/icons";

export default function GetStarted() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    targetInstitution: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const institutions = [
    { id: "enam", name: "ENAM (École Nationale d'Administration et de Magistrature)" },
    { id: "ens", name: "ENS (École Normale Supérieure)" },
    { id: "police", name: "Police Nationale" },
    { id: "douanes", name: "Douanes (Customs)" },
    { id: "gendarmerie", name: "Gendarmerie Nationale" },
    { id: "iric", name: "IRIC (Institut des Relations Internationales)" },
    { id: "health", name: "Ministry of Health" },
    { id: "finance", name: "Ministry of Finance" },
    { id: "other", name: "Other" },
  ];

  const steps = [
    { id: 1, title: "Personal Info", description: "Tell us about yourself" },
    { id: 2, title: "Account Setup", description: "Create your credentials" },
    { id: 3, title: "Target Exam", description: "Select your goal" },
    { id: 4, title: "Review", description: "Confirm your details" }
  ];

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 3) {
      if (!formData.targetInstitution) newErrors.targetInstitution = "Please select your target exam";
    }

    if (step === 4) {
      if (!formData.agreeTerms) newErrors.agreeTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setLoading(true);
    setErrors({});

    try {
      // Create account using the API with new endpoint structure
      const response = await api.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'LEARNER',
        examTargets: [formData.targetInstitution]
      });

      if (response.success && response.data?.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        
        setSuccess(true);

        // Redirect to learner dashboard after a short delay
        setTimeout(() => {
          navigate("/dashboard/learner");
        }, 2000);
      } else {
        setErrors({ general: response.error || "Failed to create account. Please try again." });
      }
    } catch (err) {
      setErrors({ general: "Failed to create account. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12 text-mindboost-green" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">
            Account Created Successfully!
          </h2>
          <p className="text-gray-700 mb-8">
            Welcome to MindBoost Excellence Academy. We're preparing your dashboard...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-mindboost-green h-2.5 rounded-full animate-pulse" style={{ width: "100%" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6">
        <Link to="/" className="inline-flex items-center space-x-3">
          <div className="w-12 h-12 bg-mindboost-green/20 backdrop-blur rounded-lg flex items-center justify-center brand-shadow">
            <span className="text-mindboost-green font-black text-lg">MB</span>
          </div>
          <div>
            <span className="text-2xl font-black text-mindboost-dark-blue">
              Mind<span className="text-mindboost-green">Boost</span>
            </span>
            <div className="text-xs text-mindboost-slate font-semibold -mt-1">
              Excellence Academy
            </div>
          </div>
        </Link>
      </div>

      {/* Centered Form */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-mindboost-green/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6 brand-shadow">
              <GraduationCap className="h-8 w-8 text-mindboost-green" />
            </div>
            <h1 className="text-4xl font-black text-mindboost-dark-green drop-shadow-lg mb-4">
              Get Started
            </h1>
            <p className="text-xl text-mindboost-slate">
              Create your account and begin your journey to success
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-10 relative">
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0"></div>
            <div
              className="absolute top-4 left-0 h-1 bg-mindboost-green z-10 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>

            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center z-20">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${currentStep >= step.id
                  ? 'bg-mindboost-green text-white border-2 border-mindboost-green'
                  : 'bg-white border-2 border-gray-300 text-gray-400'
                  }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <div className={`text-sm font-bold ${currentStep === step.id ? 'text-mindboost-dark-green' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 hidden md:block">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Account Creation Form */}
          <Card className="border-0 brand-shadow bg-white/95 backdrop-blur">
            <CardContent className="p-8">
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 text-sm">{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Personal Info */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-gray-600">Tell us about yourself to get started</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="block text-sm font-bold text-gray-900 mb-2">
                          First Name
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.firstName ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                              }`}
                            placeholder="First name"
                            required
                          />
                        </div>
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lastName" className="block text-sm font-bold text-gray-900 mb-2">
                          Last Name
                        </Label>
                        <Input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.lastName ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                            }`}
                          placeholder="Last name"
                          required
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                            }`}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                            }`}
                          placeholder="+237 6XX XXX XXX"
                          required
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Account Setup */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Account Setup</h2>
                      <p className="text-gray-600">Create your login credentials</p>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="password" className="block text-sm font-bold text-gray-900 mb-2">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                              }`}
                            placeholder="Create a strong password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}

                        {formData.password && (
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
                            <div className="text-xs text-gray-500 mt-2">
                              Use at least 8 characters with a mix of letters, numbers, and symbols
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
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`pl-11 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                              }`}
                            placeholder="Confirm your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Target Exam */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Target Exam</h2>
                      <p className="text-gray-600">Select the exam you're preparing for</p>
                    </div>

                    <div>
                      <Label htmlFor="targetInstitution" className="block text-sm font-bold text-gray-900 mb-2">
                        Target Exam/Institution
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Select onValueChange={(value) => handleSelectChange("targetInstitution", value)} value={formData.targetInstitution}>
                          <SelectTrigger className={`pl-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green transition-all ${errors.targetInstitution ? 'border-red-500' : 'border-gray-300 focus:border-mindboost-green'
                            }`}>
                            <SelectValue placeholder="Select your target exam" />
                          </SelectTrigger>
                          <SelectContent>
                            {institutions.map((institution) => (
                              <SelectItem key={institution.id} value={institution.id}>
                                {institution.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {errors.targetInstitution && (
                        <p className="text-red-500 text-sm mt-1">{errors.targetInstitution}</p>
                      )}
                    </div>

                    {/* Benefits Preview */}
                    <div className="bg-mindboost-light-green/30 rounded-xl p-6 border border-mindboost-green/20">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Lightbulb className="h-5 w-5 text-mindboost-green mr-2" />
                        What You'll Get
                      </h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Personalized study plan for your target exam</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Practice tests and mock exams</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-mindboost-green mt-0.5 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">Expert guidance and resources</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Review Your Information</h2>
                      <p className="text-gray-600">Please confirm your details before creating your account</p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Full Name</span>
                        <span className="text-gray-900">{formData.firstName} {formData.lastName}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Email</span>
                        <span className="text-gray-900">{formData.email}</span>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <span className="font-medium text-gray-700">Phone</span>
                        <span className="text-gray-900">{formData.phone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Target Exam</span>
                        <span className="text-gray-900">
                          {institutions.find(inst => inst.id === formData.targetInstitution)?.name || "Not selected"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleChange}
                        className={`rounded border-mindboost-green text-mindboost-green focus:ring-mindboost-green mt-1 ${errors.agreeTerms ? 'border-red-500' : ''
                          }`}
                        required
                      />
                      <Label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-700">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-mindboost-green hover:text-mindboost-dark-green font-semibold"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-mindboost-green hover:text-mindboost-dark-green font-semibold"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                    {errors.agreeTerms && (
                      <p className="text-red-500 text-sm -mt-2">{errors.agreeTerms}</p>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className={`${currentStep === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } rounded-xl px-6 py-3 font-bold`}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-mindboost-green hover:bg-mindboost-green/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-mindboost-green hover:bg-mindboost-green/90 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Creating Account...
                        </div>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-700">
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="text-mindboost-green hover:text-mindboost-dark-green font-bold"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}