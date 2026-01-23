"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const profileFormSchema = z.object({
  display_name: z.string().min(2, "Display name must be at least 2 characters.").max(30, "Display name must not be longer than 30 characters."),
  full_name: z.string().max(50, "Full name must not be longer than 50 characters.").optional(),
  bio: z.string().max(160, "Bio must not be longer than 160 characters.").optional(),
  location: z.string().max(50, "Location must not be longer than 50 characters.").optional(),
  website: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  avatar_url: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface EditProfileDialogProps {
  user: any
  trigger?: React.ReactNode
}

export default function EditProfileDialog({ user, trigger }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      display_name: "",
      full_name: "",
      bio: "",
      location: "",
      website: "",
      avatar_url: "",
    },
  })

  useEffect(() => {
    if (user) {
      form.reset({
        display_name: user.display_name || "",
        full_name: user.full_name || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar_url: user.avatar_url || "",
      })
    }
  }, [user, form])

  async function onSubmit(data: ProfileFormValues) {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully")
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us a little bit about yourself" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum 160 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Dhaka, Bangladesh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="avatar_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to your profile picture.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!form.formState.isSubmitting && <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
