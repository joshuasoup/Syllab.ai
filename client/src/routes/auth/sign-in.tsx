import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useForm } from "@/hooks/useForm";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { supabase } from "@/lib/supabase";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import { useState } from "react";

interface SignInForm {
  email: string;
  password: string;
}

export default function() {
  const navigate = useNavigate();
  const { search } = useLocation();

  //Google auth errors
  const [googleAuthError, setGoogleAuthError] = useState("");
  
  const {
    register,
    submit,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>(
    async (data) => {
      // Sign in with our API
      const response = await api.auth.signIn(data.email, data.password);
      
      // Sign in with Supabase to get the session
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      return response;
    },
    {
      onSuccess: () => navigate('/user/syllabus-upload'),
    }
  );

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-[420px]">
        <div className="space-y-8">
          <Card className="p-8">
            <div className="space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Login</h1>
              
              {/* Google Auth Button */}
              <GoogleAuthButton 
                mode="sign-in"  // Change from "sign-up" to "sign-in"
                disabled={isSubmitting}
                search={search}
                onError={(errorMsg) => setGoogleAuthError(errorMsg)}
              />

              
              <Separator className="my-4" />
            </div>
            
            <form onSubmit={submit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      autoComplete="off"
                      {...register("email")}
                      className={errors.email?.message ? "border-destructive" : ""}
                    />
                    {errors.email?.message && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      autoComplete="off"
                      {...register("password")}
                      className={errors.password?.message ? "border-destructive" : ""}
                    />
                    {errors.password?.message && (
                      <p className="text-sm text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                  type="submit"
                >
                  Continue with email
                </Button>
                {errors.root?.message && (
                  <p className="text-sm text-destructive">
                    {errors.root.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Forgot your password?{" "}
                  <Link
                    to="/auth/reset-password"
                    className="text-primary hover:underline font-medium"
                  >
                    Reset password
                  </Link>
                </p>
              </div>
            </form>
          </Card>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Don't have an account?{" "}
            <Link
              to="/auth/sign-up"
              className="text-primary hover:underline font-medium"
            >
              Get started →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
