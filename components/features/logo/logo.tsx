import Link from "next/link"

const logoStyle: React.CSSProperties = {
  fontFamily: "sans-serif",
  fontSize: "1.7rem",
  fontWeight: "750",
  textTransform: "none",
  margin: "0 8px",
  height: "40px",
  cursor: "pointer",
  transition: "color 0.5s ease",
  userSelect: "none",
  WebkitUserSelect: "none",
  MozUserSelect: "none",
  // @ts-expect-error vendor prefix
  msUserSelect: "none",
  display: "flex",
  alignItems: "center",
  textDecoration: "none"
}

interface LogoProps {
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ className = "primary-500" }) => {
  return (
    <Link href="/" style={logoStyle} className={className}>
      simplygo
    </Link>
  )
}
