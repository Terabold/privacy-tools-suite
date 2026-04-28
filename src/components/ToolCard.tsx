import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, useReducedMotion } from "framer-motion";
import { smoothSpring } from "@/lib/motion";
import { Star } from "lucide-react";
import { useRecentTools } from "@/hooks/useRecentTools";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
  gradient?: string;
  themeClass?: string;
}

const ToolCard = ({ title, description, icon, to, gradient = "from-primary to-accent", themeClass }: ToolCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { favoriteTools, toggleFavorite, addRecentTool } = useRecentTools();
  const isFavorite = favoriteTools.includes(to);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(to);
  };

  return (
    <Link 
      to={to} 
      onClick={() => addRecentTool(to)}
      className={`group/card-link block h-full select-none cursor-pointer rounded-2xl focus-premium ${themeClass}`}
    >
      <motion.div
        whileHover={prefersReducedMotion ? undefined : { y: -6, scale: 1.012 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
        transition={smoothSpring}
        className="h-full relative"
      >
        <div className={`absolute -inset-0.5 bg-gradient-to-tr ${gradient} opacity-0 group-hover/card-link:opacity-20 blur-xl transition-all duration-500 rounded-[20px] -z-10`} />
        <Card className="h-full overflow-hidden relative z-30 rounded-2xl opacity-95 group-hover/card-link:opacity-100 group-hover/card-link:border-primary/35 group-hover/card-link:bg-primary/[0.035] dark:ring-1 dark:ring-white/5">
          <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-3xl transition-theme group-hover/card-link:opacity-20`} />
          
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 z-40 p-2 rounded-full hover:bg-primary/10 transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star 
              className={`h-5 w-5 transition-colors ${isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground/30 group-hover/card-link:text-muted-foreground/60'}`} 
            />
          </button>

          <CardHeader className="pt-8 pb-6 px-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-black/15 transition-theme group-hover/card-link:scale-105 group-hover/card-link:shadow-primary/20`}>
                <div className="h-5 w-5 flex items-center justify-center">
                  {icon}
                </div>
              </div>
              <CardTitle className="text-lg font-black uppercase tracking-tight font-display text-foreground group-hover/card-link:text-[hsl(var(--primary))] transition-theme line-clamp-2 min-h-[2.5rem] flex items-center pr-8">
                {title}
              </CardTitle>
            </div>
            <CardDescription className="text-sm font-medium leading-relaxed opacity-80 italic group-hover/card-link:opacity-100 transition-theme line-clamp-2 min-h-[2.8rem]">
              {description}
            </CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    </Link>
  );
};

export default ToolCard;
