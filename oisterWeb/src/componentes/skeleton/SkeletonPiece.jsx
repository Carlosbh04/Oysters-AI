import "./SkeletonPiece.css";

/* ===== Primitivo SkeletonPiece =====
   La pieza de lego para cualquier estado de carga. Uso:

   <SkeletonPiece variant="line" width="60%" />
   <SkeletonPiece variant="title" />
   <SkeletonPiece variant="circle" size={42} />
   <SkeletonPiece variant="block" height={180} />

   Variantes: line (texto), title (titular), circle (avatar/
   icono), block (card/imagen). width/height/size aceptan
   número (px) o string ("60%", "12rem"). */
function SkeletonPiece({ variant = "line", width, height, size, style, className = "" }) {
  const s = { ...style };

  if (variant === "circle") {
    s.width = s.height = typeof size === "number" ? `${size}px` : size || "40px";
  } else {
    if (width) s.width = typeof width === "number" ? `${width}px` : width;
    if (height) s.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <span
      className={`skeleton skeleton--${variant} ${className}`}
      style={s}
      aria-hidden="true"
    />
  );
}

export default SkeletonPiece;