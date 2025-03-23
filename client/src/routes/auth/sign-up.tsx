import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { useState, useEffect, FormEvent } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define API error interface
interface ApiError {
  code?: string;
  message?: string;
  error?: string;
}

export default function() {
  const { search } = useLocation();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Form validation errors
  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [duplicateEmailError, setDuplicateEmailError] = useState("");

  // Reset form state when component unmounts or on initial load
  useEffect(() => {
    return () => {
      setSignupSuccess(false);
      setVerifiedSuccess(false);
      setGeneralError("");
      setDuplicateEmailError("");
    };
  }, []);

  // Basic validation
  const validateForm = () => {
    const errors = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    };
    let isValid = true;

    // Email validation
    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset all error/success states first
    setSignupSuccess(false);
    setVerifiedSuccess(false);
    setGeneralError("");
    setDuplicateEmailError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Set submitting state
    setIsSubmitting(true);

    try {
      // Attempt to sign up using the correct API function
      const response = await api.auth.signUp(email, password, firstName, lastName);

      console.log("Sign up response:", response);

      // If we get here without an error being thrown, it's a success
      setSignupSuccess(true);
      setVerifiedSuccess(true);

    } catch (error: unknown) {
      console.error("Sign up error:", error);

      // IMPORTANT: Make absolutely sure success is false when any error occurs
      setSignupSuccess(false);
      setVerifiedSuccess(false);

      // Type narrowing for proper TypeScript type safety
      let errorMessage = 'An unknown error occurred';
      let errorCode = '';
      
      // Handle different error types
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object') {
        // Try to cast to our ApiError interface
        const apiError = error as ApiError;
        errorCode = apiError.code || '';
        errorMessage = apiError.message || apiError.error || 'An unknown error occurred';
      }
      
      errorMessage = errorMessage.toLowerCase();

      // Log detailed error information for debugging
      console.log('Error details:', {
        errorCode,
        errorMessage,
        fullError: error
      });

      // Check for any indication that this is a duplicate email error
      const isDuplicateEmail =
        errorCode === 'GGT_INVALID_RECORD' ||
        errorMessage.includes('email is not unique') ||
        errorMessage.includes('duplicate key') ||
        errorMessage.includes('already exists') ||
        errorMessage.includes('already in use');

      if (isDuplicateEmail) {
        console.log('Detected duplicate email error');
        setDuplicateEmailError("This email is already in use. Please try another email or sign in.");
      } else {
        // Other types of errors
        setGeneralError(
          typeof error === 'object' && 
          error !== null &&
          'message' in error && 
          typeof error.message === 'string'
            ? error.message
            : typeof error === 'string'
              ? error
              : 'An error occurred during sign up. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine what message to show - prioritize errors over success
  const showDuplicateEmailError = Boolean(duplicateEmailError);
  const showGeneralError = !showDuplicateEmailError && Boolean(generalError);
  const showSuccessMessage = verifiedSuccess && !showDuplicateEmailError && !showGeneralError;

  // Reset form function
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setFormErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
    setDuplicateEmailError("");
    setGeneralError("");
    setSignupSuccess(false);
    setVerifiedSuccess(false);
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-[420px]">
        <div className="space-y-8">
          <Card className="p-8">
            <div className="space-y-6">
              <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">
                Get started
              </h1>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {formErrors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {formErrors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.lastName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (duplicateEmailError) setDuplicateEmailError("");
                    }}
                    className={`mt-1 ${showDuplicateEmailError ? "border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                    disabled={isSubmitting}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-500 mt-1">{formErrors.password}</p>
                  )}
                </div>

                {showDuplicateEmailError && (
                  <Alert variant="destructive" className="py-3 border-2 border-red-500 bg-red-50">
                    <AlertTitle className="text-red-700">Email Already Exists</AlertTitle>
                    <AlertDescription className="text-sm text-red-700">
                      {duplicateEmailError} <Link to="/sign-in" className="font-semibold underline">Sign in here</Link>
                    </AlertDescription>
                  </Alert>
                )}

                {showGeneralError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {generalError}
                    </AlertDescription>
                  </Alert>
                )}

                {showSuccessMessage && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-800">Success!</AlertTitle>
                    <AlertDescription className="text-green-800">
                      Sign up successful! Please check your email to verify your account.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || verifiedSuccess}
                  >
                    {isSubmitting ? "Signing up..." : "Sign up with email"}
                  </Button>

                  {(showDuplicateEmailError || showGeneralError) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-auto"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </form>

              <div className="flex items-center gap-4 py-2">
                <Separator className="flex-1" />
                <span className="text-muted-foreground text-sm font-medium">OR</span>
                <Separator className="flex-1" />
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                asChild
                disabled={isSubmitting || verifiedSuccess}
              >
                <a href={`/auth/google/start?mode=signup${search ? `&${search.substring(1)}` : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" className="mr-2 h-4 w-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign up with Google
                </a>
              </Button>
            </div>
          </Card>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              to="/auth/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}