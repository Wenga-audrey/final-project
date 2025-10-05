import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@shared/api";
import { useAuth } from "@/hooks/use-auth";
import {
  CreditCard,
  Smartphone,
  Lock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  Trophy,
  Users,
  User,
  Mail,
  Phone,
  Building,
  Key,
  Eye,
  EyeOff,
  Info,
  Zap,
  Star,
  Gift
} from "@/lib/icons";

export default function Payment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState("mobile");
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    plan: "premium",
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    institution: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    mobileProvider: "orange",
    promoCode: ""
  });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [steps, setSteps] = useState(1); // 1: Info, 2: Payment, 3: Confirmation

  useEffect(() => {
    const planParam = searchParams.get('plan');
    const examName = searchParams.get('exam');
    const tier = searchParams.get('tier');
    const price = searchParams.get('price');
    const duration = searchParams.get('duration');

    if (planParam) {
      setFormData(prev => ({ ...prev, plan: planParam }));
    }

    if (examName && tier && price && duration) {
      setSelectedExam({
        name: examName,
        tier: tier,
        price: parseFloat(price.replace(/[^0-9.-]+/g, "")),
        originalPrice: parseFloat(price.replace(/[^0-9.-]+/g, "")),
        duration: duration
      });
    }
  }, [searchParams]);

  const plans = {
    basic: {
      name: "Basic Plan",
      price: 30000,
      originalPrice: 30000,
      duration: "1 month",
      features: [
        "Access to basic courses",
        "Weekly practice tests",
        "Email support",
        "Basic progress tracking"
      ],
    },
    premium: {
      name: "Premium Plan",
      price: 55000,
      originalPrice: 55000,
      duration: "3 months",
      features: [
        "All basic features",
        "1-on-1 mentoring",
        "Live classes",
        "Advanced analytics",
        "Priority support",
        "Certificate of completion"
      ],
    },
    elite: {
      name: "Elite Plan",
      price: 95000,
      originalPrice: 95000,
      duration: "6 months",
      features: [
        "All premium features",
        "Personalized study plan",
        "Unlimited 1-on-1 sessions",
        "Exam simulation",
        "Career guidance",
        "Guaranteed pass or money back"
      ],
    }
  };

  const mobileProviders = [
    { id: "orange", name: "Orange Money", logo: "📱" },
    { id: "mtn", name: "MTN Mobile Money", logo: "📲" },
    { id: "nexttel", name: "Nexttel Possa", logo: "💳" },
  ];

  const institutions = [
    { id: "enspy", name: "ENSP Yaoundé (ENSPY)" },
    { id: "ensp-maroua", name: "ENSP Maroua" },
    { id: "enset", name: "ENSET Douala" },
    { id: "hicm", name: "HICM" },
    { id: "fhs", name: "FHS Bamenda" },
    { id: "enstp", name: "ENSTP/NSPW" },
    { id: "other", name: "Other Institution" }
  ];

  const calculateDiscount = (originalPrice, discountPercent) => {
    return originalPrice - (originalPrice * discountPercent / 100);
  };

  const applyPromoCode = () => {
    if (!formData.promoCode.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    // Mock promo code validation
    if (formData.promoCode.toLowerCase() === "mindboost20") {
      const discount = 20; // 20% discount
      const newPrice = calculateDiscount(selectedExam?.price || plans[formData.plan].price, discount);

      setAppliedPromo({
        code: formData.promoCode,
        discount: discount,
        savings: (selectedExam?.price || plans[formData.plan].price) - newPrice
      });

      if (selectedExam) {
        setSelectedExam(prev => ({
          ...prev,
          price: newPrice
        }));
      } else {
        plans[formData.plan].price = newPrice;
      }

      setPromoError("");
    } else if (formData.promoCode.toLowerCase() === "welcome10") {
      const discount = 10; // 10% discount
      const newPrice = calculateDiscount(selectedExam?.price || plans[formData.plan].price, discount);

      setAppliedPromo({
        code: formData.promoCode,
        discount: discount,
        savings: (selectedExam?.price || plans[formData.plan].price) - newPrice
      });

      if (selectedExam) {
        setSelectedExam(prev => ({
          ...prev,
          price: newPrice
        }));
      } else {
        plans[formData.plan].price = newPrice;
      }

      setPromoError("");
    } else {
      setPromoError("Invalid promo code");
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoError("");
    setFormData(prev => ({ ...prev, promoCode: "" }));

    if (selectedExam) {
      setSelectedExam(prev => ({
        ...prev,
        price: prev.originalPrice
      }));
    } else {
      plans[formData.plan].price = plans[formData.plan].originalPrice;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const currentPlan = selectedExam ? selectedExam : plans[formData.plan];

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-mindboost-green/10 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="h-16 w-16 text-mindboost-green" />
              </div>
              <h1 className="text-4xl font-black text-gray-900 mb-6">
                Payment Successful!
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Welcome to MindBoost Excellence Academy! Your enrollment has been confirmed.
              </p>

              <div className="bg-mindboost-light-green/30 rounded-2xl p-6 mb-8 border border-mindboost-green/20">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  What's Next?
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-mindboost-green rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-800">
                      Access your student dashboard
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-mindboost-green rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-800">
                      Complete your profile setup
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-mindboost-green rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-800">
                      Start your first lesson
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl"
                >
                  <Link to="/dashboard/learner">Go to Dashboard</Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="border-mindboost-green text-mindboost-dark-green hover:bg-mindboost-green/10 px-8 py-4 rounded-xl"
                >
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mindboost-light-blue to-mindboost-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Complete Your Enrollment
          </h1>
          <p className="text-xl text-gray-700">
            Secure your spot and start your journey to academic excellence
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Progress Steps */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl sticky top-8">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${steps >= 1 ? 'bg-mindboost-green text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Personal Info</h3>
                      <p className="text-sm text-gray-600">Your details</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${steps >= 2 ? 'bg-mindboost-green text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Payment</h3>
                      <p className="text-sm text-gray-600">Secure checkout</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${steps >= 3 ? 'bg-mindboost-green text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Confirmation</h3>
                      <p className="text-sm text-gray-600">Get started</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {steps === 1 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-mindboost-green/5 rounded-t-xl">
                  <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                  <p className="text-gray-600">Please provide your details to complete enrollment</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
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
                            className="pl-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                            placeholder="John"
                            required
                          />
                        </div>
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
                          className="py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                          placeholder="Doe"
                          required
                        />
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
                          className="pl-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
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
                          className="pl-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                          placeholder="+237 6XX XXX XXX"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="institution" className="block text-sm font-bold text-gray-900 mb-2">
                        Target Institution
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Select onValueChange={(value) => handleSelectChange("institution", value)} value={formData.institution}>
                          <SelectTrigger className="pl-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green">
                            <SelectValue placeholder="Select your target institution" />
                          </SelectTrigger>
                          <SelectContent>
                            {institutions.map((inst) => (
                              <SelectItem key={inst.id} value={inst.id}>
                                {inst.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        asChild
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                      >
                        <Link to="/pricing">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Back to Plans
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setSteps(2)}
                        className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl"
                      >
                        Continue to Payment
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {steps === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                  {/* Payment Method Selection */}
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-mindboost-green/5 rounded-t-xl">
                      <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
                      <p className="text-gray-600">Choose your preferred payment option</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="grid md:grid-cols-2 gap-4 mb-8">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment("mobile")}
                          className={`p-6 border-2 rounded-xl transition-all ${selectedPayment === "mobile"
                              ? "border-mindboost-green bg-mindboost-green/5"
                              : "border-gray-200 hover:border-mindboost-green/50"
                            }`}
                        >
                          <div className="flex items-center space-x-4">
                            <Smartphone className="h-8 w-8 text-mindboost-green" />
                            <div>
                              <div className="font-bold text-gray-900">
                                Mobile Money
                              </div>
                              <div className="text-sm text-gray-600">
                                Orange, MTN, Nexttel
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPayment("card")}
                          className={`p-6 border-2 rounded-xl transition-all ${selectedPayment === "card"
                              ? "border-mindboost-green bg-mindboost-green/5"
                              : "border-gray-200 hover:border-mindboost-green/50"
                            }`}
                        >
                          <div className="flex items-center space-x-4">
                            <CreditCard className="h-8 w-8 text-mindboost-green" />
                            <div>
                              <div className="font-bold text-gray-900">
                                Credit Card
                              </div>
                              <div className="text-sm text-gray-600">
                                Visa, Mastercard
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Mobile Money Form */}
                      {selectedPayment === "mobile" && (
                        <div className="space-y-6">
                          <div>
                            <Label className="block text-sm font-bold text-gray-900 mb-4">
                              Select Provider
                            </Label>
                            <div className="grid md:grid-cols-3 gap-4">
                              {mobileProviders.map((provider) => (
                                <button
                                  key={provider.id}
                                  type="button"
                                  onClick={() =>
                                    handleSelectChange("mobileProvider", provider.id)
                                  }
                                  className={`p-4 border-2 rounded-xl transition-all ${formData.mobileProvider === provider.id
                                      ? "border-mindboost-green bg-mindboost-green/5"
                                      : "border-gray-200 hover:border-mindboost-green/50"
                                    }`}
                                >
                                  <div className="text-center">
                                    <div className="text-2xl mb-2">
                                      {provider.logo}
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {provider.name}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start space-x-3">
                              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                              <div className="text-sm text-blue-700">
                                <strong>How it works:</strong> After clicking
                                "Complete Payment", you'll receive an SMS with
                                payment instructions. Follow the prompts to complete
                                your mobile money transaction.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Credit Card Form */}
                      {selectedPayment === "card" && (
                        <div className="space-y-6">
                          <div>
                            <Label htmlFor="cardNumber" className="block text-sm font-bold text-gray-900 mb-2">
                              Card Number
                            </Label>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleChange}
                                placeholder="1234 5678 9012 3456"
                                className="pl-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="expiryDate" className="block text-sm font-bold text-gray-900 mb-2">
                                Expiry Date
                              </Label>
                              <Input
                                type="text"
                                id="expiryDate"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                className="py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv" className="block text-sm font-bold text-gray-900 mb-2">
                                CVV
                              </Label>
                              <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  id="cvv"
                                  name="cvv"
                                  value={formData.cvv}
                                  onChange={handleChange}
                                  placeholder="123"
                                  className="pl-11 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
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
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Promo Code */}
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-mindboost-green/5 rounded-t-xl">
                      <h2 className="text-2xl font-bold text-gray-900">Promo Code</h2>
                      <p className="text-gray-600">Apply a discount code if you have one</p>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Input
                            type="text"
                            name="promoCode"
                            value={formData.promoCode}
                            onChange={handleChange}
                            placeholder="Enter promo code"
                            className="py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-mindboost-green focus:border-mindboost-green"
                          />
                          {promoError && (
                            <p className="text-red-500 text-sm mt-2">{promoError}</p>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={applyPromoCode}
                          className="bg-gradient-to-r from-mindboost-blue to-mindboost-dark-blue text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl"
                        >
                          Apply Code
                        </Button>
                      </div>

                      {appliedPromo && (
                        <div className="mt-4 p-4 bg-mindboost-green/10 border border-mindboost-green/20 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-mindboost-green">Promo Applied!</div>
                            <div className="text-sm text-gray-700">
                              Code: {appliedPromo.code} - {appliedPromo.discount}% off
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={removePromoCode}
                            variant="outline"
                            className="border-mindboost-green text-mindboost-green hover:bg-mindboost-green/10"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Order Summary */}
                  <Card className="border-0 shadow-xl">
                    <CardHeader className="bg-mindboost-green/5 rounded-t-xl">
                      <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="space-y-6">
                        {selectedExam ? (
                          <>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {selectedExam.name}
                              </h3>
                              <div className="flex items-center space-x-2 mb-4">
                                <Badge className={selectedExam.tier === "premium" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}>
                                  {selectedExam.tier === "premium" ? "Premium Plan" : "Basic Plan"}
                                </Badge>
                              </div>
                              <p className="text-gray-700 mb-4">
                                {selectedExam.duration} access
                              </p>
                              <div className="flex items-center">
                                {appliedPromo ? (
                                  <>
                                    <div className="text-2xl font-black text-mindboost-green line-through mr-3">
                                      {formatCurrency(selectedExam.originalPrice)}
                                    </div>
                                    <div className="text-3xl font-black text-mindboost-green">
                                      {formatCurrency(selectedExam.price)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-3xl font-black text-mindboost-green">
                                    {formatCurrency(selectedExam.price)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {plans[formData.plan].name}
                              </h3>
                              <p className="text-gray-700 mb-4">
                                {plans[formData.plan].duration} access
                              </p>
                              <div className="flex items-center">
                                {appliedPromo ? (
                                  <>
                                    <div className="text-2xl font-black text-mindboost-green line-through mr-3">
                                      {formatCurrency(plans[formData.plan].originalPrice)}
                                    </div>
                                    <div className="text-3xl font-black text-mindboost-green">
                                      {formatCurrency(plans[formData.plan].price)}
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-3xl font-black text-mindboost-green">
                                    {formatCurrency(plans[formData.plan].price)}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="border-t pt-6">
                              <h4 className="font-bold text-gray-900 mb-4">
                                What's Included:
                              </h4>
                              <ul className="space-y-2">
                                {plans[formData.plan].features.map(
                                  (feature, index) => (
                                    <li
                                      key={index}
                                      className="flex items-center space-x-2"
                                    >
                                      <CheckCircle className="h-4 w-4 text-mindboost-green" />
                                      <span className="text-sm text-gray-700">
                                        {feature}
                                      </span>
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          </>
                        )}

                        {appliedPromo && (
                          <div className="border-t pt-6">
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Discount</span>
                              <span className="text-mindboost-green font-bold">
                                -{formatCurrency(appliedPromo.savings)}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-6">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-black text-gray-900">
                              {formatCurrency(selectedExam?.price || plans[formData.plan].price)}
                            </span>
                          </div>
                        </div>

                        {/* Security badges */}
                        <div className="bg-mindboost-light-green/30 rounded-xl p-4 border border-mindboost-green/20">
                          <div className="flex items-center space-x-2 mb-2">
                            <Shield className="h-4 w-4 text-mindboost-green" />
                            <span className="text-sm font-semibold text-gray-900">
                              Secure Payment
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-mindboost-green" />
                            <span className="text-sm text-gray-700">
                              256-bit SSL encryption
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="flex justify-between">
                    <Button
                      type="button"
                      onClick={() => setSteps(1)}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>

                    <Button
                      type="submit"
                      disabled={processing}
                      className="bg-gradient-to-r from-mindboost-green to-mindboost-dark-green text-white font-bold px-12 py-4 text-lg rounded-xl shadow-xl hover:shadow-xl"
                    >
                      {processing ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          Complete Payment
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 py-12 border-t border-gray-200">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-6 w-6 text-mindboost-green" />
              <span className="text-gray-700 font-semibold">
                Secure Payment
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Clock className="h-6 w-6 text-mindboost-green" />
              <span className="text-gray-700 font-semibold">
                Instant Access
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Users className="h-6 w-6 text-mindboost-green" />
              <span className="text-gray-700 font-semibold">
                15,000+ Students
              </span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Trophy className="h-6 w-6 text-mindboost-green" />
              <span className="text-gray-700 font-semibold">
                98% Success Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}