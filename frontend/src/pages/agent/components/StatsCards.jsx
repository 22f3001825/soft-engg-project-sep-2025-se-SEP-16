import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

export const StatsCards = ({ items = [] }) => {
  const getBgColor = (idx) => {
    const colors = ['bg-primary/10', 'bg-accent/10', 'bg-warning-light', 'bg-success-light'];
    return colors[idx % colors.length];
  };

  const getTextColor = (idx) => {
    const colors = ['text-primary', 'text-accent', 'text-warning', 'text-success'];
    return colors[idx % colors.length];
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {items.map(({ title, value, icon: Icon, tone }, idx) => (
        <Card 
          key={idx} 
          className="hover:shadow-lg btn-transition cursor-pointer group animate-slide-in-up shadow-md" 
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {title}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {value}
                </p>
              </div>
              {Icon && (
                <div className={`h-12 w-12 rounded-lg ${getBgColor(idx)} flex items-center justify-center group-hover:scale-110 btn-transition`}>
                  <Icon className={`h-6 w-6 ${getTextColor(idx)}`} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};


