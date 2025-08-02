# Django Backend Requirements for Check Code

## Required Django Models

### QRCode Model
```python
from django.db import models
import uuid

class QRCode(models.Model):
    TYPE_CHOICES = [
        ('url', 'URL'),
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('text', 'Text'),
    ]
    
    EYE_STYLE_CHOICES = [
        ('square', 'Square'),
        ('circle', 'Circle'),
        ('rounded', 'Rounded'),
    ]
    
    DOT_STYLE_CHOICES = [
        ('square', 'Square'),
        ('circle', 'Circle'),
        ('rounded', 'Rounded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    content = models.TextField()
    author = models.CharField(max_length=255)
    color1 = models.CharField(max_length=7)  # Hex color
    color2 = models.CharField(max_length=7, blank=True, null=True)  # Optional hex color
    eye_style = models.CharField(max_length=10, choices=EYE_STYLE_CHOICES, default='square')
    dot_style = models.CharField(max_length=10, choices=DOT_STYLE_CHOICES, default='square')
    logo_image = models.TextField(blank=True, null=True)  # Base64 encoded image
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['content']),
            models.Index(fields=['is_public']),
            models.Index(fields=['author']),
        ]

    def __str__(self):
        return f"{self.name} by {self.author}"
```

## Required Django Views

### views.py
```python
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import QRCode
from .serializers import QRCodeSerializer

@api_view(['GET', 'POST'])
def qr_list_create(request):
    """
    GET: List all QR codes
    POST: Create a new QR code
    """
    if request.method == 'GET':
        qr_codes = QRCode.objects.all()
        serializer = QRCodeSerializer(qr_codes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = QRCodeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def validate_qr(request):
    """
    Validate if a QR code exists in the database
    """
    content = request.data.get('content')
    if not content:
        return Response(
            {'error': 'Content is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        qr_code = QRCode.objects.get(content=content)
        serializer = QRCodeSerializer(qr_code)
        return Response({
            'exists': True,
            'qr': serializer.data
        })
    except QRCode.DoesNotExist:
        return Response({
            'exists': False,
            'qr': None
        })

@api_view(['GET'])
def search_qr(request):
    """
    Search QR codes by query
    """
    query = request.GET.get('q', '')
    if not query:
        return Response([])
    
    qr_codes = QRCode.objects.filter(
        Q(name__icontains=query) |
        Q(author__icontains=query) |
        Q(content__icontains=query),
        is_public=True
    )
    
    serializer = QRCodeSerializer(qr_codes, many=True)
    return Response(serializer.data)
```

## Required Django Serializers

### serializers.py
```python
from rest_framework import serializers
from .models import QRCode

class QRCodeSerializer(serializers.ModelSerializer):
    eyeStyle = serializers.CharField(source='eye_style')
    dotStyle = serializers.CharField(source='dot_style')
    logoImage = serializers.CharField(source='logo_image', allow_blank=True, allow_null=True)
    isPublic = serializers.BooleanField(source='is_public')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = QRCode
        fields = [
            'id', 'name', 'type', 'content', 'author', 
            'color1', 'color2', 'eyeStyle', 'dotStyle', 
            'logoImage', 'isPublic', 'createdAt'
        ]
        read_only_fields = ['id', 'createdAt']

    def create(self, validated_data):
        # Handle field name mapping
        if 'eye_style' in validated_data:
            validated_data['eye_style'] = validated_data.pop('eye_style')
        if 'dot_style' in validated_data:
            validated_data['dot_style'] = validated_data.pop('dot_style')
        if 'logo_image' in validated_data:
            validated_data['logo_image'] = validated_data.pop('logo_image')
        if 'is_public' in validated_data:
            validated_data['is_public'] = validated_data.pop('is_public')
            
        return super().create(validated_data)
```

## Required Django URLs

### urls.py
```python
from django.urls import path
from . import views

urlpatterns = [
    path('api/qr/', views.qr_list_create, name='qr-list-create'),
    path('api/qr/validate/', views.validate_qr, name='qr-validate'),
    path('api/qr/search/', views.search_qr, name='qr-search'),
]
```

## Django Settings Requirements

### settings.py additions
```python
# CORS settings (install django-cors-headers)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

# REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
}

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... other apps
    'rest_framework',
    'corsheaders',
    'your_qr_app',  # Replace with your app name
]

# Add to MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # ... other middleware
]
```

## Required Python Packages

```bash
pip install django
pip install djangorestframework
pip install django-cors-headers
```

## Database Migration Commands

```bash
python manage.py makemigrations
python manage.py migrate
```

## Testing the API

### Create QR Code
```bash
curl -X POST http://localhost:8000/api/qr/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test QR",
    "type": "url",
    "content": "https://example.com",
    "author": "Test User",
    "color1": "#322E7A",
    "eyeStyle": "square",
    "dotStyle": "square",
    "isPublic": true
  }'
```

### Validate QR Code
```bash
curl -X POST http://localhost:8000/api/qr/validate/ \
  -H "Content-Type: application/json" \
  -d '{"content": "https://example.com"}'
```

### Get All QR Codes
```bash
curl http://localhost:8000/api/qr/
```