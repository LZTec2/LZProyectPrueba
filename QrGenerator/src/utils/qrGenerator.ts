import QRCode from 'qrcode';

export interface QROptions {
  color1: string;
  color2?: string;
  eyeStyle: 'square' | 'circle' | 'rounded';
  dotStyle: 'square' | 'circle' | 'rounded';
  logoImage?: string;
}

export const generateQRCode = async (
  text: string,
  options: QROptions
): Promise<string> => {
  try {
    // Generate base QR code with high error correction for logo overlay
    const qrDataURL = await QRCode.toDataURL(text, {
      width: 400,
      margin: 2,
      color: {
        dark: options.color1,
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H' // High error correction allows for logo overlay
    });

    // Create canvas for customization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 400;
    canvas.height = 400;

    // Load base QR image
    const qrImage = new Image();
    await new Promise((resolve) => {
      qrImage.onload = resolve;
      qrImage.src = qrDataURL;
    });

    // Draw base QR
    ctx.drawImage(qrImage, 0, 0);

    // Add gradient if second color is provided
    if (options.color2) {
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, options.color1);
      gradient.addColorStop(1, options.color2);
      
      // Create a mask from the original QR code
      const imageData = ctx.getImageData(0, 0, 400, 400);
      const data = imageData.data;
      
      // Apply gradient only to dark pixels
      ctx.fillStyle = gradient;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < 128) { // If pixel is dark
          const x = (i / 4) % 400;
          const y = Math.floor((i / 4) / 400);
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Add custom top-left eye with green checkmark
    await addCustomEye(ctx);

    // Add logo if provided
    if (options.logoImage) {
      await addLogo(ctx, options.logoImage);
    }

    return canvas.toDataURL();
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const addCustomEye = async (ctx: CanvasRenderingContext2D) => {
  // Find the top-left finder pattern (approximately at 30-90, 30-90)
  const eyeSize = 60;
  const eyeX = 30;
  const eyeY = 30;
  
  // Clear the area and draw white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(eyeX, eyeY, eyeSize, eyeSize);
  
  // Draw outer black border
  ctx.fillStyle = '#000000';
  ctx.fillRect(eyeX, eyeY, eyeSize, 8); // top
  ctx.fillRect(eyeX, eyeY, 8, eyeSize); // left
  ctx.fillRect(eyeX + eyeSize - 8, eyeY, 8, eyeSize); // right
  ctx.fillRect(eyeX, eyeY + eyeSize - 8, eyeSize, 8); // bottom
  
  // Draw green center with checkmark
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(eyeX + 15, eyeY + 15, 30, 30);
  
  // Draw checkmark symbol
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(eyeX + 22, eyeY + 30);
  ctx.lineTo(eyeX + 28, eyeY + 36);
  ctx.lineTo(eyeX + 38, eyeY + 22);
  ctx.stroke();
};

const addLogo = async (ctx: CanvasRenderingContext2D, logoDataURL: string) => {
  const logo = new Image();
  await new Promise((resolve, reject) => {
    logo.onload = resolve;
    logo.onerror = reject;
    logo.src = logoDataURL;
  });

  const logoSize = 60;
  const x = (400 - logoSize) / 2;
  const y = (400 - logoSize) / 2;

  // Add white background circle for logo
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2 + 5, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + logoSize/2, y + logoSize/2, logoSize/2, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(logo, x, y, logoSize, logoSize);
  ctx.restore();
};