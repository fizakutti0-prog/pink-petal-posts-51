import { Link, LinkProps, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  activeClassName?: string;
}

export const NavLink = ({ activeClassName, className, ...props }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === props.to;

  return (
    <Link
      className={cn(className, isActive && activeClassName)}
      {...props}
    />
  );
};
