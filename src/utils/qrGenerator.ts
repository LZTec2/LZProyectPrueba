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
  return new Promise((resolve, reject) => {
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
          errorCorrectionLevel: "M"
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
      if (options.color2 && options.color2 !== options.color1) {
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

      // Use getRawData to get the canvas data URL
      qrCode.getRawData("png").then((buffer) => {
        if (!buffer) {
          reject(new Error("Failed to generate QR code"));
          return;
        }

        // Convert buffer to data URL
        const blob = new Blob([buffer], { type: "image/png" });
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          // Create an image to add verification mark
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            if (ctx) {
              // Draw the QR code
              ctx.drawImage(img, 0, 0);
              
              // Add verification mark
              addVerificationMark(canvas);
              
              resolve(canvas.toDataURL());
            } else {
              resolve(dataUrl);
            }
          };
          img.src = dataUrl;
        };
        reader.readAsDataURL(blob);
      }).catch(reject);

    } catch (error) {
      console.error('Error generating QR code:', error);
      reject(error);
    }
  });
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

const addVerificationMark = (canvas: HTMLCanvasElement) => {
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