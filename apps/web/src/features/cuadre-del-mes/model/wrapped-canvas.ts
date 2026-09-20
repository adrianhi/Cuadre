import { downloadBlob, formatCurrency, shareOrDownloadFile, type ShareOutcome } from '@/shared/lib';
import type { CuadreDelMesData } from './wrapped-calculator';

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
  fill?: string, stroke?: string
) {
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string, x: number, y: number,
  maxWidth: number, lineHeight: number, maxLines = 3
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  let linesDrawn = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines - 1 && i < words.length - 1) {
        ctx.fillText((line + words.slice(i + 1).join(' ')).slice(0, 45) + '...', x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
  bgGrad.addColorStop(0, '#070A12');
  bgGrad.addColorStop(0.5, '#0B132B');
  bgGrad.addColorStop(1, '#05070E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1080, 1920);

  const emerald = ctx.createRadialGradient(920, 220, 20, 920, 220, 520);
  emerald.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
  emerald.addColorStop(1, 'rgba(16, 185, 129, 0)');
  ctx.fillStyle = emerald;
  ctx.fillRect(0, 0, 1080, 800);

  const violet = ctx.createRadialGradient(160, 1600, 20, 160, 1600, 580);
  violet.addColorStop(0, 'rgba(139, 92, 246, 0.20)');
  violet.addColorStop(1, 'rgba(139, 92, 246, 0)');
  ctx.fillStyle = violet;
  ctx.fillRect(0, 1000, 1080, 920);
}

function drawHero(ctx: CanvasRenderingContext2D, cuadre: CuadreDelMesData, monthLabel: string) {
  drawRoundedRect(ctx, 80, 100, 340, 54, 27, 'rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.18)');
  ctx.fillStyle = '#E2E8F0';
  ctx.font = '600 22px Inter, system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🇩🇴 EL CUADRE DEL MES', 110, 135);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 74px Inter, system-ui, sans-serif';
  ctx.fillText(monthLabel, 80, 240);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 28px Inter, system-ui, sans-serif';
  ctx.fillText('Tu resumen financiero y estilo de gasto', 80, 290);

  drawRoundedRect(ctx, 80, 360, 920, 560, 36, 'rgba(15, 23, 42, 0.85)', 'rgba(255, 255, 255, 0.14)');
  ctx.font = '96px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(cuadre.archetype.emoji, 540, 480);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 46px Inter, system-ui, sans-serif';
  ctx.fillText(cuadre.archetype.name, 540, 560);

  drawRoundedRect(ctx, 420, 595, 240, 44, 22, 'rgba(16, 185, 129, 0.18)', 'rgba(16, 185, 129, 0.35)');
  ctx.fillStyle = '#34D399';
  ctx.font = 'bold 22px Inter, system-ui, sans-serif';
  ctx.fillText(cuadre.archetype.badge, 540, 625);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'italic 500 28px Inter, system-ui, sans-serif';
  wrapText(ctx, `"${cuadre.archetype.quote}"`, 540, 700, 800, 38, 2);

  ctx.fillStyle = '#94A3B8';
  ctx.font = '400 24px Inter, system-ui, sans-serif';
  wrapText(ctx, cuadre.archetype.description, 540, 785, 800, 34, 3);
}

function drawHighlights(ctx: CanvasRenderingContext2D, cuadre: CuadreDelMesData) {
  const cards = [
    {
      x: 80, y: 960, badge: '👑 CATEGORÍA REINA',
      val: cuadre.topCategory?.name ?? 'Varios',
      highlight: `${cuadre.topCategory?.percentage ?? 0}% del gasto`,
      highlightColor: '#38BDF8',
      sub: !cuadre.protectedMode && cuadre.topCategory ? formatCurrency(cuadre.topCategory.rawAmount, cuadre.currency) : 'Montos protegidos',
    },
    {
      x: 560, y: 960, badge: '🏪 PARADA FAVORITA',
      val: cuadre.topMerchant?.name ?? 'Sin registros',
      highlight: `${cuadre.topMerchant?.visits ?? 0} visitas`,
      highlightColor: '#FBBF24',
      sub: !cuadre.protectedMode && cuadre.topMerchant ? formatCurrency(cuadre.topMerchant.rawAmount, cuadre.currency) : 'Montos protegidos',
    },
    {
      x: 80, y: 1320, badge: '🧘 CONTROL TOTAL',
      val: `${cuadre.daysUnderControl} días`,
      highlight: `de ${cuadre.totalDaysInPeriod} días del mes`,
      highlightColor: '#34D399',
      sub: `${cuadre.daysWithoutExpense} días sin gastar`,
    },
    {
      x: 560, y: 1320, badge: '📈 BALANCE MENSUAL',
      val: cuadre.hasIncomeData && cuadre.savingsRate > 0 ? `${cuadre.savingsRate}%` : (cuadre.isSpendingLess ? 'Control' : 'Activo'),
      highlight: cuadre.hasIncomeData && cuadre.savingsRate > 0 ? 'Tasa de ahorro' : (cuadre.expenseChangePercent !== null ? `${Math.abs(Math.round(cuadre.expenseChangePercent))}% ${cuadre.isSpendingLess ? 'menos' : 'más'}` : 'Organizado'),
      highlightColor: '#A78BFA',
      sub: !cuadre.protectedMode ? formatCurrency(cuadre.totalSpent, cuadre.currency) : 'Montos protegidos',
    },
  ];

  for (const c of cards) {
    drawRoundedRect(ctx, c.x, c.y, 440, 320, 28, 'rgba(15, 23, 42, 0.75)', 'rgba(255, 255, 255, 0.10)');
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 19px Inter, system-ui, sans-serif';
    ctx.fillText(c.badge, c.x + 36, c.y + 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px Inter, system-ui, sans-serif';
    ctx.fillText(c.val.length > 16 ? `${c.val.slice(0, 15)}...` : c.val, c.x + 36, c.y + 130);

    ctx.fillStyle = c.highlightColor;
    ctx.font = 'bold 28px Inter, system-ui, sans-serif';
    ctx.fillText(c.highlight, c.x + 36, c.y + 200);

    ctx.fillStyle = '#64748B';
    ctx.font = '500 22px Inter, system-ui, sans-serif';
    ctx.fillText(c.sub, c.x + 36, c.y + 255);
  }
}

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 1720);
  ctx.lineTo(1000, 1720);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 34px Inter, system-ui, sans-serif';
  ctx.fillText('CUADRE · cuadre.app', 540, 1785);

  ctx.fillStyle = '#64748B';
  ctx.font = '500 22px Inter, system-ui, sans-serif';
  ctx.fillText('🇩🇴 Inteligencia y hábitos financieros en República Dominicana', 540, 1835);
}

export function generateWrappedCanvas(cuadre: CuadreDelMesData, monthLabel: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto de Canvas 2D');

  drawBackground(ctx);
  drawHero(ctx, cuadre, monthLabel);
  drawHighlights(ctx, cuadre);
  drawFooter(ctx);

  return canvas;
}

export async function downloadWrappedImage(canvas: HTMLCanvasElement, filename = 'cuadre-del-mes.png'): Promise<void> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo generar la imagen para descargar');
  downloadBlob(blob, filename);
}

export async function shareWrappedImage(
  canvas: HTMLCanvasElement,
  title = 'Mi Cuadre del Mes',
  filename = 'cuadre-del-mes.png'
): Promise<ShareOutcome> {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('No se pudo generar la imagen para compartir');
  return shareOrDownloadFile(blob, filename, title);
}
