"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Globe, Palette, Info, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createTenantWizard } from "@/actions/createTenantWizard"

const tenantSchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9-]+$/, "ID must contain only lowercase letters, numbers, and hyphens"),
  name: z.string().min(1, "Name is required"),
  domain: z.string()
    .min(1, "Domain is required")
    .refine(
      (val) => {
        // Allow both full URLs and domain names
        if (val.startsWith("http://") || val.startsWith("https://")) {
          try {
            new URL(val)
            return true
          } catch {
            return false
          }
        }
        // Allow domain names (e.g., example.com, subdomain.example.com)
        return /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(val) || val.includes(".")
      },
      { message: "Domain must be a valid URL (e.g., https://example.com) or domain name (e.g., example.com)" }
    ),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #6366f1)").default("#6366f1"),
  defaultLocale: z.enum(["en", "el"], { required_error: "Locale is required" }),
})

type TenantFormData = z.infer<typeof tenantSchema>

const steps = [
  { id: 1, title: "Tenant Info", icon: Info },
  { id: 2, title: "Branding", icon: Palette },
  { id: 3, title: "Confirmation", icon: Check },
]

export default function NewTenantPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    mode: "onChange",
    defaultValues: {
      primaryColor: "#6366f1",
      defaultLocale: "en",
    },
  })

  const formData = watch()

  const nextStep = async () => {
    if (currentStep < 3) {
      // Validate current step fields before moving forward
      let fieldsToValidate: (keyof TenantFormData)[] = []
      
      if (currentStep === 1) {
        fieldsToValidate = ["id", "name", "domain"]
      } else if (currentStep === 2) {
        fieldsToValidate = ["primaryColor", "defaultLocale"]
      }
      
      const isValid = await trigger(fieldsToValidate)
      
      if (isValid) {
        setCurrentStep(currentStep + 1)
      } else {
        // Show specific validation errors
        const errorMessages: string[] = []
        if (errors.id) errorMessages.push(`ID: ${errors.id.message}`)
        if (errors.name) errorMessages.push(`Name: ${errors.name.message}`)
        if (errors.domain) errorMessages.push(`Domain: ${errors.domain.message}`)
        if (errors.primaryColor) errorMessages.push(`Color: ${errors.primaryColor.message}`)
        if (errors.defaultLocale) errorMessages.push(`Locale: ${errors.defaultLocale.message}`)
        
        toast({
          title: "Validation Error",
          description: errorMessages.length > 0 
            ? errorMessages.join(", ") 
            : "Please fix the errors before continuing",
          variant: "destructive",
        })
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: TenantFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)
    
    try {
      console.log("Submitting tenant data:", data)
      const result = await createTenantWizard(data)
      console.log("Tenant creation result:", result)
      
      if (result.error) {
        const errorMessage = result.error
        setSubmitError(errorMessage)
        toast({
          title: "Error Creating Tenant",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
        setIsSubmitting(false)
        return
      }

      if (result.id && result.domain) {
        setSubmitSuccess(true)
        toast({
          title: "Success!",
          description: `Tenant "${data.name}" created successfully`,
          duration: 3000,
        })
        
        // Small delay to ensure toast is visible before redirect
        setTimeout(() => {
          router.push(`/tenants/new/success?tenant=${encodeURIComponent(result.id)}&domain=${encodeURIComponent(result.domain)}`)
        }, 1500)
      } else {
        console.error("Unexpected result format:", result)
        const errorMessage = "Failed to create tenant. The server response was incomplete."
        setSubmitError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error creating tenant:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while creating the tenant"
      setSubmitError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <div className="mb-8">
        <Button variant="ghost" size="icon" asChild className="mb-4 rounded-xl">
          <Link href="/tenants">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-semibold">Create New Tenant</h1>
        <p className="text-muted-foreground mt-2">Set up a new tenant site in 3 simple steps</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-between">
        {steps.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 h-0.5 flex-1 ${
                    isCompleted ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Tenant Info */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="id" className="text-base font-medium">
                      Tenant ID <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Lowercase letters, numbers, and hyphens only (e.g., kalitechnia)
                    </p>
                    <Input
                      id="id"
                      {...register("id")}
                      placeholder="kalitechnia"
                      className="rounded-xl"
                      autoComplete="off"
                    />
                    {errors.id && (
                      <p className="mt-1 text-sm text-destructive">{errors.id.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-base font-medium">
                      Tenant Name <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Display name for this tenant
                    </p>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Kalitechnia"
                      className="rounded-xl"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="domain" className="text-base font-medium">
                      Domain <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Domain name or full URL (e.g., kalitechnia.gr or https://kalitechnia.gr)
                    </p>
                    <Input
                      id="domain"
                      {...register("domain")}
                      placeholder="kalitechnia.gr"
                      className="rounded-xl"
                    />
                    {errors.domain && (
                      <p className="mt-1 text-sm text-destructive">{errors.domain.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Branding */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="primaryColor" className="text-base font-medium">
                      Primary Color
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Brand color for this tenant
                    </p>
                    <div className="flex gap-3">
                      <Input
                        id="primaryColor"
                        {...register("primaryColor")}
                        type="color"
                        className="h-12 w-24 rounded-xl cursor-pointer"
                      />
                      <Input
                        {...register("primaryColor")}
                        placeholder="#6366f1"
                        className="rounded-xl flex-1"
                        pattern="^#[0-9A-Fa-f]{6}$"
                      />
                    </div>
                    {errors.primaryColor && (
                      <p className="mt-1 text-sm text-destructive">{errors.primaryColor.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="defaultLocale" className="text-base font-medium">
                      Default Locale <span className="text-destructive">*</span>
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Default language for this tenant
                    </p>
                    <Select
                      value={formData.defaultLocale}
                      onValueChange={(value) => setValue("defaultLocale", value as "en" | "el")}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select locale" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English (en)</SelectItem>
                        <SelectItem value="el">Greek (el)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.defaultLocale && (
                      <p className="mt-1 text-sm text-destructive">{errors.defaultLocale.message}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Review Your Settings</h3>
                    <div className="space-y-4 rounded-xl border border-border bg-muted/50 p-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tenant ID:</span>
                        <span className="font-medium">{formData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Domain:</span>
                        <span className="font-medium">{formData.domain}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Primary Color:</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-5 w-5 rounded-full border border-border"
                            style={{ backgroundColor: formData.primaryColor }}
                          />
                          <span className="font-medium">{formData.primaryColor}</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Default Locale:</span>
                        <span className="font-medium">{formData.defaultLocale?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      Click "Create Tenant" to create the tenant and set you as the owner. 
                      A default globals entry will be created automatically.
                    </p>
                  </div>

                  {/* Success/Error Messages */}
                  {submitSuccess && (
                    <div className="rounded-xl border border-green-500/50 bg-green-500/10 p-4">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        ✓ Tenant created successfully! Redirecting...
                      </p>
                    </div>
                  )}
                  
                  {submitError && (
                    <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                      <p className="text-sm font-medium text-destructive">
                        ✗ {submitError}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="rounded-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-xl"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Tenant
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

