import QRCodeStyling from 'qr-code-styling';

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
    // Configure QR code styling options
    const qrCodeConfig: any = {
      width: 400,
      height: 400,
      type: "canvas",
      data: text,
      margin: 10,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H"
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 5,
        crossOrigin: "anonymous"
      },
      dotsOptions: {
        color: options.color1,
        type: mapDotStyle(options.dotStyle)
      },
      backgroundOptions: {
        color: "#ffffff"
      },
      cornersSquareOptions: {
        color: options.color1,
        type: mapEyeStyle(options.eyeStyle)
      },
      cornersDotOptions: {
        color: options.color1,
        type: mapEyeStyle(options.eyeStyle)
      }
    };

    // Add gradient if second color is provided
    if (options.color2) {
      qrCodeConfig.dotsOptions.gradient = {
        type: "linear",
        rotation: 45,
        colorStops: [
          { offset: 0, color: options.color1 },
          { offset: 1, color: options.color2 }
        ]
      };
      qrCodeConfig.cornersSquareOptions.gradient = {
        type: "linear",
        rotation: 45,
        colorStops: [
          { offset: 0, color: options.color1 },
          { offset: 1, color: options.color2 }
        ]
      };
      qrCodeConfig.cornersDotOptions.gradient = {
        type: "linear",
        rotation: 45,
        colorStops: [
          { offset: 0, color: options.color1 },
          { offset: 1, color: options.color2 }
        ]
      };
    }

    // Add logo if provided
    if (options.logoImage) {
      qrCodeConfig.image = options.logoImage;
    }

    // Create QR code instance
    const qrCode = new QRCodeStyling(qrCodeConfig);

    // Create a temporary div and append the QR code to get the canvas
    const tempDiv = document.createElement('div');
    qrCode.append(tempDiv);
    
    // Get the canvas element from the temporary div
    const canvas = tempDiv.querySelector('canvas');
    if (!canvas) {
      throw new Error("Failed to generate QR code canvas");
    }

    // Add custom checkmark to top-left eye for verification
    await addVerificationMark(canvas);

    return canvas.toDataURL();
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

const mapDotStyle = (style: string): string => {
  switch (style) {
    case 'circle': return 'dots';
    case 'rounded': return 'rounded';
    case 'square': 
    default: return 'square';
  }
};

const mapEyeStyle = (style: string): string => {
  switch (style) {
    case 'circle': return 'dot';
    case 'rounded': return 'extra-rounded';
    case 'square':
    default: return 'square';
  }
};

const addVerificationMark = async (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Find the top-left finder pattern position
  const eyeSize = 50;
  const eyeX = 25;
  const eyeY = 25;
  
  // Add a small green checkmark in the corner of the top-left eye
  const checkSize = 12;
  const checkX = eyeX + eyeSize - checkSize - 5;
  const checkY = eyeY + 5;
  
  // Draw green background circle
  ctx.fillStyle = '#00FF00';
  ctx.beginPath();
  ctx.arc(checkX + checkSize/2, checkY + checkSize/2, checkSize/2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Draw white checkmark
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(checkX + 3, checkY + checkSize/2);
  ctx.lineTo(checkX + checkSize/2, checkY + checkSize - 3);
  ctx.lineTo(checkX + checkSize - 3, checkY + 3);
  ctx.stroke();
};