interface IconRendererProps {
  icon: string;
  size?: number;
}

export function IconRenderer({ icon, size = 24 }: IconRendererProps) {
  if (!icon) {
    return (
      <span className="text-lg" role="img" aria-label="link">
        🔗
      </span>
    );
  }

  if (icon.startsWith("data:image/") || icon.startsWith("/icones/")) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        className="inline-block object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  if (icon.startsWith("fa-")) {
    return <i className={`fas ${icon}`} style={{ fontSize: size - 4 }} />;
  }

  // Legacy: URLs externas de ícone (compatibilidade com dados antigos)
  if (icon.startsWith("http://") || icon.startsWith("https://")) {
    return (
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        className="inline-block object-contain"
        style={{ width: size, height: size }}
      />
    );
  }

  return <span className="text-sm">{icon}</span>;
}
