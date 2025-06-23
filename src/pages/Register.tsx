
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ptBR } from 'date-fns/locale';
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
  cpf: z.string().min(11, { message: 'O CPF deve ter pelo menos 11 caracteres' }).max(14),
  name: z.string().min(3, { message: 'O nome é obrigatório' }),
  age: z.string().refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age >= 16 && age <= 120;
  }, { message: 'A idade deve estar entre 16 e 120 anos' }),
  weight: z.string().refine((val) => {
    const weight = parseFloat(val);
    return !isNaN(weight) && weight >= 50;
  }, { message: 'O peso deve ser de pelo menos 50kg' }),
  bloodType: z.string().min(1, { message: 'O tipo sanguíneo é obrigatório' }),
  bags: z.string().refine((val) => {
    const bags = parseInt(val);
    return !isNaN(bags) && bags > 0;
  }, { message: 'O número de malas deve ser positivo' }),
  date: z.date({ required_error: 'A data é obrigatória' }),
  type: z.enum(['donation', 'reception'], { required_error: 'O tipo é obrigatório' }),
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
        title: `${data.type === 'donation' ? 'Donation' : 'Reception'} cadastrado com sucesso!`,
        description: `${data.bags} bolsas de ${data.bloodType} sangue foi ${data.type === 'donation' ? 'adicionado a' : 'removido de'} inventário.`,
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
      console.error('Erro ao adicionar registro:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar o registro. Por favor, tente novamente.',
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
        <h2 className="text-2xl font-bold tracking-tight">Registro</h2>
        <p className="text-muted-foreground">
          Registre uma nova doação ou recebimento de sangue.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Transação de Sangue</CardTitle>
          <CardDescription>
            Preencha este formulário para registrar uma doação ou recepção de sangue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="donation" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Doação
                </TabsTrigger>
                <TabsTrigger value="reception" className="flex items-center gap-2">
                  <Minus className="h-4 w-4" /> Recebimento
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
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Digite o nome completo do doador"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Insira a idade"
                      {...form.register('age')}
                    />
                    {form.formState.errors.age && (
                      <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Insira o peso em kg"
                      {...form.register('weight')}
                    />
                    {form.formState.errors.weight && (
                      <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Tipo sanguíneo</Label>
                    <Select 
                      onValueChange={(value) => form.setValue('bloodType', value)}
                      defaultValue={form.getValues('bloodType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo sanguíneo" />
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
                    <Label htmlFor="bags">Número de bolsas</Label>
                    <Input
                      id="bags"
                      type="number"
                      min="1"
                      placeholder="Insira o número de bolsas"
                      {...form.register('bags')}
                    />
                    {form.formState.errors.bags && (
                      <p className="text-sm text-red-500">{form.formState.errors.bags.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues('date') ? (
                            format(form.getValues('date'), 'dd/MM/yyyy')
                          ) : (
                            <span>Escolha uma data</span>
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
                          locale={ptBR}
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
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      placeholder="Digite o nome completo do receptor"
                      {...form.register('name')}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Insira a idade"
                      {...form.register('age')}
                    />
                    {form.formState.errors.age && (
                      <p className="text-sm text-red-500">{form.formState.errors.age.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="Insira o peso em kg"
                      {...form.register('weight')}
                    />
                    {form.formState.errors.weight && (
                      <p className="text-sm text-red-500">{form.formState.errors.weight.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Tipo sanguíneo</Label>
                    <Select 
                      onValueChange={(value) => form.setValue('bloodType', value)}
                      defaultValue={form.getValues('bloodType')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo sanguíneo" />
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
                    <Label htmlFor="bags">Número de bolsas</Label>
                    <Input
                      id="bags"
                      type="number"
                      min="1"
                      placeholder="Insira o número de bolsas"
                      {...form.register('bags')}
                    />
                    {form.formState.errors.bags && (
                      <p className="text-sm text-red-500">{form.formState.errors.bags.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues('date') ? (
                            format(form.getValues('date'), 'dd/MM/yyyy')
                          ) : (
                            <span>Escolha uma data</span>
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
                          locale={ptBR}
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
                Registrar {activeTab === 'donation' ? 'Doação' : 'Recepção'}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;
