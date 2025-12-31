import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Fragment } from 'react';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    return (
        <nav className="flex items-center text-sm text-muted-foreground mb-4 font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            <Link
                to="/dashboard"
                className="flex items-center hover:text-primary transition-colors hover:bg-white/5 p-1 rounded-md"
            >
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
                <Fragment key={index}>
                    <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/40" />
                    {item.path ? (
                        <Link
                            to={item.path}
                            className="hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={cn(
                            "transition-colors",
                            index === items.length - 1 ? "text-foreground font-bold" : ""
                        )}>
                            {item.label}
                        </span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
};
