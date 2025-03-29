
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import Layout from '@/components/Layout';

const AdminLogin = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyAdminPin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isValid = await verifyAdminPin(pin);
      
      if (isValid) {
        toast.success('Admin PIN verified!');
        navigate('/admin/panel');
      } else {
        toast.error('Invalid admin PIN');
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      toast.error('Failed to verify PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Admin Access</CardTitle>
            <CardDescription className="text-center">
              Enter your admin PIN to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="pin"
                  type="password"
                  placeholder="Enter 4-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  className="text-center text-xl tracking-widest"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || pin.length !== 4}
              >
                {loading ? 'Verifying...' : 'Access Admin Panel'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLogin;
