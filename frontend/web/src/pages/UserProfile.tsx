
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/api/apiService';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Save, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function UserProfile() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [image, setImage] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();
  // const { setUser } = useAuth();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setImage(null);
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !user.id) {
      toast({
        title: "Error",
        description: "User information is missing. Please log in again.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }
    
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      await userApi.updateUserProfile(user.id, { name, email, phone, address, image });
      // const updatedUser = { ...user, ...updated.data, id: updated.data._id || user.id };
      // localStorage.setItem('securityUser', JSON.stringify(updatedUser));
      // setUser(updatedUser);
  
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // const handlePasswordUpdate = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!currentPassword || !newPassword || !confirmPassword) {
  //     toast({
  //       title: "Error",
  //       description: "All password fields are required",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
    
  //   if (newPassword !== confirmPassword) {
  //     toast({
  //       title: "Error",
  //       description: "New password and confirmation do not match",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
    
  //   setSaving(true);
    
  //   try {
  //     // In a real app, this would call an API endpoint
  //     await new Promise(resolve => setTimeout(resolve, 1000));
      
  //     toast({
  //       title: "Password updated",
  //       description: "Your password has been successfully changed.",
  //     });
      
  //     setCurrentPassword('');
  //     setNewPassword('');
  //     setConfirmPassword('');
  //   } catch (error) {
  //     console.error('Error updating password:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to update password. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setSaving(false);
  //   }
  // };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }
  
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive",
      });
      return;
    }
  
    setSaving(true);
  
    try {
      // Call the backend API
      await userApi.updateUserPassword(user.id, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
  
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      });
  
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Update your account settings and change your password
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <form onSubmit={handleProfileUpdate}>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Profile Picture</p>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={e => setImage(e.target.files?.[0] || null)}
                    disabled={saving}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload a new profile picture (optional)
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  disabled={saving}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t p-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Account Type</p>
                <div className="flex items-center">
                  {isAdmin ? (
                    <>
                      <Shield className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Administrator</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-primary mr-2" />
                      <span className="font-medium">Regular User</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-primary mr-2" />
                  <span className="font-medium">{user?.email}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">Account ID</p>
                <p className="text-xs font-mono bg-muted p-1 rounded">
                  {user?.id}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <form onSubmit={handlePasswordUpdate}>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your account password
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input 
                    id="currentPassword" 
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
