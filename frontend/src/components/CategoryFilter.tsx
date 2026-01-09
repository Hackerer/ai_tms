import { cn } from '../lib/utils';

interface Category {
    id: string;
    label: string;
    count: number;
}

interface CategoryFilterProps {
    value: string;
    onChange: (categoryId: string) => void;
    categories: Category[];
}

export const CategoryFilter = ({ value, onChange, categories }: CategoryFilterProps) => {
    return (
        <div className="inline-flex gap-1 p-1 bg-muted/30 rounded-lg border border-border">
            {categories.map((cat) => {
                const isActive = value === cat.id;

                return (
                    <button
                        key={cat.id}
                        onClick={() => onChange(cat.id)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-background hover:text-foreground"
                        )}
                    >
                        {cat.label}
                        {cat.count > 0 && (
                            <span className={cn(
                                "ml-2 text-xs px-1.5 py-0.5 rounded-full font-mono",
                                isActive
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            )}>
                                {cat.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
