
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, Minus, FileText } from 'lucide-react';
import { getRecords, BloodRecord } from '@/lib/db';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const ReportsPage = () => {
  const [records, setRecords] = useState<BloodRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const data = await getRecords(startDate, endDate);
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFilter = () => {
    fetchRecords();
  };

  const handleClearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    fetchRecords();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
        <p className="text-muted-foreground">
          Visualize e filtre registros de doações e recepções de sangue.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Filtrar Registros</span>
            <Button variant="ghost" onClick={handleClearFilters}>Limpar Filtros</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Data Inicial</Label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="start-date"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, 'dd/MM/yyyy')
                      ) : (
                        <span>Escolha uma data de início</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="end-date">Data Final</Label>
              <div className="mt-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="end-date"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, 'dd/MM/yyyy')
                      ) : (
                        <span>Escolha uma data final</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => startDate ? date < startDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-end">
              <Button onClick={handleFilter} className="w-full">
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Registros de transações de sangue</span>
            <span className="text-sm font-normal text-muted-foreground">
              {records.length} registros encontrados
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum registro encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">
                Nenhum registro de transação de sangue corresponde aos seus critérios.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record) => {
                const date = new Date(record.date);
                return (
                  <div 
                    key={record.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row justify-between">
                      <div className="flex items-center gap-3 mb-2 md:mb-0">
                        {record.type === 'donation' ? (
                          <div className="bg-green-100 p-2 rounded-full">
                            <Plus className="h-5 w-5 text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-red-100 p-2 rounded-full">
                            <Minus className="h-5 w-5 text-red-600" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium">{record.name}</h4>
                          <p className="text-sm text-gray-500">CPF: {record.cpf}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant={record.type === 'donation' ? 'outline' : 'destructive'}>
                          {record.type === 'donation' ? 'Donation' : 'Reception'}
                        </Badge>
                        <Badge variant="secondary" className="space-x-1">
                          <span>{record.bloodType}</span>
                        </Badge>
                        <Badge variant="outline" className="space-x-1">
                          <span>{record.bags}</span>
                          <span>bags</span>
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {format(date, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
