import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "react-router-dom";
import { api } from "@/services/api";
import { useState, useEffect, FormEvent } from "react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import GoogleAuthButton from "@/components/shared/GoogleAuthButton";

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
      
      // If the response indicates verification is required, redirect to verify-email page
      if (response.requiresVerification) {
        window.location.href = `/auth/verify-email?email=${encodeURIComponent(email)}`;
        return;
      }

      // Otherwise, proceed with normal sign-in flow
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
              
              {/*Google sign-up button */}
              <GoogleAuthButton 
                mode="sign-up"
                disabled={isSubmitting || verifiedSuccess}
                search={search}
                onError={(errorMsg) => setGeneralError(errorMsg)}
              />
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
