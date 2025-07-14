"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { JSX, SVGProps } from "react";
import { InverusIcon } from "@/components/icons/inverus";

const GoogleIcon = (
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
  </svg>
);



interface LoginFormProps {
  isLoading: {
    linkedin: boolean
    google: boolean
    x: boolean
    otp: boolean
    verify: boolean
  }
  error: string | null
  email: string
  setEmail: (email: string) => void
  otpToken: string
  setOtpToken: (token: string) => void
  otpSent: boolean
  setOtpSent: (sent: boolean) => void
  setError: (error: string | null) => void
  onSocialLogin: (provider: 'linkedin' | 'google' | 'x') => void
  onSendOTP: (e: React.FormEvent) => void
  onVerifyOTP: (e: React.FormEvent) => void
}

export function LoginForm({
  isLoading,
  error,
  email,
  setEmail,
  otpToken,
  setOtpToken,
  otpSent,
  setOtpSent,
  setError,
  onSocialLogin,
  onSendOTP,
  onVerifyOTP
}: LoginFormProps) {

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="mx-auto w-full max-w-xs space-y-6">
        <div className="space-y-2 text-center">
          <InverusIcon className="mx-auto h-16 w-16" />
          <h1 className="text-3xl font-semibold">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to access to your dashboard, settings and projects.
          </p>
        </div>

        <div className="space-y-5">
          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialLogin('linkedin')}
              disabled={isLoading.linkedin || isLoading.google || isLoading.x || isLoading.otp || isLoading.verify}
            >
              {isLoading.linkedin ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with LinkedIn
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialLogin('google')}
              disabled={isLoading.linkedin || isLoading.google || isLoading.x || isLoading.otp || isLoading.verify}
            >
              {isLoading.google ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <GoogleIcon className="h-4 w-4 mr-2" />
                  Login with Google
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => onSocialLogin('x')}
              disabled={isLoading.linkedin || isLoading.google || isLoading.x || isLoading.otp || isLoading.verify}
            >
              {isLoading.x ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 mr-2">
                    <path
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with X
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">
              or sign in with email
            </span>
            <Separator className="flex-1" />
          </div>

          {!otpSent ? (
            <div className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-2.5">
                  <Input
                    id="email"
                    className="peer ps-9"
                    placeholder="m@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading.otp}
                  />
                  <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                    <Mail size={16} aria-hidden="true" />
                  </div>
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={onSendOTP}
                disabled={isLoading.otp || isLoading.linkedin || isLoading.google || isLoading.x}
              >
                {isLoading.otp ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                ) : null}
                Send verification code
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center text-sm text-muted-foreground">
                We've sent a verification code to <span className="font-medium">{email}</span>
              </div>
              <div>
                <Label htmlFor="otp">Verification code</Label>
                <div className="flex justify-center mt-2.5">
                  <InputOTP
                    maxLength={6}
                    value={otpToken}
                    onChange={(value) => setOtpToken(value)}
                    disabled={isLoading.verify}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button
                type="button"
                className="w-full"
                onClick={onVerifyOTP}
                disabled={isLoading.verify}
              >
                {isLoading.verify ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2" />
                ) : null}
                Verify and login
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() => {
                  setOtpSent(false)
                  setOtpToken('')
                  setError(null)
                }}
                disabled={isLoading.verify}
              >
                Back to email
              </Button>
            </div>
          )}
        </div>

        <div className="text-muted-foreground text-center text-xs text-balance">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>.
        </div>
      </div>
    </div>
  );
}
