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
              addCustomEye(canvas);
              
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

const addCustomEye = async (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Coordenadas y tamaño del ojo
  const eyeSize = 60;
  const eyeX = 44;
  const eyeY = 44;

  // Fondo blanco circular
  ctx.save();
  ctx.beginPath();
  ctx.arc(eyeX + eyeSize/2, eyeY + eyeSize/2, eyeSize/2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();

  // Borde negro circular
  ctx.save();
  ctx.beginPath();
  ctx.arc(eyeX + eyeSize/2, eyeY + eyeSize/2, eyeSize/2, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.restore();

  // Centro verde circular
  ctx.save();
  ctx.beginPath();
  ctx.arc(eyeX + eyeSize/2, eyeY + eyeSize/2, 15, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = '#00FF00';
  ctx.fill();
  ctx.restore();

  // Check en el centro
  ctx.save();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(eyeX + eyeSize/2 - 7, eyeY + eyeSize/2 + 2);
  ctx.lineTo(eyeX + eyeSize/2 - 1, eyeY + eyeSize/2 + 8);
  ctx.lineTo(eyeX + eyeSize/2 + 10, eyeY + eyeSize/2 - 6);
  ctx.stroke();
  ctx.restore();
};