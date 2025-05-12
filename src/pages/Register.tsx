
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { bloodTypes, addRecord } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

const formSchema = z.object({
  cpf: z.string().min(11, { message: 'CPF must have at least 11 characters' }).max(14),
  name: z.string().min(3, { message: 'Name is required' }),
  age: z.string().refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age >= 16 && age <= 120;
  }, { message: 'Age must be between 16 and 120' }),
  weight: z.string().refine((val) => {
    const weight = parseFloat(val);
    return !isNaN(weight) && weight >= 50;
  }, { message: 'Weight must be at least 50kg' }),
  bloodType: z.string().min(1, { message: 'Blood type is required' }),
  bags: z.string().refine((val) => {
    const bags = parseInt(val);
    return !isNaN(bags) && bags > 0;
  }, { message: 'Number of bags must be positive' }),
  date: z.date({ required_error: 'Date is required' }),
  type: z.enum(['donation', 'reception'], { required_error: 'Type is required' }),
});

type FormValues = z.infer<typeof formSchema>;

const RegisterPage = () => {
  const [activeTab, setActiveTab] = useState<'donation' | 'reception'>('donation');
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cpf: '',
      name: '',
      age: '',
      weight: '',
      bloodType: '',
      bags: '1',
      date: new Date(),
      type: 'donation',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const record = {
        cpf: data.cpf,
        name: data.name,
        age: parseInt(data.age),
        weight: parseFloat(data.weight),
        bloodType: data.bloodType,
        bags: parseInt(data.bags),
        date: data.date,
        type: data.type,
      };

      await addRecord(record);
      
      toast({
        title: `${data.type === 'donation' ? 'Donation' : 'Reception'} registered successfully!`,
        description: `${data.bags} bags of ${data.bloodType} blood have been ${data.type === 'donation' ? 'added to' : 'removed from'} inventory.`,
      });
      
      // Reset form
      form.reset({
        cpf: '',
        name: '',
        age: '',
        weight: '',
        bloodType: '',
        bags: '1',
        date: new Date(),
        type: activeTab,
      });
    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: 'Error',
        description: 'Failed to register the record. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'donation' | 'reception');
    form.setValue('type', value as 'donation' | 'reception');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Register</h2>
        <p className="text-muted-foreground">
          Register a new blood donation or reception.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Blood Transaction Form</CardTitle>
          <CardDescription>
            Fill out this form to register a blood donation or reception.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="donation" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Donation
                </TabsTrigger>
                <TabsTrigger value="reception" className="flex items-center gap-2">
                  <Minus className="h-4 w-4" /> Reception
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="donation" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      {...form.register('cpf')}
                    />
                    {form.formState.errors.cpf && (
                      <p className="text-sm text-red-500">{form.formState.errors.cpf.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter donor's full name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      {...form.register('age')}
                    />
                    {form.formState.errors.age && (
                      <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in kg"
                      {...form.register('weight')}
                    />
                    {form.formState.errors.weight && (
                      <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select 
                      onValueChange={(value) => form.setValue('bloodType', value)}
                      defaultValue={form.getValues('bloodType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.bloodType && (
                      <p className="text-sm text-red-500">{form.formState.errors.bloodType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bags">Number of Bags</Label>
                    <Input
                      id="bags"
                      type="number"
                      min="1"
                      placeholder="Enter number of bags"
                      {...form.register('bags')}
                    />
                    {form.formState.errors.bags && (
                      <p className="text-sm text-red-500">{form.formState.errors.bags.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues('date') ? (
                            format(form.getValues('date'), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.getValues('date')}
                          onSelect={(date) => date && form.setValue('date', date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-sm text-red-500">{form.formState.errors.date.message as string}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reception" className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      {...form.register('cpf')}
                    />
                    {form.formState.errors.cpf && (
                      <p className="text-sm text-red-500">{form.formState.errors.cpf.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter recipient's full name"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter age"
                      {...form.register('age')}
                    />
                    {form.formState.errors.age && (
                      <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Enter weight in kg"
                      {...form.register('weight')}
                    />
                    {form.formState.errors.weight && (
                      <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select 
                      onValueChange={(value) => form.setValue('bloodType', value)}
                      defaultValue={form.getValues('bloodType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.bloodType && (
                      <p className="text-sm text-red-500">{form.formState.errors.bloodType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bags">Number of Bags</Label>
                    <Input
                      id="bags"
                      type="number"
                      min="1"
                      placeholder="Enter number of bags"
                      {...form.register('bags')}
                    />
                    {form.formState.errors.bags && (
                      <p className="text-sm text-red-500">{form.formState.errors.bags.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues('date') ? (
                            format(form.getValues('date'), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.getValues('date')}
                          onSelect={(date) => date && form.setValue('date', date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                      <p className="text-sm text-red-500">{form.formState.errors.date.message as string}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <CardFooter className="px-0 pt-6 pb-0 flex justify-end">
              <Button type="submit">
                Register {activeTab === 'donation' ? 'Donation' : 'Reception'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
