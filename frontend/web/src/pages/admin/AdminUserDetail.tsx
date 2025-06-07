import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { userApi } from "@/api/apiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await userApi.getUserById(id!);
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p>User not found.</p>
        <Link to="/admin/users" className="text-primary underline">
          <ArrowLeft className="inline mr-1" /> Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Link to="/admin/users" className="text-primary underline flex items-center mb-4">
        <ArrowLeft className="mr-1" /> Back to Users
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> {user.isAdmin ? "Admin" : "User"}</div>
          <div><strong>Status:</strong> {user.status}</div>
          <div><strong>Last Profile Update:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "N/A"}</div>
          {/* Add more fields as needed */}
        </CardContent>
      </Card>
    </div>
  );
}