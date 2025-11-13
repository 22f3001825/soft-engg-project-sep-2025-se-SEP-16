import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

export const StatsCards = ({ items = [] }) => {
  const gradients = [
    'from-indigo-500 to-indigo-600',
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600',
    'from-orange-500 to-orange-600'
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map(({ title, value, icon: Icon }, idx) => (
        <Card 
          key={idx} 
          className={`hover:shadow-lg btn-transition cursor-pointer group animate-slide-in-up shadow-md bg-gradient-to-br ${gradients[idx % gradients.length]} border-2 border-white/20`} 
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/90 mb-1">
                  {title}
                </p>
                <p className="text-3xl font-bold text-white">
                  {value}
                </p>
              </div>
              {Icon && (
                <div className={`h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 btn-transition`}>
                  <Icon className={`h-6 w-6 text-white`} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


