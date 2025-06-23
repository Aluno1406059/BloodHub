
import { useState, useEffect } from 'react';
import { getInventory, bloodTypes, BloodInventory } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const InventoryPage = () => {
  const [inventory, setInventory] = useState<BloodInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setIsLoading(true);
        const data = await getInventory();
        setInventory(data);
      } catch (error) {
        console.error('Failed to fetch inventory:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const getStatusColor = (quantity: number) => {
    if (quantity <= 2) return 'bg-red-100 border-red-300 text-red-800';
    if (quantity <= 5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    return 'bg-green-100 border-green-300 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Bolsas de sangue disponíveis</h2>
        <p className="text-muted-foreground">
Níveis atuais de estoque de bolsas de sangue por tipo sanguíneo.        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bloodTypes.map((type) => {
            const bloodInventory = inventory.find(item => item.bloodType === type) || { bloodType: type, quantity: 0 };
            const statusColor = getStatusColor(bloodInventory.quantity);
            
            return (
              <Card key={type} className="blood-type-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-lg">
                    Tipo <span className="text-bloodred font-bold">{type}</span> 
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center">
                    <div className={`text-4xl font-bold p-4 rounded-full w-16 h-16 flex items-center justify-center ${statusColor}`}>
                      {bloodInventory.quantity}
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Bolsas disponíveis
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="col-span-1 md:col-span-3">
          <CardHeader>
            <CardTitle>Legenda do inventário</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded mr-2"></div>
              <span className="text-sm">Critico (0-2 bolsas)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded mr-2"></div>
              <span className="text-sm">Baixo (3-5 bolsas)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span className="text-sm">Bom (6+ bolsas)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryPage;
