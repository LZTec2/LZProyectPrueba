# checkcode

Check Code - Aplicación completa de códigos QR con backend Django

## Configuración del Frontend

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Configura la URL de tu API Django:
```
VITE_API_URL=http://localhost:8000/api
```

### Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

## Backend Django Requerido

El frontend espera que el backend Django tenga las siguientes rutas:

### Endpoints de la API

#### 1. Gestión de QR Codes
- **POST** `/api/qr/` - Crear un nuevo código QR
- **GET** `/api/qr/` - Obtener todos los códigos QR
- **GET** `/api/qr/search/?q=query` - Buscar códigos QR

#### 2. Validación de QR
- **POST** `/api/qr/validate/` - Validar si un código QR existe en la base de datos

### Estructura de Datos Esperada

#### Modelo QR Code
```json
{
  "id": "string",
  "name": "string",
  "type": "url|email|phone|text",
  "content": "string",
  "author": "string",
  "color1": "string",
  "color2": "string|null",
  "eyeStyle": "square|circle|rounded",
  "dotStyle": "square|circle|rounded",
  "logoImage": "string|null",
  "createdAt": "ISO datetime string",
  "isPublic": "boolean"
}
```

#### Request para crear QR
```json
{
  "name": "Mi QR Code",
  "type": "url",
  "content": "https://ejemplo.com",
  "author": "Usuario",
  "color1": "#322E7A",
  "color2": "#00FF00",
  "eyeStyle": "square",
  "dotStyle": "circle",
  "logoImage": "data:image/png;base64,...",
  "isPublic": true
}
```

#### Request para validar QR
```json
{
  "content": "https://ejemplo.com"
}
```

#### Response de validación
```json
{
  "exists": true,
  "qr": {
    // Objeto QR completo si existe
  }
}
```

## Funcionalidades

- ✅ Generación de códigos QR estilizados
- ✅ Escaneo de códigos QR (cámara e imagen)
- ✅ Galería pública de códigos QR
- ✅ Validación de códigos QR registrados
- ✅ Búsqueda y filtrado
- ✅ Integración con backend Django
- ✅ Manejo de errores de conectividad

## Tecnologías Utilizadas

- React 18 + TypeScript
- Tailwind CSS
- Vite
- QR Code Styling
- QR Scanner
- Lucide React (iconos)